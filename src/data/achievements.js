export const ACHIEVEMENT_TIER = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
  HIDDEN: 'hidden'
}

export const TIER_CONFIG = {
  [ACHIEVEMENT_TIER.COMMON]: {
    label: '普通',
    color: '#8a8a9a',
    glow: '#4a4a6a',
    borderColor: '#5a5a7a',
    points: 10
  },
  [ACHIEVEMENT_TIER.RARE]: {
    label: '稀有',
    color: '#4fc3f7',
    glow: '#0288d1',
    borderColor: '#03a9f4',
    points: 25
  },
  [ACHIEVEMENT_TIER.EPIC]: {
    label: '史诗',
    color: '#ba68c8',
    glow: '#7b1fa2',
    borderColor: '#9c27b0',
    points: 50
  },
  [ACHIEVEMENT_TIER.LEGENDARY]: {
    label: '传说',
    color: '#ffd54f',
    glow: '#ff8f00',
    borderColor: '#ffc107',
    points: 100
  },
  [ACHIEVEMENT_TIER.HIDDEN]: {
    label: '隐藏',
    color: '#e040fb',
    glow: '#aa00ff',
    borderColor: '#d500f9',
    points: 150
  }
}

export const ACHIEVEMENT_CATEGORY = {
  DRAW: 'draw',
  COLLECTION: 'collection',
  DAILY: 'daily',
  HIDDEN: 'hidden',
  SPECIAL: 'special'
}

export const CATEGORY_CONFIG = {
  [ACHIEVEMENT_CATEGORY.DRAW]: { label: '抽卡', icon: '🎴', color: '#00e5ff' },
  [ACHIEVEMENT_CATEGORY.COLLECTION]: { label: '收集', icon: '📚', color: '#69f0ae' },
  [ACHIEVEMENT_CATEGORY.DAILY]: { label: '每日签', icon: '🎐', color: '#ffd54f' },
  [ACHIEVEMENT_CATEGORY.HIDDEN]: { label: '隐藏', icon: '🔮', color: '#e040fb' },
  [ACHIEVEMENT_CATEGORY.SPECIAL]: { label: '特殊', icon: '⭐', color: '#ff5252' }
}

