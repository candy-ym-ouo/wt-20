import { Storage } from './storage.js'
import { CARDS } from '../data/cards.js'
import { CARD_RARITY, RARITY_CONFIG, CATEGORY_CONFIG, CARD_CATEGORY } from '../data/constants.js'

export function getFullProfile() {
  const stats = Storage.getStats()
  const collection = Storage.getCollection()
  const drawHistory = Storage.getDrawHistory()
  const dailyHistory = Storage.getDailyFortuneHistory()
  const themeHistory = Storage.getThemeDivinationHistory()
  const spreadHistory = Storage.getMultiSpreadHistory()

  const allDrawRecords = getAllDrawRecords(drawHistory, dailyHistory, themeHistory, spreadHistory)
  
  return {
    overview: getOverview(stats, collection, allDrawRecords),
    rarityDistribution: getRarityDistribution(stats),
    reversalTendency: getReversalTendency(stats),
    categoryPreference: getCategoryPreference(collection, allDrawRecords),
    topCards: getTopCards(collection, 5),
    recentTrend: getRecentTrend(allDrawRecords, 7),
    periodReport: generatePeriodReport(allDrawRecords, stats, collection)
  }
}

function getAllDrawRecords(drawHistory, dailyHistory, themeHistory, spreadHistory) {
  const records = []

  drawHistory.forEach(record => {
    if (record.spreadType === 'single') {
      records.push({
        timestamp: record.timestamp,
        cardId: record.cardId,
        isReversed: record.isReversed,
        type: 'draw'
      })
    } else if (record.spreadType === 'three' && record.cards) {
      record.cards.forEach(card => {
        records.push({
          timestamp: record.timestamp,
          cardId: card.cardId,
          isReversed: card.isReversed,
          type: 'draw'
        })
      })
    }
  })

  dailyHistory.forEach(record => {
    records.push({
      timestamp: record.timestamp,
      cardId: record.cardId,
      isReversed: record.isReversed,
      type: 'daily'
    })
  })

  themeHistory.forEach(record => {
    if (record.cards) {
      record.cards.forEach(card => {
        records.push({
          timestamp: record.timestamp,
          cardId: card.cardId,
          isReversed: card.isReversed,
          type: 'theme',
          theme: record.theme
        })
      })
    }
  })

  spreadHistory.forEach(record => {
    if (record.cards) {
      record.cards.forEach(card => {
        records.push({
          timestamp: record.timestamp,
          cardId: card.cardId,
          isReversed: card.isReversed,
          type: 'spread',
          spreadId: record.spreadId
        })
      })
    }
  })

  return records.sort((a, b) => b.timestamp - a.timestamp)
}

function getOverview(stats, collection, allRecords) {
  const totalCards = CARDS.length
  const collectedCount = Object.keys(collection).length
  const firstDraw = allRecords.length > 0 
    ? allRecords[allRecords.length - 1].timestamp 
    : null
  const lastDraw = stats.lastDrawDate

  let daysActive = 0
  if (firstDraw) {
    const diff = Date.now() - firstDraw
    daysActive = Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)))
  }

  const avgDrawsPerDay = daysActive > 0 
    ? (stats.totalDraws / daysActive).toFixed(1) 
    : 0

  const legendaryRate = stats.totalDraws > 0 
    ? ((stats.legendaryCount / stats.totalDraws) * 100).toFixed(1) 
    : 0

  const collectionRate = ((collectedCount / totalCards) * 100).toFixed(1)

  let userLevel = '数据新手'
  let levelIcon = '🌱'
  if (stats.totalDraws >= 100) {
    userLevel = '命运探索者'
    levelIcon = '🔍'
  }
  if (stats.totalDraws >= 300) {
    userLevel = '塔罗研习者'
    levelIcon = '📚'
  }
  if (stats.totalDraws >= 500) {
    userLevel = '赛博先知'
    levelIcon = '🔮'
  }
  if (stats.totalDraws >= 1000) {
    userLevel = '命运编织者'
    levelIcon = '👑'
  }

  return {
    totalDraws: stats.totalDraws,
    collectedCount,
    totalCards,
    collectionRate,
    daysActive,
    avgDrawsPerDay,
    legendaryRate,
    firstDraw,
    lastDraw,
    userLevel,
    levelIcon
  }
}

