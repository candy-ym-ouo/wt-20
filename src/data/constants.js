export const CARD_RARITY = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
}

export const CARD_CATEGORY = {
  TECH: 'tech',
  NEURAL: 'neural',
  CORP: 'corp',
  CRYPTO: 'crypto',
  MYSTIC: 'mystic'
}

export const RARITY_CONFIG = {
  [CARD_RARITY.COMMON]: {
    label: '普通',
    color: '#8a8a9a',
    glow: '#4a4a6a',
    weight: 60,
    borderColor: '#5a5a7a'
  },
  [CARD_RARITY.RARE]: {
    label: '稀有',
    color: '#4fc3f7',
    glow: '#0288d1',
    weight: 25,
    borderColor: '#03a9f4'
  },
  [CARD_RARITY.EPIC]: {
    label: '史诗',
    color: '#ba68c8',
    glow: '#7b1fa2',
    weight: 12,
    borderColor: '#9c27b0'
  },
  [CARD_RARITY.LEGENDARY]: {
    label: '传说',
    color: '#ffd54f',
    glow: '#ff8f00',
    weight: 3,
    borderColor: '#ffc107'
  }
}

export const CATEGORY_CONFIG = {
  [CARD_CATEGORY.TECH]: { label: '科技', color: '#00e5ff', icon: '⚡' },
  [CARD_CATEGORY.NEURAL]: { label: '神经', color: '#e040fb', icon: '🧠' },
  [CARD_CATEGORY.CORP]: { label: '企业', color: '#ff5252', icon: '🏢' },
  [CARD_CATEGORY.CRYPTO]: { label: '加密', color: '#69f0ae', icon: '🔐' },
  [CARD_CATEGORY.MYSTIC]: { label: '神秘', color: '#ffab40', icon: '✨' }
}
