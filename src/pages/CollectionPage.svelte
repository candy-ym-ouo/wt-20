<script>
  import { onMount, onDestroy } from 'svelte'
  import { CARDS } from '../data/cards.js'
  import { CARD_RARITY, RARITY_CONFIG, CATEGORY_CONFIG } from '../data/constants.js'
  import { Storage } from '../utils/storage.js'
  import { achievementStats } from '../utils/achievementSystem.js'
  import CardDetailModal from '../components/CardDetailModal.svelte'
  import { getAllThemePacks, getPackCards, isPackUnlocked } from '../utils/themePackSystem.js'
  import { getThemePack } from '../data/themePacks.js'

  let collection = {}
  let selectedCard = null
  let activeTab = 'all'
  let activePackFilter = 'all'
  let searchQuery = ''
  let packs = []
  let removePackListener

  const TABS = [
    { id: 'all', label: '全部' },
    { id: 'collected', label: '已收集' },
    { id: 'locked', label: '未收集' }
  ]

  function refreshPacks() {
    packs = getAllThemePacks().filter(p => isPackUnlocked(p.id))
  }

  $: filteredCards = CARDS.filter(card => {
    const isCollected = !!collection[card.id]
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'collected' && isCollected) ||
      (activeTab === 'locked' && !isCollected)
    const matchesSearch = !searchQuery ||
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
    
    let matchesPack = true
    if (activePackFilter !== 'all') {
      const pack = getThemePack(activePackFilter)
      if (pack) {
        matchesPack = pack.cardIds.includes(card.id)
      }
    }
    
    return matchesTab && matchesSearch && matchesPack
  })

  $: currentPackStats = (() => {
    if (activePackFilter === 'all') {
      return { total: CARDS.length, collected: Object.keys(collection).length }
    }
    const packCards = getPackCards(activePackFilter)
    const collectedCount = packCards.filter(c => collection[c.id]).length
    return { total: packCards.length, collected: collectedCount }
  })()

  $: collectedCount = currentPackStats.collected
  $: totalCount = currentPackStats.total
  $: progressPercent = totalCount > 0 ? Math.round((collectedCount / totalCount) * 100) : 0

  function refresh() {
    collection = Storage.getCollection()
    refreshPacks()
  }

  function openCardDetail(card) {
    if (collection[card.id]) {
      selectedCard = card
    }
  }

  function closeCardDetail() {
    selectedCard = null
  }

  function goToAchievements() {
    const event = new CustomEvent('navigate', { detail: 'achievements' })
    window.dispatchEvent(event)
  }

  function handlePackChanged() {
    refresh()
  }

  onMount(() => {
    refresh()
    removePackListener = handlePackChanged
    window.addEventListener('packChanged', removePackListener)
  })

  onDestroy(() => {
    if (removePackListener) {
      window.removeEventListener('packChanged', removePackListener)
    }
  })
</script>

<h1 class="page-title">◆ 收 藏 册 ◆</h1>

