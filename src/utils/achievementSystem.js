import { writable, derived } from 'svelte/store'
import { Storage } from './storage.js'
import {
  ACHIEVEMENTS,
  TIER_CONFIG,
  CATEGORY_CONFIG,
  ACHIEVEMENT_CATEGORY,
  ACHIEVEMENT_TIER,
  REWARD_TYPE,
  getTotalPoints,
  getMaxPoints,
  getUnlockedTitles,
  getAchievementById
} from '../data/achievements.js'
import { CARDS } from '../data/cards.js'
import { THEME_CONFIG } from '../data/constants.js'

const unlockedStore = writable({})
const notifyStore = writable(null)
const titlesStore = writable([])
const pointsStore = writable(0)

let initialized = false
let notifyTimeout = null

const achievementListeners = []

function init() {
  if (initialized) return
  initialized = true

  const unlocked = Storage.getAchievements()
  unlockedStore.set(unlocked)
  updateDerivedData(unlocked)
}

function updateDerivedData(unlocked) {
  const unlockedIds = Object.keys(unlocked)
  titlesStore.set(getUnlockedTitles(unlockedIds))
  pointsStore.set(getTotalPoints(unlockedIds))
}

export const unlockedAchievements = {
  subscribe: (run) => {
    init()
    return unlockedStore.subscribe(run)
  }
}

export const achievementNotify = {
  subscribe: (run) => {
    init()
    return notifyStore.subscribe(run)
  }
}

export const achievementTitles = {
  subscribe: (run) => {
    init()
    return titlesStore.subscribe(run)
  }
}

export const achievementPoints = {
  subscribe: (run) => {
    init()
    return pointsStore.subscribe(run)
  }
}

export const achievementStats = derived(
  [unlockedAchievements, achievementPoints],
  ([$unlocked, $points]) => {
    const unlockedIds = Object.keys($unlocked)
    const totalCount = ACHIEVEMENTS.length
    const unlockedCount = unlockedIds.length
    const maxPoints = getMaxPoints()

    const byCategory = {}
    Object.keys(CATEGORY_CONFIG).forEach(cat => {
      const catAchievements = ACHIEVEMENTS.filter(a => a.category === cat)
      const catUnlocked = catAchievements.filter(a => unlockedIds.includes(a.id))
      byCategory[cat] = {
        total: catAchievements.length,
        unlocked: catUnlocked.length,
        percent: catAchievements.length > 0 ? Math.round((catUnlocked.length / catAchievements.length) * 100) : 0
      }
    })

    const byTier = {}
    Object.keys(TIER_CONFIG).forEach(tier => {
      const tierAchievements = ACHIEVEMENTS.filter(a => a.tier === tier)
      const tierUnlocked = tierAchievements.filter(a => unlockedIds.includes(a.id))
      byTier[tier] = {
        total: tierAchievements.length,
        unlocked: tierUnlocked.length
      }
    })

    const pointsPercent = maxPoints > 0 ? Math.round(($points / maxPoints) * 100) : 0

    return {
      totalCount,
      unlockedCount,
      percent: totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0,
      points: $points,
      maxPoints,
      pointsPercent,
      byCategory,
      byTier
    }
  }
)

function showNotification(achievement) {
  if (notifyTimeout) {
    clearTimeout(notifyTimeout)
  }

  notifyStore.set(achievement)

  achievementListeners.forEach(cb => {
    try {
      cb(achievement)
    } catch (e) {
      console.error('Achievement listener error:', e)
    }
  })

  notifyTimeout = setTimeout(() => {
    notifyStore.set(null)
  }, 4000)
}

function unlockAchievement(achievementId) {
  init()

  const achievement = getAchievementById(achievementId)
  if (!achievement) return false

  let currentUnlocked
  unlockedStore.subscribe(v => { currentUnlocked = v })()

  if (currentUnlocked[achievementId]) return false

  const isNew = Storage.unlockAchievement(achievementId)
  if (!isNew) return false

  const updated = Storage.getAchievements()
  unlockedStore.set(updated)
  updateDerivedData(updated)

  showNotification(achievement)

  return true
}

