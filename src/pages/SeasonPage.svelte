<script>
  import { onMount, onDestroy } from 'svelte'
  import {
    SEASON_CONFIG,
    PHASE_CONFIG,
    SEASON_TASKS,
    PHASE_STATUS,
    SEASON_STATUS,
    REWARD_TYPE,
    getTasksByPhase,
    getPhaseById
  } from '../data/seasonChallenges.js'
  import {
    seasonOverview,
    currentSeasonData,
    currentSeasonTasks,
    getTaskProgress,
    getPhaseStatus,
    getPhaseProgress,
    getSeasonTimeRemaining,
    getSeasonStatus,
    claimTaskReward,
    claimPhaseReward,
    refreshSeasonData
  } from '../utils/seasonSystem.js'

  let activePhase = 'phase_1'
  let timeRemaining = getSeasonTimeRemaining()
  let timerInterval = null

  $: phaseTasks = getTasksByPhase(activePhase)
  $: currentPhase = getPhaseById(activePhase)

  function isTaskCompleted(taskId) {
    return $currentSeasonTasks?.[taskId]?.completed || false
  }

  function isTaskClaimed(taskId) {
    return $currentSeasonTasks?.[taskId]?.claimed || false
  }

  function getCurrentProgress(taskId) {
    return $currentSeasonTasks?.[taskId]?.current || 0
  }

  function handleClaimReward(taskId) {
    const success = claimTaskReward(taskId)
    if (success) {
      refreshSeasonData()
    }
  }

  function handleClaimPhaseReward(phaseId) {
    const success = claimPhaseReward(phaseId)
    if (success) {
      refreshSeasonData()
    }
  }

  function getPhaseRewardStatus(phaseId) {
    const phase = getPhaseById(phaseId)
    const phaseProgress = getPhaseProgress(phaseId)
    const allCompleted = phaseProgress.completedTasks === phaseProgress.totalTasks
    
    if (!phase?.rewards) return { canClaim: false, claimed: false }
    
    const rewardId = `${phaseId}_${phase.rewards[0].type}_${phase.rewards[0].value}`
    const seasonData = $currentSeasonData || {}
    const claimed = (seasonData.claimedRewards || []).includes(rewardId)
    
    return {
      canClaim: allCompleted && !claimed,
      claimed
    }
  }

  function formatTime() {
    if (timeRemaining.expired) return '已结束'
    const parts = []
    if (timeRemaining.days > 0) parts.push(`${timeRemaining.days}天`)
    if (timeRemaining.hours > 0) parts.push(`${timeRemaining.hours}时`)
    parts.push(`${timeRemaining.minutes}分`)
    parts.push(`${timeRemaining.seconds}秒`)
    return parts.join(' ')
  }

  function getStatusLabel(status) {
    switch (status) {
      case SEASON_STATUS.NOT_STARTED: return '未开始'
      case SEASON_STATUS.ACTIVE: return '进行中'
      case SEASON_STATUS.EXPIRED: return '已结束'
      default: return '未知'
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case SEASON_STATUS.NOT_STARTED: return '#8a8a9a'
      case SEASON_STATUS.ACTIVE: return '#69f0ae'
      case SEASON_STATUS.EXPIRED: return '#ff5252'
      default: return '#8a8a9a'
    }
  }

  function getTaskTypeIcon(type) {
    const icons = {
      draw_count: '🎴',
      rarity_collect: '💎',
      hidden_event: '🔮',
      consecutive_days: '📅',
      category_collect: '🎯'
    }
    return icons[type] || '📋'
  }

  onMount(() => {
    refreshSeasonData()
    timerInterval = setInterval(() => {
      timeRemaining = getSeasonTimeRemaining()
    }, 1000)
  })

  onDestroy(() => {
    if (timerInterval) {
      clearInterval(timerInterval)
    }
  })
</script>

<h1 class="page-title">◆ 赛 季 挑 战 ◆</h1>

<div class="season-header">
  <div class="season-info">
    <div class="season-icon" style="color: #e040fb;">{SEASON_CONFIG.icon}</div>
    <div class="season-title-section">
      <div class="season-name">{SEASON_CONFIG.name}</div>
      <div class="season-subtitle">{SEASON_CONFIG.subtitle}</div>
      <div class="season-status" style="color: {getStatusColor($seasonOverview?.status)};">
        ● {getStatusLabel($seasonOverview?.status)}
      </div>
    </div>
  </div>
  <div class="countdown-card">
    <div class="countdown-label">赛季倒计时</div>
    <div class="countdown-time">{formatTime()}</div>
    <div class="countdown-date mono">第 {$seasonOverview?.dayOfSeason || 1} / {SEASON_CONFIG.totalDays} 天</div>
  </div>
