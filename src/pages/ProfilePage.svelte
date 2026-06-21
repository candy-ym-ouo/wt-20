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
    {:else if !profile.hasAnyDraw}
      <div class="lucky-card-today placeholder-card">
        <div class="lucky-label">今日幸运卡</div>
        <div class="lucky-symbol placeholder-symbol">❓</div>
        <div class="lucky-name placeholder-text">待抽取</div>
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
          <div class="stat-trend mono">
            {#if profile.hasAnyDraw}
              日均 {profile.overview.avgDrawsPerDay} 次
            {:else}
              尚未开始抽卡
            {/if}
          </div>
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
          <div class="stat-trend mono">
            {#if profile.overview.firstDraw}
              首次 {formatDate(profile.overview.firstDraw)}
            {:else}
              首次活动待开始
            {/if}
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <button class="btn btn-primary" on:click={goToDraw}>
          🎴 {profile.hasAnyDraw ? '继续抽卡' : '开始抽卡'}
        </button>
        <button class="btn" on:click={goToCollection}>
          📚 查看收藏
        </button>
        <button class="btn btn-yellow" on:click={goToHistory}>
          📜 历史记录
        </button>
      </div>
    </div>

    {#if profile.hasAnyDraw}
      <div class="section">
        <h2 class="section-title">🔥 最近 7 天趋势</h2>
        {#if profile.recentTrend.hasData}
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
        {:else}
          <div class="section-empty">
            <div class="section-empty-icon">📈</div>
            <div class="section-empty-title">暂无趋势数据</div>
            <div class="section-empty-desc">最近 7 天内没有抽卡记录</div>
          </div>
        {/if}
      </div>
    {/if}

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
    {:else if profile.hasAnyDraw}
      <div class="section">
        <h2 class="section-title">⭐ 最常出现的卡牌</h2>
        <div class="section-empty">
          <div class="section-empty-icon">🃏</div>
          <div class="section-empty-title">数据积累中</div>
          <div class="section-empty-desc">更多抽卡数据将用于统计你的命运偏好</div>
        </div>
      </div>
    {/if}

    {#if !profile.hasAnyDraw}
      <div class="section">
        <div class="welcome-card">
          <div class="welcome-icon">✨</div>
          <div class="welcome-title">欢迎来到命运档案</div>
          <div class="welcome-desc">
            这是你的专属命运数据中心。抽取第一张卡牌后，系统将开始记录并分析你的：
          </div>
          <ul class="welcome-features">
            <li>🎴 抽卡偏好与分类倾向</li>
            <li>💎 稀有度分布与运气评级</li>
            <li>🔄 正逆位比例与运势方向</li>
            <li>📋 阶段性命运报告</li>
          </ul>
          <button class="btn btn-primary" on:click={goToDraw}>
            🚀 开启命运探索
          </button>
        </div>
      </div>
    {/if}

  {:else if activeTab === 'rarity'}
    <div class="section">
      <h2 class="section-title">💎 稀有度分布</h2>
      
      {#if profile.rarityDistribution.hasData}
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
      {:else}
        <div class="data-notice">
          <div class="notice-icon">📊</div>
          <div class="notice-title">稀有度数据待积累</div>
          <div class="notice-desc">抽取至少 1 张卡牌后，即可查看稀有度分布与运气评级</div>
          <button class="btn btn-primary btn-small" on:click={goToDraw}>去抽卡</button>
        </div>

        <div class="preview-card">
          <div class="preview-title">数据预览（示例）</div>
          <div class="rarity-bars preview">
            {#each Object.values(profile.rarityDistribution.distribution) as rarity}
              <div class="rarity-bar-item">
                <div class="rarity-bar-header">
                  <span class="rarity-name" style="color: {rarity.color}">{rarity.label}</span>
                  <span class="rarity-count mono dim">-- 张 · --%</span>
                </div>
                <div class="rarity-bar-wrapper">
                  <div 
                    class="rarity-bar-fill placeholder" 
                    style="background: {rarity.color}22;"
                  ></div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

  {:else if activeTab === 'reversal'}
    <div class="section">
      <h2 class="section-title">🔄 正逆位倾向</h2>
      
      {#if profile.reversalTendency.hasData}
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
      {:else}
        <div class="data-notice">
          <div class="notice-icon">⚖️</div>
          <div class="notice-title">正逆位数据待积累</div>
          <div class="notice-desc">抽取至少 1 张卡牌后，即可查看正逆位倾向分析</div>
          <button class="btn btn-primary btn-small" on:click={goToDraw}>去抽卡</button>
        </div>

        <div class="preview-card">
          <div class="preview-title">分析结果示例</div>
          <div class="reversal-summary placeholder">
            <div class="reversal-icon">📊</div>
            <div class="reversal-tendency dim">数据不足</div>
            <div class="reversal-desc dim">抽取至少 5 张卡牌后，系统将为你分析正逆位倾向。</div>
          </div>

          <div class="reversal-comparison">
            <div class="reversal-side upright dim">
              <div class="reversal-side-value placeholder-value">--</div>
              <div class="reversal-side-label">正位</div>
              <div class="reversal-side-percent mono">--%</div>
            </div>
            
            <div class="reversal-divider">
              <div class="divider-line"></div>
              <div class="divider-icon">⚖️</div>
              <div class="divider-line"></div>
            </div>
            
            <div class="reversal-side reversed dim">
              <div class="reversal-side-value placeholder-value">--</div>
              <div class="reversal-side-label">逆位</div>
              <div class="reversal-side-percent mono">--%</div>
            </div>
          </div>
        </div>
      {/if}
    </div>

  {:else if activeTab === 'preference'}
    <div class="section">
      <h2 class="section-title">🎯 分类偏好</h2>
      
      {#if profile.categoryPreference.hasData}
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
      {:else}
        <div class="data-notice">
          <div class="notice-icon">🎯</div>
          <div class="notice-title">偏好数据待积累</div>
          <div class="notice-desc">抽取至少 1 张卡牌后，即可查看你的分类偏好与主导能量</div>
          <button class="btn btn-primary btn-small" on:click={goToDraw}>去抽卡</button>
        </div>

        <div class="preview-card">
          <div class="preview-title">分类列表（占位）</div>
          <div class="category-list">
            {#each profile.categoryPreference.categories as cat}
              <div class="category-item" style="--cat-color: {cat.color}">
                <div class="category-icon dim">{cat.icon}</div>
                <div class="category-info">
                  <div class="category-header">
                    <span class="category-name dim">{cat.label}</span>
                    <span class="category-count mono dim">0 张 · 0.0%</span>
                  </div>
                  <div class="category-bar-wrapper">
                    <div class="category-bar-fill placeholder" style="background: {cat.color}22;"></div>
                  </div>
                  <div class="category-stats">
                    <span class="mono dim">正位率: --%</span>
                    <span class="mono dim">逆位率: --%</span>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

  {:else if activeTab === 'report'}
    <div class="section">
      <h2 class="section-title">📋 阶段性命运报告</h2>
      
      {#if profile.periodReport.hasEnoughData}
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
      {:else if profile.periodReport.hasData && !profile.periodReport.hasEnoughData}
        <div class="report-verdict building">
          <div class="verdict-emoji">{profile.periodReport.verdictEmoji}</div>
          <div class="verdict-text">{profile.periodReport.overallVerdict}</div>
        </div>

        <div class="progress-card">
          <div class="progress-header">
            <span class="mono">数据积累进度</span>
            <span class="mono">{profile.totalDraws} / 5 张</span>
          </div>
          <div class="progress-bar large">
            <div class="progress-fill" style="width: {Math.min(100, profile.totalDraws * 20)}%"></div>
          </div>
          <div class="progress-hint mono">
            还需抽取 {Math.max(0, 5 - profile.totalDraws)} 张卡牌，即可获得完整报告
          </div>
        </div>

        <div class="report-suggestions">
          <h3 class="subsection-title">💡 新手指引</h3>
          <ul class="suggestion-list">
            {#each profile.periodReport.suggestions as suggestion, index}
              <li class="suggestion-item">
                <span class="suggestion-number">{index + 1}</span>
                <span class="suggestion-text">{suggestion}</span>
              </li>
            {/each}
          </ul>
        </div>
      {:else}
        <div class="data-notice large">
          <div class="notice-icon">📭</div>
          <div class="notice-title">暂无阶段性报告</div>
          <div class="notice-desc">抽取至少 5 张卡牌后，系统将基于你的抽卡数据生成专属命运报告</div>
        </div>

        <div class="progress-card">
          <div class="progress-header">
            <span class="mono">数据积累进度</span>
            <span class="mono">0 / 5 张</span>
          </div>
          <div class="progress-bar large">
            <div class="progress-fill" style="width: 0%"></div>
          </div>
          <div class="progress-hint mono">
            还需抽取 5 张卡牌，即可获得完整报告
          </div>
        </div>

        <div class="welcome-card compact">
          <div class="welcome-title small">报告将包含以下内容</div>
          <ul class="welcome-features small">
            <li>🌟 整体运势评判与阶段总结</li>
            <li>🔑 高频关键词云分析</li>
            <li>📊 正逆位比率统计</li>
            <li>💡 个性化命运指引建议</li>
          </ul>
          <button class="btn btn-primary" on:click={goToDraw}>
            🎴 开始积累数据
          </button>
        </div>
      {/if}

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

  .lucky-card-today.placeholder-card {
    cursor: default;
    border-color: var(--border-glow);
    opacity: 0.6;
  }

  .lucky-card-today.placeholder-card:hover {
    transform: none;
    box-shadow: none;
  }

  .placeholder-symbol {
    opacity: 0.5;
  }

  .placeholder-text {
    opacity: 0.5;
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

  .rarity-count.dim {
    opacity: 0.5;
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

  .rarity-bar-fill.placeholder {
    width: 8% !important;
    animation: pulse 2s ease-in-out infinite;
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

  .reversal-summary.placeholder {
    background: rgba(255, 255, 255, 0.02);
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

  .reversal-tendency.dim {
    color: var(--text-dim);
    text-shadow: none;
    opacity: 0.7;
  }

  .reversal-desc {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.7;
  }

  .reversal-desc.dim {
    opacity: 0.6;
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

  .reversal-side.dim {
    opacity: 0.5;
  }

  .reversal-side-value {
    font-family: var(--font-mono);
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .reversal-side-value.placeholder-value {
    color: var(--text-dim);
    opacity: 0.5;
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

  .category-icon.dim {
    opacity: 0.5;
    filter: none;
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

  .category-name.dim {
    color: var(--text-dim);
  }

  .category-count {
    font-size: 11px;
    color: var(--text-dim);
  }

  .category-count.dim {
    opacity: 0.6;
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

  .category-bar-fill.placeholder {
    width: 8% !important;
    box-shadow: none;
    animation: pulse 2s ease-in-out infinite;
  }

  .category-stats {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
  }

  .category-stats .dim {
    opacity: 0.5;
  }

  .report-verdict {
    background: linear-gradient(135deg, rgba(224, 64, 251, 0.1), rgba(0, 229, 255, 0.1));
    border: 1px solid var(--accent-magenta);
    border-radius: 10px;
    padding: 20px;
    text-align: center;
    margin-bottom: 20px;
  }

  .report-verdict.building {
    background: linear-gradient(135deg, rgba(255, 213, 79, 0.1), rgba(0, 229, 255, 0.1));
    border-color: var(--accent-yellow, #ffd54f);
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

  .section-empty {
    background: var(--bg-card);
    border: 1px dashed var(--border-glow);
    border-radius: 8px;
    padding: 40px 20px;
    text-align: center;
  }

  .section-empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.6;
  }

  .section-empty-title {
    font-family: var(--font-mono);
    font-size: 16px;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }

  .section-empty-desc {
    font-size: 12px;
    color: var(--text-dim);
  }

  .data-notice {
    background: linear-gradient(135deg, rgba(255, 213, 79, 0.08), rgba(0, 229, 255, 0.05));
    border: 1px dashed rgba(255, 213, 79, 0.4);
    border-radius: 10px;
    padding: 24px;
    text-align: center;
    margin-bottom: 20px;
  }

  .data-notice.large {
    padding: 40px 24px;
  }

  .notice-icon {
    font-size: 48px;
    margin-bottom: 12px;
    filter: drop-shadow(0 0 10px rgba(255, 213, 79, 0.3));
  }

  .notice-title {
    font-family: var(--font-mono);
    font-size: 18px;
    color: var(--accent-yellow, #ffd54f);
    margin-bottom: 8px;
  }

  .notice-desc {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 16px;
    line-height: 1.6;
  }

  .btn-small {
    padding: 8px 20px;
    font-size: 12px;
  }

  .preview-card {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    padding: 16px;
    opacity: 0.7;
  }

  .preview-title {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-dim);
    margin-bottom: 12px;
    text-align: center;
    padding-bottom: 8px;
    border-bottom: 1px dashed var(--border-glow);
  }

  .welcome-card {
    background: linear-gradient(135deg, rgba(224, 64, 251, 0.08), rgba(0, 229, 255, 0.08));
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 32px 24px;
    text-align: center;
  }

  .welcome-card.compact {
    padding: 20px;
    margin-top: 16px;
  }

  .welcome-icon {
    font-size: 56px;
    margin-bottom: 16px;
    filter: drop-shadow(0 0 20px var(--accent-magenta));
  }

  .welcome-title {
    font-family: var(--font-mono);
    font-size: 20px;
    color: var(--accent-cyan);
    margin-bottom: 12px;
    text-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
  }

  .welcome-title.small {
    font-size: 16px;
    color: var(--text-secondary);
    text-shadow: none;
    margin-bottom: 12px;
  }

  .welcome-desc {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.7;
    margin-bottom: 16px;
  }

  .welcome-features {
    list-style: none;
    padding: 0;
    margin: 0 0 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .welcome-features.small {
    gap: 6px;
    margin-bottom: 16px;
  }

  .welcome-features li {
    font-size: 13px;
    color: var(--text-secondary);
    padding: 8px 12px;
    background: rgba(0, 229, 255, 0.05);
    border-radius: 6px;
    text-align: left;
  }

  .welcome-features.small li {
    font-size: 12px;
    padding: 6px 10px;
  }

  .progress-card {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 20px;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .progress-bar.large {
    height: 14px;
    margin-bottom: 8px;
  }

  .progress-hint {
    font-size: 11px;
    color: var(--text-dim);
    text-align: center;
  }

  .dim {
    opacity: 0.5;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.7;
    }
  }
</style>
