export const SHOP_ITEM_TYPE = {
  SKIN: 'skin',
  CARD_BACK: 'card_back',
  ANIMATION: 'animation',
  DIVINATION_ACCESS: 'divination_access',
  SPECIAL_TITLE: 'special_title',
  CARD_BORDER: 'card_border'
}

export const ITEM_TYPE_CONFIG = {
  [SHOP_ITEM_TYPE.SKIN]: {
    label: '卡牌皮肤',
    icon: '🎨',
    color: '#e040fb'
  },
  [SHOP_ITEM_TYPE.CARD_BACK]: {
    label: '卡背设计',
    icon: '🃏',
    color: '#00e5ff'
  },
  [SHOP_ITEM_TYPE.ANIMATION]: {
    label: '抽卡动效',
    icon: '✨',
    color: '#ffd54f'
  },
  [SHOP_ITEM_TYPE.DIVINATION_ACCESS]: {
    label: '特殊占卜',
    icon: '🔮',
    color: '#69f0ae'
  },
  [SHOP_ITEM_TYPE.SPECIAL_TITLE]: {
    label: '专属称号',
    icon: '👑',
    color: '#ff5252'
  },
  [SHOP_ITEM_TYPE.CARD_BORDER]: {
    label: '卡牌边框',
    icon: '💎',
    color: '#ffab40'
  }
}

export const SHOP_ITEM_RARITY = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
}

export const RARITY_CONFIG = {
  [SHOP_ITEM_RARITY.COMMON]: {
    label: '普通',
    color: '#8a8a9a',
    glow: '#4a4a6a'
  },
  [SHOP_ITEM_RARITY.RARE]: {
    label: '稀有',
    color: '#4fc3f7',
    glow: '#0288d1'
  },
  [SHOP_ITEM_RARITY.EPIC]: {
    label: '史诗',
    color: '#ba68c8',
    glow: '#7b1fa2'
  },
  [SHOP_ITEM_RARITY.LEGENDARY]: {
    label: '传说',
    color: '#ffd54f',
    glow: '#ff8f00'
  }
}

