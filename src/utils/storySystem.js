import { writable, derived } from 'svelte/store'
import { Storage } from './storage.js'
import {
  STORY_LINES,
  STORY_TRIGGER_TYPE,
  STORY_BRANCH_EFFECT,
  STORY_STATUS,
  getStoryById,
  getChapterById
} from '../data/storyEvents.js'
import { CARDS } from '../data/cards.js'
import { CARD_CATEGORY, CARD_RARITY, RARITY_CONFIG } from '../data/constants.js'
import { triggerHiddenAchievement, checkAchievementsAfterAction } from './achievementSystem.js'

const storyNotifyStore = writable(null)
const activeStoriesStore = writable([])
const pendingChapterStore = writable(null)

let initialized = false
let notifyTimeout = null
const storyListeners = []

function init() {
  if (initialized) return
  initialized = true
  loadActiveStories()
}

function loadActiveStories() {
  const progress = Storage.getStoryProgress()
  const active = Object.values(progress).filter(p => p.status === STORY_STATUS.IN_PROGRESS)
  activeStoriesStore.set(active)
}

export const storyNotify = {
  subscribe: (run) => {
    init()
    return storyNotifyStore.subscribe(run)
  }
}

export const activeStories = {
  subscribe: (run) => {
    init()
    return activeStoriesStore.subscribe(run)
  }
}

export const pendingChapter = {
  subscribe: (run) => {
    init()
    return pendingChapterStore.subscribe(run)
  }
}

export const allStoryProgress = derived(
  [activeStories],
  ([$activeStories]) => {
    const allProgress = Storage.getStoryProgress()
    return STORY_LINES.map(story => {
      const progress = allProgress[story.id]
      return {
        story,
        progress: progress || { status: STORY_STATUS.NOT_STARTED }
      }
    })
  }
)

function getContext() {
  const collection = Storage.getCollection()
  const stats = Storage.getStats()
  const achievements = Storage.getAchievements()
  const drawHistory = Storage.getDrawHistory()

  const recentDraws = drawHistory.slice(0, 20)
  const uniqueCardIds = Object.keys(collection)

  const categoryCounts = {}
  Object.values(CARD_CATEGORY).forEach(cat => {
    categoryCounts[cat] = 0
  })
  uniqueCardIds.forEach(cardId => {
    const card = CARDS.find(c => c.id === cardId)
    if (card && categoryCounts[card.category] !== undefined) {
      categoryCounts[card.category]++
    }
  })

  const rarityCounts = {}
  Object.values(CARD_RARITY).forEach(rarity => {
    rarityCounts[rarity] = 0
  })
  uniqueCardIds.forEach(cardId => {
    const card = CARDS.find(c => c.id === cardId)
    if (card && rarityCounts[card.rarity] !== undefined) {
      rarityCounts[card.rarity]++
    }
  })

  const unlockedAchievementIds = Object.keys(achievements)

  return {
    collection,
    stats,
    achievements,
    drawHistory,
    recentDraws,
    uniqueCardIds,
    categoryCounts,
    rarityCounts,
    unlockedAchievementIds
  }
}

function checkCardCombination(trigger, ctx, drawnCards = []) {
  const { cards, requireAll, requireUpright, requireReversed } = trigger
  if (!cards || cards.length === 0) return false

  const allDrawnCards = [...ctx.recentDraws, ...drawnCards]
  const drawnCardIds = new Set()
  const uprightCardIds = new Set()
  const reversedCardIds = new Set()

  allDrawnCards.forEach(draw => {
    if (draw.cardId) {
      drawnCardIds.add(draw.cardId)
      if (draw.isReversed) {
        reversedCardIds.add(draw.cardId)
      } else {
        uprightCardIds.add(draw.cardId)
      }
    } else if (draw.cards) {
      draw.cards.forEach(c => {
        drawnCardIds.add(c.cardId)
        if (c.isReversed) {
          reversedCardIds.add(c.cardId)
        } else {
          uprightCardIds.add(c.cardId)
        }
      })
    }
  })

  drawnCards.forEach(draw => {
    if (draw.card) {
      drawnCardIds.add(draw.card.id)
      if (draw.isReversed) {
        reversedCardIds.add(draw.card.id)
      } else {
        uprightCardIds.add(draw.card.id)
      }
    }
  })

  if (requireAll) {
    return cards.every(cardId => {
      if (!drawnCardIds.has(cardId)) return false
      if (requireUpright && !uprightCardIds.has(cardId)) return false
      if (requireReversed && !reversedCardIds.has(cardId)) return false
      return true
    })
  } else {
    return cards.some(cardId => {
      if (!drawnCardIds.has(cardId)) return false
      if (requireUpright && !uprightCardIds.has(cardId)) return false
      if (requireReversed && !reversedCardIds.has(cardId)) return false
      return true
    })
  }
}

function checkCategoryCombination(trigger, ctx) {
  const { categories, requireAll } = trigger
  if (!categories || categories.length === 0) return false

  if (requireAll) {
    return categories.every(cat => ctx.categoryCounts[cat] > 0)
  } else {
    return categories.some(cat => ctx.categoryCounts[cat] > 0)
  }
}

