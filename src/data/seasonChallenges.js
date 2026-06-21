import { CARD_RARITY } from './constants.js'

export const SEASON_STATUS = {
  NOT_STARTED: 'not_started',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  EXPIRED: 'expired'
}

export const PHASE_STATUS = {
  LOCKED: 'locked',
  ACTIVE: 'active',
  COMPLETED: 'completed'
}

export const TASK_TYPE = {
  DRAW_COUNT: 'draw_count',
  RARITY_COLLECT: 'rarity_collect',
  HIDDEN_EVENT: 'hidden_event',
  CONSECUTIVE_DAYS: 'consecutive_days',
  CATEGORY_COLLECT: 'category_collect'
}

export const REWARD_TYPE = {
  SEASON_POINTS: 'season_points',
  TITLE: 'title',
  SPECIAL_CARD: 'special_card',
  ACHIEVEMENT: 'achievement'
}

export const SEASON_CONFIG = {
  id: 'season_cyber_awakening_2026_s2',
  name: '赛博觉醒 · 第二赛季',
  subtitle: '数据洪流中的命运交响',
  description: '在霓虹闪烁的赛博空间中，完成命运的卡牌正在等待被唤醒。抽取卡牌，收集稀有数据，触发隐藏事件，解锁赛季专属奖励！',
  icon: '🌌',
  startDate: '2026-06-01',
  endDate: '2026-06-30',
  totalDays: 30,
  totalPoints: 5000
}

export const PHASE_CONFIG = [
  {
    id: 'phase_1',
    name: '数据联结',
    subtitle: '第一阶段',
    description: '建立与赛博空间的初步连接，熟悉命运的数据流。',
    icon: '🔗',
    startDay: 1,
    endDay: 10,
    unlockRequirement: 0,
    color: '#4fc3f7',
    glow: '#0288d1',
    rewards: [
      { type: REWARD_TYPE.TITLE, value: '数据联结者', description: '赛季称号：数据联结者' }
    ]
  },
  {
    id: 'phase_2',
    name: '神经同步',
    subtitle: '第二阶段',
    description: '意识与数据深度同步，感知命运的微妙波动。',
    icon: '🧠',
    startDay: 11,
    endDay: 20,
    unlockRequirement: 500,
    color: '#ba68c8',
    glow: '#7b1fa2',
    rewards: [
      { type: REWARD_TYPE.TITLE, value: '神经共鸣者', description: '赛季称号：神经共鸣者' }
    ]
  },
  {
    id: 'phase_3',
    name: '量子纠缠',
    subtitle: '第三阶段',
    description: '命运量子态完全纠缠，你已触及赛博宇宙的核心真相。',
    icon: '⚛️',
    startDay: 21,
    endDay: 30,
    unlockRequirement: 1500,
    color: '#ffd54f',
    glow: '#ff8f00',
    rewards: [
      { type: REWARD_TYPE.TITLE, value: '量子先知', description: '赛季限定称号：量子先知' },
      { type: REWARD_TYPE.ACHIEVEMENT, value: 'season_master', description: '解锁赛季终极成就' }
    ]
  }
]

