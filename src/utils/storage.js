const STORAGE_KEYS = {
  DRAW_HISTORY: 'cyber_divination_draw_history',
  COLLECTION: 'cyber_divination_collection',
  ACHIEVEMENTS: 'cyber_divination_achievements',
  STATS: 'cyber_divination_stats',
  SETTINGS: 'cyber_divination_settings',
  DAILY_FORTUNE: 'cyber_divination_daily_fortune',
  DAILY_FORTUNE_HISTORY: 'cyber_divination_daily_fortune_history',
  THEME_DIVINATION_HISTORY: 'cyber_divination_theme_history',
  MULTI_SPREAD_HISTORY: 'cyber_divination_multi_spread_history',
  SEASON_DATA: 'cyber_divination_season_data',
  SEASON_TASKS: 'cyber_divination_season_tasks',
  SEASON_HIDDEN_EVENTS: 'cyber_divination_season_hidden_events'
}

function safeGet(key, defaultValue) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch (e) {
    console.error('Storage read error:', e)
    return defaultValue
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (e) {
    console.error('Storage write error:', e)
    return false
  }
}

export const Storage = {
  getDrawHistory() {
    return safeGet(STORAGE_KEYS.DRAW_HISTORY, [])
  },

  addDrawRecord(record) {
    const history = this.getDrawHistory()
    history.unshift({
      ...record,
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now()
    })
    if (history.length > 100) {
      history.splice(100)
    }
    safeSet(STORAGE_KEYS.DRAW_HISTORY, history)
    return history
  },

  clearDrawHistory() {
    safeSet(STORAGE_KEYS.DRAW_HISTORY, [])
  },

  getCollection() {
    return safeGet(STORAGE_KEYS.COLLECTION, {})
  },

  addToCollection(cardId, isReversed = false) {
    const collection = this.getCollection()
    if (!collection[cardId]) {
      collection[cardId] = {
        firstDraw: Date.now(),
        drawCount: 0,
        uprightCount: 0,
        reversedCount: 0
      }
    }
    collection[cardId].drawCount++
    if (isReversed) {
      collection[cardId].reversedCount++
    } else {
      collection[cardId].uprightCount++
    }
    collection[cardId].lastDraw = Date.now()
    safeSet(STORAGE_KEYS.COLLECTION, collection)
    return collection
  },

  getCollectionStats() {
    const collection = this.getCollection()
    const ids = Object.keys(collection)
    const totalDraws = ids.reduce((sum, id) => sum + collection[id].drawCount, 0)
    return {
      uniqueCards: ids.length,
      totalDraws,
      collection
    }
  },

  getAchievements() {
    return safeGet(STORAGE_KEYS.ACHIEVEMENTS, {})
  },

  unlockAchievement(achievementId) {
    const achievements = this.getAchievements()
    if (!achievements[achievementId]) {
      achievements[achievementId] = {
        unlockedAt: Date.now(),
        id: achievementId
      }
      safeSet(STORAGE_KEYS.ACHIEVEMENTS, achievements)
      return true
    }
    return false
  },

  hasAchievement(achievementId) {
    const achievements = this.getAchievements()
    return !!achievements[achievementId]
  },

  getStats() {
    return safeGet(STORAGE_KEYS.STATS, {
      totalDraws: 0,
      reversedDraws: 0,
      legendaryCount: 0,
      epicCount: 0,
      rareCount: 0,
      commonCount: 0,
      lastDrawDate: null
    })
  },

  updateStats(cardRarity, isReversed) {
    const stats = this.getStats()
    stats.totalDraws++
    stats.lastDrawDate = Date.now()
    if (isReversed) stats.reversedDraws++
    if (cardRarity === 'legendary') stats.legendaryCount++
    if (cardRarity === 'epic') stats.epicCount++
    if (cardRarity === 'rare') stats.rareCount++
    if (cardRarity === 'common') stats.commonCount++
    safeSet(STORAGE_KEYS.STATS, stats)
    return stats
  },

  getSettings() {
    return safeGet(STORAGE_KEYS.SETTINGS, {
      soundEnabled: true,
      animationEnabled: true,
      theme: 'cyber'
    })
  },

  updateSettings(newSettings) {
    const settings = { ...this.getSettings(), ...newSettings }
    safeSet(STORAGE_KEYS.SETTINGS, settings)
    return settings
  },

  exportAll() {
    return {
      version: 3,
      exportDate: Date.now(),
      drawHistory: this.getDrawHistory(),
      dailyFortuneHistory: this.getDailyFortuneHistory(),
      themeDivinationHistory: this.getThemeDivinationHistory(),
      multiSpreadHistory: this.getMultiSpreadHistory(),
      collection: this.getCollection(),
      achievements: this.getAchievements(),
      stats: this.getStats(),
      settings: this.getSettings()
    }
  },

  importAll(data) {
    if (!data || typeof data !== 'object') return false
    try {
      if (data.drawHistory) safeSet(STORAGE_KEYS.DRAW_HISTORY, data.drawHistory)
      if (data.dailyFortuneHistory) safeSet(STORAGE_KEYS.DAILY_FORTUNE_HISTORY, data.dailyFortuneHistory)
      if (data.themeDivinationHistory) safeSet(STORAGE_KEYS.THEME_DIVINATION_HISTORY, data.themeDivinationHistory)
      if (data.multiSpreadHistory) safeSet(STORAGE_KEYS.MULTI_SPREAD_HISTORY, data.multiSpreadHistory)
      if (data.collection) safeSet(STORAGE_KEYS.COLLECTION, data.collection)
      if (data.achievements) safeSet(STORAGE_KEYS.ACHIEVEMENTS, data.achievements)
      if (data.stats) safeSet(STORAGE_KEYS.STATS, data.stats)
      if (data.settings) safeSet(STORAGE_KEYS.SETTINGS, data.settings)
      return true
    } catch (e) {
      console.error('Import error:', e)
      return false
    }
  },

  getDailyFortune() {
    return safeGet(STORAGE_KEYS.DAILY_FORTUNE, {
      lastDrawDate: null,
      consecutiveDays: 0,
      lastConsecutiveDate: null,
      todayCard: null
    })
  },

  saveDailyFortune(cardId, isReversed, reading) {
    const today = new Date().toDateString()
    const fortune = this.getDailyFortune()
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    if (fortune.lastConsecutiveDate === yesterday) {
      fortune.consecutiveDays++
    } else if (fortune.lastConsecutiveDate !== today) {
      fortune.consecutiveDays = 1
    }

    fortune.lastDrawDate = Date.now()
    fortune.lastConsecutiveDate = today
    fortune.todayCard = {
      cardId,
      isReversed,
      title: reading.title,
      meaning: reading.meaning,
      advice: reading.advice,
      fortune: reading.fortune,
      date: today
    }

    safeSet(STORAGE_KEYS.DAILY_FORTUNE, fortune)

    const history = this.getDailyFortuneHistory()
    history.unshift({
      id: `daily_${Date.now()}`,
      cardId,
      isReversed,
      title: reading.title,
      meaning: reading.meaning,
      advice: reading.advice,
      fortune: reading.fortune,
      date: today,
      timestamp: Date.now(),
      consecutiveDays: fortune.consecutiveDays,
      spreadType: 'daily'
    })
    if (history.length > 365) {
      history.splice(365)
    }
    safeSet(STORAGE_KEYS.DAILY_FORTUNE_HISTORY, history)

    return fortune
  },

  hasDrawnToday() {
    const fortune = this.getDailyFortune()
    if (!fortune.lastDrawDate) return false
    const lastDraw = new Date(fortune.lastDrawDate).toDateString()
    const today = new Date().toDateString()
    return lastDraw === today
  },

  getDailyFortuneHistory() {
    return safeGet(STORAGE_KEYS.DAILY_FORTUNE_HISTORY, [])
  },

  clearDailyFortuneHistory() {
    safeSet(STORAGE_KEYS.DAILY_FORTUNE_HISTORY, [])
  },

  getThemeDivinationHistory() {
    return safeGet(STORAGE_KEYS.THEME_DIVINATION_HISTORY, [])
  },

  addThemeDivinationRecord(record) {
    const history = this.getThemeDivinationHistory()
    history.unshift({
      ...record,
      id: `theme_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now()
    })
    if (history.length > 100) {
      history.splice(100)
    }
    safeSet(STORAGE_KEYS.THEME_DIVINATION_HISTORY, history)
    return history
  },

  clearThemeDivinationHistory() {
    safeSet(STORAGE_KEYS.THEME_DIVINATION_HISTORY, [])
  },

  getMultiSpreadHistory() {
    return safeGet(STORAGE_KEYS.MULTI_SPREAD_HISTORY, [])
  },

  addMultiSpreadRecord(record) {
    const history = this.getMultiSpreadHistory()
    history.unshift({
      ...record,
      id: `spread_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now()
    })
    if (history.length > 100) {
      history.splice(100)
    }
    safeSet(STORAGE_KEYS.MULTI_SPREAD_HISTORY, history)
    return history
  },

  clearMultiSpreadHistory() {
    safeSet(STORAGE_KEYS.MULTI_SPREAD_HISTORY, [])
  },

  getSeasonData(seasonId) {
    const allSeasonData = safeGet(STORAGE_KEYS.SEASON_DATA, {})
    return allSeasonData[seasonId] || {
      seasonId,
      totalPoints: 0,
      unlockedPhases: ['phase_1'],
      claimedRewards: [],
      joinDate: null,
      lastActiveDate: null
    }
  },

  updateSeasonData(seasonId, updates) {
    const allSeasonData = safeGet(STORAGE_KEYS.SEASON_DATA, {})
    const currentData = allSeasonData[seasonId] || {
      seasonId,
      totalPoints: 0,
      unlockedPhases: ['phase_1'],
      claimedRewards: [],
      joinDate: null,
      lastActiveDate: null
    }
    
    if (!currentData.joinDate) {
      currentData.joinDate = Date.now()
    }
    currentData.lastActiveDate = Date.now()
    
    allSeasonData[seasonId] = { ...currentData, ...updates }
    safeSet(STORAGE_KEYS.SEASON_DATA, allSeasonData)
    return allSeasonData[seasonId]
  },

  addSeasonPoints(seasonId, points) {
    const seasonData = this.getSeasonData(seasonId)
    const newPoints = (seasonData.totalPoints || 0) + points
    return this.updateSeasonData(seasonId, { totalPoints: newPoints })
  },

  unlockPhase(seasonId, phaseId) {
    const seasonData = this.getSeasonData(seasonId)
    const unlockedPhases = [...new Set([...(seasonData.unlockedPhases || []), phaseId])]
    return this.updateSeasonData(seasonId, { unlockedPhases })
  },

  claimPhaseReward(seasonId, rewardId) {
    const seasonData = this.getSeasonData(seasonId)
    const claimedRewards = [...new Set([...(seasonData.claimedRewards || []), rewardId])]
    return this.updateSeasonData(seasonId, { claimedRewards })
  },

  getSeasonTasks(seasonId) {
    const allTasks = safeGet(STORAGE_KEYS.SEASON_TASKS, {})
    return allTasks[seasonId] || {}
  },

  updateSeasonTaskProgress(seasonId, taskId, progress) {
    const allTasks = safeGet(STORAGE_KEYS.SEASON_TASKS, {})
    const seasonTasks = allTasks[seasonId] || {}
    const currentProgress = seasonTasks[taskId] || { completed: false, current: 0, claimed: false, completedAt: null }
    
    seasonTasks[taskId] = { ...currentProgress, ...progress }
    allTasks[seasonId] = seasonTasks
    safeSet(STORAGE_KEYS.SEASON_TASKS, allTasks)
    return seasonTasks[taskId]
  },

  completeSeasonTask(seasonId, taskId) {
    return this.updateSeasonTaskProgress(seasonId, taskId, {
      completed: true,
      completedAt: Date.now()
    })
  },

  claimSeasonTaskReward(seasonId, taskId) {
    return this.updateSeasonTaskProgress(seasonId, taskId, {
      claimed: true,
      claimedAt: Date.now()
    })
  },

  getSeasonHiddenEvents(seasonId) {
    const allEvents = safeGet(STORAGE_KEYS.SEASON_HIDDEN_EVENTS, {})
    return allEvents[seasonId] || []
  },

  triggerSeasonHiddenEvent(seasonId, eventId) {
    const allEvents = safeGet(STORAGE_KEYS.SEASON_HIDDEN_EVENTS, {})
    const seasonEvents = allEvents[seasonId] || []
    
    if (!seasonEvents.includes(eventId)) {
      seasonEvents.push(eventId)
      allEvents[seasonId] = seasonEvents
      safeSet(STORAGE_KEYS.SEASON_HIDDEN_EVENTS, allEvents)
      return true
    }
    return false
  },

  resetAll() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }
}
