import { CARDS } from '../data/cards.js'
import { RARITY_CONFIG, CARD_RARITY, getConsecutiveReward, THEME_CONFIG, MULTI_SPREAD_CONFIG, DIVINATION_THEMES, PITY_CONFIG, getPityConfig, calculatePityRate } from '../data/constants.js'
import { Storage } from './storage.js'
import { checkAchievementsAfterAction, triggerHiddenAchievement } from './achievementSystem.js'
import { checkSeasonTasksAfterAction } from './seasonSystem.js'
import { checkVisitorTriggers, triggerVisitor } from './mysteriousVisitorSystem.js'
import { 
  getCurrentPackCards, 
  getCurrentPackRarityConfig, 
  getCurrentPackId,
  getPackCards,
  getPackRarityConfig
} from './themePackSystem.js'

export function getAllCards() {
  return CARDS
}

export function getCardById(id) {
  return CARDS.find(c => c.id === id)
}

export function getCurrentPityInfo(packId = null) {
  const actualPackId = packId || getCurrentPackId()
  const pity = Storage.getPityCounters(actualPackId)
  
  return {
    legendary: {
      count: pity.sinceLegendary,
      rate: calculatePityRate(CARD_RARITY.LEGENDARY, pity.sinceLegendary),
      config: getPityConfig(CARD_RARITY.LEGENDARY)
    },
    epic: {
      count: pity.sinceEpic,
      rate: calculatePityRate(CARD_RARITY.EPIC, pity.sinceEpic),
      config: getPityConfig(CARD_RARITY.EPIC)
    },
    rare: {
      count: pity.sinceRare,
      rate: calculatePityRate(CARD_RARITY.RARE, pity.sinceRare),
      config: getPityConfig(CARD_RARITY.RARE)
    },
    totalPityTriggers: pity.totalPityTriggers
  }
}

export function calculateEffectiveProbabilities(packId = null, rarityConfig = null) {
  const actualPackId = packId || getCurrentPackId()
  const pity = Storage.getPityCounters(actualPackId)
  const baseConfig = rarityConfig || RARITY_CONFIG
  
  const legendaryRate = calculatePityRate(CARD_RARITY.LEGENDARY, pity.sinceLegendary)
  const epicRate = calculatePityRate(CARD_RARITY.EPIC, pity.sinceEpic)
  const rareRate = calculatePityRate(CARD_RARITY.RARE, pity.sinceRare)
  const commonRate = 100 - legendaryRate - epicRate - rareRate
  
  return {
    [CARD_RARITY.LEGENDARY]: {
      baseWeight: baseConfig[CARD_RARITY.LEGENDARY]?.weight ?? 3,
      effectiveRate: Math.max(legendaryRate, 0),
      pityCount: pity.sinceLegendary
    },
    [CARD_RARITY.EPIC]: {
      baseWeight: baseConfig[CARD_RARITY.EPIC]?.weight ?? 12,
      effectiveRate: Math.max(epicRate, 0),
      pityCount: pity.sinceEpic
    },
    [CARD_RARITY.RARE]: {
      baseWeight: baseConfig[CARD_RARITY.RARE]?.weight ?? 25,
      effectiveRate: Math.max(rareRate, 0),
      pityCount: pity.sinceRare
    },
    [CARD_RARITY.COMMON]: {
      baseWeight: baseConfig[CARD_RARITY.COMMON]?.weight ?? 60,
      effectiveRate: Math.max(commonRate, 0),
      pityCount: 0
    }
  }
}

function getPityAdjustedWeights(cards, baseRarityConfig, packId) {
  const actualPackId = packId || getCurrentPackId()
  const pity = Storage.getPityCounters(actualPackId)
  
  const legendaryRate = calculatePityRate(CARD_RARITY.LEGENDARY, pity.sinceLegendary)
  const epicRate = calculatePityRate(CARD_RARITY.EPIC, pity.sinceEpic)
  const rareRate = calculatePityRate(CARD_RARITY.RARE, pity.sinceRare)
  const commonRate = Math.max(0, 100 - legendaryRate - epicRate - rareRate)
  
  const effectiveRates = {
    [CARD_RARITY.LEGENDARY]: legendaryRate,
    [CARD_RARITY.EPIC]: epicRate,
    [CARD_RARITY.RARE]: rareRate,
    [CARD_RARITY.COMMON]: commonRate
  }
  
  const cardsByRarity = {}
  Object.values(CARD_RARITY).forEach(r => cardsByRarity[r] = [])
  cards.forEach(card => {
    if (cardsByRarity[card.rarity]) {
      cardsByRarity[card.rarity].push(card)
    }
  })
  
  const nonEmptyRarities = Object.values(CARD_RARITY).filter(r => cardsByRarity[r].length > 0)
  
  let totalAssignedRate = 0
  nonEmptyRarities.forEach(r => {
    totalAssignedRate += effectiveRates[r]
  })
  
  const normalizedRates = {}
  nonEmptyRarities.forEach(r => {
    normalizedRates[r] = totalAssignedRate > 0 ? (effectiveRates[r] / totalAssignedRate) : (1 / nonEmptyRarities.length)
  })
  
  const weights = {}
  cards.forEach(card => {
    const rarity = card.rarity
    const baseWeight = baseRarityConfig[rarity]?.weight ?? RARITY_CONFIG[rarity]?.weight ?? 1
    const rarityCards = cardsByRarity[rarity]?.length ?? 1
    const rarityRateShare = rarityCards > 0 ? (normalizedRates[rarity] ?? 0) / rarityCards : 0
    weights[card.id] = Math.max(0.01, (baseWeight * 0.3) + (rarityRateShare * 1000))
  })
  
  return weights
}

