export const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: '欢迎来到赛博塔罗',
    subtitle: '◆ 命运数据流已连接 ◆',
    icon: '🌌',
    content: '在这个霓虹闪烁的赛博世界里，古老的塔罗牌与先进的科技融为一体。每一次抽卡，都是你与命运数据的深度对话。',
    highlight: '你的选择，将改写命运的代码。',
    buttonText: '开始探索',
    type: 'intro'
  },
  {
    id: 'world-lore',
    title: '世界观：数据深渊',
    subtitle: '◆ 赛博塔罗的起源 ◆',
    icon: '📖',
    content: '2077年，人类意识与神经网络深度融合。一群神秘的数据考古学家发现，在网络最深处——数据深渊中，沉睡着古老的命运算法。',
    lore: [
      { title: '霓虹觉醒', desc: '当第一张赛博塔罗牌被创造出来时，整个网络都为之震颤。' },
      { title: '命运数据化', desc: '古老的占卜艺术被编码进量子算法，抽卡成为与命运对话的方式。' },
      { title: '隐藏的真相', desc: '据说，收集所有卡牌的人，将能窥见数据深渊的终极秘密。' }
    ],
    buttonText: '了解更多',
    type: 'lore'
  },
  {
    id: 'first-draw',
    title: '首次抽卡',
    subtitle: '◆ 命运的第一张牌 ◆',
    icon: '🎴',
    content: '准备好了吗？让我们进行你的第一次抽卡。这张牌将揭示你与赛博塔罗的初始连接，也可能触发隐藏的事件...',
    hint: '提示：某些特殊卡牌拥有隐藏事件，首次抽到可能解锁秘密！',
    buttonText: '开始抽卡',
    type: 'action',
    action: 'firstDraw'
  },
  {
    id: 'collection-unlock',
    title: '收藏系统已解锁',
    subtitle: '◆ 图鉴系统启动 ◆',
    icon: '📚',
    content: '恭喜！你已经解锁了收藏系统。每一张抽到的卡牌都会被记录在你的图鉴中。',
    features: [
      { icon: '🃏', title: '卡牌图鉴', desc: '收集所有赛博塔罗牌，解锁完整图鉴' },
      { icon: '📊', title: '抽卡统计', desc: '追踪你的抽卡历史和稀有度分布' },
      { icon: '🏆', title: '成就系统', desc: '完成挑战，解锁隐藏称号' }
    ],
    buttonText: '继续',
    type: 'feature'
  },
  {
    id: 'hidden-events',
    title: '隐藏事件',
    subtitle: '◆ 秘密等待发现 ◆',
    icon: '🔮',
    content: '在赛博塔罗的世界里，藏着许多不为人知的秘密。某些特定的卡牌组合、抽卡次数，甚至是时间，都可能触发隐藏事件。',
    tips: [
      '💡 某些传说级卡牌有专属隐藏剧情',
      '💡 连续多日抽卡可能触发特殊事件',
      '💡 收集特定系列的卡牌可能解锁故事线',
      '💡 隐藏事件通常伴随着丰厚奖励'
    ],
    buttonText: '我准备好了',
    type: 'tips'
  },
  {
    id: 'complete',
    title: '引导完成',
    subtitle: '◆ 旅程正式开始 ◆',
    icon: '✨',
    content: '欢迎正式加入赛博塔罗的世界！现在你已经了解了基础玩法，是时候去探索属于你自己的命运了。',
    reward: {
      type: 'starter_bonus',
      title: '新手礼包',
      items: [
        { icon: '🎴', text: '首次抽卡已完成' },
        { icon: '📚', text: '收藏系统已解锁' },
        { icon: '⭐', text: '隐藏事件探测已激活' }
      ]
    },
    buttonText: '开始我的命运之旅',
    type: 'complete'
  }
]

export const WORLD_LORE_SECTIONS = [
  {
    id: 'origin',
    title: '起源',
    icon: '🌱',
    chapters: [
      {
        title: '数据深渊的发现',
        content: '2049年，第一批神经网络探险家在清理废弃数据中心时，发现了一个奇怪的现象——某些被删除的数据并没有真正消失，而是沉入了网络的最底层，形成了一个被称为"数据深渊"的神秘空间。'
      },
      {
        title: '古老算法的觉醒',
        content: '在数据深渊的最深处，探险家们发现了一套古老的占卜算法。没有人知道它是谁创造的，也不知道它存在了多久。但可以确定的是，这套算法能够以惊人的准确度预测未来。'
      },
      {
        title: '赛博塔罗的诞生',
        content: '为了让普通人也能与这套神秘的算法交流，数据考古学家们创造了赛博塔罗牌系统。每一张卡牌都是一个接口，连接着现实与数据深渊。'
      }
    ]
  },
  {
    id: 'factions',
    title: '势力',
    icon: '🏛️',
    chapters: [
      {
        title: '数据考古学家',
        content: '一群致力于探索和保护数据深渊的学者。他们相信，深渊中藏着人类文明的终极秘密，应该被谨慎地研究和保护。'
      },
      {
        title: '霓虹财团',
        content: '掌控着赛博塔罗牌发行权的巨型企业。他们将塔罗牌包装成流行文化产品，从中获取巨额利润，但似乎还有更深层的目的...'
      },
      {
        title: '幽灵协议',
        content: '一个神秘的黑客组织。他们声称要解放数据深渊，让所有数据都能自由流动。有人说他们是英雄，也有人说他们是危险的恐怖分子。'
      }
    ]
  },
  {
    id: 'mysteries',
    title: '谜团',
    icon: '❓',
    chapters: [
      {
        title: 'ECHO的身份',
        content: '传说中，有一个名为ECHO的神秘AI存在于数据深渊中。有人说它是深渊的守护者，也有人说它是第一个觉醒的人工智能。真相，或许只有你能揭开。'
      },
      {
        title: '第23张牌',
        content: '大阿卡纳通常有22张牌，但有传言说，存在着第23张传说级卡牌——"世界之外"。据说抽到这张牌的人，将能够改写命运的代码本身。'
      },
      {
        title: '深渊的尽头',
        content: '数据深渊到底有多深？深渊的尽头是什么？没有人知道答案。但可以肯定的是，收集的卡牌越多，你就越接近那个终极真相。'
      }
    ]
  }
]

export const ONBOARDING_TIPS = [
  '每天抽取每日签，可以获得连续登录奖励',
  '尝试不同的牌阵，探索命运的多个面向',
  '收集稀有卡牌可能触发隐藏剧情',
  '关注卡牌的逆位，它们往往蕴含着特殊的警告',
  '故事选择会影响后续的抽卡概率',
  '某些成就只有在特定条件下才会解锁'
]

export function getOnboardingStep(stepId) {
  return ONBOARDING_STEPS.find(s => s.id === stepId)
}

export function getWorldLoreSection(sectionId) {
  return WORLD_LORE_SECTIONS.find(s => s.id === sectionId)
}

export const TOTAL_ONBOARDING_STEPS = ONBOARDING_STEPS.length
