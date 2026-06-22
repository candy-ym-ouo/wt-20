import { writable } from 'svelte/store'
import { Storage } from './storage.js'
import {
  MYSTERIOUS_VISITORS,
  VISITOR_TRIGGER_TYPE,
  VISITOR_REWARD_TYPE,
  getVisitorById,
  getVisitorExclusiveCard,
  getAllExclusiveCards
} from '../data/mysteriousVisitor.js'
import { CARDS } from '../data/cards.js'
import { CARD_RARITY, CARD_CATEGORY, RARITY_CONFIG } from '../data/constants.js'
import { triggerHiddenAchievement, checkAchievementsAfterAction } from './achievementSystem.js'

const visitorEventStore = writable(null)
const visitorDismissedStore = writable(false)

const visitorListeners = []

export const visitorEvent = {
  subscribe: (run) => visitorEventStore.subscribe(run)
}

export const visitorDismissed = {
  subscribe: (run) => visitorDismissedStore.subscribe(run)
}

export function onVisitorEvent(callback) {
  visitorListeners.push(callback)
  return () => {
    const idx = visitorListeners.indexOf(callback)
    if (idx > -1) visitorListeners.splice(idx, 1)
  }
}

function notifyVisitorEvent(eventData) {
  visitorEventStore.set(eventData)
  visitorDismissedStore.set(false)

  visitorListeners.forEach(cb => {
    try {
      cb(eventData)
    } catch (e) {
      console.error('Visitor event listener error:', e)
    }
  })
}

export function dismissVisitor() {
  visitorDismissedStore.set(true)
  visitorEventStore.set(null)
}

function getRecentDrawSequence(count) {
  const history = Storage.getDrawHistory()
  const recent = []
  for (const record of history.slice(0, count)) {
    if (record.cardId) {
      const card = CARDS.find(c => c.id === record.cardId)
      if (card) {
        recent.push({
          cardId: card.id,
          rarity: card.rarity,
          category: card.category,
          isReversed: record.isReversed
        })
      }
    }
    if (record.cards) {
      for (const c of record.cards) {
        const card = CARDS.find(cc => cc.id === c.cardId)
        if (card) {
          recent.push({
            cardId: card.id,
            rarity: card.rarity,
            category: card.category,
            isReversed: c.isReversed
          })
        }
      }
    }
  }
  return recent
}

function checkRarityStreak(trigger, recentDraws) {
  const { rarity, streakCount } = trigger
  let streak = 0
  for (const draw of recentDraws) {
    if (draw.rarity === rarity) {
      streak++
      if (streak >= streakCount) return true
    } else {
      streak = 0
    }
  }
  return false
}

function checkSameCategoryStreak(trigger, recentDraws) {
  const { category, streakCount } = trigger
  let streak = 0
  for (const draw of recentDraws) {
    if (draw.category === category) {
      streak++
      if (streak >= streakCount) return true
    } else {
      streak = 0
    }
  }
  return false
}

function checkReversedStreak(trigger, recentDraws) {
  const { streakCount } = trigger
  let streak = 0
  for (const draw of recentDraws) {
    if (draw.isReversed) {
      streak++
      if (streak >= streakCount) return true
    } else {
      streak = 0
    }
  }
  return false
}

function checkSpecificCard(trigger, recentDraws) {
  const { cardId } = trigger
  if (!cardId) return false
  return recentDraws.some(d => d.cardId === cardId)
}

function checkLegendaryDraw(trigger, recentDraws) {
  return recentDraws.length > 0 && recentDraws[0].rarity === CARD_RARITY.LEGENDARY
}

function checkMidnightDraw(trigger) {
  const hour = new Date().getHours()
  return hour >= 0 && hour < 5
}

function checkTrigger(visitor, drawnCards = []) {
  const trigger = visitor.trigger
  const stats = Storage.getStats()

  if (trigger.minDraws && stats.totalDraws < trigger.minDraws) return false

  if (!Storage.canTriggerVisitor(visitor.id, visitor.cooldownMs)) return false

  const visitorData = Storage.getMysteriousVisitor()
  if (visitorData.activeEncounter) return false

  const recentDraws = getRecentDrawSequence(20)

  let triggered = false
  switch (trigger.type) {
    case VISITOR_TRIGGER_TYPE.RARITY_STREAK:
      triggered = checkRarityStreak(trigger, recentDraws)
      break
    case VISITOR_TRIGGER_TYPE.SAME_CATEGORY_STREAK:
      triggered = checkSameCategoryStreak(trigger, recentDraws)
      break
    case VISITOR_TRIGGER_TYPE.REVERSED_STREAK:
      triggered = checkReversedStreak(trigger, recentDraws)
      break
    case VISITOR_TRIGGER_TYPE.SPECIFIC_CARD:
      triggered = checkSpecificCard(trigger, recentDraws)
      break
    case VISITOR_TRIGGER_TYPE.LEGENDARY_DRAW:
      triggered = checkLegendaryDraw(trigger, recentDraws)
      break
    case VISITOR_TRIGGER_TYPE.MIDNIGHT_DRAW:
      triggered = checkMidnightDraw(trigger)
      break
  }

  if (!triggered) return false

  if (trigger.probability && Math.random() > trigger.probability) return false

  return true
}

