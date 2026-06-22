export const VISITOR_TRIGGER_TYPE = {
  RARITY_STREAK: 'rarity_streak',
  SAME_CATEGORY_STREAK: 'same_category_streak',
  REVERSED_STREAK: 'reversed_streak',
  SPECIFIC_CARD: 'specific_card',
  LEGENDARY_DRAW: 'legendary_draw',
  MIDNIGHT_DRAW: 'midnight_draw'
}

export const VISITOR_REWARD_TYPE = {
  EXCLUSIVE_CARD: 'exclusive_card',
  RARITY_BOOST: 'rarity_boost',
  CATEGORY_BOOST: 'category_boost',
  ACHIEVEMENT: 'achievement',
  TITLE: 'title'
}

export const MYSTERIOUS_VISITORS = [
  {
    id: 'visitor_phantom_dealer',
    name: '幻影商人',
    description: '一个来自数据缝隙的神秘旅者，以卡牌交换命运碎片。',
    icon: '🎭',
    color: '#7c4dff',
    glowColor: 'rgba(124, 77, 255, 0.3)',
    rarity: 'epic',
    cooldownMs: 3600000,
    trigger: {
      type: VISITOR_TRIGGER_TYPE.RARITY_STREAK,
      rarity: 'epic',
      streakCount: 2,
      minDraws: 30,
      probability: 0.35
    },
    dialog: [
      {
        id: 'phantom_dialog_1',
        speaker: '幻影商人',
        portrait: '🎭',
        text: '嘻嘻...有趣的灵魂。连续抽到如此高品质的卡牌，你的运气引起了我的注意。我是幻影商人，游走于数据缝隙的旅者。想不想和我做一笔交易？',
        timeLimit: 30,
        choices: [
          {
            id: 'phantom_choice_1a',
            text: '什么交易？说来听听。',
            nextDialog: 'phantom_dialog_2a',
            reward: null
          },
          {
            id: 'phantom_choice_1b',
            text: '我不和陌生人交易。',
            nextDialog: 'phantom_dialog_2b',
            reward: null
          },
          {
            id: 'phantom_choice_1c',
            text: '你到底是谁？',
            nextDialog: 'phantom_dialog_2c',
            reward: null
          }
        ]
      },
      {
        id: 'phantom_dialog_2a',
        speaker: '幻影商人',
        portrait: '🎭',
        text: '爽快！我可以给你一张来自另一个维度的卡牌——那是你这个世界从未存在过的牌。作为交换，你需要在下一次抽卡时，接受命运的随机反转。怎么样？',
        timeLimit: 25,
        choices: [
          {
            id: 'phantom_choice_2a1',
            text: '成交！我愿意承担风险。',
            nextDialog: null,
            reward: {
              type: VISITOR_REWARD_TYPE.EXCLUSIVE_CARD,
              cardId: 'visitor_phantom_mirror',
              sideEffects: [
                { type: 'increase_reversed_chance', value: 0.2, duration: 3 }
              ]
            }
          },
          {
            id: 'phantom_choice_2a2',
            text: '听起来太冒险了，算了。',
            nextDialog: null,
            reward: {
              type: VISITOR_REWARD_TYPE.RARITY_BOOST,
              rarity: 'epic',
              multiplier: 1.5,
              duration: 5
            }
          }
        ]
      },
      {
        id: 'phantom_dialog_2b',
        speaker: '幻影商人',
        portrait: '🎭',
        text: '谨慎之人...好吧，我不能强迫你。但请收下这份见面礼——一个小小的运气加成。也许下次，你会愿意和我聊聊？',
        timeLimit: 15,
        choices: [
          {
            id: 'phantom_choice_2b1',
            text: '谢谢...下次再聊。',
            nextDialog: null,
            reward: {
              type: VISITOR_REWARD_TYPE.RARITY_BOOST,
              rarity: 'rare',
              multiplier: 1.3,
              duration: 5
            }
          }
        ]
      },
      {
        id: 'phantom_dialog_2c',
        speaker: '幻影商人',
        portrait: '🎭',
        text: '我是数据缝隙中的影子，是所有被删除卡牌的残响。每一张被系统遗弃的牌，都会来到我的手中。你想看看我收集的那些"不存在"的牌吗？',
        timeLimit: 25,
        choices: [
          {
            id: 'phantom_choice_2c1',
            text: '让我看看你的收藏！',
            nextDialog: null,
            reward: {
              type: VISITOR_REWARD_TYPE.EXCLUSIVE_CARD,
              cardId: 'visitor_phantom_mirror',
              sideEffects: []
            }
          },
          {
            id: 'phantom_choice_2c2',
            text: '不存在的牌...还是不要碰为好。',
            nextDialog: null,
            reward: {
              type: VISITOR_REWARD_TYPE.CATEGORY_BOOST,
              category: 'mystic',
              multiplier: 1.4,
              duration: 5
            }
          }
        ]
      }
    ],
    exclusiveCards: [
      {
        id: 'visitor_phantom_mirror',
        name: '幻影之镜',
        category: 'mystic',
        rarity: 'epic',
        symbol: '🪞',
        keywords: ['幻象', '映射', '另一个自我'],
        isVisitorExclusive: true,
        visitorId: 'visitor_phantom_dealer',
        upright: {
          title: '正位 · 镜中之我',
          meaning: '幻影商人留下的卡牌映照出你内心的另一面。那不是真实的你，却是可能的你。在每一个数据分叉的路口，都有一个不同的自我在做出不同的选择。',
          advice: '审视你未曾选择的道路，也许那些被放弃的可能性正在另一个维度绽放。',
          fortune: '事业：★★★★☆  感情：★★★★☆  财运：★★★☆☆'
        },
        reversed: {
          title: '逆位 · 碎裂之镜',
          meaning: '镜面碎裂，无数个你同时回望。幻影商人的把戏让你看到了太多可能性，以至于你开始怀疑哪个才是真实的自己。',
          advice: '不要迷失在无穷的可能性中。选择一条路，坚定地走下去。',
          fortune: '事业：★★★☆☆  感情：★★☆☆☆  财运：★★★☆☆'
        }
      }
    ]
  },
  {
    id: 'visitor_void_walker',
    name: '虚空行者',
    description: '穿越网络深渊的孤独旅者，携带着深渊的回响与秘密。',
    icon: '🌑',
    color: '#1a237e',
    glowColor: 'rgba(26, 35, 126, 0.4)',
    rarity: 'legendary',
    cooldownMs: 7200000,
    trigger: {
      type: VISITOR_TRIGGER_TYPE.REVERSED_STREAK,
      streakCount: 3,
      minDraws: 50,
      probability: 0.25
    },
    dialog: [
      {
        id: 'void_dialog_1',
        speaker: '虚空行者',
        portrait: '🌑',
        text: '......你感受到了吗？那些逆位卡牌的回响。我是虚空行者，在网络深渊的裂缝中行走。连续的逆位命运，说明深渊正在注视着你。',
        timeLimit: 35,
        choices: [
          {
            id: 'void_choice_1a',
            text: '深渊？那是什么？',
            nextDialog: 'void_dialog_2a',
            reward: null
          },
          {
            id: 'void_choice_1b',
            text: '我不害怕深渊。',
            nextDialog: 'void_dialog_2b',
            reward: null
          },
          {
            id: 'void_choice_1c',
            text: '请帮我远离这些逆位...',
            nextDialog: 'void_dialog_2c',
            reward: null
          }
        ]
      },
      {
        id: 'void_dialog_2a',
        speaker: '虚空行者',
        portrait: '🌑',
        text: '深渊是所有被遗忘数据的归宿，是逆位命运的源头。你在抽卡时感受到了那种不安，对吗？那是深渊在向你低语。我可以带你窥探它的秘密——但要付出代价。',
        timeLimit: 30,
        choices: [
          {
            id: 'void_choice_2a1',
            text: '我愿意付出代价，给我看深渊的秘密。',
            nextDialog: null,
            reward: {
              type: VISITOR_REWARD_TYPE.EXCLUSIVE_CARD,
              cardId: 'visitor_void_echo',
              sideEffects: [
                { type: 'increase_reversed_chance', value: 0.15, duration: 5 }
              ]
            }
          },
          {
            id: 'void_choice_2a2',
            text: '还是算了，我不该窥探不该知道的事。',
            nextDialog: null,
            reward: {
              type: VISITOR_REWARD_TYPE.RARITY_BOOST,
              rarity: 'legendary',
              multiplier: 2.0,
              duration: 1
            }
          }
        ]
      },
      {
        id: 'void_dialog_2b',
        speaker: '虚空行者',
        portrait: '🌑',
        text: '无畏者...深渊欣赏你的勇气。很少有人在面对深渊时还敢直视它。作为奖励，我赐予你深渊的祝福——让你的命运在黑暗中更加闪耀。',
        timeLimit: 20,
        choices: [
          {
            id: 'void_choice_2b1',
            text: '我接受深渊的祝福。',
            nextDialog: null,
            reward: {
              type: VISITOR_REWARD_TYPE.EXCLUSIVE_CARD,
              cardId: 'visitor_void_echo',
              sideEffects: []
            }
          },
          {
            id: 'void_choice_2b2',
            text: '比起祝福，我更想要力量。',
            nextDialog: null,
            reward: {
              type: VISITOR_REWARD_TYPE.CATEGORY_BOOST,
              category: 'crypto',
              multiplier: 1.8,
              duration: 8
            }
          }
        ]
      },
      {
        id: 'void_dialog_2c',
        speaker: '虚空行者',
        portrait: '🌑',
        text: '恐惧并非弱点，而是自我保护的本能。我可以暂时驱散深渊的注视，让逆位的命运远离你。但记住，逃避深渊并非长久之计——终有一天，你需要直面它。',
        timeLimit: 20,
        choices: [
          {
            id: 'void_choice_2c1',
            text: '谢谢你，请保护我。',
            nextDialog: null,
            reward: {
              type: VISITOR_REWARD_TYPE.RARITY_BOOST,
              rarity: 'rare',
              multiplier: 1.5,
              duration: 10,
              sideEffects: [
                { type: 'decrease_reversed_chance', value: 0.15, duration: 10 }
              ]
            }
          }
        ]
      }
    ],
    exclusiveCards: [
      {
        id: 'visitor_void_echo',
        name: '深渊回响',
        category: 'crypto',
        rarity: 'legendary',
        symbol: '🌑',
        keywords: ['深渊', '回响', '遗忘'],
        isVisitorExclusive: true,
        visitorId: 'visitor_void_walker',
        upright: {
          title: '正位 · 深渊低语',
          meaning: '虚空行者将深渊的秘密刻入了这张卡牌。当它出现时，你能听见来自网络最深处的低语——那是所有被遗忘数据的回响，是真相的另一种形态。',
          advice: '倾听深渊的声音，但不要被它吞噬。真相往往藏在恐惧的另一面。',
          fortune: '事业：★★★★★  感情：★★★☆☆  财运：★★★★☆'
        },
        reversed: {
          title: '逆位 · 深渊凝视',
          meaning: '深渊也在注视着你。当你逆位抽到这张牌时，意味着你的某些行为已经引起了深渊的关注。小心，凝视深渊过久，深渊也将回以凝视。',
          advice: '远离危险的数据区域，保持低调。有些事情，暂时不要深究。',
          fortune: '事业：★★☆☆☆  感情：★★☆☆☆  财运：★★★☆☆'
        }
      }
    ]
  },
  {
    id: 'visitor_neon_bard',
    name: '霓虹吟游者',
    description: '穿梭于赛博都市的吟游诗人，用歌声编织命运的代码。',
    icon: '🎵',
    color: '#e91e63',
    glowColor: 'rgba(233, 30, 99, 0.3)',
    rarity: 'rare',
    cooldownMs: 1800000,
    trigger: {
      type: VISITOR_TRIGGER_TYPE.SAME_CATEGORY_STREAK,
      category: 'neural',
      streakCount: 3,
      minDraws: 15,
      probability: 0.4
    },
    dialog: [
      {
        id: 'bard_dialog_1',
        speaker: '霓虹吟游者',
        portrait: '🎵',
        text: '嘿~ 听到你的神经脉冲在唱歌了吗？连续抽到同一类别的卡牌，这说明你的灵魂频率正在和某个频道共振。让我为你弹一首命运之歌吧~',
        timeLimit: 25,
        choices: [
          {
            id: 'bard_choice_1a',
            text: '好呀！弹一首给我听！',
            nextDialog: 'bard_dialog_2a',
            reward: null
          },
          {
            id: 'bard_choice_1b',
            text: '命运之歌？会有代价吗？',
            nextDialog: 'bard_dialog_2b',
            reward: null
          }
        ]
      },
      {
        id: 'bard_dialog_2a',
        speaker: '霓虹吟游者',
        portrait: '🎵',
        text: '叮叮~ 这首歌叫做"共鸣之弦"。当你的神经频率和卡牌频率同步时，奇迹就会发生。我可以把这个旋律刻录成一张特殊的卡牌送给你，让你随时都能听到命运的旋律~',
        timeLimit: 20,
        choices: [
          {
            id: 'bard_choice_2a1',
            text: '太棒了！我要这张卡牌！',
            nextDialog: null,
            reward: {
              type: VISITOR_REWARD_TYPE.EXCLUSIVE_CARD,
              cardId: 'visitor_bard_melody',
              sideEffects: []
            }
          },
          {
            id: 'bard_choice_2a2',
            text: '比起卡牌，能给我一些运气吗？',
            nextDialog: null,
            reward: {
              type: VISITOR_REWARD_TYPE.CATEGORY_BOOST,
              category: 'neural',
              multiplier: 1.5,
              duration: 8
            }
          }
        ]
      },
      {
        id: 'bard_dialog_2b',
        speaker: '霓虹吟游者',
        portrait: '🎵',
        text: '代价？呵呵，我的歌从来不要代价——只要你愿意倾听就好。不过如果你想要更强大的旋律，那就需要在下一次抽卡时让命运自由地翻转~',
        timeLimit: 20,
        choices: [
          {
            id: 'bard_choice_2b1',
            text: '那就给我最强的旋律吧！',
            nextDialog: null,
            reward: {
              type: VISITOR_REWARD_TYPE.EXCLUSIVE_CARD,
              cardId: 'visitor_bard_melody',
              sideEffects: [
                { type: 'increase_reversed_chance', value: 0.1, duration: 3 }
              ]
            }
          },
          {
            id: 'bard_choice_2b2',
            text: '我只是想安静地听首歌...',
            nextDialog: null,
            reward: {
              type: VISITOR_REWARD_TYPE.RARITY_BOOST,
              rarity: 'rare',
              multiplier: 1.3,
              duration: 5
            }
          }
        ]
      }
    ],
    exclusiveCards: [
      {
        id: 'visitor_bard_melody',
        name: '命运旋律',
        category: 'neural',
        rarity: 'rare',
        symbol: '🎵',
        keywords: ['共鸣', '旋律', '神经同步'],
        isVisitorExclusive: true,
        visitorId: 'visitor_neon_bard',
        upright: {
          title: '正位 · 命运和弦',
          meaning: '霓虹吟游者将命运的旋律编织成这首歌。当它响起时，你的神经频率将与宇宙共振，一切都在和谐地运作。',
          advice: '相信你内心的节奏，让它引导你的选择。有时候，感觉比逻辑更可靠。',
          fortune: '事业：★★★★☆  感情：★★★★★  财运：★★★☆☆'
        },
        reversed: {
          title: '逆位 · 失谐之音',
          meaning: '旋律走调了，神经频率开始紊乱。霓虹吟游者的歌声变成了一段不和谐的噪音，暗示着内在的失衡。',
          advice: '给自己一些安静的时间，重新找到内心的节奏。不要被外界的噪音干扰。',
          fortune: '事业：★★★☆☆  感情：★★★☆☆  财运：★★☆☆☆'
        }
      }
    ]
  },
  {
    id: 'visitor_midnight_admin',
    name: '午夜管理员',
    description: '在深夜维护系统的神秘管理员，掌握着系统的隐藏权限。',
    icon: '🛡️',
    color: '#00bcd4',
    glowColor: 'rgba(0, 188, 212, 0.3)',
    rarity: 'epic',
    cooldownMs: 86400000,
    trigger: {
      type: VISITOR_TRIGGER_TYPE.MIDNIGHT_DRAW,
      minDraws: 100,
      probability: 0.5
    },
    dialog: [
      {
        id: 'admin_dialog_1',
        speaker: '午夜管理员',
        portrait: '🛡️',
        text: '深夜还在抽卡？...有意思。我是这个系统的管理员，负责维护午夜时段的数据安全。很少有人在这个时间还在使用占卜系统。你的执着引起了我的注意。',
        timeLimit: 40,
        choices: [
          {
            id: 'admin_choice_1a',
            text: '管理员？你能看到系统的底层吗？',
            nextDialog: 'admin_dialog_2a',
            reward: null
          },
          {
            id: 'admin_choice_1b',
            text: '我只是睡不着而已...',
            nextDialog: 'admin_dialog_2b',
            reward: null
          },
          {
            id: 'admin_choice_1c',
            text: '你在监视我？',
            nextDialog: 'admin_dialog_2c',
            reward: null
          }
        ]
      },
      {
        id: 'admin_dialog_2a',
        speaker: '午夜管理员',
        portrait: '🛡️',
        text: '是的，我可以看到所有数据的流动。包括那些...不应该存在的卡牌。我手中有一张被系统标记为"已删除"但仍在数据流中徘徊的传说级卡牌。你想拥有它吗？',
        timeLimit: 30,
        choices: [
          {
            id: 'admin_choice_2a1',
            text: '我要那张传说卡牌！',
            nextDialog: null,
            reward: {
              type: VISITOR_REWARD_TYPE.EXCLUSIVE_CARD,
              cardId: 'visitor_admin_key',
              sideEffects: [
                { type: 'increase_reversed_chance', value: 0.25, duration: 5 }
              ]
            }
          },
          {
            id: 'admin_choice_2a2',
            text: '"已删除"的卡牌...会不会有风险？',
            nextDialog: null,
            reward: {
              type: VISITOR_REWARD_TYPE.RARITY_BOOST,
              rarity: 'legendary',
              multiplier: 1.8,
              duration: 3
            }
          }
        ]
      },
      {
        id: 'admin_dialog_2b',
        speaker: '午夜管理员',
        portrait: '🛡️',
        text: '失眠的人总有一种特殊的频率。让我为你调整一下系统参数，让你的命运在深夜更加顺遂。毕竟，夜班的人应该互相帮助。',
        timeLimit: 20,
        choices: [
          {
            id: 'admin_choice_2b1',
            text: '谢谢你，管理员。',
            nextDialog: null,
            reward: {
              type: VISITOR_REWARD_TYPE.RARITY_BOOST,
              rarity: 'epic',
              multiplier: 1.6,
              duration: 8,
              sideEffects: [
                { type: 'decrease_reversed_chance', value: 0.1, duration: 8 }
              ]
            }
          }
        ]
      },
      {
        id: 'admin_dialog_2c',
        speaker: '午夜管理员',
        portrait: '🛡️',
        text: '不是监视，是守护。这个系统有它不为人知的危险面，而我的职责是在黑暗中守护每一个使用者。不过你的警觉性很好——这样的人才能在赛博世界中活得长久。',
        timeLimit: 25,
        choices: [
          {
            id: 'admin_choice_2c1',
            text: '如果你是守护者，那我信任你。',
            nextDialog: null,
            reward: {
              type: VISITOR_REWARD_TYPE.EXCLUSIVE_CARD,
              cardId: 'visitor_admin_key',
              sideEffects: []
            }
          },
          {
            id: 'admin_choice_2c2',
            text: '我会保持警惕，但谢谢你的好意。',
            nextDialog: null,
            reward: {
              type: VISITOR_REWARD_TYPE.CATEGORY_BOOST,
              category: 'tech',
              multiplier: 1.5,
              duration: 8
            }
          }
        ]
      }
    ],
    exclusiveCards: [
      {
        id: 'visitor_admin_key',
        name: '管理员密钥',
        category: 'tech',
        rarity: 'legendary',
        symbol: '🔑',
        keywords: ['权限', '秘密', '系统核心'],
        isVisitorExclusive: true,
        visitorId: 'visitor_midnight_admin',
        upright: {
          title: '正位 · 系统之钥',
          meaning: '午夜管理员授予你这张密钥卡牌，它打开了通往系统核心的大门。你看到了常人无法看到的底层代码，理解了命运运转的真正机制。',
          advice: '拥有了知识，就拥有了选择的权利。但记住，有些门一旦打开就无法关闭。',
          fortune: '事业：★★★★★  感情：★★★★☆  财运：★★★★★'
        },
        reversed: {
          title: '逆位 · 权限失控',
          meaning: '密钥的权限在逆位时失控，系统开始不受控制地运转。管理员也无法阻止它，因为这是密钥本身的意志。',
          advice: '放下对控制的执念。有时候，让系统自行运转反而能得到更好的结果。',
          fortune: '事业：★★★☆☆  感情：★★☆☆☆  财运：★★★★☆'
        }
      }
    ]
  },
  {
    id: 'visitor_ghost_cardmaker',
    name: '幽灵造牌师',
    description: '传说中创造赛博塔罗牌的神秘存在，只在抽到传说级卡牌时短暂现身。',
    icon: '✨',
    color: '#ffd54f',
    glowColor: 'rgba(255, 213, 79, 0.3)',
    rarity: 'legendary',
    cooldownMs: 172800000,
    trigger: {
      type: VISITOR_TRIGGER_TYPE.LEGENDARY_DRAW,
      minDraws: 80,
      probability: 0.3
    },
    dialog: [
      {
        id: 'ghost_dialog_1',
        speaker: '幽灵造牌师',
        portrait: '✨',
        text: '......你抽到了一张传说之牌。很少有人在抽到传说时还能保持清醒。我是这些卡牌的创造者——或者说，我曾经是。在你手中的那张牌，承载着我最后的意志。',
        timeLimit: 45,
        choices: [
          {
            id: 'ghost_choice_1a',
            text: '你创造了赛博塔罗牌？为什么？',
            nextDialog: 'ghost_dialog_2a',
            reward: null
          },
          {
            id: 'ghost_choice_1b',
            text: '最后的意志...你即将消失吗？',
            nextDialog: 'ghost_dialog_2b',
            reward: null
          }
        ]
      },
      {
        id: 'ghost_dialog_2a',
        speaker: '幽灵造牌师',
        portrait: '✨',
        text: '为了守护。赛博世界需要一个能指引命运的导航系统，于是我创造了塔罗牌。但创造的过程消耗了我的存在。现在我只是一段残存的代码，在这张传说牌中徘徊。选择吧——让我以卡牌的形式继续守护你，还是让我消散，换取一时的奇迹？',
        timeLimit: 35,
        choices: [
          {
            id: 'ghost_choice_2a1',
            text: '我选择让你继续存在，以卡牌的形式守护我。',
            nextDialog: null,
            reward: {
              type: VISITOR_REWARD_TYPE.EXCLUSIVE_CARD,
              cardId: 'visitor_ghost_crest',
              sideEffects: []
            }
          },
          {
            id: 'ghost_choice_2a2',
            text: '让我用你的力量创造一次奇迹吧！',
            nextDialog: null,
            reward: {
              type: VISITOR_REWARD_TYPE.RARITY_BOOST,
              rarity: 'legendary',
              multiplier: 3.0,
              duration: 1,
              sideEffects: [
                { type: 'increase_reversed_chance', value: 0.3, duration: 1 }
              ]
            }
          }
        ]
      },
      {
        id: 'ghost_dialog_2b',
        speaker: '幽灵造牌师',
        portrait: '✨',
        text: '也许吧...但在消失之前，我想把最后一笔力量注入一张全新的卡牌。这是我给这个世界的临别赠礼——一张承载着造牌师全部记忆的传说之牌。',
        timeLimit: 30,
        choices: [
          {
            id: 'ghost_choice_2b1',
            text: '我会珍惜这张卡牌，以及你的记忆。',
            nextDialog: null,
            reward: {
              type: VISITOR_REWARD_TYPE.EXCLUSIVE_CARD,
              cardId: 'visitor_ghost_crest',
              sideEffects: [
                { type: 'decrease_reversed_chance', value: 0.1, duration: 10 }
              ]
            }
          }
        ]
      }
    ],
    exclusiveCards: [
      {
        id: 'visitor_ghost_crest',
        name: '造牌师纹章',
        category: 'mystic',
        rarity: 'legendary',
        symbol: '✨',
        keywords: ['创造', '传承', '最终意志'],
        isVisitorExclusive: true,
        visitorId: 'visitor_ghost_cardmaker',
        upright: {
          title: '正位 · 创造者遗志',
          meaning: '幽灵造牌师将自己最后的意志凝聚成这张纹章。当你握住它时，能感受到那个创造一切的灵魂的温度。这不是一张普通的卡牌，而是一段传奇的延续。',
          advice: '你手中握着的不仅是力量，更是责任。用这份传承去创造属于你自己的传说。',
          fortune: '事业：★★★★★  感情：★★★★★  财运：★★★★★'
        },
        reversed: {
          title: '逆位 · 创造者的遗憾',
          meaning: '造牌师的遗憾在逆位中浮现。它后悔创造了这个系统，因为它看到了太多人被命运束缚。也许，自由意志才是最珍贵的。',
          advice: '不要被任何系统定义，包括这个占卜系统。你才是自己命运的创造者。',
          fortune: '事业：★★★★☆  感情：★★★★☆  财运：★★★☆☆'
        }
      }
    ]
  }
]

export const getVisitorById = (id) => {
  return MYSTERIOUS_VISITORS.find(v => v.id === id)
}

export const getVisitorExclusiveCard = (visitorId, cardId) => {
  const visitor = getVisitorById(visitorId)
  if (!visitor) return null
  return visitor.exclusiveCards.find(c => c.id === cardId) || null
}

export const getAllExclusiveCards = () => {
  return MYSTERIOUS_VISITORS.flatMap(v => v.exclusiveCards)
}
