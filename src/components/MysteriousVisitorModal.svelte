<script>
  import { onMount, onDestroy } from 'svelte'
  import { visitorEvent, dismissVisitor, makeVisitorChoice, handleVisitorTimeout } from '../utils/mysteriousVisitorSystem.js'
  import { VISITOR_REWARD_TYPE } from '../data/mysteriousVisitor.js'

  export let isOpen = false

  let currentData = null
  let timeRemaining = 0
  let timerInterval = null
  let isChoosing = false
  let selectedChoiceId = null
  let showReward = false
  let lastReward = null
  let typewriterText = ''
  let typewriterIndex = 0
  let typewriterInterval = null
  let glitchActive = false

  const unsubscribe = visitorEvent.subscribe(value => {
    if (value) {
      currentData = value
      isOpen = true
      timeRemaining = value.dialog?.timeLimit || 30
      selectedChoiceId = null
      showReward = false
      lastReward = null
      isChoosing = false

      startTimer()
      startTypewriter(value.dialog?.text || '')

      glitchActive = true
      setTimeout(() => { glitchActive = false }, 500)
    }
  })

  onMount(() => {})

  onDestroy(() => {
    unsubscribe()
    clearTimer()
    clearTypewriter()
  })

  function startTimer() {
    clearTimer()
    timerInterval = setInterval(() => {
      timeRemaining--
      if (timeRemaining <= 0) {
        clearTimer()
        handleTimeout()
      }
    }, 1000)
  }

  function clearTimer() {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  function startTypewriter(text) {
    clearTypewriter()
    typewriterText = ''
    typewriterIndex = 0
    if (!text) return
    typewriterInterval = setInterval(() => {
      if (typewriterIndex < text.length) {
        typewriterText += text[typewriterIndex]
        typewriterIndex++
      } else {
        clearTypewriter()
      }
    }, 35)
  }

  function clearTypewriter() {
    if (typewriterInterval) {
      clearInterval(typewriterInterval)
      typewriterInterval = null
    }
  }

  function handleTimeout() {
    if (!currentData) return
    clearTypewriter()
    const result = handleVisitorTimeout(
      currentData.visitor.id,
      currentData.dialog.id
    )
    currentData = null
    isOpen = false
  }

  function handleChoice(choice) {
    if (isChoosing) return
    isChoosing = true
    selectedChoiceId = choice.id
    clearTimer()
    clearTypewriter()

    setTimeout(() => {
      const result = makeVisitorChoice(
        currentData.visitor.id,
        currentData.dialog.id,
        choice.id
      )

      if (result && result.isComplete) {
        if (result.reward) {
          showReward = true
          lastReward = result.reward
        } else {
          currentData = null
          isOpen = false
        }
      } else if (result && result.dialog) {
        currentData = result
        timeRemaining = result.dialog.timeLimit || 30
        selectedChoiceId = null
        isChoosing = false
        startTimer()
        startTypewriter(result.dialog.text || '')
      } else {
        currentData = null
        isOpen = false
      }

      isChoosing = false
    }, 600)
  }

  function closeReward() {
    showReward = false
    lastReward = null
    currentData = null
    isOpen = false
  }

  function getTimerColor() {
    if (timeRemaining <= 5) return '#ff5252'
    if (timeRemaining <= 10) return '#ff9800'
    return currentData?.visitor?.color || '#00e5ff'
  }

  function getTimerPercent() {
    const total = currentData?.dialog?.timeLimit || 30
    return Math.max(0, (timeRemaining / total) * 100)
  }

  function getRarityLabel(rarity) {
    const labels = { rare: '稀有', epic: '史诗', legendary: '传说' }
    return labels[rarity] || rarity
  }

  function getRarityColor(rarity) {
    const colors = {
      rare: '#4fc3f7',
      epic: '#ba68c8',
      legendary: '#ffd54f'
    }
    return colors[rarity] || '#888'
  }

  function describeReward(reward) {
    if (!reward) return ''
    switch (reward.type) {
      case VISITOR_REWARD_TYPE.EXCLUSIVE_CARD:
        return `获得专属卡牌！`
      case VISITOR_REWARD_TYPE.RARITY_BOOST:
        return `${getRarityLabel(reward.rarity)}卡牌概率提升 x${reward.multiplier}（持续${reward.duration}次抽卡）`
      case VISITOR_REWARD_TYPE.CATEGORY_BOOST:
        return `${reward.category}类别权重提升 x${reward.multiplier}（持续${reward.duration}次抽卡）`
      default:
        return '获得了神秘奖励'
    }
  }
</script>

{#if isOpen && currentData}
  <div class="modal-overlay" class:glitch={glitchActive} on:click|self={handleTimeout}>
    <div
      class="modal-content"
      style="--visitor-color: {currentData.visitor?.color || '#7c4dff'}; --visitor-glow: {currentData.visitor?.glowColor || 'rgba(124, 77, 255, 0.3)'}"
      on:click|stopPropagation
    >
      {#if showReward && lastReward}
        <div class="reward-screen">
          <div class="reward-visitor-icon">{currentData.visitor.icon}</div>
          <h3 class="reward-title">邂逅结束</h3>
          <p class="reward-visitor-name">{currentData.visitor.name} 消失在数据缝隙中...</p>

          <div class="reward-detail">
            <div class="reward-icon">🎁</div>
            <p class="reward-desc">{describeReward(lastReward)}</p>
          </div>

          {#if lastReward.type === VISITOR_REWARD_TYPE.EXCLUSIVE_CARD}
            {@const cardData = currentData.visitor.exclusiveCards?.find(c => c.id === lastReward.cardId)}
            {#if cardData}
              <div class="exclusive-card-preview" style="border-color: {getRarityColor(cardData.rarity)}">
                <div class="card-symbol" style="color: {getRarityColor(cardData.rarity)}">{cardData.symbol}</div>
                <div class="card-name" style="color: {getRarityColor(cardData.rarity)}">{cardData.name}</div>
                <div class="card-rarity-badge" style="background: {getRarityColor(cardData.rarity)}20; color: {getRarityColor(cardData.rarity)}">
                  {getRarityLabel(cardData.rarity)}
                </div>
                <div class="card-keywords">
                  {#each cardData.keywords as kw}
                    <span class="keyword-tag">{kw}</span>
                  {/each}
                </div>
                <div class="card-record-label">📜 专属卡牌已记录</div>
              </div>
            {/if}
          {/if}

          <button class="close-reward-btn" on:click={closeReward}>
            确认
          </button>
        </div>
      {:else}
        <div class="visitor-header" style="background: linear-gradient(135deg, var(--visitor-glow), transparent)">
          <div class="visitor-portrait">{currentData.visitor.icon}</div>
          <div class="visitor-info">
            <div class="visitor-rarity" style="color: {getRarityColor(currentData.visitor.rarity)}">
              {getRarityLabel(currentData.visitor.rarity)}
            </div>
            <h2 class="visitor-name">{currentData.visitor.name}</h2>
          </div>
          <div class="timer-container">
            <svg class="timer-ring" viewBox="0 0 40 40">
              <circle class="timer-bg" cx="20" cy="20" r="17" />
              <circle
                class="timer-progress"
                cx="20" cy="20" r="17"
                style="stroke: {getTimerColor()}; stroke-dasharray: {2 * Math.PI * 17}; stroke-dashoffset: {2 * Math.PI * 17 * (1 - getTimerPercent() / 100)}"
              />
            </svg>
            <span class="timer-text" style="color: {getTimerColor()}">{timeRemaining}</span>
          </div>
        </div>

        <div class="dialog-section">
          <div class="speaker-label">
            <span class="speaker-icon">{currentData.dialog.portrait}</span>
            <span class="speaker-name">{currentData.dialog.speaker}</span>
          </div>
          <div class="dialog-text">
            <p>{typewriterText}<span class="cursor">|</span></p>
          </div>
        </div>

        <div class="choices-section">
          {#each currentData.dialog.choices as choice, i}
            <button
              class="choice-btn {selectedChoiceId === choice.id ? 'selected' : ''}"
              on:click={() => handleChoice(choice)}
              disabled={isChoosing}
              style="animation-delay: {i * 0.1}s"
            >
              <span class="choice-index">{i + 1}</span>
              <span class="choice-text">{choice.text}</span>
              {#if choice.reward}
                <span class="choice-reward-hint">
                  {#if choice.reward.type === VISITOR_REWARD_TYPE.EXCLUSIVE_CARD}
                    🃏
                  {:else if choice.reward.type === VISITOR_REWARD_TYPE.RARITY_BOOST}
                    ⬆️
                  {:else if choice.reward.type === VISITOR_REWARD_TYPE.CATEGORY_BOOST}
                    🔮
                  {/if}
                </span>
              {/if}
            </button>
          {/each}
        </div>

        <div class="dialog-footer">
          <span class="mono hint-text">限时对话 · 请在倒计时结束前选择</span>
        </div>
      {/if}
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
    z-index: 1001;
    backdrop-filter: blur(12px);
    animation: fadeIn 0.3s ease;
  }

  .modal-overlay.glitch {
    animation: glitchFlash 0.5s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes glitchFlash {
    0% { opacity: 1; }
    10% { opacity: 0.3; }
    20% { opacity: 1; }
    30% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 1; }
  }

  .modal-content {
    background: linear-gradient(145deg, #0d0d1f 0%, #1a1a3e 100%);
    border-radius: 20px;
    max-width: 560px;
    width: 92%;
    max-height: 88vh;
    overflow-y: auto;
    border: 2px solid var(--visitor-color);
    box-shadow: 0 0 80px var(--visitor-glow), inset 0 0 60px rgba(0, 0, 0, 0.6);
    animation: slideUp 0.4s ease;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(40px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .visitor-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    position: relative;
  }

  .visitor-portrait {
    font-size: 40px;
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 16px;
    border: 2px solid var(--visitor-color);
    box-shadow: 0 0 20px var(--visitor-glow);
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  .visitor-info {
    flex: 1;
  }

  .visitor-rarity {
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 2px;
  }

  .visitor-name {
    font-size: 22px;
    font-weight: bold;
    color: #fff;
    margin: 0;
    text-shadow: 0 0 15px var(--visitor-color);
  }

  .timer-container {
    position: relative;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .timer-ring {
    position: absolute;
    width: 44px;
    height: 44px;
    transform: rotate(-90deg);
  }

  .timer-bg {
    fill: none;
    stroke: rgba(255, 255, 255, 0.1);
    stroke-width: 3;
  }

  .timer-progress {
    fill: none;
    stroke-width: 3;
    stroke-linecap: round;
    transition: stroke-dashoffset 1s linear, stroke 0.5s;
  }

  .timer-text {
    font-size: 14px;
    font-weight: bold;
    z-index: 1;
  }

  .dialog-section {
    padding: 20px 24px 8px;
  }

  .speaker-label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .speaker-icon {
    font-size: 20px;
  }

  .speaker-name {
    font-size: 14px;
    font-weight: bold;
    color: var(--visitor-color);
    letter-spacing: 1px;
  }

  .dialog-text {
    min-height: 60px;
    padding: 16px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 12px;
    border-left: 3px solid var(--visitor-color);
  }

  .dialog-text p {
    font-size: 15px;
    line-height: 1.8;
    color: #e0e0e0;
    margin: 0;
  }

  .cursor {
    animation: blink 0.8s step-end infinite;
    color: var(--visitor-color);
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .choices-section {
    padding: 12px 24px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .choice-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
    animation: choiceSlideIn 0.4s ease both;
  }

  @keyframes choiceSlideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .choice-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--visitor-color);
    transform: translateX(6px);
    box-shadow: 0 0 20px var(--visitor-glow);
  }

  .choice-btn.selected {
    background: var(--visitor-glow);
    border-color: var(--visitor-color);
    box-shadow: 0 0 30px var(--visitor-glow);
  }

  .choice-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .choice-index {
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
    font-size: 13px;
    font-weight: bold;
    color: var(--visitor-color);
    flex-shrink: 0;
  }

  .choice-text {
    flex: 1;
    font-size: 14px;
    color: #e0e0e0;
  }

  .choice-reward-hint {
    font-size: 16px;
    flex-shrink: 0;
  }

  .dialog-footer {
    padding: 8px 24px 16px;
    text-align: center;
  }

  .hint-text {
    font-size: 11px;
    color: var(--text-dim);
    letter-spacing: 1px;
  }

  .reward-screen {
    padding: 32px 24px;
    text-align: center;
  }

  .reward-visitor-icon {
    font-size: 56px;
    margin-bottom: 16px;
    animation: fadeOut 2s ease 1s both;
  }

  @keyframes fadeOut {
    from { opacity: 1; transform: scale(1); }
    to { opacity: 0.3; transform: scale(0.8); }
  }

  .reward-title {
    font-size: 22px;
    font-weight: bold;
    color: #fff;
    margin: 0 0 8px;
  }

  .reward-visitor-name {
    font-size: 14px;
    color: #888;
    margin: 0 0 24px;
  }

  .reward-detail {
    padding: 16px;
    background: rgba(255, 213, 79, 0.08);
    border: 1px solid rgba(255, 213, 79, 0.2);
    border-radius: 12px;
    margin-bottom: 20px;
  }

  .reward-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }

  .reward-desc {
    font-size: 15px;
    color: #ffd54f;
    margin: 0;
    line-height: 1.6;
  }

  .exclusive-card-preview {
    padding: 20px;
    background: rgba(0, 0, 0, 0.5);
    border: 2px solid;
    border-radius: 16px;
    margin-bottom: 24px;
    text-align: center;
  }

  .card-symbol {
    font-size: 48px;
    margin-bottom: 8px;
    text-shadow: 0 0 20px currentColor;
  }

  .card-name {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 8px;
    text-shadow: 0 0 10px currentColor;
  }

  .card-rarity-badge {
    display: inline-block;
    padding: 3px 14px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 12px;
  }

  .card-keywords {
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }

  .keyword-tag {
    font-size: 12px;
    padding: 3px 10px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    color: #aaa;
  }

  .card-record-label {
    font-size: 13px;
    color: var(--accent-cyan);
    margin-top: 8px;
  }

  .close-reward-btn {
    padding: 14px 48px;
    font-size: 16px;
    font-weight: bold;
    color: #fff;
    background: linear-gradient(135deg, var(--visitor-color), #4a148c);
    border: none;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 20px var(--visitor-glow);
  }

  .close-reward-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 30px var(--visitor-glow);
  }

  .modal-content::-webkit-scrollbar {
    width: 5px;
  }

  .modal-content::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  .modal-content::-webkit-scrollbar-thumb {
    background: var(--visitor-color);
    border-radius: 3px;
    opacity: 0.3;
  }
</style>