export function checkVisitorTriggers(drawnCards = []) {
  const triggeredVisitors = []

  for (const visitor of MYSTERIOUS_VISITORS) {
    if (checkTrigger(visitor, drawnCards)) {
      const firstDialog = visitor.dialog[0]
      if (firstDialog) {
        triggeredVisitors.push({
          visitor,
          dialog: firstDialog
        })
      }
    }
  }

  return triggeredVisitors
}

export function triggerVisitor(visitor) {
  const firstDialog = visitor.dialog[0]
  if (!firstDialog) return null

  const encounter = {
    visitorId: visitor.id,
    visitorName: visitor.name,
    startedAt: Date.now(),
    currentDialog: firstDialog.id,
    choices: {},
    completedAt: null,
    reward: null
  }

  Storage.setActiveVisitorEncounter(encounter)

  const eventData = {
    visitor,
    dialog: firstDialog,
    encounter,
    timeRemaining: firstDialog.timeLimit
  }

  notifyVisitorEvent(eventData)

  return eventData
}

export function makeVisitorChoice(visitorId, dialogId, choiceId) {
  const visitor = getVisitorById(visitorId)
  if (!visitor) return null

  const dialog = visitor.dialog.find(d => d.id === dialogId)
  if (!dialog) return null

  const choice = dialog.choices.find(c => c.id === choiceId)
  if (!choice) return null

  Storage.updateVisitorEncounterChoices(visitorId, dialogId, choiceId)

  if (choice.reward && choice.reward.type === VISITOR_REWARD_TYPE.EXCLUSIVE_CARD) {
    const cardData = getVisitorExclusiveCard(visitorId, choice.reward.cardId)
    if (cardData) {
      const existingCard = CARDS.find(c => c.id === cardData.id)
      if (!existingCard) {
        CARDS.push(cardData)
      }
      Storage.addToCollection(cardData.id, false)
      Storage.addVisitorCardRecord({
        visitorId,
        cardId: cardData.id,
        cardName: cardData.name,
        dialogId,
        choiceId,
        source: 'visitor_encounter'
      })
      triggerHiddenAchievement('achievement_visitor_exclusive_card')
    }
  }

  if (choice.reward && choice.reward.sideEffects) {
    for (const effect of choice.reward.sideEffects) {
      Storage.addTempEffect(effect)
    }
  }

  if (choice.nextDialog) {
    const nextDialog = visitor.dialog.find(d => d.id === choice.nextDialog)
    if (nextDialog) {
      const encounter = Storage.getMysteriousVisitor().activeEncounter
      if (encounter) {
        encounter.currentDialog = nextDialog.id
        Storage.setActiveVisitorEncounter(encounter)
      }

      const eventData = {
        visitor,
        dialog: nextDialog,
        encounter,
        timeRemaining: nextDialog.timeLimit
      }

      notifyVisitorEvent(eventData)
      return eventData
    }
  }

  if (choice.reward) {
    Storage.completeVisitorEncounter(visitorId, choice.reward)
  } else {
    Storage.completeVisitorEncounter(visitorId, null)
  }

  checkAchievementsAfterAction('visitor')
  dismissVisitor()

  return {
    visitor,
    choice,
    isComplete: true,
    reward: choice.reward
  }
}

export function handleVisitorTimeout(visitorId, dialogId) {
  const visitor = getVisitorById(visitorId)
  if (!visitor) return null

  Storage.completeVisitorEncounter(visitorId, { type: 'timeout', dialogId })
  dismissVisitor()

  return {
    visitor,
    isComplete: true,
    reward: null,
    timedOut: true
  }
}

export function getVisitorHistory() {
  return Storage.getMysteriousVisitor().encounters
}

export function getVisitorCardRecordList() {
  return Storage.getVisitorCardRecords()
}

export function getVisitorStats() {
  const data = Storage.getMysteriousVisitor()
  const records = Storage.getVisitorCardRecords()
  return {
    totalEncounters: data.encounters.length,
    uniqueVisitors: new Set(data.encounters.map(e => e.visitorId)).size,
    exclusiveCardsCollected: records.length,
    encounters: data.encounters,
    cardRecords: records
  }
}