function weightedRandomSelectWithPity(cards, rarityConfig, packId) {
  const actualPackId = packId || getCurrentPackId()
  const weights = getPityAdjustedWeights(cards, rarityConfig, actualPackId)
  
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
  let random = Math.random() * totalWeight
  
  for (const card of cards) {
    random -= weights[card.id] ?? 1
    if (random <= 0) {
      return card
    }
  }
  
  return cards[cards.length - 1]
}

function determineIfPityTriggered(cardRarity, packId) {
  const actualPackId = packId || getCurrentPackId()
  const pity = Storage.getPityCounters(actualPackId)
  const result = { isPity: false, pityType: null, pityCount: 0 }
  
  const rareConfig = getPityConfig(CARD_RARITY.RARE)
  const epicConfig = getPityConfig(CARD_RARITY.EPIC)
  const legendaryConfig = getPityConfig(CARD_RARITY.LEGENDARY)
  
  if (cardRarity === CARD_RARITY.LEGENDARY && pity.sinceLegendary >= legendaryConfig.hardPity) {
    result.isPity = true
    result.pityType = 'hard'
    result.pityCount = pity.sinceLegendary
  } else if (cardRarity === CARD_RARITY.LEGENDARY && pity.sinceLegendary >= legendaryConfig.softPityStart) {
    result.isPity = true
    result.pityType = 'soft'
    result.pityCount = pity.sinceLegendary
  } else if (cardRarity === CARD_RARITY.EPIC && pity.sinceEpic >= epicConfig.hardPity) {
    result.isPity = true
    result.pityType = 'hard'
    result.pityCount = pity.sinceEpic
  } else if (cardRarity === CARD_RARITY.EPIC && pity.sinceEpic >= epicConfig.softPityStart) {
    result.isPity = true
    result.pityType = 'soft'
    result.pityCount = pity.sinceEpic
  } else if (cardRarity === CARD_RARITY.RARE && pity.sinceRare >= rareConfig.hardPity) {
    result.isPity = true
    result.pityType = 'hard'
    result.pityCount = pity.sinceRare
  } else if (cardRarity === CARD_RARITY.RARE && pity.sinceRare >= rareConfig.softPityStart) {
    result.isPity = true
    result.pityType = 'soft'
    result.pityCount = pity.sinceRare
  }
  
  return result
}

function updatePityAfterDraw(cardRarity, cardId, packId) {
  const actualPackId = packId || getCurrentPackId()
  
  const pityInfo = determineIfPityTriggered(cardRarity, actualPackId)
  if (pityInfo.isPity) {
    Storage.recordPityTrigger(cardRarity, actualPackId, cardId)
  }
  
  Storage.resetPityCounter(cardRarity, actualPackId)
  
  return pityInfo
}

function weightedRandomSelect(cards) {
  const totalWeight = cards.reduce((sum, card) => {
    return sum + RARITY_CONFIG[card.rarity].weight
  }, 0)
  
  let random = Math.random() * totalWeight
  
  for (const card of cards) {
    random -= RARITY_CONFIG[card.rarity].weight
    if (random <= 0) {
      return card
    }
  }
  
  return cards[cards.length - 1]
}

export function drawSingleCard() {
  const card = weightedRandomSelect(CARDS)
  const isReversed = Math.random() < 0.35
  
  const reading = isReversed ? card.reversed : card.upright
  
  return {
    card,
    isReversed,
    reading
  }
}

export function drawThreeCards() {
  const drawnIds = new Set()
  const results = []
  
  for (let i = 0; i < 3; i++) {
    let card
    let attempts = 0
    do {
      const draw = drawSingleCard()
      card = draw
      attempts++
    } while (drawnIds.has(card.card.id) && attempts < 20)
    
    drawnIds.add(card.card.id)
    results.push(card)
  }
  
  return results.map((result, index) => ({
    ...result,
    position: ['过去', '现在', '未来'][index]
  }))
}

function weightedRandomSelectWithConfig(cards, rarityConfig) {
  const totalWeight = cards.reduce((sum, card) => {
    return sum + (rarityConfig[card.rarity]?.weight ?? RARITY_CONFIG[card.rarity]?.weight ?? 1)
  }, 0)
  
  let random = Math.random() * totalWeight
  
  for (const card of cards) {
    random -= (rarityConfig[card.rarity]?.weight ?? RARITY_CONFIG[card.rarity]?.weight ?? 1)
    if (random <= 0) {
      return card
    }
  }
  
  return cards[cards.length - 1]
}

