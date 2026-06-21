<script>
  import { onMount } from 'svelte'
  import { drawThemeCards, saveThemeDivinationResult, getAllThemes } from '../utils/cardSystem.js'
  import { Storage } from '../utils/storage.js'
  import { THEME_CONFIG } from '../data/constants.js'
  import CardDisplay from '../components/CardDisplay.svelte'
  import ResultModal from '../components/ResultModal.svelte'

  let step = 'select-theme'
  let selectedTheme = null
  let selectedSpread = null
  let question = ''
  let isAnimating = false
  let drawResults = null
  let showResult = false
  let stats = Storage.getStats()
  let themes = getAllThemes()

  function refreshStats() {
    stats = Storage.getStats()
  }

  function selectTheme(themeId) {
    selectedTheme = THEME_CONFIG[themeId]
    step = 'select-spread'
  }

  function backToThemes() {
    selectedTheme = null
    selectedSpread = null
    question = ''
    step = 'select-theme'
  }

  function selectSpread(spread) {
    selectedSpread = spread
    step = 'confirm'
  }

  function backToSpreads() {
    selectedSpread = null
    step = 'select-spread'
  }

  async function startDivination() {
    if (isAnimating) return
    isAnimating = true

    await new Promise(resolve => setTimeout(resolve, 800))

    const results = drawThemeCards(selectedTheme.id, selectedSpread.id)
    drawResults = results

    saveThemeDivinationResult(selectedTheme.id, selectedSpread.id, results, question)
    refreshStats()

    setTimeout(() => {
      showResult = true
      isAnimating = false
    }, 500)
  }

  function handleCloseResult() {
    showResult = false
    drawResults = null
    backToThemes()
  }

  function handleDrawAgain() {
    showResult = false
    drawResults = null
    question = ''
    step = 'confirm'
  }

  function goToHistory() {
    const event = new CustomEvent('navigate', { detail: { page: 'history', tab: 'theme' } })
    window.dispatchEvent(event)
  }

  onMount(() => {
    refreshStats()
  })
</script>

<h1 class="page-title">◆ 主 题 占 卜 ◆</h1>

<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-value">{Storage.getThemeDivinationHistory().length}</div>
    <div class="stat-label">主题占卜次数</div>
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

