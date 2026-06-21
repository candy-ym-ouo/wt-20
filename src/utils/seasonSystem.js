import { writable, derived } from 'svelte/store'
import { Storage } from './storage.js'
import {
  SEASON_CONFIG,
  PHASE_CONFIG,
  SEASON_TASKS,
  TASK_TYPE,
  REWARD_TYPE,
  SEASON_STATUS,
  PHASE_STATUS,
  getPhaseById,
  getTasksByPhase,
  getTaskById,
  getTotalPoints,
  getPhasePoints
} from '../data/seasonChallenges.js'
import { CARDS } from '../data/cards.js'
import { CARD_CATEGORY } from '../data/constants.js'
import { ACHIEVEMENT_TIER, ACHIEVEMENTS } from '../data/achievements.js'

const HIDDEN_ACHIEVEMENT_IDS = ACHIEVEMENTS
  .filter(a => a.tier === ACHIEVEMENT_TIER.HIDDEN)
  .map(a => a.id)

const seasonDataStore = writable(null)
const seasonTasksStore = writable(null)
const seasonNotifyStore = writable(null)
const phaseUnlockStore = writable(null)

let initialized = false
let notifyTimeout = null
const seasonListeners = []

function init() {
  if (initialized) return
  initialized = true
  loadSeasonData()
}

function loadSeasonData() {
  const seasonData = Storage.getSeasonData(SEASON_CONFIG.id)
  const seasonTasks = Storage.getSeasonTasks(SEASON_CONFIG.id)
  
  seasonDataStore.set(seasonData)
  seasonTasksStore.set(seasonTasks)
}

export const currentSeasonData = {
  subscribe: (run) => {
    init()
    return seasonDataStore.subscribe(run)
  }
}

export const currentSeasonTasks = {
  subscribe: (run) => {
    init()
    return seasonTasksStore.subscribe(run)
  }
}

export const seasonNotify = {
  subscribe: (run) => {
    init()
    return seasonNotifyStore.subscribe(run)
  }
}

export const phaseUnlockNotify = {
  subscribe: (run) => {
    init()
    return phaseUnlockStore.subscribe(run)
  }
}

export function getSeasonStatus() {
  const now = new Date()
  const startDate = new Date(SEASON_CONFIG.startDate)
  const endDate = new Date(SEASON_CONFIG.endDate)
  endDate.setHours(23, 59, 59, 999)

  if (now < startDate) return SEASON_STATUS.NOT_STARTED
  if (now > endDate) return SEASON_STATUS.EXPIRED
  return SEASON_STATUS.ACTIVE
}