export function drawSingleCardFromPack(packId = null) {
  const actualPackId = packId || getCurrentPackId()
  const cards = packId ? getPackCards(packId) : getCurrentPackCards()
  const rarityConfig = packId ? getPackRarityConfig(packId) : getCurrentPackRarityConfig()
  
  if (cards.length === 0) {
    return drawSingleCard()
  }
  
  Storage.incrementPityCounters(actualPackId)
  
  const card = weightedRandomSelectWithPity(cards, rarityConfig, actualPackId)
  const isReversed = Math.random() < 0.35
  const reading = isReversed ? card.reversed : card.upright
  const pityInfo = updatePityAfterDraw(card.rarity, card.id, actualPackId)
  
  return {
    card,
    isReversed,
    reading,
    packId: actualPackId,
    pityInfo: {
      isPityTriggered: pityInfo.isPity,
      pityType: pityInfo.pityType,
      pityCount: pityInfo.pityCount
    }
  }
}

export function drawThreeCardsFromPack(packId = null) {
  const actualPackId = packId || getCurrentPackId()
  const cards = packId ? getPackCards(packId) : getCurrentPackCards()
  const rarityConfig = packId ? getPackRarityConfig(packId) : getCurrentPackRarityConfig()
  
  if (cards.length < 3) {
    return drawThreeCards()
  }
  
  const drawnIds = new Set()
  const results = []
  let highestRarityOrder = [CARD_RARITY.COMMON, CARD_RARITY.RARE, CARD_RARITY.EPIC, CARD_RARITY.LEGENDARY]
  let highestRarityIdx = -1
  let highestRarityCardId = null
  
  for (let i = 0; i < 3; i++) {
    Storage.incrementPityCounters(actualPackId)
    let card
    let attempts = 0
    do {
      const selectedCard = weightedRandomSelectWithPity(cards, rarityConfig, actualPackId)
      const isReversed = Math.random() < 0.35
      const reading = isReversed ? selectedCard.reversed : selectedCard.upright
      const pityInfo = updatePityAfterDraw(selectedCard.rarity, selectedCard.id, actualPackId)
      card = { 
        card: selectedCard, 
        isReversed, 
        reading,
        pityInfo: {
          isPityTriggered: pityInfo.isPity,
          pityType: pityInfo.pityType,
          pityCount: pityInfo.pityCount
        }
      }
      
      const rarityIdx = highestRarityOrder.indexOf(selectedCard.rarity)
      if (rarityIdx > highestRarityIdx) {
        highestRarityIdx = rarityIdx
        highestRarityCardId = selectedCard.id
      }
      
      attempts++
    } while (drawnIds.has(card.card.id) && attempts < 20)
    
    drawnIds.add(card.card.id)
    results.push(card)
  }
  
  return results.map((result, index) => ({
    ...result,
    position: ['过去', '现在', '未来'][index],
    packId: actualPackId
  }))
}

export function saveDrawResultWithPack(drawResult, spreadType = 'single', packId = null) {
  const actualPackId = packId || getCurrentPackId()
  let records = []
  
  if (spreadType === 'single') {
    const { card, isReversed, reading, pityInfo } = drawResult
    Storage.addToCollection(card.id, isReversed, actualPackId)
    Storage.updateStats(card.rarity, isReversed, actualPackId)
    records = Storage.addDrawRecord({
      spreadType,
      cardId: card.id,
      isReversed,
      title: reading.title,
      meaning: reading.meaning,
      packId: actualPackId,
      pityInfo: pityInfo || null
    })
  } else if (spreadType === 'three') {
    drawResult.forEach(({ card, isReversed }) => {
      Storage.addToCollection(card.id, isReversed, actualPackId)
      Storage.updateStats(card.rarity, isReversed, actualPackId)
    })
    records = Storage.addDrawRecord({
      spreadType,
      cards: drawResult.map(({ card, isReversed, position, pityInfo }) => ({
        cardId: card.id,
        isReversed,
        position,
        pityInfo: pityInfo || null
      })),
      packId: actualPackId,
      pityInfo: drawResult.map(r => r.pityInfo || null)
    })
  }
  
  checkHiddenEvents(drawResult, spreadType)
  checkAchievementsAfterAction('draw')
  checkSeasonTasksAfterAction('draw')

  const drawnCards = spreadType === 'single' ? [drawResult] : drawResult
  checkVisitorTriggerAfterDraw(drawnCards)

  return records
}

export function saveDrawResult(drawResult, spreadType = 'single') {
  let records = []
  const defaultPackId = getCurrentPackId()
  
  if (spreadType === 'single') {
    const { card, isReversed, reading, pityInfo, packId } = drawResult
    const actualPackId = packId || defaultPackId
    Storage.addToCollection(card.id, isReversed, actualPackId)
    Storage.updateStats(card.rarity, isReversed, actualPackId)
    records = Storage.addDrawRecord({
      spreadType,
      cardId: card.id,
      isReversed,
      title: reading.title,
      meaning: reading.meaning,
      packId: actualPackId,
      pityInfo: pityInfo || null
    })
  } else if (spreadType === 'three') {
    drawResult.forEach(({ card, isReversed, packId }) => {
      const actualPackId = packId || defaultPackId
      Storage.addToCollection(card.id, isReversed, actualPackId)
      Storage.updateStats(card.rarity, isReversed, actualPackId)
    })
    records = Storage.addDrawRecord({
      spreadType,
      cards: drawResult.map(({ card, isReversed, position, pityInfo }) => ({
        cardId: card.id,
        isReversed,
        position,
        pityInfo: pityInfo || null
      })),
      packId: drawResult[0]?.packId || defaultPackId,
      pityInfo: drawResult.map(r => r.pityInfo || null)
    })
  }
  
  checkHiddenEvents(drawResult, spreadType)
  checkAchievementsAfterAction('draw')
  checkSeasonTasksAfterAction('draw')

  const drawnCards = spreadType === 'single' ? [drawResult] : drawResult
  checkVisitorTriggerAfterDraw(drawnCards)

  return records
}

