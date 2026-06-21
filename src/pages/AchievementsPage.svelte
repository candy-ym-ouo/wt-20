<script>
  import { onMount } from 'svelte'
  import {
    ACHIEVEMENTS,
    ACHIEVEMENT_CATEGORY,
    CATEGORY_CONFIG,
    TIER_CONFIG,
    ACHIEVEMENT_TIER
  } from '../data/achievements.js'
  import {
    unlockedAchievements,
    achievementStats,
    unlockedAchievementTitles,
    getAchievementProgress,
    refreshAchievements,
    checkAllAchievements
  } from '../utils/achievementSystem.js'
  import AchievementDetailModal from '../components/AchievementDetailModal.svelte'

  let activeCategory = 'all'
  let activeTier = 'all'
  let selectedAchievement = null
  let sortBy = 'default'

  const CATEGORY_TABS = [
    { id: 'all', label: '全部', icon: '✨', color: '#ffffff' },
    ...Object.entries(CATEGORY_CONFIG).map(([id, config]) => ({
      id,
      label: config.label,
      icon: config.icon,
      color: config.color
    }))
  ]

  const TIER_FILTERS = [
    { id: 'all', label: '全部' },
    ...Object.entries(TIER_CONFIG).map(([id, config]) => ({
      id,
      label: config.label,
      color: config.color
    }))
  ]

  $: filteredAchievements = ACHIEVEMENTS.filter(ach => {
    const matchesCategory = activeCategory === 'all' || ach.category === activeCategory
    const matchesTier = activeTier === 'all' || ach.tier === activeTier
    return matchesCategory && matchesTier
  })

  $: sortedAchievements = [...filteredAchievements].sort((a, b) => {
    const aUnlocked = $unlockedAchievements[a.id]
    const bUnlocked = $unlockedAchievements[b.id]

    switch (sortBy) {
      case 'unlocked':
        if (aUnlocked && !bUnlocked) return -1
        if (!aUnlocked && bUnlocked) return 1
        return 0
      case 'locked':
        if (!aUnlocked && bUnlocked) return -1
        if (aUnlocked && !bUnlocked) return 1
        return 0
      case 'tier':
        const tierOrder = [ACHIEVEMENT_TIER.LEGENDARY, ACHIEVEMENT_TIER.HIDDEN, ACHIEVEMENT_TIER.EPIC, ACHIEVEMENT_TIER.RARE, ACHIEVEMENT_TIER.COMMON]
        return tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)
      default:
        if (aUnlocked && !bUnlocked) return -1
        if (!aUnlocked && bUnlocked) return 1
        return 0
    }
  })

  function openAchievementDetail(achievement) {
    selectedAchievement = achievement
  }

  function closeDetail() {
    selectedAchievement = null
  }

  function isUnlocked(id) {
    return !!$unlockedAchievements[id]
  }

  function displayIcon(ach) {
    if (isUnlocked(ach.id)) return ach.revealedIcon || ach.icon
    if (ach.isHidden) return '❓'
    return ach.icon
  }

  function displayName(ach) {
    if (isUnlocked(ach.id)) return ach.revealedName || ach.name
    if (ach.isHidden) return '???'
    return ach.name
  }

  function displayDesc(ach) {
    if (isUnlocked(ach.id)) return ach.revealedDescription || ach.description
    if (ach.isHidden) return '隐藏成就，探索解锁...'
    return ach.description
  }

  function getProgress(ach) {
    if (isUnlocked(ach.id) || ach.condition.type === 'hidden_event') return null
    return getAchievementProgress(ach)
  }

  function handleRefresh() {
    refreshAchievements()
    checkAllAchievements()
  }

  onMount(() => {
    checkAllAchievements()
  })
</script>

<h1 class="page-title">◆ 成 就 殿 堂 ◆</h1>

