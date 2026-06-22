<script>
  import { onMount, onDestroy } from 'svelte'
  import { Storage } from '../utils/storage.js'
  import { CARDS } from '../data/cards.js'
  import { CARD_RARITY, CARD_CATEGORY } from '../data/constants.js'
  import { STORY_LINES } from '../data/storyEvents.js'
  import { getCompletedStories, getStoryEndingCounts } from '../utils/storySystem.js'
  import {
    MAP_NODES,
    MAP_PATHS,
    PATH_CONFIG,
    MAP_NODE_TYPE,
    NODE_STATUS,
    getNodeById
  } from '../data/mapData.js'
  import { checkAllAchievements, onAchievementUnlocked } from '../utils/achievementSystem.js'

  let selectedNode = null
  let mapData = { completedNodes: [], claimedRewards: [] }
  let activeFilter = 'all'
  let containerRef = null
  let scrollX = 0

  const PATH_FILTERS = [
    { id: 'all', label: '全部路径', icon: '🗺️', color: '#ffffff' },
    ...Object.values(PATH_CONFIG).map(p => ({
      id: p.id,
      label: p.name,
      icon: p.icon,
      color: p.color
    }))
  ]

  function getGameContext() {
    const stats = Storage.getStats()
    const collection = Storage.getCollection()
    const dailyFortune = Storage.getDailyFortune()
    const hiddenEventsLog = Storage.getHiddenEventsLog()
    const storyProgress = Storage.getStoryProgress()

    const uniqueCards = Object.keys(collection).length
    const totalCards = CARDS.length

    const rarityCounts = {}
    Object.values(CARD_RARITY).forEach(r => { rarityCounts[r] = 0 })
    Object.keys(collection).forEach(cardId => {
      const card = CARDS.find(c => c.id === cardId)
      if (card && rarityCounts[card.rarity] !== undefined) {
        rarityCounts[card.rarity]++
      }
    })

    const categoryCounts = {}
    Object.values(CARD_CATEGORY).forEach(c => { categoryCounts[c] = 0 })
    Object.keys(collection).forEach(cardId => {
      const card = CARDS.find(c => c.id === cardId)
      if (card && categoryCounts[card.category] !== undefined) {
        categoryCounts[card.category]++
      }
    })

    const completedStories = getCompletedStories()
    const endingCounts = getStoryEndingCounts()

    const storyEndingsByLine = {}
    STORY_LINES.forEach(line => {
      const lineProgress = storyProgress[line.id]
      if (lineProgress && lineProgress.status === 'completed') {
        storyEndingsByLine[line.id] = (storyEndingsByLine[line.id] || 0) + 1
      }
      const history = Storage.getStoryHistory()
      history.forEach(h => {
        if (h.storyId === line.id && h.endingType) {
          storyEndingsByLine[line.id] = (storyEndingsByLine[line.id] || 0) + 1
        }
      })
    })

    const hasAllEndingsOneLine = Object.values(storyEndingsByLine).some(count => {
      const line = STORY_LINES.find(l => {
        const endings = new Set()
        const history = Storage.getStoryHistory()
        history.forEach(h => {
          if (h.storyId === l.id && h.endingType) endings.add(h.endingType)
        })
        return endings.size >= (l.chapters ? l.chapters.length : 2)
      })
      return line !== undefined
    })

    const allStoriesCompleted = STORY_LINES.length > 0 &&
      STORY_LINES.every(l => completedStories.includes(l.id))

    return {
      stats,
      collection,
      uniqueCards,
      totalCards,
      dailyFortune,
      hiddenEventsCount: hiddenEventsLog.length,
      rarityCounts,
      categoryCounts,
      completedStories,
      endingCounts,
      hasAllEndingsOneLine,
      allStoriesCompleted
    }
  }

  function checkRequirement(req, ctx) {
    switch (req.type) {
      case 'total_draws':
        return ctx.stats.totalDraws >= req.target
      case 'unique_cards':
        return ctx.uniqueCards >= req.target
      case 'unique_cards_ratio':
        return ctx.totalCards > 0 && (ctx.uniqueCards / ctx.totalCards) >= req.target
      case 'consecutive_days':
        return (ctx.dailyFortune.consecutiveDays || 0) >= req.target
      case 'rarity_count':
        return (ctx.rarityCounts[req.rarity] || 0) >= req.target
      case 'category_count':
        return (ctx.categoryCounts[req.category] || 0) >= req.target
      case 'all_categories':
        return Object.values(CARD_CATEGORY).every(cat =>
          (ctx.categoryCounts[cat] || 0) >= 1
        )
      case 'hidden_events':
        return ctx.hiddenEventsCount >= req.target
      case 'completed_stories':
        return ctx.completedStories.length >= req.target
      case 'all_endings_one_story':
        return ctx.hasAllEndingsOneLine
      case 'all_stories_completed':
        return ctx.allStoriesCompleted
      default:
        return false
    }
  }

  function getRequirementProgress(req, ctx) {
    let current = 0
    let target = req.target

    switch (req.type) {
      case 'total_draws':
        current = ctx.stats.totalDraws
        break
      case 'unique_cards':
        current = ctx.uniqueCards
        break
      case 'unique_cards_ratio':
        current = ctx.uniqueCards
        target = Math.ceil(ctx.totalCards * req.target)
        break
      case 'consecutive_days':
        current = ctx.dailyFortune.consecutiveDays || 0
        break
      case 'rarity_count':
        current = ctx.rarityCounts[req.rarity] || 0
        break
      case 'category_count':
        current = ctx.categoryCounts[req.category] || 0
        break
      case 'all_categories':
        current = Object.values(CARD_CATEGORY).filter(cat =>
          (ctx.categoryCounts[cat] || 0) >= 1
        ).length
        target = Object.values(CARD_CATEGORY).length
        break
      case 'hidden_events':
        current = ctx.hiddenEventsCount
        break
      case 'completed_stories':
        current = ctx.completedStories.length
        break
      case 'all_endings_one_story':
        current = ctx.hasAllEndingsOneLine ? 1 : 0
        target = 1
        break
      case 'all_stories_completed':
        current = ctx.completedStories.length
        target = STORY_LINES.length
        break
    }

    return {
      current: Math.min(current, target),
      target,
      percent: target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
    }
  }

  $: filteredNodes = MAP_NODES.filter(n =>
    activeFilter === 'all' || n.path === activeFilter
  )

  function getNodeStatus(node, ctx) {
    if (mapData.completedNodes.includes(node.id)) {
      return NODE_STATUS.COMPLETED
    }

    if (node.order === 0) {
      return NODE_STATUS.AVAILABLE
    }

    const allRequirementsMet = node.requirements.every(req => checkRequirement(req, ctx))
    if (allRequirementsMet) {
      return NODE_STATUS.AVAILABLE
    }

    const hasPrerequisiteComplete = node.order <= 1 || MAP_NODES
      .filter(n => n.connectsTo && n.connectsTo.includes(node.id))
      .some(n => mapData.completedNodes.includes(n.id))

    if (hasPrerequisiteComplete) {
      return NODE_STATUS.IN_PROGRESS
    }

    return NODE_STATUS.LOCKED
  }

  function selectNode(node) {
    const ctx = getGameContext()
    const status = getNodeStatus(node, ctx)
    selectedNode = {
      node,
      status,
      requirements: node.requirements.map(req => ({
        ...req,
        progress: getRequirementProgress(req, ctx)
      })),
      reward: node.reward
    }
  }

  function closeDetail() {
    selectedNode = null
  }

  function completeNode() {
    if (!selectedNode) return
    const { node, status } = selectedNode
    if (status !== NODE_STATUS.AVAILABLE) return
    if (mapData.completedNodes.includes(node.id)) return

    mapData = Storage.completeMapNode(node.id)

    if (node.reward && node.reward.type === 'points') {
      refresh()
    }

    selectNode(node)
    checkAllAchievements()
  }

  function refresh() {
    mapData = Storage.getCollectionMap()
    const ctx = getGameContext()
    if (selectedNode) {
      selectNode(selectedNode.node)
    }
  }

  function goToCollection() {
    const event = new CustomEvent('navigate', { detail: 'collection' })
    window.dispatchEvent(event)
  }

  function goToAchievements() {
    const event = new CustomEvent('navigate', { detail: 'achievements' })
    window.dispatchEvent(event)
  }

  function goToDraw() {
    const event = new CustomEvent('navigate', { detail: 'draw' })
    window.dispatchEvent(event)
  }

  function goToDaily() {
    const event = new CustomEvent('navigate', { detail: 'daily' })
    window.dispatchEvent(event)
  }

  $: visibleNodes = filteredNodes

  function generatePathConnections() {
    const connections = []
    MAP_NODES.forEach(node => {
      if (node.connectsTo && node.connectsTo.length > 0) {
        node.connectsTo.forEach(targetId => {
          const target = getNodeById(targetId)
          if (target) {
            connections.push({
              from: node,
              to: target,
              pathId: node.path
            })
          }
        })
      }
    })
    return connections
  }

  $: connections = generatePathConnections()
  $: ctx = getGameContext()

  $: completedCount = mapData.completedNodes.length
  $: totalCount = MAP_NODES.length
  $: progressPercent = Math.round((completedCount / totalCount) * 100)

  let achievementUnsubscribe = null

  onMount(() => {
    refresh()
    checkAllAchievements()

    achievementUnsubscribe = onAchievementUnlocked(() => {
      refresh()
    })
  })

  onDestroy(() => {
    if (achievementUnsubscribe) achievementUnsubscribe()
  })

  function scrollContainer(direction) {
    if (containerRef) {
      const scrollAmount = 300
      containerRef.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
      })
    }
  }
