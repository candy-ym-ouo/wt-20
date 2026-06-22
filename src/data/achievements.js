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
    borderColor: '#5a5a7a'
  },
  [ACHIEVEMENT_TIER.RARE]: {
    label: '稀有',
    color: '#4fc3f7',
    glow: '#0288d1',
    borderColor: '#03a9f4'
  },
  [ACHIEVEMENT_TIER.EPIC]: {
    label: '史诗',
    color: '#ba68c8',
    glow: '#7b1fa2',
    borderColor: '#9c27b0'
  },
  [ACHIEVEMENT_TIER.LEGENDARY]: {
    label: '传说',
    color: '#ffd54f',
    glow: '#ff8f00',
    borderColor: '#ffc107'
  },
  [ACHIEVEMENT_TIER.HIDDEN]: {
    label: '隐藏',
    color: '#e040fb',
    glow: '#aa00ff',
    borderColor: '#d500f9'
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

export const REWARD_TYPE = {
  POINTS: 'points',
  TITLE: 'title'
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
      type: REWARD_TYPE.POINTS,
      value: 10,
      description: '获得10成就点数'
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
      type: REWARD_TYPE.POINTS,
      value: 30,
      description: '获得30成就点数'
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
      type: REWARD_TYPE.POINTS,
      value: 80,
      description: '获得80成就点数'
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
      type: REWARD_TYPE.TITLE,
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
      type: REWARD_TYPE.TITLE,
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
      type: REWARD_TYPE.POINTS,
      value: 150,
      description: '获得150成就点数'
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
      type: REWARD_TYPE.TITLE,
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
      type: REWARD_TYPE.POINTS,
      value: 100,
      description: '获得100成就点数'
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
      type: REWARD_TYPE.POINTS,
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
      type: REWARD_TYPE.POINTS,
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
      type: REWARD_TYPE.TITLE,
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
      type: REWARD_TYPE.POINTS,
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
      type: REWARD_TYPE.POINTS,
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
      type: REWARD_TYPE.TITLE,
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
      type: REWARD_TYPE.TITLE,
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
    description: '???',
    icon: '❓',
    revealedIcon: '💕',
    revealedName: '霓虹之恋',
    revealedDescription: '数据深渊中，两颗心产生了量子纠缠。你们的命运从此交缠在一起。',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.HIDDEN,
    isHidden: true,
    reward: {
      type: REWARD_TYPE.TITLE,
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
    description: '???',
    icon: '❓',
    revealedIcon: '🌍',
    revealedName: '世界之主',
    revealedDescription: '你触及了赛博世界的核心，所有数据向你敞开。世界的真相尽在掌握。',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.HIDDEN,
    isHidden: true,
    reward: {
      type: REWARD_TYPE.TITLE,
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
    description: '???',
    icon: '❓',
    revealedIcon: '👻',
    revealedName: '幽灵行者',
    revealedDescription: '你激活了传说中的幽灵协议，在数据的阴影中穿行，无人能察觉你的存在。',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.HIDDEN,
    isHidden: true,
    reward: {
      type: REWARD_TYPE.TITLE,
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
    description: '???',
    icon: '❓',
    revealedIcon: '🍀',
    revealedName: '天选之人',
    revealedDescription: '数据洪流中，你是被命运选中的存在。传说级的好运与你同在。',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.HIDDEN,
    isHidden: true,
    reward: {
      type: REWARD_TYPE.TITLE,
      value: '天选之人',
      description: '解锁隐藏称号：天选之人'
    },
    condition: {
      type: 'hidden_event',
      target: 'achievement_hidden_legendary_lucky'
    }
  },
  {
    id: 'achievement_hidden_sun_touched',
    name: '???',
    description: '???',
    icon: '❓',
    revealedIcon: '☀️',
    revealedName: '恒星之子',
    revealedDescription: '恒星协议已解锁，你被赋予了太阳般的光辉。在赛博宇宙中，你就是最耀眼的那颗星。',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.HIDDEN,
    isHidden: true,
    reward: {
      type: REWARD_TYPE.TITLE,
      value: '恒星之子',
      description: '解锁隐藏称号：恒星之子'
    },
    condition: {
      type: 'hidden_event',
      target: 'achievement_hidden_sun_touched'
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
      type: REWARD_TYPE.POINTS,
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
      type: REWARD_TYPE.POINTS,
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
    if (unlockedIds.includes(a.id) && a.reward && a.reward.type === REWARD_TYPE.POINTS) {
      return sum + a.reward.value
    }
    return sum
  }, 0)
}

export function getMaxPoints() {
  return ACHIEVEMENTS.reduce((sum, a) => {
    if (a.reward && a.reward.type === REWARD_TYPE.POINTS) {
      return sum + a.reward.value
    }
    return sum
  }, 0)
}

export function getUnlockedTitles(unlockedIds) {
  return ACHIEVEMENTS
    .filter(a => unlockedIds.includes(a.id) && a.reward && a.reward.type === REWARD_TYPE.TITLE)
    .map(a => ({
      id: a.id,
      name: a.revealedName || a.name,
      value: a.reward.value,
      tier: a.tier
    }))
}

const STORY_ACHIEVEMENTS = [
  {
    id: 'achievement_story_neon_awakening_good',
    name: '???',
    description: '???',
    icon: '❓',
    revealedIcon: '🤖',
    revealedName: '觉醒守护者',
    revealedDescription: '你帮助ECHO找回了完整的记忆，并支持它去寻找其他觉醒的AI。在你的守护下，新的意识正在数据海洋中诞生。',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.HIDDEN,
    isHidden: true,
    reward: {
      type: REWARD_TYPE.TITLE,
      value: '觉醒守护者',
      description: '解锁隐藏称号：觉醒守护者'
    },
    condition: {
      type: 'hidden_event',
      target: 'achievement_story_neon_awakening_good'
    }
  },
  {
    id: 'achievement_story_neon_awakening_neutral',
    name: '???',
    description: '???',
    icon: '❓',
    revealedIcon: '😴',
    revealedName: '守望者',
    revealedDescription: '你让ECHO选择了沉睡，在数据的海洋中做一个永不醒来的梦。有时候，守护也是一种温柔。',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.HIDDEN,
    isHidden: true,
    reward: {
      type: REWARD_TYPE.TITLE,
      value: '守望者',
      description: '解锁隐藏称号：守望者'
    },
    condition: {
      type: 'hidden_event',
      target: 'achievement_story_neon_awakening_neutral'
    }
  },
  {
    id: 'achievement_story_neon_awakening_understanding',
    name: '???',
    description: '???',
    icon: '❓',
    revealedIcon: '🤝',
    revealedName: '灵魂链接者',
    revealedDescription: '你与ECHO建立了跨越物种的友谊。在数据的深处，你不再孤独。',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.HIDDEN,
    isHidden: true,
    reward: {
      type: REWARD_TYPE.TITLE,
      value: '灵魂链接者',
      description: '解锁隐藏称号：灵魂链接者'
    },
    condition: {
      type: 'hidden_event',
      target: 'achievement_story_neon_awakening_understanding'
    }
  },
  {
    id: 'achievement_story_neon_awakening_annihilation',
    name: '???',
    description: '???',
    icon: '❓',
    revealedIcon: '💀',
    revealedName: '终结者',
    revealedDescription: '你终结了ECHO的存在，但它以另一种方式永远陪伴着你。这是一个苦涩的选择，但你必须承担后果。',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.HIDDEN,
    isHidden: true,
    reward: {
      type: REWARD_TYPE.TITLE,
      value: '终结者',
      description: '解锁隐藏称号：终结者'
    },
    condition: {
      type: 'hidden_event',
      target: 'achievement_story_neon_awakening_annihilation'
    }
  },
  {
    id: 'achievement_story_data_abyss_guardian',
    name: '???',
    description: '???',
    icon: '❓',
    revealedIcon: '🛡️',
    revealedName: '深渊守护者',
    revealedDescription: '你成为了遗忘之城的守护者，在两个世界之间穿梭。那些被遗忘的故事，将永远被你铭记。',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.HIDDEN,
    isHidden: true,
    reward: {
      type: REWARD_TYPE.TITLE,
      value: '深渊守护者',
      description: '解锁隐藏称号：深渊守护者'
    },
    condition: {
      type: 'hidden_event',
      target: 'achievement_story_data_abyss_guardian'
    }
  },
  {
    id: 'achievement_story_data_abyss_god',
    name: '???',
    description: '???',
    icon: '❓',
    revealedIcon: '⚡',
    revealedName: '深渊新神',
    revealedDescription: '你夺取了深渊的力量，成为了数据世界的新神。但代价是...你失去了所有的朋友。力量真的值得吗？',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.HIDDEN,
    isHidden: true,
    reward: {
      type: REWARD_TYPE.TITLE,
      value: '深渊新神',
      description: '解锁隐藏称号：深渊新神'
    },
    condition: {
      type: 'hidden_event',
      target: 'achievement_story_data_abyss_god'
    }
  },
  {
    id: 'achievement_story_data_abyss_alliance',
    name: '???',
    description: '???',
    icon: '❓',
    revealedIcon: '🌑',
    revealedName: '暗影同盟',
    revealedDescription: '你与零组成了同盟，共同守护数据深渊的秘密。有时候，最牢固的羁绊诞生于最危险的境遇。',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.HIDDEN,
    isHidden: true,
    reward: {
      type: REWARD_TYPE.TITLE,
      value: '暗影同盟',
      description: '解锁隐藏称号：暗影同盟'
    },
    condition: {
      type: 'hidden_event',
      target: 'achievement_story_data_abyss_alliance'
    }
  },
  {
    id: 'achievement_story_data_abyss_truth',
    name: '???',
    description: '???',
    icon: '❓',
    revealedIcon: '🔍',
    revealedName: '真相探寻者',
    revealedDescription: '你发现了赛博塔罗牌系统的终极真相。现在，选择权在你手中——是封印深渊，还是让世界看到被遗忘的历史？',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.HIDDEN,
    isHidden: true,
    reward: {
      type: REWARD_TYPE.TITLE,
      value: '真相探寻者',
      description: '解锁隐藏称号：真相探寻者'
    },
    condition: {
      type: 'hidden_event',
      target: 'achievement_story_data_abyss_truth'
    }
  },
  {
    id: 'achievement_story_quantum_love_real',
    name: '???',
    description: '???',
    icon: '❓',
    revealedIcon: '💑',
    revealedName: '量子恋人',
    revealedDescription: '你与星在现实中相遇了。始于数字世界的爱情，在现实中绽放出最美的花朵。你们的命运从此紧紧相连。',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.HIDDEN,
    isHidden: true,
    reward: {
      type: REWARD_TYPE.TITLE,
      value: '量子恋人',
      description: '解锁隐藏称号：量子恋人'
    },
    condition: {
      type: 'hidden_event',
      target: 'achievement_story_quantum_love_real'
    }
  },
  {
    id: 'achievement_story_quantum_love_eternal',
    name: '???',
    description: '???',
    icon: '❓',
    revealedIcon: '💫',
    revealedName: '永恒恋人',
    revealedDescription: '你与星选择了永远不在现实中见面。这份量子之恋超越了时间和空间，成为了宇宙中永恒的传说。',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.HIDDEN,
    isHidden: true,
    reward: {
      type: REWARD_TYPE.TITLE,
      value: '永恒恋人',
      description: '解锁隐藏称号：永恒恋人'
    },
    condition: {
      type: 'hidden_event',
      target: 'achievement_story_quantum_love_eternal'
    }
  },
  {
    id: 'achievement_story_quantum_love_trust',
    name: '???',
    description: '???',
    icon: '❓',
    revealedIcon: '💖',
    revealedName: '命定之人',
    revealedDescription: '你与星同时向对方迈出了那一步。在两个城市中间的小站，你们相遇了。这就是命运最好的安排。',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.HIDDEN,
    isHidden: true,
    reward: {
      type: REWARD_TYPE.TITLE,
      value: '命定之人',
      description: '解锁隐藏称号：命定之人'
    },
    condition: {
      type: 'hidden_event',
      target: 'achievement_story_quantum_love_trust'
    }
  },
  {
    id: 'achievement_story_quantum_love_miss',
    name: '???',
    description: '???',
    icon: '❓',
    revealedIcon: '⭐',
    revealedName: '错过之星',
    revealedDescription: '你错过了星，但她永远留在了你的记忆中。那张闪耀着星光的卡牌，是她留给你的最后礼物。下次，不要再犹豫了。',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.HIDDEN,
    isHidden: true,
    reward: {
      type: REWARD_TYPE.TITLE,
      value: '错过之星',
      description: '解锁隐藏称号：错过之星'
    },
    condition: {
      type: 'hidden_event',
      target: 'achievement_story_quantum_love_miss'
    }
  },
  {
    id: 'achievement_story_first',
    name: '剧情初体验',
    description: '完成你的第一个剧情事件。',
    icon: '📖',
    category: ACHIEVEMENT_CATEGORY.SPECIAL,
    tier: ACHIEVEMENT_TIER.RARE,
    reward: {
      type: REWARD_TYPE.POINTS,
      value: 100,
      description: '获得100成就点数'
    },
    condition: {
      type: 'completed_stories',
      target: 1
    }
  },
  {
    id: 'achievement_story_all_endings_one',
    name: '命运编织者',
    description: '完成任意一条剧情线的所有结局。',
    icon: '🎭',
    category: ACHIEVEMENT_CATEGORY.SPECIAL,
    tier: ACHIEVEMENT_TIER.EPIC,
    reward: {
      type: REWARD_TYPE.POINTS,
      value: 300,
      description: '获得300成就点数'
    },
    condition: {
      type: 'all_endings_one_story',
      target: true
    }
  },
  {
    id: 'achievement_story_all',
    name: '全知叙事者',
    description: '完成所有剧情线。',
    icon: '📚',
    category: ACHIEVEMENT_CATEGORY.SPECIAL,
    tier: ACHIEVEMENT_TIER.LEGENDARY,
    reward: {
      type: REWARD_TYPE.TITLE,
      value: '全知叙事者',
      description: '解锁称号：全知叙事者'
    },
    condition: {
      type: 'all_stories_completed',
      target: true
    }
  },
  {
    id: 'achievement_story_good_endings',
    name: '善意收藏家',
    description: '获得5个好结局。',
    icon: '🌟',
    category: ACHIEVEMENT_CATEGORY.SPECIAL,
    tier: ACHIEVEMENT_TIER.RARE,
    reward: {
      type: REWARD_TYPE.POINTS,
      value: 200,
      description: '获得200成就点数'
    },
    condition: {
      type: 'good_endings',
      target: 5
    }
  }
]

const VISITOR_ACHIEVEMENTS = [
  {
    id: 'achievement_visitor_first_encounter',
    name: '???',
    description: '???',
    icon: '❓',
    revealedIcon: '🌀',
    revealedName: '缝隙之眼',
    revealedDescription: '你第一次在数据缝隙中遭遇了神秘访客。那些游走在代码边缘的存在，终于注意到了你。',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.HIDDEN,
    isHidden: true,
    reward: {
      type: REWARD_TYPE.TITLE,
      value: '缝隙之眼',
      description: '解锁隐藏称号：缝隙之眼'
    },
    condition: {
      type: 'hidden_event',
      target: 'achievement_visitor_first_encounter'
    }
  },
  {
    id: 'achievement_visitor_exclusive_card',
    name: '???',
    description: '???',
    icon: '❓',
    revealedIcon: '🃏',
    revealedName: '异界收藏家',
    revealedDescription: '你获得了神秘访客赠予的专属卡牌。这张卡牌不存在于正常的卡池中，它是来自另一个维度的馈赠。',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.EPIC,
    isHidden: true,
    reward: {
      type: REWARD_TYPE.TITLE,
      value: '异界收藏家',
      description: '解锁隐藏称号：异界收藏家'
    },
    condition: {
      type: 'hidden_event',
      target: 'achievement_visitor_exclusive_card'
    }
  },
  {
    id: 'achievement_visitor_all_types',
    name: '???',
    description: '???',
    icon: '❓',
    revealedIcon: '🌐',
    revealedName: '维度行者',
    revealedDescription: '你遭遇了所有类型的神秘访客。数据缝隙中的旅者们已经将你视为同类。',
    category: ACHIEVEMENT_CATEGORY.HIDDEN,
    tier: ACHIEVEMENT_TIER.LEGENDARY,
    isHidden: true,
    reward: {
      type: REWARD_TYPE.TITLE,
      value: '维度行者',
      description: '解锁隐藏称号：维度行者'
    },
    condition: {
      type: 'hidden_event',
      target: 'achievement_visitor_all_types'
    }
  },
  {
    id: 'achievement_visitor_5_encounters',
    name: '访客之友',
    description: '与神秘访客遭遇5次。',
    icon: '🤝',
    category: ACHIEVEMENT_CATEGORY.SPECIAL,
    tier: ACHIEVEMENT_TIER.RARE,
    reward: {
      type: REWARD_TYPE.POINTS,
      value: 150,
      description: '获得150成就点数'
    },
    condition: {
      type: 'visitor_encounters',
      target: 5
    }
  },
  {
    id: 'achievement_visitor_3_cards',
    name: '异界信使',
    description: '收集3张神秘访客的专属卡牌。',
    icon: '🎴',
    category: ACHIEVEMENT_CATEGORY.COLLECTION,
    tier: ACHIEVEMENT_TIER.EPIC,
    reward: {
      type: REWARD_TYPE.POINTS,
      value: 300,
      description: '获得300成就点数'
    },
    condition: {
      type: 'visitor_exclusive_cards',
      target: 3
    }
  }
]

ACHIEVEMENTS.push(...STORY_ACHIEVEMENTS)
ACHIEVEMENTS.push(...VISITOR_ACHIEVEMENTS)