function checkVisitorTriggerAfterDraw(drawnCards) {
  const triggeredVisitors = checkVisitorTriggers(drawnCards)
  if (triggeredVisitors.length > 0) {
    const selected = triggeredVisitors[Math.floor(Math.random() * triggeredVisitors.length)]
    setTimeout(() => {
      triggerVisitor(selected.visitor)
    }, 1500)
  }
}

function checkHiddenEvents(drawResult, spreadType) {
  const stats = Storage.getStats()
  
  if (stats.totalDraws === 1) {
    const card = spreadType === 'single' ? drawResult.card : drawResult[0].card
    const pityInfo = spreadType === 'single' ? drawResult.pityInfo : drawResult[0].pityInfo
    if (card.hiddenEvent && card.hiddenEvent.trigger === 'first_draw') {
      triggerHiddenEvent(card, pityInfo)
    }
  }
  
  if (stats.totalDraws === 3) {
    const loversCard = getCardById('neon-lovers')
    if (loversCard && loversCard.hiddenEvent && loversCard.hiddenEvent.trigger === 'draw_3_times') {
      triggerHiddenEvent(loversCard, null, { triggerType: 'draw_3_times' })
    }
  }
  
  if (spreadType === 'single') {
    checkSingleCardEvents(drawResult.card, drawResult.isReversed, drawResult.pityInfo)
  } else if (spreadType === 'three') {
    drawResult.forEach(({ card, isReversed, pityInfo }) => checkSingleCardEvents(card, isReversed, pityInfo))
  }
}

function checkSingleCardEvents(card, isReversed, pityInfo = null) {
  if (!card.hiddenEvent) return
  
  const trigger = card.hiddenEvent.trigger
  
  if (trigger === 'draw_world' && card.id === 'cyber-world') {
    triggerHiddenEvent(card, pityInfo, { triggerType: 'specific_card' })
  }
  
  if (trigger === 'draw_ghost' && card.id === 'ghost-protocol') {
    triggerHiddenEvent(card, pityInfo, { triggerType: 'specific_card' })
  }
  
  if (trigger === 'legendary_draw' && card.rarity === CARD_RARITY.LEGENDARY && !isReversed) {
    const isPity = pityInfo?.isPityTriggered || false
    const pityType = pityInfo?.pityType || null
    triggerHiddenEvent(card, pityInfo, { 
      triggerType: 'legendary_draw',
      isPityTriggered: isPity,
      pityType: pityType
    })
  }
  
  if (trigger === 'lucky_draw' && card.rarity !== CARD_RARITY.COMMON && card.rarity !== CARD_RARITY.RARE) {
    const isPity = pityInfo?.isPityTriggered || false
    const baseChance = isPity ? 0.5 : 0.1
    if (Math.random() < baseChance) {
      triggerHiddenEvent(card, pityInfo, { 
        triggerType: 'lucky_draw',
        isPityTriggered: isPity
      })
    }
  }

  if (trigger === 'pity_guaranteed' && pityInfo?.isPityTriggered) {
    triggerHiddenEvent(card, pityInfo, { triggerType: 'pity_guaranteed' })
  }
}

const eventListeners = []

export function onHiddenEvent(callback) {
  eventListeners.push(callback)
  return () => {
    const idx = eventListeners.indexOf(callback)
    if (idx > -1) eventListeners.splice(idx, 1)
  }
}

function triggerHiddenEvent(card, pityInfo = null, extraContext = {}) {
  const event = card.hiddenEvent
  if (!event) return

  const achievementId = event.reward?.value
  if (!achievementId) return

  const isNew = triggerHiddenAchievement(achievementId)
  if (!isNew) return

  const isPityTriggered = pityInfo?.isPityTriggered || extraContext?.isPityTriggered || false
  const pityType = pityInfo?.pityType || extraContext?.pityType || null
  const pityCount = pityInfo?.pityCount || 0

  const eventData = {
    ...event,
    achievementId,
    cardId: card.id,
    cardName: card.name,
    cardRarity: card.rarity,
    unlockedAt: Date.now(),
    pityInfo: {
      isPityTriggered,
      pityType,
      pityCount
    },
    triggerContext: extraContext || {}
  }

  Storage.addHiddenEventLog(eventData)

  eventListeners.forEach(cb => {
    try {
      cb(eventData)
    } catch (e) {
      console.error('Hidden event callback error:', e)
    }
  })
}

export function filterCardsByRarity(rarity) {
  return CARDS.filter(c => c.rarity === rarity)
}

export function filterCardsByCategory(category) {
  return CARDS.filter(c => c.category === category)
}