</script>

<h1 class="page-title">◆ 收 藏 成 就 联 动 地 图 ◆</h1>

<div class="map-overview">
  <div class="overview-main">
    <div class="overview-title">
      <span class="overview-icon">🗺️</span>
      <span>探索进度</span>
    </div>
    <div class="progress-bar-large">
      <div class="progress-fill-large" style="width: {progressPercent}%"></div>
    </div>
    <div class="progress-meta mono">
      {completedCount} / {totalCount} 节点 · {progressPercent}%
    </div>
  </div>

  <div class="overview-quick">
    <button class="quick-btn" on:click={goToDraw}>
      <span>🎴</span>
      <small>抽卡</small>
    </button>
    <button class="quick-btn" on:click={goToDaily}>
      <span>🎐</span>
      <small>每日</small>
    </button>
    <button class="quick-btn" on:click={goToCollection}>
      <span>📚</span>
      <small>收藏</small>
    </button>
    <button class="quick-btn" on:click={goToAchievements}>
      <span>🏆</span>
      <small>成就</small>
    </button>
  </div>
</div>

<div class="path-filters">
  {#each PATH_FILTERS as filter}
    <button
      class="path-filter {activeFilter === filter.id ? 'active' : ''}"
      style="--filter-color: {filter.color};"
      on:click={() => (activeFilter = filter.id)}
    >
      <span>{filter.icon}</span>
      <span>{filter.label}</span>
    </button>
  {/each}
</div>

<div class="map-wrapper">
  <button class="scroll-btn scroll-left" on:click={() => scrollContainer(-1)}>◀</button>

  <div class="map-container" bind:this={containerRef}>
    <svg class="connections-svg" viewBox="0 0 140 120" preserveAspectRatio="xMidYMid meet">
      <defs>
        {#each Object.entries(PATH_CONFIG) as [pathId, config]}
          <linearGradient id="gradient-{pathId}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color: {config.color}; stop-opacity: 0.8" />
            <stop offset="100%" style="stop-color: {config.color}; stop-opacity: 0.3" />
          </linearGradient>
        {/each}
        <filter id="glow">
          <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {#each connections as conn, i}
        {@const isActive = mapData.completedNodes.includes(conn.from.id) || mapData.completedNodes.includes(conn.to.id)}
        {@const pathColor = PATH_CONFIG[conn.pathId]?.color || '#666'}
        <line
          x1={conn.from.position.x}
          y1={conn.from.position.y}
          x2={conn.to.position.x}
          y2={conn.to.position.y}
          stroke={isActive ? `url(#gradient-${conn.pathId})` : 'rgba(100, 100, 120, 0.2)'}
          stroke-width={isActive ? 0.6 : 0.3}
          stroke-dasharray={isActive ? 'none' : '1 1'}
          stroke-linecap="round"
          filter={isActive ? 'url(#glow)' : 'none'}
        />
      {/each}
    </svg>

    {#each visibleNodes as node}
      {@const status = getNodeStatus(node, ctx)}
      {@const pathConfig = PATH_CONFIG[node.path]}
      {@const isCompleted = status === NODE_STATUS.COMPLETED}
      {@const isAvailable = status === NODE_STATUS.AVAILABLE}
      {@const isInProgress = status === NODE_STATUS.IN_PROGRESS}
      {@const isLocked = status === NODE_STATUS.LOCKED}
      {@const isSelected = selectedNode?.node.id === node.id}

      <div
        class="map-node node-{status} type-{node.type}"
        style="--node-color: {pathConfig?.color || '#888'}; left: {node.position.x}%; top: {node.position.y}%;"
        class:selected={isSelected}
        class:boss-node={node.type === MAP_NODE_TYPE.BOSS_CHALLENGE}
        class:hidden-node={node.type === MAP_NODE_TYPE.HIDDEN_REWARD && isLocked}
        on:click={() => selectNode(node)}
      >
        <div class="node-ring"></div>
        <div class="node-inner">
          <div class="node-icon">
            {#if isLocked && node.type === MAP_NODE_TYPE.HIDDEN_REWARD}
              ❓
            {:else if isLocked}
              🔒
            {:else}
              {node.icon}
            {/if}
          </div>
        </div>
        <div class="node-pulse" style="animation-delay: {node.order * 0.2}s;"></div>
        <div class="node-label">{isLocked && node.type === MAP_NODE_TYPE.HIDDEN_REWARD ? '???' : node.name}</div>
        {#if node.type === MAP_NODE_TYPE.BOSS_CHALLENGE}
          <div class="boss-badge">👑</div>
        {/if}
        {#if isCompleted && !mapData.claimedRewards.includes(node.id)}
          <div class="claim-badge">!</div>
        {/if}
      </div>
    {/each}
  </div>

  <button class="scroll-btn scroll-right" on:click={() => scrollContainer(1)}>▶</button>
</div>

<div class="legend-section">
  <div class="legend-title">图 例</div>
  <div class="legend-items">
    <div class="legend-item">
      <span class="legend-dot completed"></span>
      <span>已完成</span>
    </div>
    <div class="legend-item">
      <span class="legend-dot available"></span>
      <span>可领取</span>
    </div>
    <div class="legend-item">
      <span class="legend-dot in-progress"></span>
      <span>进行中</span>
    </div>
    <div class="legend-item">
      <span class="legend-dot locked"></span>
      <span>未解锁</span>
    </div>
  </div>
</div>

{#if selectedNode}
  <div class="detail-overlay" on:click={closeDetail}>
    <div class="detail-panel" on:click|stopPropagation>
      <button class="close-btn" on:click={closeDetail}>✕</button>

      <div class="detail-header status-{selectedNode.status}" style="--detail-color: {PATH_CONFIG[selectedNode.node.path]?.color || '#888'};">
        <div class="detail-icon">
          {#if selectedNode.status === NODE_STATUS.LOCKED && selectedNode.node.type === MAP_NODE_TYPE.HIDDEN_REWARD}
            ❓
          {:else if selectedNode.status === NODE_STATUS.LOCKED}
            🔒
          {:else}
            {selectedNode.node.icon}
          {/if}
        </div>
        <div class="detail-info">
          <div class="detail-name">
            {selectedNode.status === NODE_STATUS.LOCKED && selectedNode.node.type === MAP_NODE_TYPE.HIDDEN_REWARD ? '???' : selectedNode.node.name}
          </div>
          <div class="detail-path">
            {PATH_CONFIG[selectedNode.node.path]?.icon} {PATH_CONFIG[selectedNode.node.path]?.name}
          </div>
          <div class="detail-status">
            {#if selectedNode.status === NODE_STATUS.COMPLETED}
              <span class="status-chip completed">✓ 已完成</span>
            {:else if selectedNode.status === NODE_STATUS.AVAILABLE}
              <span class="status-chip available">可领取</span>
            {:else if selectedNode.status === NODE_STATUS.IN_PROGRESS}
              <span class="status-chip in-progress">进行中</span>
            {:else}
              <span class="status-chip locked">未解锁</span>
            {/if}
          </div>
        </div>
      </div>

      <div class="detail-description">
        {#if selectedNode.status === NODE_STATUS.LOCKED && selectedNode.node.type === MAP_NODE_TYPE.HIDDEN_REWARD}
          隐藏节点 · 探索未知领域发现秘密...
        {:else}
          {selectedNode.node.description}
        {/if}
      </div>

      {#if selectedNode.requirements.length > 0 && !(selectedNode.status === NODE_STATUS.LOCKED && selectedNode.node.type === MAP_NODE_TYPE.HIDDEN_REWARD)}
        <div class="detail-section">
          <div class="section-label">📋 完成条件</div>
          {#each selectedNode.requirements as req}
            <div class="req-item">
              <div class="req-text">
                <span>{req.description}</span>
                <span class="req-count mono">{req.progress.current} / {req.progress.target}</span>
              </div>
              <div class="req-progress-bar">
                <div
                  class="req-progress-fill"
                  style="width: {req.progress.percent}%; background: linear-gradient(90deg, {PATH_CONFIG[selectedNode.node.path]?.color || '#00e5ff'}, var(--accent-magenta));"
                ></div>
              </div>
            </div>
          {/each}
        </div>
      {/if}

      {#if selectedNode.reward && !(selectedNode.status === NODE_STATUS.LOCKED && selectedNode.node.type === MAP_NODE_TYPE.HIDDEN_REWARD)}
        <div class="detail-section">
          <div class="section-label">🎁 奖励</div>
          <div class="reward-card">
            <div class="reward-icon">
              {#if selectedNode.reward.type === 'points'}💰
              {:else if selectedNode.reward.type === 'achievement'}🏆
              {:else if selectedNode.reward.type === 'title'}👑
              {:else}✨{/if}
            </div>
            <div class="reward-text">
              <div class="reward-desc">{selectedNode.reward.description}</div>
              {#if selectedNode.reward.type === 'points'}
                <div class="reward-value">+{selectedNode.reward.value} 成就点数</div>
              {/if}
            </div>
            {#if mapData.claimedRewards.includes(selectedNode.node.id)}
              <span class="reward-claimed">✓ 已领取</span>
            {/if}
          </div>
        </div>
      {/if}

      <div class="detail-actions">
        {#if selectedNode.status === NODE_STATUS.AVAILABLE && !mapData.completedNodes.includes(selectedNode.node.id)}
          <button class="btn btn-primary" on:click={completeNode}>
            ✓ 领取奖励
          </button>
        {:else if selectedNode.status === NODE_STATUS.IN_PROGRESS}
          <button class="btn" disabled>
            继续努力 →
          </button>
        {:else if selectedNode.status === NODE_STATUS.LOCKED}
          <button class="btn" disabled>
            🔒 未解锁
          </button>
        {:else}
          <button class="btn" disabled>
            ✓ 已完成
          </button>
        {/if}
        <button class="btn btn-ghost" on:click={closeDetail}>
          关闭
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .map-overview {
    background: linear-gradient(135deg, var(--bg-card), var(--bg-secondary));
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .overview-main {
    flex: 1;
  }

  .overview-title {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--accent-cyan);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .overview-icon {
    font-size: 16px;
  }

  .progress-bar-large {
    width: 100%;
    height: 12px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 6px;
  }

  .progress-fill-large {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-cyan), var(--accent-magenta), var(--accent-yellow));
    border-radius: 6px;
    transition: width 0.5s ease;
    box-shadow: 0 0 15px var(--accent-cyan);
  }

  .progress-meta {
    font-size: 11px;
    color: var(--text-dim);
  }

  .overview-quick {
    display: flex;
    gap: 8px;
  }

  .quick-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 18px;
  }

  .quick-btn:hover {
    border-color: var(--accent-cyan);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 229, 255, 0.2);
  }

  .quick-btn small {
    font-size: 10px;
    color: var(--text-dim);
    font-family: var(--font-mono);
  }

  .path-filters {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .path-filter {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid transparent;
    border-radius: 8px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 12px;
    font-family: var(--font-mono);
    white-space: nowrap;
    flex: none;
  }

  .path-filter:hover {
    border-color: var(--filter-color);
    color: var(--filter-color);
  }

  .path-filter.active {
    background: rgba(0, 0, 0, 0.5);
    border-color: var(--filter-color);
    color: var(--filter-color);
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.3);
  }

  .map-wrapper {
    position: relative;
    background: linear-gradient(135deg, rgba(10, 10, 26, 0.8), rgba(18, 18, 42, 0.8));
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 0;
    margin-bottom: 16px;
    overflow: hidden;
  }

  .scroll-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 36px;
    height: 36px;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid var(--accent-cyan);
    border-radius: 50%;
    color: var(--accent-cyan);
    cursor: pointer;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    transition: all 0.2s ease;
  }

  .scroll-btn:hover {
    background: var(--accent-cyan);
    color: var(--bg-primary);
  }

  .scroll-left {
    left: 8px;
  }

  .scroll-right {
    right: 8px;
  }

  .map-container {
    position: relative;
    width: 100%;
    height: 560px;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 30px;
  }

  .connections-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }

  .map-node {
    position: absolute;
    transform: translate(-50%, -50%);
    cursor: pointer;
    z-index: 2;
    width: 70px;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: transform 0.2s ease;
  }

  .map-node:hover {
    transform: translate(-50%, -50%) scale(1.1);
    z-index: 5;
  }

  .map-node.selected {
    z-index: 10;
  }

  .node-ring {
    position: absolute;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 2px dashed var(--node-color);
    opacity: 0.4;
    animation: ring-rotate 20s linear infinite;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  @keyframes ring-rotate {
    from { transform: translateX(-50%) rotate(0deg); }
    to { transform: translateX(-50%) rotate(360deg); }
  }

  .node-inner {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--bg-card), var(--bg-secondary));
    border: 2px solid var(--node-color);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  }

  .node-icon {
    font-size: 26px;
    filter: none;
  }

  .node-pulse {
    position: absolute;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
    opacity: 0;
  }

  .node-label {
    margin-top: 6px;
    font-size: 10px;
    font-family: var(--font-mono);
    color: var(--text-secondary);
    text-align: center;
    max-width: 80px;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .map-node.node-completed .node-inner {
    background: linear-gradient(135deg, var(--node-color), rgba(0, 0, 0, 0.6));
    box-shadow: 0 0 25px var(--node-color);
  }

  .map-node.node-completed .node-icon {
    filter: drop-shadow(0 0 8px #fff);
  }

  .map-node.node-completed .node-label {
    color: var(--node-color);
  }

  .map-node.node-completed .node-pulse {
    animation: pulse-glow 2s ease-in-out infinite;
    box-shadow: 0 0 30px var(--node-color);
  }

  @keyframes pulse-glow {
    0%, 100% { opacity: 0; transform: translateX(-50%) scale(1); }
    50% { opacity: 0.5; transform: translateX(-50%) scale(1.3); }
  }

  .map-node.node-available .node-inner {
    animation: available-pulse 1.5s ease-in-out infinite;
  }

  @keyframes available-pulse {
    0%, 100% { box-shadow: 0 0 15px var(--node-color); }
    50% { box-shadow: 0 0 35px var(--node-color), 0 0 60px var(--node-color); }
  }

  .map-node.node-in-progress .node-inner {
    border-style: dashed;
  }

  .map-node.node-locked .node-inner {
    background: rgba(30, 30, 50, 0.6);
    border-color: rgba(100, 100, 120, 0.4);
  }

  .map-node.node-locked .node-icon {
    opacity: 0.5;
    filter: grayscale(0.8);
  }

  .map-node.node-locked .node-label {
    color: var(--text-dim);
    opacity: 0.6;
  }

  .map-node.node-locked .node-ring {
    opacity: 0.15;
    border-color: rgba(100, 100, 120, 0.4);
  }

  .map-node.hidden-node .node-inner {
    background: repeating-linear-gradient(
      45deg,
      rgba(80, 40, 100, 0.3),
      rgba(80, 40, 100, 0.3) 4px,
      rgba(40, 20, 60, 0.3) 4px,
      rgba(40, 20, 60, 0.3) 8px
    );
  }

  .map-node.boss-node .node-inner {
    width: 68px;
    height: 68px;
    border-width: 3px;
  }

  .map-node.boss-node .node-icon {
    font-size: 30px;
  }

  .map-node.boss-node .node-ring {
    width: 76px;
    height: 76px;
  }

  .map-node.boss-node.node-completed .node-inner {
    background: linear-gradient(135deg, var(--accent-yellow), var(--accent-magenta), var(--node-color));
  }

  .boss-badge {
    position: absolute;
    top: -4px;
    right: 2px;
    font-size: 14px;
    filter: drop-shadow(0 0 4px var(--accent-yellow));
  }

  .claim-badge {
    position: absolute;
    top: -2px;
    left: calc(50% + 18px);
    width: 18px;
    height: 18px;
    background: var(--accent-red);
    border-radius: 50%;
    color: white;
    font-size: 12px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: badge-bounce 0.6s ease-in-out infinite alternate;
  }

  @keyframes badge-bounce {
    from { transform: scale(1); }
    to { transform: scale(1.2); }
  }

  .legend-section {
    background: var(--bg-card);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 12px 16px;
  }

  .legend-title {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-dim);
    margin-bottom: 10px;
    letter-spacing: 1px;
  }

  .legend-items {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--text-secondary);
    font-family: var(--font-mono);
  }

  .legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .legend-dot.completed {
    background: linear-gradient(135deg, var(--accent-cyan), var(--accent-magenta));
    box-shadow: 0 0 6px var(--accent-cyan);
  }

  .legend-dot.available {
    background: var(--bg-card);
    border: 2px solid var(--accent-green);
    animation: available-pulse 1.5s ease-in-out infinite;
  }

  .legend-dot.in-progress {
    background: var(--bg-card);
    border: 2px dashed var(--accent-yellow);
  }

  .legend-dot.locked {
    background: rgba(60, 60, 80, 0.6);
    border: 1px solid rgba(100, 100, 120, 0.4);
  }

  .detail-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 16px;
    backdrop-filter: blur(4px);
  }

  .detail-panel {
    background: linear-gradient(135deg, var(--bg-card), var(--bg-secondary));
    border: 1px solid var(--border-glow);
    border-radius: 16px;
    padding: 24px;
    max-width: 420px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }

  .close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: var(--accent-red);
    color: white;
  }

  .detail-header {
    display: flex;
    gap: 16px;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 16px;
  }

  .detail-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: linear-gradient(135deg, var(--detail-color), rgba(0, 0, 0, 0.5));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    flex-shrink: 0;
    box-shadow: 0 0 20px var(--detail-color);
  }

  .detail-info {
    flex: 1;
    min-width: 0;
  }

  .detail-name {
    font-size: 18px;
    font-weight: bold;
    color: var(--text-primary);
    margin-bottom: 4px;
    font-family: var(--font-mono);
  }

  .detail-path {
    font-size: 12px;
    color: var(--detail-color);
    margin-bottom: 8px;
    font-family: var(--font-mono);
  }

  .status-chip {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-family: var(--font-mono);
  }

  .status-chip.completed {
    background: rgba(105, 240, 174, 0.15);
    color: var(--accent-green);
    border: 1px solid var(--accent-green);
  }

  .status-chip.available {
    background: rgba(0, 229, 255, 0.15);
    color: var(--accent-cyan);
    border: 1px solid var(--accent-cyan);
    animation: chip-pulse 1.5s ease-in-out infinite;
  }

  @keyframes chip-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(0, 229, 255, 0.4); }
    50% { box-shadow: 0 0 0 4px rgba(0, 229, 255, 0); }
  }

  .status-chip.in-progress {
    background: rgba(255, 213, 79, 0.15);
    color: var(--accent-yellow);
    border: 1px solid var(--accent-yellow);
  }

  .status-chip.locked {
    background: rgba(100, 100, 120, 0.15);
    color: var(--text-dim);
    border: 1px solid var(--text-dim);
  }

  .detail-description {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.7;
    margin-bottom: 20px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    border-left: 3px solid var(--detail-color);
  }

  .detail-section {
    margin-bottom: 16px;
  }

  .section-label {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-dim);
    margin-bottom: 10px;
    letter-spacing: 0.5px;
  }

  .req-item {
    background: rgba(0, 0, 0, 0.2);
    padding: 10px 12px;
    border-radius: 8px;
    margin-bottom: 8px;
  }

  .req-text {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    font-size: 13px;
    color: var(--text-primary);
  }

  .req-count {
    font-size: 11px;
    color: var(--accent-cyan);
  }

  .req-progress-bar {
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
  }

  .req-progress-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.4s ease;
    box-shadow: 0 0 8px currentColor;
  }

  .reward-card {
    display: flex;
    align-items: center;
    gap: 12px;
    background: linear-gradient(135deg, rgba(255, 213, 79, 0.1), rgba(224, 64, 251, 0.1));
    border: 1px solid rgba(255, 213, 79, 0.3);
    border-radius: 10px;
    padding: 12px;
  }

  .reward-icon {
    font-size: 28px;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 213, 79, 0.1);
    border-radius: 10px;
    flex-shrink: 0;
  }

  .reward-text {
    flex: 1;
    min-width: 0;
  }

  .reward-desc {
    font-size: 13px;
    color: var(--text-primary);
    margin-bottom: 2px;
  }

  .reward-value {
    font-size: 11px;
    color: var(--accent-yellow);
    font-family: var(--font-mono);
  }

  .reward-claimed {
    font-size: 11px;
    color: var(--accent-green);
    font-family: var(--font-mono);
    flex-shrink: 0;
  }

  .detail-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  .detail-actions .btn {
    flex: 1;
  }

  .btn-primary {
    background: linear-gradient(135deg, rgba(0, 229, 255, 0.3), rgba(224, 64, 251, 0.3));
    border-color: var(--accent-magenta);
    color: var(--accent-cyan);
  }

  .btn-primary:hover {
    background: linear-gradient(135deg, rgba(0, 229, 255, 0.4), rgba(224, 64, 251, 0.4));
  }

  .btn-ghost {
    border-color: var(--text-dim);
    color: var(--text-dim);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn:disabled:hover {
    background: transparent;
    box-shadow: none;
  }
</style>
