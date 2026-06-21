<script>
  import { onMount } from 'svelte'
  import { CARDS } from '../data/cards.js'
  import { CARD_RARITY, RARITY_CONFIG, CATEGORY_CONFIG } from '../data/constants.js'
  import { Storage } from '../utils/storage.js'
  import CardDetailModal from '../components/CardDetailModal.svelte'

  let collection = {}
  let selectedCard = null
  let activeTab = 'all'
  let searchQuery = ''

  const TABS = [
    { id: 'all', label: '全部' },
    { id: 'collected', label: '已收集' },
    { id: 'locked', label: '未收集' }
  ]

  $: filteredCards = CARDS.filter(card => {
    const isCollected = !!collection[card.id]
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'collected' && isCollected) ||
      (activeTab === 'locked' && !isCollected)
    const matchesSearch = !searchQuery ||
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesTab && matchesSearch
  })

  $: collectedCount = Object.keys(collection).length
  $: totalCount = CARDS.length
  $: progressPercent = Math.round((collectedCount / totalCount) * 100)

  function refresh() {
    collection = Storage.getCollection()
  }

  function openCardDetail(card) {
    if (collection[card.id]) {
      selectedCard = card
    }
  }

  function closeCardDetail() {
    selectedCard = null
  }

  onMount(() => {
    refresh()
  })
</script>

<h1 class="page-title">◆ 收 藏 册 ◆</h1>

<div class="stats-grid">
  <div class="stat-card" style="grid-column: span 2;">
    <div class="stat-value glow-cyan">{collectedCount} / {totalCount}</div>
    <div class="stat-label">收集进度 {progressPercent}%</div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: {progressPercent}%"></div>
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
</style>
