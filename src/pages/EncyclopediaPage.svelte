<script>
  import { onMount, onDestroy } from 'svelte'
  import { CARDS } from '../data/cards.js'
  import { CARD_RARITY, RARITY_CONFIG, CARD_CATEGORY, CATEGORY_CONFIG } from '../data/constants.js'
  import { hasEncyclopediaEntry } from '../data/encyclopedia.js'
  import EncyclopediaDetailModal from '../components/EncyclopediaDetailModal.svelte'
  import { getAllThemePacks, isPackUnlocked } from '../utils/themePackSystem.js'
  import { getThemePack } from '../data/themePacks.js'

  let selectedCard = null
  let activeCategory = 'all'
  let activeRarity = 'all'
  let activePackFilter = 'all'
  let searchQuery = ''
  let sortBy = 'number'
  let packs = []

  const CATEGORY_TABS = [
    { id: 'all', label: '全部类别', icon: '📋' },
    { id: CARD_CATEGORY.MYSTIC, label: CATEGORY_CONFIG[CARD_CATEGORY.MYSTIC].label, icon: CATEGORY_CONFIG[CARD_CATEGORY.MYSTIC].icon },
    { id: CARD_CATEGORY.TECH, label: CATEGORY_CONFIG[CARD_CATEGORY.TECH].label, icon: CATEGORY_CONFIG[CARD_CATEGORY.TECH].icon },
    { id: CARD_CATEGORY.NEURAL, label: CATEGORY_CONFIG[CARD_CATEGORY.NEURAL].label, icon: CATEGORY_CONFIG[CARD_CATEGORY.NEURAL].icon },
    { id: CARD_CATEGORY.CORP, label: CATEGORY_CONFIG[CARD_CATEGORY.CORP].label, icon: CATEGORY_CONFIG[CARD_CATEGORY.CORP].icon },
    { id: CARD_CATEGORY.CRYPTO, label: CATEGORY_CONFIG[CARD_CATEGORY.CRYPTO].label, icon: CATEGORY_CONFIG[CARD_CATEGORY.CRYPTO].icon }
  ]

  const RARITY_FILTERS = [
    { id: 'all', label: '全部稀有度' },
    { id: CARD_RARITY.LEGENDARY, label: RARITY_CONFIG[CARD_RARITY.LEGENDARY].label, color: RARITY_CONFIG[CARD_RARITY.LEGENDARY].color },
    { id: CARD_RARITY.EPIC, label: RARITY_CONFIG[CARD_RARITY.EPIC].label, color: RARITY_CONFIG[CARD_RARITY.EPIC].color },
    { id: CARD_RARITY.RARE, label: RARITY_CONFIG[CARD_RARITY.RARE].label, color: RARITY_CONFIG[CARD_RARITY.RARE].color },
    { id: CARD_RARITY.COMMON, label: RARITY_CONFIG[CARD_RARITY.COMMON].label, color: RARITY_CONFIG[CARD_RARITY.COMMON].color }
  ]

  const SORT_OPTIONS = [
    { id: 'number', label: '编号顺序' },
    { id: 'rarity', label: '稀有度优先' },
    { id: 'name', label: '名称排序' }
  ]

  const RARITY_ORDER = {
    [CARD_RARITY.LEGENDARY]: 0,
    [CARD_RARITY.EPIC]: 1,
    [CARD_RARITY.RARE]: 2,
    [CARD_RARITY.COMMON]: 3
  }

  $: filteredCards = CARDS.filter(card => {
    const matchesCategory = activeCategory === 'all' || card.category === activeCategory
    const matchesRarity = activeRarity === 'all' || card.rarity === activeRarity
    const matchesSearch = !searchQuery ||
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
      card.number.toString().includes(searchQuery)
    
    let matchesPack = true
    if (activePackFilter !== 'all') {
      const pack = getThemePack(activePackFilter)
      if (pack) {
        matchesPack = pack.cardIds.includes(card.id)
      }
    }
    
    return matchesCategory && matchesRarity && matchesSearch && matchesPack
  }).sort((a, b) => {
    if (sortBy === 'number') return a.number - b.number
    if (sortBy === 'rarity') return RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity]
    if (sortBy === 'name') return a.name.localeCompare(b.name, 'zh-CN')
    return 0
  })

  $: currentPackStats = (() => {
    if (activePackFilter === 'all') {
      return { total: CARDS.length, withEncyclopedia: CARDS.filter(c => hasEncyclopediaEntry(c.id)).length }
    }
    const pack = getThemePack(activePackFilter)
    if (!pack) return { total: 0, withEncyclopedia: 0 }
    const packCards = CARDS.filter(c => pack.cardIds.includes(c.id))
    return { 
      total: packCards.length, 
      withEncyclopedia: packCards.filter(c => hasEncyclopediaEntry(c.id)).length 
    }
  })()

  $: stats = {
    total: currentPackStats.total,
    withEncyclopedia: currentPackStats.withEncyclopedia,
    byCategory: Object.values(CARD_CATEGORY).map(cat => ({
      id: cat,
      label: CATEGORY_CONFIG[cat].label,
      icon: CATEGORY_CONFIG[cat].icon,
      count: filteredCards.filter(c => c.category === cat).length
    })),
    byRarity: Object.values(CARD_RARITY).map(rar => ({
      id: rar,
      label: RARITY_CONFIG[rar].label,
      color: RARITY_CONFIG[rar].color,
      count: filteredCards.filter(c => c.rarity === rar).length
    }))
  }

  function openEncyclopedia(card) {
    selectedCard = card
  }

  function closeEncyclopedia() {
    selectedCard = null
  }

  function scrollToTop() {
    const container = document.querySelector('.page-container')
    if (container) container.scrollTop = 0
  }

  function refreshPacks() {
    packs = getAllThemePacks().filter(p => isPackUnlocked(p.id))
  }

  function handlePackChanged() {
    refreshPacks()
  }

  onMount(() => {
    refreshPacks()
    window.addEventListener('packChanged', handlePackChanged)
  })

  onDestroy(() => {
    window.removeEventListener('packChanged', handlePackChanged)
  })
