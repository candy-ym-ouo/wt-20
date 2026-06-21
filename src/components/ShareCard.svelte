<script>
  import { RARITY_CONFIG, CATEGORY_CONFIG, THEME_CONFIG } from '../data/constants.js'
  import { getShareCardColor, formatTimestamp } from '../utils/shareSystem.js'

  export let results
  export let theme = null
  export let spreadName = null
  export let question = null
  export let timestamp = Date.now()
  export let recordType = null
  export let consecutiveDays = null

  $: colors = getShareCardColor(results)
  $: themeConfig = theme ? THEME_CONFIG[theme] : null
  $: reversedCount = results.filter(r => r.isReversed).length
  $: uprightCount = results.length - reversedCount

  function getRarityConfig(rarity) {
    return RARITY_CONFIG[rarity] || RARITY_CONFIG.common
  }

  function getCategoryConfig(category) {
    return CATEGORY_CONFIG[category] || { label: '未知', color: '#8a8a9a', icon: '❓' }
  }
</script>

<div
  class="share-card"
  id="share-card-export"
  style="--primary: {colors.primary}; --secondary: {colors.secondary};"
>
  <div class="share-card-header">
    <div class="share-card-logo">
      <span class="logo-icon">🔮</span>
      <span class="logo-text">赛博占卜</span>
      <span class="logo-tag mono">CYBER DIVINATION</span>
    </div>
    <div class="share-card-timestamp mono">
      {formatTimestamp(timestamp)}
    </div>
  </div>

  {#if themeConfig || spreadName || question}
    <div class="share-card-meta">
      {#if themeConfig}
        <div class="meta-badge" style="--theme-color: {themeConfig.color}">
          <span class="meta-icon">{themeConfig.icon}</span>
          <span>{themeConfig.name}占卜</span>
        </div>
      {/if}
      {#if spreadName}
        <div class="meta-badge spread-badge">
          <span class="meta-icon">🎴</span>
          <span>{spreadName}</span>
        </div>
      {/if}
      {#if recordType === 'daily' && consecutiveDays}
        <div class="meta-badge streak-badge">
          <span class="meta-icon">🔥</span>
          <span>连续 {consecutiveDays} 天</span>
        </div>
      {/if}
      {#if question}
        <div class="meta-question">
          <span class="question-prefix">💭</span>
          <span class="question-text">{question}</span>
        </div>
      {/if}
    </div>
  {/if}

  <div class="share-card-cards">
    {#each results as result, index}
      {@const card = result.card}
      {@const rarity = getRarityConfig(card.rarity)}
      {@const category = getCategoryConfig(card.category)}
      <div
        class="share-card-item"
        style="--card-color: {rarity.color};"
      >
        {#if result.position}
          <div class="share-card-position mono" style="color: {rarity.color}">
            ▸ {result.position}
          </div>
        {/if}
        <div class="share-card-visual" class:reversed={result.isReversed} style="border-color: {rarity.borderColor}">
          <span class="card-number mono">{String(card.number).padStart(2, '0')}</span>
          <span class="card-cat-icon">{category.icon}</span>
          <span class="card-main-symbol" style="color: {rarity.color}">{card.symbol}</span>
          <span class="card-name-text" style="color: {rarity.color}">{card.name}</span>
          <span class="card-rarity-tag" style="background: {rarity.glow}40; color: {rarity.color}">
            {rarity.label}{result.isReversed ? ' · 逆位' : ' · 正位'}
          </span>
        </div>
        <div class="share-card-keywords">
          {#each card.keywords as kw}
            <span class="share-keyword">{kw}</span>
          {/each}
        </div>
        <div class="share-card-reading">
          <div class="share-reading-title" style="color: var(--secondary)">
            📝 {result.reading.title}
          </div>
          <div class="share-reading-fortune mono">
            {result.reading.fortune}
          </div>
        </div>
      </div>
    {/each}
  </div>

  {#if results.length > 1}
    <div class="share-card-stats">
      <div class="stat-item">
        <span class="stat-label">正位</span>
        <span class="stat-value" style="color: var(--primary)">{uprightCount}</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-label">逆位</span>
        <span class="stat-value" style="color: var(--accent-red)">{reversedCount}</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-label">总计</span>
        <span class="stat-value" style="color: var(--secondary)">{results.length}</span>
      </div>
    </div>
  {/if}

  <div class="share-card-footer">
    <div class="footer-tagline mono">
      ✨ 命运数据流 · 连接未来 ✨
    </div>
    <div class="footer-brand">
      <span>🔗 Cyber Divination System</span>
    </div>
  </div>
</div>

<style>
  .share-card {
    width: 100%;
    max-width: 420px;
    background: linear-gradient(160deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
    border: 1px solid var(--primary);
    border-radius: 16px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    box-shadow:
      0 0 30px color-mix(in srgb, var(--primary) 25%, transparent),
      inset 0 1px 0 color-mix(in srgb, var(--secondary) 15%, transparent);
  }

  .share-card::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background:
      radial-gradient(circle at 20% 30%, color-mix(in srgb, var(--primary) 8%, transparent) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, color-mix(in srgb, var(--secondary) 8%, transparent) 0%, transparent 50%);
    pointer-events: none;
  }

  .share-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 3px,
        color-mix(in srgb, var(--primary) 2%, transparent) 3px,
        color-mix(in srgb, var(--primary) 2%, transparent) 4px
      );
    pointer-events: none;
    opacity: 0.5;
  }

  .share-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    position: relative;
    z-index: 1;
  }

  .share-card-logo {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .logo-icon {
    font-size: 28px;
    filter: drop-shadow(0 0 10px var(--primary));
  }

  .logo-text {
    font-family: var(--font-mono);
    font-size: 18px;
    font-weight: bold;
    background: linear-gradient(90deg, var(--primary), var(--secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 2px;
  }

  .logo-tag {
    font-size: 9px;
    color: var(--text-dim);
    letter-spacing: 2px;
    opacity: 0.7;
  }

  .share-card-timestamp {
    font-size: 10px;
    color: var(--text-dim);
    text-align: right;
    line-height: 1.5;
  }

  .share-card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
    position: relative;
    z-index: 1;
  }

  .meta-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: color-mix(in srgb, var(--theme-color, var(--primary)) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--theme-color, var(--primary)) 40%, transparent);
    border-radius: 20px;
    font-size: 12px;
    color: var(--theme-color, var(--primary));
  }

  .spread-badge {
    --theme-color: var(--secondary);
  }

  .streak-badge {
    --theme-color: var(--accent-red);
  }

  .meta-icon {
    font-size: 14px;
  }

  .meta-question {
    width: 100%;
    display: flex;
    gap: 8px;
    padding: 10px 12px;
    background: rgba(0, 0, 0, 0.2);
    border-left: 3px solid var(--secondary);
    border-radius: 0 8px 8px 0;
    margin-top: 4px;
  }

  .question-prefix {
    flex-shrink: 0;
    font-size: 14px;
  }

  .question-text {
    font-size: 13px;
    color: var(--text-primary);
    line-height: 1.5;
  }

  .share-card-cards {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 16px;
    position: relative;
    z-index: 1;
  }

  .share-card-item {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid color-mix(in srgb, var(--card-color) 30%, transparent);
    border-radius: 12px;
    padding: 14px;
  }

  .share-card-position {
    font-size: 12px;
    margin-bottom: 10px;
    letter-spacing: 1px;
    text-shadow: 0 0 8px currentColor;
  }

  .share-card-visual {
    width: 100%;
    height: 120px;
    border-radius: 10px;
    background: linear-gradient(145deg, var(--bg-card), var(--bg-secondary));
    border: 2px solid;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    margin-bottom: 10px;
    transition: transform 0.3s ease;
  }

  .share-card-visual.reversed {
    transform: rotate(180deg);
  }

  .share-card-visual .card-number {
    position: absolute;
    top: 8px;
    left: 10px;
    font-size: 11px;
    color: var(--text-dim);
    opacity: 0.7;
  }

  .share-card-visual .card-cat-icon {
    position: absolute;
    top: 8px;
    right: 10px;
    font-size: 13px;
  }

  .share-card-visual .card-main-symbol {
    font-size: 42px;
    margin-bottom: 6px;
    filter: drop-shadow(0 0 10px currentColor);
  }

  .share-card-visual .card-name-text {
    font-family: var(--font-mono);
    font-size: 13px;
    text-align: center;
    padding: 0 8px;
    letter-spacing: 0.5px;
  }

  .share-card-visual .card-rarity-tag {
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--font-mono);
    font-size: 9px;
    padding: 2px 8px;
    border-radius: 4px;
    letter-spacing: 0.5px;
  }

  .share-card-keywords {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 10px;
    justify-content: center;
  }

  .share-keyword {
    padding: 3px 10px;
    background: color-mix(in srgb, var(--primary) 15%, transparent);
    color: var(--primary);
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.3px;
  }

  .share-card-reading {
    text-align: center;
  }

  .share-reading-title {
    font-family: var(--font-mono);
    font-size: 12px;
    margin-bottom: 6px;
    line-height: 1.4;
  }

  .share-reading-fortune {
    font-size: 11px;
    color: var(--accent-yellow);
  }

  .share-card-stats {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    margin-bottom: 12px;
    position: relative;
    z-index: 1;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .stat-label {
    font-size: 10px;
    color: var(--text-dim);
    font-family: var(--font-mono);
    letter-spacing: 0.5px;
  }

  .stat-value {
    font-family: var(--font-mono);
    font-size: 20px;
    font-weight: bold;
    text-shadow: 0 0 10px currentColor;
  }

  .stat-divider {
    width: 1px;
    height: 30px;
    background: var(--border-glow);
  }

  .share-card-footer {
    text-align: center;
    padding-top: 12px;
    border-top: 1px dashed var(--border-glow);
    position: relative;
    z-index: 1;
  }

  .footer-tagline {
    font-size: 11px;
    color: var(--secondary);
    margin-bottom: 6px;
    letter-spacing: 1px;
    text-shadow: 0 0 6px color-mix(in srgb, var(--secondary) 50%, transparent);
  }

  .footer-brand {
    font-size: 10px;
    color: var(--text-dim);
    opacity: 0.6;
  }
</style>