</div>

<div class="overview-section">
  <div class="overview-main">
    <div class="points-display">
      <div class="points-value glow-magenta">{$seasonOverview?.currentPoints || 0}</div>
      <div class="points-label">赛季积分</div>
    </div>
    <div class="points-progress">
      <div class="progress-bar large">
        <div class="progress-fill" style="width: {$seasonOverview?.pointsPercent || 0}%; background: linear-gradient(90deg, #e040fb, #00e5ff);"></div>
      </div>
      <div class="points-meta mono">
        总积分 {$seasonOverview?.currentPoints || 0} / {$seasonOverview?.totalPossiblePoints || 5000} · {$seasonOverview?.pointsPercent || 0}%
      </div>
    </div>
  </div>
  
  <div class="overview-stats-grid">
    <div class="overview-stat-card">
      <div class="stat-value glow-cyan">{$seasonOverview?.completedTasks || 0}</div>
      <div class="stat-label">已完成任务</div>
      <div class="stat-sub mono">{$seasonOverview?.totalTasks || 0} 个任务</div>
    </div>
    <div class="overview-stat-card">
      <div class="stat-value glow-green">{$seasonOverview?.completedPhases || 0}</div>
      <div class="stat-label">已完成阶段</div>
      <div class="stat-sub mono">{$seasonOverview?.totalPhases || 3} 个阶段</div>
    </div>
    <div class="overview-stat-card">
      <div class="stat-value glow-yellow">{$seasonOverview?.unlockedPhases || 1}</div>
      <div class="stat-label">已解锁阶段</div>
      <div class="stat-sub mono">{$seasonOverview?.totalPhases || 3} 个阶段</div>
    </div>
  </div>
</div>

<div class="season-description">
  <p class="description-text">{SEASON_CONFIG.description}</p>
</div>

