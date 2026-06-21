import { CARDS } from '../data/cards.js'
import { RARITY_CONFIG, CARD_RARITY, getConsecutiveReward, THEME_CONFIG } from '../data/constants.js'
import { Storage } from './storage.js'

export function getAllCards() {
  return CARDS
}

export function getCardById(id) {
  return CARDS.find(c => c.id === id)
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

export function saveDrawResult(drawResult, spreadType = 'single') {
  let records = []
  
  if (spreadType === 'single') {
    const { card, isReversed, reading } = drawResult
    Storage.addToCollection(card.id, isReversed)
    Storage.updateStats(card.rarity, isReversed)
    records = Storage.addDrawRecord({
      spreadType,
      cardId: card.id,
      isReversed,
      title: reading.title,
      meaning: reading.meaning
    })
  } else if (spreadType === 'three') {
    drawResult.forEach(({ card, isReversed }) => {
      Storage.addToCollection(card.id, isReversed)
      Storage.updateStats(card.rarity, isReversed)
    })
    records = Storage.addDrawRecord({
      spreadType,
      cards: drawResult.map(({ card, isReversed, position }) => ({
        cardId: card.id,
        isReversed,
        position
      }))
    })
  }
  
  checkHiddenEvents(drawResult, spreadType)
  
  return records
}

function checkHiddenEvents(drawResult, spreadType) {
  const stats = Storage.getStats()
  
  if (stats.totalDraws === 1) {
    const card = spreadType === 'single' ? drawResult.card : drawResult[0].card
    if (card.hiddenEvent && card.hiddenEvent.trigger === 'first_draw') {
      triggerHiddenEvent(card)
    }
  }
  
  if (stats.totalDraws === 3) {
    const loversCard = getCardById('neon-lovers')
    if (loversCard && loversCard.hiddenEvent && loversCard.hiddenEvent.trigger === 'draw_3_times') {
      triggerHiddenEvent(loversCard)
    }
  }
  
  if (spreadType === 'single') {
    checkSingleCardEvents(drawResult.card, drawResult.isReversed)
  } else if (spreadType === 'three') {
    drawResult.forEach(({ card }) => checkSingleCardEvents(card))
  }
}

function checkSingleCardEvents(card, isReversed) {
  if (!card.hiddenEvent) return
  
  const trigger = card.hiddenEvent.trigger
  
  if (trigger === 'draw_world' && card.id === 'cyber-world') {
    triggerHiddenEvent(card)
  }
  
  if (trigger === 'draw_ghost' && card.id === 'ghost-protocol') {
    triggerHiddenEvent(card)
  }
  
  if (trigger === 'legendary_draw' && card.rarity === CARD_RARITY.LEGENDARY && !isReversed) {
    triggerHiddenEvent(card)
  }
  
  if (trigger === 'lucky_draw' && card.rarity !== CARD_RARITY.COMMON && card.rarity !== CARD_RARITY.RARE) {
    if (Math.random() < 0.1) {
      triggerHiddenEvent(card)
    }
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

function triggerHiddenEvent(card) {
  const event = card.hiddenEvent
  if (!event) return
  
  const isNew = Storage.unlockAchievement(event.reward.value)
  if (!isNew) return
  
  eventListeners.forEach(cb => {
    try {
      cb({
        ...event,
        cardId: card.id,
        cardName: card.name,
        unlockedAt: Date.now()
      })
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

export function drawDailyFortune(consecutiveDays = 1) {
  const today = new Date().toDateString()
  const seed = getDateSeed(today + '_daily_fortune')
  
  const reward = getConsecutiveReward(consecutiveDays)
  
  let cardPool = [...CARDS]
  let weights = cardPool.map(card => {
    let weight = RARITY_CONFIG[card.rarity].weight
    if (reward) {
      if (reward.days >= 3 && card.rarity === CARD_RARITY.RARE) weight *= 1.5
      if (reward.days >= 14 && card.rarity === CARD_RARITY.EPIC) weight *= 1.8
      if (reward.days >= 30 && card.rarity === CARD_RARITY.LEGENDARY) weight *= 2.5
    }
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
  
  return {
    card: selectedCard,
    isReversed,
    reading
  }
}

export function saveDailyFortuneResult(result) {
  const { card, isReversed, reading } = result
  Storage.addToCollection(card.id, isReversed)
  Storage.updateStats(card.rarity, isReversed)
  return Storage.saveDailyFortune(card.id, isReversed, reading)
}

export function drawThemeCards(theme, spreadTypeId) {
  const themeConfig = THEME_CONFIG[theme]
  if (!themeConfig) throw new Error(`Unknown theme: ${theme}`)

  const spreadType = themeConfig.spreadTypes.find(s => s.id === spreadTypeId)
  if (!spreadType) throw new Error(`Unknown spread type: ${spreadTypeId}`)

  const cardCount = spreadType.cardCount
  const drawnIds = new Set()
  const results = []

  for (let i = 0; i < cardCount; i++) {
    let card
    let attempts = 0
    do {
      const draw = drawSingleCard()
      card = draw
      attempts++
    } while (drawnIds.has(card.card.id) && attempts < 20)

    drawnIds.add(card.card.id)
    results.push({
      ...card,
      position: spreadType.positions[i]
    })
  }

  return results
}

export function saveThemeDivinationResult(theme, spreadTypeId, results, question = '') {
  results.forEach(({ card, isReversed }) => {
    Storage.addToCollection(card.id, isReversed)
    Storage.updateStats(card.rarity, isReversed)
  })

  const record = {
    theme,
    spreadTypeId,
    question,
    cards: results.map(({ card, isReversed, position }) => ({
      cardId: card.id,
      isReversed,
      position,
      title: isReversed ? card.reversed.title : card.upright.title,
      meaning: isReversed ? card.reversed.meaning : card.upright.meaning,
      advice: isReversed ? card.reversed.advice : card.upright.advice,
      fortune: isReversed ? card.reversed.fortune : card.upright.fortune
    }))
  }

  checkHiddenEvents(results, results.length === 1 ? 'single' : 'three')

  return Storage.addThemeDivinationRecord(record)
}

export function getThemeConfig(theme) {
  return THEME_CONFIG[theme] || null
}

export function getAllThemes() {
  return Object.values(THEME_CONFIG)
}
