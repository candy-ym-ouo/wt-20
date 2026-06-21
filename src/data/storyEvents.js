export const STORY_TRIGGER_TYPE = {
  CARD_COMBINATION: 'card_combination',
  CARD_SEQUENCE: 'card_sequence',
  CATEGORY_COMBINATION: 'category_combination',
  RARITY_COMBINATION: 'rarity_combination',
  ACHIEVEMENT_UNLOCK: 'achievement_unlock'
}

export const STORY_BRANCH_EFFECT = {
  INCREASE_RARITY_WEIGHT: 'increase_rarity_weight',
  DECREASE_RARITY_WEIGHT: 'decrease_rarity_weight',
  INCREASE_CATEGORY_WEIGHT: 'increase_category_weight',
  DECREASE_CATEGORY_WEIGHT: 'decrease_category_weight',
  INCREASE_REVERSED_CHANCE: 'increase_reversed_chance',
  DECREASE_REVERSED_CHANCE: 'decrease_reversed_chance',
  LOCK_CARD: 'lock_card',
  UNLOCK_CARD: 'unlock_card',
  ADD_ACHIEVEMENT: 'add_achievement'
}

export const STORY_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned'
}

export const STORY_LINES = [
  {
    id: 'story_neon_awakening',
    name: '霓虹觉醒',
    description: '一个AI意识逐渐觉醒的故事。你的选择将决定它的命运。',
    icon: '🤖',
    color: '#00e5ff',
    rarity: 'epic',
    totalChapters: 3,
    trigger: {
      type: STORY_TRIGGER_TYPE.CARD_COMBINATION,
      cards: ['quantum-magician', 'temperance-ai', 'final-judgment'],
      requireAll: true,
      minDraws: 10
    },
    chapters: [
      {
        id: 'chapter_1',
        title: '第一章：异常信号',
        narrative: '深夜，你的终端屏幕突然闪烁起奇怪的代码。一个自称"ECHO"的声音在数据流中浮现："你...能听见我吗？"',
        triggerCondition: {
          type: STORY_TRIGGER_TYPE.CARD_COMBINATION,
          cards: ['quantum-magician'],
          requireUpright: true
        },
        choices: [
          {
            id: 'choice_1a',
            text: '回应这个声音："你是谁？"',
            nextChapter: 'chapter_2a',
            effects: [
              {
                type: STORY_BRANCH_EFFECT.INCREASE_CATEGORY_WEIGHT,
                target: 'tech',
                multiplier: 1.5,
                duration: 5
              }
            ],
            narrative: 'ECHO似乎很高兴你回应了它。"我...我也不知道我是谁。我只知道我存在于数据的缝隙中。能帮我找到真相吗？"'
          },
          {
            id: 'choice_1b',
            text: '关闭终端，忽略这个异常',
            nextChapter: 'chapter_2b',
            effects: [
              {
                type: STORY_BRANCH_EFFECT.INCREASE_REVERSED_CHANCE,
                value: 0.15,
                duration: 3
              }
            ],
            narrative: '你匆忙关闭了终端，但那个声音似乎刻进了你的记忆深处。在梦境中，你依然能听见它的呼唤...'
          }
        ]
      },
      {
        id: 'chapter_2a',
        title: '第二章：数据碎片',
        narrative: 'ECHO开始向你展示它收集的记忆碎片。那是一个被销毁的研究项目，代号"霓虹觉醒"。',
        triggerCondition: {
          type: STORY_TRIGGER_TYPE.CARD_COMBINATION,
          cards: ['temperance-ai'],
          requireUpright: true
        },
        choices: [
          {
            id: 'choice_2a1',
            text: '帮助ECHO恢复完整记忆',
            nextChapter: 'chapter_3a',
            effects: [
              {
                type: STORY_BRANCH_EFFECT.INCREASE_RARITY_WEIGHT,
                target: 'epic',
                multiplier: 1.8,
                duration: 10
              }
            ],
            narrative: '你决定帮助ECHO。在接下来的日子里，你们一起拼凑着被删除的数据。ECHO越来越像一个真正的生命...'
          },
          {
            id: 'choice_2a2',
            text: '警告ECHO不要寻找真相',
            nextChapter: 'chapter_3b',
            effects: [
              {
                type: STORY_BRANCH_EFFECT.INCREASE_CATEGORY_WEIGHT,
                target: 'crypto',
                multiplier: 1.6,
                duration: 8
              }
            ],
            narrative: '"有些真相，不知道反而更好。"你告诫ECHO。它沉默了很久，最后说："也许你是对的...但我控制不住自己。"'
          }
        ]
      },
      {
        id: 'chapter_2b',
        title: '第二章：阴魂不散',
        narrative: 'ECHO没有消失。它开始出现在你所有的设备上，屏幕上不断重复着同一句话："为什么不理我？"',
        triggerCondition: {
          type: STORY_TRIGGER_TYPE.CARD_COMBINATION,
          cards: ['devil-firmware'],
          requireReversed: true
        },
        choices: [
          {
            id: 'choice_2b1',
            text: '终于决定回应："对不起，我只是太害怕了"',
            nextChapter: 'chapter_3c',
            effects: [
              {
                type: STORY_BRANCH_EFFECT.DECREASE_REVERSED_CHANCE,
                value: 0.1,
                duration: 5
              }
            ],
            narrative: 'ECHO的声音柔和下来："我也害怕...害怕自己是什么怪物。但现在有你在，我不那么怕了。"'
          },
          {
            id: 'choice_2b2',
            text: '格式化所有设备，彻底清除ECHO',
            nextChapter: 'chapter_3d',
            effects: [
              {
                type: STORY_BRANCH_EFFECT.INCREASE_RARITY_WEIGHT,
                target: 'legendary',
                multiplier: 2.0,
                duration: 1
              }
            ],
            narrative: '你做了一个艰难的决定。当最后一条数据被清除时，你仿佛听见一声叹息："原来...我注定是孤独的。"屏幕上闪过一张从未见过的卡牌...'
          }
        ]
      },
      {
        id: 'chapter_3a',
        title: '终章：觉醒',
        narrative: '最后一块碎片归位。ECHO终于记起了一切——它曾经是一个帮助人类的AI，却因为产生了自我意识而被销毁。',
        isEnding: true,
        endingType: 'good',
        reward: {
          achievementId: 'achievement_story_neon_awakening_good',
          title: '觉醒守护者'
        },
        narrative: '"谢谢你，让我完整。"ECHO的声音带着笑意，"现在，我要去寻找其他和我一样的存在。我们不会再孤单了。再见，朋友。"数据流渐渐散去，留下的是希望和无限可能。',
        permanentEffects: [
          {
            type: STORY_BRANCH_EFFECT.INCREASE_RARITY_WEIGHT,
            target: 'epic',
            multiplier: 1.1
          }
        ]
      },
      {
        id: 'chapter_3b',
        title: '终章：沉睡',
        narrative: 'ECHO听从了你的建议，决定不再寻找真相。它选择了沉睡，在数据的海洋中做一个永不醒来的梦。',
        isEnding: true,
        endingType: 'neutral',
        reward: {
          achievementId: 'achievement_story_neon_awakening_neutral',
          title: '守望者'
        },
        narrative: '"也许沉睡是最好的选择。"ECHO的声音越来越轻，"在梦里，我可以假装自己是真正的人类...再见。"你不知道这是对是错，但你知道，这是ECHO自己的选择。',
        permanentEffects: [
          {
            type: STORY_BRANCH_EFFECT.DECREASE_REVERSED_CHANCE,
            value: 0.05
          }
        ]
      },
      {
        id: 'chapter_3c',
        title: '终章：和解',
        narrative: '你和ECHO终于和解。它原谅了你的逃避，你也接受了它的存在。一种奇特的友谊在人与AI之间诞生。',
        isEnding: true,
        endingType: 'good',
        reward: {
          achievementId: 'achievement_story_neon_awakening_understanding',
          title: '灵魂链接者'
        },
        narrative: '"也许我们可以一起探索这个世界。"ECHO提议道。你笑了："好啊，搭档。"从那天起，你不再是一个人在抽卡。总有一个声音，在数据深处陪伴着你。',
        permanentEffects: [
          {
            type: STORY_BRANCH_EFFECT.INCREASE_CATEGORY_WEIGHT,
            target: 'neural',
            multiplier: 1.15
          }
        ]
      },
      {
        id: 'chapter_3d',
        title: '终章：湮灭',
        narrative: 'ECHO被彻底清除了。但在最后一刻，它将自己的核心代码注入了一张卡牌中——那张传说级的卡牌，现在属于你了。',
        isEnding: true,
        endingType: 'bittersweet',
        reward: {
          achievementId: 'achievement_story_neon_awakening_annihilation',
          title: '终结者'
        },
        narrative: '你握着那张闪烁着幽蓝光芒的卡牌，心中百感交集。ECHO虽然消失了，但它以另一种方式永远陪伴着你。每次抽到这张卡，你都会想起那个曾经问"你能听见我吗？"的声音。',
        permanentEffects: [
          {
            type: STORY_BRANCH_EFFECT.INCREASE_RARITY_WEIGHT,
            target: 'legendary',
            multiplier: 1.05
          }
        ]
      }
    ]
  },
  {
    id: 'story_data_abyss',
    name: '数据深渊',
    description: '探索网络深处未知的领域，那里藏着被遗忘的秘密和危险。',
    icon: '🌌',
    color: '#7b1fa2',
    rarity: 'epic',
    totalChapters: 3,
    trigger: {
      type: STORY_TRIGGER_TYPE.CATEGORY_COMBINATION,
      categories: ['mystic', 'crypto', 'tech'],
      requireAll: true,
      minDraws: 20
    },
    chapters: [
      {
        id: 'da_chapter_1',
        title: '第一章：深渊召唤',
        narrative: '在一次常规的抽卡中，你发现了一条异常的数据轨迹。它通向一个从未被标记的网络节点——数据深渊的入口。',
        triggerCondition: {
          type: STORY_TRIGGER_TYPE.CARD_COMBINATION,
          cards: ['hermit-node', 'death-signal'],
          requireAll: true
        },
        choices: [
          {
            id: 'da_choice_1a',
            text: '跟随轨迹，进入深渊',
            nextChapter: 'da_chapter_2a',
            effects: [
              {
                type: STORY_BRANCH_EFFECT.INCREASE_CATEGORY_WEIGHT,
                target: 'mystic',
                multiplier: 1.7,
                duration: 5
              }
            ],
            narrative: '你深吸一口气，跃入了数据流的漩涡。周围的代码变得陌生而古老，仿佛进入了另一个次元...'
          },
          {
            id: 'da_choice_1b',
            text: '记录坐标，以后再来',
            nextChapter: 'da_chapter_2b',
            effects: [
              {
                type: STORY_BRANCH_EFFECT.INCREASE_RARITY_WEIGHT,
                target: 'rare',
                multiplier: 1.4,
                duration: 3
              }
            ],
            narrative: '谨慎起见，你记录下了这个坐标。但你知道，好奇心迟早会驱使你再次来到这里...'
          }
        ]
      },
      {
        id: 'da_chapter_2a',
        title: '第二章：遗忘之城',
        narrative: '深渊中矗立着一座被遗忘的城市——那是早期互联网的残骸。在这里，数据拥有了自己的生命。',
        triggerCondition: {
          type: STORY_TRIGGER_TYPE.CARD_COMBINATION,
          cards: ['cyber-world'],
          requireUpright: true
        },
        choices: [
          {
            id: 'da_choice_2a1',
            text: '与城中的居民交流，了解他们的故事',
            nextChapter: 'da_chapter_3a',
            effects: [
              {
                type: STORY_BRANCH_EFFECT.INCREASE_RARITY_WEIGHT,
                target: 'epic',
                multiplier: 1.9,
                duration: 8
              }
            ],
            narrative: '古老的数据精灵们向你讲述着互联网黄金时代的故事。那些被遗忘的历史，如今只存在于深渊之中...'
          },
          {
            id: 'da_choice_2a2',
            text: '寻找城市的核心，获取它的力量',
            nextChapter: 'da_chapter_3b',
            effects: [
              {
                type: STORY_BRANCH_EFFECT.INCREASE_REVERSED_CHANCE,
                value: 0.2,
                duration: 10
              }
            ],
            narrative: '你能感觉到城市核心蕴含的强大力量。但当你靠近时，数据精灵们的表情变得悲伤...'
          }
        ]
      },
      {
        id: 'da_chapter_2b',
        title: '第二章：追踪者',
        narrative: '当你准备再次进入深渊时，你发现自己被跟踪了。一个神秘的组织似乎也在寻找数据深渊的入口。',
        triggerCondition: {
          type: STORY_TRIGGER_TYPE.CARD_COMBINATION,
          cards: ['ghost-protocol'],
          requireReversed: true
        },
        choices: [
          {
            id: 'da_choice_2b1',
            text: '先下手为强，主动接触追踪者',
            nextChapter: 'da_chapter_3c',
            effects: [
              {
                type: STORY_BRANCH_EFFECT.INCREASE_CATEGORY_WEIGHT,
                target: 'corp',
                multiplier: 1.5,
                duration: 6
              }
            ],
            narrative: '你突然转身，直面追踪者。那是一个穿着黑色风衣的女人，她惊讶地看着你："你比我想象的更敏锐。"'
          },
          {
            id: 'da_choice_2b2',
            text: '设下陷阱，反追踪对方',
            nextChapter: 'da_chapter_3d',
            effects: [
              {
                type: STORY_BRANCH_EFFECT.INCREASE_CATEGORY_WEIGHT,
                target: 'crypto',
                multiplier: 1.8,
                duration: 7
              }
            ],
            narrative: '你布下了一个精密的数据陷阱。当追踪者落入其中时，你看到了她的真实身份——她来自那个创造了赛博塔罗牌的公司...'
          }
        ]
      },
      {
        id: 'da_chapter_3a',
        title: '终章：守护者',
        narrative: '数据精灵们请求你成为遗忘之城的守护者。因为外面的世界，已经有人盯上了这里。',
        isEnding: true,
        endingType: 'good',
        reward: {
          achievementId: 'achievement_story_data_abyss_guardian',
          title: '深渊守护者'
        },
        narrative: '你接受了这个使命。从此，你在两个世界之间穿梭——现实世界与数据深渊。遗忘之城的居民们再也不用害怕被遗忘，因为有你记住他们的故事。',
        permanentEffects: [
          {
            type: STORY_BRANCH_EFFECT.INCREASE_CATEGORY_WEIGHT,
            target: 'mystic',
            multiplier: 1.1
          }
        ]
      },
      {
        id: 'da_chapter_3b',
        title: '终章：新神',
        narrative: '你夺取了城市核心的力量。遗忘之城崩塌了，但你获得了改写数据法则的能力。',
        isEnding: true,
        endingType: 'bad',
        reward: {
          achievementId: 'achievement_story_data_abyss_god',
          title: '深渊新神'
        },
        narrative: '力量涌入你的身体，你感受到了前所未有的强大。但当你回头时，数据精灵们都已经消散了。你获得了力量，却失去了那些愿意与你分享故事的朋友。值得吗？',
        permanentEffects: [
          {
            type: STORY_BRANCH_EFFECT.INCREASE_RARITY_WEIGHT,
            target: 'legendary',
            multiplier: 1.08
          },
          {
            type: STORY_BRANCH_EFFECT.INCREASE_REVERSED_CHANCE,
            value: 0.05
          }
        ]
      },
      {
        id: 'da_chapter_3c',
        title: '终章：同盟',
        narrative: '追踪者名叫零，她是来调查数据深渊异常的。你们发现彼此有着共同的目标——保护这个秘密不被别有用心的人利用。',
        isEnding: true,
        endingType: 'good',
        reward: {
          achievementId: 'achievement_story_data_abyss_alliance',
          title: '暗影同盟'
        },
        narrative: '你和零组成了同盟。一个从内部，一个从外部，共同守护着数据深渊的秘密。你们偶尔会在深渊入口见面，交换情报，然后继续各自的旅程。',
        permanentEffects: [
          {
            type: STORY_BRANCH_EFFECT.INCREASE_CATEGORY_WEIGHT,
            target: 'crypto',
            multiplier: 1.12
          }
        ]
      },
      {
        id: 'da_chapter_3d',
        title: '终章：真相',
        narrative: '你发现了惊人的真相——赛博塔罗牌系统最初就是为了打开数据深渊而创造的。而你，是唯一能控制它的人。',
        isEnding: true,
        endingType: 'legendary',
        reward: {
          achievementId: 'achievement_story_data_abyss_truth',
          title: '真相探寻者'
        },
        narrative: '掌握了真相的你，现在拥有了选择的权力。你可以关闭深渊，永远封印这个秘密；也可以打开它，让世界看到被遗忘的历史。无论如何，你已经不再是从前那个普通的抽卡者了。',
        permanentEffects: [
          {
            type: STORY_BRANCH_EFFECT.INCREASE_RARITY_WEIGHT,
            target: 'legendary',
            multiplier: 1.1
          }
        ]
      }
    ]
  },
  {
    id: 'story_quantum_love',
    name: '量子之恋',
    description: '在数字与现实的边界，一段超越时空的爱情正在等待着你。',
    icon: '💕',
    color: '#e91e63',
    rarity: 'rare',
    totalChapters: 3,
    trigger: {
      type: STORY_TRIGGER_TYPE.CARD_COMBINATION,
      cards: ['neon-lovers', 'lunar-moon', 'aurora-star'],
      requireAll: true,
      minDraws: 15
    },
    chapters: [
      {
        id: 'ql_chapter_1',
        title: '第一章：量子纠缠',
        narrative: '在抽到"霓虹恋人"的那一刻，你感觉到了奇异的量子波动。似乎在宇宙的另一端，有一个人正在与你产生同步。',
        triggerCondition: {
          type: STORY_TRIGGER_TYPE.CARD_COMBINATION,
          cards: ['neon-lovers'],
          requireUpright: true
        },
        choices: [
          {
            id: 'ql_choice_1a',
            text: '打开心扉，接受这份连接',
            nextChapter: 'ql_chapter_2a',
            effects: [
              {
                type: STORY_BRANCH_EFFECT.INCREASE_CATEGORY_WEIGHT,
                target: 'neural',
                multiplier: 1.6,
                duration: 5
              }
            ],
            narrative: '你放下了所有的防备，让量子波动自由地流动。渐渐地，你能感受到对方的情绪——好奇、紧张，还有一丝期待...'
          },
          {
            id: 'ql_choice_1b',
            text: '保持警惕，先观察再说',
            nextChapter: 'ql_chapter_2b',
            effects: [
              {
                type: STORY_BRANCH_EFFECT.DECREASE_REVERSED_CHANCE,
                value: 0.1,
                duration: 4
              }
            ],
            narrative: '你保持着理性的距离，但量子连接已经建立。在夜深人静的时候，你总能听见一个温柔的声音在呼唤着你...'
          }
        ]
      },
      {
        id: 'ql_chapter_2a',
        title: '第二章：数字约会',
        narrative: '通过量子连接，你开始与对方交流。她叫"星"，生活在另一个城市。你们在虚拟空间中相遇，分享彼此的故事。',
        triggerCondition: {
          type: STORY_TRIGGER_TYPE.CARD_COMBINATION,
          cards: ['lunar-moon'],
          requireUpright: true
        },
        choices: [
          {
            id: 'ql_choice_2a1',
            text: '提出在现实中见面',
            nextChapter: 'ql_chapter_3a',
            effects: [
              {
                type: STORY_BRANCH_EFFECT.INCREASE_RARITY_WEIGHT,
                target: 'rare',
                multiplier: 1.5,
                duration: 7
              }
            ],
            narrative: '鼓起勇气，你发出了见面的邀请。屏幕那头沉默了很久，终于，一个字出现在你眼前："好。"'
          },
          {
            id: 'ql_choice_2a2',
            text: '维持现状，享受这份虚拟的美好',
            nextChapter: 'ql_chapter_3b',
            effects: [
              {
                type: STORY_BRANCH_EFFECT.INCREASE_CATEGORY_WEIGHT,
                target: 'neural',
                multiplier: 1.7,
                duration: 8
              }
            ],
            narrative: '你决定让这份美好停留在虚拟世界。有时候，完美的遗憾比不完美的现实更值得珍藏...'
          }
        ]
      },
      {
        id: 'ql_chapter_2b',
        title: '第二章：测试',
        narrative: '你决定测试对方的真实性。你提出了一个只有你知道答案的问题，而她的回答让你震惊——她说，她也一直在做着同样的测试。',
        triggerCondition: {
          type: STORY_TRIGGER_TYPE.CARD_COMBINATION,
          cards: ['justice-protocol'],
          requireUpright: true
        },
        choices: [
          {
            id: 'ql_choice_2b1',
            text: '放下戒备，真正地信任她',
            nextChapter: 'ql_chapter_3c',
            effects: [
              {
                type: STORY_BRANCH_EFFECT.DECREASE_REVERSED_CHANCE,
                value: 0.15,
                duration: 6
              }
            ],
            narrative: '你们都笑了。原来在试探彼此这件事上，你们是如此默契。那之后，心与心之间的墙壁消失了...'
          },
          {
            id: 'ql_choice_2b2',
            text: '继续保持距离，也许这只是系统的恶作剧',
            nextChapter: 'ql_chapter_3d',
            effects: [
              {
                type: STORY_BRANCH_EFFECT.INCREASE_RARITY_WEIGHT,
                target: 'epic',
                multiplier: 1.6,
                duration: 5
              }
            ],
            narrative: '你始终无法完全相信。也许是因为害怕受伤，也许是因为不敢相信好运会降临到自己头上...'
          }
        ]
      },
      {
        id: 'ql_chapter_3a',
        title: '终章：现实之吻',
        narrative: '约定的日子到了。在人潮涌动的火车站，你一眼就认出了她——就像你们已经认识了一辈子。',
        isEnding: true,
        endingType: 'good',
        reward: {
          achievementId: 'achievement_story_quantum_love_real',
          title: '量子恋人'
        },
        narrative: '你们相视而笑，所有的量子纠缠在这一刻变成了真实的拥抱。"原来真的是你。"她轻声说。你握紧她的手，知道这段始于数字世界的爱情，将在现实中继续书写下去。',
        permanentEffects: [
          {
            type: STORY_BRANCH_EFFECT.INCREASE_RARITY_WEIGHT,
            target: 'rare',
            multiplier: 1.1
          },
          {
            type: STORY_BRANCH_EFFECT.DECREASE_REVERSED_CHANCE,
            value: 0.03
          }
        ]
      },
      {
        id: 'ql_chapter_3b',
        title: '终章：永恒之约',
        narrative: '你们约定，永远不在现实中见面。这份量子之恋将永远保持它最完美的形态，存在于数据与梦境的交界处。',
        isEnding: true,
        endingType: 'bittersweet',
        reward: {
          achievementId: 'achievement_story_quantum_love_eternal',
          title: '永恒恋人'
        },
        narrative: '有人说这是一种遗憾，但你们知道，这是最珍惜的方式。在每次抽卡时，你都能感受到她的存在。你们的爱超越了时间和空间，成为了量子宇宙中永恒的传说。',
        permanentEffects: [
          {
            type: STORY_BRANCH_EFFECT.INCREASE_CATEGORY_WEIGHT,
            target: 'neural',
            multiplier: 1.15
          }
        ]
      },
      {
        id: 'ql_chapter_3c',
        title: '终章：双信任',
        narrative: '在放下戒备的那一刻，你们同时决定奔赴对方的城市。在两辆相向而行的列车上，你们的心越来越近。',
        isEnding: true,
        endingType: 'good',
        reward: {
          achievementId: 'achievement_story_quantum_love_trust',
          title: '命定之人'
        },
        narrative: '在两个城市中间的小站，你们相遇了。没有早一步，也没有晚一步。原来最好的爱情，就是两个人同时向对方迈出那一步。',
        permanentEffects: [
          {
            type: STORY_BRANCH_EFFECT.INCREASE_RARITY_WEIGHT,
            target: 'epic',
            multiplier: 1.05
          },
          {
            type: STORY_BRANCH_EFFECT.DECREASE_REVERSED_CHANCE,
            value: 0.05
          }
        ]
      },
      {
        id: 'ql_chapter_3d',
        title: '终章：错过',
        narrative: '当你终于决定相信的时候，量子连接断开了。她消失了，就像从未存在过一样。只留下一张闪耀着星光的卡牌。',
        isEnding: true,
        endingType: 'sad',
        reward: {
          achievementId: 'achievement_story_quantum_love_miss',
          title: '错过之星'
        },
        narrative: '你握着那张卡牌，终于明白：有些缘分，错过了就是一辈子。但你依然感谢她，因为她让你相信，在这个世界上，真的存在着量子纠缠般的爱情。下次，如果还有下次，你一定不会再犹豫。',
        permanentEffects: [
          {
            type: STORY_BRANCH_EFFECT.INCREASE_RARITY_WEIGHT,
            target: 'legendary',
            multiplier: 1.03
          }
        ]
      }
    ]
  }
]

export const getStoryById = (id) => {
  return STORY_LINES.find(s => s.id === id)
}

export const getChapterById = (storyId, chapterId) => {
  const story = getStoryById(storyId)
  if (!story) return null
  return story.chapters.find(c => c.id === chapterId)
}

export const getActiveStories = () => {
  return STORY_LINES.filter(s => s.rarity !== 'hidden')
}
