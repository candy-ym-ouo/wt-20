const STORAGE_KEYS = {
  DRAW_HISTORY: 'cyber_divination_draw_history',
  COLLECTION: 'cyber_divination_collection',
  ACHIEVEMENTS: 'cyber_divination_achievements',
  STATS: 'cyber_divination_stats',
  SETTINGS: 'cyber_divination_settings',
  DAILY_FORTUNE: 'cyber_divination_daily_fortune',
  DAILY_FORTUNE_HISTORY: 'cyber_divination_daily_fortune_history',
  THEME_DIVINATION_HISTORY: 'cyber_divination_theme_history',
  DECKS: 'cyber_divination_decks',
  THEME_ALBUMS: 'cyber_divination_theme_albums',
  SHARE_HISTORY: 'cyber_divination_share_history',
  MYSTERIOUS_VISITOR: 'cyber_divination_mysterious_visitor',
  VISITOR_CARD_RECORDS: 'cyber_divination_visitor_card_records',
  STORY_PROGRESS: 'cyber_divination_story_progress',
  STORY_HISTORY: 'cyber_divination_story_history',
  TEMP_EFFECTS: 'cyber_divination_temp_effects',
  PERMANENT_EFFECTS: 'cyber_divination_permanent_effects',
  SPENT_ACHIEVEMENT_POINTS: 'cyber_divination_spent_points',
  WEEKLY_REPORTS: 'cyber_divination_weekly_reports',
  HIDDEN_EVENTS_LOG: 'cyber_divination_hidden_events_log',
  MULTI_SPREAD_HISTORY: 'cyber_divination_multi_spread_history'
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
      version: 5,
      exportDate: Date.now(),
      drawHistory: this.getDrawHistory(),
      dailyFortuneHistory: this.getDailyFortuneHistory(),
      themeDivinationHistory: this.getThemeDivinationHistory(),
      collection: this.getCollection(),
      achievements: this.getAchievements(),
      stats: this.getStats(),
      settings: this.getSettings(),
      decks: this.getDecks(),
      themeAlbums: this.getThemeAlbums(),
      mysteriousVisitor: this.getMysteriousVisitor(),
      visitorCardRecords: this.getVisitorCardRecords(),
      storyProgress: this.getStoryProgress(),
      storyHistory: this.getStoryHistory(),
      tempEffects: this.getTempEffects(),
      permanentEffects: this.getPermanentEffects(),
      spentAchievementPoints: this.getSpentAchievementPoints(),
      multiSpreadHistory: this.getMultiSpreadHistory(),
      weeklyReports: this.getWeeklyReports(),
      hiddenEventsLog: this.getHiddenEventsLog()
    }
  },

  importAll(data) {
    if (!data || typeof data !== 'object') return false
    try {
      if (data.drawHistory) safeSet(STORAGE_KEYS.DRAW_HISTORY, data.drawHistory)
      if (data.dailyFortuneHistory) safeSet(STORAGE_KEYS.DAILY_FORTUNE_HISTORY, data.dailyFortuneHistory)
      if (data.themeDivinationHistory) safeSet(STORAGE_KEYS.THEME_DIVINATION_HISTORY, data.themeDivinationHistory)
      if (data.collection) safeSet(STORAGE_KEYS.COLLECTION, data.collection)
      if (data.achievements) safeSet(STORAGE_KEYS.ACHIEVEMENTS, data.achievements)
      if (data.stats) safeSet(STORAGE_KEYS.STATS, data.stats)
      if (data.settings) safeSet(STORAGE_KEYS.SETTINGS, data.settings)
      if (data.decks) safeSet(STORAGE_KEYS.DECKS, data.decks)
      if (data.themeAlbums) safeSet(STORAGE_KEYS.THEME_ALBUMS, data.themeAlbums)
      if (data.mysteriousVisitor) safeSet(STORAGE_KEYS.MYSTERIOUS_VISITOR, data.mysteriousVisitor)
      if (data.visitorCardRecords) safeSet(STORAGE_KEYS.VISITOR_CARD_RECORDS, data.visitorCardRecords)
      if (data.storyProgress) safeSet(STORAGE_KEYS.STORY_PROGRESS, data.storyProgress)
      if (data.storyHistory) safeSet(STORAGE_KEYS.STORY_HISTORY, data.storyHistory)
      if (data.tempEffects) safeSet(STORAGE_KEYS.TEMP_EFFECTS, data.tempEffects)
      if (data.permanentEffects) safeSet(STORAGE_KEYS.PERMANENT_EFFECTS, data.permanentEffects)
      if (typeof data.spentAchievementPoints === 'number') {
        safeSet(STORAGE_KEYS.SPENT_ACHIEVEMENT_POINTS, data.spentAchievementPoints)
      }
      if (data.multiSpreadHistory) safeSet(STORAGE_KEYS.MULTI_SPREAD_HISTORY, data.multiSpreadHistory)
      if (data.weeklyReports) safeSet(STORAGE_KEYS.WEEKLY_REPORTS, data.weeklyReports)
      if (data.hiddenEventsLog) safeSet(STORAGE_KEYS.HIDDEN_EVENTS_LOG, data.hiddenEventsLog)
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

  getMysteriousVisitor() {
    return safeGet(STORAGE_KEYS.MYSTERIOUS_VISITOR, {
      encounters: [],
      activeEncounter: null,
      lastEncounterTime: null
    })
  },

  saveMysteriousVisitor(data) {
    safeSet(STORAGE_KEYS.MYSTERIOUS_VISITOR, data)
  },

  addVisitorEncounter(encounter) {
    const data = this.getMysteriousVisitor()
    data.encounters.push({
      ...encounter,
      id: `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now()
    })
    if (data.encounters.length > 50) {
      data.encounters.splice(0, data.encounters.length - 50)
    }
    data.lastEncounterTime = Date.now()
    safeSet(STORAGE_KEYS.MYSTERIOUS_VISITOR, data)
    return data
  },

  setActiveVisitorEncounter(encounter) {
    const data = this.getMysteriousVisitor()
    data.activeEncounter = encounter
    safeSet(STORAGE_KEYS.MYSTERIOUS_VISITOR, data)
    return data
  },

  clearActiveVisitorEncounter() {
    const data = this.getMysteriousVisitor()
    data.activeEncounter = null
    safeSet(STORAGE_KEYS.MYSTERIOUS_VISITOR, data)
    return data
  },

  updateVisitorEncounterChoices(visitorId, dialogId, choiceId) {
    const data = this.getMysteriousVisitor()
    if (data.activeEncounter && data.activeEncounter.visitorId === visitorId) {
      if (!data.activeEncounter.choices) {
        data.activeEncounter.choices = {}
      }
      data.activeEncounter.choices[dialogId] = {
        choiceId,
        chosenAt: Date.now()
      }
      safeSet(STORAGE_KEYS.MYSTERIOUS_VISITOR, data)
    }
    return data
  },

  completeVisitorEncounter(visitorId, reward) {
    const data = this.getMysteriousVisitor()
    if (data.activeEncounter && data.activeEncounter.visitorId === visitorId) {
      data.activeEncounter.completedAt = Date.now()
      data.activeEncounter.reward = reward
      data.encounters.push({ ...data.activeEncounter })
      data.activeEncounter = null
      safeSet(STORAGE_KEYS.MYSTERIOUS_VISITOR, data)
    }
    return data
  },

  getVisitorCardRecords() {
    return safeGet(STORAGE_KEYS.VISITOR_CARD_RECORDS, [])
  },

  addVisitorCardRecord(record) {
    const records = this.getVisitorCardRecords()
    records.unshift({
      ...record,
      id: `vcr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      recordedAt: Date.now()
    })
    if (records.length > 100) {
      records.splice(100)
    }
    safeSet(STORAGE_KEYS.VISITOR_CARD_RECORDS, records)
    return records
  },

  hasVisitorCardRecord(visitorId, cardId) {
    const records = this.getVisitorCardRecords()
    return records.some(r => r.visitorId === visitorId && r.cardId === cardId)
  },

  getVisitorEncounterCount(visitorId) {
    const data = this.getMysteriousVisitor()
    return data.encounters.filter(e => e.visitorId === visitorId).length
  },

  getTotalVisitorEncounters() {
    const data = this.getMysteriousVisitor()
    return data.encounters.length
  },

  canTriggerVisitor(visitorId, cooldownMs) {
    const data = this.getMysteriousVisitor()
    if (!data.lastEncounterTime) return true
    const lastSameVisitor = data.encounters
      .filter(e => e.visitorId === visitorId)
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))[0]
    if (!lastSameVisitor) return true
    return Date.now() - (lastSameVisitor.timestamp || 0) >= cooldownMs
  },

  getStoryProgress() {
    return safeGet(STORAGE_KEYS.STORY_PROGRESS, {})
  },

  getStoryProgressById(storyId) {
    const progress = this.getStoryProgress()
    return progress[storyId] || null
  },

  updateStoryProgress(storyId, updates) {
    const progress = this.getStoryProgress()
    if (!progress[storyId]) {
      progress[storyId] = { status: 'not_started', currentChapter: null, choices: {} }
    }
    Object.assign(progress[storyId], updates)
    safeSet(STORAGE_KEYS.STORY_PROGRESS, progress)
    return progress[storyId]
  },

  addStoryChoice(storyId, chapterId, choiceId) {
    const progress = this.getStoryProgress()
    if (!progress[storyId]) return null
    if (!progress[storyId].choices) progress[storyId].choices = {}
    progress[storyId].choices[chapterId] = { choiceId, chosenAt: Date.now() }
    safeSet(STORAGE_KEYS.STORY_PROGRESS, progress)
    return progress[storyId]
  },

  completeStory(storyId, endingType) {
    const progress = this.getStoryProgress()
    if (!progress[storyId]) return null
    progress[storyId].status = 'completed'
    progress[storyId].completedAt = Date.now()
    progress[storyId].endingType = endingType
    safeSet(STORAGE_KEYS.STORY_PROGRESS, progress)
    return progress[storyId]
  },

  getStoryHistory() {
    return safeGet(STORAGE_KEYS.STORY_HISTORY, [])
  },

  addStoryHistory(record) {
    const history = this.getStoryHistory()
    history.unshift({
      ...record,
      id: `sh_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now()
    })
    if (history.length > 100) {
      history.splice(100)
    }
    safeSet(STORAGE_KEYS.STORY_HISTORY, history)
    return history
  },

  getTempEffects() {
    return safeGet(STORAGE_KEYS.TEMP_EFFECTS, [])
  },

  addTempEffect(effect) {
    const effects = this.getTempEffects()
    effects.push({
      ...effect,
      addedAt: Date.now(),
      remainingDuration: effect.duration || 1
    })
    safeSet(STORAGE_KEYS.TEMP_EFFECTS, effects)
    return effects
  },

  decrementTempEffects() {
    const effects = this.getTempEffects()
    const updated = effects
      .map(e => ({ ...e, remainingDuration: e.remainingDuration - 1 }))
      .filter(e => e.remainingDuration > 0)
    safeSet(STORAGE_KEYS.TEMP_EFFECTS, updated)
    return updated
  },

  getAllActiveEffects() {
    const temp = this.getTempEffects()
    const permanent = this.getPermanentEffects()
    return [...temp, ...permanent]
  },

  getPermanentEffects() {
    return safeGet(STORAGE_KEYS.PERMANENT_EFFECTS, [])
  },

  addPermanentEffect(effect) {
    const effects = this.getPermanentEffects()
    effects.push({
      ...effect,
      addedAt: Date.now(),
      isPermanent: true
    })
    safeSet(STORAGE_KEYS.PERMANENT_EFFECTS, effects)
    return effects
  },

  getSpentAchievementPoints() {
    return safeGet(STORAGE_KEYS.SPENT_ACHIEVEMENT_POINTS, 0)
  },

  spendAchievementPoints(amount) {
    const current = this.getSpentAchievementPoints()
    safeSet(STORAGE_KEYS.SPENT_ACHIEVEMENT_POINTS, current + amount)
    return current + amount
  },

  getWeeklyReports() {
    return safeGet(STORAGE_KEYS.WEEKLY_REPORTS, [])
  },

  saveWeeklyReport(report) {
    const reports = this.getWeeklyReports()
    const existingIndex = reports.findIndex(r => r.weekKey === report.weekKey)
    if (existingIndex >= 0) {
      reports[existingIndex] = { ...report, updatedAt: Date.now() }
    } else {
      reports.unshift({
        ...report,
        id: `weekly_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        createdAt: Date.now(),
        updatedAt: Date.now()
      })
    }
    if (reports.length > 20) {
      reports.splice(20)
    }
    safeSet(STORAGE_KEYS.WEEKLY_REPORTS, reports)
    return reports
  },

  getWeeklyReportByKey(weekKey) {
    const reports = this.getWeeklyReports()
    return reports.find(r => r.weekKey === weekKey) || null
  },

  clearWeeklyReports() {
    safeSet(STORAGE_KEYS.WEEKLY_REPORTS, [])
  },

  getHiddenEventsLog() {
    return safeGet(STORAGE_KEYS.HIDDEN_EVENTS_LOG, [])
  },

  addHiddenEventLog(event) {
    const log = this.getHiddenEventsLog()
    log.unshift({
      ...event,
      id: `hel_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      loggedAt: Date.now()
    })
    if (log.length > 200) {
      log.splice(200)
    }
    safeSet(STORAGE_KEYS.HIDDEN_EVENTS_LOG, log)
    return log
  },

  clearHiddenEventsLog() {
    safeSet(STORAGE_KEYS.HIDDEN_EVENTS_LOG, [])
  }
}