export function searchCards(query) {
  const q = query.toLowerCase().trim()
  if (!q) return CARDS
  return CARDS.filter(c => 
    c.name.toLowerCase().includes(q) ||
    c.keywords.some(k => k.toLowerCase().includes(q))
  )
}

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function getDateSeed(dateStr) {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function drawDailyFortune(consecutiveDays = 1, packId = null) {
  const today = new Date().toDateString()
  const seed = getDateSeed(today + '_daily_fortune')
  
  const reward = getConsecutiveReward(consecutiveDays)
  
  const cards = packId ? getPackCards(packId) : getCurrentPackCards()
  const rarityConfig = packId ? getPackRarityConfig(packId) : getCurrentPackRarityConfig()
  const actualPackId = packId || getCurrentPackId()
  
  Storage.incrementPityCounters(actualPackId)
  
  let cardPool = cards.length > 0 ? [...cards] : [...CARDS]
  
  const pity = Storage.getPityCounters(actualPackId)
  const legendaryRate = calculatePityRate(CARD_RARITY.LEGENDARY, pity.sinceLegendary)
  const epicRate = calculatePityRate(CARD_RARITY.EPIC, pity.sinceEpic)
  const rareRate = calculatePityRate(CARD_RARITY.RARE, pity.sinceRare)
  const commonRate = Math.max(0, 100 - legendaryRate - epicRate - rareRate)
  
  let weights = cardPool.map(card => {
    let weight = (rarityConfig[card.rarity]?.weight ?? RARITY_CONFIG[card.rarity]?.weight ?? 1)
    
    if (reward) {
      if (reward.days >= 3 && card.rarity === CARD_RARITY.RARE) weight *= 1.5
      if (reward.days >= 14 && card.rarity === CARD_RARITY.EPIC) weight *= 1.8
      if (reward.days >= 30 && card.rarity === CARD_RARITY.LEGENDARY) weight *= 2.5
    }
    
    const pityMultipliers = {
      [CARD_RARITY.LEGENDARY]: (legendaryRate / getPityConfig(CARD_RARITY.LEGENDARY).baseRate),
      [CARD_RARITY.EPIC]: (epicRate / getPityConfig(CARD_RARITY.EPIC).baseRate),
      [CARD_RARITY.RARE]: (rareRate / getPityConfig(CARD_RARITY.RARE).baseRate),
      [CARD_RARITY.COMMON]: (commonRate / getPityConfig(CARD_RARITY.COMMON).baseRate)
    }
    const pityMult = pityMultipliers[card.rarity] ?? 1
    weight *= Math.max(0.3, pityMult)
    
    return weight
  })
  
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let random = seededRandom(seed) * totalWeight
  
  let selectedCard = cardPool[0]
  for (let i = 0; i < cardPool.length; i++) {
    random -= weights[i]
    if (random <= 0) {
      selectedCard = cardPool[i]
      break
    }
  }
  
  const isReversed = seededRandom(seed + 999) < 0.3
  const reading = isReversed ? selectedCard.reversed : selectedCard.upright
  const pityInfo = updatePityAfterDraw(selectedCard.rarity, selectedCard.id, actualPackId)
  
  return {
    card: selectedCard,
    isReversed,
    reading,
    packId: actualPackId,
    pityInfo: {
      isPityTriggered: pityInfo.isPity,
      pityType: pityInfo.pityType,
      pityCount: pityInfo.pityCount
    }
  }
}

export function saveDailyFortuneResult(result) {
  const { card, isReversed, reading, packId, pityInfo } = result
  const actualPackId = packId || getCurrentPackId()
  Storage.addToCollection(card.id, isReversed, actualPackId)
  Storage.updateStats(card.rarity, isReversed, actualPackId)
  const saved = Storage.saveDailyFortune(card.id, isReversed, reading, actualPackId, pityInfo)
  checkAchievementsAfterAction('daily')
  checkSeasonTasksAfterAction('daily')
  
  checkSingleCardEvents(card, isReversed, pityInfo)
  checkVisitorTriggerAfterDraw([result])
  
  return saved
}

export function drawThemeCards(theme, spreadTypeId, packId = null) {
  const themeConfig = THEME_CONFIG[theme]
  if (!themeConfig) throw new Error(`Unknown theme: ${theme}`)

  const spreadType = themeConfig.spreadTypes.find(s => s.id === spreadTypeId)
  if (!spreadType) throw new Error(`Unknown spread type: ${spreadTypeId}`)

  const cardCount = spreadType.cardCount
  const actualPackId = packId || getCurrentPackId()
  const cards = packId ? getPackCards(packId) : getCurrentPackCards()
  const rarityConfig = packId ? getPackRarityConfig(packId) : getCurrentPackRarityConfig()
  const cardPool = cards.length > 0 ? cards : CARDS
  
  const drawnIds = new Set()
  const results = []

  for (let i = 0; i < cardCount; i++) {
    let card
    let attempts = 0
    do {
      const selectedCard = weightedRandomSelectWithConfig(cardPool, rarityConfig)
      const isReversed = Math.random() < 0.35
      const reading = isReversed ? selectedCard.reversed : selectedCard.upright
      card = { card: selectedCard, isReversed, reading }
      attempts++
    } while (drawnIds.has(card.card.id) && attempts < 20)

    drawnIds.add(card.card.id)
    results.push({
      ...card,
      position: spreadType.positions[i],
      packId: actualPackId
    })
  }

  return results
}

export function saveThemeDivinationResult(theme, spreadTypeId, results, question = '') {
  const packId = results[0]?.packId || getCurrentPackId()
  results.forEach(({ card, isReversed }) => {
    Storage.addToCollection(card.id, isReversed, packId)
    Storage.updateStats(card.rarity, isReversed, packId)
  })

  const record = {
    theme,
    spreadTypeId,
    question,
    packId,
    cards: results.map(({ card, isReversed, position, packId }) => ({
      cardId: card.id,
      isReversed,
      position,
      packId,
      title: isReversed ? card.reversed.title : card.upright.title,
      meaning: isReversed ? card.reversed.meaning : card.upright.meaning,
      advice: isReversed ? card.reversed.advice : card.upright.advice,
      fortune: isReversed ? card.reversed.fortune : card.upright.fortune
    }))
  }

  checkHiddenEvents(results, results.length === 1 ? 'single' : 'three')
  checkAchievementsAfterAction('theme')
  checkSeasonTasksAfterAction('draw')

  checkVisitorTriggerAfterDraw(results)

  return Storage.addThemeDivinationRecord(record)
}

export function getThemeConfig(theme) {
  return THEME_CONFIG[theme] || null
}

export function getAllThemes() {
  return Object.values(THEME_CONFIG)
}

export function drawMultiSpread(spreadId, packId = null) {
  const spreadConfig = MULTI_SPREAD_CONFIG[spreadId]
  if (!spreadConfig) throw new Error(`Unknown spread: ${spreadId}`)

  const cardCount = spreadConfig.cardCount
  const actualPackId = packId || getCurrentPackId()
  const cards = packId ? getPackCards(packId) : getCurrentPackCards()
  const rarityConfig = packId ? getPackRarityConfig(packId) : getCurrentPackRarityConfig()
  const cardPool = cards.length > 0 ? cards : CARDS
  
  const drawnIds = new Set()
  const results = []

  for (let i = 0; i < cardCount; i++) {
    let card
    let attempts = 0
    do {
      const selectedCard = weightedRandomSelectWithConfig(cardPool, rarityConfig)
      const isReversed = Math.random() < 0.35
      const reading = isReversed ? selectedCard.reversed : selectedCard.upright
      card = { card: selectedCard, isReversed, reading }
      attempts++
    } while (drawnIds.has(card.card.id) && attempts < 20)

    drawnIds.add(card.card.id)
    const posConfig = spreadConfig.positions[i]
    results.push({
      ...card,
      position: posConfig.name,
      positionId: posConfig.id,
      positionDesc: posConfig.desc,
      packId: actualPackId
    })
  }

  return results
}

export function saveMultiSpreadResult(spreadId, results, question = '') {
  const packId = results[0]?.packId || getCurrentPackId()
  results.forEach(({ card, isReversed }) => {
    Storage.addToCollection(card.id, isReversed, packId)
    Storage.updateStats(card.rarity, isReversed, packId)
  })

  const record = {
    spreadId,
    question,
    packId,
    cards: results.map(({ card, isReversed, position, positionId, positionDesc, packId }) => ({
      cardId: card.id,
      isReversed,
      position,
      positionId,
      positionDesc,
      packId,
      title: isReversed ? card.reversed.title : card.upright.title,
      meaning: isReversed ? card.reversed.meaning : card.upright.meaning,
      advice: isReversed ? card.reversed.advice : card.upright.advice,
      fortune: isReversed ? card.reversed.fortune : card.upright.fortune
    }))
  }

  checkHiddenEvents(results, results.length === 1 ? 'single' : 'three')
  checkAchievementsAfterAction('spread')
  checkSeasonTasksAfterAction('draw')

  checkVisitorTriggerAfterDraw(results)

  return Storage.addMultiSpreadRecord(record)
}

export const QUESTION_CATEGORIES = {
  LOVE: {
    id: 'love',
    name: '情感关系',
    icon: '💕',
    color: '#e040fb',
    keywords: ['爱', '恋', '情', '喜欢', '表白', '分手', '复合', '对象', '伴侣', '婚姻', '关系', '暧昧', '暗恋', '前任', '感情', '恋爱', '约会', '吵架', '冷战', '相处'],
    description: '关于爱情、恋爱、人际关系问题'
  },
  CAREER: {
    id: 'career',
    name: '事业发展',
    icon: '💼',
    color: '#00e5ff',
    keywords: ['工作', '事业', '职业', '跳槽', '面试', '辞职', '升职', '加薪', '创业', '项目', '领导', '同事', '公司', 'offer', '换工作', '转行', '失业'],
    description: '关于工作、职业发展相关'
  },
  WEALTH: {
    id: 'wealth',
    name: '财运投资',
    icon: '💰',
    color: '#ffd54f',
    keywords: ['钱', '财', '投资', '理财', '股票', '基金', '买房', '贷款', '债务', '收入', '支出', '消费', '储蓄', '财运', '赚钱', '亏损', '中奖'],
    description: '关于金钱、投资理财问题'
  },
  HEALTH: {
    id: 'health',
    name: '健康身心',
    icon: '🌿',
    color: '#69f0ae',
    keywords: ['身体', '健康', '病', '医', '睡眠', '饮食', '运动', '减肥', '压力', '焦虑', '心理', '情绪', '精神', '身心'],
    description: '关于身心健康的问题'
  },
  FAMILY: {
    id: 'family',
    name: '家庭亲情',
    icon: '🏠',
    color: '#ff8a65',
    keywords: ['家人', '父母', '孩子', '家庭', '结婚', '亲戚', '兄弟姐妹', '亲情', '家人关系', '家庭矛盾', '原生家庭'],
    description: '关于家庭、亲情相关'
  },
  LEARNING: {
    id: 'learning',
    name: '学业考试',
    icon: '📚',
    color: '#7986cb',
    keywords: ['学习', '考试', '考研', '考公', '留学', '成绩', '论文', '毕业', '升学', '证书', '读书', '作业'],
    description: '关于学业、考试相关'
  },
  DECISION: {
    id: 'decision',
    name: '抉择选择',
    icon: '⚖️',
    color: '#4fc3f7',
    keywords: ['选择', '决定', '要不要', '选哪个', '犹豫', '纠结', '两难', '抉择', '决定方向'],
    description: '面临两难选择时'
  },
  GENERAL: {
    id: 'general',
    name: '综合指引',
    icon: '✨',
    color: '#b39ddb',
    keywords: [],
    description: '其他综合类问题'
  }
}

export const URGENCY_LEVELS = [
  { id: 'low', name: '近期迷茫', color: '#4fc3f7', icon: '🌙', description: '想看看方向，不急，需要了解趋势' },
  { id: 'medium', name: '当前困惑', color: '#ffd54f', icon: '⚡', description: '遇到了一些阻碍，需要指导' },
  { id: 'high', name: '紧急重要', color: '#ff5252', icon: '🔥', description: '面临重大抉择，急需指引' }
]

function calculateKeywordMatch(text, keywords) {
  if (!text) return 0
  const lowerText = text.toLowerCase()
  let score = 0
  keywords.forEach(kw => {
    if (lowerText.includes(kw)) {
      score += 1
    }
  })
  return score
}

export function analyzeQuestionCategory(questionText, contextText = '') {
  const fullText = questionText + ' ' + contextText
  let bestCategory = QUESTION_CATEGORIES.GENERAL
  let bestScore = 0

  Object.values(QUESTION_CATEGORIES).forEach(cat => {
    const score = calculateKeywordMatch(fullText, cat.keywords)
    if (score > bestScore) {
      bestScore = score
      bestCategory = cat
    }
  })

  return {
    category: bestCategory,
    matchScore: bestScore,
    confidence: bestScore > 0 ? Math.min(0.5 + bestScore * 0.1, 0.95) : 0.2
  }
}

function getSpreadForQuestion(category, urgency, questionLength) {
  const categoryId = category.id
  const urgencyId = urgency.id

  let recommended = []

  if (categoryId === 'love') {
    recommended.push({ type: 'theme', themeId: DIVINATION_THEMES.LOVE, spreadTypeId: 'relationship', confidence: 0.9 })
    recommended.push({ type: 'theme', themeId: DIVINATION_THEMES.LOVE, spreadTypeId: 'three-love', confidence: 0.85 })
    recommended.push({ type: 'multi-spread', spreadId: 'relationship', confidence: 0.8 })
  } else if (categoryId === 'career') {
    recommended.push({ type: 'theme', themeId: DIVINATION_THEMES.CAREER, spreadTypeId: 'career-path', confidence: 0.9 })
    recommended.push({ type: 'theme', themeId: DIVINATION_THEMES.CAREER, spreadTypeId: 'three-career', confidence: 0.85 })
    recommended.push({ type: 'multi-spread', spreadId: 'decision', confidence: 0.7 })
  } else if (categoryId === 'wealth') {
    recommended.push({ type: 'theme', themeId: DIVINATION_THEMES.WEALTH, spreadTypeId: 'wealth-flow', confidence: 0.9 })
    recommended.push({ type: 'theme', themeId: DIVINATION_THEMES.WEALTH, spreadTypeId: 'three-wealth', confidence: 0.85 })
  } else if (categoryId === 'decision') {
    recommended.push({ type: 'multi-spread', spreadId: 'decision', confidence: 0.95 })
    recommended.push({ type: 'multi-spread', spreadId: 'cross', confidence: 0.8 })
  } else if (categoryId === 'health') {
    recommended.push({ type: 'multi-spread', spreadId: 'cross', confidence: 0.85 })
    recommended.push({ type: 'theme', themeId: DIVINATION_THEMES.LOVE, spreadTypeId: 'single', confidence: 0.6 })
  } else if (categoryId === 'family') {
    recommended.push({ type: 'multi-spread', spreadId: 'relationship', confidence: 0.8 })
    recommended.push({ type: 'multi-spread', spreadId: 'cross', confidence: 0.75 })
  } else if (categoryId === 'learning') {
    recommended.push({ type: 'multi-spread', spreadId: 'cross', confidence: 0.8 })
    recommended.push({ type: 'theme', themeId: DIVINATION_THEMES.CAREER, spreadTypeId: 'career-path', confidence: 0.7 })
  } else {
    recommended.push({ type: 'multi-spread', spreadId: 'cross', confidence: 0.7 })
    recommended.push({ type: 'theme', themeId: DIVINATION_THEMES.LOVE, spreadTypeId: 'single', confidence: 0.6 })
  }

  if (urgencyId === 'high') {
    recommended = recommended.map(r => ({ ...r, confidence: Math.min(r.confidence + 0.05, 1) }))
    recommended.push({ type: 'multi-spread', spreadId: 'cross', confidence: 0.85 })
  }

  if (questionLength > 100) {
    recommended = recommended.map(r => ({ ...r, confidence: Math.min(r.confidence + 0.03, 1) }))
  }

  recommended.sort((a, b) => b.confidence - a.confidence)

  return recommended.slice(0, 3).map((r, idx) => ({
    ...r,
    rank: idx + 1,
    reason: generateSpreadReason(r, category, urgency)
  }))
}

function generateSpreadReason(recommendation, category, urgency) {
  const reasons = []
  if (recommendation.type === 'theme') {
    reasons.push(`匹配「${category.name}」主题`)
  } else {
    const spread = MULTI_SPREAD_CONFIG[recommendation.spreadId]
    if (spread) reasons.push(`「${spread.name}」最适合分析复杂情况`)
  }
  if (urgency.id === 'high') reasons.push('问题重要，需要深度分析')
  if (urgency.id === 'medium') reasons.push('需要多维度剖析')
  return reasons.join(' · ')
}

export function recommendSpreads(questionText, contextText = '', urgencyLevel = URGENCY_LEVELS[1]) {
  const categoryAnalysis = analyzeQuestionCategory(questionText, contextText)
  const spreads = getSpreadForQuestion(categoryAnalysis.category, urgencyLevel, (questionText + contextText).length)

  return {
    category: categoryAnalysis,
    urgency: urgencyLevel,
    recommendedSpreads: spreads,
    summary: generateRecommendationSummary(categoryAnalysis.category, urgencyLevel)
  }
}

function generateRecommendationSummary(category, urgency) {
  const parts = []
  parts.push(`你的问题偏向「${category.icon} ${category.name}」领域`)
  parts.push(`当前状态：${urgency.icon} ${urgency.name}`)
  if (urgency.id === 'high') {
    parts.push('建议使用多牌阵深入剖析')
  } else if (urgency.id === 'medium') {
    parts.push('可以选择三牌阵或多牌阵')
  } else {
    parts.push('可以先从简单牌阵获得指引')
  }
  return parts.join(' | ')
}

export function drawQuestionDrivenCards(recommendation, packId = null) {
  const spread = recommendation
  const actualPackId = packId || getCurrentPackId()
  if (spread.type === 'theme') {
    return drawThemeCards(spread.themeId, spread.spreadTypeId, actualPackId)
  } else {
    return drawMultiSpread(spread.spreadId, actualPackId)
  }
}

export function getSpreadMeta(recommendation) {
  if (recommendation.type === 'theme') {
    const theme = THEME_CONFIG[recommendation.themeId]
    const spreadType = theme?.spreadTypes?.find(s => s.id === recommendation.spreadTypeId)
    return {
      type: 'theme',
      theme,
      spreadType,
      name: `${theme?.icon || ''} ${theme?.name || ''} · ${spreadType?.name || ''}`,
      icon: theme?.icon || '🔮',
      color: theme?.color || '#00e5ff',
      cardCount: spreadType?.cardCount || 1,
      positions: spreadType?.positions || []
    }
  } else {
    const spread = MULTI_SPREAD_CONFIG[recommendation.spreadId]
    return {
      type: 'multi-spread',
      spread,
      name: `${spread?.icon || ''} ${spread?.name || ''}`,
      icon: spread?.icon || '✚',
      color: spread?.color || '#e040fb',
      cardCount: spread?.cardCount || 1,
      positions: spread?.positions?.map(p => p.name) || []
    }
  }
}

export function saveQuestionDrivenResult(questionContext, recommendation, spreadMeta, results, userInterpretation = '') {
  const packId = results[0]?.packId || getCurrentPackId()
  results.forEach(({ card, isReversed }) => {
    Storage.addToCollection(card.id, isReversed, packId)
    Storage.updateStats(card.rarity, isReversed, packId)
  })

  const record = {
    questionContext,
    recommendation,
    spreadMeta: {
      type: spreadMeta.type,
      name: spreadMeta.name,
      icon: spreadMeta.icon,
      color: spreadMeta.color,
      cardCount: spreadMeta.cardCount,
      positions: spreadMeta.positions,
      themeId: recommendation.themeId,
      spreadTypeId: recommendation.spreadTypeId,
      spreadId: recommendation.spreadId,
    },
    userInterpretation,
    packId,
    cards: results.map(({ card, isReversed, position, positionId, positionDesc, packId }) => ({
      cardId: card.id,
      isReversed,
      position,
      positionId,
      positionDesc,
      packId,
      title: isReversed ? card.reversed.title : card.upright.title,
      meaning: isReversed ? card.reversed.meaning : card.upright.meaning,
      advice: isReversed ? card.reversed.advice : card.upright.advice,
      fortune: isReversed ? card.reversed.fortune : card.upright.fortune
    }))
  }

  checkHiddenEvents(results, results.length === 1 ? 'single' : 'three')
  checkAchievementsAfterAction('theme')
  checkSeasonTasksAfterAction('draw')

  checkVisitorTriggerAfterDraw(results)

  return Storage.addQuestionDrivenRecord(record)
}
