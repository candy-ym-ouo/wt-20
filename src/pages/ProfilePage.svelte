<script>
  import { onMount } from 'svelte'
  import { getFullProfile, getLuckyCardOfDay } from '../utils/profileAnalysis.js'
  import { RARITY_CONFIG } from '../data/constants.js'
  import CardDetailModal from '../components/CardDetailModal.svelte'

  let profile = null
  let luckyCard = null
  let activeTab = 'overview'
  let selectedCard = null
  let isLoading = true

  const TABS = [
    { id: 'overview', label: '概览', icon: '📊' },
    { id: 'rarity', label: '稀有度', icon: '💎' },
    { id: 'reversal', label: '正逆位', icon: '🔄' },
    { id: 'preference', label: '偏好', icon: '🎯' },
    { id: 'report', label: '报告', icon: '📋' }
  ]

  function refresh() {
    isLoading = true
    profile = getFullProfile()
    luckyCard = getLuckyCardOfDay()
    setTimeout(() => {
      isLoading = false
    }, 300)
  }

  function formatDate(timestamp) {
    if (!timestamp) return '暂无数据'
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  function openCardDetail(cardData) {
    selectedCard = cardData
  }

  function closeCardDetail() {
    selectedCard = null
  }

  function goToCollection() {
    const event = new CustomEvent('navigate', { detail: 'collection' })
    window.dispatchEvent(event)
  }

  function goToDraw() {
    const event = new CustomEvent('navigate', { detail: 'draw' })
    window.dispatchEvent(event)
  }

  function goToHistory() {
    const event = new CustomEvent('navigate', { detail: 'history' })
    window.dispatchEvent(event)
  }

  onMount(() => {
    refresh()
  })
</script>

<h1 class="page-title">◆ 命 运 档 案 ◆</h1>

{#if isLoading || !profile}
  <div class="empty-state">
    <div class="empty-state-icon">📊</div>
    <div class="empty-state-text">正在加载命运档案...</div>
  </div>
{:else}
  <div class="profile-header">
    <div class="user-level-card">
      <div class="level-icon">{profile.overview.levelIcon}</div>
      <div class="level-info">
        <div class="level-title">{profile.overview.userLevel}</div>
        <div class="level-desc mono">Lv.{profile.overview.totalDraws} · 活跃 {profile.overview.daysActive} 天</div>
      </div>
    </div>
    {#if luckyCard && luckyCard.card}
      <div class="lucky-card-today card-{luckyCard.card.rarity}" on:click={() => openCardDetail(luckyCard.card)}>
        <div class="lucky-label">今日幸运卡</div>
        <div class="lucky-symbol">{luckyCard.card.symbol}</div>
        <div class="lucky-name">{luckyCard.card.name}</div>
        {#if luckyCard.isReversed}
          <span class="reversed-tag">逆位</span>
        {/if}
      </div>
    {/if}
  </div>

  <div class="tabs">
    {#each TABS as tab}
      <div
        class="tab {activeTab === tab.id ? 'active' : ''}"
        on:click={() => (activeTab = tab.id)}
      >
        <span class="tab-icon">{tab.icon}</span>
        <span class="tab-label">{tab.label}</span>
      </div>
    {/each}
  </div>

  {#if activeTab === 'overview'}
    <div class="section">
      <h2 class="section-title">📊 数据概览</h2>
      
      <div class="stats-grid">
        <div class="stat-card highlight-card">
          <div class="stat-value glow-cyan">{profile.overview.totalDraws}</div>
          <div class="stat-label">总抽卡次数</div>
          <div class="stat-trend mono">日均 {profile.overview.avgDrawsPerDay} 次</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-value glow-magenta">{profile.overview.collectedCount}/{profile.overview.totalCards}</div>
          <div class="stat-label">收集进度</div>
          <div class="progress-bar small">
            <div class="progress-fill" style="width: {profile.overview.collectionRate}%"></div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-value glow-yellow">{profile.overview.legendaryRate}%</div>
          <div class="stat-label">传说卡概率</div>
          <div class="stat-trend mono" style="color: {profile.rarityDistribution.luckColor}">
            {profile.rarityDistribution.luckLevel}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-value glow-green">{profile.overview.daysActive}</div>
          <div class="stat-label">活跃天数</div>
          <div class="stat-trend mono">首次 {formatDate(profile.overview.firstDraw)}</div>
        </div>
      </div>

      <div class="quick-actions">
        <button class="btn btn-primary" on:click={goToDraw}>
          🎴 继续抽卡
        </button>
        <button class="btn" on:click={goToCollection}>
          📚 查看收藏
        </button>
        <button class="btn btn-yellow" on:click={goToHistory}>
          📜 历史记录
        </button>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">🔥 最近 7 天趋势</h2>
      <div class="trend-chart">
        {#each profile.recentTrend.trend as day, index}
          <div class="trend-bar-container">
            <div class="trend-bar-wrapper">
              <div 
                class="trend-bar" 
                style="height: {day.count > 0 ? Math.max(10, (day.count / Math.max(1, profile.recentTrend.totalRecent / 7 * 3)) * 100) : 0}%"
              >
                <span class="trend-count">{day.count}</span>
              </div>
            </div>
            <div class="trend-label mono">
              {new Date(day.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        {/each}
      </div>
      <div class="trend-summary">
        <span class="mono">近 7 天共 {profile.recentTrend.totalRecent} 次 · 日均 {profile.recentTrend.avgPerDay} 次</span>
      </div>
    </div>

    {#if profile.topCards && profile.topCards.length > 0}
      <div class="section">
        <h2 class="section-title">⭐ 最常出现的卡牌</h2>
        <div class="top-cards-list">
          {#each profile.topCards as item, index}
            <div 
              class="top-card-item card-{item.card.rarity}"
              on:click={() => openCardDetail(item.card)}
            >
              <div class="top-card-rank">{index + 1}</div>
              <div class="top-card-symbol">{item.card.symbol}</div>
              <div class="top-card-info">
                <div class="top-card-name">{item.card.name}</div>
                <div class="top-card-meta">
                  <span class="badge badge-{item.card.rarity}">{RARITY_CONFIG[item.card.rarity].label}</span>
                  <span class="draw-count">× {item.drawCount}</span>
                </div>
                <div class="top-card-stats">
                  <span class="upright-rate">正位 {item.uprightRate}%</span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {:else if activeTab === 'rarity'}
    <div class="section">
      <h2 class="section-title">💎 稀有度分布</h2>
      
      <div class="luck-summary" style="border-color: {profile.rarityDistribution.luckColor}">
        <div class="luck-icon" style="color: {profile.rarityDistribution.luckColor}">🍀</div>
        <div class="luck-info">
          <div class="luck-level" style="color: {profile.rarityDistribution.luckColor}">
            {profile.rarityDistribution.luckLevel}
          </div>
          <div class="luck-desc">基于 {profile.rarityDistribution.total} 次抽卡分析</div>
        </div>
      </div>

      <div class="rarity-bars">
        {#each Object.values(profile.rarityDistribution.distribution) as rarity}
          <div class="rarity-bar-item">
            <div class="rarity-bar-header">
              <span class="rarity-name" style="color: {rarity.color}">{rarity.label}</span>
              <span class="rarity-count mono">{rarity.count} 张 · {rarity.percentage}%</span>
            </div>
            <div class="rarity-bar-wrapper">
              <div 
                class="rarity-bar-fill" 
                style="width: {rarity.percentage}%; background: linear-gradient(90deg, {rarity.glow}, {rarity.color}); box-shadow: 0 0 10px {rarity.glow};"
              ></div>
            </div>
          </div>
        {/each}
      </div>

      <div class="rarity-grid">
        {#each Object.values(profile.rarityDistribution.distribution) as rarity}
          <div class="rarity-stat-card" style="border-color: {rarity.borderColor}">
            <div class="rarity-stat-value" style="color: {rarity.color}">{rarity.count}</div>
            <div class="rarity-stat-label">{rarity.label}</div>
            <div class="rarity-stat-percent mono">{rarity.percentage}%</div>
          </div>
        {/each}
      </div>
    </div>
  {:else if activeTab === 'reversal'}
    <div class="section">
      <h2 class="section-title">🔄 正逆位倾向</h2>
      
      <div class="reversal-summary">
        <div class="reversal-icon">{profile.reversalTendency.tendencyIcon}</div>
        <div class="reversal-tendency">{profile.reversalTendency.tendency}</div>
        <div class="reversal-desc">{profile.reversalTendency.tendencyDesc}</div>
      </div>

      <div class="reversal-comparison">
        <div class="reversal-side upright">
          <div class="reversal-side-value glow-cyan">{profile.reversalTendency.uprightCount}</div>
          <div class="reversal-side-label">正位</div>
          <div class="reversal-side-percent mono">{profile.reversalTendency.uprightPercent}%</div>
        </div>
        
        <div class="reversal-divider">
          <div class="divider-line"></div>
          <div class="divider-icon">⚖️</div>
          <div class="divider-line"></div>
        </div>
        
        <div class="reversal-side reversed">
          <div class="reversal-side-value glow-red">{profile.reversalTendency.reversedCount}</div>
          <div class="reversal-side-label">逆位</div>
          <div class="reversal-side-percent mono">{profile.reversalTendency.reversedPercent}%</div>
        </div>
      </div>

      <div class="reversal-bar-container">
        <div class="reversal-bar">
          <div 
            class="reversal-bar-fill upright-fill" 
            style="width: {profile.reversalTendency.uprightPercent}%"
          ></div>
          <div 
            class="reversal-bar-fill reversed-fill" 
            style="width: {profile.reversalTendency.reversedPercent}%"
          ></div>
        </div>
        <div class="reversal-bar-labels">
          <span class="mono" style="color: var(--accent-cyan)">正位 {profile.reversalTendency.uprightPercent}%</span>
          <span class="mono" style="color: var(--accent-red)">逆位 {profile.reversalTendency.reversedPercent}%</span>
        </div>
      </div>
    </div>
  {:else if activeTab === 'preference'}
    <div class="section">
      <h2 class="section-title">🎯 分类偏好</h2>
      
      {#if profile.categoryPreference.dominantCategory}
        <div class="dominant-category" style="--cat-color: {profile.categoryPreference.dominantCategory.color}">
          <div class="dominant-icon">{profile.categoryPreference.dominantCategory.icon}</div>
          <div class="dominant-info">
            <div class="dominant-title">主导能量：{profile.categoryPreference.dominantCategory.label}</div>
            <div class="dominant-desc">{profile.categoryPreference.preferenceDesc}</div>
          </div>
        </div>
      {/if}

      <div class="category-list">
        {#each profile.categoryPreference.categories as cat}
          <div class="category-item" style="--cat-color: {cat.color}">
            <div class="category-icon">{cat.icon}</div>
            <div class="category-info">
              <div class="category-header">
                <span class="category-name">{cat.label}</span>
                <span class="category-count mono">{cat.count} 张 · {cat.percentage}%</span>
              </div>
              <div class="category-bar-wrapper">
                <div 
                  class="category-bar-fill" 
                  style="width: {cat.percentage}%; background: var(--cat-color);"
                ></div>
              </div>
              <div class="category-stats">
                <span class="mono" style="color: var(--accent-cyan)">正位率: {100 - cat.reversedRate}%</span>
                <span class="mono" style="color: var(--accent-red)">逆位率: {cat.reversedRate}%</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else if activeTab === 'report'}
    <div class="section">
      <h2 class="section-title">📋 阶段性命运报告</h2>
      
      <div class="report-verdict">
        <div class="verdict-emoji">{profile.periodReport.verdictEmoji}</div>
        <div class="verdict-text">{profile.periodReport.overallVerdict}</div>
      </div>

      <div class="report-stats">
        <div class="report-stat">
          <div class="report-stat-value glow-cyan">{profile.periodReport.uprightRate}%</div>
          <div class="report-stat-label">正位率</div>
        </div>
        <div class="report-stat">
          <div class="report-stat-value glow-red">{profile.periodReport.reversedRate}%</div>
          <div class="report-stat-label">逆位率</div>
        </div>
        <div class="report-stat">
          <div class="report-stat-value glow-magenta">{profile.periodReport.totalDraws}</div>
          <div class="report-stat-label">总抽卡</div>
        </div>
      </div>

      {#if profile.periodReport.topKeywords && profile.periodReport.topKeywords.length > 0}
        <div class="report-keywords">
          <h3 class="subsection-title">🔑 高频关键词</h3>
          <div class="keywords-cloud">
            {#each profile.periodReport.topKeywords as kw}
              <span class="keyword-large" style="--kw-size: {0.8 + (kw.count / profile.periodReport.totalDraws) * 2}">
                {kw.keyword}
                <span class="kw-count">{kw.count}</span>
              </span>
            {/each}
          </div>
        </div>
      {/if}

      <div class="report-suggestions">
        <h3 class="subsection-title">💡 命运指引</h3>
        <ul class="suggestion-list">
          {#each profile.periodReport.suggestions as suggestion, index}
            <li class="suggestion-item">
              <span class="suggestion-number">{index + 1}</span>
              <span class="suggestion-text">{suggestion}</span>
            </li>
          {/each}
        </ul>
      </div>

      <div class="report-footer">
        <div class="mono">报告生成时间：{new Date().toLocaleString('zh-CN')}</div>
        <div class="mono" style="color: var(--text-dim); margin-top: 4px;">
          * 本报告基于历史抽卡数据分析，仅供娱乐参考
        </div>
      </div>
    </div>
  {/if}
{/if}

{#if selectedCard}
  <CardDetailModal
    card={selectedCard}
    collectionData={profile?.collection?.[selectedCard.id] || null}
    onClose={closeCardDetail}
  />
{/if}

<style>
  .profile-header {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }

  .user-level-card {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    background: linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(224, 64, 251, 0.1));
    border: 1px solid var(--border-glow);
    border-radius: 10px;
    padding: 16px;
  }

  .level-icon {
    font-size: 40px;
    filter: drop-shadow(0 0 10px currentColor);
  }

  .level-info {
    flex: 1;
  }

  .level-title {
    font-family: var(--font-mono);
    font-size: 18px;
    color: var(--accent-cyan);
    text-shadow: 0 0 10px var(--accent-cyan);
    margin-bottom: 4px;
  }

  .level-desc {
    font-size: 11px;
    color: var(--text-secondary);
  }

  .lucky-card-today {
    width: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--bg-card);
    border: 2px solid;
    border-radius: 10px;
    padding: 10px;
    cursor: pointer;
    transition: all 0.25s ease;
    position: relative;
    overflow: hidden;
  }

  .lucky-card-today:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 20px rgba(0, 229, 255, 0.3);
  }

  .lucky-label {
    font-size: 10px;
    color: var(--text-dim);
    font-family: var(--font-mono);
    margin-bottom: 6px;
  }

  .lucky-symbol {
    font-size: 32px;
    margin-bottom: 4px;
    filter: drop-shadow(0 0 8px currentColor);
  }

  .lucky-name {
    font-size: 11px;
    color: var(--text-secondary);
    font-family: var(--font-mono);
    text-align: center;
  }

  .reversed-tag {
    position: absolute;
    top: 4px;
    right: 4px;
    font-size: 9px;
    padding: 1px 6px;
    background: rgba(255, 82, 82, 0.3);
    color: var(--accent-red);
    border-radius: 3px;
    font-family: var(--font-mono);
  }

  .tab-icon {
    font-size: 16px;
    margin-bottom: 2px;
  }

  .tab-label {
    font-size: 11px;
  }

  .tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .section {
    margin-bottom: 24px;
  }

  .highlight-card {
    grid-column: span 2;
    background: linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(224, 64, 251, 0.1));
    border-color: var(--accent-magenta);
  }

  .stat-trend {
    font-size: 10px;
    color: var(--text-dim);
    margin-top: 6px;
  }

  .quick-actions {
    display: flex;
    gap: 10px;
    margin-top: 16px;
    flex-wrap: wrap;
  }

  .quick-actions .btn {
    flex: 1;
    min-width: 100px;
    font-size: 12px;
    padding: 10px 16px;
  }

  .trend-chart {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    height: 160px;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    padding: 16px 12px 8px;
    margin-bottom: 10px;
  }

  .trend-bar-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex: 1;
  }

  .trend-bar-wrapper {
    height: 120px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .trend-bar {
    width: 28px;
    background: linear-gradient(to top, var(--accent-cyan), var(--accent-magenta));
    border-radius: 4px 4px 0 0;
    min-height: 4px;
    position: relative;
    transition: height 0.5s ease;
    box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
  }

  .trend-count {
    position: absolute;
    top: -18px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 10px;
    color: var(--text-primary);
    font-family: var(--font-mono);
    white-space: nowrap;
  }

  .trend-label {
    font-size: 10px;
    color: var(--text-dim);
  }

  .trend-summary {
    text-align: center;
    color: var(--text-dim);
    font-size: 12px;
  }

  .top-cards-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .top-card-item {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .top-card-item:hover {
    transform: translateX(4px);
    border-color: var(--accent-cyan);
    box-shadow: 0 0 15px rgba(0, 229, 255, 0.2);
  }

  .top-card-rank {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--accent-cyan), var(--accent-magenta));
    color: white;
    border-radius: 50%;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: bold;
  }

  .top-card-symbol {
    font-size: 36px;
    filter: drop-shadow(0 0 8px currentColor);
  }

  .top-card-info {
    flex: 1;
  }

  .top-card-name {
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .top-card-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .draw-count {
    font-size: 11px;
    color: var(--text-secondary);
    font-family: var(--font-mono);
  }

  .top-card-stats {
    font-size: 10px;
    color: var(--text-dim);
    font-family: var(--font-mono);
  }

  .upright-rate {
    color: var(--accent-cyan);
  }

  .luck-summary {
    display: flex;
    align-items: center;
    gap: 14px;
    background: var(--bg-card);
    border: 2px solid;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 20px;
  }

  .luck-icon {
    font-size: 40px;
    filter: drop-shadow(0 0 10px currentColor);
  }

  .luck-level {
    font-family: var(--font-mono);
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .luck-desc {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .rarity-bars {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 20px;
  }

  .rarity-bar-item {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    padding: 12px;
  }

  .rarity-bar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .rarity-name {
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: bold;
  }

  .rarity-count {
    font-size: 11px;
    color: var(--text-dim);
  }

  .rarity-bar-wrapper {
    height: 10px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    overflow: hidden;
  }

  .rarity-bar-fill {
    height: 100%;
    border-radius: 5px;
    transition: width 0.5s ease;
  }

  .rarity-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .rarity-stat-card {
    background: var(--bg-card);
    border: 1px solid;
    border-radius: 8px;
    padding: 10px 8px;
    text-align: center;
  }

  .rarity-stat-value {
    font-family: var(--font-mono);
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 2px;
  }

  .rarity-stat-label {
    font-size: 10px;
    color: var(--text-secondary);
    margin-bottom: 2px;
  }

  .rarity-stat-percent {
    font-size: 9px;
    color: var(--text-dim);
  }

  .reversal-summary {
    text-align: center;
    background: linear-gradient(135deg, rgba(0, 229, 255, 0.08), rgba(255, 82, 82, 0.08));
    border: 1px solid var(--border-glow);
    border-radius: 10px;
    padding: 24px 16px;
    margin-bottom: 20px;
  }

  .reversal-icon {
    font-size: 48px;
    margin-bottom: 10px;
    filter: drop-shadow(0 0 15px currentColor);
  }

  .reversal-tendency {
    font-family: var(--font-mono);
    font-size: 22px;
    color: var(--accent-magenta);
    text-shadow: 0 0 15px var(--accent-magenta);
    margin-bottom: 8px;
  }

  .reversal-desc {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.7;
  }

  .reversal-comparison {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-bottom: 20px;
  }

  .reversal-side {
    text-align: center;
    flex: 1;
    padding: 16px;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 10px;
  }

  .reversal-side.upright {
    border-color: rgba(0, 229, 255, 0.3);
  }

  .reversal-side.reversed {
    border-color: rgba(255, 82, 82, 0.3);
  }

  .reversal-side-value {
    font-family: var(--font-mono);
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .reversal-side-label {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }

  .reversal-side-percent {
    font-size: 11px;
    color: var(--text-dim);
  }

  .reversal-divider {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .divider-line {
    width: 1px;
    height: 30px;
    background: var(--border-glow);
  }

  .divider-icon {
    font-size: 20px;
  }

  .reversal-bar-container {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    padding: 16px;
  }

  .reversal-bar {
    display: flex;
    height: 24px;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 10px;
  }

  .reversal-bar-fill {
    height: 100%;
    transition: width 0.5s ease;
  }

  .upright-fill {
    background: linear-gradient(90deg, var(--accent-cyan), #4fc3f7);
  }

  .reversed-fill {
    background: linear-gradient(90deg, #ff8a80, var(--accent-red));
  }

  .reversal-bar-labels {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
  }

  .dominant-category {
    display: flex;
    align-items: center;
    gap: 14px;
    background: linear-gradient(135deg, var(--cat-color), transparent);
    border: 1px solid var(--cat-color);
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 20px;
  }

  .dominant-icon {
    font-size: 40px;
    filter: drop-shadow(0 0 10px var(--cat-color));
  }

  .dominant-title {
    font-family: var(--font-mono);
    font-size: 16px;
    color: var(--cat-color);
    margin-bottom: 6px;
  }

  .dominant-desc {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  .category-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .category-item {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    padding: 14px;
  }

  .category-icon {
    font-size: 32px;
    filter: drop-shadow(0 0 8px var(--cat-color));
  }

  .category-info {
    flex: 1;
  }

  .category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .category-name {
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--cat-color);
  }

  .category-count {
    font-size: 11px;
    color: var(--text-dim);
  }

  .category-bar-wrapper {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 6px;
  }

  .category-bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.5s ease;
    box-shadow: 0 0 8px var(--cat-color);
  }

  .category-stats {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
  }

  .report-verdict {
    background: linear-gradient(135deg, rgba(224, 64, 251, 0.1), rgba(0, 229, 255, 0.1));
    border: 1px solid var(--accent-magenta);
    border-radius: 10px;
    padding: 20px;
    text-align: center;
    margin-bottom: 20px;
  }

  .verdict-emoji {
    font-size: 48px;
    margin-bottom: 12px;
    filter: drop-shadow(0 0 15px currentColor);
  }

  .verdict-text {
    font-size: 14px;
    color: var(--text-primary);
    line-height: 1.8;
  }

  .report-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }

  .report-stat {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    padding: 12px;
    text-align: center;
  }

  .report-stat-value {
    font-family: var(--font-mono);
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .report-stat-label {
    font-size: 11px;
    color: var(--text-dim);
  }

  .subsection-title {
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--accent-cyan);
    margin-bottom: 12px;
    padding-left: 8px;
    border-left: 2px solid var(--accent-cyan);
  }

  .report-keywords {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
  }

  .keywords-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }

  .keyword-large {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    background: linear-gradient(135deg, rgba(224, 64, 251, 0.2), rgba(0, 229, 255, 0.2));
    color: var(--text-primary);
    border-radius: 20px;
    font-size: calc(12px * var(--kw-size));
    font-family: var(--font-mono);
    transition: transform 0.2s ease;
  }

  .keyword-large:hover {
    transform: scale(1.05);
  }

  .kw-count {
    font-size: 10px;
    color: var(--text-dim);
    background: rgba(0, 0, 0, 0.3);
    padding: 1px 6px;
    border-radius: 10px;
  }

  .report-suggestions {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
  }

  .suggestion-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .suggestion-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .suggestion-number {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--accent-cyan), var(--accent-magenta));
    color: white;
    border-radius: 50%;
    font-family: var(--font-mono);
    font-size: 12px;
    flex-shrink: 0;
  }

  .suggestion-text {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.7;
    flex: 1;
  }

  .report-footer {
    text-align: center;
    padding-top: 12px;
    border-top: 1px dashed var(--border-glow);
    font-size: 10px;
    color: var(--text-dim);
  }
</style>