export const SHOP_ITEMS = [
  {
    id: 'skin_neon_rain',
    name: '霓虹雨滴',
    description: '赛博朋克风格的卡牌皮肤，闪烁着霓虹雨滴效果。',
    icon: '🌧️',
    type: SHOP_ITEM_TYPE.SKIN,
    rarity: SHOP_ITEM_RARITY.RARE,
    price: 200,
    preview: {
      color: '#00e5ff',
      effect: 'neon_rain'
    },
    limited: false,
    tag: '经典'
  },
  {
    id: 'skin_cyber_sakura',
    name: '电子樱花',
    description: '融合传统与未来的樱花主题皮肤，飘落的数据樱花瓣。',
    icon: '🌸',
    type: SHOP_ITEM_TYPE.SKIN,
    rarity: SHOP_ITEM_RARITY.EPIC,
    price: 500,
    preview: {
      color: '#e040fb',
      effect: 'sakura_particles'
    },
    limited: false,
    tag: '推荐'
  },
  {
    id: 'skin_quantum_void',
    name: '量子虚空',
    description: '来自数据深渊的神秘皮肤，虚空能量在卡牌边缘流动。',
    icon: '🕳️',
    type: SHOP_ITEM_TYPE.SKIN,
    rarity: SHOP_ITEM_RARITY.LEGENDARY,
    price: 1200,
    preview: {
      color: '#7c4dff',
      effect: 'void_energy'
    },
    limited: true,
    tag: '限定'
  },
  {
    id: 'skin_solar_flare',
    name: '恒星耀斑',
    description: '炽热的太阳能量主题，金色光芒从卡牌中心散发。',
    icon: '☀️',
    type: SHOP_ITEM_TYPE.SKIN,
    rarity: SHOP_ITEM_RARITY.LEGENDARY,
    price: 1500,
    preview: {
      color: '#ffd54f',
      effect: 'solar_rays'
    },
    limited: true,
    tag: '限定'
  },
  {
    id: 'cardback_digital_hex',
    name: '数字六角',
    description: '经典的六边形几何图案，科技感十足的卡背设计。',
    icon: '⬡',
    type: SHOP_ITEM_TYPE.CARD_BACK,
    rarity: SHOP_ITEM_RARITY.COMMON,
    price: 100,
    preview: {
      pattern: 'hex_grid',
      color: '#00e5ff'
    },
    limited: false,
    tag: '经典'
  },
  {
    id: 'cardback_circuit_board',
    name: '电路板',
    description: '精密的电路板纹路，数据流在卡背上流转。',
    icon: '🔲',
    type: SHOP_ITEM_TYPE.CARD_BACK,
    rarity: SHOP_ITEM_RARITY.RARE,
    price: 250,
    preview: {
      pattern: 'circuit',
      color: '#69f0ae'
    },
    limited: false,
    tag: '科技'
  },
  {
    id: 'cardback_mystic_runes',
    name: '神秘符文',
    description: '古老的符文与现代编码的完美融合，散发神秘光芒。',
    icon: '🔯',
    type: SHOP_ITEM_TYPE.CARD_BACK,
    rarity: SHOP_ITEM_RARITY.EPIC,
    price: 600,
    preview: {
      pattern: 'runes',
      color: '#e040fb'
    },
    limited: false,
    tag: '神秘'
  },
  {
    id: 'cardback_starry_night',
    name: '星夜苍穹',
    description: '深邃的宇宙星图，每颗星星都是一个数据节点。',
    icon: '🌌',
    type: SHOP_ITEM_TYPE.CARD_BACK,
    rarity: SHOP_ITEM_RARITY.LEGENDARY,
    price: 1000,
    preview: {
      pattern: 'stars',
      color: '#1a1a3a'
    },
    limited: true,
    tag: '限定'
  },
  {
    id: 'animation_neon_burst',
    name: '霓虹爆发',
    description: '抽卡时霓虹色彩从中心爆发，炫酷无比。',
    icon: '💥',
    type: SHOP_ITEM_TYPE.ANIMATION,
    rarity: SHOP_ITEM_RARITY.RARE,
    price: 300,
    preview: {
      effect: 'neon_burst',
      color: '#00e5ff'
    },
    limited: false,
    tag: '炫酷'
  },
  {
    id: 'animation_quantum_teleport',
    name: '量子传送',
    description: '卡牌通过量子纠缠效果显现，科技感拉满。',
    icon: '⚡',
    type: SHOP_ITEM_TYPE.ANIMATION,
    rarity: SHOP_ITEM_RARITY.EPIC,
    price: 550,
    preview: {
      effect: 'quantum_teleport',
      color: '#7c4dff'
    },
    limited: false,
    tag: '科技'
  },
  {
    id: 'animation_crystal_shatter',
    name: '水晶碎裂',
    description: '水晶碎裂效果，卡牌从晶片中缓缓浮现。',
    icon: '💎',
    type: SHOP_ITEM_TYPE.ANIMATION,
    rarity: SHOP_ITEM_RARITY.EPIC,
    price: 650,
    preview: {
      effect: 'crystal_shatter',
      color: '#e040fb'
    },
    limited: false,
    tag: '华丽'
  },
  {
    id: 'animation_phoenix_rebirth',
    name: '凤凰涅槃',
    description: '传说级抽卡动效，火焰凤凰涅槃重生，卡牌随之显现。',
    icon: '🔥',
    type: SHOP_ITEM_TYPE.ANIMATION,
    rarity: SHOP_ITEM_RARITY.LEGENDARY,
    price: 1800,
    preview: {
      effect: 'phoenix_rebirth',
      color: '#ff5252'
    },
    limited: true,
    tag: '传说'
  },
  {
    id: 'access_celestial_divination',
    name: '天界占卜',
    description: '解锁天界占卜模式，可询问关于人生重大抉择的问题。',
    icon: '☁️',
    type: SHOP_ITEM_TYPE.DIVINATION_ACCESS,
    rarity: SHOP_ITEM_RARITY.EPIC,
    price: 800,
    preview: {
      spread: 'celestial',
      cardCount: 7
    },
    limited: false,
    tag: '高阶'
  },
  {
    id: 'access_abyss_divination',
    name: '深渊占卜',
    description: '解锁深渊占卜模式，窥探内心最深处的恐惧与渴望。',
    icon: '🌑',
    type: SHOP_ITEM_TYPE.DIVINATION_ACCESS,
    rarity: SHOP_ITEM_RARITY.LEGENDARY,
    price: 1500,
    preview: {
      spread: 'abyss',
      cardCount: 9
    },
    limited: true,
    tag: '限定'
  },
  {
    id: 'access_temporal_divination',
    name: '时间占卜',
    description: '解锁时间占卜模式，查看过去、现在、未来的完整时间线。',
    icon: '⏰',
    type: SHOP_ITEM_TYPE.DIVINATION_ACCESS,
    rarity: SHOP_ITEM_RARITY.LEGENDARY,
    price: 2000,
    preview: {
      spread: 'temporal',
      cardCount: 12
    },
    limited: true,
    tag: '传说'
  },
  {
    id: 'title_fate_weaver',
    name: '命运编织者',
    description: '专属称号，展示你对命运的深刻理解。',
    icon: '🧵',
    type: SHOP_ITEM_TYPE.SPECIAL_TITLE,
    rarity: SHOP_ITEM_RARITY.EPIC,
    price: 400,
    preview: {
      title: '命运编织者',
      color: '#e040fb'
    },
    limited: false,
    tag: '称号'
  },
  {
    id: 'title_data_sorcerer',
    name: '数据术士',
    description: '专属称号，证明你是数据海洋中的强大术士。',
    icon: '🧙',
    type: SHOP_ITEM_TYPE.SPECIAL_TITLE,
    rarity: SHOP_ITEM_RARITY.EPIC,
    price: 400,
    preview: {
      title: '数据术士',
      color: '#00e5ff'
    },
    limited: false,
    tag: '称号'
  },
  {
    id: 'title_eternal_seer',
    name: '永恒先知',
    description: '传说级专属称号，只有真正的命运大师才能拥有。',
    icon: '👁️',
    type: SHOP_ITEM_TYPE.SPECIAL_TITLE,
    rarity: SHOP_ITEM_RARITY.LEGENDARY,
    price: 2500,
    preview: {
      title: '永恒先知',
      color: '#ffd54f'
    },
    limited: true,
    tag: '传说'
  },
  {
    id: 'border_pulse_cyan',
    name: '脉冲青蓝',
    description: '跳动的青蓝色能量边框，让你的卡牌充满活力。',
    icon: '💫',
    type: SHOP_ITEM_TYPE.CARD_BORDER,
    rarity: SHOP_ITEM_RARITY.RARE,
    price: 250,
    preview: {
      color: '#00e5ff',
      style: 'pulse'
    },
    limited: false,
    tag: '边框'
  },
  {
    id: 'border_rainbow_glow',
    name: '彩虹光晕',
    description: '流动的彩虹色边框，每一秒都呈现不同的色彩。',
    icon: '🌈',
    type: SHOP_ITEM_TYPE.CARD_BORDER,
    rarity: SHOP_ITEM_RARITY.EPIC,
    price: 700,
    preview: {
      color: 'rainbow',
      style: 'rainbow_flow'
    },
    limited: true,
    tag: '限定'
  },
  {
    id: 'border_golden_dragon',
    name: '金龙盘旋',
    description: '传说级边框，金色巨龙在卡牌边缘盘旋守护。',
    icon: '🐉',
    type: SHOP_ITEM_TYPE.CARD_BORDER,
    rarity: SHOP_ITEM_RARITY.LEGENDARY,
    price: 2200,
    preview: {
      color: '#ffd54f',
      style: 'dragon_dance'
    },
    limited: true,
    tag: '传说'
  }
]

export function getShopItemById(id) {
  return SHOP_ITEMS.find(item => item.id === id)
}

export function getShopItemsByType(type) {
  return SHOP_ITEMS.filter(item => item.type === type)
}

export function getShopItemsByRarity(rarity) {
  return SHOP_ITEMS.filter(item => item.rarity === rarity)
}

export function getLimitedItems() {
  return SHOP_ITEMS.filter(item => item.limited)
}

export function getFeaturedItems() {
  return SHOP_ITEMS.filter(item => item.tag === '推荐' || item.tag === '限定' || item.tag === '传说')
    .sort((a, b) => {
      const order = { '传说': 0, '限定': 1, '推荐': 2 }
      return (order[a.tag] || 3) - (order[b.tag] || 3)
    })
    .slice(0, 4)
}