function checkRarityCombination(trigger, ctx) {
  const { rarities, requireAll, minCount } = trigger
  if (!rarities || rarities.length === 0) return false

  const totalCount = rarities.reduce((sum, rarity) => sum + (ctx.rarityCounts[rarity] || 0), 0)

  if (minCount && totalCount < minCount) return false

  if (requireAll) {
    return rarities.every(rarity => ctx.rarityCounts[rarity] > 0)
  } else {
    return rarities.some(rarity => ctx.rarityCounts[rarity] > 0)
  }
}

function checkAchievementUnlock(trigger, ctx) {
  const { achievementIds, requireAll } = trigger
  if (!achievementIds || achievementIds.length === 0) return false

  if (requireAll) {
    return achievementIds.every(id => ctx.unlockedAchievementIds.includes(id))
  } else {
    return achievementIds.some(id => ctx.unlockedAchievementIds.includes(id))
  }
}

function checkTriggerCondition(trigger, ctx, drawnCards = []) {
  if (!trigger) return false

  if (trigger.minDraws && ctx.stats.totalDraws < trigger.minDraws) {
    return false
  }

  switch (trigger.type) {
    case STORY_TRIGGER_TYPE.CARD_COMBINATION:
      return checkCardCombination(trigger, ctx, drawnCards)
    case STORY_TRIGGER_TYPE.CATEGORY_COMBINATION:
      return checkCategoryCombination(trigger, ctx)
    case STORY_TRIGGER_TYPE.RARITY_COMBINATION:
      return checkRarityCombination(trigger, ctx)
    case STORY_TRIGGER_TYPE.ACHIEVEMENT_UNLOCK:
      return checkAchievementUnlock(trigger, ctx)
    default:
      return false
  }
}

export function checkStoryTriggers(drawnCards = []) {
  init()
  const ctx = getContext()
  const triggeredStories = []

  STORY_LINES.forEach(story => {
    const progress = Storage.getStoryProgressById(story.id)
    
    if (progress && progress.status !== STORY_STATUS.NOT_STARTED) {
      return
    }

    if (checkTriggerCondition(story.trigger, ctx, drawnCards)) {
      const firstChapter = story.chapters[0]
      if (firstChapter && checkTriggerCondition(firstChapter.triggerCondition, ctx, drawnCards)) {
        triggeredStories.push({
          story,
          chapter: firstChapter
        })
      }
    }
  })

  return triggeredStories
}

export function checkChapterProgress(storyId, drawnCards = []) {
  init()
  const ctx = getContext()
  const story = getStoryById(storyId)
  const progress = Storage.getStoryProgressById(storyId)

  if (!story || !progress || progress.status !== STORY_STATUS.IN_PROGRESS) {
    return null
  }

  const currentChapterId = progress.currentChapter
  const currentChapter = getChapterById(storyId, currentChapterId)

  if (!currentChapter || currentChapter.isEnding) {
    return null
  }

  if (!currentChapter.choices) {
    return null
  }

  for (const choice of currentChapter.choices) {
    const nextChapter = getChapterById(storyId, choice.nextChapter)
    if (nextChapter && nextChapter.triggerCondition) {
      if (checkTriggerCondition(nextChapter.triggerCondition, ctx, drawnCards)) {
        return {
          story,
          chapter: nextChapter,
          fromChoice: choice
        }
      }
    }
  }

  return null
}

export function startStory(storyId) {
  init()
  const story = getStoryById(storyId)
  if (!story) return null

  const existingProgress = Storage.getStoryProgressById(storyId)
  if (existingProgress && existingProgress.status !== STORY_STATUS.NOT_STARTED) {
    return null
  }

  const firstChapter = story.chapters[0]
  if (!firstChapter) return null

  const progress = Storage.updateStoryProgress(storyId, {
    status: STORY_STATUS.IN_PROGRESS,
    currentChapter: firstChapter.id
  })

  loadActiveStories()

  Storage.addStoryHistory({
    type: 'story_start',
    storyId,
    storyName: story.name,
    chapterId: firstChapter.id,
    chapterTitle: firstChapter.title
  })

  return {
    story,
    chapter: firstChapter,
    progress
  }
}

