<script>
  import { onMount } from 'svelte'
  import { CARDS } from '../data/cards.js'
  import { CARD_RARITY, RARITY_CONFIG, CATEGORY_CONFIG } from '../data/constants.js'
  import { Storage } from '../utils/storage.js'
  import { filterCards, createThemeAlbum, getDeckCards, getDeckStats, STORYLINE_CONFIG, STORYLINE_THEMES, suggestCardsForStoryline } from '../utils/deckSystem.js'
  import CardFilter from '../components/CardFilter.svelte'
  import CardDetailModal from '../components/CardDetailModal.svelte'

  let albums = []
  let collection = {}
  let activeTab = 'albums'
  let editingAlbum = null
  let selectedCard = null
  let viewingAlbum = null

  let searchQuery = ''
  let rarity = null
  let category = null
  let storyline = null
  let selectedKeywords = []
  let collectedOnly = false

  let newAlbumName = ''
  let newAlbumDescription = ''
  let newAlbumStoryline = null
  let newAlbumColor = '#ba68c8'

  let formName = ''
  let formDescription = ''
  let formStoryline = null
  let formColor = '#ba68c8'

  $: {
    if (editingAlbum) {
      formName = editingAlbum.name
      formDescription = editingAlbum.description
      formStoryline = editingAlbum.storyline
      formColor = editingAlbum.color
    } else {
      formName = newAlbumName
      formDescription = newAlbumDescription
      formStoryline = newAlbumStoryline
      formColor = newAlbumColor
    }
  }

  function updateFormName(value) {
    if (editingAlbum) {
      editingAlbum.name = value
    } else {
      newAlbumName = value
    }
  }

  function updateFormDescription(value) {
    if (editingAlbum) {
      editingAlbum.description = value
    } else {
      newAlbumDescription = value
    }
  }

  function updateFormStoryline(value) {
    if (editingAlbum) {
      editingAlbum.storyline = value
    } else {
      newAlbumStoryline = value
    }
  }

  function updateFormColor(value) {
    if (editingAlbum) {
      editingAlbum.color = value
    } else {
      newAlbumColor = value
    }
  }

  $: availableCards = filterCards({
    searchQuery,
    rarity,
    category,
    storyline,
    keywords: selectedKeywords,
    collectedOnly,
    collection
  })

  $: editingAlbumCards = editingAlbum ? getDeckCards(editingAlbum) : []
  $: editingAlbumStats = editingAlbum ? getDeckStats(editingAlbum, collection) : null
  $: viewingAlbumCards = viewingAlbum ? getDeckCards(viewingAlbum) : []
  $: viewingAlbumStats = viewingAlbum ? getDeckStats(viewingAlbum, collection) : null

  const COLORS = ['#ba68c8', '#4fc3f7', '#ffd54f', '#ff5252', '#69f0ae', '#e040fb', '#00e5ff']
  const TABS = [
    { id: 'albums', label: '主题册列表' },
    { id: 'create', label: '创建主题册' }
  ]

  function refresh() {
    albums = Storage.getThemeAlbums()
    collection = Storage.getCollection()
  }

  function createNewAlbum() {
    if (!newAlbumName.trim()) return
    const album = createThemeAlbum({
      name: newAlbumName.trim(),
      description: newAlbumDescription.trim(),
      storyline: newAlbumStoryline,
      color: newAlbumColor,
      rarityFilter: rarity,
      keywords: [...selectedKeywords]
    })
    if (newAlbumStoryline) {
      album.cardIds = suggestCardsForStoryline(newAlbumStoryline).map(c => c.id)
    }
    albums = Storage.saveThemeAlbum(album)
    newAlbumName = ''
    newAlbumDescription = ''
    newAlbumStoryline = null
    rarity = null
    selectedKeywords = []
    activeTab = 'albums'
  }

  function startEditing(album) {
    editingAlbum = { ...album }
    activeTab = 'create'
  }

  function viewAlbum(album) {
    viewingAlbum = { ...album }
  }

  function closeView() {
    viewingAlbum = null
  }

  function saveEditingAlbum() {
    if (!editingAlbum) return
    albums = Storage.saveThemeAlbum(editingAlbum)
    editingAlbum = null
    activeTab = 'albums'
  }

  function cancelEditing() {
    editingAlbum = null
    activeTab = 'albums'
  }

  function deleteAlbum(albumId) {
    if (confirm('确定要删除这个主题册吗？')) {
      albums = Storage.deleteThemeAlbum(albumId)
    }
  }

  function toggleCardInAlbum(cardId) {
    if (!editingAlbum) return
    if (editingAlbum.cardIds.includes(cardId)) {
      editingAlbum = {
        ...editingAlbum,
        cardIds: editingAlbum.cardIds.filter(id => id !== cardId)
      }
    } else {
      editingAlbum = {
        ...editingAlbum,
        cardIds: [...editingAlbum.cardIds, cardId]
      }
    }
  }

  function applyFiltersToAlbum() {
    if (!editingAlbum) return
    const filtered = filterCards({
      rarity,
      keywords: selectedKeywords,
      storyline: editingAlbum.storyline,
      collectedOnly: true,
      collection
    })
    editingAlbum = {
      ...editingAlbum,
      cardIds: filtered.map(c => c.id),
      rarityFilter: rarity,
      keywords: [...selectedKeywords]
    }
  }

  function openCardDetail(card) {
    selectedCard = card
  }

  function closeCardDetail() {
    selectedCard = null
  }

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('zh-CN')
  }

  onMount(() => {
    refresh()
  })