function getRarityDistribution(stats) {
  const total = stats.totalDraws || 1
  
  const distribution = {
    common: {
      count: stats.commonCount || 0,
      percentage: ((stats.commonCount / total) * 100).toFixed(1),
      ...RARITY_CONFIG[CARD_RARITY.COMMON]
    },
    rare: {
      count: stats.rareCount || 0,
      percentage: ((stats.rareCount / total) * 100).toFixed(1),
      ...RARITY_CONFIG[CARD_RARITY.RARE]
    },
    epic: {
      count: stats.epicCount || 0,
      percentage: ((stats.epicCount / total) * 100).toFixed(1),
      ...RARITY_CONFIG[CARD_RARITY.EPIC]
    },
    legendary: {
      count: stats.legendaryCount || 0,
      percentage: ((stats.legendaryCount / total) * 100).toFixed(1),
      ...RARITY_CONFIG[CARD_RARITY.LEGENDARY]
    }
  }

  let luckLevel = '普通'
  let luckColor = '#8a8a9a'
  const legendaryPercent = stats.legendaryCount / total
  const epicPercent = stats.epicCount / total
  
  if (legendaryPercent >= 0.08 || (legendaryPercent + epicPercent) >= 0.25) {
    luckLevel = '欧皇附体'
    luckColor = '#ffd54f'
  } else if (legendaryPercent >= 0.05 || (legendaryPercent + epicPercent) >= 0.18) {
    luckLevel = '运气极佳'
    luckColor = '#ba68c8'
  } else if (legendaryPercent >= 0.03 || (legendaryPercent + epicPercent) >= 0.12) {
    luckLevel = '运势不错'
    luckColor = '#4fc3f7'
  } else if (legendaryPercent >= 0.01 || (legendaryPercent + epicPercent) >= 0.08) {
    luckLevel = '中规中矩'
    luckColor = '#69f0ae'
  } else {
    luckLevel = '非酋降临'
    luckColor = '#ff5252'
  }

  return {
    distribution,
    luckLevel,
    luckColor,
    total
  }
}

function getReversalTendency(stats) {
  const total = stats.totalDraws || 1
  const reversedCount = stats.reversedDraws || 0
  const uprightCount = total - reversedCount
  
  const reversedPercent = ((reversedCount / total) * 100).toFixed(1)
  const uprightPercent = ((uprightCount / total) * 100).toFixed(1)

  let tendency = '平衡'
  let tendencyDesc = '你的正逆位分布较为均衡，命运呈现中性状态。'
  let tendencyIcon = '⚖️'
  
  if (reversedPercent >= 55) {
    tendency = '逆位偏多'
    tendencyDesc = '你的逆位卡牌出现频率较高，可能正处于挑战与成长的时期。每一次逆位都是学习的机会。'
    tendencyIcon = '🔄'
  } else if (uprightPercent >= 55) {
    tendency = '正位偏多'
    tendencyDesc = '你的正位卡牌占比较高，整体运势积极向上，正能量满满！'
    tendencyIcon = '✨'
  }

  return {
    reversedCount,
    uprightCount,
    reversedPercent,
    uprightPercent,
    tendency,
    tendencyDesc,
    tendencyIcon
  }
}

