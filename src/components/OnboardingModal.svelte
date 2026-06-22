<script>
  import { onMount, onDestroy } from 'svelte'
  import {
    showOnboarding,
    onboardingProgress,
    nextStep,
    prevStep,
    closeOnboarding,
    performFirstDraw,
    isFirstDrawing,
    firstDrawResult,
    openWorldLore,
    completeOnboarding
  } from '../utils/onboardingSystem.js'
  import { RARITY_CONFIG } from '../data/constants.js'
  import { TIER_CONFIG } from '../data/achievements.js'
  import CardDisplay from './CardDisplay.svelte'

  let showModal = false
  let currentStepData = null
  let progress = 0
  let currentStepIndex = 0
  let totalSteps = 0
  let isDrawing = false
  let drawResult = null
  let showCardReveal = false
  let isFlipping = false

  const unsubscribeShow = showOnboarding.subscribe(value => {
    showModal = value
    if (value) {
      showCardReveal = false
      drawResult = null
      isFlipping = false
    }
  })

  const unsubscribeProgress = onboardingProgress.subscribe(value => {
    currentStepData = value.currentStepData
    progress = value.percent
    currentStepIndex = value.currentStep
    totalSteps = value.totalSteps
  })

  const unsubscribeDrawing = isFirstDrawing.subscribe(value => {
    isDrawing = value
  })

  const unsubscribeResult = firstDrawResult.subscribe(value => {
    if (value && currentStepData?.type === 'action') {
      drawResult = value
      setTimeout(() => {
        isFlipping = true
        setTimeout(() => {
          showCardReveal = true
        }, 600)
      }, 300)
    }
  })

  onMount(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onDestroy(() => {
    unsubscribeShow()
    unsubscribeProgress()
    unsubscribeDrawing()
    unsubscribeResult()
    document.removeEventListener('keydown', handleKeydown)
  })

  function handleKeydown(e) {
    if (!showModal) return
    if (e.key === 'Escape') {
      handleSkip()
    } else if (e.key === 'ArrowRight') {
      handleNext()
    } else if (e.key === 'ArrowLeft') {
      handlePrev()
    }
  }

  function handleNext() {
    if (currentStepData?.type === 'action' && !drawResult) {
      return
    }
    nextStep()
  }

  function handlePrev() {
    if (currentStepIndex > 0) {
      prevStep()
    }
  }

  function handleSkip() {
    closeOnboarding()
  }

  async function handleFirstDraw() {
    if (isDrawing || drawResult) return
    await performFirstDraw()
  }

  function handleOpenLore() {
    openWorldLore()
  }

  function handleComplete() {
    completeOnboarding()
  }

  function getStepIcon(step) {
    if (!step) return '❓'
    return step.icon || '✨'
  }

  function getRarityStyle(rarity) {
    const config = TIER_CONFIG[rarity]
    if (!config) return {}
    return {
      color: config.color,
      textShadow: `0 0 10px ${config.glow}`
    }
  }
</script>

{#if showModal && currentStepData}
  <div class="modal-overlay" on:click|stopPropagation={handleSkip}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="progress-bar">
        <div class="progress-fill" style="width: {progress}%"></div>
        <div class="progress-steps">
          {#each Array.from({ length: totalSteps }) as _, i}
            <div
              class="progress-dot {i < currentStepIndex ? 'completed' : ''} {i === currentStepIndex ? 'active' : ''}"
            ></div>
          {/each}
        </div>
      </div>

      <button class="skip-btn" on:click={handleSkip}>
        跳过引导
      </button>

      <div class="step-content">
        <div class="step-icon-container">
          <span class="step-icon glow-cyan">{getStepIcon(currentStepData)}</span>
        </div>

        <h2 class="step-title">{currentStepData.title}</h2>
        <p class="step-subtitle mono">{currentStepData.subtitle}</p>

        <div class="step-body">
          <p class="step-desc">{currentStepData.content}</p>

          {#if currentStepData.highlight}
            <div class="highlight-box">
              <span class="highlight-text">{currentStepData.highlight}</span>
            </div>
          {/if}

          {#if currentStepData.lore && currentStepData.type === 'lore'}
            <div class="lore-list">
              {#each currentStepData.lore as item}
                <div class="lore-item">
                  <div class="lore-item-title glow-magenta">{item.title}</div>
                  <div class="lore-item-desc">{item.desc}</div>
                </div>
              {/each}
            </div>
            <button class="btn btn-ghost btn-small" on:click={handleOpenLore}>
              📖 查看完整世界观
            </button>
          {/if}

          {#if currentStepData.features && currentStepData.type === 'feature'}
            <div class="features-grid">
              {#each currentStepData.features as feature}
                <div class="feature-card">
                  <div class="feature-icon">{feature.icon}</div>
                  <div class="feature-title">{feature.title}</div>
                  <div class="feature-desc">{feature.desc}</div>
                </div>
              {/each}
            </div>
          {/if}

          {#if currentStepData.tips && currentStepData.type === 'tips'}
            <div class="tips-list">
              {#each currentStepData.tips as tip}
                <div class="tip-item">{tip}</div>
              {/each}
            </div>
          {/if}

          {#if currentStepData.reward && currentStepData.type === 'complete'}
            <div class="reward-section">
              <div class="reward-title glow-yellow">🎁 {currentStepData.reward.title}</div>
              <div class="reward-items">
                {#each currentStepData.reward.items as item}
                  <div class="reward-item">
                    <span class="reward-icon">{item.icon}</span>
                    <span class="reward-text">{item.text}</span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          {#if currentStepData.type === 'action' && currentStepData.action === 'firstDraw'}
            <div class="draw-section">
              {#if currentStepData.hint}
                <p class="draw-hint mono">{currentStepData.hint}</p>
              {/if}

              {#if !drawResult}
                <button
                  class="btn btn-primary btn-large draw-btn"
                  on:click={handleFirstDraw}
                  disabled={isDrawing}
                >
                  {#if isDrawing}
                    <span class="loading-spinner"></span>
                    抽取中...
                  {:else}
                    🎴 开始抽卡
                  {/if}
                </button>
              {:else}
                <div class="card-reveal-container">
                  <div class="card-wrapper" class:flipped={isFlipping}>
                    <div class="card-face card-back">
                      <div class="card-back-pattern">
                        <span class="card-back-icon">🎴</span>
                      </div>
                    </div>
                    <div class="card-face card-front">
                      {#if showCardReveal && drawResult.card}
                        <div class="card-display-wrapper">
                          <CardDisplay card={drawResult.card} size="small" showDetails={false} />
                        </div>
                        <div class="card-reveal-info">
                          <div class="card-name" style={getRarityStyle(drawResult.card.rarity)}>
                            {drawResult.card.symbol} {drawResult.card.name}
                          </div>
                          <div class="card-orientation">
                            {drawResult.isReversed ? '逆位' : '正位'}
                          </div>
                          <div class="card-reading">
                            {drawResult.reading?.title || ''}
                          </div>
                        </div>
                      {/if}
                    </div>
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </div>

        <div class="step-actions">
          {#if currentStepIndex > 0}
            <button class="btn btn-ghost" on:click={handlePrev}>
              ← 上一步
            </button>
          {:else}
            <div></div>
          {/if}

          {#if currentStepData.type === 'complete'}
            <button class="btn btn-primary btn-glow" on:click={handleComplete}>
              ✨ {currentStepData.buttonText}
            </button>
          {:else if currentStepData.type === 'action' && !drawResult}
            <div></div>
          {:else}
            <button class="btn btn-primary" on:click={handleNext}>
              {currentStepData.buttonText || '下一步'} →
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    backdrop-filter: blur(10px);
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-content {
    background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
    border-radius: 24px;
    max-width: 480px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    border: 2px solid var(--accent-cyan);
    box-shadow: 0 0 60px rgba(0, 229, 255, 0.3), inset 0 0 60px rgba(0, 229, 255, 0.05);
    animation: slideUp 0.5s ease;
    position: relative;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(50px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .progress-bar {
    position: relative;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: visible;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-cyan), var(--accent-magenta));
    border-radius: 2px;
    transition: width 0.5s ease;
    box-shadow: 0 0 10px var(--accent-cyan);
  }

  .progress-steps {
    position: absolute;
    top: 50%;
    left: 20px;
    right: 20px;
    transform: translateY(-50%);
    display: flex;
    justify-content: space-between;
  }

  .progress-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
  }

  .progress-dot.completed {
    background: var(--accent-cyan);
    border-color: var(--accent-cyan);
    box-shadow: 0 0 8px var(--accent-cyan);
  }

  .progress-dot.active {
    background: var(--accent-magenta);
    border-color: var(--accent-magenta);
    box-shadow: 0 0 12px var(--accent-magenta);
    transform: scale(1.3);
  }

  .skip-btn {
    position: absolute;
    top: 16px;
    right: 20px;
    padding: 6px 14px;
    font-size: 12px;
    color: var(--text-dim);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s;
    z-index: 10;
  }

  .skip-btn:hover {
    color: var(--text-secondary);
    background: rgba(255, 255, 255, 0.1);
  }

  .step-content {
    padding: 32px 28px 28px;
    text-align: center;
  }

  .step-icon-container {
    margin-bottom: 20px;
  }

  .step-icon {
    font-size: 64px;
    display: inline-block;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .step-title {
    font-size: 26px;
    font-weight: bold;
    color: #fff;
    margin: 0 0 8px 0;
    text-shadow: 0 0 20px rgba(0, 229, 255, 0.5);
  }

  .step-subtitle {
    font-size: 12px;
    color: var(--accent-cyan);
    margin: 0 0 24px 0;
    letter-spacing: 2px;
  }

  .step-body {
    margin-bottom: 28px;
  }

  .step-desc {
    font-size: 15px;
    line-height: 1.8;
    color: var(--text-secondary);
    margin: 0 0 16px 0;
    text-align: justify;
  }

  .highlight-box {
    padding: 14px 20px;
    background: linear-gradient(135deg, rgba(224, 64, 251, 0.15), rgba(0, 229, 255, 0.15));
    border: 1px solid var(--accent-magenta);
    border-radius: 12px;
    margin-bottom: 16px;
  }

  .highlight-text {
    font-size: 14px;
    color: var(--accent-magenta);
    font-weight: bold;
    text-shadow: 0 0 8px rgba(224, 64, 251, 0.5);
  }

  .lore-list {
    text-align: left;
    margin: 16px 0;
  }

  .lore-item {
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    margin-bottom: 10px;
    border-left: 3px solid var(--accent-cyan);
  }

  .lore-item-title {
    font-size: 13px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .lore-item-desc {
    font-size: 12px;
    color: var(--text-dim);
    line-height: 1.5;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin: 16px 0;
  }

  .feature-card {
    padding: 16px 10px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    transition: all 0.3s;
  }

  .feature-card:hover {
    border-color: var(--accent-cyan);
    transform: translateY(-2px);
  }

  .feature-icon {
    font-size: 28px;
    margin-bottom: 8px;
  }

  .feature-title {
    font-size: 12px;
    font-weight: bold;
    color: #fff;
    margin-bottom: 4px;
  }

  .feature-desc {
    font-size: 10px;
    color: var(--text-dim);
    line-height: 1.4;
  }

  .tips-list {
    text-align: left;
    margin: 16px 0;
  }

  .tip-item {
    padding: 10px 14px;
    font-size: 13px;
    color: var(--text-secondary);
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    margin-bottom: 8px;
    border-left: 2px solid var(--accent-yellow);
  }

  .reward-section {
    background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.1));
    border: 1px solid var(--accent-yellow);
    border-radius: 16px;
    padding: 20px;
    margin: 16px 0;
  }

  .reward-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 14px;
  }

  .reward-items {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .reward-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .reward-icon {
    font-size: 20px;
  }

  .draw-section {
    margin: 20px 0;
  }

  .draw-hint {
    font-size: 11px;
    color: var(--text-dim);
    margin-bottom: 16px;
    font-style: italic;
  }

  .draw-btn {
    min-width: 200px;
    font-size: 18px !important;
    padding: 16px 40px !important;
  }

  .loading-spinner {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 8px;
    vertical-align: middle;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .card-reveal-container {
    display: flex;
    justify-content: center;
    padding: 10px 0;
  }

  .card-wrapper {
    position: relative;
    width: 160px;
    height: 240px;
    perspective: 1000px;
  }

  .card-wrapper.flipped .card-back {
    transform: rotateY(180deg);
  }

  .card-wrapper.flipped .card-front {
    transform: rotateY(0deg);
  }

  .card-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    transition: transform 0.6s ease;
    border-radius: 12px;
    overflow: hidden;
  }

  .card-back {
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border: 2px solid var(--accent-cyan);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 30px rgba(0, 229, 255, 0.3);
  }

  .card-back-pattern {
    width: 80%;
    height: 80%;
    border: 2px dashed rgba(0, 229, 255, 0.3);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-back-icon {
    font-size: 48px;
    opacity: 0.5;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.1); }
  }

  .card-front {
    transform: rotateY(180deg);
    background: linear-gradient(145deg, #1a1a2e, #16213e);
    border: 2px solid var(--accent-magenta);
    box-shadow: 0 0 30px rgba(224, 64, 251, 0.3);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px;
  }

  .card-display-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 8px;
  }

  .card-reveal-info {
    padding: 12px;
    text-align: center;
  }

  .card-name {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .card-orientation {
    font-size: 11px;
    color: var(--text-dim);
    margin-bottom: 6px;
  }

  .card-reading {
    font-size: 10px;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .step-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-top: 24px;
  }

  .step-actions .btn {
    flex: 1;
    max-width: 180px;
  }

  .btn-glow {
    box-shadow: 0 0 20px rgba(0, 229, 255, 0.5) !important;
    animation: glowPulse 2s ease-in-out infinite;
  }

  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 20px rgba(0, 229, 255, 0.5); }
    50% { box-shadow: 0 0 40px rgba(0, 229, 255, 0.8); }
  }

  .btn-large {
    padding: 14px 32px !important;
    font-size: 16px !important;
  }

  .btn-small {
    padding: 6px 16px !important;
    font-size: 12px !important;
  }

  .btn-ghost {
    background: transparent !important;
    border: 1px solid var(--border-glow) !important;
    color: var(--text-dim) !important;
  }

  .btn-ghost:hover {
    color: var(--text-secondary) !important;
    border-color: var(--accent-cyan) !important;
  }

  .modal-content::-webkit-scrollbar {
    width: 6px;
  }

  .modal-content::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  .modal-content::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.3);
    border-radius: 3px;
  }

  .modal-content::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 229, 255, 0.5);
  }
</style>
