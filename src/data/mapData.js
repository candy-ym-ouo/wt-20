import { CARD_RARITY, CARD_CATEGORY } from './constants.js'
import { ACHIEVEMENT_CATEGORY, ACHIEVEMENT_TIER } from './achievements.js'

export const MAP_NODE_TYPE = {
  CARD_MILESTONE: 'card_milestone',
  ACHIEVEMENT: 'achievement',
  HIDDEN_REWARD: 'hidden_reward',
  RARITY_GATE: 'rarity_gate',
  CATEGORY_GATE: 'category_gate',
  BOSS_CHALLENGE: 'boss_challenge',
  CHECKPOINT: 'checkpoint'
}

export const NODE_STATUS = {
  LOCKED: 'locked',
  AVAILABLE: 'available',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
}

export const MAP_PATHS = {
  MAIN: 'main',
  COLLECTOR: 'collector',
  DAILY: 'daily',
  HIDDEN: 'hidden',
  STORY: 'story'
}

export const PATH_CONFIG = {
  [MAP_PATHS.MAIN]: {
    id: MAP_PATHS.MAIN,
    name: '主线 · 数据行者',
    color: '#00e5ff',
    description: '核心抽卡与收集进阶路径',
    icon: '🛤️'
  },
  [MAP_PATHS.COLLECTOR]: {
    id: MAP_PATHS.COLLECTOR,
    name: '分支 · 全知收藏者',
    color: '#69f0ae',
    description: '深度收集与图鉴完善路径',
    icon: '📚'
  },
  [MAP_PATHS.DAILY]: {
    id: MAP_PATHS.DAILY,
    name: '分支 · 每日修行者',
    color: '#ffd54f',
    description: '坚持每日签到的修行路径',
    icon: '🎐'
  },
  [MAP_PATHS.HIDDEN]: {
    id: MAP_PATHS.HIDDEN,
    name: '分支 · 深渊探索者',
    color: '#e040fb',
    description: '隐藏成就与秘密事件路径',
    icon: '🔮'
  },
  [MAP_PATHS.STORY]: {
    id: MAP_PATHS.STORY,
    name: '分支 · 命运编织者',
    color: '#ff5252',
    description: '剧情探索与结局收集路径',
    icon: '📖'
  }
}

