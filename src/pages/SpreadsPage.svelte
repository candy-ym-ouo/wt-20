<script>
  import { onMount } from 'svelte'
  import { drawMultiSpread, saveMultiSpreadResult } from '../utils/cardSystem.js'
  import { Storage } from '../utils/storage.js'
  import { MULTI_SPREAD_CONFIG, getAllMultiSpreads } from '../data/constants.js'
  import CardDisplay from '../components/CardDisplay.svelte'
  import ResultModal from '../components/ResultModal.svelte'
  import {
    ownsItem,
    equippedShopItems,
    ownedShopItems
  } from '../utils/fateShopSystem.js'
  import { getShopItemById } from '../data/fateShop.js'

  let step = 'select-spread'
  let selectedSpread = null
  let question = ''
  let isAnimating = false
  let drawResults = null
  let showResult = false
  let stats = Storage.getStats()
  let spreads = getAllMultiSpreads()
  let ownedItems = {}

  function refreshStats() {
    stats = Storage.getStats()
  }

  function isSpreadUnlocked(spread) {
    if (!spread.special) return true
    return ownsItem(spread.shopItemId)
  }

  function getShopItemForSpread(spread) {
    if (!spread.special) return null
    return getShopItemById(spread.shopItemId)
  }

  function goToShop() {
    const event = new CustomEvent('navigate', { detail: 'fate-shop' })
    window.dispatchEvent(event)
  }

  function selectSpread(spreadId) {
    const spread = MULTI_SPREAD_CONFIG[spreadId]
    if (!isSpreadUnlocked(spread)) {
      goToShop()
      return
    }
    selectedSpread = spread
    step = 'confirm'
  }

  function backToSpreads() {
    selectedSpread = null
    question = ''
    step = 'select-spread'
  }

  async function startDivination() {
    if (isAnimating) return
    isAnimating = true

    await new Promise(resolve => setTimeout(resolve, 1000))

    const results = drawMultiSpread(selectedSpread.id)
    drawResults = results

    saveMultiSpreadResult(selectedSpread.id, results, question)
    refreshStats()

    setTimeout(() => {
      showResult = true
      isAnimating = false
    }, 500)
  }

  function handleCloseResult() {
    showResult = false
    drawResults = null
    backToSpreads()
  }

  function handleDrawAgain() {
    showResult = false
    drawResults = null
    question = ''
    step = 'confirm'
  }

  function goToHistory() {
    const event = new CustomEvent('navigate', { detail: { page: 'history', tab: 'spread' } })
    window.dispatchEvent(event)
  }

  onMount(() => {
    refreshStats()
    const unsubscribe = ownedShopItems.subscribe(items => {
      ownedItems = items
    })
    return () => unsubscribe && unsubscribe()
  })
</script>

<h1 class="page-title">◆ 牌 阵 玩 法 中 心 ◆</h1>

<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-value">{Storage.getMultiSpreadHistory().length}</div>
    <div class="stat-label">牌阵占卜次数</div>
  </div>
  <div class="stat-card">
    <div class="stat-value">{stats.totalDraws}</div>
    <div class="stat-label">总抽卡次数</div>
  </div>
  <div class="stat-card">
    <div class="stat-value">{stats.legendaryCount}</div>
    <div class="stat-label glow-yellow">传说</div>
  </div>
  <div class="stat-card">
    <div class="stat-value">{stats.epicCount}</div>
    <div class="stat-label glow-magenta">史诗</div>
  </div>
</div>