export function onAchievementUnlocked(callback) {
  achievementListeners.push(callback)
  return () => {
    const idx = achievementListeners.indexOf(callback)
    if (idx > -1) achievementListeners.splice(idx, 1)
  }
}

export function dismissNotification() {
  if (notifyTimeout) {
    clearTimeout(notifyTimeout)
    notifyTimeout = null
  }
  notifyStore.set(null)
}

function getContext() {
  const stats = Storage.getStats()
  const collection = Storage.getCollection()
  const dailyFortune = Storage.getDailyFortune()
  const dailyHistory = Storage.getDailyFortuneHistory()
  const themeHistory = Storage.getThemeDivinationHistory()

  const uniqueCards = Object.keys(collection).length
  const totalCards = CARDS.length

  const usedThemes = new Set()
  const usedSpreads = new Set()
  themeHistory.forEach(record => {
    if (record.theme) usedThemes.add(record.theme)
    if (record.spreadTypeId) usedSpreads.add(`${record.theme}_${record.spreadTypeId}`)
  })

  const drawHistory = Storage.getDrawHistory()
  drawHistory.forEach(record => {
    if (record.spreadType) usedSpreads.add(`draw_${record.spreadType}`)
  })
  dailyHistory.forEach(() => {
    usedSpreads.add('daily')
  })

  const allThemes = Object.keys(THEME_CONFIG)
  const allSpreads = []
  allThemes.forEach(theme => {
    THEME_CONFIG[theme].spreadTypes.forEach(spread => {
      allSpreads.push(`${theme}_${spread.id}`)
    })
  })
  allSpreads.push('draw_single', 'draw_three', 'daily')

  return {
    stats,
    collection,
    uniqueCards,
    totalCards,
    dailyFortune,
    dailyHistory,
    themeHistory,
    usedThemes,
    usedSpreads,
    allThemes,
    allSpreads
  }
}

function checkCondition(achievement, ctx) {
  const { condition } = achievement
  if (!condition) return false

  switch (condition.type) {
    case 'total_draws':
      return ctx.stats.totalDraws >= condition.target

    case 'legendary_count':
      return ctx.stats.legendaryCount >= condition.target

    case 'reversed_draws':
      return ctx.stats.reversedDraws >= condition.target

    case 'unique_cards':
      return ctx.uniqueCards >= condition.target

    case 'unique_cards_ratio':
      return ctx.totalCards > 0 && (ctx.uniqueCards / ctx.totalCards) >= condition.target

    case 'daily_draws':
      return ctx.dailyHistory.length >= condition.target

    case 'consecutive_days':
      return (ctx.dailyFortune.consecutiveDays || 0) >= condition.target

    case 'hidden_event':
      return false

    case 'all_themes':
      return ctx.allThemes.every(t => ctx.usedThemes.has(t))

    case 'all_spreads':
      return ctx.allSpreads.every(s => ctx.usedSpreads.has(s))

    default:
      return false
  }
}

export function checkAllAchievements() {
  init()
  const ctx = getContext()
  const newlyUnlocked = []

  let currentUnlocked
  unlockedStore.subscribe(v => { currentUnlocked = v })()

  ACHIEVEMENTS.forEach(achievement => {
    if (currentUnlocked[achievement.id]) return
    if (achievement.condition.type === 'hidden_event') return

    if (checkCondition(achievement, ctx)) {
      if (unlockAchievement(achievement.id)) {
        newlyUnlocked.push(achievement)
      }
    }
  })

  return newlyUnlocked
}