</script>

<h1 class="page-title">◆ 收 藏 主 题 册 ◆</h1>

<div class="tabs">
  {#each TABS as tab}
    <div
      class="tab {activeTab === tab.id ? 'active' : ''}"
      on:click={() => {
        if (tab.id === 'albums') cancelEditing()
        activeTab = tab.id
      }}
    >
      {tab.label}
    </div>
  {/each}
</div>

{#if viewingAlbum}
  <div class="album-view-modal">
    <div class="modal-header">
      <div>
        <span class="modal-icon">{STORYLINE_CONFIG[viewingAlbum.storyline]?.icon || '📚'}</span>
        <h2 style="display: inline; margin-left: 8px;">{viewingAlbum.name}</h2>
      </div>
      <button class="close-btn" on:click={closeView}>×</button>
    </div>
    {#if viewingAlbum.description}
      <p class="modal-description">{viewingAlbum.description}</p>
    {/if}
    {#if viewingAlbum.storyline}
      <div class="storyline-banner" style="--story-color: {STORYLINE_CONFIG[viewingAlbum.storyline]?.color}">
        <span class="story-icon">{STORYLINE_CONFIG[viewingAlbum.storyline]?.icon}</span>
        <div>
          <div class="story-name">{STORYLINE_CONFIG[viewingAlbum.storyline]?.name}</div>
          <div class="story-desc">{STORYLINE_CONFIG[viewingAlbum.storyline]?.description}</div>
        </div>
      </div>
    {/if}
    {#if viewingAlbumStats}
      <div class="album-stats">
        <div class="stat-box">
          <span class="stat-number">{viewingAlbumStats.totalCards}</span>
          <span class="stat-label">卡牌总数</span>
        </div>
        <div class="stat-box">
          <span class="stat-number">{viewingAlbumStats.collectedCount}</span>
          <span class="stat-label">已收集</span>
        </div>
        <div class="stat-box">
          <span class="stat-number">{viewingAlbumStats.completionPercent}%</span>
          <span class="stat-label">完成度</span>
        </div>
      </div>
    {/if}
    <div class="album-cards-grid">
      {#each viewingAlbumCards as card}
        {@const isCollected = !!collection[card.id]}
        <div
          class="album-card card-{card.rarity} {!isCollected ? 'locked' : ''}"
          on:click={() => isCollected && openCardDetail(card)}
        >
          <div class="album-card-symbol" style="color: {RARITY_CONFIG[card.rarity].color}">
            {isCollected ? card.symbol : '?'}
          </div>
          <div class="album-card-name">
            {isCollected ? card.name : '???'}
          </div>
          <div class="album-card-rarity" style="color: {RARITY_CONFIG[card.rarity].color}">
            {RARITY_CONFIG[card.rarity].label}
          </div>
        </div>
      {/each}
    </div>
  </div>

{:else if activeTab === 'albums'}
  {#if albums.length === 0}
    <div class="empty-state">
      <div class="empty-state-icon">📚</div>
      <div class="empty-state-text">还没有主题册</div>
      <div class="empty-state-subtext">创建你的第一个收藏主题册吧！</div>
      <button class="primary-btn" on:click={() => activeTab = 'create'}>
        创建主题册
      </button>
    </div>
  {:else}
    <div class="albums-grid">
      {#each albums as album}
        {@const albumCards = getDeckCards(album)}
        {@const stats = getDeckStats(album, collection)}
        {@const storyConfig = STORYLINE_CONFIG[album.storyline]}
        <div
          class="album-card-item"
          style="--album-color: {album.color}"
          on:click={() => viewAlbum(album)}
        >
          <div class="album-header">
            <span class="album-icon">{storyConfig?.icon || '📚'}</span>
            <div class="album-title">
              <div class="album-name">{album.name}</div>
              {#if storyConfig}
                <div class="album-storyline" style="color: {storyConfig.color}">
                  {storyConfig.name}
                </div>
              {/if}
            </div>
          </div>
          {#if album.description}
            <div class="album-description">{album.description}</div>
          {/if}
          <div class="album-progress">
            <div class="progress-label">
              <span>收集进度</span>
              <span class="mono">{stats.collectedCount}/{stats.totalCards} ({stats.completionPercent}%)</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                style="width: {stats.completionPercent}%; background: {album.color}"
              />
            </div>
          </div>
          <div class="album-cards-preview">
            {#each albumCards.slice(0, 6) as card, i}
              <div
                class="mini-card card-{card.rarity} {!collection[card.id] ? 'locked' : ''}"
                style="--card-color: {RARITY_CONFIG[card.rarity].color}"
              >
                {collection[card.id] ? card.symbol : '?'}
              </div>
            {/each}
            {#if albumCards.length > 6}
              <span class="more-album-cards">+{albumCards.length - 6}</span>
            {/if}
          </div>
          <div class="album-meta">
            <span class="mono">{formatDate(album.updatedAt)}</span>
            <div class="album-actions" on:click|stopPropagation>
              <button class="mini-btn" on:click={() => startEditing(album)}>编辑</button>
              <button class="mini-btn danger" on:click={() => deleteAlbum(album.id)}>删除</button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

{:else if activeTab === 'create'}
  <div class="editor-layout">
    <div class="album-form">
      <div class="form-section">
        <label class="form-label">主题册名称</label>
        <input
          type="text"
          value={formName}
          on:input={(e) => updateFormName(e.target.value)}
          placeholder="输入主题册名称..."
          class="form-input"
          maxlength={30}
        />
      </div>

      <div class="form-section">
        <label class="form-label">主题册描述</label>
        <textarea
          value={formDescription}
          on:input={(e) => updateFormDescription(e.target.value)}
          placeholder="描述这个主题册的内容..."
          class="form-textarea"
          rows={3}
          maxlength={100}
        />
      </div>

      <div class="form-section">
        <label class="form-label">故事线主题</label>
        <div class="storyline-options">
          <button
            class="storyline-option {formStoryline === null ? 'active' : ''}"
            on:click={() => updateFormStoryline(null)}
          >
            无主题
          </button>
          {#each Object.values(STORYLINE_CONFIG) as s}
            <button
              class="storyline-option {formStoryline === s.id ? 'active' : ''}"
              style="--story-color: {s.color}"
              on:click={() => updateFormStoryline(s.id)}
            >
              <span>{s.icon}</span>
              {s.name}
            </button>
          {/each}
        </div>
      </div>

      <div class="form-section">
        <label class="form-label">主题颜色</label>
        <div class="color-picker">
          {#each COLORS as color}
            <button
              class="color-option {formColor === color ? 'selected' : ''}"
              style="background: {color}"
              on:click={() => updateFormColor(color)}
            />
          {/each}
        </div>
      </div>

      {#if editingAlbum}
        <div class="form-section">
          <label class="form-label">自动筛选设置</label>
          <div class="auto-filter-section">
            <div class="filter-note">设置稀有度和关键词筛选器，然后点击下方按钮自动填充符合条件的卡牌</div>
            <button class="auto-filter-btn" on:click={applyFiltersToAlbum}>
              应用筛选条件到主题册
            </button>
          </div>
        </div>
      {/if}

      {#if editingAlbum && editingAlbumStats}
        <div class="form-section">
          <label class="form-label">主题册统计</label>
          <div class="album-stats-detail">
            <div class="stats-row">
              <span>卡牌总数:</span>
              <span class="mono">{editingAlbumStats.totalCards}</span>
            </div>
            <div class="stats-row">
              <span>收集进度:</span>
              <span class="mono">{editingAlbumStats.collectedCount}/{editingAlbumStats.totalCards} ({editingAlbumStats.completionPercent}%)</span>
            </div>
            <div class="stats-row">
              <span>稀有度分布:</span>
              <div class="rarity-tags">
                {#each Object.entries(editingAlbumStats.rarityCounts) as [r, count]}
                  {#if count > 0}
                    <span class="rarity-tag" style="color: {RARITY_CONFIG[r].color}">
                      {RARITY_CONFIG[r].label} ×{count}
                    </span>
                  {/if}
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/if}

      <div class="form-actions">
        {#if editingAlbum}
          <button class="secondary-btn" on:click={cancelEditing}>
            取消
          </button>
          <button class="primary-btn" on:click={saveEditingAlbum}>
            保存修改
          </button>
        {:else}
          <button class="primary-btn" on:click={createNewAlbum} disabled={!newAlbumName.trim()}>
            创建主题册
          </button>
        {/if}
      </div>
    </div>

    <div class="card-selector">
      <div class="selector-header">
        <h3>{editingAlbum ? '编辑主题册卡牌' : '预览筛选结果'}</h3>
        {#if editingAlbum}
          <span class="selected-count">已选择 {editingAlbum.cardIds.length} 张</span>
        {/if}
      </div>

      <CardFilter
        bind:searchQuery
        bind:rarity
        bind:category
        bind:storyline
        bind:selectedKeywords
        bind:collectedOnly
      />

      {#if availableCards.length === 0}
        <div class="empty-state small">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-text">没有找到匹配的卡牌</div>
        </div>
      {:else}
        <div class="cards-select-grid">
          {#each availableCards as card}
            {@const isCollected = !!collection[card.id]}
            {@const isInAlbum = editingAlbum?.cardIds.includes(card.id)}
            <div
              class="select-card card-{card.rarity} {!isCollected ? 'locked' : ''} {isInAlbum ? 'selected' : ''}"
              on:click={() => isCollected && editingAlbum && toggleCardInAlbum(card.id)}
              on:dblclick={() => openCardDetail(card)}
            >
              {#if isInAlbum}
                <span class="checkmark">✓</span>
              {/if}
              <div class="select-symbol" style="color: {RARITY_CONFIG[card.rarity].color}">
                {isCollected ? card.symbol : '?'}
              </div>
              <div class="select-name">
                {isCollected ? card.name : '???'}
              </div>
              <div class="select-keywords">
                {#each card.keywords.slice(0, 2) as kw}
                  <span class="mini-keyword">{kw}</span>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/if}

      {#if editingAlbum && editingAlbumCards.length > 0}
        <div class="selected-cards-section">
          <h4>当前主题册卡牌</h4>
          <div class="selected-cards-list">
            {#each editingAlbumCards as card}
              <div class="selected-card-item card-{card.rarity}" on:click={() => toggleCardInAlbum(card.id)}>
                <span class="item-symbol">{card.symbol}</span>
                <span class="item-name">{card.name}</span>
                <span class="item-remove">×</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

{#if selectedCard}
  <CardDetailModal
    card={selectedCard}
    collectionData={collection[selectedCard.id]}
    onClose={closeCardDetail}
  />
{/if}

<style>
  .albums-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .album-card-item {
    background: var(--bg-card);
    border: 1px solid var(--album-color, var(--border-glow));
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .album-card-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px var(--album-color, var(--accent-cyan));
  }

  .album-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  .album-icon {
    font-size: 32px;
  }

  .album-name {
    font-size: 16px;
    font-weight: bold;
    color: var(--text-primary);
  }

  .album-storyline {
    font-size: 11px;
    font-family: var(--font-mono);
  }

  .album-description {
    font-size: 13px;
    color: var(--text-dim);
    margin-bottom: 12px;
    line-height: 1.4;
  }

  .album-progress {
    margin-bottom: 12px;
  }

  .progress-label {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--text-dim);
    margin-bottom: 4px;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s ease;
  }

  .album-cards-preview {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 12px;
    min-height: 40px;
  }

  .mini-card {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    border: 2px solid var(--card-color, var(--border-glow));
    background: rgba(0, 0, 0, 0.3);
  }

  .mini-card.locked {
    opacity: 0.4;
  }

  .more-album-cards {
    font-size: 11px;
    color: var(--text-dim);
    font-family: var(--font-mono);
    margin-left: 4px;
  }

  .album-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    border-top: 1px solid var(--border-glow);
    font-size: 11px;
    color: var(--text-dim);
  }

  .album-actions {
    display: flex;
    gap: 6px;
  }

  .mini-btn {
    padding: 4px 10px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-glow);
    border-radius: 4px;
    color: var(--text-secondary);
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .mini-btn:hover {
    border-color: var(--accent-cyan);
    color: var(--accent-cyan);
  }

  .mini-btn.danger:hover {
    border-color: var(--accent-red);
    color: var(--accent-red);
  }

  .album-view-modal {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 24px;
    max-height: 80vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .modal-icon {
    font-size: 28px;
  }

  .close-btn {
    background: none;
    border: none;
    color: var(--text-dim);
    font-size: 28px;
    cursor: pointer;
    padding: 0 8px;
    transition: color 0.2s ease;
  }

  .close-btn:hover {
    color: var(--accent-red);
  }

  .modal-description {
    color: var(--text-dim);
    margin-bottom: 16px;
    line-height: 1.5;
  }

  .storyline-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: linear-gradient(135deg, var(--story-color)20, transparent);
    border: 1px solid var(--story-color);
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .story-icon {
    font-size: 36px;
  }

  .story-name {
    font-weight: bold;
    color: var(--text-primary);
    margin-bottom: 2px;
  }

  .story-desc {
    font-size: 12px;
    color: var(--text-dim);
  }

  .album-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }

  .stat-box {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    padding: 16px;
    text-align: center;
  }

  .stat-number {
    display: block;
    font-size: 24px;
    font-weight: bold;
    color: var(--accent-cyan);
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 12px;
    color: var(--text-dim);
  }

  .album-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .album-card {
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid var(--border-glow);
    border-radius: 8px;
    padding: 12px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .album-card:hover:not(.locked) {
    transform: translateY(-2px);
    border-color: var(--accent-cyan);
  }

  .album-card.locked {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .album-card-symbol {
    font-size: 36px;
    display: block;
    margin-bottom: 6px;
  }

  .album-card-name {
    font-size: 12px;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .album-card-rarity {
    font-size: 10px;
    font-weight: bold;
  }

  .storyline-options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .storyline-option {
    padding: 8px 14px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-glow);
    border-radius: 20px;
    color: var(--text-secondary);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .storyline-option:hover {
    border-color: var(--story-color, var(--accent-cyan));
    color: var(--story-color, var(--accent-cyan));
  }

  .storyline-option.active {
    background: var(--story-color, var(--accent-cyan));
    border-color: var(--story-color, var(--accent-cyan));
    color: #000;
    font-weight: bold;
  }

  .auto-filter-section {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    padding: 12px;
  }

  .filter-note {
    font-size: 12px;
    color: var(--text-dim);
    margin-bottom: 10px;
    line-height: 1.4;
  }

  .auto-filter-btn {
    width: 100%;
    padding: 10px;
    background: linear-gradient(135deg, var(--accent-magenta), var(--accent-cyan));
    border: none;
    border-radius: 6px;
    color: #fff;
    font-size: 13px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .auto-filter-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(224, 64, 251, 0.4);
  }

  .album-stats-detail {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    padding: 12px;
  }

  .stats-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .stats-row:last-child {
    margin-bottom: 0;
  }

  .rarity-tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .rarity-tag {
    font-size: 11px;
    font-weight: bold;
  }

  .editor-layout {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 20px;
  }

  @media (max-width: 900px) {
    .editor-layout {
      grid-template-columns: 1fr;
    }
  }

  .album-form, .card-selector {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 20px;
  }

  .album-form {
    height: fit-content;
  }

  .form-section {
    margin-bottom: 20px;
  }

  .form-label {
    display: block;
    font-size: 12px;
    color: var(--text-dim);
    margin-bottom: 8px;
    font-family: var(--font-mono);
  }

  .form-input, .form-textarea {
    width: 100%;
    padding: 10px 14px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-glow);
    border-radius: 6px;
    color: var(--text-primary);
    font-family: var(--font-mono);
    font-size: 13px;
    outline: none;
    transition: all 0.2s ease;
    resize: vertical;
  }

  .form-input:focus, .form-textarea:focus {
    border-color: var(--accent-cyan);
    box-shadow: 0 0 10px rgba(0, 229, 255, 0.2);
  }

  .color-picker {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .color-option {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 3px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .color-option.selected {
    border-color: #fff;
    transform: scale(1.1);
  }

  .form-actions {
    display: flex;
    gap: 10px;
  }

  .primary-btn {
    flex: 1;
    padding: 12px;
    background: linear-gradient(135deg, var(--accent-cyan), var(--accent-magenta));
    border: none;
    border-radius: 6px;
    color: #fff;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .primary-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 229, 255, 0.4);
  }

  .primary-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .secondary-btn {
    flex: 1;
    padding: 12px;
    background: transparent;
    border: 1px solid var(--border-glow);
    border-radius: 6px;
    color: var(--text-secondary);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .secondary-btn:hover {
    border-color: var(--accent-magenta);
    color: var(--accent-magenta);
  }

  .selector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .selector-header h3 {
    margin: 0;
    color: var(--text-primary);
  }

  .selected-count {
    font-size: 13px;
    color: var(--accent-cyan);
    font-family: var(--font-mono);
  }

  .cards-select-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 10px;
    max-height: 350px;
    overflow-y: auto;
    padding: 8px;
  }

  .select-card {
    position: relative;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid var(--border-glow);
    border-radius: 8px;
    padding: 10px 8px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .select-card:hover:not(.locked) {
    transform: translateY(-2px);
  }

  .select-card.locked {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .select-card.selected {
    border-color: var(--accent-cyan);
    background: rgba(0, 229, 255, 0.1);
    box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);
  }

  .checkmark {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 18px;
    height: 18px;
    background: var(--accent-cyan);
    color: #000;
    border-radius: 50%;
    font-size: 12px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .select-symbol {
    font-size: 32px;
    display: block;
    margin-bottom: 4px;
  }

  .select-name {
    font-size: 11px;
    color: var(--text-primary);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .select-keywords {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    justify-content: center;
  }

  .mini-keyword {
    padding: 1px 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    font-size: 9px;
    color: var(--text-dim);
  }

  .selected-cards-section {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--border-glow);
  }

  .selected-cards-section h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: var(--text-primary);
  }

  .selected-cards-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .selected-card-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-glow);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .selected-card-item:hover {
    border-color: var(--accent-red);
  }

  .item-symbol {
    font-size: 16px;
  }

  .item-name {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .item-remove {
    color: var(--text-dim);
    font-size: 14px;
  }

  .selected-card-item:hover .item-remove {
    color: var(--accent-red);
  }

  .empty-state.small {
    padding: 30px 20px;
  }
</style>