export function getDayOfSeason() {
  const now = new Date()
  const startDate = new Date(SEASON_CONFIG.startDate)
  const diffTime = Math.abs(now - startDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.min(Math.max(1, diffDays), SEASON_CONFIG.totalDays)
}

export function getSeasonTimeRemaining() {
  const now = new Date()
  const endDate = new Date(SEASON_CONFIG.endDate)
  endDate.setHours(23, 59, 59, 999)
  
  const diff = endDate - now
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  return { days, hours, minutes, seconds, expired: false }
}

function getContext() {
  const stats = Storage.getStats()
  const collection = Storage.getCollection()
  const dailyFortune = Storage.getDailyFortune()
  const allSeasonHiddenEvents = Storage.getSeasonHiddenEvents(SEASON_CONFIG.id)
  const seasonHiddenEvents = allSeasonHiddenEvents.filter(id => HIDDEN_ACHIEVEMENT_IDS.includes(id))
  
  const uniqueCards = Object.keys(collection)
  const totalCards = CARDS.length
  
  const cardsByRarity = {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0
  }
  
  const cardsByCategory = {}
  Object.keys(CARD_CATEGORY).forEach(cat => {
    cardsByCategory[CARD_CATEGORY[cat]] = 0
  })
  
  uniqueCards.forEach(cardId => {
    const card = CARDS.find(c => c.id === cardId)
    if (card) {
      if (cardsByRarity[card.rarity] !== undefined) {
        cardsByRarity[card.rarity]++
      }
      if (cardsByCategory[card.category] !== undefined) {
        cardsByCategory[card.category]++
      }
    }
  })
  
  const rareAndAbove = cardsByRarity.rare + cardsByRarity.epic + cardsByRarity.legendary
  
  return {
    stats,
    collection,
    uniqueCards,
    totalCards,
    dailyFortune,
    seasonHiddenEvents,
    cardsByRarity,
    cardsByCategory,
    rareAndAbove
  }
}

function calculateTaskProgress(task, ctx) {
  const { type, target, rarity, perCategory } = task
  
  switch (type) {
    case TASK_TYPE.DRAW_COUNT:
      return {
        current: Math.min(ctx.stats.totalDraws, target),
        target,
        percent: Math.min(100, Math.round((ctx.stats.totalDraws / target) * 100))
      }
    
    case TASK_TYPE.RARITY_COLLECT:
      let count = 0
      if (rarity === 'rare') {
        count = ctx.rareAndAbove
      } else if (ctx.cardsByRarity[rarity] !== undefined) {
        count = ctx.cardsByRarity[rarity]
      }
      return {
        current: Math.min(count, target),
        target,
        percent: Math.min(100, Math.round((count / target) * 100))
      }
    
    case TASK_TYPE.HIDDEN_EVENT:
      const eventCount = ctx.seasonHiddenEvents.length
      return {
        current: Math.min(eventCount, target),
        target,
        percent: Math.min(100, Math.round((eventCount / target) * 100))
      }
    
    case TASK_TYPE.CONSECUTIVE_DAYS:
      const days = ctx.dailyFortune.consecutiveDays || 0
      return {
        current: Math.min(days, target),
        target,
        percent: Math.min(100, Math.round((days / target) * 100))
      }
    
    case TASK_TYPE.CATEGORY_COLLECT:
      if (perCategory) {
        const categoriesMeetingTarget = Object.values(ctx.cardsByCategory).filter(c => c >= perCategory).length
        const totalNeeded = Object.keys(CARD_CATEGORY).length
        return {
          current: Math.min(categoriesMeetingTarget, totalNeeded),
          target: totalNeeded,
          percent: Math.min(100, Math.round((categoriesMeetingTarget / totalNeeded) * 100))
        }
      } else {
        const categoriesWithCards = Object.values(ctx.cardsByCategory).filter(c => c > 0).length
        return {
          current: Math.min(categoriesWithCards, target),
          target,
          percent: Math.min(100, Math.round((categoriesWithCards / target) * 100))
        }
      }
    
    default:
      return { current: 0, target, percent: 0 }
  }
}

function showNotification(task, isNew = false) {
  if (notifyTimeout) {
    clearTimeout(notifyTimeout)
  }

  seasonNotifyStore.set({ task, isNew })

  seasonListeners.forEach(cb => {
    try {
      cb(task, isNew)
    } catch (e) {
      console.error('Season listener error:', e)
    }
  })

  notifyTimeout = setTimeout(() => {
    seasonNotifyStore.set(null)
  }, 4000)
}

function showPhaseUnlock(phase) {
  phaseUnlockStore.set(phase)
  setTimeout(() => {
    phaseUnlockStore.set(null)
  }, 5000)
}

export function getTaskProgress(taskId) {
  const task = getTaskById(taskId)
  if (!task) return null
  
  const ctx = getContext()
  return calculateTaskProgress(task, ctx)
}

export function checkAllSeasonTasks() {
  init()
  const ctx = getContext()
  const seasonTasks = Storage.getSeasonTasks(SEASON_CONFIG.id)
  const newlyCompleted = []
  
  SEASON_TASKS.forEach(task => {
    const taskProgress = seasonTasks[task.id] || {}
    if (taskProgress.completed) return
    
    const progress = calculateTaskProgress(task, ctx)
    if (progress.current >= progress.target) {
      Storage.completeSeasonTask(SEASON_CONFIG.id, task.id)
      newlyCompleted.push(task)
      showNotification(task, true)
    } else {
      Storage.updateSeasonTaskProgress(SEASON_CONFIG.id, task.id, {
        current: progress.current
      })
    }
  })
  
  loadSeasonData()
  checkPhaseUnlocks()
  
  return newlyCompleted
}

export function checkSeasonTasksAfterAction(actionType, payload = {}) {
  init()
  const ctx = getContext()
  const seasonTasks = Storage.getSeasonTasks(SEASON_CONFIG.id)
  const newlyCompleted = []
  
  const relevantTasks = SEASON_TASKS.filter(task => {
    const taskProgress = seasonTasks[task.id] || {}
    if (taskProgress.completed) return false
    
    switch (actionType) {
      case 'draw':
        return [TASK_TYPE.DRAW_COUNT, TASK_TYPE.RARITY_COLLECT, TASK_TYPE.CATEGORY_COLLECT].includes(task.type)
      case 'daily':
        return [TASK_TYPE.CONSECUTIVE_DAYS, TASK_TYPE.DRAW_COUNT].includes(task.type)
      case 'hidden_event':
        return task.type === TASK_TYPE.HIDDEN_EVENT
      default:
        return true
    }
  })
  
  relevantTasks.forEach(task => {
    const progress = calculateTaskProgress(task, ctx)
    if (progress.current >= progress.target) {
      const taskProgress = seasonTasks[task.id] || {}
      if (!taskProgress.completed) {
        Storage.completeSeasonTask(SEASON_CONFIG.id, task.id)
        newlyCompleted.push(task)
        showNotification(task, true)
      }
    } else {
      Storage.updateSeasonTaskProgress(SEASON_CONFIG.id, task.id, {
        current: progress.current
      })
    }
  })
  
  loadSeasonData()
  checkPhaseUnlocks()
  
  return newlyCompleted
}

export function checkPhaseUnlocks() {
  const seasonData = Storage.getSeasonData(SEASON_CONFIG.id)
  const currentPoints = seasonData.totalPoints || 0
  const unlockedPhases = seasonData.unlockedPhases || ['phase_1']
  
  PHASE_CONFIG.forEach(phase => {
    if (!unlockedPhases.includes(phase.id) && currentPoints >= phase.unlockRequirement) {
      Storage.unlockPhase(SEASON_CONFIG.id, phase.id)
      showPhaseUnlock(phase)
    }
  })
  
  loadSeasonData()
}

export function claimTaskReward(taskId) {
  const task = getTaskById(taskId)
  if (!task || !task.reward) return false
  
  const seasonTasks = Storage.getSeasonTasks(SEASON_CONFIG.id)
  const taskProgress = seasonTasks[taskId] || {}
  
  if (!taskProgress.completed || taskProgress.claimed) return false
  
  if (task.reward.type === REWARD_TYPE.SEASON_POINTS) {
    Storage.addSeasonPoints(SEASON_CONFIG.id, task.reward.value)
  }
  
  Storage.claimSeasonTaskReward(SEASON_CONFIG.id, taskId)
  loadSeasonData()
  checkPhaseUnlocks()
  
  return true
}

export function claimPhaseReward(phaseId) {
  const phase = getPhaseById(phaseId)
  if (!phase || !phase.rewards) return false
  
  const seasonData = Storage.getSeasonData(SEASON_CONFIG.id)
  const phaseTasks = getTasksByPhase(phaseId)
  const seasonTasks = Storage.getSeasonTasks(SEASON_CONFIG.id)
  
  const allPhaseTasksCompleted = phaseTasks.every(task => {
    const progress = seasonTasks[task.id] || {}
    return progress.completed
  })
  
  if (!allPhaseTasksCompleted) return false
  
  const claimedRewards = seasonData.claimedRewards || []
  
  phase.rewards.forEach(reward => {
    const rewardId = `${phaseId}_${reward.type}_${reward.value}`
    if (!claimedRewards.includes(rewardId)) {
      Storage.claimPhaseReward(SEASON_CONFIG.id, rewardId)
      
      if (reward.type === REWARD_TYPE.TITLE) {
        console.log(`Unlocked season title: ${reward.value}`)
      }
    }
  })
  
  loadSeasonData()
  return true
}

export function recordHiddenEvent(eventId) {
  if (!eventId || !HIDDEN_ACHIEVEMENT_IDS.includes(eventId)) {
    return false
  }
  const isNew = Storage.triggerSeasonHiddenEvent(SEASON_CONFIG.id, eventId)
  if (isNew) {
    checkSeasonTasksAfterAction('hidden_event', { eventId })
  }
  return isNew
}

export function getPhaseStatus(phaseId) {
  const seasonData = Storage.getSeasonData(SEASON_CONFIG.id)
  const unlockedPhases = seasonData.unlockedPhases || ['phase_1']
  const dayOfSeason = getDayOfSeason()
  const phase = getPhaseById(phaseId)
  
  if (!phase) return PHASE_STATUS.LOCKED
  if (!unlockedPhases.includes(phaseId)) return PHASE_STATUS.LOCKED
  
  const phaseTasks = getTasksByPhase(phaseId)
  const seasonTasks = Storage.getSeasonTasks(SEASON_CONFIG.id)
  
  const allCompleted = phaseTasks.every(task => {
    const progress = seasonTasks[task.id] || {}
    return progress.completed
  })
  
  if (allCompleted) return PHASE_STATUS.COMPLETED
  return PHASE_STATUS.ACTIVE
}

export function getPhaseProgress(phaseId) {
  const phaseTasks = getTasksByPhase(phaseId)
  const seasonTasks = Storage.getSeasonTasks(SEASON_CONFIG.id)
  
  const totalPoints = getPhasePoints(phaseId)
  let earnedPoints = 0
  
  phaseTasks.forEach(task => {
    const progress = seasonTasks[task.id] || {}
    if (progress.completed && progress.claimed) {
      earnedPoints += task.points
    }
  })
  
  const completedCount = phaseTasks.filter(task => {
    const progress = seasonTasks[task.id] || {}
    return progress.completed
  }).length
  
  return {
    totalTasks: phaseTasks.length,
    completedTasks: completedCount,
    totalPoints,
    earnedPoints,
    percent: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
  }
}

export const seasonOverview = derived(
  [currentSeasonData, currentSeasonTasks],
  ([$seasonData, $seasonTasks]) => {
    if (!$seasonData || !$seasonTasks) return null
    
    const totalPossiblePoints = getTotalPoints()
    const currentPoints = $seasonData.totalPoints || 0
    
    const completedTasks = Object.values($seasonTasks).filter(t => t.completed).length
    const claimedTasks = Object.values($seasonTasks).filter(t => t.claimed).length
    const totalTasks = SEASON_TASKS.length
    
    const unlockedPhases = $seasonData.unlockedPhases || ['phase_1']
    const completedPhases = PHASE_CONFIG.filter(phase => {
      const phaseTasks = getTasksByPhase(phase.id)
      return phaseTasks.every(task => {
        const progress = $seasonTasks[task.id] || {}
        return progress.completed
      })
    }).length
    
    return {
      currentPoints,
      totalPossiblePoints,
      pointsPercent: totalPossiblePoints > 0 ? Math.round((currentPoints / totalPossiblePoints) * 100) : 0,
      completedTasks,
      claimedTasks,
      totalTasks,
      tasksPercent: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      unlockedPhases: unlockedPhases.length,
      completedPhases,
      totalPhases: PHASE_CONFIG.length,
      status: getSeasonStatus(),
      dayOfSeason: getDayOfSeason()
    }
  }
)

export function onSeasonTaskCompleted(callback) {
  seasonListeners.push(callback)
  return () => {
    const idx = seasonListeners.indexOf(callback)
    if (idx > -1) seasonListeners.splice(idx, 1)
  }
}

export function dismissNotification() {
  if (notifyTimeout) {
    clearTimeout(notifyTimeout)
    notifyTimeout = null
  }
  seasonNotifyStore.set(null)
}

export function refreshSeasonData() {
  init()
  loadSeasonData()
  checkAllSeasonTasks()
}