export const SEASON_TASKS = [
  {
    id: 'task_p1_draw_20',
    phaseId: 'phase_1',
    name: '命运初探',
    description: '累计抽取20张卡牌，开始感知数据的流向。',
    icon: '🎴',
    type: TASK_TYPE.DRAW_COUNT,
    target: 20,
    points: 100,
    reward: { type: REWARD_TYPE.SEASON_POINTS, value: 100 }
  },
  {
    id: 'task_p1_draw_50',
    phaseId: 'phase_1',
    name: '数据探索者',
    description: '累计抽取50张卡牌，神经网络开始同步。',
    icon: '📊',
    type: TASK_TYPE.DRAW_COUNT,
    target: 50,
    points: 200,
    reward: { type: REWARD_TYPE.SEASON_POINTS, value: 200 }
  },
  {
    id: 'task_p1_rare_5',
    phaseId: 'phase_1',
    name: '稀有猎手',
    description: '收集5张稀有及以上品质的卡牌。',
    icon: '💎',
    type: TASK_TYPE.RARITY_COLLECT,
    target: 5,
    rarity: CARD_RARITY.RARE,
    points: 150,
    reward: { type: REWARD_TYPE.SEASON_POINTS, value: 150 }
  },
  {
    id: 'task_p1_epic_1',
    phaseId: 'phase_1',
    name: '史诗初现',
    description: '首次获得史诗级卡牌，紫色数据流涌现。',
    icon: '🔮',
    type: TASK_TYPE.RARITY_COLLECT,
    target: 1,
    rarity: CARD_RARITY.EPIC,
    points: 200,
    reward: { type: REWARD_TYPE.SEASON_POINTS, value: 200 }
  },
  {
    id: 'task_p1_consecutive_3',
    phaseId: 'phase_1',
    name: '持之以恒',
    description: '连续3天进行每日占卜。',
    icon: '📅',
    type: TASK_TYPE.CONSECUTIVE_DAYS,
    target: 3,
    points: 100,
    reward: { type: REWARD_TYPE.SEASON_POINTS, value: 100 }
  },
  {
    id: 'task_p1_hidden_1',
    phaseId: 'phase_1',
    name: '隐藏探索者',
    description: '触发任意隐藏事件一次。',
    icon: '🔍',
    type: TASK_TYPE.HIDDEN_EVENT,
    target: 1,
    points: 300,
    reward: { type: REWARD_TYPE.SEASON_POINTS, value: 300 }
  },
  {
    id: 'task_p2_draw_100',
    phaseId: 'phase_2',
    name: '神经行者',
    description: '累计抽取100张卡牌，意识深度融合。',
    icon: '🧠',
    type: TASK_TYPE.DRAW_COUNT,
    target: 100,
    points: 300,
    reward: { type: REWARD_TYPE.SEASON_POINTS, value: 300 }
  },
  {
    id: 'task_p2_draw_200',
    phaseId: 'phase_2',
    name: '数据流大师',
    description: '累计抽取200张卡牌，驾驭数据洪流。',
    icon: '🌊',
    type: TASK_TYPE.DRAW_COUNT,
    target: 200,
    points: 500,
    reward: { type: REWARD_TYPE.SEASON_POINTS, value: 500 }
  },
  {
    id: 'task_p2_epic_5',
    phaseId: 'phase_2',
    name: '史诗收藏家',
    description: '收集5张史诗级卡牌。',
    icon: '💜',
    type: TASK_TYPE.RARITY_COLLECT,
    target: 5,
    rarity: CARD_RARITY.EPIC,
    points: 400,
    reward: { type: REWARD_TYPE.SEASON_POINTS, value: 400 }
  },
  {
    id: 'task_p2_legendary_1',
    phaseId: 'phase_2',
    name: '传说初现',
    description: '首次获得传说级卡牌，金色光芒闪耀赛博空间。',
    icon: '👑',
    type: TASK_TYPE.RARITY_COLLECT,
    target: 1,
    rarity: CARD_RARITY.LEGENDARY,
    points: 500,
    reward: { type: REWARD_TYPE.SEASON_POINTS, value: 500 }
  },
  {
    id: 'task_p2_category_all',
    phaseId: 'phase_2',
    name: '全知视角',
    description: '收集所有5个分类的卡牌各至少1张。',
    icon: '👁️',
    type: TASK_TYPE.CATEGORY_COLLECT,
    target: 5,
    points: 300,
    reward: { type: REWARD_TYPE.SEASON_POINTS, value: 300 }
  },
  {
    id: 'task_p2_hidden_3',
    phaseId: 'phase_2',
    name: '秘密追寻者',
    description: '触发3个不同的隐藏事件。',
    icon: '🔮',
    type: TASK_TYPE.HIDDEN_EVENT,
    target: 3,
    points: 500,
    reward: { type: REWARD_TYPE.SEASON_POINTS, value: 500 }
  },
  {
    id: 'task_p2_consecutive_7',
    phaseId: 'phase_2',
    name: '一周之约',
    description: '连续7天进行每日占卜。',
    icon: '🌟',
    type: TASK_TYPE.CONSECUTIVE_DAYS,
    target: 7,
    points: 200,
    reward: { type: REWARD_TYPE.SEASON_POINTS, value: 200 }
  },
  {
    id: 'task_p3_draw_300',
    phaseId: 'phase_3',
    name: '量子纠缠',
    description: '累计抽取300张卡牌，命运量子态完全纠缠。',
    icon: '⚛️',
    type: TASK_TYPE.DRAW_COUNT,
    target: 300,
    points: 600,
    reward: { type: REWARD_TYPE.SEASON_POINTS, value: 600 }
  },
  {
    id: 'task_p3_draw_500',
    phaseId: 'phase_3',
    name: '命运掌控者',
    description: '累计抽取500张卡牌，命运已在你掌握之中。',
    icon: '🌌',
    type: TASK_TYPE.DRAW_COUNT,
    target: 500,
    points: 1000,
    reward: { type: REWARD_TYPE.SEASON_POINTS, value: 1000 }
  },
  {
    id: 'task_p3_legendary_3',
    phaseId: 'phase_3',
    name: '传说收藏家',
    description: '收集3张传说级卡牌。',
    icon: '💛',
    type: TASK_TYPE.RARITY_COLLECT,
    target: 3,
    rarity: CARD_RARITY.LEGENDARY,
    points: 800,
    reward: { type: REWARD_TYPE.SEASON_POINTS, value: 800 }
  },
  {
    id: 'task_p3_legendary_5',
    phaseId: 'phase_3',
    name: '命运宠儿',
    description: '收集5张传说级卡牌，赛博宇宙因你闪耀。',
    icon: '💎',
    type: TASK_TYPE.RARITY_COLLECT,
    target: 5,
    rarity: CARD_RARITY.LEGENDARY,
    points: 1200,
    reward: { type: REWARD_TYPE.SEASON_POINTS, value: 1200 }
  },
  {
    id: 'task_p3_hidden_all',
    phaseId: 'phase_3',
    name: '世界真相',
    description: '触发所有隐藏事件，触及赛博世界的核心。',
    icon: '🌍',
    type: TASK_TYPE.HIDDEN_EVENT,
    target: 5,
    points: 1000,
    reward: { type: REWARD_TYPE.SEASON_POINTS, value: 1000 }
  },
  {
    id: 'task_p3_consecutive_15',
    phaseId: 'phase_3',
    name: '永恒觉醒',
    description: '连续15天进行每日占卜。',
    icon: '🌅',
    type: TASK_TYPE.CONSECUTIVE_DAYS,
    target: 15,
    points: 500,
    reward: { type: REWARD_TYPE.SEASON_POINTS, value: 500 }
  },
  {
    id: 'task_p3_category_master',
    phaseId: 'phase_3',
    name: '终极收藏家',
    description: '每个分类至少收集3张卡牌。',
    icon: '🎯',
    type: TASK_TYPE.CATEGORY_COLLECT,
    target: 15,
    perCategory: 3,
    points: 600,
    reward: { type: REWARD_TYPE.SEASON_POINTS, value: 600 }
  }
]

export function getPhaseById(phaseId) {
  return PHASE_CONFIG.find(p => p.id === phaseId)
}

export function getTasksByPhase(phaseId) {
  return SEASON_TASKS.filter(t => t.phaseId === phaseId)
}

export function getTaskById(taskId) {
  return SEASON_TASKS.find(t => t.id === taskId)
}

export function getCurrentPhase(dayOfSeason) {
  for (let i = PHASE_CONFIG.length - 1; i >= 0; i--) {
    if (dayOfSeason >= PHASE_CONFIG[i].startDay) {
      return PHASE_CONFIG[i]
    }
  }
  return PHASE_CONFIG[0]
}

export function getTotalPoints() {
  return SEASON_TASKS.reduce((sum, task) => sum + task.points, 0)
}

export function getPhasePoints(phaseId) {
  return SEASON_TASKS
    .filter(t => t.phaseId === phaseId)
    .reduce((sum, task) => sum + task.points, 0)
}
