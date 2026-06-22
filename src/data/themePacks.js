import { CARDS } from './cards.js'
import { CARD_RARITY, RARITY_CONFIG } from './constants.js'

export const THEME_PACK_IDS = {
  CORE: 'core',
  SHADOW_REALM: 'shadow-realm',
  CELESTIAL_DREAMS: 'celestial-dreams',
  NEON_DYSTOPIA: 'neon-dystopia'
}

const DEFAULT_RARITY_WEIGHTS = {
  [CARD_RARITY.COMMON]: 60,
  [CARD_RARITY.RARE]: 25,
  [CARD_RARITY.EPIC]: 12,
  [CARD_RARITY.LEGENDARY]: 3
}

export const THEME_PACKS = {
  [THEME_PACK_IDS.CORE]: {
    id: THEME_PACK_IDS.CORE,
    name: '核心卡包',
    icon: '🎴',
    color: '#00e5ff',
    glowColor: 'rgba(0, 229, 255, 0.3)',
    description: '赛博宇宙基础卡牌，包含全部22张大阿卡纳',
    cardIds: CARDS.map(c => c.id),
    rarityWeights: { ...DEFAULT_RARITY_WEIGHTS },
    isDefault: true,
    unlocked: true,
    releaseDate: '2024-01-01',
    bgGradient: 'linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 100%)'
  },
  [THEME_PACK_IDS.SHADOW_REALM]: {
    id: THEME_PACK_IDS.SHADOW_REALM,
    name: '暗影领域',
    icon: '🌑',
    color: '#7c4dff',
    glowColor: 'rgba(124, 77, 255, 0.3)',
    description: '深渊低语，暗影觉醒。探索内心最深处的黑暗力量',
    cardIds: [
      'ghost-protocol',
      'devil-firmware',
      'tower-crash',
      'death-signal',
      'lunar-moon',
      'cyber-emperor',
      'data-priestess',
      'neon-lovers'
    ],
    rarityWeights: {
      [CARD_RARITY.COMMON]: 40,
      [CARD_RARITY.RARE]: 30,
      [CARD_RARITY.EPIC]: 22,
      [CARD_RARITY.LEGENDARY]: 8
    },
    isDefault: false,
    unlocked: true,
    releaseDate: '2024-06-15',
    bgGradient: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 100%)'
  },
  [THEME_PACK_IDS.CELESTIAL_DREAMS]: {
    id: THEME_PACK_IDS.CELESTIAL_DREAMS,
    name: '天界梦境',
    icon: '☁️',
    color: '#69f0ae',
    glowColor: 'rgba(105, 240, 174, 0.3)',
    description: '云端之上，神圣指引。来自天界的祝福与启示',
    cardIds: [
      'aurora-star',
      'solar-sun',
      'lunar-moon',
      'cyber-world',
      'final-judgment',
      'temperance-ai',
      'strength-protocol',
      'hermit-node'
    ],
    rarityWeights: {
      [CARD_RARITY.COMMON]: 45,
      [CARD_RARITY.RARE]: 32,
      [CARD_RARITY.EPIC]: 18,
      [CARD_RARITY.LEGENDARY]: 5
    },
    isDefault: false,
    unlocked: true,
    releaseDate: '2024-08-20',
    bgGradient: 'linear-gradient(135deg, #0a1628 0%, #0d2818 100%)'
  },
  [THEME_PACK_IDS.NEON_DYSTOPIA]: {
    id: THEME_PACK_IDS.NEON_DYSTOPIA,
    name: '霓虹废土',
    icon: '🏙️',
    color: '#ff5252',
    glowColor: 'rgba(255, 82, 82, 0.3)',
    description: '废土之上，霓虹闪耀。在末日中寻找希望之光',
    cardIds: [
      'neon-fool',
      'chrome-chariot',
      'fortune-wheel',
      'matrix-empress',
      'cyber-emperor',
      'hierophant-code',
      'justice-protocol',
      'hanged-bot'
    ],
    rarityWeights: {
      [CARD_RARITY.COMMON]: 55,
      [CARD_RARITY.RARE]: 28,
      [CARD_RARITY.EPIC]: 13,
      [CARD_RARITY.LEGENDARY]: 4
    },
    isDefault: false,
    unlocked: true,
    releaseDate: '2024-10-31',
    bgGradient: 'linear-gradient(135deg, #1a0a0a 0%, #2e1a1a 100%)'
  }
}

export function getAllThemePacks() {
  return Object.values(THEME_PACKS)
}

export function getThemePack(packId) {
  return THEME_PACKS[packId] || null
}

export function getDefaultPack() {
  return Object.values(THEME_PACKS).find(p => p.isDefault) || THEME_PACKS[THEME_PACK_IDS.CORE]
}

export function getPackCards(packId) {
  const pack = getThemePack(packId)
  if (!pack) return []
  return CARDS.filter(card => pack.cardIds.includes(card.id))
}

export function getPackRarityConfig(packId) {
  const pack = getThemePack(packId)
  if (!pack) return RARITY_CONFIG
  
  const customConfig = {}
  Object.entries(RARITY_CONFIG).forEach(([rarity, config]) => {
    customConfig[rarity] = {
      ...config,
      weight: pack.rarityWeights?.[rarity] ?? config.weight
    }
  })
  return customConfig
}

export function getPackStats(packId) {
  const cards = getPackCards(packId)
  const byRarity = {}
  
  Object.values(CARD_RARITY).forEach(rarity => {
    byRarity[rarity] = cards.filter(c => c.rarity === rarity).length
  })
  
  return {
    totalCards: cards.length,
    byRarity,
    cards
  }
}