export const MAP_NODES = [
  {
    id: 'node_start',
    path: MAP_PATHS.MAIN,
    type: MAP_NODE_TYPE.CHECKPOINT,
    position: { x: 10, y: 50 },
    order: 0,
    name: '启程之地',
    description: '你站在赛博塔罗的入口，命运之门缓缓开启。',
    icon: '🚪',
    requirements: [],
    reward: { type: 'title', value: '初入赛博', description: '解锁起始称号' },
    alwaysVisible: true,
    connectsTo: ['node_draw_1']
  },
  {
    id: 'node_draw_1',
    path: MAP_PATHS.MAIN,
    type: MAP_NODE_TYPE.CARD_MILESTONE,
    position: { x: 22, y: 38 },
    order: 1,
    name: '初遇命运',
    description: '完成你的第一次抽卡，与塔罗建立链接。',
    icon: '🎴',
    requirements: [
      { type: 'total_draws', target: 1, description: '抽卡 1 次' }
    ],
    reward: { type: 'achievement', value: 'achievement_first_draw', description: '解锁成就：初入赛博' },
    connectsTo: ['node_draw_10']
  },
  {
    id: 'node_draw_10',
    path: MAP_PATHS.MAIN,
    type: MAP_NODE_TYPE.CARD_MILESTONE,
    position: { x: 34, y: 55 },
    order: 2,
    name: '数据初探',
    description: '累计抽取10张卡牌，感受数据的流动。',
    icon: '📊',
    requirements: [
      { type: 'total_draws', target: 10, description: '抽卡 10 次' }
    ],
    reward: { type: 'achievement', value: 'achievement_draw_10', description: '解锁成就：命运初探' },
    connectsTo: ['node_rare_first', 'node_category_tech']
  },
  {
    id: 'node_rare_first',
    path: MAP_PATHS.MAIN,
    type: MAP_NODE_TYPE.RARITY_GATE,
    position: { x: 46, y: 35 },
    order: 3,
    name: '稀有之门',
    description: '首次邂逅稀有卡牌，见证数据之美。',
    icon: '💎',
    requirements: [
      { type: 'rarity_count', target: 1, rarity: CARD_RARITY.RARE, description: '获得 1 张稀有卡' }
    ],
    reward: { type: 'points', value: 20, description: '获得 20 成就点数奖励' },
    connectsTo: ['node_draw_50']
  },
  {
    id: 'node_category_tech',
    path: MAP_PATHS.COLLECTOR,
    type: MAP_NODE_TYPE.CATEGORY_GATE,
    position: { x: 46, y: 72 },
    order: 3,
    name: '科技之路',
    description: '收集科技类卡牌，探索技术的边界。',
    icon: '⚡',
    requirements: [
      { type: 'category_count', target: 3, category: CARD_CATEGORY.TECH, description: '收集 3 张科技类卡牌' }
    ],
    reward: { type: 'points', value: 30, description: '获得 30 成就点数奖励' },
    connectsTo: ['node_collector_10']
  },
  {
    id: 'node_draw_50',
    path: MAP_PATHS.MAIN,
    type: MAP_NODE_TYPE.CARD_MILESTONE,
    position: { x: 58, y: 48 },
    order: 4,
    name: '神经链接',
    description: '累计抽取50张卡牌，神经网络深度同步。',
    icon: '🔗',
    requirements: [
      { type: 'total_draws', target: 50, description: '抽卡 50 次' }
    ],
    reward: { type: 'achievement', value: 'achievement_draw_50', description: '解锁成就：数据联结' },
    connectsTo: ['node_epic_first', 'node_daily_7']
  },
  {
    id: 'node_collector_10',
    path: MAP_PATHS.COLLECTOR,
    type: MAP_NODE_TYPE.CARD_MILESTONE,
    position: { x: 58, y: 80 },
    order: 4,
    name: '图鉴初成',
    description: '收集10种不同卡牌，图鉴初步成型。',
    icon: '📖',
    requirements: [
      { type: 'unique_cards', target: 10, description: '收集 10 种不同卡牌' }
    ],
    reward: { type: 'achievement', value: 'achievement_collection_10', description: '解锁成就：初窥门径' },
    connectsTo: ['node_collector_all_cat']
  },
  {
    id: 'node_epic_first',
    path: MAP_PATHS.MAIN,
    type: MAP_NODE_TYPE.RARITY_GATE,
    position: { x: 70, y: 30 },
    order: 5,
    name: '史诗之境',
    description: '首次获得史诗卡牌，力量在你体内涌动。',
    icon: '🌟',
    requirements: [
      { type: 'rarity_count', target: 1, rarity: CARD_RARITY.EPIC, description: '获得 1 张史诗卡' }
    ],
    reward: { type: 'points', value: 50, description: '获得 50 成就点数奖励' },
    connectsTo: ['node_draw_100']
  },
  {
    id: 'node_daily_7',
    path: MAP_PATHS.DAILY,
    type: MAP_NODE_TYPE.CARD_MILESTONE,
    position: { x: 70, y: 62 },
    order: 5,
    name: '七日之约',
    description: '连续7天抽取每日签，持之以恒。',
    icon: '📅',
    requirements: [
      { type: 'consecutive_days', target: 7, description: '连续签到 7 天' }
    ],
    reward: { type: 'achievement', value: 'achievement_daily_7', description: '解锁成就：一周之约' },
    connectsTo: ['node_daily_30']
  },
  {
    id: 'node_collector_all_cat',
    path: MAP_PATHS.COLLECTOR,
    type: MAP_NODE_TYPE.CATEGORY_GATE,
    position: { x: 70, y: 88 },
    order: 5,
    name: '五脉贯通',
    description: '在所有卡牌类别中都有收集。',
    icon: '🖐️',
    requirements: [
      { type: 'all_categories', target: true, description: '每个类别至少 1 张' }
    ],
    reward: { type: 'points', value: 80, description: '获得 80 成就点数奖励' },
    connectsTo: ['node_collector_half']
  },
  {
    id: 'node_draw_100',
    path: MAP_PATHS.MAIN,
    type: MAP_NODE_TYPE.CARD_MILESTONE,
    position: { x: 82, y: 42 },
    order: 6,
    name: '意识融合',
    description: '累计抽取100张卡牌，意识与数据深度融合。',
    icon: '🧠',
    requirements: [
      { type: 'total_draws', target: 100, description: '抽卡 100 次' }
    ],
    reward: { type: 'achievement', value: 'achievement_draw_100', description: '解锁称号：数据行者' },
    connectsTo: ['node_legendary_first', 'node_hidden_first']
  },
  {
    id: 'node_daily_30',
    path: MAP_PATHS.DAILY,
    type: MAP_NODE_TYPE.CARD_MILESTONE,
    position: { x: 82, y: 68 },
    order: 6,
    name: '命运掌控',
    description: '连续30天抽取每日签，命运已在掌握。',
    icon: '👑',
    requirements: [
      { type: 'consecutive_days', target: 30, description: '连续签到 30 天' }
    ],
    reward: { type: 'achievement', value: 'achievement_daily_30', description: '解锁称号：命运掌控者' },
    connectsTo: ['node_daily_100']
  },
  {
    id: 'node_collector_half',
    path: MAP_PATHS.COLLECTOR,
    type: MAP_NODE_TYPE.CARD_MILESTONE,
    position: { x: 82, y: 95 },
    order: 6,
    name: '半卷天书',
    description: '收集半数以上的卡牌，图鉴渐趋完整。',
    icon: '📚',
    requirements: [
      { type: 'unique_cards_ratio', target: 0.5, description: '收集 50% 卡牌' }
    ],
    reward: { type: 'achievement', value: 'achievement_collection_half', description: '解锁成就：半卷天书' },
    connectsTo: ['node_boss_collector']
  },
  {
    id: 'node_legendary_first',
    path: MAP_PATHS.MAIN,
    type: MAP_NODE_TYPE.RARITY_GATE,
    position: { x: 94, y: 25 },
    order: 7,
    name: '传说降临',
    description: '金色数据流涌现，传说卡牌首次现身。',
    icon: '👑',
    requirements: [
      { type: 'rarity_count', target: 1, rarity: CARD_RARITY.LEGENDARY, description: '获得 1 张传说卡' }
    ],
    reward: { type: 'achievement', value: 'achievement_legendary_first', description: '解锁成就：传说初现' },
    connectsTo: ['node_boss_main']
  },
  {
    id: 'node_hidden_first',
    path: MAP_PATHS.HIDDEN,
    type: MAP_NODE_TYPE.HIDDEN_REWARD,
    position: { x: 94, y: 52 },
    order: 7,
    name: '深渊低语',
    description: '数据缝隙中传来神秘呼唤...探索隐藏内容。',
    icon: '🔮',
    requirements: [
      { type: 'hidden_events', target: 1, description: '触发 1 个隐藏事件' }
    ],
    reward: { type: 'points', value: 100, description: '获得 100 成就点数奖励' },
    connectsTo: ['node_hidden_story']
  },
  {
    id: 'node_daily_100',
    path: MAP_PATHS.DAILY,
    type: MAP_NODE_TYPE.BOSS_CHALLENGE,
    position: { x: 94, y: 78 },
    order: 7,
    name: '永恒觉醒',
    description: '百日修行圆满，超越时间界限。',
    icon: '🌅',
    requirements: [
      { type: 'consecutive_days', target: 100, description: '连续签到 100 天' }
    ],
    reward: { type: 'achievement', value: 'achievement_daily_100', description: '解锁称号：永恒觉醒者' },
    connectsTo: []
  },
  {
    id: 'node_boss_collector',
    path: MAP_PATHS.COLLECTOR,
    type: MAP_NODE_TYPE.BOSS_CHALLENGE,
    position: { x: 94, y: 98 },
    order: 7,
    name: '全知视角',
    description: '图鉴大成，通晓所有命运的可能。',
    icon: '🌌',
    requirements: [
      { type: 'unique_cards_ratio', target: 1.0, description: '收集全部卡牌' }
    ],
    reward: { type: 'achievement', value: 'achievement_collection_full', description: '解锁称号：全知者' },
    connectsTo: []
  },
  {
    id: 'node_hidden_story',
    path: MAP_PATHS.STORY,
    type: MAP_NODE_TYPE.HIDDEN_REWARD,
    position: { x: 106, y: 40 },
    order: 8,
    name: '故事开启',
    description: '完成你的第一个剧情事件。',
    icon: '📖',
    requirements: [
      { type: 'completed_stories', target: 1, description: '完成 1 个剧情' }
    ],
    reward: { type: 'achievement', value: 'achievement_story_first', description: '解锁成就：剧情初体验' },
    connectsTo: ['node_story_all_endings']
  },
  {
    id: 'node_boss_main',
    path: MAP_PATHS.MAIN,
    type: MAP_NODE_TYPE.BOSS_CHALLENGE,
    position: { x: 106, y: 18 },
    order: 8,
    name: '量子纠缠',
    description: '500次抽卡达至圆满，命运量子态完全纠缠。',
    icon: '⚛️',
    requirements: [
      { type: 'total_draws', target: 500, description: '抽卡 500 次' }
    ],
    reward: { type: 'achievement', value: 'achievement_draw_500', description: '解锁称号：量子先知' },
    connectsTo: []
  },
  {
    id: 'node_story_all_endings',
    path: MAP_PATHS.STORY,
    type: MAP_NODE_TYPE.BOSS_CHALLENGE,
    position: { x: 118, y: 45 },
    order: 9,
    name: '命运编织者',
    description: '完成任意剧情线的所有结局，编织命运的全部可能。',
    icon: '🎭',
    requirements: [
      { type: 'all_endings_one_story', target: true, description: '完成一条线的所有结局' }
    ],
    reward: { type: 'achievement', value: 'achievement_story_all_endings_one', description: '解锁成就：命运编织者' },
    connectsTo: ['node_story_all']
  },
  {
    id: 'node_story_all',
    path: MAP_PATHS.STORY,
    type: MAP_NODE_TYPE.BOSS_CHALLENGE,
    position: { x: 130, y: 50 },
    order: 10,
    name: '全知叙事者',
    description: '所有剧情线全部完成，你已成为命运的叙事者。',
    icon: '📚',
    requirements: [
      { type: 'all_stories_completed', target: true, description: '完成所有剧情线' }
    ],
    reward: { type: 'achievement', value: 'achievement_story_all', description: '解锁称号：全知叙事者' },
    connectsTo: []
  }
]

export function getNodeById(id) {
  return MAP_NODES.find(n => n.id === id)
}

export function getNodesByPath(pathId) {
  return MAP_NODES.filter(n => n.path === pathId).sort((a, b) => a.order - b.order)
}

export function getStartingNode() {
  return MAP_NODES.find(n => n.order === 0)
}

export function buildPrerequisiteMap() {
  const prereqMap = {}
  MAP_NODES.forEach(node => {
    prereqMap[node.id] = []
  })
  MAP_NODES.forEach(node => {
    if (node.connectsTo && node.connectsTo.length > 0) {
      node.connectsTo.forEach(targetId => {
        if (prereqMap[targetId]) {
          prereqMap[targetId].push(node.id)
        }
      })
    }
  })
  return prereqMap
}

export function getStartingNodes() {
  const prereqMap = buildPrerequisiteMap()
  return MAP_NODES.filter(n => prereqMap[n.id].length === 0)
}
