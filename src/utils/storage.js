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
  DECKS: 'cyber_divination_decks',
  THEME_ALBUMS: 'cyber_divination_theme_albums',
  SHARE_HISTORY: 'cyber_divination_share_history',
  ONBOARDING: 'cyber_divination_onboarding',
  STORY_PROGRESS: 'cyber_divination_story_progress',
  STORY_HISTORY: 'cyber_divination_story_history',
  TEMP_EFFECTS: 'cyber_divination_temp_effects',
  PERMANENT_EFFECTS: 'cyber_divination_permanent_effects',
  WISH_LIST: 'cyber_divination_wish_list',
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
      version: 4,
      exportDate: Date.now(),
      drawHistory: this.getDrawHistory(),
      dailyFortuneHistory: this.getDailyFortuneHistory(),
      themeDivinationHistory: this.getThemeDivinationHistory(),
      multiSpreadHistory: this.getMultiSpreadHistory(),
      collection: this.getCollection(),
      achievements: this.getAchievements(),
      stats: this.getStats(),
      settings: this.getSettings(),
      wishList: this.getWishList(),
      onboarding: this.getOnboarding(),
      storyProgress: this.getStoryProgress(),
      storyHistory: this.getStoryHistory(),
      decks: this.getDecks(),
      themeAlbums: this.getThemeAlbums(),
      shareHistory: this.getShareHistory(),
      tempEffects: this.getTempEffects(),
      permanentEffects: this.getPermanentEffects(),
      seasonData: safeGet(STORAGE_KEYS.SEASON_DATA, {}),
      seasonTasks: safeGet(STORAGE_KEYS.SEASON_TASKS, {}),
      seasonHiddenEvents: safeGet(STORAGE_KEYS.SEASON_HIDDEN_EVENTS, {})
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
      if (data.wishList) safeSet(STORAGE_KEYS.WISH_LIST, data.wishList)
      if (data.onboarding) safeSet(STORAGE_KEYS.ONBOARDING, data.onboarding)
      if (data.storyProgress) safeSet(STORAGE_KEYS.STORY_PROGRESS, data.storyProgress)
      if (data.storyHistory) safeSet(STORAGE_KEYS.STORY_HISTORY, data.storyHistory)
      if (data.decks) safeSet(STORAGE_KEYS.DECKS, data.decks)
      if (data.themeAlbums) safeSet(STORAGE_KEYS.THEME_ALBUMS, data.themeAlbums)
      if (data.shareHistory) safeSet(STORAGE_KEYS.SHARE_HISTORY, data.shareHistory)
      if (data.tempEffects) safeSet(STORAGE_KEYS.TEMP_EFFECTS, data.tempEffects)
      if (data.permanentEffects) safeSet(STORAGE_KEYS.PERMANENT_EFFECTS, data.permanentEffects)
      if (data.seasonData) safeSet(STORAGE_KEYS.SEASON_DATA, data.seasonData)
      if (data.seasonTasks) safeSet(STORAGE_KEYS.SEASON_TASKS, data.seasonTasks)
      if (data.seasonHiddenEvents) safeSet(STORAGE_KEYS.SEASON_HIDDEN_EVENTS, data.seasonHiddenEvents)
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

  getWishList() {
    return safeGet(STORAGE_KEYS.WISH_LIST, [])
  },

  addWish(wishData) {
    const wishes = this.getWishList()
    const wish = {
      id: `wish_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'active',
      linkedDraws: [],
      reviews: [],
      ...wishData
    }
    wishes.unshift(wish)
    if (wishes.length > 100) wishes.splice(100)
    safeSet(STORAGE_KEYS.WISH_LIST, wishes)
    return wish
  },

  updateWish(wishId, updates) {
    const wishes = this.getWishList()
    const idx = wishes.findIndex(w => w.id === wishId)
    if (idx === -1) return null
    wishes[idx] = { ...wishes[idx], ...updates, updatedAt: Date.now() }
    safeSet(STORAGE_KEYS.WISH_LIST, wishes)
    return wishes[idx]
  },

  deleteWish(wishId) {
    const wishes = this.getWishList()
    const filtered = wishes.filter(w => w.id !== wishId)
    safeSet(STORAGE_KEYS.WISH_LIST, filtered)
    return filtered
  },

  getWishById(wishId) {
    const wishes = this.getWishList()
    return wishes.find(w => w.id === wishId) || null
  },

  linkDrawToWish(wishId, drawRecord) {
    const wishes = this.getWishList()
    const idx = wishes.findIndex(w => w.id === wishId)
    if (idx === -1) return null
    if (!wishes[idx].linkedDraws) wishes[idx].linkedDraws = []
    wishes[idx].linkedDraws.push({ ...drawRecord, linkedAt: Date.now() })
    wishes[idx].updatedAt = Date.now()
    safeSet(STORAGE_KEYS.WISH_LIST, wishes)
    return wishes[idx]
  },

  addReviewToWish(wishId, review) {
    const wishes = this.getWishList()
    const idx = wishes.findIndex(w => w.id === wishId)
    if (idx === -1) return null
    if (!wishes[idx].reviews) wishes[idx].reviews = []
    wishes[idx].reviews.push({ ...review, createdAt: Date.now() })
    wishes[idx].updatedAt = Date.now()
    safeSet(STORAGE_KEYS.WISH_LIST, wishes)
    return wishes[idx]
  },

  getOnboarding() {
    return safeGet(STORAGE_KEYS.ONBOARDING, {
      startedAt: null,
      completed: false,
      completedAt: null,
      currentStep: 0,
      firstDrawHiddenEvent: null,
      worldLoreViewed: false
    })
  },

  updateOnboarding(updates) {
    const onboarding = this.getOnboarding()
    const updated = { ...onboarding, ...updates }
    safeSet(STORAGE_KEYS.ONBOARDING, updated)
    return updated
  },

  completeOnboarding() {
    const updated = {
      startedAt: this.getOnboarding().startedAt || Date.now(),
      completed: true,
      completedAt: Date.now(),
      currentStep: TOTAL_ONBOARDING_STEPS || 5,
      firstDrawHiddenEvent: this.getOnboarding().firstDrawHiddenEvent,
      worldLoreViewed: true
    }
    safeSet(STORAGE_KEYS.ONBOARDING, updated)
    return updated
  },

  resetOnboarding() {
    safeSet(STORAGE_KEYS.ONBOARDING, {
      startedAt: null,
      completed: false,
      completedAt: null,
      currentStep: 0,
      firstDrawHiddenEvent: null,
      worldLoreViewed: false
    })
  },

  getStoryProgress() {
    return safeGet(STORAGE_KEYS.STORY_PROGRESS, {})
  },

  updateStoryProgress(storyId, updates) {
    const progress = this.getStoryProgress()
    if (!progress[storyId]) {
      progress[storyId] = {
        storyId,
        status: 'in_progress',
        startedAt: Date.now(),
        currentChapter: null,
        choices: [],
        completedAt: null
      }
    }
    progress[storyId] = { ...progress[storyId], ...updates }
    safeSet(STORAGE_KEYS.STORY_PROGRESS, progress)
    return progress[storyId]
  },

  getStoryHistory() {
    return safeGet(STORAGE_KEYS.STORY_HISTORY, [])
  },

  addStoryHistoryRecord(record) {
    const history = this.getStoryHistory()
    history.unshift({
      ...record,
      id: `story_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now()
    })
    if (history.length > 200) history.splice(200)
    safeSet(STORAGE_KEYS.STORY_HISTORY, history)
    return history
  },

  getDecks() {
    return safeGet(STORAGE_KEYS.DECKS, [])
  },

  saveDecks(decks) {
    safeSet(STORAGE_KEYS.DECKS, decks)
    return decks
  },

  getThemeAlbums() {
    return safeGet(STORAGE_KEYS.THEME_ALBUMS, {})
  },

  saveThemeAlbums(albums) {
    safeSet(STORAGE_KEYS.THEME_ALBUMS, albums)
    return albums
  },

  getShareHistory() {
    return safeGet(STORAGE_KEYS.SHARE_HISTORY, [])
  },

  setShareHistory(history) {
    safeSet(STORAGE_KEYS.SHARE_HISTORY, history)
    return history
  },

  getTempEffects() {
    return safeGet(STORAGE_KEYS.TEMP_EFFECTS, {})
  },

  setTempEffects(effects) {
    safeSet(STORAGE_KEYS.TEMP_EFFECTS, effects)
    return effects
  },

  getPermanentEffects() {
    return safeGet(STORAGE_KEYS.PERMANENT_EFFECTS, {})
  },

  setPermanentEffects(effects) {
    safeSet(STORAGE_KEYS.PERMANENT_EFFECTS, effects)
    return effects
  },

  resetAll() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }
}
