import { CARDS } from '../data/cards.js'
import { ENCYCLOPEDIA } from '../data/encyclopedia.js'
import { Storage } from './storage.js'
import { CATEGORY_CONFIG, RARITY_CONFIG } from '../data/constants.js'

export const RELATION_TYPES = {
  SYNERGISTIC: 'synergistic',
  CONFLICTING: 'conflicting',
  TRANSFORMATIONAL: 'transformational',
  COOCCURRENCE: 'cooccurrence',
  THEMATIC: 'thematic'
}

export const RELATION_CONFIG = {
  [RELATION_TYPES.SYNERGISTIC]: {
    label: '协同',
    color: '#69f0ae',
    glow: 'rgba(105, 240, 174, 0.5)',
    icon: '✓',
    description: '两张牌搭配能产生积极效果'
  },
  [RELATION_TYPES.CONFLICTING]: {
    label: '冲突',
    color: '#ff5252',
    glow: 'rgba(255, 82, 82, 0.5)',
    icon: '⚡',
    description: '两张牌之间存在张力或矛盾'
  },
  [RELATION_TYPES.TRANSFORMATIONAL]: {
    label: '转化',
    color: '#ba68c8',
    glow: 'rgba(186, 104, 200, 0.5)',
    icon: '∞',
    description: '两张牌组合能引发深刻转变'
  },
  [RELATION_TYPES.COOCCURRENCE]: {
    label: '共现',
    color: '#4fc3f7',
    glow: 'rgba(79, 195, 247, 0.5)',
    icon: '↔',
    description: '在历史抽取中经常一起出现'
  },
  [RELATION_TYPES.THEMATIC]: {
    label: '主题',
    color: '#ffd54f',
    glow: 'rgba(255, 213, 79, 0.5)',
    icon: '≋',
    description: '共享相似的主题关键词'
  }
}

function getCardById(id) {
  return CARDS.find(c => c.id === id)
}

function getEncyclopedia(cardId) {
  return ENCYCLOPEDIA[cardId] || null
}

export function buildRelationGraph() {
  const nodes = CARDS.map(card => {
    const encyc = getEncyclopedia(card.id)
    return {
      id: card.id,
      name: card.name,
      number: card.number,
      symbol: card.symbol,
      category: card.category,
      rarity: card.rarity,
      keywords: card.keywords || [],
      hasEncyclopedia: !!encyc,
      x: 0,
      y: 0,
      degree: 0
    }
  })

  const nodeMap = {}
  nodes.forEach(n => { nodeMap[n.id] = n })

  const edges = []
  const edgeKeySet = new Set()

  function addEdge(source, target, type, weight, description = '') {
    if (source === target) return
    const key = [source, target].sort().join('|') + `|${type}`
    if (edgeKeySet.has(key)) return
    edgeKeySet.add(key)

    edges.push({
      id: `${source}-${target}-${type}`,
      source,
      target,
      type,
      weight,
      description
    })

    if (nodeMap[source]) nodeMap[source].degree++
    if (nodeMap[target]) nodeMap[target].degree++
  }

  Object.keys(ENCYCLOPEDIA).forEach(cardId => {
    const encyc = getEncyclopedia(cardId)
    if (!encyc || !encyc.keywordRelations) return

    const { synergistic, conflicting, transformational } = encyc.keywordRelations

    synergistic?.forEach(rel => {
      addEdge(cardId, rel.card, RELATION_TYPES.SYNERGISTIC, 3, rel.relation)
    })

    conflicting?.forEach(rel => {
      addEdge(cardId, rel.card, RELATION_TYPES.CONFLICTING, 2, rel.relation)
    })

    transformational?.forEach(rel => {
      addEdge(cardId, rel.card, RELATION_TYPES.TRANSFORMATIONAL, 4, rel.relation)
    })
  })

  computeKeywordRelations(nodes, nodeMap, addEdge)
  computeCooccurrenceRelations(nodes, nodeMap, addEdge)
  computeLayout(nodes, edges)

  return { nodes, edges, nodeMap }
}

