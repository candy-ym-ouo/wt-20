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
  PERMANENT_EFFECTS: 'cyber_divination_permanent_effects'
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
      settings: this.getSettings(),
      decks: this.getDecks(),
      themeAlbums: this.getThemeAlbums()
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
      if (data.decks) safeSet(STORAGE_KEYS.DECKS, data.decks)
      if (data.themeAlbums) safeSet(STORAGE_KEYS.THEME_ALBUMS, data.themeAlbums)
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

  getDecks() {
    return safeGet(STORAGE_KEYS.DECKS, [])
  },

  saveDeck(deck) {
    const decks = this.getDecks()
    const existingIndex = decks.findIndex(d => d.id === deck.id)
    if (existingIndex >= 0) {
      decks[existingIndex] = { ...deck, updatedAt: Date.now() }
    } else {
      decks.unshift({
        ...deck,
        id: deck.id || `deck_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        createdAt: Date.now(),
        updatedAt: Date.now()
      })
    }
    safeSet(STORAGE_KEYS.DECKS, decks)
    return decks
  },

  deleteDeck(deckId) {
    const decks = this.getDecks()
    const filtered = decks.filter(d => d.id !== deckId)
    safeSet(STORAGE_KEYS.DECKS, filtered)
    return filtered
  },

  getThemeAlbums() {
    return safeGet(STORAGE_KEYS.THEME_ALBUMS, [])
  },

  saveThemeAlbum(album) {
    const albums = this.getThemeAlbums()
    const existingIndex = albums.findIndex(a => a.id === album.id)
    if (existingIndex >= 0) {
      albums[existingIndex] = { ...album, updatedAt: Date.now() }
    } else {
      albums.unshift({
        ...album,
        id: album.id || `album_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        createdAt: Date.now(),
        updatedAt: Date.now()
      })
    }
    safeSet(STORAGE_KEYS.THEME_ALBUMS, albums)
    return albums
  },

  deleteThemeAlbum(albumId) {
    const albums = this.getThemeAlbums()
    const filtered = albums.filter(a => a.id !== albumId)
    safeSet(STORAGE_KEYS.THEME_ALBUMS, filtered)
    return filtered
  },

  resetAll() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  },

  getShareHistory() {
    return safeGet(STORAGE_KEYS.SHARE_HISTORY, [])
  },

  setShareHistory(history) {
    return safeSet(STORAGE_KEYS.SHARE_HISTORY, history)
  },

  addShareRecord(record) {
    const history = this.getShareHistory()
    history.unshift({
      ...record,
      id: `share_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      sharedAt: Date.now()
    })
    if (history.length > 50) {
      history.splice(50)
    }
    safeSet(STORAGE_KEYS.SHARE_HISTORY, history)
    return history
  },

  clearShareHistory() {
    safeSet(STORAGE_KEYS.SHARE_HISTORY, [])
  },

  getOnboarding() {
    return safeGet(STORAGE_KEYS.ONBOARDING, {
      completed: false,
      currentStep: 0,
      firstDrawDone: false,
      worldLoreViewed: false,
      hiddenEventUnlocked: false,
      startedAt: null,
      completedAt: null
    })
  },

  updateOnboarding(updates) {
    const onboarding = this.getOnboarding()
    const updated = { ...onboarding, ...updates }
    safeSet(STORAGE_KEYS.ONBOARDING, updated)
    return updated
  },

  completeOnboarding() {
    return this.updateOnboarding({
      completed: true,
      completedAt: Date.now()
    })
  },

  resetOnboarding() {
    safeSet(STORAGE_KEYS.ONBOARDING, {
      completed: false,
      currentStep: 0,
      firstDrawDone: false,
      worldLoreViewed: false,
      hiddenEventUnlocked: false,
      startedAt: null,
      completedAt: null
    })
  },

  getStoryProgress() {
    return safeGet(STORAGE_KEYS.STORY_PROGRESS, {})
  },

  getStoryProgressById(storyId) {
    const progress = this.getStoryProgress()
    return progress[storyId] || null
  },

  updateStoryProgress(storyId, updates) {
    const allProgress = this.getStoryProgress()
    allProgress[storyId] = {
      ...allProgress[storyId],
      ...updates,
      storyId,
      lastUpdated: Date.now()
    }
    safeSet(STORAGE_KEYS.STORY_PROGRESS, allProgress)
    return allProgress[storyId]
  },

  completeStory(storyId, endingType) {
    return this.updateStoryProgress(storyId, {
      status: 'completed',
      endingType,
      completedAt: Date.now()
    })
  },

  getStoryHistory() {
    return safeGet(STORAGE_KEYS.STORY_HISTORY, [])
  },

  addStoryHistory(record) {
    const history = this.getStoryHistory()
    history.unshift({
      ...record,
      id: `story_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now()
    })
    if (history.length > 100) {
      history.splice(100)
    }
    safeSet(STORAGE_KEYS.STORY_HISTORY, history)
    return history
  },

  addStoryChoice(storyId, chapterId, choiceId) {
    const progress = this.getStoryProgressById(storyId)
    if (!progress) return null

    if (!progress.choices) {
      progress.choices = []
    }
    progress.choices.push({
      chapterId,
      choiceId,
      timestamp: Date.now()
    })

    const allProgress = this.getStoryProgress()
    allProgress[storyId] = progress
    safeSet(STORAGE_KEYS.STORY_PROGRESS, allProgress)
    return progress
  },

  getTempEffects() {
    return safeGet(STORAGE_KEYS.TEMP_EFFECTS, [])
  },

  addTempEffect(effect) {
    const effects = this.getTempEffects()
    effects.push({
      ...effect,
      id: `effect_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      createdAt: Date.now()
    })
    safeSet(STORAGE_KEYS.TEMP_EFFECTS, effects)
    return effects
  },

  decrementTempEffects() {
    const effects = this.getTempEffects()
    const updated = effects
      .map(e => ({ ...e, duration: e.duration - 1 }))
      .filter(e => e.duration > 0)
    safeSet(STORAGE_KEYS.TEMP_EFFECTS, updated)
    return updated
  },

  getPermanentEffects() {
    return safeGet(STORAGE_KEYS.PERMANENT_EFFECTS, [])
  },

  addPermanentEffect(effect) {
    const effects = this.getPermanentEffects()
    effects.push({
      ...effect,
      id: `perm_effect_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      createdAt: Date.now()
    })
    safeSet(STORAGE_KEYS.PERMANENT_EFFECTS, effects)
    return effects
  },

  getAllActiveEffects() {
    return [...this.getTempEffects(), ...this.getPermanentEffects()]
  }
}
