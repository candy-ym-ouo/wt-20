<script>
  import { onMount } from 'svelte'
  import { CARDS } from '../data/cards.js'
  import { CARD_RARITY, RARITY_CONFIG, CATEGORY_CONFIG } from '../data/constants.js'
  import { Storage } from '../utils/storage.js'
  import { filterCards, createDeck, addCardToDeck, removeCardFromDeck, getDeckCards, getDeckStats, generateDeckSuggestions, STORYLINE_CONFIG } from '../utils/deckSystem.js'
  import CardFilter from '../components/CardFilter.svelte'
  import CardDetailModal from '../components/CardDetailModal.svelte'

  let decks = []
  let collection = {}
  let activeTab = 'mydecks'
  let editingDeck = null
  let selectedCard = null

  let searchQuery = ''
  let rarity = null
  let category = null
  let storyline = null
  let selectedKeywords = []
  let collectedOnly = false

  let newDeckName = ''
  let newDeckDescription = ''
  let newDeckColor = '#4fc3f7'
  let showSuggestions = false
  const suggestions = generateDeckSuggestions()

  let formName = ''
  let formDescription = ''
  let formColor = '#4fc3f7'

  $: {
    if (editingDeck) {
      formName = editingDeck.name
      formDescription = editingDeck.description
      formColor = editingDeck.color
    } else {
      formName = newDeckName
      formDescription = newDeckDescription
      formColor = newDeckColor
    }
  }

  function updateFormName(value) {
    if (editingDeck) {
      editingDeck.name = value
    } else {
      newDeckName = value
    }
  }

  function updateFormDescription(value) {
    if (editingDeck) {
      editingDeck.description = value
    } else {
      newDeckDescription = value
    }
  }

  function updateFormColor(value) {
    if (editingDeck) {
      editingDeck.color = value
    } else {
      newDeckColor = value
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

  $: editingDeckCards = editingDeck ? getDeckCards(editingDeck) : []
  $: editingDeckStats = editingDeck ? getDeckStats(editingDeck, collection) : null

  const COLORS = ['#4fc3f7', '#ba68c8', '#ffd54f', '#ff5252', '#69f0ae', '#e040fb', '#00e5ff']
  const TABS = [
    { id: 'mydecks', label: '我的卡组' },
    { id: 'create', label: '创建卡组' }
  ]

  function refresh() {
    decks = Storage.getDecks()
    collection = Storage.getCollection()
  }

  function createNewDeck() {
    if (!newDeckName.trim()) return
    const deck = createDeck({
      name: newDeckName.trim(),
      description: newDeckDescription.trim(),
      color: newDeckColor
    })
    decks = Storage.saveDeck(deck)
    newDeckName = ''
    newDeckDescription = ''
    activeTab = 'mydecks'
  }

  function createFromSuggestion(suggestion) {
    const deck = createDeck({
      name: suggestion.name,
      description: suggestion.description,
      color: suggestion.color,
      cardIds: suggestion.suggestedCards
    })
    decks = Storage.saveDeck(deck)
    showSuggestions = false
    activeTab = 'mydecks'
  }

  function startEditing(deck) {
    editingDeck = { ...deck }
    activeTab = 'create'
  }

  function saveEditingDeck() {
    if (!editingDeck) return
    decks = Storage.saveDeck(editingDeck)
    editingDeck = null
    activeTab = 'mydecks'
  }

  function cancelEditing() {
    editingDeck = null
    activeTab = 'mydecks'
  }

  function deleteDeck(deckId) {
    if (confirm('确定要删除这个卡组吗？')) {
      decks = Storage.deleteDeck(deckId)
    }
  }

  function toggleCardInDeck(cardId) {
    if (!editingDeck) return
    if (editingDeck.cardIds.includes(cardId)) {
      editingDeck = removeCardFromDeck(editingDeck, cardId)
    } else {
      editingDeck = addCardToDeck(editingDeck, cardId)
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

<h1 class="page-title">◆ 卡 组 编 辑 器 ◆</h1>

<div class="tabs">
  {#each TABS as tab}
    <div
      class="tab {activeTab === tab.id ? 'active' : ''}"
      on:click={() => {
        if (tab.id === 'mydecks') cancelEditing()
        activeTab = tab.id
      }}
    >
      {tab.label}
    </div>
  {/each}
</div>

{#if activeTab === 'mydecks'}
  {#if decks.length === 0}
    <div class="empty-state">
      <div class="empty-state-icon">🎴</div>
      <div class="empty-state-text">还没有卡组</div>
      <div class="empty-state-subtext">创建你的第一个专属卡组吧！</div>
      <button class="primary-btn" on:click={() => activeTab = 'create'}>
        创建卡组
      </button>
    </div>
  {:else}
    <div class="decks-grid">
      {#each decks as deck}
        {@const deckCards = getDeckCards(deck)}
        {@const stats = getDeckStats(deck, collection)}
        <div class="deck-card" style="--deck-color: {deck.color}">
          <div class="deck-header">
            <div class="deck-name">{deck.name}</div>
            {#if deck.isFavorite}
              <span class="favorite-icon">⭐</span>
            {/if}
          </div>
          {#if deck.description}
            <div class="deck-description">{deck.description}</div>
          {/if}
          <div class="deck-preview">
            {#each deckCards.slice(0, 5) as card, i}
              <div
                class="preview-card card-{card.rarity}"
                style="left: {i * 15}px; z-index: {i}"
              >
                <span class="preview-symbol">{card.symbol}</span>
              </div>
            {/each}
            {#if deckCards.length > 5}
              <span class="more-cards">+{deckCards.length - 5}</span>
            {/if}
          </div>
          <div class="deck-stats">
            <div class="stat-item">
              <span class="stat-value">{deckCards.length}</span>
              <span class="stat-label">卡牌</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{stats.completionPercent}%</span>
              <span class="stat-label">收集</span>
            </div>
            <div class="stat-item">
              <span class="stat-value mono">{formatDate(deck.updatedAt)}</span>
              <span class="stat-label">更新</span>
            </div>
          </div>
          <div class="deck-actions">
            <button class="action-btn" on:click={() => startEditing(deck)}>
              编辑
            </button>
            <button class="action-btn danger" on:click={() => deleteDeck(deck.id)}>
              删除
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}

{:else if activeTab === 'create'}
  <div class="editor-layout">
    <div class="deck-form">
      <div class="form-section">
        <label class="form-label">卡组名称</label>
        <input
          type="text"
          value={formName}
          on:input={(e) => updateFormName(e.target.value)}
          placeholder="输入卡组名称..."
          class="form-input"
          maxlength={30}
        />
      </div>

      <div class="form-section">
        <label class="form-label">卡组描述</label>
        <textarea
          value={formDescription}
          on:input={(e) => updateFormDescription(e.target.value)}
          placeholder="描述这个卡组的主题..."
          class="form-textarea"
          rows={3}
          maxlength={100}
        />
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

      {#if editingDeck && editingDeckStats}
        <div class="form-section">
          <label class="form-label">卡组统计</label>
          <div class="deck-stats-detail">
            <div class="stats-row">
              <span>卡牌总数:</span>
              <span class="mono">{editingDeckStats.totalCards}</span>
            </div>
            <div class="stats-row">
              <span>收集进度:</span>
              <span class="mono">{editingDeckStats.collectedCount}/{editingDeckStats.totalCards} ({editingDeckStats.completionPercent}%)</span>
            </div>
            <div class="stats-row">
              <span>稀有度:</span>
              <div class="rarity-tags">
                {#each Object.entries(editingDeckStats.rarityCounts) as [r, count]}
                  {#if count > 0}
                    <span class="rarity-tag" style="color: {RARITY_CONFIG[r].color}">
                      {RARITY_CONFIG[r].label} ×{count}
                    </span>
                  {/if}
                {/each}
              </div>
            </div>
            {#if editingDeckStats.keywords.length > 0}
              <div class="stats-row">
                <span>关键词:</span>
                <div class="keyword-chips">
                  {#each editingDeckStats.keywords.slice(0, 5) as kw}
                    <span class="keyword-chip">{kw}</span>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/if}

      {#if !editingDeck}
        <div class="form-section">
          <button
            class="suggestion-toggle"
            on:click={() => showSuggestions = !showSuggestions}
          >
            {showSuggestions ? '收起推荐 ▲' : '查看推荐卡组 ▼'}
          </button>
          {#if showSuggestions}
            <div class="suggestions-list">
              {#each suggestions as sug}
                <div class="suggestion-card" style="--sug-color: {sug.color}">
                  <div class="suggestion-header">
                    <span class="suggestion-icon">{STORYLINE_CONFIG[sug.storyline]?.icon}</span>
                    <span class="suggestion-name">{sug.name}</span>
                  </div>
                  <div class="suggestion-desc">{sug.description}</div>
                  <div class="suggestion-cards">{sug.suggestedCards.length} 张卡牌</div>
                  <button class="use-suggestion-btn" on:click={() => createFromSuggestion(sug)}>
                    使用这个模板
                  </button>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}

      <div class="form-actions">
        {#if editingDeck}
          <button class="secondary-btn" on:click={cancelEditing}>
            取消
          </button>
          <button class="primary-btn" on:click={saveEditingDeck}>
            保存修改
          </button>
        {:else}
          <button class="primary-btn" on:click={createNewDeck} disabled={!newDeckName.trim()}>
            创建卡组
          </button>
        {/if}
      </div>
    </div>

    <div class="card-selector">
      <div class="selector-header">
        <h3>{editingDeck ? '编辑卡组卡牌' : '选择卡牌'}</h3>
        {#if editingDeck}
          <span class="selected-count">已选择 {editingDeck.cardIds.length} 张</span>
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
            {@const isInDeck = editingDeck?.cardIds.includes(card.id)}
            <div
              class="select-card card-{card.rarity} {!isCollected ? 'locked' : ''} {isInDeck ? 'selected' : ''}"
              on:click={() => isCollected && editingDeck && toggleCardInDeck(card.id)}
              on:dblclick={() => openCardDetail(card)}
            >
              {#if isInDeck}
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

      {#if editingDeck && editingDeckCards.length > 0}
        <div class="selected-cards-section">
          <h4>当前卡组卡牌</h4>
          <div class="selected-cards-list">
            {#each editingDeckCards as card}
              <div class="selected-card-item card-{card.rarity}" on:click={() => toggleCardInDeck(card.id)}>
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
  .decks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .deck-card {
    background: var(--bg-card);
    border: 1px solid var(--deck-color, var(--border-glow));
    border-radius: 12px;
    padding: 16px;
    transition: all 0.3s ease;
  }

  .deck-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px var(--deck-color, var(--accent-cyan));
  }

  .deck-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .deck-name {
    font-size: 18px;
    font-weight: bold;
    color: var(--text-primary);
  }

  .favorite-icon {
    font-size: 16px;
  }

  .deck-description {
    font-size: 13px;
    color: var(--text-dim);
    margin-bottom: 12px;
    line-height: 1.5;
  }

  .deck-preview {
    position: relative;
    height: 80px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
  }

  .preview-card {
    position: absolute;
    width: 50px;
    height: 70px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid;
    transition: transform 0.2s ease;
  }

  .preview-card:hover {
    transform: translateY(-4px);
  }

  .preview-symbol {
    font-size: 24px;
  }

  .more-cards {
    position: absolute;
    right: 0;
    font-size: 12px;
    color: var(--text-dim);
    font-family: var(--font-mono);
  }

  .deck-stats {
    display: flex;
    justify-content: space-around;
    padding: 12px 0;
    border-top: 1px solid var(--border-glow);
    border-bottom: 1px solid var(--border-glow);
    margin-bottom: 12px;
  }

  .stat-item {
    text-align: center;
  }

  .stat-value {
    display: block;
    font-size: 16px;
    font-weight: bold;
    color: var(--text-primary);
  }

  .stat-label {
    font-size: 11px;
    color: var(--text-dim);
  }

  .deck-actions {
    display: flex;
    gap: 8px;
  }

  .action-btn {
    flex: 1;
    padding: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-glow);
    border-radius: 6px;
    color: var(--text-secondary);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    border-color: var(--accent-cyan);
    color: var(--accent-cyan);
  }

  .action-btn.danger:hover {
    border-color: var(--accent-red);
    color: var(--accent-red);
  }

  .editor-layout {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 20px;
  }

  @media (max-width: 900px) {
    .editor-layout {
      grid-template-columns: 1fr;
    }
  }

  .deck-form {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 20px;
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

  .deck-stats-detail {
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

  .rarity-tags, .keyword-chips {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .rarity-tag {
    font-size: 11px;
    font-weight: bold;
  }

  .keyword-chip {
    padding: 2px 8px;
    background: rgba(0, 229, 255, 0.2);
    border-radius: 10px;
    font-size: 10px;
    color: var(--accent-cyan);
  }

  .suggestion-toggle {
    width: 100%;
    padding: 8px;
    background: transparent;
    border: 1px dashed var(--border-glow);
    border-radius: 6px;
    color: var(--accent-cyan);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: var(--font-mono);
  }

  .suggestion-toggle:hover {
    border-color: var(--accent-cyan);
  }

  .suggestions-list {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .suggestion-card {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--sug-color);
    border-radius: 8px;
    padding: 12px;
  }

  .suggestion-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .suggestion-icon {
    font-size: 18px;
  }

  .suggestion-name {
    font-weight: bold;
    color: var(--text-primary);
  }

  .suggestion-desc {
    font-size: 12px;
    color: var(--text-dim);
    margin-bottom: 8px;
  }

  .suggestion-cards {
    font-size: 11px;
    color: var(--accent-cyan);
    font-family: var(--font-mono);
    margin-bottom: 8px;
  }

  .use-suggestion-btn {
    width: 100%;
    padding: 6px;
    background: var(--sug-color);
    border: none;
    border-radius: 4px;
    color: #000;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .use-suggestion-btn:hover {
    opacity: 0.9;
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

  .card-selector {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 20px;
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
    max-height: 400px;
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
