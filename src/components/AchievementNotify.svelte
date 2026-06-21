<script>
  import { onMount } from 'svelte'
  import { TIER_CONFIG } from '../data/achievements.js'
  import { achievementNotify, dismissNotification } from '../utils/achievementSystem.js'

  let achievement = null
  let visible = false

  let unsubscribe

  onMount(() => {
    unsubscribe = achievementNotify.subscribe(value => {
      if (value) {
        achievement = value
        visible = true
      } else {
        visible = false
        setTimeout(() => {
          if (!visible) achievement = null
        }, 300)
      }
    })
  })

  function handleClose() {
    dismissNotification()
  }

  $: tierConfig = achievement ? TIER_CONFIG[achievement.tier] : null
  $: displayIcon = achievement ? (achievement.revealedIcon || achievement.icon) : ''
  $: displayName = achievement ? (achievement.revealedName || achievement.name) : ''
</script>

{#if achievement}
  <div class="notify-container {visible ? 'visible' : ''}" on:click={handleClose}>
    <div class="notify-card" style="--tier-color: {tierConfig?.color}; --tier-glow: {tierConfig?.glow}; --tier-border: {tierConfig?.borderColor};">
      <div class="notify-glow"></div>
      <div class="notify-content">
        <div class="notify-badge">{tierConfig?.label}成就</div>
        <div class="notify-icon">{displayIcon}</div>
        <div class="notify-title">{displayName}</div>
        <div class="notify-desc">{achievement.revealedDescription || achievement.description}</div>
        {#if achievement.reward}
          <div class="notify-reward">
            <span class="reward-label">奖励：</span>
            <span class="reward-value mono">{achievement.reward.description}</span>
          </div>
        {/if}
      </div>
      <div class="notify-particles">
        {#each Array(8) as _, i}
          <span class="particle" style="--delay: {i * 0.1}s;"></span>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .notify-container {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(-20px);
    z-index: 1000;
    opacity: 0;
    pointer-events: none;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .notify-container.visible {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
    pointer-events: auto;
  }

  .notify-card {
    position: relative;
    background: linear-gradient(135deg, rgba(26, 26, 58, 0.98), rgba(18, 18, 42, 0.98));
    border: 2px solid var(--tier-border);
    border-radius: 12px;
    padding: 20px 28px;
    min-width: 280px;
    max-width: 340px;
    text-align: center;
    box-shadow:
      0 0 30px var(--tier-glow),
      0 0 60px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    cursor: pointer;
    overflow: hidden;
    backdrop-filter: blur(10px);
  }

  .notify-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, var(--tier-glow) 0%, transparent 60%);
    opacity: 0.3;
    animation: glow-rotate 4s linear infinite;
  }

  @keyframes glow-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .notify-content {
    position: relative;
    z-index: 1;
  }

  .notify-badge {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--tier-color);
    letter-spacing: 2px;
    padding: 3px 12px;
    border: 1px solid var(--tier-color);
    border-radius: 4px;
    margin-bottom: 12px;
    background: rgba(0, 0, 0, 0.3);
    text-transform: uppercase;
  }

  .notify-icon {
    font-size: 52px;
    margin-bottom: 10px;
    filter: drop-shadow(0 0 15px var(--tier-color));
    animation: icon-bounce 0.8s ease-out;
  }

  @keyframes icon-bounce {
    0% { transform: scale(0) rotate(-180deg); }
    50% { transform: scale(1.2) rotate(10deg); }
    100% { transform: scale(1) rotate(0); }
  }

  .notify-title {
    font-family: var(--font-mono);
    font-size: 18px;
    color: var(--tier-color);
    text-shadow: 0 0 10px var(--tier-color);
    margin-bottom: 8px;
    letter-spacing: 1px;
  }

  .notify-desc {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 12px;
  }

  .notify-reward {
    font-size: 12px;
    color: var(--text-primary);
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
    border: 1px solid rgba(255, 213, 79, 0.3);
  }

  .reward-label {
    color: var(--text-dim);
  }

  .reward-value {
    color: var(--accent-yellow);
    text-shadow: 0 0 5px var(--accent-yellow);
  }

  .notify-particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
  }

  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: var(--tier-color);
    border-radius: 50%;
    box-shadow: 0 0 6px var(--tier-color);
    top: 50%;
    left: 50%;
    animation: particle-fly 1.5s ease-out infinite;
    animation-delay: var(--delay);
  }

  @keyframes particle-fly {
    0% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(
        calc(-50% + (cos(var(--delay) * 360deg) * 150px)),
        calc(-50% + (sin(var(--delay) * 360deg) * 150px))
      ) scale(0);
      opacity: 0;
    }
  }
</style>
