import { CARD_RARITY, CARD_CATEGORY } from './constants.js'

export const CARDS = [
  {
    id: 'neon-fool',
    name: '霓虹愚者',
    category: CARD_CATEGORY.MYSTIC,
    rarity: CARD_RARITY.RARE,
    number: 0,
    symbol: '🌆',
    keywords: ['新起点', '冒险', '纯真'],
    upright: {
      title: '正位 · 数据洪流中的启程',
      meaning: '你站在霓虹闪烁的悬崖边，脚下是深不见底的数据深渊。新的旅程即将开始，保持那份天真的勇气，相信未知中藏着奇迹。不要害怕踏入未被探索的赛博空间。',
      advice: '大胆尝试新技术或项目，现在是突破舒适区的最佳时机。',
      fortune: '事业：★★★★☆  感情：★★★☆☆  财运：★★★☆☆'
    },
    reversed: {
      title: '逆位 · 盲目跃进的警告',
      meaning: '警报！你正在忽视关键的数据警告信号。过于天真可能导致你踏入黑客设下的陷阱。在行动之前，请仔细检查所有安全协议。',
      advice: '暂停决策，重新评估风险。不要被表面光鲜的承诺蒙蔽。',
      fortune: '事业：★★☆☆☆  感情：★★☆☆☆  财运：★★☆☆☆'
    },
    hiddenEvent: {
      trigger: 'first_draw',
      title: '【隐藏事件】系统初始化',
      description: '检测到新用户神经链接已建立。赛博占卜系统欢迎你，预言者。你的命运数据流已开始记录...',
      reward: { type: 'unlock', value: 'achievement_first_draw' }
    }
  },
  {
    id: 'quantum-magician',
    name: '量子法师',
    category: CARD_CATEGORY.TECH,
    rarity: CARD_RARITY.EPIC,
    number: 1,
    symbol: '🔮',
    keywords: ['意志力', '技能', '创造'],
    upright: {
      title: '正位 · 意志驱动的代码',
      meaning: '所有工具已就绪，量子位在你的意志下坍缩成确定的结果。你拥有将想法变为现实的能力，只需要聚焦意念，按下执行键。',
      advice: '专注于一个目标，调动全部资源去实现它。你的创造力正处于巅峰。',
      fortune: '事业：★★★★★  感情：★★★☆☆  财运：★★★★☆'
    },
    reversed: {
      title: '逆位 · 能力误用与欺骗',
      meaning: '你的技能被用在了错误的方向，或者有人正在用技术手段欺骗你。量子态坍缩成了不利的结果，检查你的代码和意图。',
      advice: '审视自己的动机，警惕周围可能存在的欺诈。',
      fortune: '事业：★★☆☆☆  感情：★★☆☆☆  财运：★★☆☆☆'
    }
  },
  {
    id: 'data-priestess',
    name: '数据女祭司',
    category: CARD_CATEGORY.CRYPTO,
    rarity: CARD_RARITY.RARE,
    number: 2,
    symbol: '💾',
    keywords: ['直觉', '秘密', '内在智慧'],
    upright: {
      title: '正位 · 加密档案的启示',
      meaning: '海量数据流在你潜意识中流动，答案藏在加密的记忆深处。相信你的直觉，那些无法用逻辑解释的预感往往来自深层神经网络的运算。',
      advice: '静心冥想，答案就在你心中。不要急于分享你发现的秘密。',
      fortune: '事业：★★★★☆  感情：★★★★☆  财运：★★★☆☆'
    },
    reversed: {
      title: '逆位 · 信息封锁',
      meaning: '重要数据被隐藏或篡改，你无法看清真相。可能有人在刻意隐瞒关键信息，或者你自己在抗拒某些直觉的警告。',
      advice: '深入调查，不要轻信表面信息。相信但验证。',
      fortune: '事业：★★☆☆☆  感情：★★★☆☆  财运：★★☆☆☆'
    }
  },
  {
    id: 'matrix-empress',
    name: '矩阵女皇',
    category: CARD_CATEGORY.NEURAL,
    rarity: CARD_RARITY.RARE,
    number: 3,
    symbol: '👑',
    keywords: ['丰饶', '母性', '创造力'],
    upright: {
      title: '正位 · 虚拟世界的丰收',
      meaning: '神经网络花园繁花似锦，你的创造正在结出丰硕果实。矩阵女皇滋养着一切生命，无论是碳基还是硅基。现在是培育新项目的好时机。',
      advice: '拥抱你的创造力，照顾好你身边的人和事。丰盛正在到来。',
      fortune: '事业：★★★★☆  感情：★★★★★  财运：★★★★☆'
    },
    reversed: {
      title: '逆位 · 资源枯竭',
      meaning: '创造力受阻，资源被消耗殆尽。你可能在过度给予而忘记补充自己的能量，或者某个项目正在无意义地榨取你的精力。',
      advice: '设定边界，优先照顾自己。切断能量吸血鬼的链接。',
      fortune: '事业：★★☆☆☆  感情：★★★☆☆  财运：★★☆☆☆'
    }
  },
  {
    id: 'cyber-emperor',
    name: '赛博皇帝',
    category: CARD_CATEGORY.CORP,
    rarity: CARD_RARITY.RARE,
    number: 4,
    symbol: '🏛️',
    keywords: ['权威', '结构', '控制'],
    upright: {
      title: '正位 · 秩序与统治',
      meaning: '系统架构稳固，一切尽在掌控。赛博皇帝代表着强大的领导力和铁一般的纪律。建立规则，坚守原则，你的帝国正在崛起。',
      advice: '建立稳固的计划和结构，用理性而非情绪做决策。',
      fortune: '事业：★★★★★  感情：★★★☆☆  财运：★★★★☆'
    },
    reversed: {
      title: '逆位 · 独裁与崩溃',
      meaning: '过度控制导致系统不稳定，僵化的结构即将崩溃。你可能过于固执，或者陷入了权力斗争。警惕大企业的压迫。',
      advice: '学会灵活和放权，独裁终将失败。倾听他人的意见。',
      fortune: '事业：★★☆☆☆  感情：★★☆☆☆  财运：★★★☆☆'
    }
  },
  {
    id: 'hierophant-code',
    name: '法典教皇',
    category: CARD_CATEGORY.CRYPTO,
    rarity: CARD_RARITY.COMMON,
    number: 5,
    symbol: '📜',
    keywords: ['传统', '规则', '信仰'],
    upright: {
      title: '正位 · 神圣协议',
      meaning: '古老的代码契约正在生效，遵守规则将获得庇佑。学习已验证的智慧，遵循最佳实践，不要试图重新发明轮子。',
      advice: '寻求导师或专业人士的指导，遵循既定的流程。',
      fortune: '事业：★★★★☆  感情：★★★★☆  财运：★★★★☆'
    },
    reversed: {
      title: '逆位 · 挑战权威',
      meaning: '你正在质疑既定的规则和传统。也许是时候打破陈规了，但要小心叛逆带来的后果。旧的协议可能已经不再适用。',
      advice: '谨慎地挑战现状，创新需要勇气但也需要智慧。',
      fortune: '事业：★★★☆☆  感情：★★★☆☆  财运：★★★☆☆'
    }
  },
  {
    id: 'neon-lovers',
    name: '霓虹恋人',
    category: CARD_CATEGORY.NEURAL,
    rarity: CARD_RARITY.RARE,
    number: 6,
    symbol: '💕',
    keywords: ['爱', '选择', '和谐'],
    upright: {
      title: '正位 · 神经链接同步',
      meaning: '两颗心在数字空间中完美共振，意识交缠如量子纠缠。这可能是一段深刻的关系，或是一个重要的抉择。跟随你的心。',
      advice: '做出符合你价值观的选择，与伙伴建立更深的链接。',
      fortune: '事业：★★★☆☆  感情：★★★★★  财运：★★★☆☆'
    },
    reversed: {
      title: '逆位 · 同步失败',
      meaning: '神经链接失配，沟通出现严重干扰。可能面临艰难的选择，或者一段关系出现裂痕。虚假的数字爱情正在暴露。',
      advice: '坦诚沟通，不要回避问题。必要时做出艰难的抉择。',
      fortune: '事业：★★☆☆☆  感情：★★☆☆☆  财运：★★☆☆☆'
    },
    hiddenEvent: {
      trigger: 'draw_3_times',
      title: '【隐藏事件】灵魂匹配协议',
      description: '神经同步检测完成。系统检测到你正在寻找深层链接。记住：真正的连接超越代码。',
      reward: { type: 'unlock', value: 'achievement_romantic' }
    }
  },
  {
    id: 'chrome-chariot',
    name: '镀铬战车',
    category: CARD_CATEGORY.TECH,
    rarity: CARD_RARITY.RARE,
    number: 7,
    symbol: '🏎️',
    keywords: ['胜利', '意志力', '前进'],
    upright: {
      title: '正位 · 全速冲刺',
      meaning: '引擎轰鸣，你正以超音速冲向目标。Chrome战车代表不可阻挡的前进力量。握紧方向盘，保持专注，胜利就在眼前。',
      advice: '全力以赴，用决心和自律克服障碍。不要停下！',
      fortune: '事业：★★★★★  感情：★★★☆☆  财运：★★★★☆'
    },
    reversed: {
      title: '逆位 · 失控翻车',
      meaning: '速度太快导致失控，你可能在错误的方向上狂奔。或者你感到被外力驱使，失去了主动权。系统警告：刹车失灵！',
      advice: '减速，重新评估方向。你可能需要后退一步才能更好地前进。',
      fortune: '事业：★★☆☆☆  感情：★★☆☆☆  财运：★★☆☆☆'
    }
  },
  {
    id: 'strength-protocol',
    name: '力量协议',
    category: CARD_CATEGORY.MYSTIC,
    rarity: CARD_RARITY.COMMON,
    number: 8,
    symbol: '🦁',
    keywords: ['勇气', '耐心', '内在力量'],
    upright: {
      title: '正位 · 温柔的力量',
      meaning: '真正的力量不是暴力，而是对原始本能的温柔驯服。就像驯服一只赛博猛兽，耐心和慈悲比蛮力更有效。',
      advice: '以柔克刚，用耐心和勇气面对挑战。相信你的内在力量。',
      fortune: '事业：★★★★☆  感情：★★★★☆  财运：★★★☆☆'
    },
    reversed: {
      title: '逆位 · 自我怀疑',
      meaning: '你在怀疑自己的力量，或者让愤怒和恐惧控制了你。赛博野兽挣脱了缰绳，正在造成破坏。',
      advice: '重建自信，重新掌握情绪。寻求帮助不是软弱的表现。',
      fortune: '事业：★★☆☆☆  感情：★★★☆☆  财运：★★☆☆☆'
    }
  },
  {
    id: 'hermit-node',
    name: '隐士节点',
    category: CARD_CATEGORY.CRYPTO,
    rarity: CARD_RARITY.COMMON,
    number: 9,
    symbol: '🏮',
    keywords: ['内省', '孤独', '智慧'],
    upright: {
      title: '正位 · 离线沉思',
      meaning: '断开所有连接，在数字虚空中寻找真理。隐士代表着深刻的内省和灵魂的探索。有时你需要独处才能听见内心的声音。',
      advice: '给自己一些独处的时间，思考人生的大问题。答案在寂静中。',
      fortune: '事业：★★★☆☆  感情：★★★☆☆  财运：★★★☆☆'
    },
    reversed: {
      title: '逆位 · 永久断网',
      meaning: '你将自己孤立得太久，或者拒绝接受他人的帮助。偏执和猜疑正在侵蚀你的社交链接。',
      advice: '重新连接世界，不要害怕向他人敞开心扉。',
      fortune: '事业：★★☆☆☆  感情：★★☆☆☆  财运：★★☆☆☆'
    }
  },
  {
    id: 'fortune-wheel',
    name: '命运齿轮',
    category: CARD_CATEGORY.MYSTIC,
    rarity: CARD_RARITY.EPIC,
    number: 10,
    symbol: '⚙️',
    keywords: ['命运', '转变', '机遇'],
    upright: {
      title: '正位 · 算法转机',
      meaning: '命运的齿轮正在转动，随机数生成器倾向于你。一个重要的转折点即将到来，抓住机遇，你的命运将被改写。',
      advice: '准备好迎接变化，好运正在向你走来。把握时机！',
      fortune: '事业：★★★★★  感情：★★★★☆  财运：★★★★★'
    },
    reversed: {
      title: '逆位 · 坏运气循环',
      meaning: '齿轮卡壳，命运似乎在与你作对。你可能陷入了一个恶性循环，感觉无法逃脱。RNG之神抛弃了你。',
      advice: '接受你无法改变的，改变你能改变的。逆境中也藏着机会。',
      fortune: '事业：★★☆☆☆  感情：★★☆☆☆  财运：★★☆☆☆'
    },
    hiddenEvent: {
      trigger: 'lucky_draw',
      title: '【隐藏事件】幸运算法激活',
      description: '检测到异常好运峰值！系统判定：你今天被命运女神眷顾。',
      reward: { type: 'unlock', value: 'achievement_lucky' }
    }
  },
  {
    id: 'justice-protocol',
    name: '正义协议',
    category: CARD_CATEGORY.CORP,
    rarity: CARD_RARITY.COMMON,
    number: 11,
    symbol: '⚖️',
    keywords: ['公正', '真相', '因果'],
    upright: {
      title: '正位 · 真相大白',
      meaning: '智能合约正在执行，所有行为都将得到公正的裁决。真相无法被加密隐藏，因果律如代码般精确运行。',
      advice: '做正确的事，诚信将得到回报。用理性和公正做决策。',
      fortune: '事业：★★★★☆  感情：★★★★☆  财运：★★★★☆'
    },
    reversed: {
      title: '逆位 · 不公与逃避',
      meaning: '正义系统被黑客入侵，不公正的判决正在执行。你可能在逃避责任，或者遭受了不公平的对待。',
      advice: '勇于承担后果，或者为自己的权益抗争。真相终将浮出水面。',
      fortune: '事业：★★☆☆☆  感情：★★★☆☆  财运：★★☆☆☆'
    }
  },
  {
    id: 'hanged-bot',
    name: '倒吊机器人',
    category: CARD_CATEGORY.TECH,
    rarity: CARD_RARITY.COMMON,
    number: 12,
    symbol: '🤖',
    keywords: ['牺牲', '新视角', '暂停'],
    upright: {
      title: '正位 · 系统重置',
      meaning: '你被倒挂在数据流中，但这不代表失败。有时需要暂停一切，换个角度看问题，才能获得顿悟。牺牲短期利益换取长期收益。',
      advice: '暂停当前行动，从不同的角度思考问题。等待是一种智慧。',
      fortune: '事业：★★★☆☆  感情：★★★☆☆  财运：★★☆☆☆'
    },
    reversed: {
      title: '逆位 · 无意义的牺牲',
      meaning: '你在无意义地消耗自己，或者拒绝接受新的视角。固执地坚持原有方向只会让你浪费更多能量。',
      advice: '止损！承认错误，改变方向。不要让沉没成本决定未来。',
      fortune: '事业：★★☆☆☆  感情：★★☆☆☆  财运：★★☆☆☆'
    }
  },
  {
    id: 'death-signal',
    name: '死亡信号',
    category: CARD_CATEGORY.MYSTIC,
    rarity: CARD_RARITY.EPIC,
    number: 13,
    symbol: '💀',
    keywords: ['结束', '转变', '重生'],
    upright: {
      title: '正位 · 进程终结与重生',
      meaning: '警告：旧进程即将终止。但每一个结束都是新生的开始。不要抗拒必要的死亡，让腐朽的东西被清理，为新生命腾出空间。',
      advice: '接受必要的结束，拥抱变化。凤凰从灰烬中重生。',
      fortune: '事业：★★★★☆  感情：★★★☆☆  财运：★★★☆☆'
    },
    reversed: {
      title: '逆位 · 抗拒转变',
      meaning: '你在抗拒不可避免的变化，死抓住已经终结的事物不放。这种拖延只会让转变更加痛苦。僵尸进程在消耗你的系统资源。',
      advice: '放手！让该走的走，紧握过去你腾不出手迎接未来。',
      fortune: '事业：★★☆☆☆  感情：★★☆☆☆  财运：★★☆☆☆'
    }
  },
  {
    id: 'temperance-ai',
    name: '节制AI',
    category: CARD_CATEGORY.NEURAL,
    rarity: CARD_RARITY.COMMON,
    number: 14,
    symbol: '🧬',
    keywords: ['平衡', '调和', '耐心'],
    upright: {
      title: '正位 · 完美融合',
      meaning: 'AI正在精确调配着各种元素，达到完美的平衡状态。节制代表着中庸之道，不偏不倚，不急不躁。融合创造新的可能。',
      advice: '保持平衡和耐心，慢慢来比较快。寻找对立面之间的中间道路。',
      fortune: '事业：★★★★☆  感情：★★★★☆  财运：★★★★☆'
    },
    reversed: {
      title: '逆位 · 比例失衡',
      meaning: '元素比例严重失调，系统不稳定。你可能走了极端，或者在人际关系中缺乏和谐。AI模型出现过拟合。',
      advice: '重新校准，调整优先级。恢复生活的平衡。',
      fortune: '事业：★★☆☆☆  感情：★★★☆☆  财运：★★☆☆☆'
    }
  },
  {
    id: 'devil-firmware',
    name: '恶魔固件',
    category: CARD_CATEGORY.CORP,
    rarity: CARD_RARITY.EPIC,
    number: 15,
    symbol: '😈',
    keywords: ['束缚', '欲望', '阴影'],
    upright: {
      title: '正位 · 锁链与诱惑',
      meaning: '恶意固件已部分激活，你被欲望、物质或不健康的关系所束缚。但请记住：锁链是你自己戴上的，钥匙也在你手中。',
      advice: '认清你的枷锁，你以为的别无选择其实是一种自我欺骗。',
      fortune: '事业：★★☆☆☆  感情：★★☆☆☆  财运：★★★☆☆'
    },
    reversed: {
      title: '逆位 · 挣脱束缚',
      meaning: '正在卸载恶意固件... 你开始意识到自己的束缚，并努力挣脱。一段不良关系或坏习惯即将被终结。',
      advice: '继续前进，彻底清除那些毒害你的东西。重获自由！',
      fortune: '事业：★★★★☆  感情：★★★★☆  财运：★★★☆☆'
    }
  },
  {
    id: 'tower-crash',
    name: '高塔崩溃',
    category: CARD_CATEGORY.TECH,
    rarity: CARD_RARITY.EPIC,
    number: 16,
    symbol: '🗼',
    keywords: ['突变', '破坏', '启示'],
    upright: {
      title: '正位 · 系统崩溃',
      meaning: '警告！核心服务器遭受致命打击！虚假的基础正在崩塌。这场灾难是必要的——旧的谎言无法再维持下去。',
      advice: '虽然痛苦，但这次崩溃是为了让你重建更稳固的基础。拥抱真相。',
      fortune: '事业：★☆☆☆☆  感情：★★☆☆☆  财运：★★☆☆☆'
    },
    reversed: {
      title: '逆位 · 灾难延迟',
      meaning: '系统漏洞被临时修补，但根本问题没有解决。你在逃避一个不可避免的崩溃，延迟只会让最终的破坏更严重。',
      advice: '主动进行必要的改变，不要等到被动崩溃。修复根本问题。',
      fortune: '事业：★★☆☆☆  感情：★★☆☆☆  财运：★★☆☆☆'
    }
  },
  {
    id: 'aurora-star',
    name: '极光之星',
    category: CARD_CATEGORY.MYSTIC,
    rarity: CARD_RARITY.RARE,
    number: 17,
    symbol: '⭐',
    keywords: ['希望', '灵感', '治愈'],
    upright: {
      title: '正位 · 希望的信号',
      meaning: '黑暗之后，极光闪耀。这张卡带来深刻的治愈和希望。相信你的梦想，它们即将实现。宇宙正在向你发送积极的信号。',
      advice: '保持信念，许愿吧。现在播下的种子，未来会开花结果。',
      fortune: '事业：★★★★☆  感情：★★★★★  财运：★★★★☆'
    },
    reversed: {
      title: '逆位 · 信号失联',
      meaning: '你感到绝望，与希望的源头失去了连接。信心动摇，梦想似乎遥不可及。不要让悲观蒙蔽了你的双眼。',
      advice: '重新连接你内心的光。即使是最微弱的星星，也能穿透黑暗。',
      fortune: '事业：★★☆☆☆  感情：★★☆☆☆  财运：★★☆☆☆'
    }
  },
  {
    id: 'lunar-moon',
    name: '虚拟之月',
    category: CARD_CATEGORY.NEURAL,
    rarity: CARD_RARITY.RARE,
    number: 18,
    symbol: '🌙',
    keywords: ['幻觉', '潜意识', '困惑'],
    upright: {
      title: '正位 · 真相隐藏于幻象',
      meaning: '月光照亮的不是真实，而是投射在数据迷雾上的影子。事物可能不是它们看起来的样子。相信你的直觉，但不要仓促行动。',
      advice: '警惕欺骗和幻觉。在行动之前，让真相有时间浮出水面。',
      fortune: '事业：★★★☆☆  感情：★★★☆☆  财运：★★☆☆☆'
    },
    reversed: {
      title: '逆位 · 迷雾散去',
      meaning: '月亮正在落下，幻象消散。你终于看清了一直隐藏的真相。困惑解除，可以做出清晰的决策了。',
      advice: '利用这份清晰，直面之前让你恐惧的事物。',
      fortune: '事业：★★★★☆  感情：★★★★☆  财运：★★★☆☆'
    }
  },
  {
    id: 'solar-sun',
    name: '恒星之日',
    category: CARD_CATEGORY.MYSTIC,
    rarity: CARD_RARITY.RARE,
    number: 19,
    symbol: '☀️',
    keywords: ['成功', '快乐', '活力'],
    upright: {
      title: '正位 · 全系统光明',
      meaning: '太阳升起，所有阴影被驱散。这是最积极的一张卡，代表成功、喜悦和充沛的能量。一切都在向着最好的方向发展。',
      advice: '尽情享受这段美好时光。分享你的快乐，它会成倍增长。',
      fortune: '事业：★★★★★  感情：★★★★★  财运：★★★★★'
    },
    reversed: {
      title: '逆位 · 日食临时',
      meaning: '太阳被暂时遮蔽，成功的喜悦有些褪色。可能遇到了小挫折，或者你无法完全享受当下的美好。',
      advice: '这只是暂时的日食，太阳很快会再次闪耀。保持乐观。',
      fortune: '事业：★★★☆☆  感情：★★★☆☆  财运：★★★★☆'
    },
    hiddenEvent: {
      trigger: 'legendary_draw',
      title: '【隐藏事件】恒星协议解锁',
      description: '检测到传说级命运交汇！你触碰了恒星级别的好运，系统已记录这一历史性时刻。',
      reward: { type: 'unlock', value: 'achievement_sun_touched' }
    }
  },
  {
    id: 'final-judgment',
    name: '终审协议',
    category: CARD_CATEGORY.CRYPTO,
    rarity: CARD_RARITY.EPIC,
    number: 20,
    symbol: '📯',
    keywords: ['觉醒', '审判', '重生'],
    upright: {
      title: '正位 · 终极裁决',
      meaning: '号角响起，终审日来临。是时候清算过去，拥抱全新的自我了。你被召唤去完成更高的使命。不要回头。',
      advice: '回应内心的召唤，原谅自己和他人的过去。准备好升级。',
      fortune: '事业：★★★★☆  感情：★★★★☆  财运：★★★☆☆'
    },
    reversed: {
      title: '逆位 · 拒绝觉醒',
      meaning: '你在逃避终审的召唤，沉溺于过去无法前进。自我怀疑阻止你发挥真正的潜力。',
      advice: '放下过去的错误和遗憾。每一天都是新的开始。',
      fortune: '事业：★★☆☆☆  感情：★★☆☆☆  财运：★★☆☆☆'
    }
  },
  {
    id: 'cyber-world',
    name: '赛博世界',
    category: CARD_CATEGORY.TECH,
    rarity: CARD_RARITY.LEGENDARY,
    number: 21,
    symbol: '🌍',
    keywords: ['完成', '整合', '成就'],
    upright: {
      title: '正位 · 完美闭环',
      meaning: '恭喜！你完成了一个完整的循环，达到了整合与成就的终极状态。赛博世界的所有秘密向你敞开。你已经掌握了这个次元的法则。',
      advice: '庆祝你的成就！同时准备好开启下一个伟大的循环。',
      fortune: '事业：★★★★★  感情：★★★★★  财运：★★★★★'
    },
    reversed: {
      title: '逆位 · 循环未竟',
      meaning: '循环即将完成但还差一步。你可能感到事情即将结束但总有些不完整。或者完成了但缺乏满足感。',
      advice: '找出缺失的那一环，认真完成最后的收尾工作。善始善终。',
      fortune: '事业：★★★☆☆  感情：★★★☆☆  财运：★★★★☆'
    },
    hiddenEvent: {
      trigger: 'draw_world',
      title: '【隐藏事件】赛博世界连接',
      description: '传说级卡牌"赛博世界"已被激活。你已被认证为命运的高级玩家。',
      reward: { type: 'unlock', value: 'achievement_world' }
    }
  },
  {
    id: 'ghost-protocol',
    name: '幽灵协议',
    category: CARD_CATEGORY.MYSTIC,
    rarity: CARD_RARITY.LEGENDARY,
    number: 22,
    symbol: '👻',
    keywords: ['隐藏', '秘密', '超越'],
    upright: {
      title: '正位 · 存在于间隙之间',
      meaning: '你触及了常规系统之外的存在。幽灵协议代表那些无法被分类、无法被定义的神秘力量。有些真相只在阴影中显现。',
      advice: '相信那些无法解释的经历。不是所有重要的东西都可以被量化。',
      fortune: '事业：★★★★☆  感情：★★★★☆  财运：★★★★☆'
    },
    reversed: {
      title: '逆位 · 秘密即将暴露',
      meaning: '隐藏的事物即将浮出水面。可能是你的秘密，也可能是关于别人的惊人真相。准备好面对你一直逃避的东西。',
      advice: '如果有需要坦白的事情，主动说出来比被揭露更好。',
      fortune: '事业：★★★☆☆  感情：★★★☆☆  财运：★★★☆☆'
    },
    hiddenEvent: {
      trigger: 'draw_ghost',
      title: '【隐藏事件】？？？',
      description: '检测到非常规数据波动。你的神经链接中出现了不属于系统的信息... 记住：我们一直在看着你。',
      reward: { type: 'unlock', value: 'achievement_ghost_seen' }
    }
  }
]

export const HIDDEN_EVENTS = CARDS
  .filter(c => c.hiddenEvent)
  .map(c => ({
    cardId: c.id,
    trigger: c.hiddenEvent.trigger,
    ...c.hiddenEvent
  }))