function computeKeywordRelations(nodes, nodeMap, addEdge) {
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i]
      const b = nodes[j]
      const shared = a.keywords.filter(k => b.keywords.includes(k))
      if (shared.length >= 2) {
        addEdge(
          a.id, b.id, RELATION_TYPES.THEMATIC,
          Math.min(shared.length * 0.5 + 0.5, 2),
          `共享主题：${shared.join('、')}`
        )
      }
    }
  }
}

function computeCooccurrenceRelations(nodes, nodeMap, addEdge) {
  const history = Storage.getDrawHistory()
  const cooccurMap = {}
  const singleCount = {}

  history.forEach(record => {
    if (record.spreadType === 'single' && record.cardId) {
      singleCount[record.cardId] = (singleCount[record.cardId] || 0) + 1
    } else if (record.cards && Array.isArray(record.cards)) {
      const cardIds = record.cards.map(c => c.cardId)
      for (let i = 0; i < cardIds.length; i++) {
        for (let j = i + 1; j < cardIds.length; j++) {
          const pair = [cardIds[i], cardIds[j]].sort()
          const key = pair.join('|')
          cooccurMap[key] = (cooccurMap[key] || 0) + 1
        }
      }
      cardIds.forEach(id => {
        singleCount[id] = (singleCount[id] || 0) + 1
      })
    }
  })

  Object.entries(cooccurMap).forEach(([key, count]) => {
    if (count >= 2) {
      const [idA, idB] = key.split('|')
      const aCount = singleCount[idA] || 1
      const bCount = singleCount[idB] || 1
      const jaccard = count / (aCount + bCount - count)
      const weight = Math.min(1 + jaccard * 3 + count * 0.3, 4)
      addEdge(
        idA, idB, RELATION_TYPES.COOCCURRENCE,
        weight,
        `历史中共现 ${count} 次，关联度 ${(jaccard * 100).toFixed(0)}%`
      )
    }
  })
}

function computeLayout(nodes, edges) {
  const centerX = 500
  const centerY = 500
  const maxRadius = 400
  const minRadius = 80

  const categoryOrder = {}
  const categories = [...new Set(nodes.map(n => n.category))]
  categories.forEach((cat, i) => {
    categoryOrder[cat] = i
  })

  const catNodes = {}
  nodes.forEach(n => {
    if (!catNodes[n.category]) catNodes[n.category] = []
    catNodes[n.category].push(n)
  })

  const categoryCenters = {}
  categories.forEach((cat, i) => {
    const angle = (i / categories.length) * Math.PI * 2 - Math.PI / 2
    const r = maxRadius * 0.5
    categoryCenters[cat] = {
      x: centerX + Math.cos(angle) * r,
      y: centerY + Math.sin(angle) * r
    }
  })

  Object.entries(catNodes).forEach(([cat, catCards]) => {
    const center = categoryCenters[cat]
    const count = catCards.length
    const clusterRadius = Math.max(minRadius, Math.min(count * 35, maxRadius * 0.4))

    catCards.sort((a, b) => a.number - b.number)

    catCards.forEach((card, i) => {
      const angle = (i / count) * Math.PI * 2
      const r = card.degree > 5 ? 0 : clusterRadius * 0.7

      let baseX = center.x + Math.cos(angle) * r
      let baseY = center.y + Math.sin(angle) * r

      if (card.degree > 8) {
        baseX = center.x
        baseY = center.y
      } else if (card.degree > 4) {
        baseX = center.x + Math.cos(angle) * clusterRadius * 0.35
        baseY = center.y + Math.sin(angle) * clusterRadius * 0.35
      }

      card.x = baseX
      card.y = baseY
    })
  })

  for (let iter = 0; iter < 50; iter++) {
    const forces = {}
    nodes.forEach(n => { forces[n.id] = { fx: 0, fy: 0 } })

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]
        const b = nodes[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.01
        const minDist = 70
        if (dist < minDist) {
          const push = (minDist - dist) * 0.5
          const nx = dx / dist
          const ny = dy / dist
          forces[a.id].fx -= nx * push
          forces[a.id].fy -= ny * push
          forces[b.id].fx += nx * push
          forces[b.id].fy += ny * push
        }
      }
    }

    edges.forEach(edge => {
      const a = nodeMap[edge.source]
      const b = nodeMap[edge.target]
      if (!a || !b) return
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.01
      const ideal = 150 / edge.weight
      if (dist > ideal) {
        const pull = (dist - ideal) * 0.01 * edge.weight
        const nx = dx / dist
        const ny = dy / dist
        forces[a.id].fx += nx * pull
        forces[a.id].fy += ny * pull
        forces[b.id].fx -= nx * pull
        forces[b.id].fy -= ny * pull
      }
    })

    nodes.forEach(n => {
      const f = forces[n.id]
      const center = categoryCenters[n.category]
      const toCX = center.x - n.x
      const toCY = center.y - n.y
      f.fx += toCX * 0.005
      f.fy += toCY * 0.005

      n.x += f.fx
      n.y += f.fy

      n.x = Math.max(50, Math.min(950, n.x))
      n.y = Math.max(50, Math.min(950, n.y))
    })
  }
}