function getCategoryPreference(collection, allRecords) {
  const categoryCounts = {}
  const categoryReversed = {}
  
  Object.values(CARD_CATEGORY).forEach(cat => {
    categoryCounts[cat] = 0
    categoryReversed[cat] = 0
  })

  const cardMap = {}
  CARDS.forEach(card => {
    cardMap[card.id] = card
  })

  allRecords.forEach(record => {
    const card = cardMap[record.cardId]
    if (card) {
      categoryCounts[card.category] = (categoryCounts[card.category] || 0) + 1
      if (record.isReversed) {
        categoryReversed[card.category] = (categoryReversed[card.category] || 0) + 1
      }
    }
  })

  const total = allRecords.length || 1

  const categories = Object.entries(categoryCounts).map(([key, count]) => ({
    id: key,
    count,
    percentage: ((count / total) * 100).toFixed(1),
    reversedCount: categoryReversed[key] || 0,
    reversedRate: count > 0 ? (((categoryReversed[key] || 0) / count) * 100).toFixed(1) : 0,
    ...CATEGORY_CONFIG[key]
  }))

  categories.sort((a, b) => b.count - a.count)

  let dominantCategory = categories[0]
  let preferenceDesc = ''
  
  if (dominantCategory && dominantCategory.count > 0) {
    preferenceDesc = `你与「${dominantCategory.label}」类卡牌有着更深的链接，`
    switch (dominantCategory.id) {
      case CARD_CATEGORY.TECH:
        preferenceDesc += '对技术与创新有着天然的敏感度，擅长用理性思维解决问题。'
        break
      case CARD_CATEGORY.NEURAL:
        preferenceDesc += '内心世界丰富，直觉敏锐，对情感和潜意识有深刻的感知力。'
        break
      case CARD_CATEGORY.CORP:
        preferenceDesc += '对秩序、结构和物质世界有较强的掌控欲，务实且有野心。'
        break
      case CARD_CATEGORY.CRYPTO:
        preferenceDesc += '对隐藏的真相和秘密有着独特的洞察力，擅长发现事物的本质。'
        break
      case CARD_CATEGORY.MYSTIC:
        preferenceDesc += '与神秘力量有着天然的共鸣，想象力丰富，相信命运的安排。'
        break
    }
  }

  return {
    categories,
    dominantCategory,
    preferenceDesc
  }
}

function getTopCards(collection, limit = 5) {
  const cardMap = {}
  CARDS.forEach(card => {
    cardMap[card.id] = card
  })

  const cards = Object.entries(collection)
    .map(([cardId, data]) => ({
      card: cardMap[cardId],
      drawCount: data.drawCount,
      uprightCount: data.uprightCount || 0,
      reversedCount: data.reversedCount || 0,
      firstDraw: data.firstDraw,
      lastDraw: data.lastDraw,
      uprightRate: data.drawCount > 0 ? ((data.uprightCount / data.drawCount) * 100).toFixed(0) : 0
    }))
    .filter(item => item.card)

  cards.sort((a, b) => b.drawCount - a.drawCount)

  return cards.slice(0, limit)
}

function getRecentTrend(allRecords, days = 7) {
  const now = Date.now()
  const startTime = now - days * 24 * 60 * 60 * 1000

  const dayStats = {}
  for (let i = 0; i < days; i++) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000)
    const dateKey = date.toDateString()
    dayStats[dateKey] = {
      date: dateKey,
      dateObj: date,
      count: 0,
      reversed: 0,
      rarities: { common: 0, rare: 0, epic: 0, legendary: 0 }
    }
  }

  const cardMap = {}
  CARDS.forEach(card => {
    cardMap[card.id] = card
  })

  allRecords.forEach(record => {
    if (record.timestamp >= startTime) {
      const dateKey = new Date(record.timestamp).toDateString()
      if (dayStats[dateKey]) {
        dayStats[dateKey].count++
        if (record.isReversed) {
          dayStats[dateKey].reversed++
        }
        const card = cardMap[record.cardId]
        if (card) {
          dayStats[dateKey].rarities[card.rarity] = (dayStats[dateKey].rarities[card.rarity] || 0) + 1
        }
      }
    }
  })

  const trend = Object.values(dayStats).sort((a, b) => a.dateObj - b.dateObj)
  
  const totalRecent = trend.reduce((sum, d) => sum + d.count, 0)
  const avgPerDay = (totalRecent / days).toFixed(1)

  return {
    days,
    trend,
    totalRecent,
    avgPerDay
  }
}