{#if step === 'select-spread'}
  <div class="section-title">经典牌阵</div>
  <div class="spread-grid">
    {#each spreads.filter(s => !s.special) as spread}
      <div
        class="spread-card"
        style="--theme-color: {spread.color}; --theme-glow: {spread.glowColor}"
        on:click={() => selectSpread(spread.id)}
      >
        <div class="spread-header">
          <div class="spread-icon">{spread.icon}</div>
          <div class="spread-main-info">
            <div class="spread-name">{spread.name}</div>
            <div class="spread-desc">{spread.description}</div>
          </div>
        </div>

        <div class="spread-layout layout-{spread.layout.type}">
          {#each spread.layout.positions as lp}
            <div
              class="layout-slot"
              style="grid-row: {lp.row + 1}; grid-column: {lp.col + 1};"
            >
              <div class="slot-label">{spread.positions.find(p => p.id === lp.key)?.name || lp.key}</div>
              <div class="slot-card">🎴</div>
            </div>
          {/each}
        </div>

        <div class="spread-footer">
          <span class="spread-count">{spread.cardCount} 张牌</span>
          <span class="spread-enter">开始占卜 →</span>
        </div>
      </div>
    {/each}
  </div>

  <div class="section-title" style="margin-top: 24px;">
    ✨ 特殊占卜
    <span class="section-subtitle">（命运商店解锁）</span>
  </div>
  <div class="spread-grid">
    {#each spreads.filter(s => s.special) as spread}
      {@const unlocked = isSpreadUnlocked(spread)}
      {@const shopItem = getShopItemForSpread(spread)}
      <div
        class="spread-card {unlocked ? '' : 'locked'} {spread.special ? 'special-spread' : ''}"
        style="--theme-color: {spread.color}; --theme-glow: {spread.glowColor}"
        on:click={() => selectSpread(spread.id)}
      >
        {#if !unlocked}
          <div class="lock-overlay">
            <div class="lock-icon">🔒</div>
            <div class="lock-text">
              {#if shopItem}
                <div class="lock-title">{shopItem.name}</div>
                <div class="lock-price">
                  <span class="price-icon">🏆</span>
                  {shopItem.price} 成就点数
                </div>
                <div class="lock-hint">点击前往命运商店解锁</div>
              {:else}
                <div class="lock-title">未解锁</div>
                <div class="lock-hint">前往命运商店解锁</div>
              {/if}
            </div>
          </div>
        {/if}

        <div class="spread-header">
          <div class="spread-icon">{spread.icon}</div>
          <div class="spread-main-info">
            <div class="spread-name">
              {spread.name}
              {#if spread.special}
                <span class="special-badge">特殊</span>
              {/if}
            </div>
            <div class="spread-desc">{spread.description}</div>
          </div>
        </div>

        <div class="spread-layout layout-{spread.layout.type}">
          {#each spread.layout.positions.slice(0, 6) as lp}
            <div
              class="layout-slot"
              style="grid-row: {lp.row + 1}; grid-column: {lp.col + 1};"
            >
              <div class="slot-label">{spread.positions.find(p => p.id === lp.key)?.name?.slice(0, 4) || lp.key}</div>
              <div class="slot-card">🎴</div>
            </div>
          {/each}
        </div>

        <div class="spread-footer">
          <span class="spread-count">{spread.cardCount} 张牌</span>
          <span class="spread-enter">
            {unlocked ? '开始占卜 →' : '前往解锁 →'}
          </span>
        </div>
      </div>
    {/each}
  </div>

  <div class="history-link" on:click={goToHistory}>
    📜 查看牌阵历史 →
  </div>
{:else if step === 'confirm'}
  <div class="nav-header">
    <button class="btn icon-btn" on:click={backToSpreads}>←</button>
    <div class="nav-title" style="color: {selectedSpread.color}">
      {selectedSpread.icon} {selectedSpread.name}
    </div>
  </div>

  <div class="confirm-card" style="--theme-color: {selectedSpread.color}; --theme-glow: {selectedSpread.glowColor}">
    <div class="confirm-header">
      <div class="confirm-icon">{selectedSpread.icon}</div>
      <div class="confirm-info">
        <div class="confirm-theme">{selectedSpread.name}占卜</div>
        <div class="confirm-spread">{selectedSpread.cardCount} 张牌 · {selectedSpread.description}</div>
      </div>
    </div>

    <div class="question-section">
      <label class="question-label" for="question-input">你想问的问题（可选）</label>
      <textarea
        id="question-input"
        class="question-input"
        bind:value={question}
        placeholder="例如：我应该如何选择接下来的方向？..."
        maxlength="100"
      />
      <div class="char-count">{question.length}/100</div>
    </div>

    <div class="spread-preview">
      <div class="preview-title">牌阵位置说明：</div>
      <div class="preview-positions">
        {#each selectedSpread.positions as pos, i}
          <div class="preview-position">
            <div class="preview-number">{i + 1}</div>
            <div class="preview-pos-info">
              <div class="preview-label">{pos.name}</div>
              <div class="preview-desc">{pos.desc}</div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <button
      class="btn btn-primary btn-block start-btn"
      style="--theme-color: {selectedSpread.color}"
      on:click={startDivination}
      disabled={isAnimating}
    >
      {#if isAnimating}
        <span class="loading">🔮 命运正在显现...</span>
      {:else}
        🔮 开始占卜
      {/if}
    </button>
  </div>
{/if}

{#if showResult && drawResults}
  <ResultModal
    results={drawResults}
    spreadType="multi-spread"
    spreadConfig={selectedSpread}
    customTitle={`◆ ${selectedSpread.icon} ${selectedSpread.name} ◆`}
    onClose={handleCloseResult}
    onDrawAgain={handleDrawAgain}
  />
{/if}

<style>
  .spread-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 20px;
  }

  .spread-card {
    background: var(--bg-card);
    border: 1px solid var(--theme-glow);
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .spread-card:hover {
    border-color: var(--theme-color);
    background: linear-gradient(135deg, var(--theme-glow), var(--bg-card));
    transform: translateY(-4px);
    box-shadow: 0 8px 30px var(--theme-glow);
  }

  .spread-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
  }

  .spread-icon {
    font-size: 42px;
    filter: drop-shadow(0 0 10px var(--theme-color));
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  .spread-main-info {
    flex: 1;
  }

  .spread-name {
    font-family: var(--font-mono);
    font-size: 20px;
    color: var(--theme-color);
    letter-spacing: 2px;
    text-shadow: 0 0 10px var(--theme-color);
    margin-bottom: 4px;
  }

  .spread-desc {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .spread-layout {
    display: grid;
    gap: 8px;
    justify-content: center;
    align-items: center;
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: 8px;
    margin-bottom: 14px;
  }

  .layout-cross {
    grid-template-columns: repeat(3, 60px);
    grid-template-rows: repeat(3, 80px);
  }

  .layout-relationship {
    grid-template-columns: repeat(2, 70px);
    grid-template-rows: repeat(2, 90px);
    gap: 12px;
  }

  .layout-decision {
    grid-template-columns: repeat(3, 60px);
    grid-template-rows: repeat(3, 80px);
  }

  .layout-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .slot-label {
    font-size: 10px;
    font-family: var(--font-mono);
    color: var(--text-dim);
    white-space: nowrap;
  }

  .slot-card {
    width: 44px;
    height: 62px;
    background: linear-gradient(135deg, var(--theme-glow), var(--bg-card));
    border: 1px solid var(--theme-color);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    opacity: 0.7;
  }

  .spread-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .spread-count {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-dim);
    padding: 3px 10px;
    background: var(--bg-secondary);
    border-radius: 20px;
  }

  .spread-enter {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--theme-color);
  }

  .nav-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  .nav-title {
    flex: 1;
    font-family: var(--font-mono);
    font-size: 16px;
    letter-spacing: 1px;
    text-shadow: 0 0 10px currentColor;
  }

  .confirm-card {
    background: var(--bg-card);
    border: 1px solid var(--theme-glow);
    border-radius: 12px;
    padding: 20px;
    animation: fade-in 0.4s ease;
  }

  .confirm-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--theme-glow);
  }

  .confirm-icon {
    font-size: 48px;
    filter: drop-shadow(0 0 10px var(--theme-color));
  }

  .confirm-theme {
    font-family: var(--font-mono);
    font-size: 18px;
    color: var(--theme-color);
    letter-spacing: 2px;
    text-shadow: 0 0 10px var(--theme-color);
    margin-bottom: 4px;
  }

  .confirm-spread {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .question-section {
    margin-bottom: 20px;
  }

  .question-label {
    display: block;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 8px;
    letter-spacing: 1px;
  }

  .question-input {
    width: 100%;
    min-height: 80px;
    padding: 12px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    color: var(--text-primary);
    font-family: var(--font-body);
    font-size: 14px;
    resize: vertical;
    transition: border-color 0.2s ease;
  }

  .question-input:focus {
    outline: none;
    border-color: var(--theme-color);
    box-shadow: 0 0 10px var(--theme-glow);
  }

  .char-count {
    text-align: right;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
    margin-top: 4px;
  }

  .spread-preview {
    margin-bottom: 20px;
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: 8px;
  }

  .preview-title {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 12px;
    letter-spacing: 1px;
  }

  .preview-positions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .preview-position {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: var(--theme-glow);
    border-radius: 8px;
  }

  .preview-number {
    width: 24px;
    height: 24px;
    background: var(--theme-color);
    color: var(--bg-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: bold;
    flex-shrink: 0;
  }

  .preview-pos-info {
    flex: 1;
    min-width: 0;
  }

  .preview-label {
    font-size: 13px;
    color: var(--theme-color);
    font-family: var(--font-mono);
    margin-bottom: 2px;
  }

  .preview-desc {
    font-size: 11px;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .start-btn {
    border-color: var(--theme-color) !important;
    color: var(--theme-color) !important;
  }

  .start-btn:hover {
    background: var(--theme-glow) !important;
    box-shadow: 0 0 20px var(--theme-glow) !important;
  }

  .start-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .loading {
    display: inline-block;
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .history-link {
    text-align: center;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--accent-cyan);
    cursor: pointer;
    padding: 12px;
    transition: all 0.2s ease;
  }

  .history-link:hover {
    text-shadow: 0 0 10px var(--accent-cyan);
  }

  .section-title {
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--accent-yellow);
    margin-bottom: 14px;
    letter-spacing: 1px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 20px;
  }

  .stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    padding: 12px 8px;
    text-align: center;
  }

  .stat-value {
    font-family: var(--font-mono);
    font-size: 20px;
    font-weight: bold;
    color: var(--text-primary);
    margin-bottom: 2px;
  }

  .stat-label {
    font-size: 10px;
    color: var(--text-dim);
    font-family: var(--font-mono);
  }

  .glow-yellow {
    color: var(--accent-yellow);
    text-shadow: 0 0 10px var(--accent-yellow);
  }

  .glow-magenta {
    color: var(--accent-magenta);
    text-shadow: 0 0 10px var(--accent-magenta);
  }

  .section-subtitle {
    font-size: 11px;
    color: var(--text-dim);
    margin-left: 8px;
    font-weight: normal;
  }

  .spread-card.locked {
    position: relative;
    overflow: hidden;
    opacity: 0.9;
  }

  .spread-card.locked:hover {
    transform: translateY(-2px);
  }

  .lock-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(2px);
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    border-radius: 12px;
  }

  .lock-icon {
    font-size: 36px;
    animation: lock-pulse 2s ease-in-out infinite;
  }

  @keyframes lock-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  .lock-text {
    text-align: center;
  }

  .lock-title {
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--accent-yellow);
    margin-bottom: 6px;
    letter-spacing: 1px;
  }

  .lock-price {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 13px;
    color: var(--text-primary);
    margin-bottom: 6px;
  }

  .price-icon {
    font-size: 14px;
  }

  .lock-hint {
    font-size: 11px;
    color: var(--text-dim);
  }

  .special-spread {
    border: 2px solid var(--theme-color);
    box-shadow: 0 0 20px var(--theme-glow);
  }

  .special-badge {
    display: inline-block;
    font-size: 9px;
    padding: 2px 8px;
    background: var(--theme-glow);
    color: var(--theme-color);
    border-radius: 10px;
    margin-left: 8px;
    vertical-align: middle;
  }

  .layout-celestial {
    grid-template-columns: repeat(3, 50px);
    grid-template-rows: repeat(3, 70px);
  }

  .layout-abyss {
    grid-template-columns: repeat(6, 30px);
    grid-template-rows: repeat(4, 50px);
    gap: 4px;
  }

  .layout-abyss .slot-card {
    width: 28px;
    height: 40px;
    font-size: 12px;
  }

  .layout-abyss .slot-label {
    font-size: 8px;
  }

  .layout-temporal {
    grid-template-columns: repeat(5, 40px);
    grid-template-rows: repeat(4, 55px);
    gap: 4px;
  }

  .layout-temporal .slot-card {
    width: 32px;
    height: 44px;
    font-size: 14px;
  }

  .layout-temporal .slot-label {
    font-size: 7px;
  }
</style>