export function getCardRelations(cardId) {
  const graph = buildRelationGraph()
  const card = getCardById(cardId)
  const encyc = getEncyclopedia(cardId)

  const relatedEdges = graph.edges.filter(
    e => e.source === cardId || e.target === cardId
  )

  const relations = {
    synergistic: [],
    conflicting: [],
    transformational: [],
    cooccurrence: [],
    thematic: []
  }

  relatedEdges.forEach(edge => {
    const otherId = edge.source === cardId ? edge.target : edge.source
    const otherCard = getCardById(otherId)
    if (!otherCard) return

    const entry = {
      card: otherCard,
      weight: edge.weight,
      description: edge.description
    }

    if (relations[edge.type]) {
      relations[edge.type].push(entry)
    }
  })

  Object.keys(relations).forEach(key => {
    relations[key].sort((a, b) => b.weight - a.weight)
  })

  return {
    card,
    encyclopedia: encyc,
    relations,
    edgeCount: relatedEdges.length
  }
}

export function getCooccurrenceStats() {
  const history = Storage.getDrawHistory()
  const cooccurMap = {}
  const totalCount = {}

  history.forEach(record => {
    if (record.cards && Array.isArray(record.cards)) {
      const cardIds = record.cards.map(c => c.cardId)
      for (let i = 0; i < cardIds.length; i++) {
        for (let j = i + 1; j < cardIds.length; j++) {
          const pair = [cardIds[i], cardIds[j]].sort()
          const key = pair.join('|')
          cooccurMap[key] = (cooccurMap[key] || 0) + 1
        }
      }
      cardIds.forEach(id => {
        totalCount[id] = (totalCount[id] || 0) + 1
      })
    } else if (record.cardId) {
      totalCount[record.cardId] = (totalCount[record.cardId] || 0) + 1
    }
  })

  const pairs = Object.entries(cooccurMap)
    .map(([key, count]) => {
      const [idA, idB] = key.split('|')
      const cardA = getCardById(idA)
      const cardB = getCardById(idB)
      const totalA = totalCount[idA] || 0
      const totalB = totalCount[idB] || 0
      const jaccard = count / Math.max(1, (totalA + totalB - count))
      return {
        cardA, cardB, count, jaccard,
        significance: count * jaccard
      }
    })
    .sort((a, b) => b.significance - a.significance)

  return {
    topPairs: pairs.slice(0, 10),
    totalPairs: pairs.length,
    totalDraws: history.length
  }
}