export function makeChoice(storyId, chapterId, choiceId) {
  init()
  const story = getStoryById(storyId)
  const chapter = getChapterById(storyId, chapterId)
  const progress = Storage.getStoryProgressById(storyId)

  if (!story || !chapter || !progress) return null
  if (progress.status !== STORY_STATUS.IN_PROGRESS) return null
  if (progress.currentChapter !== chapterId) return null

  const choice = chapter.choices?.find(c => c.id === choiceId)
  if (!choice) return null

  Storage.addStoryChoice(storyId, chapterId, choiceId)

  if (choice.effects) {
    choice.effects.forEach(effect => {
      if (effect.duration) {
        Storage.addTempEffect(effect)
      }
    })
  }

  const nextChapter = getChapterById(storyId, choice.nextChapter)
  if (!nextChapter) return null

  if (nextChapter.isEnding) {
    Storage.completeStory(storyId, nextChapter.endingType)
    
    if (nextChapter.reward) {
      triggerHiddenAchievement(nextChapter.reward.achievementId)
    }

    if (nextChapter.permanentEffects) {
      nextChapter.permanentEffects.forEach(effect => {
        Storage.addPermanentEffect(effect)
      })
    }

    Storage.addStoryHistory({
      type: 'story_end',
      storyId,
      storyName: story.name,
      chapterId: nextChapter.id,
      chapterTitle: nextChapter.title,
      endingType: nextChapter.endingType,
      choiceId,
      choiceText: choice.text
    })

    loadActiveStories()

    checkAchievementsAfterAction('story')

    return {
      story,
      chapter: nextChapter,
      choice,
      isEnding: true,
      progress: Storage.getStoryProgressById(storyId)
    }
  }

  const updatedProgress = Storage.updateStoryProgress(storyId, {
    currentChapter: nextChapter.id
  })

  Storage.addStoryHistory({
    type: 'story_choice',
    storyId,
    storyName: story.name,
    chapterId: nextChapter.id,
    chapterTitle: nextChapter.title,
    choiceId,
    choiceText: choice.text
  })

  loadActiveStories()

  return {
    story,
    chapter: nextChapter,
    choice,
    isEnding: false,
    progress: updatedProgress
  }
}

export function showStoryNotification(storyData) {
  if (notifyTimeout) {
    clearTimeout(notifyTimeout)
  }

  storyNotifyStore.set(storyData)

  storyListeners.forEach(cb => {
    try {
      cb(storyData)
    } catch (e) {
      console.error('Story listener error:', e)
    }
  })

  notifyTimeout = setTimeout(() => {
    storyNotifyStore.set(null)
  }, 6000)
}

export function setPendingChapter(chapterData) {
  pendingChapterStore.set(chapterData)
}

export function clearPendingChapter() {
  pendingChapterStore.set(null)
}

export function onStoryTriggered(callback) {
  storyListeners.push(callback)
  return () => {
    const idx = storyListeners.indexOf(callback)
    if (idx > -1) storyListeners.splice(idx, 1)
  }
}

export function dismissNotification() {
  if (notifyTimeout) {
    clearTimeout(notifyTimeout)
    notifyTimeout = null
  }
  storyNotifyStore.set(null)
}

export function calculateCardWeights(baseCards) {
  const allEffects = Storage.getAllActiveEffects()
  if (allEffects.length === 0) return null

  const weights = {}
  baseCards.forEach(card => {
    weights[card.id] = RARITY_CONFIG[card.rarity].weight
  })

  allEffects.forEach(effect => {
    switch (effect.type) {
      case STORY_BRANCH_EFFECT.INCREASE_RARITY_WEIGHT:
        baseCards.forEach(card => {
          if (card.rarity === effect.target) {
            weights[card.id] *= effect.multiplier
          }
        })
        break
      case STORY_BRANCH_EFFECT.DECREASE_RARITY_WEIGHT:
        baseCards.forEach(card => {
          if (card.rarity === effect.target) {
            weights[card.id] /= effect.multiplier
          }
        })
        break
      case STORY_BRANCH_EFFECT.INCREASE_CATEGORY_WEIGHT:
        baseCards.forEach(card => {
          if (card.category === effect.target) {
            weights[card.id] *= effect.multiplier
          }
        })
        break
      case STORY_BRANCH_EFFECT.DECREASE_CATEGORY_WEIGHT:
        baseCards.forEach(card => {
          if (card.category === effect.target) {
            weights[card.id] /= effect.multiplier
          }
        })
        break
    }
  })

  return weights
}

export function calculateReversedChance(baseChance = 0.35) {
  const allEffects = Storage.getAllActiveEffects()
  if (allEffects.length === 0) return baseChance

  let reversedChance = baseChance

  allEffects.forEach(effect => {
    switch (effect.type) {
      case STORY_BRANCH_EFFECT.INCREASE_REVERSED_CHANCE:
        reversedChance += effect.value
        break
      case STORY_BRANCH_EFFECT.DECREASE_REVERSED_CHANCE:
        reversedChance -= effect.value
        break
    }
  })

  return Math.max(0.05, Math.min(0.95, reversedChance))
}

export function onDrawComplete() {
  Storage.decrementTempEffects()
}

export function getCompletedStories() {
  const progress = Storage.getStoryProgress()
  return Object.keys(progress).filter(key => progress[key].status === STORY_STATUS.COMPLETED)
}

export function getStoryEndingCounts() {
  const progress = Storage.getStoryProgress()
  const completedStories = Object.values(progress).filter(p => p.status === STORY_STATUS.COMPLETED)
  const counts = {
    good: 0,
    neutral: 0,
    bad: 0,
    bittersweet: 0,
    sad: 0,
    legendary: 0
  }
  
  completedStories.forEach(p => {
    if (p.endingType && counts[p.endingType] !== undefined) {
      counts[p.endingType]++
    }
  })
  
  return counts
}

export function refreshStoryData() {
  init()
  loadActiveStories()
}
