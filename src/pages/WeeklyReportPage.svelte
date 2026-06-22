<script>
  import { onMount } from 'svelte'
  import { Storage } from '../utils/storage.js'
  import {
    getCurrentWeekReport,
    generateWeeklyReport,
    getAllWeekKeys,
    getWeekLabel,
    formatWeekDate
  } from '../utils/weeklyReportSystem.js'
  import {
    THEME_CONFIG,
    CATEGORY_CONFIG,
    RARITY_CONFIG,
    MULTI_SPREAD_CONFIG
  } from '../data/constants.js'
  import ShareModal from '../components/ShareModal.svelte'

  let currentWeekKey = ''
  let allWeekKeys = []
  let report = null
  let loading = true
  let activeSection = 'overview'
  let showShareModal = false

  const SECTIONS = [
    { id: 'overview', icon: '📊', label: '总览' },
    { id: 'themes', icon: '🎴', label: '抽卡主题' },
    { id: 'collection', icon: '📚', label: '收藏增长' },
    { id: 'hidden', icon: '✨', label: '隐藏事件' },
    { id: 'fortune', icon: '🔮', label: '运势趋势' }
  ]

  const INSIGHT_TYPE_STYLES = {
    empty: { color: '#8a8a9a', bg: 'rgba(138, 138, 154, 0.1)', border: '#5a5a7a' },
    positive: { color: '#69f0ae', bg: 'rgba(105, 240, 174, 0.1)', border: '#00c853' },
    neutral: { color: '#ffab40', bg: 'rgba(255, 171, 64, 0.1)', border: '#ff9100' },
    highlight: { color: '#e040fb', bg: 'rgba(224, 64, 251, 0.1)', border: '#d500f9' },
    theme: { color: '#00e5ff', bg: 'rgba(0, 229, 255, 0.1)', border: '#00b8d4' },
    milestone: { color: '#ffd54f', bg: 'rgba(255, 213, 79, 0.1)', border: '#ffc107' },
    mystery: { color: '#b388ff', bg: 'rgba(179, 136, 255, 0.1)', border: '#7c4dff' },
    fortune: { color: '#4fc3f7', bg: 'rgba(79, 195, 247, 0.1)', border: '#0288d1' },
    warning: { color: '#ff5252', bg: 'rgba(255, 82, 82, 0.1)', border: '#ff1744' },
    lucky: { color: '#ffd54f', bg: 'rgba(255, 213, 79, 0.15)', border: '#ffab00' }
  }

  onMount(() => {
    refresh()
  })

  function refresh() {
    loading = true
    allWeekKeys = getAllWeekKeys()
    if (allWeekKeys.length > 0) {
      currentWeekKey = allWeekKeys[0]
      loadWeekReport(currentWeekKey)
    } else {
      loading = false
    }
  }

  function loadWeekReport(weekKey) {
    loading = true
    currentWeekKey = weekKey
    setTimeout(() => {
      report = generateWeeklyReport(weekKey)
      Storage.saveWeeklyReport(report)
      loading = false
    }, 100)
  }

  function getTrendIcon(trend) {
    return { rising: '📈', falling: '📉', stable: '➡️' }[trend] || '➡️'
  }

  function getTrendColor(trend) {
    return { rising: '#69f0ae', falling: '#ff5252', stable: '#4fc3f7' }[trend] || '#4fc3f7'
  }

  function getFortuneBarHeight(score) {
    return `${Math.max(8, score)}%`
  }

  function getStars(count) {
    return '★'.repeat(count) + '☆'.repeat(5 - count)
  }

  function formatTime(timestamp) {
    if (!timestamp) return ''
    const d = new Date(timestamp)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  function getRarityStyle(rarity) {
    const cfg = RARITY_CONFIG[rarity]
    return cfg ? { color: cfg.color, borderColor: cfg.borderColor } : {}
  }

  function shareReport() {
    if (!report) return
    showShareModal = true
  }

  function closeShare() {
    showShareModal = false
  }
</script>

<div class="weekly-report-page">
  <div class="page-header">
    <h1 class="page-title">◆ 占 卜 周 报 ◆</h1>
    <div class="header-actions">
      {#if report}
        <button class="btn btn-share" on:click={shareReport}>
          📤 分享周报
        </button>
      {/if}
    </div>
  </div>

  <div class="week-selector">
    <div class="selector-label">选择周期</div>
    <div class="week-tabs">
      {#each allWeekKeys as wk, idx}
        <div
          class="week-tab {currentWeekKey === wk ? 'active' : ''}"
          class:current={idx === 0}
          on:click={() => loadWeekReport(wk)}
        >
          {#if idx === 0}
            <span class="current-tag">本周</span>
          {/if}
          <span class="week-date">{getWeekLabel(wk)}</span>
        </div>
      {/each}
    </div>
  </div>

  {#if loading}
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <div class="loading-text">正在解析命运数据流...</div>
    </div>
  {:else if report}
    <div class="section-nav">
      {#each SECTIONS as sec}
        <div
          class="section-tab {activeSection === sec.id ? 'active' : ''}"
          on:click={() => (activeSection = sec.id)}
        >
          <span class="tab-icon">{sec.icon}</span>
          <span class="tab-label">{sec.label}</span>
        </div>
      {/each}
    </div>

    {#if activeSection === 'overview'}
      <div class="overview-section">
        <div class="summary-cards">
          <div class="summary-card primary">
            <div class="sc-icon glow-cyan">🎴</div>
            <div class="sc-content">
              <div class="sc-value">{report.summary.totalDraws}</div>
              <div class="sc-label">总抽卡数</div>
            </div>
          </div>
          <div class="summary-card">
            <div class="sc-icon glow-magenta">📅</div>
            <div class="sc-content">
              <div class="sc-value">{report.summary.drawDays}<span class="sc-unit">/7</span></div>
              <div class="sc-label">活跃天数</div>
            </div>
          </div>
          <div class="summary-card">
            <div class="sc-icon glow-yellow">📚</div>
            <div class="sc-content">
              <div class="sc-value">+{report.collection.growth}</div>
              <div class="sc-label">收藏增长</div>
            </div>
          </div>
          <div class="summary-card">
            <div class="sc-icon glow-purple">✨</div>
            <div class="sc-content">
              <div class="sc-value">{report.hiddenEvents.count}</div>
              <div class="sc-label">隐藏事件</div>
            </div>
          </div>
        </div>

        <div class="record-types-grid">
          <div class="type-item">
            <div class="ti-icon" style="color: var(--accent-cyan)">🎐</div>
            <div class="ti-count" style="color: var(--accent-cyan)">{report.summary.dailyCount}</div>
            <div class="ti-label">每日签</div>
          </div>
          <div class="type-item">
            <div class="ti-icon" style="color: var(--accent-magenta)">🔮</div>
            <div class="ti-count" style="color: var(--accent-magenta)">{report.summary.themeCount}</div>
            <div class="ti-label">主题占卜</div>
          </div>
          <div class="type-item">
            <div class="ti-icon" style="color: var(--accent-yellow)">🎴</div>
            <div class="ti-count" style="color: var(--accent-yellow)">{report.summary.divinationCount}</div>
            <div class="ti-label">普通占卜</div>
          </div>
          <div class="type-item">
            <div class="ti-icon" style="color: var(--accent-purple, #ba68c8)">✚</div>
            <div class="ti-count" style="color: var(--accent-purple, #ba68c8)">{report.summary.spreadCount}</div>
            <div class="ti-label">牌阵占卜</div>
          </div>
        </div>

        <div class="reversal-stat">
          <div class="rs-label">
            <span>正/逆位比例</span>
            <span class="rs-rate">逆位率 {report.summary.reversedRate}%</span>
          </div>
          <div class="rs-bar">
            <div
              class="rs-fill upright"
              style="width: {report.summary.totalDraws > 0 ? (report.summary.uprightCount / report.summary.totalDraws * 100) : 50}%"
            ></div>
            <div
              class="rs-fill reversed"
              style="width: {report.summary.totalDraws > 0 ? (report.summary.reversedCount / report.summary.totalDraws * 100) : 50}%"
            ></div>
          </div>
          <div class="rs-legend">
            <span><i class="dot upright"></i>正位 {report.summary.uprightCount}</span>
            <span><i class="dot reversed"></i>逆位 {report.summary.reversedCount}</span>
          </div>
        </div>

        {#if report.insights.length > 0}
          <div class="section-title">💡 周度洞察</div>
          <div class="insights-grid">
            {#each report.insights as insight, idx}
              {@const style = INSIGHT_TYPE_STYLES[insight.type] || INSIGHT_TYPE_STYLES.neutral}
              <div
                class="insight-card"
                style="--ic-color: {style.color}; --ic-bg: {style.bg}; --ic-border: {style.border}; animation-delay: {idx * 0.05}s"
              >
                <div class="ic-icon">{insight.icon}</div>
                <div class="ic-content">
                  <div class="ic-title">{insight.title}</div>
                  <div class="ic-desc">{insight.description}</div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    {#if activeSection === 'themes'}
      <div class="themes-section">
        {#if Object.keys(report.themes.breakdown).length > 0}
          <div class="section-title">🔮 主题占卜分布</div>
          <div class="theme-breakdown-list">
            {#each Object.entries(report.themes.breakdown) as [themeId, data]}
              {@const tc = THEME_CONFIG[themeId]}
              <div class="theme-item" style="--theme-color: {tc?.color || '#e040fb'}">
                <div class="ti-header">
                  <div class="ti-icon-lg">{tc?.icon || '🔮'}</div>
                  <div class="ti-info">
                    <div class="ti-name" style="color: var(--theme-color)">{tc?.name || themeId}</div>
                    <div class="ti-cards">{data.cards.length} 张卡牌</div>
                  </div>
                  <div class="ti-count-badge" style="color: var(--theme-color)">× {data.count}</div>
                </div>
                <div class="ti-progress">
                  <div
                    class="ti-progress-fill"
                    style="width: {report.summary.themeCount > 0 ? (data.count / report.summary.themeCount * 100) : 0}%; background: var(--theme-color)"
                  ></div>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        {#if Object.keys(report.themes.spreadBreakdown).length > 0}
          <div class="section-title">✚ 牌阵使用分布</div>
          <div class="spread-breakdown-list">
            {#each Object.entries(report.themes.spreadBreakdown) as [spreadId, data]}
              {@const sc = MULTI_SPREAD_CONFIG[spreadId]}
              <div class="spread-item" style="--spread-color: {sc?.color || '#ba68c8'}">
                <div class="si-icon">{sc?.icon || '✚'}</div>
                <div class="si-info">
                  <div class="si-name" style="color: var(--spread-color)">{sc?.name || spreadId}</div>
                  <div class="si-desc">{sc?.description || ''}</div>
                </div>
                <div class="si-count">× {data.count}</div>
              </div>
            {/each}
          </div>
        {/if}

        {#if report.themes.topCards.length > 0}
          <div class="section-title">⭐ 本周高频卡牌 Top {report.themes.topCards.length}</div>
          <div class="top-cards-grid">
            {#each report.themes.topCards as item}
              {@const rs = getRarityStyle(item.card.rarity)}
              <div class="top-card-box" style="border-color: {rs.borderColor}">
                <div class="tcb-rarity" style="background: {rs.color}"></div>
                <div class="tcb-symbol">{item.card.symbol}</div>
                <div class="tcb-name">{item.card.name}</div>
                <div class="tcb-count" style="color: {rs.color}">× {item.count}</div>
                <div class="tcb-orientation">
                  <span class="or-upright">正 {item.uprightCount}</span>
                  <span class="or-divider">|</span>
                  <span class="or-reversed">逆 {item.reversedCount}</span>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        <div class="section-title">📊 属性分布</div>
        <div class="category-grid">
          {#each Object.values(report.themes.categoryStats) as cat}
            {@const total = Object.values(report.themes.categoryStats).reduce((s, c) => s + c.count, 0)}
            <div class="category-box" style="--cat-color: {cat.color}">
              <div class="cat-icon">{cat.icon}</div>
              <div class="cat-name" style="color: var(--cat-color)">{cat.label}</div>
              <div class="cat-count">{cat.count}</div>
              <div class="cat-bar">
                <div
                  class="cat-bar-fill"
                  style="width: {total > 0 ? (cat.count / total * 100) : 0}%; background: var(--cat-color)"
                ></div>
              </div>
            </div>
          {/each}
        </div>

        <div class="section-title">💎 稀有度分布</div>
        <div class="rarity-grid">
          {#each Object.values(report.themes.rarityStats) as rarity}
            {@const total = Object.values(report.themes.rarityStats).reduce((s, r) => s + r.count, 0)}
            <div class="rarity-box" style="--rarity-color: {rarity.color}">
              <div class="rb-count" style="color: var(--rarity-color)">{rarity.count}</div>
              <div class="rb-label">{rarity.label}</div>
              <div class="rb-bar">
                <div
                  class="rb-bar-fill"
                  style="width: {total > 0 ? (rarity.count / total * 100) : 0}%; background: var(--rarity-color)"
                ></div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if activeSection === 'collection'}
      <div class="collection-section">
        <div class="collection-overview">
          <div class="co-growth">
            <div class="co-value" style="color: #ffd54f">+{report.collection.growth}</div>
            <div class="co-label">本周新增</div>
          </div>
          <div class="co-progress-ring">
            <svg viewBox="0 0 120 120" class="ring-svg">
              <circle class="ring-bg" cx="60" cy="60" r="50"></circle>
              <circle
                class="ring-fill"
                cx="60" cy="60" r="50"
                style="stroke-dashoffset: {314 * (1 - report.collection.progress / 100)}"
              ></circle>
            </svg>
            <div class="ring-center">
              <div class="ring-value">{report.collection.progress}%</div>
              <div class="ring-label">图鉴完成度</div>
            </div>
          </div>
          <div class="co-total">
            <div class="co-value" style="color: #00e5ff">{report.collection.totalCollected}<span class="co-unit">/{report.collection.totalCards}</span></div>
            <div class="co-label">已收集卡牌</div>
          </div>
        </div>

        {#if report.collection.newCards.length > 0}
          <div class="section-title">🎉 本周新收集卡牌 ({report.collection.newCards.length})</div>
          <div class="new-cards-grid">
            {#each report.collection.newCards as item}
              {@const rs = getRarityStyle(item.rarity)}
              <div class="new-card" style="border-color: {rs.borderColor}">
                <div class="nc-rarity-tag" style="background: {rs.color}">{RARITY_CONFIG[item.rarity]?.label}</div>
                <div class="nc-symbol">{item.card.symbol}</div>
                <div class="nc-name">{item.card.name}</div>
                <div class="nc-keywords">{item.card.keywords.slice(0, 2).join(' · ')}</div>
                <div class="nc-time">{formatTime(item.firstDraw)} 首次获得</div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="empty-collection">
            <div class="empty-icon">📚</div>
            <div class="empty-text">本周暂无新收藏卡牌<br/>继续探索命运，解锁更多卡牌吧！</div>
          </div>
        {/if}
      </div>
    {/if}

    {#if activeSection === 'hidden'}
      <div class="hidden-section">
        <div class="hidden-overview">
          <div class="ho-count">
            <div class="ho-icon glow-magenta">✨</div>
            <div class="ho-info">
              <div class="ho-value">{report.hiddenEvents.count}</div>
              <div class="ho-label">本周触发隐藏事件</div>
            </div>
          </div>
        </div>

        {#if report.hiddenEvents.events.length > 0}
          <div class="hidden-events-list">
            {#each report.hiddenEvents.events as event}
              <div class="hidden-event-card">
                <div class="hec-left">
                  <div class="hec-icon">{event.achievementIcon}</div>
                </div>
                <div class="hec-content">
                  <div class="hec-title">{event.achievementName}</div>
                  <div class="hec-desc">{event.achievementDescription}</div>
                  {#if event.cardName}
                    <div class="hec-card-ref">
                      关联卡牌：<span style="color: #e040fb">{event.cardName}</span>
                    </div>
                  {/if}
                  <div class="hec-time">🕐 {formatTime(event.unlockedAt)}</div>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="empty-hidden">
            <div class="empty-icon">🌌</div>
            <div class="empty-title">命运的暗流尚未涌动</div>
            <div class="empty-text">
              隐藏事件需要特定条件触发<br/>
              多探索不同的卡牌组合，或许会有惊喜...
            </div>
            <div class="hidden-tips">
              <div class="tip-item">💡 首次抽到特定卡牌</div>
              <div class="tip-item">💎 抽到传说级卡牌</div>
              <div class="tip-item">🎯 连续达成特定条件</div>
            </div>
          </div>
        {/if}
      </div>
    {/if}

    {#if activeSection === 'fortune'}
      <div class="fortune-section">
        <div class="fortune-overview">
          <div class="fo-score-box">
            <div class="fo-trend-icon" style="color: {getTrendColor(report.fortune.trend)}">
              {getTrendIcon(report.fortune.trend)}
            </div>
            <div class="fo-score">
              <span class="score-num">{report.fortune.averageScore}</span>
              <span class="score-unit">分</span>
            </div>
            <div class="fo-label">平均运势指数 · 趋势{report.fortune.trendLabel}</div>
          </div>
        </div>

        <div class="section-title">📈 每日运势走势</div>
        <div class="fortune-chart">
          <div class="chart-container">
            <div class="chart-y-axis">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>
            <div class="chart-area">
              <div class="chart-grid">
                <div class="grid-line"></div>
                <div class="grid-line"></div>
                <div class="grid-line"></div>
                <div class="grid-line"></div>
                <div class="grid-line"></div>
              </div>
              <div class="chart-bars">
                {#each report.fortune.daily as day}
                  <div class="bar-col">
                    <div class="bar-wrapper">
                      {#if day.fortune}
                        <div
                          class="bar-fill"
                          style="height: {getFortuneBarHeight(day.fortune.score)}; background: linear-gradient(to top, {getTrendColor(report.fortune.trend)}, color-mix(in srgb, {getTrendColor(report.fortune.trend)} 50%, #fff))"
                        >
                          <div class="bar-score">{day.fortune.score}</div>
                        </div>
                      {:else}
                        <div class="bar-empty">—</div>
                      {/if}
                    </div>
                    <div class="bar-label">
                      <div class="label-weekday">周{day.dayOfWeek}</div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>

        <div class="section-title">🎴 每日签详情</div>
        <div class="daily-fortune-list">
          {#each report.fortune.daily as day}
            <div class="daily-item {day.fortune ? 'has-data' : 'no-data'}">
              <div class="di-day">
                <div class="di-weekday">周{day.dayOfWeek}</div>
                <div class="di-date">{day.dateLabel.split(' ')[0]}</div>
              </div>
              {#if day.fortune}
                <div class="di-card">
                  <div class="di-symbol {day.fortune.isReversed ? 'reversed' : ''}">{day.fortune.cardSymbol}</div>
                </div>
                <div class="di-info">
                  <div class="di-card-name">
                    {day.fortune.cardName}
                    <span class="di-orientation {day.fortune.isReversed ? 'reversed' : ''}">
                      {day.fortune.isReversed ? '逆位' : '正位'}
                    </span>
                  </div>
                  <div class="di-score-row">
                    {#each ['事业', '感情', '财运'] as cat}
                      <div class="di-cat-score" title="{cat}">
                        <span class="cat-name">{cat[0]}</span>
                        <span class="cat-stars">{getStars(day.fortune.categories[cat] || 0)}</span>
                      </div>
                    {/each}
                  </div>
                  <div class="di-title">{day.fortune.title}</div>
                </div>
                <div class="di-total-score" style="color: {day.fortune.score >= 70 ? '#69f0ae' : day.fortune.score >= 50 ? '#ffab40' : '#ff5252'}">
                  {day.fortune.score}
                </div>
              {:else}
                <div class="di-empty">
                  <div class="empty-mini-icon">🌙</div>
                  <div class="empty-mini-text">未抽每日签</div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {:else}
    <div class="empty-state">
      <div class="empty-state-icon">📊</div>
      <div class="empty-state-title">暂无周报数据</div>
      <div class="empty-state-text">
        开始占卜后，系统将自动生成你的专属周报<br/>
        记录命运的轨迹，洞察运势的变化
      </div>
    </div>
  {/if}
</div>

{#if showShareModal && report}
  <ShareModal
    results={[]}
    theme={null}
    spreadName={`占卜周报 · ${report.weekLabel}`}
    question={`本周抽卡${report.summary.totalDraws}次 · 收藏+${report.collection.growth} · 运势趋势${report.fortune.trendLabel}`}
    timestamp={report.generatedAt}
    recordType="weekly"
    onClose={closeShare}
  />
{/if}

<style>
  .weekly-report-page {
    padding: 0 0 100px;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .page-title {
    font-size: 22px;
    font-family: var(--font-mono);
    color: var(--accent-magenta);
    text-shadow: 0 0 20px rgba(224, 64, 251, 0.5);
    letter-spacing: 4px;
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }

  .btn-share {
    padding: 6px 14px;
    font-size: 12px;
    font-family: var(--font-mono);
    background: rgba(224, 64, 251, 0.15);
    color: var(--accent-magenta);
    border: 1px solid var(--accent-magenta);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-share:hover {
    background: rgba(224, 64, 251, 0.3);
    box-shadow: 0 0 15px rgba(224, 64, 251, 0.4);
  }

  .week-selector {
    margin-bottom: 16px;
  }

  .selector-label {
    font-size: 11px;
    color: var(--text-dim);
    font-family: var(--font-mono);
    margin-bottom: 8px;
    letter-spacing: 1px;
  }

  .week-tabs {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .week-tab {
    flex-shrink: 0;
    padding: 8px 14px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .week-tab:hover {
    border-color: var(--accent-cyan);
    background: rgba(0, 229, 255, 0.05);
  }

  .week-tab.active {
    background: rgba(0, 229, 255, 0.1);
    border-color: var(--accent-cyan);
    box-shadow: inset 0 -2px 0 var(--accent-cyan);
  }

  .current-tag {
    font-size: 10px;
    padding: 1px 6px;
    background: var(--accent-cyan);
    color: #000;
    border-radius: 10px;
    font-family: var(--font-mono);
  }

  .week-date {
    font-size: 12px;
    font-family: var(--font-mono);
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .loading-state {
    text-align: center;
    padding: 60px 20px;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-glow);
    border-top-color: var(--accent-cyan);
    border-radius: 50%;
    margin: 0 auto 16px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading-text {
    font-size: 13px;
    color: var(--text-dim);
    font-family: var(--font-mono);
  }

  .section-nav {
    display: flex;
    gap: 4px;
    background: var(--bg-secondary);
    border-radius: 10px;
    padding: 4px;
    margin-bottom: 16px;
    overflow-x: auto;
  }

  .section-tab {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 4px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .section-tab:hover {
    background: rgba(0, 0, 0, 0.2);
  }

  .section-tab.active {
    background: rgba(224, 64, 251, 0.15);
    box-shadow: 0 0 10px rgba(224, 64, 251, 0.2);
  }

  .tab-icon {
    font-size: 18px;
  }

  .tab-label {
    font-size: 11px;
    color: var(--text-secondary);
    font-family: var(--font-mono);
  }

  .section-tab.active .tab-label {
    color: var(--accent-magenta);
  }

  .section-title {
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--accent-cyan);
    margin: 20px 0 12px;
    padding-left: 10px;
    border-left: 3px solid var(--accent-cyan);
    letter-spacing: 1px;
  }

  .summary-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }

  .summary-card {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .summary-card.primary {
    grid-column: span 2;
    background: linear-gradient(135deg, rgba(0, 229, 255, 0.08), rgba(224, 64, 251, 0.08));
    border-color: color-mix(in srgb, var(--accent-cyan) 30%, var(--border-glow));
  }

  .sc-icon {
    font-size: 32px;
    flex-shrink: 0;
  }

  .glow-cyan { filter: drop-shadow(0 0 8px rgba(0, 229, 255, 0.5)); }
  .glow-magenta { filter: drop-shadow(0 0 8px rgba(224, 64, 251, 0.5)); }
  .glow-yellow { filter: drop-shadow(0 0 8px rgba(255, 213, 79, 0.5)); }
  .glow-purple { filter: drop-shadow(0 0 8px rgba(186, 104, 200, 0.5)); }

  .sc-content {
    min-width: 0;
  }

  .sc-value {
    font-family: var(--font-mono);
    font-size: 26px;
    font-weight: bold;
    color: var(--text-primary);
    line-height: 1;
  }

  .summary-card.primary .sc-value {
    color: var(--accent-cyan);
    text-shadow: 0 0 12px rgba(0, 229, 255, 0.5);
    font-size: 32px;
  }

  .sc-unit {
    font-size: 14px;
    color: var(--text-dim);
    margin-left: 2px;
    font-weight: normal;
  }

  .sc-label {
    font-size: 11px;
    color: var(--text-dim);
    margin-top: 4px;
  }

  .record-types-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 14px;
    margin-bottom: 16px;
  }

  .type-item {
    text-align: center;
  }

  .ti-icon {
    font-size: 20px;
    margin-bottom: 4px;
  }

  .ti-count {
    font-family: var(--font-mono);
    font-size: 18px;
    font-weight: bold;
  }

  .ti-label {
    font-size: 10px;
    color: var(--text-dim);
    margin-top: 2px;
  }

  .reversal-stat {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 14px;
  }

  .rs-label {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    margin-bottom: 10px;
    color: var(--text-secondary);
    font-family: var(--font-mono);
  }

  .rs-rate {
    color: var(--accent-yellow);
  }

  .rs-bar {
    height: 10px;
    background: var(--bg-secondary);
    border-radius: 5px;
    overflow: hidden;
    display: flex;
    margin-bottom: 8px;
  }

  .rs-fill.upright {
    background: linear-gradient(90deg, var(--accent-cyan), #00b8d4);
    transition: width 0.5s ease;
  }

  .rs-fill.reversed {
    background: linear-gradient(90deg, var(--accent-magenta), #d500f9);
    transition: width 0.5s ease;
  }

  .rs-legend {
    display: flex;
    justify-content: space-around;
    font-size: 11px;
    color: var(--text-dim);
  }

  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 4px;
    vertical-align: middle;
  }

  .dot.upright { background: var(--accent-cyan); }
  .dot.reversed { background: var(--accent-magenta); }

  .insights-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .insight-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px;
    background: var(--ic-bg);
    border: 1px solid var(--ic-border);
    border-radius: 12px;
    animation: fadeInUp 0.3s ease backwards;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .ic-icon {
    font-size: 28px;
    flex-shrink: 0;
    filter: drop-shadow(0 0 6px var(--ic-color));
  }

  .ic-content {
    flex: 1;
    min-width: 0;
  }

  .ic-title {
    font-size: 14px;
    font-weight: bold;
    color: var(--ic-color);
    margin-bottom: 4px;
  }

  .ic-desc {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .theme-breakdown-list,
  .spread-breakdown-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .theme-item,
  .spread-item {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 14px;
  }

  .ti-header,
  .spread-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .ti-icon-lg {
    font-size: 32px;
    flex-shrink: 0;
  }

  .ti-info {
    flex: 1;
    min-width: 0;
  }

  .ti-name,
  .si-name {
    font-size: 14px;
    font-family: var(--font-mono);
    font-weight: bold;
    margin-bottom: 2px;
  }

  .ti-cards {
    font-size: 11px;
    color: var(--text-dim);
  }

  .ti-count-badge {
    font-family: var(--font-mono);
    font-size: 16px;
    font-weight: bold;
    flex-shrink: 0;
  }

  .ti-progress {
    margin-top: 12px;
    height: 6px;
    background: var(--bg-secondary);
    border-radius: 3px;
    overflow: hidden;
  }

  .ti-progress-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s ease;
    box-shadow: 0 0 8px currentColor;
  }

  .spread-item {
    gap: 12px;
  }

  .si-icon {
    font-size: 28px;
    flex-shrink: 0;
  }

  .si-info {
    flex: 1;
    min-width: 0;
  }

  .si-desc {
    font-size: 11px;
    color: var(--text-dim);
  }

  .si-count {
    font-family: var(--font-mono);
    font-size: 15px;
    font-weight: bold;
    color: var(--text-primary);
    flex-shrink: 0;
  }

  .top-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 10px;
  }

  .top-card-box {
    background: var(--bg-card);
    border: 2px solid var(--border-glow);
    border-radius: 12px;
    padding: 14px 10px;
    text-align: center;
    position: relative;
    transition: all 0.2s;
    overflow: hidden;
  }

  .top-card-box:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  }

  .tcb-rarity {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
  }

  .tcb-symbol {
    font-size: 30px;
    margin: 6px 0 8px;
  }

  .tcb-name {
    font-size: 11px;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 6px;
  }

  .tcb-count {
    font-family: var(--font-mono);
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 6px;
  }

  .tcb-orientation {
    font-size: 10px;
    color: var(--text-dim);
    display: flex;
    justify-content: center;
    gap: 4px;
  }

  .or-upright { color: var(--accent-cyan); }
  .or-divider { opacity: 0.5; }
  .or-reversed { color: var(--accent-magenta); }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
  }

  .category-box {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 10px;
    padding: 12px 6px;
    text-align: center;
  }

  .cat-icon {
    font-size: 22px;
    margin-bottom: 4px;
  }

  .cat-name {
    font-size: 11px;
    font-family: var(--font-mono);
    margin-bottom: 6px;
  }

  .cat-count {
    font-family: var(--font-mono);
    font-size: 16px;
    font-weight: bold;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .cat-bar {
    height: 4px;
    background: var(--bg-secondary);
    border-radius: 2px;
    overflow: hidden;
  }

  .cat-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.5s ease;
  }

  .rarity-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .rarity-box {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 10px;
    padding: 12px;
    text-align: center;
  }

  .rb-count {
    font-family: var(--font-mono);
    font-size: 22px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .rb-label {
    font-size: 11px;
    color: var(--text-dim);
    margin-bottom: 8px;
  }

  .rb-bar {
    height: 4px;
    background: var(--bg-secondary);
    border-radius: 2px;
    overflow: hidden;
  }

  .rb-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.5s ease;
  }

  .collection-overview {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 16px;
    align-items: center;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 20px;
  }

  .co-growth,
  .co-total {
    text-align: center;
  }

  .co-value {
    font-family: var(--font-mono);
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .co-unit {
    font-size: 14px;
    color: var(--text-dim);
    font-weight: normal;
    margin-left: 2px;
  }

  .co-label {
    font-size: 11px;
    color: var(--text-dim);
  }

  .co-progress-ring {
    position: relative;
    width: 120px;
    height: 120px;
  }

  .ring-svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .ring-bg {
    fill: none;
    stroke: var(--bg-secondary);
    stroke-width: 10;
  }

  .ring-fill {
    fill: none;
    stroke: url(#ringGradient);
    stroke: var(--accent-yellow);
    stroke-width: 10;
    stroke-linecap: round;
    stroke-dasharray: 314;
    transition: stroke-dashoffset 0.8s ease;
    filter: drop-shadow(0 0 6px rgba(255, 213, 79, 0.5));
  }

  .ring-center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .ring-value {
    font-family: var(--font-mono);
    font-size: 24px;
    font-weight: bold;
    color: var(--accent-yellow);
    text-shadow: 0 0 10px rgba(255, 213, 79, 0.5);
  }

  .ring-label {
    font-size: 10px;
    color: var(--text-dim);
  }

  .new-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 10px;
  }

  .new-card {
    background: var(--bg-card);
    border: 2px solid var(--border-glow);
    border-radius: 12px;
    padding: 16px 12px;
    text-align: center;
    position: relative;
    animation: cardAppear 0.4s ease backwards;
  }

  @keyframes cardAppear {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .nc-rarity-tag {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 9px;
    padding: 2px 6px;
    border-radius: 8px;
    color: #000;
    font-family: var(--font-mono);
  }

  .nc-symbol {
    font-size: 36px;
    margin: 8px 0 10px;
  }

  .nc-name {
    font-size: 13px;
    font-weight: bold;
    color: var(--text-primary);
    margin-bottom: 6px;
  }

  .nc-keywords {
    font-size: 10px;
    color: var(--text-dim);
    margin-bottom: 8px;
  }

  .nc-time {
    font-size: 10px;
    color: var(--accent-cyan);
    font-family: var(--font-mono);
    padding-top: 8px;
    border-top: 1px dashed var(--border-glow);
  }

  .empty-collection,
  .empty-hidden,
  .empty-state {
    text-align: center;
    padding: 40px 20px;
    background: var(--bg-card);
    border: 1px dashed var(--border-glow);
    border-radius: 12px;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.6;
  }

  .empty-title {
    font-size: 16px;
    font-family: var(--font-mono);
    color: var(--text-secondary);
    margin-bottom: 8px;
  }

  .empty-text {
    font-size: 12px;
    color: var(--text-dim);
    line-height: 1.6;
  }

  .empty-state {
    margin-top: 40px;
  }

  .empty-state-icon {
    font-size: 56px;
    margin-bottom: 20px;
  }

  .empty-state-title {
    font-size: 18px;
    font-family: var(--font-mono);
    color: var(--accent-magenta);
    margin-bottom: 12px;
  }

  .hidden-tips {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }

  .tip-item {
    font-size: 12px;
    color: var(--text-dim);
    padding: 6px 14px;
    background: var(--bg-secondary);
    border-radius: 16px;
  }

  .hidden-section .ho-count {
    background: linear-gradient(135deg, rgba(224, 64, 251, 0.08), rgba(186, 104, 200, 0.08));
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .ho-icon {
    font-size: 36px;
  }

  .ho-value {
    font-family: var(--font-mono);
    font-size: 32px;
    font-weight: bold;
    color: var(--accent-magenta);
    text-shadow: 0 0 15px rgba(224, 64, 251, 0.5);
    line-height: 1;
  }

  .ho-label {
    font-size: 12px;
    color: var(--text-dim);
    margin-top: 6px;
  }

  .hidden-events-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .hidden-event-card {
    display: flex;
    gap: 14px;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-left: 3px solid var(--accent-magenta);
    border-radius: 12px;
    padding: 16px;
    animation: slideIn 0.3s ease backwards;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .hec-left {
    flex-shrink: 0;
  }

  .hec-icon {
    font-size: 32px;
    filter: drop-shadow(0 0 8px rgba(224, 64, 251, 0.4));
  }

  .hec-content {
    flex: 1;
    min-width: 0;
  }

  .hec-title {
    font-size: 15px;
    font-weight: bold;
    color: var(--accent-magenta);
    margin-bottom: 6px;
  }

  .hec-desc {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: 8px;
  }

  .hec-card-ref {
    font-size: 11px;
    color: var(--text-dim);
    margin-bottom: 6px;
  }

  .hec-time {
    font-size: 10px;
    color: var(--text-dim);
    font-family: var(--font-mono);
  }

  .fortune-section {
  }

  .fo-score-box {
    background: linear-gradient(135deg, rgba(79, 195, 247, 0.08), rgba(0, 229, 255, 0.08));
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .fo-trend-icon {
    font-size: 36px;
  }

  .fo-score {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .score-num {
    font-family: var(--font-mono);
    font-size: 42px;
    font-weight: bold;
    color: var(--text-primary);
    line-height: 1;
  }

  .score-unit {
    font-size: 16px;
    color: var(--text-dim);
  }

  .fo-label {
    font-size: 12px;
    color: var(--text-dim);
    margin-top: 4px;
  }

  .fortune-chart {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 16px;
  }

  .chart-container {
    display: flex;
    gap: 10px;
    height: 200px;
  }

  .chart-y-axis {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 10px 0 20px;
    font-size: 10px;
    color: var(--text-dim);
    font-family: var(--font-mono);
    width: 30px;
    text-align: right;
  }

  .chart-area {
    flex: 1;
    position: relative;
  }

  .chart-grid {
    position: absolute;
    inset: 0 0 30px 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .grid-line {
    height: 1px;
    background: var(--border-glow);
    opacity: 0.5;
  }

  .chart-bars {
    position: absolute;
    inset: 0 0 0 0;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
  }

  .bar-col {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .bar-wrapper {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 6px;
  }

  .bar-fill {
    width: 70%;
    max-width: 28px;
    border-radius: 6px 6px 2px 2px;
    position: relative;
    min-height: 12px;
    transition: height 0.6s ease;
    box-shadow: 0 -2px 10px color-mix(in srgb, currentColor 30%, transparent);
  }

  .bar-score {
    position: absolute;
    top: -18px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 10px;
    font-family: var(--font-mono);
    color: var(--text-primary);
    white-space: nowrap;
  }

  .bar-empty {
    font-size: 18px;
    color: var(--text-dim);
    opacity: 0.4;
  }

  .bar-label {
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .label-weekday {
    font-size: 11px;
    color: var(--text-dim);
    font-family: var(--font-mono);
  }

  .daily-fortune-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .daily-item {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 12px 14px;
  }

  .daily-item.no-data {
    opacity: 0.6;
    background: var(--bg-secondary);
  }

  .di-day {
    width: 44px;
    flex-shrink: 0;
    text-align: center;
  }

  .di-weekday {
    font-size: 11px;
    color: var(--accent-cyan);
    font-family: var(--font-mono);
    margin-bottom: 2px;
  }

  .di-date {
    font-size: 10px;
    color: var(--text-dim);
  }

  .di-card {
    width: 40px;
    height: 52px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-glow);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .di-symbol {
    font-size: 22px;
  }

  .di-symbol.reversed {
    transform: rotate(180deg);
  }

  .di-info {
    flex: 1;
    min-width: 0;
  }

  .di-card-name {
    font-size: 12px;
    font-weight: bold;
    color: var(--text-primary);
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .di-orientation {
    font-size: 9px;
    padding: 1px 5px;
    border-radius: 8px;
    font-family: var(--font-mono);
  }

  .di-orientation:not(.reversed) {
    background: rgba(0, 229, 255, 0.15);
    color: var(--accent-cyan);
  }

  .di-orientation.reversed {
    background: rgba(224, 64, 251, 0.15);
    color: var(--accent-magenta);
  }

  .di-score-row {
    display: flex;
    gap: 10px;
    margin-bottom: 4px;
  }

  .di-cat-score {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 10px;
  }

  .cat-name {
    color: var(--text-dim);
  }

  .cat-stars {
    color: var(--accent-yellow);
    font-size: 9px;
  }

  .di-title {
    font-size: 10px;
    color: var(--text-dim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .di-total-score {
    font-family: var(--font-mono);
    font-size: 22px;
    font-weight: bold;
    flex-shrink: 0;
    width: 44px;
    text-align: right;
  }

  .di-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 0;
  }

  .empty-mini-icon {
    font-size: 20px;
    opacity: 0.4;
  }

  .empty-mini-text {
    font-size: 11px;
    color: var(--text-dim);
  }
</style>