export function detectHiddenCombos() {
  const collection = Storage.getCollection()
  const drawnIds = Object.keys(collection)
  const combos = []

  Object.keys(ENCYCLOPEDIA).forEach(cardId => {
    const encyc = getEncyclopedia(cardId)
    if (!encyc || !encyc.keywordRelations) return

    const { synergistic, transformational } = encyc.keywordRelations

    synergistic?.forEach(rel => {
      if (drawnIds.includes(cardId) && drawnIds.includes(rel.card)) {
        const cards = [getCardById(cardId), getCardById(rel.card)].filter(Boolean)
        if (cards.length === 2) {
          combos.push({
            id: `syn-${cardId}-${rel.card}`,
            type: RELATION_TYPES.SYNERGISTIC,
            title: `协同组合：${cards.map(c => c.name).join(' + ')}`,
            cards,
            description: rel.relation,
            hint: '尝试在牌阵中同时使用这两张牌，观察协同效果',
            unlocked: true
          })
        }
      } else {
        const missingId = drawnIds.includes(cardId) ? rel.card : cardId
        const missingCard = getCardById(missingId)
        if (missingCard && (drawnIds.includes(cardId) || drawnIds.includes(rel.card))) {
          const owned = getCardById(drawnIds.includes(cardId) ? cardId : rel.card)
          combos.push({
            id: `syn-${cardId}-${rel.card}`,
            type: RELATION_TYPES.SYNERGISTIC,
            title: `即将解锁：协同组合`,
            cards: [owned, missingCard],
            description: rel.relation,
            hint: `抽取「${missingCard.name}」即可解锁此组合`,
            unlocked: false,
            progress: 0.5
          })
        }
      }
    })

    transformational?.forEach(rel => {
      if (drawnIds.includes(cardId) && drawnIds.includes(rel.card)) {
        const cards = [getCardById(cardId), getCardById(rel.card)].filter(Boolean)
        if (cards.length === 2) {
          combos.push({
            id: `trans-${cardId}-${rel.card}`,
            type: RELATION_TYPES.TRANSFORMATIONAL,
            title: `转化组合：${cards.map(c => c.name).join(' → ')}`,
            cards,
            description: rel.relation,
            hint: '这两张牌的组合预示着深刻的转变，在面对重大抉择时尤为重要',
            unlocked: true
          })
        }
      }
    })
  })

  const history = Storage.getDrawHistory()
  const cooccurData = getCooccurrenceStats()
  cooccurData.topPairs.slice(0, 5).forEach((pair, idx) => {
    if (pair.count >= 3) {
      const existing = combos.find(c =>
        c.cards.every(card => pair.cardA.id === card.id || pair.cardB.id === card.id) &&
        c.cards.length === 2
      )
      if (!existing) {
        combos.push({
          id: `cooccur-${pair.cardA.id}-${pair.cardB.id}`,
          type: RELATION_TYPES.COOCCURRENCE,
          title: `高频共现组合 #${idx + 1}`,
          cards: [pair.cardA, pair.cardB],
          description: `这两张牌在你的抽卡历史中已共同出现 ${pair.count} 次，关联度 ${(pair.jaccard * 100).toFixed(0)}%`,
          hint: '命运似乎在暗示这两张牌之间有特殊的缘分，留意它们同时出现时的情境',
          unlocked: true,
          isCooccur: true
        })
      }
    }
  })

  const uniqueIds = new Set()
  const uniqueCombos = []
  combos.forEach(c => {
    const key = c.cards.map(cc => cc.id).sort().join('|')
    if (!uniqueIds.has(key + c.type)) {
      uniqueIds.add(key + c.type)
      uniqueCombos.push(c)
    }
  })

  uniqueCombos.sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1
    return (b.cards.reduce((s, c) => s + (RARITY_CONFIG[c.rarity]?.weight || 0), 0)) -
           (a.cards.reduce((s, c) => s + (RARITY_CONFIG[c.rarity]?.weight || 0), 0))
  })

  return uniqueCombos
}

export function getCategoryRelations() {
  const result = {}
  const categories = Object.keys(CATEGORY_CONFIG)

  categories.forEach(cat => {
    result[cat] = {
      label: CATEGORY_CONFIG[cat].label,
      color: CATEGORY_CONFIG[cat].color,
      icon: CATEGORY_CONFIG[cat].icon,
      synergies: {},
      conflicts: {}
    }
  })

  Object.keys(ENCYCLOPEDIA).forEach(cardId => {
    const card = getCardById(cardId)
    const encyc = getEncyclopedia(cardId)
    if (!card || !encyc || !encyc.keywordRelations) return

    encyc.keywordRelations.synergistic?.forEach(rel => {
      const other = getCardById(rel.card)
      if (!other) return
      const key = other.category
      result[card.category].synergies[key] = (result[card.category].synergies[key] || 0) + 1
    })

    encyc.keywordRelations.conflicting?.forEach(rel => {
      const other = getCardById(rel.card)
      if (!other) return
      const key = other.category
      result[card.category].conflicts[key] = (result[card.category].conflicts[key] || 0) + 1
    })
  })

  return result
}