<div class="pack-filter-bar">
  <button 
    class="pack-chip {activePackFilter === 'all' ? 'active' : ''}"
    on:click={() => activePackFilter = 'all'}
  >
    📚 全部
  </button>
  {#each packs as pack}
    <button 
      class="pack-chip {activePackFilter === pack.id ? 'active' : ''}"
      style="--pack-color: {pack.color}"
      on:click={() => activePackFilter = pack.id}
    >
      <span class="chip-icon">{pack.icon}</span>
      <span>{pack.name}</span>
    </button>
  {/each}
</div>

<div class="stats-grid">
  <div class="stat-card" style="grid-column: span 2;">
    <div class="stat-value glow-cyan">{collectedCount} / {totalCount}</div>
    <div class="stat-label">
      {activePackFilter === 'all' ? '总收集进度' : (getThemePack(activePackFilter)?.name || '') + '收集进度'} 
      {progressPercent}%
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: {progressPercent}%"></div>
    </div>
  </div>
  <div class="stat-card achievement-stat-card" on:click={goToAchievements}>
    <div class="stat-value glow-yellow">{$achievementStats.points}</div>
    <div class="stat-label">成就点数</div>
    <div class="achievement-meta mono">
      {$achievementStats.unlockedCount}/{$achievementStats.totalCount} · 点击查看 →
    </div>
  </div>
  <div class="stat-card">
    <div class="stat-value glow-magenta">{$achievementStats.percent}%</div>
    <div class="stat-label">成就完成度</div>
    <div class="progress-bar small">
      <div class="progress-fill achievement-progress" style="width: {$achievementStats.percent}%"></div>
    </div>
  </div>
</div>

<div class="search-box">
  <input
    type="text"
    bind:value={searchQuery}
    placeholder="搜索卡牌名称或关键词..."
    class="search-input"
  />
</div>

<div class="tabs">
  {#each TABS as tab}
    <div
      class="tab {activeTab === tab.id ? 'active' : ''}"
      on:click={() => (activeTab = tab.id)}
    >
      {tab.label}
    </div>
  {/each}
</div>

{#if filteredCards.length === 0}
  <div class="empty-state">
    <div class="empty-state-icon">🔍</div>
    <div class="empty-state-text">没有找到匹配的卡牌</div>
  </div>
{:else}
  <div class="collection-grid">
    {#each filteredCards as card}
      <div
        class="collection-card card-{card.rarity} {collection[card.id] ? '' : 'locked'}"
        on:click={() => openCardDetail(card)}
      >
        <div class="collection-symbol" style="color: {RARITY_CONFIG[card.rarity].color}">
          {collection[card.id] ? card.symbol : '?'}
        </div>
        <div class="collection-name">
          {collection[card.id] ? card.name : '???'}
        </div>
        {#if collection[card.id]}
          <span class="badge badge-{card.rarity}" style="margin-top: 4px;">
            {RARITY_CONFIG[card.rarity].label} ×{collection[card.id].drawCount}
          </span>
        {/if}
      </div>
    {/each}
  </div>
{/if}

{#if selectedCard && collection[selectedCard.id]}
  <CardDetailModal
    card={selectedCard}
    collectionData={collection[selectedCard.id]}
    onClose={closeCardDetail}
  />
{/if}

<style>
  .pack-filter-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .pack-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 16px;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .pack-chip:hover {
    border-color: var(--pack-color, var(--accent-cyan));
    color: var(--pack-color, var(--accent-cyan));
  }

  .pack-chip.active {
    background: color-mix(in srgb, var(--pack-color, var(--accent-cyan)) 15%, transparent);
    border-color: var(--pack-color, var(--accent-cyan));
    color: var(--pack-color, var(--accent-cyan));
    box-shadow: 0 0 10px color-mix(in srgb, var(--pack-color, var(--accent-cyan)) 25%, transparent);
  }

  .chip-icon {
    font-size: 14px;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    margin-top: 10px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-cyan), var(--accent-magenta));
    border-radius: 3px;
    transition: width 0.5s ease;
    box-shadow: 0 0 10px var(--accent-cyan);
  }
  .search-box {
    margin-bottom: 16px;
  }
  .search-input {
    width: 100%;
    padding: 10px 14px;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 6px;
    color: var(--text-primary);
    font-family: var(--font-mono);
    font-size: 13px;
    outline: none;
    transition: all 0.2s ease;
  }
  .search-input:focus {
    border-color: var(--accent-cyan);
    box-shadow: 0 0 10px rgba(0, 229, 255, 0.2);
  }
  .search-input::placeholder {
    color: var(--text-dim);
  }
  .achievement-stat-card {
    cursor: pointer;
    transition: all 0.25s ease;
    border: 1px solid rgba(255, 213, 79, 0.3);
  }
  .achievement-stat-card:hover {
    transform: translateY(-2px);
    border-color: var(--accent-yellow);
    box-shadow: 0 5px 20px rgba(255, 213, 79, 0.2);
  }
  .achievement-meta {
    font-size: 10px;
    color: var(--text-dim);
    margin-top: 6px;
  }
  .progress-bar.small {
    height: 4px;
    margin-top: 8px;
  }
  .progress-fill.achievement-progress {
    background: linear-gradient(90deg, var(--accent-yellow), var(--accent-magenta));
    box-shadow: 0 0 8px var(--accent-yellow);
  }
</style>
