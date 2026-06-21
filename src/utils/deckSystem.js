import { CARDS } from '../data/cards.js'
import { CARD_RARITY, CARD_CATEGORY } from '../data/constants.js'
import { Storage } from './storage.js'

export const STORYLINE_THEMES = {
  HERO_JOURNEY: 'hero_journey',
  CYBER_REBELLION: 'cyber_rebellion',
  CORP_RISE: 'corp_rise',
  SPIRITUAL_AWAKENING: 'spiritual_awakening',
  LOVE_STORY: 'love_story',
  TECHNO_EVOLUTION: 'techno_evolution'
}

export const STORYLINE_CONFIG = {
  [STORYLINE_THEMES.HERO_JOURNEY]: {
    id: STORYLINE_THEMES.HERO_JOURNEY,
    name: '英雄旅程',
    icon: '⚔️',
    color: '#ffd54f',
    description: '从新手到传奇的成长之路',
    keywords: ['新起点', '冒险', '勇气', '胜利', '完成']
  },
  [STORYLINE_THEMES.CYBER_REBELLION]: {
    id: STORYLINE_THEMES.CYBER_REBELLION,
    name: '赛博起义',
    icon: '💥',
    color: '#ff5252',
    description: '反抗企业统治的黑客传奇',
    keywords: ['自由', '反抗', '突变', '破坏', '重生']
  },
  [STORYLINE_THEMES.CORP_RISE]: {
    id: STORYLINE_THEMES.CORP_RISE,
    name: '企业崛起',
    icon: '🏢',
    color: '#00e5ff',
    description: '权力、控制与商业帝国的建立',
    keywords: ['权威', '结构', '控制', '公正', '成功']
  },
  [STORYLINE_THEMES.SPIRITUAL_AWAKENING]: {
    id: STORYLINE_THEMES.SPIRITUAL_AWAKENING,
    name: '灵性觉醒',
    icon: '✨',
    color: '#ba68c8',
    description: '数字时代的灵魂探索之旅',
    keywords: ['直觉', '秘密', '内省', '智慧', '超越']
  },
  [STORYLINE_THEMES.LOVE_STORY]: {
    id: STORYLINE_THEMES.LOVE_STORY,
    name: '爱情故事',
    icon: '💕',
    color: '#e040fb',
    description: '赛博空间中的心灵连接',
    keywords: ['爱', '选择', '和谐', '丰饶', '牺牲']
  },
  [STORYLINE_THEMES.TECHNO_EVOLUTION]: {
    id: STORYLINE_THEMES.TECHNO_EVOLUTION,
    name: '科技进化',
    icon: '⚡',
    color: '#69f0ae',
    description: '人类与机器的融合进程',
    keywords: ['意志力', '技能', '创造', '转变', '整合']
  }
}

export function getAllKeywords() {
  const keywords = new Set()
  CARDS.forEach(card => {
    card.keywords.forEach(k => keywords.add(k))
  })
  return Array.from(keywords).sort()
}

export function filterCards({
  cards = CARDS,
  searchQuery = '',
  rarity = null,
  category = null,
  keywords = [],
  storyline = null,
  collectedOnly = false,
  collection = null,
  limit = null
} = {}) {
  const actualCollection = collection || Storage.getCollection()

  const result = cards.filter(card => {
    if (collectedOnly && !actualCollection[card.id]) {
      return false
    }

    if (rarity && card.rarity !== rarity) {
      return false
    }

    if (category && card.category !== category) {
      return false
    }

    if (keywords.length > 0) {
      const hasKeyword = keywords.some(k =>
        card.keywords.some(ck => ck.toLowerCase().includes(k.toLowerCase()))
      )
      if (!hasKeyword) return false
    }

    if (storyline && STORYLINE_CONFIG[storyline]) {
      const themeKeywords = STORYLINE_CONFIG[storyline].keywords
      const matchesStoryline = themeKeywords.some(tk =>
        card.keywords.some(ck => ck.toLowerCase().includes(tk.toLowerCase()))
      )
      if (!matchesStoryline) return false
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesName = card.name.toLowerCase().includes(query)
      const matchesKeywords = card.keywords.some(k => k.toLowerCase().includes(query))
      if (!matchesName && !matchesKeywords) {
        return false
      }
    }

    return true
  })

  return limit ? result.slice(0, limit) : result
}

export function createDeck({ name, description = '', cardIds = [], tags = [], color = '#4fc3f7' } = {}) {
  return {
    name,
    description,
    cardIds,
    tags,
    color,
    isFavorite: false
  }
}

export function createThemeAlbum({ name, description = '', storyline = null, cardIds = [], rarityFilter = null, keywords = [], color = '#ba68c8' } = {}) {
  return {
    name,
    description,
    storyline,
    cardIds,
    rarityFilter,
    keywords,
    color
  }
}

export function addCardToDeck(deck, cardId) {
  if (!deck.cardIds.includes(cardId)) {
    return {
      ...deck,
      cardIds: [...deck.cardIds, cardId]
    }
  }
  return deck
}

export function removeCardFromDeck(deck, cardId) {
  return {
    ...deck,
    cardIds: deck.cardIds.filter(id => id !== cardId)
  }
}

export function getDeckCards(deck) {
  return deck.cardIds
    .map(id => CARDS.find(c => c.id === id))
    .filter(Boolean)
}

export function getDeckStats(deck, collection = null) {
  const actualCollection = collection || Storage.getCollection()
  const cards = getDeckCards(deck)
  const collectedCount = cards.filter(c => actualCollection[c.id]).length

  const rarityCounts = {
    [CARD_RARITY.COMMON]: 0,
    [CARD_RARITY.RARE]: 0,
    [CARD_RARITY.EPIC]: 0,
    [CARD_RARITY.LEGENDARY]: 0
  }

  const categoryCounts = {
    [CARD_CATEGORY.TECH]: 0,
    [CARD_CATEGORY.NEURAL]: 0,
    [CARD_CATEGORY.CORP]: 0,
    [CARD_CATEGORY.CRYPTO]: 0,
    [CARD_CATEGORY.MYSTIC]: 0
  }

  const allKeywords = new Set()

  cards.forEach(card => {
    rarityCounts[card.rarity]++
    categoryCounts[card.category]++
    card.keywords.forEach(k => allKeywords.add(k))
  })

  return {
    totalCards: cards.length,
    collectedCount,
    completionPercent: cards.length > 0 ? Math.round((collectedCount / cards.length) * 100) : 0,
    rarityCounts,
    categoryCounts,
    keywords: Array.from(allKeywords)
  }
}

export function suggestCardsForStoryline(storyline, limit = 10) {
  if (!STORYLINE_CONFIG[storyline]) return []
  return filterCards({ storyline, limit })
}

export function generateDeckSuggestions() {
  return Object.values(STORYLINE_CONFIG).map(theme => ({
    name: `${theme.name}卡组`,
    description: theme.description,
    storyline: theme.id,
    color: theme.color,
    suggestedCards: suggestCardsForStoryline(theme.id, 8).map(c => c.id)
  }))
}
