<script>
  import { onMount, onDestroy } from 'svelte'
  import { pendingChapter, clearPendingChapter, makeChoice, startStory } from '../utils/storySystem.js'
  import { TIER_CONFIG } from '../data/achievements.js'

  let currentData = null
  let showModal = false
  let selectedChoice = null
  let isTransitioning = false
  let showChoiceNarrative = false
  let currentChoiceNarrative = ''

  const unsubscribe = pendingChapter.subscribe(value => {
    if (value) {
      currentData = value
      showModal = true
      selectedChoice = null
      showChoiceNarrative = false
      isTransitioning = false
    }
  })

  onMount(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onDestroy(() => {
    unsubscribe()
    document.removeEventListener('keydown', handleKeydown)
  })

  function handleKeydown(e) {
    if (!showModal) return
    if (e.key === 'Escape') {
      closeModal()
    }
  }

  function closeModal() {
    showModal = false
    clearPendingChapter()
    currentData = null
  }

  function handleStartStory() {
    if (!currentData || isTransitioning) return
    
    isTransitioning = true
    const result = startStory(currentData.story.id)
    
    if (result) {
      currentData = result
      isTransitioning = false
    } else {
      isTransitioning = false
    }
  }

  function handleChoice(choice) {
    if (!currentData || isTransitioning || showChoiceNarrative) return
    
    selectedChoice = choice
    currentChoiceNarrative = choice.narrative || ''
    showChoiceNarrative = true
  }

  function continueAfterChoice() {
    if (!selectedChoice || isTransitioning) return
    
    isTransitioning = true
    
    const result = makeChoice(
      currentData.story.id,
      currentData.chapter.id,
      selectedChoice.id
    )
    
    if (result) {
      if (result.isEnding) {
        currentData = result
        selectedChoice = null
        showChoiceNarrative = false
        isTransitioning = false
      } else {
        setTimeout(() => {
          currentData = result
          selectedChoice = null
          showChoiceNarrative = false
          isTransitioning = false
        }, 500)
      }
    } else {
      isTransitioning = false
    }
  }

  function getEndingColor(type) {
    const colors = {
      good: '#4caf50',
      neutral: '#ff9800',
      bad: '#f44336',
      bittersweet: '#9c27b0',
      sad: '#2196f3',
      legendary: '#ffc107'
    }
    return colors[type] || '#888'
  }

  function getEndingLabel(type) {
    const labels = {
      good: '好结局',
      neutral: '中立结局',
      bad: '坏结局',
      bittersweet: '苦乐参半',
      sad: '悲伤结局',
      legendary: '传说结局'
    }
    return labels[type] || '结局'
  }

  function getRarityStyle(rarity) {
    const config = TIER_CONFIG[rarity]
    if (!config) return {}
    return {
      color: config.color,
      boxShadow: `0 0 20px ${config.glow}`,
      borderColor: config.borderColor
    }
  }
</script>

{#if showModal && currentData}
  <div class="modal-overlay" on:click|stopPropagation={closeModal}>
    <div 
      class="modal-content"
      style="--story-color: {currentData.story?.color || '#00e5ff'}"
      on:click|stopPropagation
    >
      {#if currentData.story}
        <div class="story-header" style={getRarityStyle(currentData.story.rarity)}>
          <div class="story-icon">{currentData.story.icon}</div>
          <div class="story-info">
            <h2 class="story-name">{currentData.story.name}</h2>
            <p class="story-desc">{currentData.story.description}</p>
          </div>
          <button class="close-btn" on:click={closeModal}>×</button>
        </div>
      {/if}

      {#if currentData.chapter}
        <div class="chapter-content">
          <h3 class="chapter-title">{currentData.chapter.title}</h3>
          
          {#if showChoiceNarrative && currentChoiceNarrative}
            <div class="choice-narrative">
              <p class="narrative-text">{currentChoiceNarrative}</p>
              <button 
                class="continue-btn"
                on:click={continueAfterChoice}
                disabled={isTransitioning}
              >
                {isTransitioning ? '加载中...' : '继续'}
              </button>
            </div>
          {:else if currentData.chapter.isEnding}
            <div class="ending-section">
              <div 
                class="ending-badge"
                style="background: linear-gradient(135deg, {getEndingColor(currentData.chapter.endingType)}, #1a1a2e)"
              >
                {getEndingLabel(currentData.chapter.endingType)}
              </div>
              <p class="narrative-text ending-text">{currentData.chapter.narrative}</p>
              
              {#if currentData.chapter.reward}
                <div class="reward-section">
                  <h4>🎁 获得奖励</h4>
                  <div class="reward-item">
                    <span class="reward-title">称号解锁：</span>
                    <span class="reward-value">{currentData.chapter.reward.title}</span>
                  </div>
                </div>
              {/if}
              
              {#if currentData.chapter.permanentEffects}
                <div class="permanent-effects">
                  <h4>✨ 永久效果</h4>
                  {#each currentData.chapter.permanentEffects as effect}
                    <div class="effect-item">
                      {#if effect.type === 'increase_rarity_weight'}
                        <span>{effect.target}稀有度权重 +{Math.round((effect.multiplier - 1) * 100)}%</span>
                      {:else if effect.type === 'decrease_rarity_weight'}
                        <span>{effect.target}稀有度权重 -{Math.round((1 - 1/effect.multiplier) * 100)}%</span>
                      {:else if effect.type === 'increase_category_weight'}
                        <span>{effect.target}类别权重 +{Math.round((effect.multiplier - 1) * 100)}%</span>
                      {:else if effect.type === 'decrease_category_weight'}
                        <span>{effect.target}类别权重 -{Math.round((1 - 1/effect.multiplier) * 100)}%</span>
                      {:else if effect.type === 'increase_reversed_chance'}
                        <span>逆位概率 +{Math.round(effect.value * 100)}%</span>
                      {:else if effect.type === 'decrease_reversed_chance'}
                        <span>逆位概率 -{Math.round(effect.value * 100)}%</span>
                      {/if}
                    </div>
                  {/each}
                </div>
              {/if}
              
              <button class="close-story-btn" on:click={closeModal}>
                完成
              </button>
            </div>
          {:else if !currentData.progress || currentData.progress.status === 'not_started'}
            <div class="trigger-section">
              <p class="narrative-text">{currentData.chapter.narrative}</p>
              <button 
                class="start-btn"
                on:click={handleStartStory}
                disabled={isTransitioning}
              >
                {isTransitioning ? '加载中...' : '开始剧情'}
              </button>
            </div>
          {:else}
            <p class="narrative-text">{currentData.chapter.narrative}</p>
            
            {#if currentData.chapter.choices && currentData.chapter.choices.length > 0}
              <div class="choices-section">
                <h4>你的选择：</h4>
                {#each currentData.chapter.choices as choice}
                  <button
                    class={`choice-btn ${selectedChoice?.id === choice.id ? 'selected' : ''}`}
                    on:click={() => handleChoice(choice)}
                    disabled={isTransitioning}
                  >
                    <span class="choice-text">{choice.text}</span>
                    {#if choice.effects && choice.effects.length > 0}
                      <div class="choice-effects">
                        {#each choice.effects as effect}
                          <span class="effect-tag">
                            {#if effect.type === 'increase_rarity_weight'}
                              ↑ {effect.target}稀有度 x{effect.multiplier} ({effect.duration}次抽卡)
                            {:else if effect.type === 'decrease_rarity_weight'}
                              ↓ {effect.target}稀有度 ÷{effect.multiplier} ({effect.duration}次抽卡)
                            {:else if effect.type === 'increase_category_weight'}
                              ↑ {effect.target}类别 x{effect.multiplier} ({effect.duration}次抽卡)
                            {:else if effect.type === 'decrease_category_weight'}
                              ↓ {effect.target}类别 ÷{effect.multiplier} ({effect.duration}次抽卡)
                            {:else if effect.type === 'increase_reversed_chance'}
                              ↑ 逆位概率 +{Math.round(effect.value * 100)}% ({effect.duration}次抽卡)
                            {:else if effect.type === 'decrease_reversed_chance'}
                              ↓ 逆位概率 -{Math.round(effect.value * 100)}% ({effect.duration}次抽卡)
                            {/if}
                          </span>
                        {/each}
                      </div>
                    {/if}
                  </button>
                {/each}
              </div>
            {/if}
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(8px);
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-content {
    background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 20px;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    border: 2px solid var(--story-color);
    box-shadow: 0 0 60px rgba(0, 229, 255, 0.2), inset 0 0 60px rgba(0, 0, 0, 0.5);
    animation: slideUp 0.4s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .story-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px;
    background: linear-gradient(135deg, rgba(0, 229, 255, 0.1), transparent);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
  }

  .story-icon {
    font-size: 48px;
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 16px;
    border: 2px solid currentColor;
  }

  .story-info {
    flex: 1;
  }

  .story-name {
    font-size: 24px;
    font-weight: bold;
    margin: 0 0 8px 0;
    color: #fff;
    text-shadow: 0 0 10px var(--story-color);
  }

  .story-desc {
    font-size: 14px;
    color: #888;
    margin: 0;
    line-height: 1.5;
  }

  .close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 36px;
    height: 36px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    font-size: 24px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }

  .chapter-content {
    padding: 24px;
  }

  .chapter-title {
    font-size: 20px;
    color: var(--story-color);
    margin: 0 0 20px 0;
    text-align: center;
    text-shadow: 0 0 15px var(--story-color);
  }

  .narrative-text {
    font-size: 16px;
    line-height: 1.8;
    color: #e0e0e0;
    margin: 0 0 24px 0;
    text-align: justify;
  }

  .trigger-section {
    text-align: center;
  }

  .start-btn {
    padding: 14px 48px;
    font-size: 16px;
    font-weight: bold;
    color: #fff;
    background: linear-gradient(135deg, var(--story-color), #7b1fa2);
    border: none;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 20px rgba(0, 229, 255, 0.3);
  }

  .start-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 30px rgba(0, 229, 255, 0.5);
  }

  .start-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .choices-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .choices-section h4 {
    font-size: 14px;
    color: #888;
    margin: 0 0 8px 0;
  }

  .choice-btn {
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    text-align: left;
  }

  .choice-btn:hover:not(:disabled) {
    background: rgba(0, 229, 255, 0.1);
    border-color: var(--story-color);
    transform: translateX(8px);
  }

  .choice-btn.selected {
    background: rgba(0, 229, 255, 0.15);
    border-color: var(--story-color);
    box-shadow: 0 0 20px rgba(0, 229, 255, 0.2);
  }

  .choice-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .choice-text {
    font-size: 15px;
    color: #fff;
    display: block;
    margin-bottom: 8px;
  }

  .choice-effects {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .effect-tag {
    font-size: 12px;
    padding: 4px 10px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 12px;
    color: #00e5ff;
  }

  .choice-narrative {
    text-align: center;
  }

  .continue-btn {
    padding: 12px 36px;
    font-size: 14px;
    font-weight: bold;
    color: #fff;
    background: linear-gradient(135deg, #4caf50, #2e7d32);
    border: none;
    border-radius: 24px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .continue-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(76, 175, 80, 0.4);
  }

  .ending-section {
    text-align: center;
  }

  .ending-badge {
    display: inline-block;
    padding: 6px 20px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: bold;
    color: #fff;
    margin-bottom: 20px;
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  }

  .ending-text {
    font-size: 17px;
    font-style: italic;
    color: #fff;
  }

  .reward-section,
  .permanent-effects {
    margin-top: 24px;
    padding: 16px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    text-align: left;
  }

  .reward-section h4,
  .permanent-effects h4 {
    font-size: 14px;
    color: #ffd54f;
    margin: 0 0 12px 0;
  }

  .reward-item {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .reward-title {
    color: #888;
  }

  .reward-value {
    color: #ffd54f;
    font-weight: bold;
  }

  .effect-item {
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: #4fc3f7;
    font-size: 14px;
  }

  .effect-item:last-child {
    border-bottom: none;
  }

  .close-story-btn {
    margin-top: 24px;
    padding: 14px 48px;
    font-size: 16px;
    font-weight: bold;
    color: #fff;
    background: linear-gradient(135deg, #7b1fa2, #4a148c);
    border: none;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .close-story-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 30px rgba(123, 31, 162, 0.5);
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