{#if step === 'select-theme'}
  <div class="section-title">选择占卜主题</div>
  <div class="theme-grid">
    {#each themes as theme}
      <div
        class="theme-card"
        style="--theme-color: {theme.color}; --theme-glow: {theme.glowColor}"
        on:click={() => selectTheme(theme.id)}
      >
        <div class="theme-icon">{theme.icon}</div>
        <div class="theme-name">{theme.name}</div>
        <div class="theme-desc">{theme.description}</div>
        <div class="theme-spreads">
          {theme.spreadTypes.length} 种牌阵
        </div>
      </div>
    {/each}
  </div>

  <div class="history-link" on:click={goToHistory}>
    📜 查看历史记录 →
  </div>
{:else if step === 'select-spread'}
  <div class="nav-header">
    <button class="btn icon-btn" on:click={backToThemes}>←</button>
    <div class="nav-title" style="color: {selectedTheme.color}">
      {selectedTheme.icon} {selectedTheme.name}占卜
    </div>
  </div>

  <div class="section-title">选择牌阵类型</div>
  <div class="spread-grid">
    {#each selectedTheme.spreadTypes as spread}
      <div
        class="spread-card"
        style="--theme-color: {selectedTheme.color}; --theme-glow: {selectedTheme.glowColor}"
        on:click={() => selectSpread(spread)}
      >
        <div class="spread-cards">
          {#each Array(spread.cardCount) as _, i}
            <div class="mini-card" style="animation-delay: {i * 0.1}s">🎴</div>
          {/each}
        </div>
        <div class="spread-name">{spread.name}</div>
        <div class="spread-positions">
          {#each spread.positions as pos, i}
            <span class="position-tag">{pos}</span>
            {#if i < spread.positions.length - 1}
              <span class="position-arrow">→</span>
            {/if}
          {/each}
        </div>
        <div class="spread-count">{spread.cardCount} 张牌</div>
      </div>
    {/each}
  </div>
{:else if step === 'confirm'}
  <div class="nav-header">
    <button class="btn icon-btn" on:click={backToSpreads}>←</button>
    <div class="nav-title" style="color: {selectedTheme.color}">
      {selectedTheme.icon} {selectedSpread.name}
    </div>
  </div>

  <div class="confirm-card" style="--theme-color: {selectedTheme.color}; --theme-glow: {selectedTheme.glowColor}">
    <div class="confirm-header">
      <div class="confirm-icon">{selectedTheme.icon}</div>
      <div class="confirm-info">
        <div class="confirm-theme">{selectedTheme.name}占卜</div>
        <div class="confirm-spread">{selectedSpread.name}</div>
      </div>
    </div>

    <div class="question-section">
      <label class="question-label" for="question-input">你想问的问题（可选）</label>
      <textarea
        id="question-input"
        class="question-input"
        bind:value={question}
        placeholder="例如：我和TA的关系会如何发展？..."
        maxlength="100"
      />
      <div class="char-count">{question.length}/100</div>
    </div>

    <div class="spread-preview">
      <div class="preview-title">牌阵位置：</div>
      <div class="preview-positions">
        {#each selectedSpread.positions as pos, i}
          <div class="preview-position">
            <div class="preview-number">{i + 1}</div>
            <div class="preview-label">{pos}</div>
          </div>
        {/each}
      </div>
    </div>

    <button
      class="btn btn-primary btn-block start-btn"
      style="--theme-color: {selectedTheme.color}"
      on:click={startDivination}
      disabled={isAnimating}
    >
      {#if isAnimating}
        <span class="loading">🔮 连接命运数据流...</span>
      {:else}
        🔮 开始占卜
      {/if}
    </button>
  </div>
{/if}

{#if showResult && drawResults}
  <ResultModal
    results={drawResults}
    spreadType={drawResults.length === 1 ? 'single' : 'three'}
    onClose={handleCloseResult}
    onDrawAgain={handleDrawAgain}
  />
{/if}

<style>
  .theme-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
  }

  .theme-card {
    background: var(--bg-card);
    border: 1px solid var(--theme-glow);
    border-radius: 12px;
    padding: 20px 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .theme-card::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, var(--theme-glow) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .theme-card:hover::before {
    opacity: 1;
  }

  .theme-card:hover {
    transform: translateY(-4px);
    border-color: var(--theme-color);
    box-shadow: 0 8px 30px var(--theme-glow);
  }

  .theme-icon {
    font-size: 48px;
    margin-bottom: 12px;
    filter: drop-shadow(0 0 10px var(--theme-color));
    animation: float 3s ease-in-out infinite;
  }

  .theme-name {
    font-family: var(--font-mono);
    font-size: 18px;
    color: var(--theme-color);
    margin-bottom: 8px;
    letter-spacing: 2px;
    text-shadow: 0 0 10px var(--theme-color);
  }

  .theme-desc {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: 12px;
  }

  .theme-spreads {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-dim);
    padding: 4px 12px;
    background: var(--theme-glow);
    border-radius: 20px;
    display: inline-block;
  }

  .spread-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }

  .spread-card {
    background: var(--bg-card);
    border: 1px solid var(--theme-glow);
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .spread-card:hover {
    border-color: var(--theme-color);
    background: var(--theme-glow);
    transform: translateX(4px);
  }

  .spread-cards {
    display: flex;
    gap: -10px;
  }

  .mini-card {
    width: 36px;
    height: 52px;
    background: linear-gradient(135deg, var(--theme-glow), var(--bg-card));
    border: 1px solid var(--theme-color);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    margin-left: -8px;
    animation: fade-in 0.5s ease backwards;
  }

  .mini-card:first-child {
    margin-left: 0;
  }

  .spread-name {
    flex: 1;
    font-family: var(--font-mono);
    font-size: 15px;
    color: var(--theme-color);
    letter-spacing: 1px;
  }

  .spread-positions {
    display: none;
  }

  @media (min-width: 480px) {
    .spread-positions {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: var(--text-secondary);
      font-family: var(--font-mono);
    }
  }

  .position-tag {
    padding: 2px 6px;
    background: var(--theme-glow);
    border-radius: 4px;
    color: var(--theme-color);
  }

  .position-arrow {
    color: var(--text-dim);
  }

  .spread-count {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-dim);
    padding: 2px 8px;
    background: var(--bg-secondary);
    border-radius: 4px;
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
    gap: 8px;
    flex-wrap: wrap;
  }

  .preview-position {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: var(--theme-glow);
    border-radius: 20px;
  }

  .preview-number {
    width: 20px;
    height: 20px;
    background: var(--theme-color);
    color: var(--bg-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: bold;
  }

  .preview-label {
    font-size: 12px;
    color: var(--theme-color);
    font-family: var(--font-mono);
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
</style>