</script>

<h1 class="page-title">◆ 卡 牌 图 鉴 百 科 ◆</h1>

<div class="pack-filter-bar">
  <button 
    class="pack-chip {activePackFilter === 'all' ? 'active' : ''}"
    on:click={() => activePackFilter = 'all'}
  >
    📚 全部卡包
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

<div class="encyclopedia-intro">
  <div class="intro-text">
    <span class="intro-icon">📖</span>
    <div>
      <h3 class="intro-title mono">
        {activePackFilter === 'all' ? '赛博宇宙卡牌档案库' : (getThemePack(activePackFilter)?.name || '') + '卡牌档案'}
      </h3>
      <p class="intro-desc">收录全部 {stats.total} 张卡牌的背景设定、原型解析与深度解读。已收录详细百科：<span class="glow-cyan mono">{stats.withEncyclopedia}</span> / {stats.total}</p>
    </div>
  </div>
</div>

<div class="stats-bar">
  {#each stats.byCategory as cat}
    <div class="stat-chip" style="color: {CATEGORY_CONFIG[cat.id].color}">
      <span>{cat.icon}</span>
      <span class="mono">{cat.count}</span>
    </div>
  {/each}
  <div class="stat-divider"></div>
  {#each stats.byRarity as rar}
    <div class="stat-chip" style="color: {rar.color}">
      <span class="mono">{rar.label}</span>
      <span class="mono">{rar.count}</span>
    </div>
  {/each}
</div>

<div class="search-sort-row">
  <div class="search-box">
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="🔍 搜索卡牌名称、编号或关键词..."
      class="search-input"
    />
  </div>
  <div class="sort-select-wrap">
    <select bind:value={sortBy} class="sort-select">
      {#each SORT_OPTIONS as opt}
        <option value={opt.id}>{opt.label}</option>
      {/each}
    </select>
  </div>
</div>

<div class="tabs secondary-tabs">
  {#each CATEGORY_TABS as tab}
    <div
      class="tab {activeCategory === tab.id ? 'active' : ''}"
      on:click={() => (activeCategory = tab.id)}
      style="{activeCategory === tab.id ? 'color: ' + CATEGORY_CONFIG[tab.id]?.color : ''}"
    >
      <span style="margin-right: 4px;">{tab.icon}</span>
      {tab.label}
    </div>
  {/each}
</div>

<div class="rarity-filters">
  {#each RARITY_FILTERS as fil}
    <button
      class="rarity-chip {activeRarity === fil.id ? 'active' : ''}"
      on:click={() => (activeRarity = fil.id)}
      style="--chip-color: {fil.color || 'var(--text-secondary)'}"
    >
      {fil.label}
    </button>
  {/each}
</div>

{#if filteredCards.length === 0}
  <div class="empty-state">
    <div class="empty-state-icon">🔍</div>
    <div class="empty-state-text">没有找到匹配的卡牌</div>
    <button class="btn" style="margin-top: 16px;" on:click={() => {
      searchQuery = ''
      activeCategory = 'all'
      activeRarity = 'all'
    }}>重置筛选</button>
  </div>
{:else}
  <div class="encyclopedia-grid">
    {#each filteredCards as card (card.id)}
      {@const hasFull = hasEncyclopediaEntry(card.id)}
      <div
        class="encyclopedia-card card-{card.rarity} {hasFull ? 'has-encyclopedia' : 'preview-only'}"
        on:click={() => openEncyclopedia(card)}
      >
        <div class="card-header">
          <div class="card-number mono" style="color: {RARITY_CONFIG[card.rarity].color}">#{String(card.number).padStart(2, '0')}</div>
          <div class="card-category">{CATEGORY_CONFIG[card.category].icon}</div>
        </div>
        <div class="card-symbol-wrap" style="color: {RARITY_CONFIG[card.rarity].color}">
          <div class="card-symbol">{card.symbol}</div>
          {#if hasFull}
            <div class="encyclopedia-badge" title="已收录完整百科">
              <span class="badge-icon">📖</span>
              <span>全解</span>
            </div>
          {:else}
            <div class="preview-badge" title="仅基础预览">
              <span>预览</span>
            </div>
          {/if}
        </div>
        <div class="card-info">
          <h3 class="card-name-text">{card.name}</h3>
          <div class="card-meta">
            <span class="badge badge-{card.rarity}">{RARITY_CONFIG[card.rarity].label}</span>
          </div>
          <div class="keywords">
            {#each card.keywords.slice(0, 3) as kw}
              <span class="keyword small">{kw}</span>
            {/each}
          </div>
        </div>
        <div class="card-footer">
          <span class="footer-hint">
            {hasFull ? '查看完整解读 →' : '查看基础信息 →'}
          </span>
        </div>
      </div>
    {/each}
  </div>
{/if}

<button class="scroll-top-btn" on:click={scrollToTop} title="回到顶部">↑</button>

{#if selectedCard}
  <EncyclopediaDetailModal
    card={selectedCard}
    onClose={closeEncyclopedia}
  />
{/if}

<style>
  .encyclopedia-intro {
    background: linear-gradient(135deg, rgba(0, 229, 255, 0.08), rgba(224, 64, 251, 0.08));
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
  }
  .intro-text {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }
  .intro-icon {
    font-size: 42px;
    flex-shrink: 0;
    filter: drop-shadow(0 0 10px var(--accent-cyan));
    animation: float 3s ease-in-out infinite;
  }
  .intro-title {
    font-size: 16px;
    color: var(--accent-cyan);
    margin-bottom: 4px;
    text-shadow: 0 0 10px var(--accent-cyan);
  }
  .intro-desc {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  .stats-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    padding: 12px;
    background: var(--bg-card);
    border-radius: 8px;
    border: 1px solid var(--border-glow);
    margin-bottom: 16px;
  }
  .stat-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    padding: 4px 10px;
    background: rgba(255,255,255,0.03);
    border-radius: 12px;
  }
  .stat-divider {
    width: 1px;
    height: 20px;
    background: var(--text-dim);
    opacity: 0.3;
    margin: 0 6px;
  }

  .search-sort-row {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
  }
  .search-box {
    flex: 1;
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
  .sort-select-wrap {
    flex-shrink: 0;
  }
  .sort-select {
    padding: 10px 14px;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 6px;
    color: var(--text-primary);
    font-family: var(--font-mono);
    font-size: 13px;
    outline: none;
    cursor: pointer;
  }
  .sort-select:focus {
    border-color: var(--accent-cyan);
  }
  .sort-select option {
    background: var(--bg-secondary);
  }

  .secondary-tabs {
    overflow-x: auto;
    white-space: nowrap;
    margin-bottom: 10px;
  }
  .secondary-tabs .tab {
    flex: 0 0 auto;
    padding: 10px 14px;
    font-size: 12px;
  }

  .rarity-filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .rarity-chip {
    padding: 6px 14px;
    border-radius: 20px;
    font-family: var(--font-mono);
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--bg-card);
    border: 1px solid var(--chip-color, var(--text-dim));
    color: var(--chip-color, var(--text-dim));
    opacity: 0.7;
  }
  .rarity-chip:hover {
    opacity: 1;
    transform: translateY(-1px);
  }
  .rarity-chip.active {
    opacity: 1;
    background: color-mix(in srgb, var(--chip-color, var(--accent-cyan)) 15%, transparent);
    box-shadow: 0 0 12px color-mix(in srgb, var(--chip-color, var(--accent-cyan)) 30%, transparent);
  }

  .encyclopedia-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 14px;
  }
  .encyclopedia-card {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 10px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.25s ease;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }
  .encyclopedia-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.06), transparent);
    transition: left 0.5s ease;
    pointer-events: none;
  }
  .encyclopedia-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 229, 255, 0.2);
  }
  .encyclopedia-card:hover::before {
    left: 100%;
  }
  .encyclopedia-card.has-encyclopedia {
    border-color: rgba(0, 229, 255, 0.4);
  }
  .encyclopedia-card.has-encyclopedia:hover {
    box-shadow: 0 8px 25px rgba(0, 229, 255, 0.3), 0 0 0 1px var(--accent-cyan);
  }
  .encyclopedia-card.card-legendary:hover {
    box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
  }
  .encyclopedia-card.card-epic:hover {
    box-shadow: 0 8px 25px rgba(156, 39, 176, 0.3);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .card-number {
    font-size: 13px;
    font-weight: bold;
  }
  .card-category {
    font-size: 16px;
    opacity: 0.8;
  }

  .card-symbol-wrap {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 18px 0;
    margin-bottom: 8px;
  }
  .card-symbol {
    font-size: 52px;
    filter: drop-shadow(0 0 12px currentColor);
    animation: float 4s ease-in-out infinite;
  }
  .encyclopedia-badge, .preview-badge {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 3px;
    font-family: var(--font-mono);
    font-size: 9px;
    padding: 3px 7px;
    border-radius: 4px;
    letter-spacing: 0.5px;
  }
  .encyclopedia-badge {
    background: rgba(0, 229, 255, 0.2);
    color: var(--accent-cyan);
    border: 1px solid var(--accent-cyan);
  }
  .badge-icon {
    font-size: 10px;
  }
  .preview-badge {
    background: rgba(138, 138, 154, 0.2);
    color: var(--text-dim);
    border: 1px solid var(--text-dim);
  }

  .card-info {
    text-align: center;
    margin-bottom: 10px;
  }
  .card-name-text {
    font-size: 14px;
    color: var(--text-primary);
    margin-bottom: 6px;
    font-weight: 500;
  }
  .card-meta {
    margin-bottom: 6px;
  }
  .keywords {
    display: flex;
    justify-content: center;
    gap: 4px;
    flex-wrap: wrap;
  }
  .keyword.small {
    padding: 2px 6px;
    font-size: 9px;
  }

  .card-footer {
    margin-top: auto;
    text-align: center;
    padding-top: 8px;
    border-top: 1px solid rgba(255,255,255,0.05);
  }
  .footer-hint {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
  }
  .encyclopedia-card:hover .footer-hint {
    color: var(--accent-cyan);
  }

  .scroll-top-btn {
    position: fixed;
    bottom: 100px;
    right: 20px;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: var(--bg-card);
    border: 1px solid var(--accent-cyan);
    color: var(--accent-cyan);
    font-size: 20px;
    cursor: pointer;
    box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);
    z-index: 50;
    opacity: 0;
    visibility: hidden;
    transform: translateY(10px);
    transition: all 0.25s ease;
  }
  .scroll-top-btn:hover {
    background: rgba(0, 229, 255, 0.15);
    transform: translateY(-3px);
  }
  .page-container {
    position: relative;
  }
  .page-container:hover .scroll-top-btn,
  :global(.page-container:hover) .scroll-top-btn {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

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
    font-family: var(--font-mono);
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
</style>