export function checkAchievementsAfterAction(actionType, payload = {}) {
  init()
  const ctx = getContext()
  const newlyUnlocked = []

  let currentUnlocked
  unlockedStore.subscribe(v => { currentUnlocked = v })()

  const relevantAchievements = ACHIEVEMENTS.filter(a => {
    if (currentUnlocked[a.id]) return false
    if (a.condition.type === 'hidden_event') return false

    switch (actionType) {
      case 'draw':
        return ['total_draws', 'legendary_count', 'reversed_draws', 'unique_cards', 'unique_cards_ratio', 'all_spreads'].includes(a.condition.type)
      case 'daily':
        return ['daily_draws', 'consecutive_days', 'unique_cards', 'unique_cards_ratio', 'all_spreads'].includes(a.condition.type)
      case 'theme':
        return ['total_draws', 'legendary_count', 'reversed_draws', 'unique_cards', 'unique_cards_ratio', 'all_themes', 'all_spreads'].includes(a.condition.type)
      default:
        return true
    }
  })

  relevantAchievements.forEach(achievement => {
    if (checkCondition(achievement, ctx)) {
      if (unlockAchievement(achievement.id)) {
        newlyUnlocked.push(achievement)
      }
    }
  })

  return newlyUnlocked
}

export function triggerHiddenAchievement(achievementId) {
  init()

  const achievement = getAchievementById(achievementId)
  if (!achievement) return false
  if (achievement.condition.type !== 'hidden_event') return false

  return unlockAchievement(achievementId)
}

export function getAchievementProgress(achievement) {
  const ctx = getContext()
  const { condition } = achievement

  switch (condition.type) {
    case 'total_draws':
      return {
        current: Math.min(ctx.stats.totalDraws, condition.target),
        target: condition.target,
        percent: Math.min(100, Math.round((ctx.stats.totalDraws / condition.target) * 100))
      }

    case 'legendary_count':
      return {
        current: Math.min(ctx.stats.legendaryCount, condition.target),
        target: condition.target,
        percent: Math.min(100, Math.round((ctx.stats.legendaryCount / condition.target) * 100))
      }

    case 'reversed_draws':
      return {
        current: Math.min(ctx.stats.reversedDraws, condition.target),
        target: condition.target,
        percent: Math.min(100, Math.round((ctx.stats.reversedDraws / condition.target) * 100))
      }

    case 'unique_cards':
      return {
        current: Math.min(ctx.uniqueCards, condition.target),
        target: condition.target,
        percent: Math.min(100, Math.round((ctx.uniqueCards / condition.target) * 100))
      }

    case 'unique_cards_ratio':
      const ratio = ctx.totalCards > 0 ? ctx.uniqueCards / ctx.totalCards : 0
      return {
        current: ctx.uniqueCards,
        target: ctx.totalCards,
        percent: Math.min(100, Math.round((ratio / condition.target) * 100))
      }

    case 'daily_draws':
      return {
        current: Math.min(ctx.dailyHistory.length, condition.target),
        target: condition.target,
        percent: Math.min(100, Math.round((ctx.dailyHistory.length / condition.target) * 100))
      }

    case 'consecutive_days':
      const days = ctx.dailyFortune.consecutiveDays || 0
      return {
        current: Math.min(days, condition.target),
        target: condition.target,
        percent: Math.min(100, Math.round((days / condition.target) * 100))
      }

    case 'all_themes':
      const totalThemes = ctx.allThemes.length
      const usedThemeCount = ctx.allThemes.filter(t => ctx.usedThemes.has(t)).length
      return {
        current: usedThemeCount,
        target: totalThemes,
        percent: totalThemes > 0 ? Math.round((usedThemeCount / totalThemes) * 100) : 0
      }

    case 'all_spreads':
      const totalSpreads = ctx.allSpreads.length
      const usedSpreadCount = ctx.allSpreads.filter(s => ctx.usedSpreads.has(s)).length
      return {
        current: usedSpreadCount,
        target: totalSpreads,
        percent: totalSpreads > 0 ? Math.round((usedSpreadCount / totalSpreads) * 100) : 0
      }

    case 'hidden_event':
      return {
        current: 0,
        target: 1,
        percent: 0
      }

    default:
      return { current: 0, target: 1, percent: 0 }
  }
}

export function refreshAchievements() {
  init()
  const unlocked = Storage.getAchievements()
  unlockedStore.set(unlocked)
  updateDerivedData(unlocked)
}
