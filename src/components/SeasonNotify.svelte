<script>
  import { seasonNotify, phaseUnlockNotify, dismissNotification } from '../utils/seasonSystem.js'
  
  function handleDismiss() {
    dismissNotification()
  }
</script>

{#if $seasonNotify}
  <div class="season-notification">
    <div class="notify-content">
      <div class="notify-icon glow-magenta">🎉</div>
      <div class="notify-info">
        <div class="notify-title">赛季任务完成！</div>
        <div class="notify-task-name">{$seasonNotify.task.name}</div>
        <div class="notify-reward mono">
          +{$seasonNotify.task.points} 赛季积分
        </div>
      </div>
      <button class="notify-close" on:click={handleDismiss}>×</button>
    </div>
    <div class="notify-progress-bar">
      <div class="notify-progress-fill"></div>
    </div>
  </div>
{/if}

{#if $phaseUnlockNotify}
  <div class="phase-unlock-notification" style="--phase-color: {$phaseUnlockNotify.color};">
    <div class="phase-unlock-content">
      <div class="phase-unlock-icon" style="color: {$phaseUnlockNotify.color};">
        {$phaseUnlockNotify.icon}
      </div>
      <div class="phase-unlock-info">
        <div class="phase-unlock-title">新阶段解锁！</div>
        <div class="phase-unlock-name">{$phaseUnlockNotify.name}</div>
        <div class="phase-unlock-desc">{$phaseUnlockNotify.description}</div>
      </div>
    </div>
    <div class="phase-unlock-glow"></div>
  </div>
{/if}

<style>
  .season-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 320px;
    background: linear-gradient(135deg, rgba(224, 64, 251, 0.95), rgba(0, 229, 255, 0.95));
    border-radius: 12px;
    padding: 0;
    z-index: 1000;
    animation: slideIn 0.3s ease;
    box-shadow: 0 10px 40px rgba(224, 64, 251, 0.4);
    backdrop-filter: blur(10px);
  }

  .notify-content {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    position: relative;
  }

  .notify-icon {
    font-size: 36px;
    flex-shrink: 0;
  }

  .notify-info {
    flex: 1;
    min-width: 0;
  }

  .notify-title {
    font-family: var(--font-mono);
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 2px;
  }

  .notify-task-name {
    font-size: 15px;
    font-weight: bold;
    color: white;
    margin-bottom: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .notify-reward {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.9);
  }

  .notify-close {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.8);
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;
  }

  .notify-close:hover {
    color: white;
  }

  .notify-progress-bar {
    height: 3px;
    background: rgba(255, 255, 255, 0.2);
    overflow: hidden;
    border-radius: 0 0 12px 12px;
  }

  .notify-progress-fill {
    height: 100%;
    background: white;
    animation: progressShrink 4s linear forwards;
  }

  .phase-unlock-notification {
    position: fixed;
    top: 80px;
    right: 20px;
    width: 340px;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(var(--phase-color), 0.2));
    border: 2px solid var(--phase-color);
    border-radius: 12px;
    padding: 20px;
    z-index: 1000;
    animation: phaseSlideIn 0.5s ease;
    box-shadow: 0 0 30px rgba(var(--phase-color), 0.5);
    overflow: hidden;
  }

  .phase-unlock-content {
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;
    z-index: 1;
  }

  .phase-unlock-icon {
    font-size: 48px;
    filter: drop-shadow(0 0 15px currentColor);
    flex-shrink: 0;
    animation: iconPulse 1.5s ease-in-out infinite;
  }

  .phase-unlock-info {
    flex: 1;
  }

  .phase-unlock-title {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--phase-color);
    margin-bottom: 4px;
    text-shadow: 0 0 10px var(--phase-color);
  }

  .phase-unlock-name {
    font-size: 18px;
    font-weight: bold;
    color: white;
    margin-bottom: 4px;
    text-shadow: 0 0 10px rgba(var(--phase-color), 0.5);
  }

  .phase-unlock-desc {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.5;
  }

  .phase-unlock-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(var(--phase-color), 0.1) 0%, transparent 70%);
    animation: glowRotate 10s linear infinite;
    pointer-events: none;
  }

  @keyframes slideIn {
    from {
      transform: translateX(120%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes progressShrink {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }

  @keyframes phaseSlideIn {
    from {
      transform: translateX(120%) scale(0.8);
      opacity: 0;
    }
    to {
      transform: translateX(0) scale(1);
      opacity: 1;
    }
  }

  @keyframes iconPulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  @keyframes glowRotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 600px) {
    .season-notification,
    .phase-unlock-notification {
      left: 10px;
      right: 10px;
      width: auto;
      top: 10px;
    }
  }
</style>