function generatePeriodReport(allRecords, stats, collection) {
  const total = stats.totalDraws || 1
  
  const cardMap = {}
  CARDS.forEach(card => {
    cardMap[card.id] = card
  })

  const keywordCounts = {}
  let uprightTotal = 0
  let reversedTotal = 0

  allRecords.forEach(record => {
    const card = cardMap[record.cardId]
    if (card) {
      card.keywords.forEach(kw => {
        keywordCounts[kw] = (keywordCounts[kw] || 0) + 1
      })
    }
    if (record.isReversed) {
      reversedTotal++
    } else {
      uprightTotal++
    }
  })

  const topKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([keyword, count]) => ({ keyword, count }))

  let overallVerdict = ''
  let verdictEmoji = ''
  const overallUprightRate = uprightTotal / total

  if (overallUprightRate >= 0.65) {
    overallVerdict = '这段时间你的整体运势非常积极，正位卡牌占主导，各方面都在向好的方向发展。保持这份正能量，继续前进！'
    verdictEmoji = '🌟'
  } else if (overallUprightRate >= 0.55) {
    overallVerdict = '你的整体运势较为积极，虽然偶尔会遇到小挑战，但整体趋势向上。保持信心，稳步前行。'
    verdictEmoji = '✨'
  } else if (overallUprightRate >= 0.45) {
    overallVerdict = '你的运势处于平衡状态，有起有落。这是成长的必经之路，在挑战中学习，在顺境中积累。'
    verdictEmoji = '⚖️'
  } else if (overallUprightRate >= 0.35) {
    overallVerdict = '近期你可能遇到了一些挑战，逆位卡牌较多。但请记住，每一次逆位都是成长的契机，风雨过后必有彩虹。'
    verdictEmoji = '🌧️'
  } else {
    overallVerdict = '这段时间对你来说可能是一段考验期。但最黑暗的时刻往往是黎明前的曙光，坚持住，蜕变即将到来。'
    verdictEmoji = '🔥'
  }

  const suggestions = []
  
  if (stats.totalDraws < 20) {
    suggestions.push('继续探索你的命运吧！抽取更多卡牌，建立更完整的命运档案。')
  }
  
  const rareCards = Object.values(collection).filter(c => {
    const card = cardMap[Object.keys(collection).find(k => collection[k] === c)]
    return card && card.rarity !== CARD_RARITY.COMMON
  }).length
  
  if (rareCards < 3) {
    suggestions.push('尝试每日签到抽取命运签，坚持打卡可以提升稀有卡概率哦！')
  }

  const categoryStats = getCategoryPreference(collection, allRecords)
  if (categoryStats.dominantCategory) {
    suggestions.push(`你与「${categoryStats.dominantCategory.label}」能量特别契合，可以多关注相关领域的信息。`)
  }

  suggestions.push('定期回顾你的命运档案，观察运势的变化趋势，更好地把握人生方向。')

  return {
    overallVerdict,
    verdictEmoji,
    topKeywords,
    suggestions,
    totalDraws: stats.totalDraws,
    uprightRate: (overallUprightRate * 100).toFixed(1),
    reversedRate: ((reversedTotal / total) * 100).toFixed(1)
  }
}

export function getLuckyCardOfDay() {
  const collection = Storage.getCollection()
  const cardMap = {}
  CARDS.forEach(card => {
    cardMap[card.id] = card
  })

  const collectedCards = Object.keys(collection)
    .map(id => ({
      card: cardMap[id],
      data: collection[id]
    }))
    .filter(item => item.card)

  if (collectedCards.length === 0) {
    return null
  }

  const today = new Date().toDateString()
  let hash = 0
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i)
    hash = hash & hash
  }
  
  const index = Math.abs(hash) % collectedCards.length
  const luckyCard = collectedCards[index]

  const isReversed = (Math.abs(hash >> 8) % 100) < 35

  return {
    card: luckyCard.card,
    isReversed,
    reason: isReversed 
      ? '今日你需要以相反的视角看待问题，逆位的智慧将指引你。'
      : '今日这张卡牌的能量与你共振，正位的力量将助你前行。'
  }
}
