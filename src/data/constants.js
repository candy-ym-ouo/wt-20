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

export const MULTI_SPREAD_TYPES = {
  CROSS: 'cross',
  RELATIONSHIP: 'relationship',
  DECISION: 'decision',
  CELESTIAL: 'celestial',
  ABYSS: 'abyss',
  TEMPORAL: 'temporal'
}

export const MULTI_SPREAD_CONFIG = {
  [MULTI_SPREAD_TYPES.CROSS]: {
    id: 'cross',
    name: '十字阵',
    icon: '✚',
    color: '#e040fb',
    glowColor: 'rgba(224, 64, 251, 0.3)',
    description: '经典十字阵，从四个维度剖析问题核心',
    cardCount: 5,
    special: false,
    positions: [
      { id: 'center', name: '核心', desc: '问题的本质与中心' },
      { id: 'past', name: '过去影响', desc: '过去对现状的影响' },
      { id: 'present', name: '当下状况', desc: '当前的状态与环境' },
      { id: 'future', name: '未来趋势', desc: '可能的发展方向' },
      { id: 'advice', name: '建议指引', desc: '应对的方法与建议' }
    ],
    layout: {
      type: 'cross',
      positions: [
        { key: 'past', row: 1, col: 0 },
        { key: 'present', row: 1, col: 1 },
        { key: 'center', row: 0, col: 1 },
        { key: 'future', row: 1, col: 2 },
        { key: 'advice', row: 2, col: 1 }
      ]
    }
  },
  [MULTI_SPREAD_TYPES.RELATIONSHIP]: {
    id: 'relationship',
    name: '关系阵',
    icon: '💕',
    color: '#ff5252',
    glowColor: 'rgba(255, 82, 82, 0.3)',
    description: '深度洞察人际关系与情感联结',
    cardCount: 4,
    special: false,
    positions: [
      { id: 'self', name: '你的状态', desc: '你在关系中的位置与感受' },
      { id: 'other', name: '对方状态', desc: '对方的想法与感受' },
      { id: 'current', name: '关系现状', desc: '当前关系的实际状态' },
      { id: 'outcome', name: '发展结果', desc: '关系的走向与建议' }
    ],
    layout: {
      type: 'relationship',
      positions: [
        { key: 'self', row: 0, col: 0 },
        { key: 'other', row: 0, col: 1 },
        { key: 'current', row: 1, col: 0 },
        { key: 'outcome', row: 1, col: 1 }
      ]
    }
  },
  [MULTI_SPREAD_TYPES.DECISION]: {
    id: 'decision',
    name: '抉择阵',
    icon: '⚖️',
    color: '#00e5ff',
    glowColor: 'rgba(0, 229, 255, 0.3)',
    description: '辅助两难抉择，看清两种选择的利弊',
    cardCount: 5,
    special: false,
    positions: [
      { id: 'current', name: '当前状况', desc: '你面临的现状' },
      { id: 'choiceA', name: '选择A', desc: '第一个选项的情况' },
      { id: 'resultA', name: 'A的结果', desc: '选择A的可能后果' },
      { id: 'choiceB', name: '选择B', desc: '第二个选项的情况' },
      { id: 'resultB', name: 'B的结果', desc: '选择B的可能后果' }
    ],
    layout: {
      type: 'decision',
      positions: [
        { key: 'current', row: 0, col: 1 },
        { key: 'choiceA', row: 1, col: 0 },
        { key: 'resultA', row: 2, col: 0 },
        { key: 'choiceB', row: 1, col: 2 },
        { key: 'resultB', row: 2, col: 2 }
      ]
    }
  },
  [MULTI_SPREAD_TYPES.CELESTIAL]: {
    id: 'celestial',
    name: '天界阵',
    icon: '☁️',
    color: '#69f0ae',
    glowColor: 'rgba(105, 240, 174, 0.3)',
    description: '天界占卜，探寻人生重大抉择的方向与指引',
    cardCount: 7,
    special: true,
    shopItemId: 'access_celestial_divination',
    positions: [
      { id: 'soul', name: '灵魂深处', desc: '你内心最真实的渴望' },
      { id: 'path', name: '当前道路', desc: '你正在行走的人生路径' },
      { id: 'challenge', name: '天界考验', desc: '你需要面对的挑战' },
      { id: 'wisdom', name: '神圣智慧', desc: '来自高处的指引与智慧' },
      { id: 'destiny', name: '命运指向', desc: '命运为你指引的方向' },
      { id: 'blessing', name: '天界祝福', desc: '你将获得的祝福' },
      { id: 'outcome', name: '最终启示', desc: '最终的答案与启示' }
    ],
    layout: {
      type: 'celestial',
      positions: [
        { key: 'soul', row: 0, col: 1 },
        { key: 'path', row: 1, col: 0 },
        { key: 'challenge', row: 1, col: 1 },
        { key: 'wisdom', row: 1, col: 2 },
        { key: 'destiny', row: 2, col: 0 },
        { key: 'blessing', row: 2, col: 1 },
        { key: 'outcome', row: 2, col: 2 }
      ]
    }
  },
  [MULTI_SPREAD_TYPES.ABYSS]: {
    id: 'abyss',
    name: '深渊阵',
    icon: '🌑',
    color: '#7c4dff',
    glowColor: 'rgba(124, 77, 255, 0.3)',
    description: '深渊占卜，窥探内心最深处的恐惧与渴望',
    cardCount: 9,
    special: true,
    shopItemId: 'access_abyss_divination',
    positions: [
      { id: 'surface', name: '表面意识', desc: '你意识到的表层想法' },
      { id: 'shadow', name: '阴影面', desc: '你不愿面对的自己' },
      { id: 'fear', name: '深层恐惧', desc: '潜藏在内心的恐惧' },
      { id: 'desire', name: '真实渴望', desc: '内心最深处的欲望' },
      { id: 'core', name: '深渊核心', desc: '你真实的本质' },
      { id: 'memory', name: '前世记忆', desc: '过去的印记与执念' },
      { id: 'power', name: '隐藏力量', desc: '你未察觉的潜能' },
      { id: 'guardian', name: '深渊守护', desc: '保护你的黑暗力量' },
      { id: 'transformation', name: '蜕变契机', desc: '转变与重生的机会' }
    ],
    layout: {
      type: 'abyss',
      positions: [
        { key: 'surface', row: 0, col: 2 },
        { key: 'shadow', row: 0, col: 4 },
        { key: 'fear', row: 1, col: 1 },
        { key: 'desire', row: 1, col: 3 },
        { key: 'core', row: 1, col: 5 },
        { key: 'memory', row: 2, col: 0 },
        { key: 'power', row: 2, col: 2 },
        { key: 'guardian', row: 2, col: 4 },
        { key: 'transformation', row: 3, col: 3 }
      ]
    }
  },
  [MULTI_SPREAD_TYPES.TEMPORAL]: {
    id: 'temporal',
    name: '时间阵',
    icon: '⏰',
    color: '#ffab40',
    glowColor: 'rgba(255, 171, 64, 0.3)',
    description: '时间占卜，查看过去、现在、未来的完整时间线',
    cardCount: 12,
    special: true,
    shopItemId: 'access_temporal_divination',
    positions: [
      { id: 'past_root', name: '过去根源', desc: '事情的起源与最初' },
      { id: 'past_development', name: '过去发展', desc: '过去的演变过程' },
      { id: 'past_climax', name: '过去转折', desc: '过去的关键转折点' },
      { id: 'past_end', name: '过去影响', desc: '过去留下的影响' },
      { id: 'present_state', name: '当下状态', desc: '当前的真实状况' },
      { id: 'present_challenge', name: '当下挑战', desc: '你现在面临的问题' },
      { id: 'present_action', name: '当下行动', desc: '你能做的选择' },
      { id: 'present_result', name: '当下影响', desc: '当前行动的影响' },
      { id: 'future_near', name: '近期未来', desc: '即将发生的变化' },
      { id: 'future_develop', name: '中期发展', desc: '未来的发展轨迹' },
      { id: 'future_climax', name: '远期转折', desc: '未来的关键节点' },
      { id: 'future_final', name: '最终结局', desc: '最终的走向与结果' }
    ],
    layout: {
      type: 'temporal',
      positions: [
        { key: 'past_root', row: 0, col: 0 },
        { key: 'past_development', row: 1, col: 0 },
        { key: 'past_climax', row: 2, col: 0 },
        { key: 'past_end', row: 3, col: 0 },
        { key: 'present_state', row: 0, col: 2 },
        { key: 'present_challenge', row: 1, col: 2 },
        { key: 'present_action', row: 2, col: 2 },
        { key: 'present_result', row: 3, col: 2 },
        { key: 'future_near', row: 0, col: 4 },
        { key: 'future_develop', row: 1, col: 4 },
        { key: 'future_climax', row: 2, col: 4 },
        { key: 'future_final', row: 3, col: 4 }
      ]
    }
  }
}

export function getAllMultiSpreads() {
  return Object.values(MULTI_SPREAD_CONFIG)
}

export function getMultiSpreadConfig(spreadId) {
  return MULTI_SPREAD_CONFIG[spreadId] || null
}
