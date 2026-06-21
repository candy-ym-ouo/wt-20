<script>
  import { TIER_CONFIG, CATEGORY_CONFIG } from '../data/achievements.js'
  import { getAchievementProgress } from '../utils/achievementSystem.js'

  export let achievement
  export let isUnlocked
  export let unlockedData = null
  export let onClose

  $: tierConfig = TIER_CONFIG[achievement.tier]
  $: categoryConfig = CATEGORY_CONFIG[achievement.category]
  $: displayIcon = isUnlocked ? (achievement.revealedIcon || achievement.icon) : (achievement.isHidden ? '❓' : achievement.icon)
  $: displayName = isUnlocked ? (achievement.revealedName || achievement.name) : (achievement.isHidden ? '???' : achievement.name)
  $: displayDesc = isUnlocked ? (achievement.revealedDescription || achievement.description) : (achievement.isHidden ? '需要通过特殊操作解锁此隐藏成就...' : achievement.description)
  $: progress = !isUnlocked && achievement.condition.type !== 'hidden_event' ? getAchievementProgress(achievement) : null

  function formatTime(timestamp) {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function handleClose() {
    if (onClose) onClose()
  }
</script>

<div class="modal-overlay" on:click|self={handleClose}>
  <div class="modal-content achievement-detail" style="--tier-color: {tierConfig.color}; --tier-glow: {tierConfig.glow}; --tier-border: {tierConfig.borderColor};">
    <div class="detail-header">
      <div class="tier-badge" style="color: var(--tier-color); border-color: var(--tier-color);">
        {tierConfig.label}
      </div>
      <div class="category-badge" style="color: {categoryConfig.color};">
        {categoryConfig.icon} {categoryConfig.label}
      </div>
    </div>

    <div class="achievement-visual {isUnlocked ? 'unlocked' : 'locked'}">
      <div class="icon-glow" style="background: radial-gradient(circle, var(--tier-glow) 0%, transparent 70%);"></div>
      <div class="achievement-icon">{displayIcon}</div>
      {#if isUnlocked}
        <div class="unlocked-badge">✓ 已解锁</div>
      {/if}
    </div>

    <h2 class="achievement-title">{displayName}</h2>
    <p class="achievement-desc">{displayDesc}</p>

    {#if !isUnlocked && progress}
      <div class="progress-section">
        <div class="progress-info">
          <span class="mono" style="color: var(--tier-color);">进度</span>
          <span class="mono">{progress.current} / {progress.target} ({progress.percent}%)</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: {progress.percent}%; background: linear-gradient(90deg, var(--tier-color), {categoryConfig.color});"></div>
        </div>
      </div>
    {/if}

    {#if achievement.reward}
      <div class="reward-section">
        <div class="reward-label">🎁 奖励内容</div>
        <div class="reward-content">
          {#if achievement.reward.type === 'title'}
            <div class="reward-item">
              <span class="reward-icon">👑</span>
              <div>
                <div class="reward-title">专属称号</div>
                <div class="reward-value mono glow-yellow">{achievement.reward.value}</div>
              </div>
            </div>
          {:else if achievement.reward.type === 'points'}
            <div class="reward-item">
              <span class="reward-icon">⭐</span>
              <div>
                <div class="reward-title">成就点数</div>
                <div class="reward-value mono glow-yellow">+{achievement.reward.value} 点</div>
              </div>
            </div>
          {/if}
          <div class="reward-desc">{achievement.reward.description}</div>
        </div>
      </div>
    {/if}

    {#if isUnlocked && unlockedData}
      <div class="unlock-info">
        <span class="mono glow-green">解锁时间：{formatTime(unlockedData.unlockedAt)}</span>
      </div>
    {/if}

    <div class="action-row">
      <button class="btn btn-block btn-primary" on:click={handleClose}>
        关闭
      </button>
    </div>
  </div>
</div>

<style>
  .achievement-detail {
    max-width: 400px;
    position: relative;
    overflow: hidden;
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .tier-badge {
    font-family: var(--font-mono);
    font-size: 11px;
    padding: 3px 10px;
    border: 1px solid;
    border-radius: 4px;
    letter-spacing: 1px;
    background: rgba(0, 0, 0, 0.3);
  }

  .category-badge {
    font-family: var(--font-mono);
    font-size: 12px;
  }

  .achievement-visual {
    position: relative;
    width: 120px;
    height: 120px;
    margin: 0 auto 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .achievement-visual.unlocked {
    animation: float 3s ease-in-out infinite;
  }

  .achievement-visual.locked {
    filter: grayscale(0.8);
    opacity: 0.7;
  }

  .icon-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200%;
    height: 200%;
    opacity: 0.6;
  }

  .achievement-icon {
    position: relative;
    z-index: 1;
    font-size: 64px;
    filter: drop-shadow(0 0 20px var(--tier-color));
  }

  .unlocked-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    background: var(--accent-green);
    color: #000;
    font-family: var(--font-mono);
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: bold;
  }

  .achievement-title {
    font-family: var(--font-mono);
    font-size: 20px;
    color: var(--tier-color);
    text-align: center;
    text-shadow: 0 0 10px var(--tier-color);
    margin-bottom: 10px;
    letter-spacing: 1px;
  }

  .achievement-desc {
    font-size: 14px;
    color: var(--text-secondary);
    text-align: center;
    line-height: 1.7;
    margin-bottom: 20px;
  }

  .progress-section {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    padding: 14px;
    margin-bottom: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 12px;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.5s ease;
    box-shadow: 0 0 10px currentColor;
  }

  .reward-section {
    background: linear-gradient(135deg, rgba(255, 213, 79, 0.1), rgba(224, 64, 251, 0.1));
    border: 1px solid rgba(255, 213, 79, 0.3);
    border-radius: 8px;
    padding: 14px;
    margin-bottom: 16px;
  }

  .reward-label {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--accent-yellow);
    margin-bottom: 10px;
  }

  .reward-content {
    font-size: 13px;
  }

  .reward-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  .reward-icon {
    font-size: 28px;
  }

  .reward-title {
    font-size: 12px;
    color: var(--text-dim);
  }

  .reward-value {
    font-size: 15px;
  }

  .reward-desc {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 4px;
  }

  .unlock-info {
    text-align: center;
    font-size: 12px;
    padding: 8px;
    background: rgba(105, 240, 174, 0.1);
    border-radius: 6px;
    margin-bottom: 16px;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
</style>