<div class="overview-section">
  <div class="overview-stats">
    <div class="overview-main">
      <div class="points-display">
        <div class="points-value">{$achievementStats.points}</div>
        <div class="points-label">成就点数</div>
      </div>
      <div class="points-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: {$achievementStats.pointsPercent}%"></div>
        </div>
        <div class="points-meta mono">
          {$achievementStats.unlockedCount} / {$achievementStats.totalCount} 成就 · {$achievementStats.percent}%
        </div>
      </div>
    </div>
  </div>

  {#if $unlockedAchievementTitles.length > 0}
    <div class="titles-section">
      <div class="section-title">🏆 已获称号</div>
      <div class="titles-list">
        {#each $unlockedAchievementTitles as title}
          <span class="title-badge tier-{title.tier}" style="--tier-color: {TIER_CONFIG[title.tier].color};">
            👑 {title.value}
          </span>
        {/each}
      </div>
    </div>
  {/if}

  <div class="category-progress">
    {#each Object.entries($achievementStats.byCategory) as [cat, data]}
      {#if data.total > 0}
        <div class="cat-item" style="--cat-color: {CATEGORY_CONFIG[cat].color};">
          <div class="cat-icon">{CATEGORY_CONFIG[cat].icon}</div>
          <div class="cat-info">
            <div class="cat-name">{CATEGORY_CONFIG[cat].label}</div>
            <div class="cat-progress-bar">
              <div class="cat-progress-fill" style="width: {data.percent}%;"></div>
            </div>
          </div>
          <div class="cat-count mono">{data.unlocked}/{data.total}</div>
        </div>
      {/if}
    {/each}
  </div>
</div>

<div class="filter-section">
  <div class="tabs category-tabs">
    {#each CATEGORY_TABS as tab}
      <div
        class="tab {activeCategory === tab.id ? 'active' : ''}"
        style="--tab-color: {tab.color};"
        on:click={() => (activeCategory = tab.id)}
      >
        <span>{tab.icon}</span>
        <span>{tab.label}</span>
      </div>
    {/each}
  </div>

  <div class="filter-row">
    <div class="tier-filters">
      {#each TIER_FILTERS as filter}
        <button
          class="tier-btn {activeTier === filter.id ? 'active' : ''}"
          style="--filter-color: {filter.color || 'var(--text-dim)'};"
          on:click={() => (activeTier = filter.id)}
        >
          {filter.label}
        </button>
      {/each}
    </div>
    <select class="sort-select" bind:value={sortBy}>
      <option value="default">默认排序</option>
      <option value="unlocked">已解锁优先</option>
      <option value="locked">未解锁优先</option>
      <option value="tier">稀有度排序</option>
    </select>
  </div>
</div>

{#if sortedAchievements.length === 0}
  <div class="empty-state">
    <div class="empty-state-icon">🏆</div>
    <div class="empty-state-text">没有找到匹配的成就</div>
  </div>
{:else}
  <div class="achievements-grid">
    {#each sortedAchievements as achievement}
      {#if isUnlocked(achievement.id)}
        <div
          class="achievement-card tier-{achievement.tier} unlocked"
          style="--tier-color: {TIER_CONFIG[achievement.tier].color}; --tier-glow: {TIER_CONFIG[achievement.tier].glow};"
          on:click={() => openAchievementDetail(achievement)}
        >
          <div class="card-glow"></div>
          <div class="card-icon">{displayIcon(achievement)}</div>
          <div class="card-name">{displayName(achievement)}</div>
          <div class="card-tier">{TIER_CONFIG[achievement.tier].label}</div>
          {#if achievement.reward?.type === 'title'}
            <div class="card-reward">👑 {achievement.reward.value}</div>
          {/if}
        </div>
      {:else}
        <div
          class="achievement-card tier-{achievement.tier} locked {achievement.isHidden ? 'is-hidden' : ''}"
          style="--tier-color: {TIER_CONFIG[achievement.tier].color};"
          on:click={() => openAchievementDetail(achievement)}
        >
          <div class="card-icon">{displayIcon(achievement)}</div>
          <div class="card-name">{displayName(achievement)}</div>
          <div class="card-tier">{TIER_CONFIG[achievement.tier].label}</div>
          {#if getProgress(achievement)}
            <div class="mini-progress">
              <div class="mini-progress-fill" style="width: {getProgress(achievement).percent}%;"></div>
            </div>
            <div class="mini-progress-text mono">{getProgress(achievement).current}/{getProgress(achievement).target}</div>
          {/if}
        </div>
      {/if}
    {/each}
  </div>
{/if}

<div class="header-actions" style="margin-top: 20px;">
  <button class="btn" on:click={handleRefresh}>
    🔄 刷新进度
  </button>
</div>

{#if selectedAchievement}
  <AchievementDetailModal
    achievement={selectedAchievement}
    isUnlocked={isUnlocked(selectedAchievement.id)}
    unlockedData={$unlockedAchievements[selectedAchievement.id]}
    onClose={closeDetail}
  />
{/if}

<style>
  .overview-section {
    background: linear-gradient(135deg, var(--bg-card), var(--bg-secondary));
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .overview-stats {
    display: flex;
    gap: 20px;
    margin-bottom: 16px;
  }

  .overview-main {
    flex: 1;
  }

  .points-display {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 10px;
  }

  .points-value {
    font-family: var(--font-mono);
    font-size: 42px;
    font-weight: bold;
    background: linear-gradient(135deg, var(--accent-yellow), var(--accent-magenta));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: none;
    filter: drop-shadow(0 0 15px rgba(255, 213, 79, 0.5));
  }

  .points-label {
    font-size: 13px;
    color: var(--text-secondary);
    font-family: var(--font-mono);
  }

  .progress-bar {
    width: 100%;
    height: 10px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 6px;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-yellow), var(--accent-magenta), var(--accent-cyan));
    border-radius: 5px;
    transition: width 0.5s ease;
    box-shadow: 0 0 10px var(--accent-yellow);
  }

  .points-meta {
    font-size: 11px;
    color: var(--text-dim);
  }

  .titles-section {
    margin-bottom: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .section-title {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--accent-yellow);
    margin-bottom: 10px;
  }

  .titles-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .title-badge {
    padding: 5px 12px;
    border: 1px solid var(--tier-color);
    border-radius: 16px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--tier-color);
    background: rgba(0, 0, 0, 0.3);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  }

  .category-progress {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .cat-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 0, 0, 0.2);
    padding: 8px 10px;
    border-radius: 6px;
  }

  .cat-icon {
    font-size: 18px;
  }

  .cat-info {
    flex: 1;
    min-width: 0;
  }

  .cat-name {
    font-size: 11px;
    color: var(--cat-color);
    font-family: var(--font-mono);
    margin-bottom: 4px;
  }

  .cat-progress-bar {
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
  }

  .cat-progress-fill {
    height: 100%;
    background: var(--cat-color);
    border-radius: 2px;
  }

  .cat-count {
    font-size: 10px;
    color: var(--text-dim);
    white-space: nowrap;
  }

  .filter-section {
    margin-bottom: 16px;
  }

  .category-tabs {
    margin-bottom: 12px;
    overflow-x: auto;
    flex-wrap: nowrap;
    border-bottom: none;
    gap: 4px;
  }

  .category-tabs .tab {
    flex: none;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid transparent;
    border-radius: 6px;
    font-size: 12px;
    transition: all 0.2s ease;
  }

  .category-tabs .tab.active {
    background: rgba(0, 0, 0, 0.3);
    border-color: var(--tab-color);
    color: var(--tab-color);
  }

  .filter-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .tier-filters {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .tier-btn {
    padding: 4px 10px;
    font-family: var(--font-mono);
    font-size: 11px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    color: var(--text-dim);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tier-btn:hover {
    border-color: var(--filter-color);
  }

  .tier-btn.active {
    border-color: var(--filter-color);
    color: var(--filter-color);
    background: rgba(0, 0, 0, 0.3);
  }

  .sort-select {
    padding: 6px 10px;
    font-family: var(--font-mono);
    font-size: 12px;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 4px;
    color: var(--text-primary);
    outline: none;
    cursor: pointer;
  }

  .sort-select:focus {
    border-color: var(--accent-cyan);
  }

  .achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .achievement-card {
    position: relative;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 10px;
    padding: 14px 10px;
    text-align: center;
    cursor: pointer;
    transition: all 0.25s ease;
    overflow: hidden;
  }

  .achievement-card.unlocked {
    border-color: var(--tier-color);
    box-shadow: 0 0 15px var(--tier-glow), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    animation: card-glow 3s ease-in-out infinite;
  }

  .achievement-card.locked {
    opacity: 0.65;
    filter: saturate(0.5);
  }

  .achievement-card.locked.is-hidden {
    opacity: 0.4;
  }

  .achievement-card:hover {
    transform: translateY(-4px);
  }

  .achievement-card.unlocked:hover {
    box-shadow: 0 5px 30px var(--tier-glow);
  }

  .card-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, var(--tier-glow) 0%, transparent 50%);
    opacity: 0.4;
    pointer-events: none;
    animation: glow-sweep 4s ease-in-out infinite;
  }

  @keyframes glow-sweep {
    0%, 100% { transform: translate(-30%, -30%); }
    50% { transform: translate(30%, 30%); }
  }

  @keyframes card-glow {
    0%, 100% { box-shadow: 0 0 12px var(--tier-glow), inset 0 1px 0 rgba(255, 255, 255, 0.1); }
    50% { box-shadow: 0 0 24px var(--tier-glow), inset 0 1px 0 rgba(255, 255, 255, 0.1); }
  }

  .card-icon {
    font-size: 36px;
    margin-bottom: 8px;
    position: relative;
    z-index: 1;
  }

  .achievement-card.unlocked .card-icon {
    filter: drop-shadow(0 0 10px var(--tier-color));
  }

  .card-name {
    font-size: 12px;
    color: var(--text-primary);
    font-family: var(--font-mono);
    margin-bottom: 4px;
    position: relative;
    z-index: 1;
  }

  .achievement-card.unlocked .card-name {
    color: var(--tier-color);
  }

  .card-tier {
    font-size: 10px;
    color: var(--text-dim);
    font-family: var(--font-mono);
    letter-spacing: 0.5px;
    position: relative;
    z-index: 1;
  }

  .card-reward {
    font-size: 10px;
    color: var(--accent-yellow);
    font-family: var(--font-mono);
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px dashed rgba(255, 213, 79, 0.3);
    position: relative;
    z-index: 1;
  }

  .mini-progress {
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    margin-top: 8px;
    overflow: hidden;
  }

  .mini-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-cyan), var(--accent-magenta));
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .mini-progress-text {
    font-size: 9px;
    color: var(--text-dim);
    margin-top: 3px;
  }
</style>