export const ACHIEVEMENTS = [
  {
    id: 'achievement_first_draw',
    name: '初入赛博',
    description: '完成你的第一次抽卡，命运之门已为你开启。',
    icon: '🎴',
    category: ACHIEVEMENT_CATEGORY.DRAW,
    tier: ACHIEVEMENT_TIER.COMMON,
    reward: {
      type: 'title',
      value: '新手预言者',
      description: '解锁称号：新手预言者'
    },
    condition: {
      type: 'total_draws',
      target: 1
    }
  },
  {
    id: 'achievement_draw_10',
    name: '命运初探',
    description: '累计抽取10张卡牌，开始感知数据的流向。',
    icon: '📊',
    category: ACHIEVEMENT_CATEGORY.DRAW,
    tier: ACHIEVEMENT_TIER.COMMON,
    reward: {
      type: 'points',
      value: 50,
      description: '获得50成就点数'
    },
    condition: {
      type: 'total_draws',
      target: 10
    }
  },
  {
    id: 'achievement_draw_50',
    name: '数据联结',
    description: '累计抽取50张卡牌，神经网络开始同步。',
    icon: '🔗',
    category: ACHIEVEMENT_CATEGORY.DRAW,
    tier: ACHIEVEMENT_TIER.RARE,
    reward: {
      type: 'points',
      value: 100,
      description: '获得100成就点数'
    },
    condition: {
      type: 'total_draws',
      target: 50
    }
  },
  {
    id: 'achievement_draw_100',
    name: '神经同步',
    description: '累计抽取100张卡牌，意识与数据深度融合。',
    icon: '🧠',
    category: ACHIEVEMENT_CATEGORY.DRAW,
    tier: ACHIEVEMENT_TIER.EPIC,
    reward: {
      type: 'title',
      value: '数据行者',
      description: '解锁称号：数据行者'
    },
    condition: {
      type: 'total_draws',
      target: 100
    }
  },
  {
    id: 'achievement_draw_500',
    name: '量子纠缠',
    description: '累计抽取500张卡牌，命运量子态完全纠缠。',
    icon: '⚛️',
    category: ACHIEVEMENT_CATEGORY.DRAW,
    tier: ACHIEVEMENT_TIER.LEGENDARY,
    reward: {
      type: 'title',
      value: '量子先知',
      description: '解锁称号：量子先知'
    },
    condition: {
      type: 'total_draws',
      target: 500
    }
  },
  {
    id: 'achievement_legendary_first',
    name: '传说初现',
    description: '首次抽到传说级卡牌，金色数据流在屏幕中涌现。',
    icon: '👑',
    category: ACHIEVEMENT_CATEGORY.DRAW,
    tier: ACHIEVEMENT_TIER.EPIC,
    reward: {
      type: 'points',
      value: 200,
      description: '获得200成就点数'
    },
    condition: {
      type: 'legendary_count',
      target: 1
    }
  },
  {
    id: 'achievement_legendary_5',
    name: '命运宠儿',
    description: '累计抽到5张传说级卡牌，赛博空间因你而闪耀。',
    icon: '💎',
    category: ACHIEVEMENT_CATEGORY.DRAW,
    tier: ACHIEVEMENT_TIER.LEGENDARY,
    reward: {
      type: 'title',
      value: '命运宠儿',
      description: '解锁称号：命运宠儿'
    },
    condition: {
      type: 'legendary_count',
      target: 5
    }
  },
  {
    id: 'achievement_reversed_master',
    name: '逆位大师',
    description: '累计抽到20张逆位卡牌，直面命运的阴影面。',
    icon: '🔄',
    category: ACHIEVEMENT_CATEGORY.DRAW,
    tier: ACHIEVEMENT_TIER.RARE,
    reward: {
      type: 'points',
      value: 150,
      description: '获得150成就点数'
    },
    condition: {
      type: 'reversed_draws',
      target: 20
    }
  },
  {
    id: 'achievement_collection_10',
    name: '初窥门径',
    description: '收集10种不同的卡牌，图鉴初步成型。',
    icon: '📖',
    category: ACHIEVEMENT_CATEGORY.COLLECTION,
    tier: ACHIEVEMENT_TIER.COMMON,
    reward: {
      type: 'points',
      value: 50,
      description: '获得50成就点数'
    },
    condition: {
      type: 'unique_cards',
      target: 10
    }
  },
  {
    id: 'achievement_collection_half',
    name: '半卷天书',
    description: '收集半数以上的卡牌，命运图鉴渐趋完整。',
    icon: '📚',
    category: ACHIEVEMENT_CATEGORY.COLLECTION,
    tier: ACHIEVEMENT_TIER.RARE,
    reward: {
      type: 'points',
      value: 200,
      description: '获得200成就点数'
    },
    condition: {
      type: 'unique_cards_ratio',
      target: 0.5
    }
  },
  {
    id: 'achievement_collection_full',
    name: '全知视角',
    description: '收集全部卡牌，通晓所有命运的可能。',
    icon: '🌌',
    category: ACHIEVEMENT_CATEGORY.COLLECTION,
    tier: ACHIEVEMENT_TIER.LEGENDARY,
    reward: {
      type: 'title',
      value: '全知者',
      description: '解锁称号：全知者'
    },
    condition: {
      type: 'unique_cards_ratio',
      target: 1.0
    }
  },
  {
    id: 'achievement_daily_1',
    name: '命运开启',
    description: '抽取今日的第一支命运签。',
    icon: '🎐',
    category: ACHIEVEMENT_CATEGORY.DAILY,
    tier: ACHIEVEMENT_TIER.COMMON,
    reward: {
      type: 'points',
      value: 20,
      description: '获得20成就点数'
    },
    condition: {
      type: 'daily_draws',
      target: 1
    }
  },
  {
    id: 'achievement_daily_7',
    name: '一周之约',
    description: '连续7天抽取每日命运签，持之以恒。',
    icon: '📅',
    category: ACHIEVEMENT_CATEGORY.DAILY,
    tier: ACHIEVEMENT_TIER.RARE,
    reward: {
      type: 'points',
      value: 150,
      description: '获得150成就点数'
    },
    condition: {
      type: 'consecutive_days',
      target: 7
    }
  },
  {
    id: 'achievement_daily_30',
    name: '命运掌控',
    description: '连续30天抽取每日命运签，命运已在你掌握之中。',
    icon: '👑',
    category: ACHIEVEMENT_CATEGORY.DAILY,
    tier: ACHIEVEMENT_TIER.EPIC,
    reward: {
      type: 'title',
      value: '命运掌控者',
      description: '解锁称号：命运掌控者'
    },
    condition: {
      type: 'consecutive_days',
      target: 30
    }
  },
  {
    id: 'achievement_daily_100',
    name: '永恒觉醒',
    description: '连续100天抽取每日命运签，超越时间的界限。',
    icon: '🌅',
    category: ACHIEVEMENT_CATEGORY.DAILY,
    tier: ACHIEVEMENT_TIER.LEGENDARY,
    reward: {
      type: 'title',
      value: '永恒觉醒者',
      description: '解锁称号：永恒觉醒者'
    },
    condition: {
      type: 'consecutive_days',
      target: 100
    }
  },
  {
    id: 'achievement_hidden_neon_lovers',
    name: '???',
    description: '触发隐藏事件：霓虹恋人的秘密。',
    icon: '❓',
    revealedIcon: '💕',
    revealedName: '霓虹之恋',
    revealedDescription: '数据深渊中，两颗心产生了量子纠缠。你们的命运从此交缠在一起。',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.HIDDEN,
    isHidden: true,
    reward: {
      type: 'title',
      value: '霓虹恋人',
      description: '解锁隐藏称号：霓虹恋人'
    },
    condition: {
      type: 'hidden_event',
      target: 'achievement_hidden_neon_lovers'
    }
  },
  {
    id: 'achievement_hidden_cyber_world',
    name: '???',
    description: '触发隐藏事件：赛博世界的终极奥秘。',
    icon: '❓',
    revealedIcon: '🌍',
    revealedName: '世界之主',
    revealedDescription: '你触及了赛博世界的核心，所有数据向你敞开。世界的真相尽在掌握。',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.HIDDEN,
    isHidden: true,
    reward: {
      type: 'title',
      value: '世界之主',
      description: '解锁隐藏称号：世界之主'
    },
    condition: {
      type: 'hidden_event',
      target: 'achievement_hidden_cyber_world'
    }
  },
  {
    id: 'achievement_hidden_ghost_protocol',
    name: '???',
    description: '触发隐藏事件：幽灵协议激活。',
    icon: '❓',
    revealedIcon: '👻',
    revealedName: '幽灵行者',
    revealedDescription: '你激活了传说中的幽灵协议，在数据的阴影中穿行，无人能察觉你的存在。',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.HIDDEN,
    isHidden: true,
    reward: {
      type: 'title',
      value: '幽灵行者',
      description: '解锁隐藏称号：幽灵行者'
    },
    condition: {
      type: 'hidden_event',
      target: 'achievement_hidden_ghost_protocol'
    }
  },
  {
    id: 'achievement_hidden_legendary_lucky',
    name: '???',
    description: '触发隐藏事件：传说级幸运降临。',
    icon: '❓',
    revealedIcon: '🍀',
    revealedName: '天选之人',
    revealedDescription: '数据洪流中，你是被命运选中的存在。传说级的好运与你同在。',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.HIDDEN,
    isHidden: true,
    reward: {
      type: 'title',
      value: '天选之人',
      description: '解锁隐藏称号：天选之人'
    },
    condition: {
      type: 'hidden_event',
      target: 'achievement_hidden_legendary_lucky'
    }
  },
  {
    id: 'achievement_special_theme_all',
    name: '三维洞察',
    description: '体验所有三种主题占卜（情感、事业、财运）。',
    icon: '🔯',
    category: ACHIEVEMENT_CATEGORY.SPECIAL,
    tier: ACHIEVEMENT_TIER.RARE,
    reward: {
      type: 'points',
      value: 150,
      description: '获得150成就点数'
    },
    condition: {
      type: 'all_themes',
      target: true
    }
  },
  {
    id: 'achievement_special_all_spreads',
    name: '牌阵大师',
    description: '尝试所有不同的牌阵类型。',
    icon: '🎯',
    category: ACHIEVEMENT_CATEGORY.SPECIAL,
    tier: ACHIEVEMENT_TIER.EPIC,
    reward: {
      type: 'points',
      value: 250,
      description: '获得250成就点数'
    },
    condition: {
      type: 'all_spreads',
      target: true
    }
  }
]

export function getAchievementById(id) {
  return ACHIEVEMENTS.find(a => a.id === id)
}

export function getAchievementsByCategory(category) {
  return ACHIEVEMENTS.filter(a => a.category === category)
}

export function getTotalPoints(unlockedIds) {
  return ACHIEVEMENTS.reduce((sum, a) => {
    if (unlockedIds.includes(a.id)) {
      return sum + TIER_CONFIG[a.tier].points
    }
    return sum
  }, 0)
}
