import { CARDS } from '../data/cards.js'
import { RARITY_CONFIG, CARD_RARITY } from '../data/constants.js'
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
