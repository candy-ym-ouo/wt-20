<script>
  import { onMount, onDestroy } from 'svelte'
  import { CARDS } from '../data/cards.js'
  import { CARD_RARITY, RARITY_CONFIG, CATEGORY_CONFIG, CARD_CATEGORY } from '../data/constants.js'
  import { Storage } from '../utils/storage.js'
  import { achievementStats } from '../utils/achievementSystem.js'
  import CardDetailModal from '../components/CardDetailModal.svelte'
  import { getAllThemePacks, getPackCards, isPackUnlocked } from '../utils/themePackSystem.js'
  import { getThemePack } from '../data/themePacks.js'

  let collection = {}
  let allPacksCollection = {}
  let selectedCard = null
  let activeTab = 'all'
  let activePackFilter = 'all'
  let searchQuery = ''
  let activeCategory = null
  let activeRarity = null
  let currentPage = 1
  let packs = []
  let removePackListener

  const PAGE_SIZE = 20

  const TABS = [
    { id: 'all', label: '全部' },
    { id: 'collected', label: '已收集' },
    { id: 'locked', label: '未收集' }
  ]

  function refreshPacks() {
    packs = getAllThemePacks().filter(p => isPackUnlocked(p.id))
  }

  function refresh() {
    if (activePackFilter === 'all') {
      allPacksCollection = Storage.getCollection()
      collection = {}
      for (const packId of Object.keys(allPacksCollection)) {
        const packCollection = allPacksCollection[packId]
        for (const cardId of Object.keys(packCollection)) {
          if (!collection[cardId]) {
            collection[cardId] = { ...packCollection[cardId], packId }
          } else {
            collection[cardId].drawCount += packCollection[cardId].drawCount
          }
        }
      }
    } else {
      collection = Storage.getCollection(activePackFilter)
    }
    refreshPacks()
  }

  $: {
    activePackFilter
    refresh()
  }

  $: allFilteredCards = CARDS.filter(card => {
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

    const matchesCategory = !activeCategory || card.category === activeCategory
    const matchesRarity = !activeRarity || card.rarity === activeRarity
    
    return matchesTab && matchesSearch && matchesPack && matchesCategory && matchesRarity
  })

  $: totalPages = Math.max(1, Math.ceil(allFilteredCards.length / PAGE_SIZE))

  $: currentPageSafe = Math.min(currentPage, totalPages)

  $: pagedCards = allFilteredCards.slice((currentPageSafe - 1) * PAGE_SIZE, currentPageSafe * PAGE_SIZE)

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

  $: filterResultCount = allFilteredCards.length

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

  function toggleCategory(cat) {
    activeCategory = activeCategory === cat ? null : cat
    currentPage = 1
  }

  function toggleRarity(r) {
    activeRarity = activeRarity === r ? null : r
    currentPage = 1
  }

  function clearAllFilters() {
    activeCategory = null
    activeRarity = null
    searchQuery = ''
    currentPage = 1
  }

  $: {
    searchQuery
    activeTab
    currentPage = 1
  }

  function goToPage(page) {
    currentPage = Math.max(1, Math.min(page, totalPages))
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

<div class="filter-bar">
  <div class="filter-row">
    <span class="filter-label">类别</span>
    <div class="filter-chips">
      {#each Object.values(CARD_CATEGORY) as cat}
        <button
          class="filter-chip {activeCategory === cat ? 'active' : ''}"
          style="--chip-color: {CATEGORY_CONFIG[cat].color}"
          on:click={() => toggleCategory(cat)}
        >
          <span class="chip-icon">{CATEGORY_CONFIG[cat].icon}</span>
          {CATEGORY_CONFIG[cat].label}
        </button>
      {/each}
    </div>
  </div>
  <div class="filter-row">
    <span class="filter-label">稀有度</span>
    <div class="filter-chips">
      {#each Object.values(CARD_RARITY) as r}
        <button
          class="filter-chip {activeRarity === r ? 'active' : ''}"
          style="--chip-color: {RARITY_CONFIG[r].color}"
          on:click={() => toggleRarity(r)}
        >
          {RARITY_CONFIG[r].label}
        </button>
      {/each}
    </div>
  </div>
  {#if activeCategory || activeRarity || searchQuery}
    <div class="filter-active-bar">
      <span class="filter-result mono">筛选结果：{filterResultCount} 张</span>
      <button class="clear-filter-btn" on:click={clearAllFilters}>清除筛选</button>
    </div>
  {/if}
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

{#if allFilteredCards.length === 0}
  <div class="empty-state">
    <div class="empty-state-icon">🔍</div>
    <div class="empty-state-text">没有找到匹配的卡牌</div>
  </div>
{:else}
  <div class="collection-grid">
    {#each pagedCards as card}
      {@const isCollected = !!collection[card.id]}
      <div
        class="collection-card card-{card.rarity} {isCollected ? 'unlocked' : 'locked'}"
        on:click={() => openCardDetail(card)}
      >
        {#if isCollected}
          <div class="unlock-glow" style="--glow-color: {RARITY_CONFIG[card.rarity].color}"></div>
        {/if}
        <div class="collection-symbol" style="color: {RARITY_CONFIG[card.rarity].color}">
          {isCollected ? card.symbol : '?'}
        </div>
        <div class="collection-name">
          {isCollected ? card.name : '???'}
        </div>
        {#if isCollected}
          <span class="badge badge-{card.rarity}" style="margin-top: 4px;">
            {RARITY_CONFIG[card.rarity].label} ×{collection[card.id].drawCount}
          </span>
        {/if}
        {#if isCollected}
          <span class="category-tag" style="--cat-color: {CATEGORY_CONFIG[card.category].color}">
            {CATEGORY_CONFIG[card.category].icon} {CATEGORY_CONFIG[card.category].label}
          </span>
        {/if}
      </div>
    {/each}
  </div>

  {#if totalPages > 1}
    <div class="pagination">
      <button
        class="page-btn"
        disabled={currentPageSafe <= 1}
        on:click={() => goToPage(currentPageSafe - 1)}
      >
        ◀
      </button>
      <div class="page-info">
        {#each Array.from({ length: totalPages }, (_, i) => i + 1) as p}
          {#if totalPages <= 7 || p === 1 || p === totalPages || Math.abs(p - currentPageSafe) <= 1}
            <button
              class="page-num {p === currentPageSafe ? 'active' : ''}"
              on:click={() => goToPage(p)}
            >
              {p}
            </button>
          {:else if Math.abs(p - currentPageSafe) === 2}
            <span class="page-ellipsis">···</span>
          {/if}
        {/each}
      </div>
      <button
        class="page-btn"
        disabled={currentPageSafe >= totalPages}
        on:click={() => goToPage(currentPageSafe + 1)}
      >
        ▶
      </button>
      <span class="page-total mono">{currentPageSafe}/{totalPages}</span>
    </div>
  {/if}
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
    margin-bottom: 12px;
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

  .filter-bar {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 16px;
  }

  .filter-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  .filter-row:last-child {
    margin-bottom: 0;
  }

  .filter-label {
    font-size: 11px;
    color: var(--text-dim);
    font-family: var(--font-mono);
    min-width: 40px;
    flex-shrink: 0;
  }

  .filter-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .filter-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border-glow);
    border-radius: 14px;
    color: var(--text-secondary);
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .filter-chip:hover {
    border-color: var(--chip-color, var(--accent-cyan));
    color: var(--chip-color, var(--accent-cyan));
  }

  .filter-chip.active {
    background: color-mix(in srgb, var(--chip-color, var(--accent-cyan)) 18%, transparent);
    border-color: var(--chip-color, var(--accent-cyan));
    color: var(--chip-color, var(--accent-cyan));
    box-shadow: 0 0 8px color-mix(in srgb, var(--chip-color, var(--accent-cyan)) 20%, transparent);
  }

  .filter-chip .chip-icon {
    font-size: 12px;
  }

  .filter-active-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    margin-top: 4px;
    border-top: 1px dashed var(--border-glow);
  }

  .filter-result {
    font-size: 11px;
    color: var(--accent-cyan);
  }

  .clear-filter-btn {
    padding: 3px 10px;
    background: transparent;
    border: 1px dashed rgba(255, 82, 82, 0.4);
    border-radius: 10px;
    color: var(--accent-red);
    font-size: 11px;
    font-family: var(--font-mono);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .clear-filter-btn:hover {
    border-color: var(--accent-red);
    background: rgba(255, 82, 82, 0.1);
  }

  .collection-card {
    position: relative;
    overflow: hidden;
  }

  .collection-card.unlocked {
    border-color: color-mix(in srgb, var(--glow-color, var(--accent-cyan)) 40%, var(--border-glow));
  }

  .collection-card.unlocked:hover {
    box-shadow: 0 5px 20px color-mix(in srgb, var(--glow-color, var(--accent-cyan)) 25%, transparent);
  }

  .unlock-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, var(--glow-color, var(--accent-cyan)), transparent);
    opacity: 0.8;
    animation: unlock-shimmer 2.5s ease-in-out infinite;
  }

  @keyframes unlock-shimmer {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }

  .category-tag {
    display: inline-block;
    margin-top: 3px;
    padding: 1px 6px;
    background: color-mix(in srgb, var(--cat-color) 15%, transparent);
    border-radius: 3px;
    font-size: 9px;
    color: var(--cat-color);
    font-family: var(--font-mono);
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 20px;
    padding: 12px 0;
  }

  .page-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 6px;
    color: var(--text-secondary);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .page-btn:hover:not(:disabled) {
    border-color: var(--accent-cyan);
    color: var(--accent-cyan);
    box-shadow: 0 0 8px rgba(0, 229, 255, 0.2);
  }

  .page-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .page-info {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .page-num {
    min-width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    color: var(--text-secondary);
    font-size: 12px;
    font-family: var(--font-mono);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .page-num:hover {
    border-color: var(--border-glow);
    color: var(--accent-cyan);
  }

  .page-num.active {
    background: var(--accent-cyan);
    border-color: var(--accent-cyan);
    color: #000;
    font-weight: bold;
  }

  .page-ellipsis {
    color: var(--text-dim);
    font-size: 10px;
    padding: 0 2px;
  }

  .page-total {
    font-size: 11px;
    color: var(--text-dim);
    margin-left: 4px;
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
