import { Storage } from './storage.js'
import { getCardById, getAllCards } from './cardSystem.js'
import {
  THEME_CONFIG,
  CATEGORY_CONFIG,
  RARITY_CONFIG,
  CARD_RARITY
} from '../data/constants.js'
import { ACHIEVEMENTS } from '../data/achievements.js'

export function getWeekKey(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  const year = monday.getFullYear()
  const month = String(monday.getMonth() + 1).padStart(2, '0')
  const dateNum = String(monday.getDate()).padStart(2, '0')
  return `${year}${month}${dateNum}`
}

export function getWeekRange(weekKey) {
  const year = parseInt(weekKey.slice(0, 4))
  const month = parseInt(weekKey.slice(4, 6)) - 1
  const date = parseInt(weekKey.slice(6, 8))
  const start = new Date(year, month, date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export function getWeekLabel(weekKey) {
  const { start, end } = getWeekRange(weekKey)
  const fmt = (d) => `${d.getMonth() + 1}/${d.getDate()}`
  return `${fmt(start)} ~ ${fmt(end)}`
}

export function formatWeekDate(date) {
  const d = new Date(date)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}/${d.getDate()} ${weekdays[d.getDay()]}`
}

export function getAllWeekKeys() {
  const keys = new Set()
  keys.add(getWeekKey())

  const addFromTimestamps = (timestamps) => {
    timestamps.forEach(ts => {
      if (ts) keys.add(getWeekKey(ts))
    })
  }

  Storage.getDrawHistory().forEach(r => addFromTimestamps([r.timestamp]))
  Storage.getDailyFortuneHistory().forEach(r => addFromTimestamps([r.timestamp]))
  Storage.getThemeDivinationHistory().forEach(r => addFromTimestamps([r.timestamp]))
  Storage.getMultiSpreadHistory().forEach(r => addFromTimestamps([r.timestamp]))
  Storage.getHiddenEventsLog().forEach(r => addFromTimestamps([r.unlockedAt]))

  const collection = Storage.getCollection()
  Object.values(collection).forEach(c => {
    addFromTimestamps([c.firstDraw, c.lastDraw])
  })

  return Array.from(keys).sort((a, b) => b.localeCompare(a))
}

function isInRange(timestamp, start, end) {
  if (!timestamp) return false
  const ts = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime()
  return ts >= start.getTime() && ts <= end.getTime()
}

function parseFortuneScore(fortuneStr) {
  if (!fortuneStr) return { total: 0, categories: {} }
  const categories = ['事业', '感情', '财运']
  const result = { total: 0, categories: {} }
  let totalStars = 0
  let count = 0

  categories.forEach(cat => {
    const regex = new RegExp(`${cat}：([★☆]+)`)
    const match = fortuneStr.match(regex)
    if (match) {
      const stars = (match[1].match(/★/g) || []).length
      result.categories[cat] = stars
      totalStars += stars
      count++
    }
  })

  result.total = count > 0 ? Math.round((totalStars / (count * 5)) * 100) : 0
  return result
}

export function generateWeeklyReport(weekKey) {
  const { start, end } = getWeekRange(weekKey)
  const range = { start: start.getTime(), end: end.getTime() }

  const drawHistory = Storage.getDrawHistory()
  const dailyHistory = Storage.getDailyFortuneHistory()
  const themeHistory = Storage.getThemeDivinationHistory()
  const spreadHistory = Storage.getMultiSpreadHistory()
  const hiddenEventsLog = Storage.getHiddenEventsLog()
  const collection = Storage.getCollection()
  const allCards = getAllCards()

  const weekDraws = drawHistory.filter(r => isInRange(r.timestamp, start, end))
  const weekDaily = dailyHistory.filter(r => isInRange(r.timestamp, start, end))
  const weekTheme = themeHistory.filter(r => isInRange(r.timestamp, start, end))
  const weekSpread = spreadHistory.filter(r => isInRange(r.timestamp, start, end))
  const weekHiddenEvents = hiddenEventsLog.filter(r => isInRange(r.unlockedAt, start, end))

  const allWeekRecords = [
    ...weekDraws.map(r => ({ ...r, _type: 'divination' })),
    ...weekDaily.map(r => ({ ...r, _type: 'daily' })),
    ...weekTheme.map(r => ({ ...r, _type: 'theme' })),
    ...weekSpread.map(r => ({ ...r, _type: 'spread' }))
  ].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))

  const themeBreakdown = {}
  weekTheme.forEach(r => {
    const theme = r.theme
    if (!themeBreakdown[theme]) {
      themeBreakdown[theme] = { count: 0, cards: [] }
    }
    themeBreakdown[theme].count++
    if (r.cards) {
      themeBreakdown[theme].cards.push(...r.cards)
    }
  })

  const spreadTypeBreakdown = {}
  weekSpread.forEach(r => {
    const id = r.spreadId
    if (!spreadTypeBreakdown[id]) {
      spreadTypeBreakdown[id] = { count: 0, cards: [] }
    }
    spreadTypeBreakdown[id].count++
    if (r.cards) {
      spreadTypeBreakdown[id].cards.push(...r.cards)
    }
  })

  const allWeekCards = []
  const pushCard = (cardId, isReversed, meta = {}) => {
    const card = getCardById(cardId)
    if (card) {
      allWeekCards.push({ card, isReversed, ...meta })
    }
  }

  weekDraws.forEach(r => {
    if (r.spreadType === 'single') {
      pushCard(r.cardId, r.isReversed, { source: 'divination' })
    } else if (r.cards) {
      r.cards.forEach(c => pushCard(c.cardId, c.isReversed, { source: 'divination', position: c.position }))
    }
  })
  weekDaily.forEach(r => pushCard(r.cardId, r.isReversed, { source: 'daily' }))
  weekTheme.forEach(r => {
    if (r.cards) {
      r.cards.forEach(c => pushCard(c.cardId, c.isReversed, { source: 'theme', theme: r.theme, position: c.position }))
    }
  })
  weekSpread.forEach(r => {
    if (r.cards) {
      r.cards.forEach(c => pushCard(c.cardId, c.isReversed, { source: 'spread', spreadId: r.spreadId, position: c.position }))
    }
  })

  const cardFrequency = {}
  allWeekCards.forEach(({ card, isReversed }) => {
    if (!cardFrequency[card.id]) {
      cardFrequency[card.id] = { card, count: 0, uprightCount: 0, reversedCount: 0 }
    }
    cardFrequency[card.id].count++
    if (isReversed) {
      cardFrequency[card.id].reversedCount++
    } else {
      cardFrequency[card.id].uprightCount++
    }
  })

  const topCards = Object.values(cardFrequency)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const categoryStats = {}
  Object.values(CATEGORY_CONFIG).forEach(cfg => {
    categoryStats[cfg.label] = { count: 0, label: cfg.label, color: cfg.color, icon: cfg.icon }
  })
  allWeekCards.forEach(({ card }) => {
    const cfg = CATEGORY_CONFIG[card.category]
    if (cfg) {
      categoryStats[cfg.label].count++
    }
  })

  const rarityStats = {}
  Object.values(RARITY_CONFIG).forEach(cfg => {
    rarityStats[cfg.label] = { count: 0, label: cfg.label, color: cfg.color }
  })
  allWeekCards.forEach(({ card }) => {
    const cfg = RARITY_CONFIG[card.rarity]
    if (cfg) {
      rarityStats[cfg.label].count++
    }
  })

  const prevWeekStart = new Date(start)
  prevWeekStart.setDate(prevWeekStart.getDate() - 7)
  const prevWeekEnd = new Date(end)
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 7)

  const newCollectionCards = []
  Object.entries(collection).forEach(([cardId, data]) => {
    if (isInRange(data.firstDraw, start, end)) {
      const card = getCardById(cardId)
      if (card) {
        newCollectionCards.push({
          card,
          firstDraw: data.firstDraw,
          drawCount: data.drawCount,
          rarity: card.rarity
        })
      }
    }
  })

  const prevCollectionCount = Object.values(collection).filter(
    data => data.firstDraw && data.firstDraw < start.getTime()
  ).length
  const currentCollectionCount = Object.keys(collection).length
  const collectionGrowth = currentCollectionCount - prevCollectionCount
  const totalCardsCount = allCards.length
  const collectionProgress = Math.round((currentCollectionCount / totalCardsCount) * 100)

  const dailyFortuneTrend = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(start)
    day.setDate(day.getDate() + i)
    const dayStr = day.toDateString()
    const dayRecord = weekDaily.find(r => {
      const rDate = new Date(r.timestamp)
      return rDate.toDateString() === dayStr
    })

    let fortuneData = null
    if (dayRecord) {
      const parsed = parseFortuneScore(dayRecord.fortune)
      fortuneData = {
        score: parsed.total,
        categories: parsed.categories,
        cardId: dayRecord.cardId,
        cardName: getCardById(dayRecord.cardId)?.name,
        cardSymbol: getCardById(dayRecord.cardId)?.symbol,
        isReversed: dayRecord.isReversed,
        title: dayRecord.title
      }
    }

    dailyFortuneTrend.push({
      date: day.getTime(),
      dateLabel: formatWeekDate(day),
      dayOfWeek: ['一', '二', '三', '四', '五', '六', '日'][i],
      fortune: fortuneData
    })
  }

  const validScores = dailyFortuneTrend
    .filter(d => d.fortune)
    .map(d => d.fortune.score)
  const avgFortune = validScores.length > 0
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : 0

  let fortuneTrend = 'stable'
  let fortuneTrendLabel = '平稳'
  if (validScores.length >= 2) {
    const firstHalf = validScores.slice(0, Math.ceil(validScores.length / 2))
    const secondHalf = validScores.slice(Math.floor(validScores.length / 2))
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
    const diff = secondAvg - firstAvg
    if (diff > 10) {
      fortuneTrend = 'rising'
      fortuneTrendLabel = '上升'
    } else if (diff < -10) {
      fortuneTrend = 'falling'
      fortuneTrendLabel = '下降'
    }
  }

  const hiddenEventsDetails = weekHiddenEvents.map(event => {
    const achievement = ACHIEVEMENTS.find(a => a.id === event.achievementId)
    return {
      ...event,
      achievementIcon: achievement?.icon || '🏆',
      achievementName: achievement?.name || event.title,
      achievementDescription: achievement?.description || event.description
    }
  })

  const totalDrawsCount = allWeekCards.length
  const uprightCount = allWeekCards.filter(c => !c.isReversed).length
  const reversedCount = allWeekCards.filter(c => c.isReversed).length
  const reversedRate = totalDrawsCount > 0
    ? Math.round((reversedCount / totalDrawsCount) * 100)
    : 0

  const drawDays = new Set(
    allWeekRecords
      .filter(r => r.timestamp)
      .map(r => new Date(r.timestamp).toDateString())
  ).size

  const weeklyInsights = generateWeeklyInsights({
    totalDrawsCount,
    drawDays,
    topCards,
    categoryStats,
    rarityStats,
    themeBreakdown,
    avgFortune,
    fortuneTrend,
    newCollectionCards,
    hiddenEventsDetails,
    reversedRate
  })

  const report = {
    weekKey,
    weekLabel: getWeekLabel(weekKey),
    dateRange: {
      start: start.getTime(),
      end: end.getTime()
    },
    generatedAt: Date.now(),

    summary: {
      totalDraws: totalDrawsCount,
      divinationCount: weekDraws.length,
      dailyCount: weekDaily.length,
      themeCount: weekTheme.length,
      spreadCount: weekSpread.length,
      drawDays,
      uprightCount,
      reversedCount,
      reversedRate
    },

    themes: {
      breakdown: themeBreakdown,
      spreadBreakdown: spreadTypeBreakdown,
      topCards,
      categoryStats,
      rarityStats
    },

    collection: {
      growth: collectionGrowth,
      totalCollected: currentCollectionCount,
      totalCards: totalCardsCount,
      progress: collectionProgress,
      newCards: newCollectionCards.sort((a, b) => b.firstDraw - a.firstDraw)
    },

    hiddenEvents: {
      count: hiddenEventsDetails.length,
      events: hiddenEventsDetails
    },

    fortune: {
      trend: fortuneTrend,
      trendLabel: fortuneTrendLabel,
      averageScore: avgFortune,
      daily: dailyFortuneTrend
    },

    insights: weeklyInsights,
    hasData: totalDrawsCount > 0 || weekDaily.length > 0 || hiddenEventsDetails.length > 0
  }

  return report
}

function generateWeeklyInsights(data) {
  const insights = []

  if (data.totalDraws === 0) {
    insights.push({
      type: 'empty',
      icon: '🌙',
      title: '平静的一周',
      description: '本周还没有占卜记录，命运的数据流等待被激活...'
    })
    return insights
  }

  if (data.drawDays >= 5) {
    insights.push({
      type: 'positive',
      icon: '🔥',
      title: '热忱的探索者',
      description: `本周连续 ${data.drawDays} 天都有占卜记录，你对命运的探索充满热情！`
    })
  } else if (data.drawDays <= 2) {
    insights.push({
      type: 'neutral',
      icon: '🌱',
      title: '偶尔的连接',
      description: '本周只进行了少量占卜，或许可以更频繁地与命运对话？'
    })
  }

  if (data.topCards && data.topCards.length > 0) {
    const top = data.topCards[0]
    insights.push({
      type: 'highlight',
      icon: top.card.symbol,
      title: `本周之星：${top.card.name}`,
      description: `这张牌本周出现了 ${top.count} 次，${top.card.keywords.slice(0, 3).join('、')} 的能量环绕着你。`
    })
  }

  const dominantCategory = Object.values(data.categoryStats)
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count)[0]
  if (dominantCategory) {
    insights.push({
      type: 'theme',
      icon: dominantCategory.icon,
      title: `${dominantCategory.label}领域活跃`,
      description: `本周 ${dominantCategory.label} 属性的卡牌占比最高，该领域的能量流动强烈。`
    })
  }

  if (Object.keys(data.themes.breakdown).length > 0) {
    const topTheme = Object.entries(data.themes.breakdown)
      .sort((a, b) => b[1].count - a[1].count)[0]
    const themeCfg = THEME_CONFIG[topTheme[0]]
    if (themeCfg) {
      insights.push({
        type: 'theme',
        icon: themeCfg.icon,
        title: `最关注：${themeCfg.name}`,
        description: `本周进行了 ${topTheme[1].count} 次${themeCfg.name}主题占卜，这个领域是你的关注焦点。`
      })
    }
  }

  if (data.collection.growth > 0) {
    insights.push({
      type: 'milestone',
      icon: '📚',
      title: `收藏 +${data.collection.growth}`,
      description: `本周解锁了 ${data.collection.growth} 张新卡牌，图鉴完成度达到 ${data.collection.progress}%！`
    })
  }

  if (data.hiddenEvents.count > 0) {
    insights.push({
      type: 'mystery',
      icon: '✨',
      title: `隐藏事件 x${data.hiddenEvents.count}`,
      description: '命运的暗流涌动，本周触发了隐藏事件，特殊的缘分正在显现...'
    })
  }

  if (data.avgFortune > 0) {
    const trendIcons = { rising: '📈', falling: '📉', stable: '➡️' }
    const scoreLevel = data.avgFortune >= 70 ? '运势大好' : data.avgFortune >= 50 ? '运势平稳' : '需要注意'
    insights.push({
      type: 'fortune',
      icon: trendIcons[data.fortune.trend] || '🔮',
      title: `本周运势：${scoreLevel}`,
      description: `平均运势指数 ${data.avgFortune}，趋势${['rising', 'falling', 'stable'].includes(data.fortune.trend) ? ({rising: '向上', falling: '向下', stable: '持平'})[data.fortune.trend] : '平稳'}。`
    })
  }

  if (data.reversedRate > 40) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      title: '逆位频繁',
      description: `本周逆位率达到 ${data.reversedRate}%，可能需要注意一些被忽视的问题或反转的能量。`
    })
  }

  const legendaryCount = data.rarityStats['传说']?.count || 0
  const epicCount = data.rarityStats['史诗']?.count || 0
  if (legendaryCount > 0) {
    insights.push({
      type: 'lucky',
      icon: '👑',
      title: '传说降临',
      description: `本周抽到了 ${legendaryCount} 张传说卡牌！这是极其稀有的好运。`
    })
  } else if (epicCount >= 3) {
    insights.push({
      type: 'lucky',
      icon: '💎',
      title: '史诗之周',
      description: `本周出现了 ${epicCount} 张史诗卡牌，强大的能量正在汇聚。`
    })
  }

  return insights
}

export function getOrGenerateWeeklyReport(weekKey) {
  const existing = Storage.getWeeklyReportByKey(weekKey)
  const report = generateWeeklyReport(weekKey)
  Storage.saveWeeklyReport(report)
  return report
}

export function getCurrentWeekReport() {
  return getOrGenerateWeeklyReport(getWeekKey())
}
