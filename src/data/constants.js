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

export const CONSECUTIVE_REWARDS = [
  { days: 1, label: '初入赛博', icon: '🎴', bonus: '开启命运之门', color: '#8a8a9a' },
  { days: 3, label: '数据联结', icon: '🔗', bonus: '稀有卡概率提升', color: '#4fc3f7' },
  { days: 7, label: '神经同步', icon: '🧠', bonus: '解锁专属签文解读', color: '#ba68c8' },
  { days: 14, label: '量子纠缠', icon: '⚛️', bonus: '史诗卡概率提升', color: '#e040fb' },
  { days: 30, label: '命运掌控', icon: '👑', bonus: '传说级命运签', color: '#ffd54f' },
  { days: 60, label: '赛博先知', icon: '🔮', bonus: '全知视角解锁', color: '#ff5252' },
  { days: 100, label: '永恒觉醒', icon: '🌌', bonus: '宇宙级命运连接', color: '#69f0ae' }
]

export function getConsecutiveReward(days) {
  let currentReward = CONSECUTIVE_REWARDS[0]
  for (const reward of CONSECUTIVE_REWARDS) {
    if (days >= reward.days) {
      currentReward = reward
    }
  }
  return currentReward
}

export function getNextReward(days) {
  for (const reward of CONSECUTIVE_REWARDS) {
    if (days < reward.days) {
      return reward
    }
  }
  return null
}

export const DIVINATION_THEMES = {
  LOVE: 'love',
  CAREER: 'career',
  WEALTH: 'wealth'
}

export const THEME_CONFIG = {
  [DIVINATION_THEMES.LOVE]: {
    id: 'love',
    name: '情感',
    icon: '💕',
    color: '#e040fb',
    glowColor: 'rgba(224, 64, 251, 0.3)',
    description: '探索爱情与人际关系的奥秘',
    spreadTypes: [
      { id: 'single', name: '单牌指引', positions: ['当下指引'], cardCount: 1 },
      { id: 'three-love', name: '感情三牌', positions: ['过去', '现在', '未来'], cardCount: 3 },
      { id: 'relationship', name: '关系牌阵', positions: ['你的状态', '对方状态', '关系现状', '建议'], cardCount: 4 }
    ]
  },
  [DIVINATION_THEMES.CAREER]: {
    id: 'career',
    name: '事业',
    icon: '💼',
    color: '#00e5ff',
    glowColor: 'rgba(0, 229, 255, 0.3)',
    description: '洞察工作与职业发展方向',
    spreadTypes: [
      { id: 'single', name: '单牌指引', positions: ['当下指引'], cardCount: 1 },
      { id: 'three-career', name: '事业三牌', positions: ['现状', '挑战', '机遇'], cardCount: 3 },
      { id: 'career-path', name: '事业牌阵', positions: ['当前状态', '障碍', '建议', '结果'], cardCount: 4 }
    ]
  },
  [DIVINATION_THEMES.WEALTH]: {
    id: 'wealth',
    name: '财运',
    icon: '💰',
    color: '#ffd54f',
    glowColor: 'rgba(255, 213, 79, 0.3)',
    description: '探寻财富与机遇的流向',
    spreadTypes: [
      { id: 'single', name: '单牌指引', positions: ['当下指引'], cardCount: 1 },
      { id: 'three-wealth', name: '财运三牌', positions: ['收入', '支出', '积累'], cardCount: 3 },
      { id: 'wealth-flow', name: '财富牌阵', positions: ['当前财运', '潜在风险', '最佳时机', '长期趋势'], cardCount: 4 }
    ]
  }
}