<div class="phases-section">
  <h2 class="section-title">🌌 赛季阶段</h2>
  
  <div class="phases-timeline">
    {#each PHASE_CONFIG as phase, index}
      {@const phaseStatus = getPhaseStatus(phase.id)}
      {@const phaseProgress = getPhaseProgress(phase.id)}
      {@const phaseRewardStatus = getPhaseRewardStatus(phase.id)}
      <div 
        class="phase-card {phaseStatus === PHASE_STATUS.LOCKED ? 'locked' : ''} {activePhase === phase.id ? 'active' : ''}"
        style="--phase-color: {phase.color};"
        on:click={() => phaseStatus !== PHASE_STATUS.LOCKED && (activePhase = phase.id)}
      >
        <div class="phase-header">
          <div class="phase-icon" style="color: {phase.color};">{phase.icon}</div>
          <div class="phase-info">
            <div class="phase-name">{phase.name}</div>
            <div class="phase-subtitle mono">{phase.subtitle}</div>
          </div>
          <div class="phase-badge" style="background: {phase.glow};">
            {#if phaseStatus === PHASE_STATUS.COMPLETED}✓
            {:else if phaseStatus === PHASE_STATUS.LOCKED}🔒
            {:else}●{/if}
          </div>
        </div>
        
        {#if phaseStatus !== PHASE_STATUS.LOCKED}
          <div class="phase-progress-info">
            <div class="phase-progress-bar">
              <div 
                class="phase-progress-fill" 
                style="width: {phaseProgress.percent}%; background: {phase.color};"
              ></div>
            </div>
            <div class="phase-progress-text mono">
              {phaseProgress.completedTasks}/{phaseProgress.totalTasks} 任务 · {phaseProgress.percent}%
            </div>
          </div>
          
          {#if phase.rewards && phase.rewards.length > 0}
            <div class="phase-rewards">
              {#each phase.rewards as reward}
                <div class="phase-reward-item">
                  <span class="reward-icon">👑</span>
                  <span class="reward-text">{reward.description}</span>
                  {#if phaseRewardStatus.canClaim}
                    <button 
                      class="btn btn-small btn-yellow"
                      on:click|stopPropagation={() => handleClaimPhaseReward(phase.id)}
                    >
                      领取
                    </button>
                  {:else if phaseRewardStatus.claimed}
                    <span class="reward-claimed">✓ 已领取</span>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        {/if}
        
        {#if phaseStatus === PHASE_STATUS.LOCKED}
          <div class="phase-locked-info">
            <div class="locked-text mono">
              需累计 {phase.unlockRequirement} 赛季积分解锁
            </div>
            <div class="locked-hint mono">
              完成任务获得积分，解锁更多挑战
            </div>
          </div>
        {/if}
        
        {#if index < PHASE_CONFIG.length - 1}
          <div class="phase-connector"></div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<div class="tasks-section">
  <div class="section-header">
    <h2 class="section-title">
      {currentPhase?.icon} {currentPhase?.name} · 任务列表
    </h2>
    <div class="phase-unlock-req mono" style="color: {currentPhase?.color};">
      解锁积分: {currentPhase?.unlockRequirement}
    </div>
  </div>
  
  <div class="tasks-description">
    <p>{currentPhase?.description}</p>
  </div>
  
  <div class="tasks-list">
    {#each phaseTasks as task}
      {@const taskProgress = getTaskProgress(task.id)}
      {@const completed = isTaskCompleted(task.id)}
      {@const claimed = isTaskClaimed(task.id)}
      {@const currentVal = getCurrentProgress(task.id)}
      <div 
        class="task-card {completed ? 'completed' : ''} {claimed ? 'claimed' : ''}"
        style="--task-color: {completed ? '#69f0ae' : currentPhase?.color};"
      >
        <div class="task-icon">{task.icon || getTaskTypeIcon(task.type)}</div>
        
        <div class="task-main">
          <div class="task-header">
            <div class="task-name">{task.name}</div>
            <div class="task-points mono" style="color: #e040fb;">
              +{task.points} 积分
            </div>
          </div>
          
          <div class="task-desc">{task.description}</div>
          
          <div class="task-progress-section">
            <div class="task-progress-bar">
              <div 
                class="task-progress-fill"
                style="width: {taskProgress?.percent || 0}%;"
              ></div>
            </div>
            <div class="task-progress-text mono">
              {currentVal || taskProgress?.current || 0} / {task.target}
              {#if task.rarity}
                · {task.rarity === 'legendary' ? '传说' : task.rarity === 'epic' ? '史诗' : task.rarity === 'rare' ? '稀有' : '普通'}级
              {/if}
            </div>
          </div>
        </div>
        
        <div class="task-action">
          {#if claimed}
            <span class="task-status claimed">✓ 已领取</span>
          {:else if completed}
            <button 
              class="btn btn-primary btn-small"
              on:click={() => handleClaimReward(task.id)}
            >
              领取奖励
            </button>
          {:else}
            <span class="task-status pending">进行中</span>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .season-header {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .season-info {
    flex: 1;
    min-width: 250px;
    display: flex;
    align-items: center;
    gap: 16px;
    background: linear-gradient(135deg, rgba(224, 64, 251, 0.1), rgba(0, 229, 255, 0.1));
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 20px;
  }

  .season-icon {
    font-size: 56px;
    filter: drop-shadow(0 0 15px currentColor);
    flex-shrink: 0;
  }

  .season-title-section {
    flex: 1;
  }

  .season-name {
    font-family: var(--font-mono);
    font-size: 22px;
    color: var(--text-primary);
    margin-bottom: 4px;
    text-shadow: 0 0 10px rgba(224, 64, 251, 0.5);
  }

  .season-subtitle {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }

  .season-status {
    font-size: 12px;
    font-family: var(--font-mono);
  }

  .countdown-card {
    width: 200px;
    background: linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(224, 64, 251, 0.1));
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
  }

  .countdown-label {
    font-size: 11px;
    color: var(--text-dim);
    margin-bottom: 8px;
    font-family: var(--font-mono);
  }

  .countdown-time {
    font-family: var(--font-mono);
    font-size: 18px;
    color: var(--accent-cyan);
    text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
    margin-bottom: 4px;
  }

  .countdown-date {
    font-size: 11px;
    color: var(--text-dim);
  }

  .overview-section {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .overview-main {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 20px;
  }

  .points-display {
    text-align: center;
    min-width: 140px;
  }

  .points-value {
    font-family: var(--font-mono);
    font-size: 48px;
    font-weight: bold;
    line-height: 1;
    margin-bottom: 4px;
  }

  .points-label {
    font-size: 12px;
    color: var(--text-dim);
  }

  .points-progress {
    flex: 1;
  }

  .points-meta {
    font-size: 11px;
    color: var(--text-dim);
    text-align: right;
    margin-top: 6px;
  }

  .overview-stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .overview-stat-card {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    padding: 12px;
    text-align: center;
  }

  .stat-value {
    font-family: var(--font-mono);
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 2px;
  }

  .stat-sub {
    font-size: 10px;
    color: var(--text-dim);
  }

  .season-description {
    background: rgba(224, 64, 251, 0.05);
    border-left: 3px solid #e040fb;
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 24px;
  }

  .description-text {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.7;
    margin: 0;
  }

  .section-title {
    font-family: var(--font-mono);
    font-size: 16px;
    color: var(--accent-cyan);
    margin-bottom: 16px;
    padding-left: 8px;
    border-left: 2px solid var(--accent-cyan);
  }

  .phases-section {
    margin-bottom: 24px;
  }

  .phases-timeline {
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: relative;
  }

  .phase-card {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
  }

  .phase-card:hover:not(.locked) {
    border-color: var(--phase-color);
    box-shadow: 0 0 20px rgba(var(--phase-color), 0.2);
    transform: translateX(4px);
  }

  .phase-card.active {
    border-color: var(--phase-color);
    background: linear-gradient(135deg, rgba(var(--phase-color), 0.1), transparent);
  }

  .phase-card.locked {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .phase-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .phase-icon {
    font-size: 36px;
    filter: drop-shadow(0 0 10px currentColor);
    flex-shrink: 0;
  }

  .phase-info {
    flex: 1;
  }

  .phase-name {
    font-family: var(--font-mono);
    font-size: 16px;
    color: var(--text-primary);
    margin-bottom: 2px;
  }

  .phase-subtitle {
    font-size: 11px;
    color: var(--text-dim);
  }

  .phase-badge {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 14px;
    font-weight: bold;
  }

  .phase-progress-info {
    margin-bottom: 12px;
  }

  .phase-progress-bar {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 6px;
  }

  .phase-progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.5s ease;
    box-shadow: 0 0 8px currentColor;
  }

  .phase-progress-text {
    font-size: 10px;
    color: var(--text-dim);
    text-align: right;
  }

  .phase-rewards {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .phase-reward-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 213, 79, 0.1);
    border: 1px solid rgba(255, 213, 79, 0.3);
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 12px;
  }

  .reward-icon {
    font-size: 16px;
  }

  .reward-text {
    flex: 1;
    color: var(--text-secondary);
  }

  .reward-claimed {
    font-size: 11px;
    color: #69f0ae;
    font-family: var(--font-mono);
  }

  .phase-locked-info {
    text-align: center;
    padding: 12px;
  }

  .locked-text {
    font-size: 12px;
    color: var(--text-dim);
    margin-bottom: 4px;
  }

  .locked-hint {
    font-size: 10px;
    color: var(--text-dim);
    opacity: 0.7;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .phase-unlock-req {
    font-size: 11px;
  }

  .tasks-description {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 16px;
  }

  .tasks-description p {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0;
  }

  .tasks-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .task-card {
    display: flex;
    align-items: center;
    gap: 14px;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 10px;
    padding: 14px 16px;
    transition: all 0.3s ease;
  }

  .task-card:hover {
    border-color: var(--task-color);
  }

  .task-card.completed {
    border-color: rgba(105, 240, 174, 0.5);
    background: linear-gradient(135deg, rgba(105, 240, 174, 0.05), transparent);
  }

  .task-card.claimed {
    opacity: 0.7;
  }

  .task-icon {
    font-size: 32px;
    filter: drop-shadow(0 0 8px currentColor);
    flex-shrink: 0;
  }

  .task-main {
    flex: 1;
    min-width: 0;
  }

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  .task-name {
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--text-primary);
  }

  .task-points {
    font-size: 12px;
    font-weight: bold;
  }

  .task-desc {
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 8px;
    line-height: 1.5;
  }

  .task-progress-section {
    margin-top: 8px;
  }

  .task-progress-bar {
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 4px;
  }

  .task-progress-fill {
    height: 100%;
    background: var(--task-color);
    border-radius: 3px;
    transition: width 0.5s ease;
    box-shadow: 0 0 6px var(--task-color);
  }

  .task-progress-text {
    font-size: 10px;
    color: var(--text-dim);
    text-align: right;
  }

  .task-action {
    flex-shrink: 0;
  }

  .task-status {
    font-size: 11px;
    font-family: var(--font-mono);
    padding: 4px 10px;
    border-radius: 4px;
  }

  .task-status.pending {
    background: rgba(255, 213, 79, 0.2);
    color: #ffd54f;
  }

  .task-status.claimed {
    background: rgba(105, 240, 174, 0.2);
    color: #69f0ae;
  }

  .btn-small {
    padding: 6px 14px;
    font-size: 11px;
  }

  @media (max-width: 600px) {
    .season-header {
      flex-direction: column;
    }
    
    .countdown-card {
      width: 100%;
    }
    
    .overview-main {
      flex-direction: column;
      gap: 16px;
    }
    
    .points-progress {
      width: 100%;
    }
    
    .overview-stats-grid {
      grid-template-columns: 1fr;
    }
    
    .task-card {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .task-action {
      width: 100%;
      margin-top: 8px;
    }
    
    .task-action .btn {
      width: 100%;
    }
  }
</style>
