<script>
  import { onMount } from 'svelte'
  import {
    QUESTION_CATEGORIES,
    URGENCY_LEVELS,
    recommendSpreads,
    drawQuestionDrivenCards,
    getSpreadMeta,
    saveQuestionDrivenResult
  } from '../utils/cardSystem.js'
  import { Storage } from '../utils/storage.js'
  import { THEME_CONFIG, MULTI_SPREAD_CONFIG } from '../data/constants.js'
  import {
    ownsItem,
    ownedShopItems
  } from '../utils/fateShopSystem.js'
  import { getShopItemById } from '../data/fateShop.js'
  import CardDisplay from '../components/CardDisplay.svelte'
  import ResultModal from '../components/ResultModal.svelte'

  let step = 'question'
  let question = ''
  let context = ''
  let selectedUrgency = URGENCY_LEVELS[1]
  let recommendationResult = null
  let selectedSpreadRec = null
  let selectedSpreadMeta = null
  let isAnimating = false
  let drawResults = null
  let showResult = false
  let stats = Storage.getStats()
  let ownedItems = {}
  let currentRecordId = null

  function refreshStats() {
    stats = Storage.getStats()
  }

  function isSpreadUnlocked(rec) {
    if (rec.type !== 'multi-spread') return true
    const spread = MULTI_SPREAD_CONFIG[rec.spreadId]
    if (!spread || !spread.special) return true
    return ownsItem(spread.shopItemId)
  }

  function goToShop() {
    const event = new CustomEvent('navigate', { detail: 'fate-shop' })
    window.dispatchEvent(event)
  }

  function selectUrgency(urgency) {
    selectedUrgency = urgency
  }

  function proceedToRecommendation() {
    if (!question.trim() && !context.trim()) return
    recommendationResult = recommendSpreads(question, context, selectedUrgency)
    step = 'recommendation'
  }

  function backToQuestion() {
    recommendationResult = null
    selectedSpreadRec = null
    selectedSpreadMeta = null
    step = 'question'
  }

  function selectSpreadRecommendation(rec) {
    if (!isSpreadUnlocked(rec)) {
      goToShop()
      return
    }
    selectedSpreadRec = rec
    selectedSpreadMeta = getSpreadMeta(rec)
    step = 'confirm'
  }

  function backToRecommendation() {
    selectedSpreadRec = null
    selectedSpreadMeta = null
    step = 'recommendation'
  }

  async function startDivination() {
    if (isAnimating) return
    isAnimating = true

    await new Promise(resolve => setTimeout(resolve, 1200))

    const results = drawQuestionDrivenCards(selectedSpreadRec)
    drawResults = results

    const questionContext = {
      question,
      context,
      urgency: selectedUrgency,
      categoryAnalysis: recommendationResult.category
    }

    const savedRecord = saveQuestionDrivenResult(
      questionContext,
      selectedSpreadRec,
      selectedSpreadMeta,
      results,
      ''
    )
    currentRecordId = savedRecord[0]?.id
    refreshStats()

    setTimeout(() => {
      showResult = true
      isAnimating = false
    }, 500)
  }

  function handleCloseResult() {
    showResult = false
    drawResults = null
    selectedSpreadRec = null
    selectedSpreadMeta = null
    recommendationResult = null
    question = ''
    context = ''
    selectedUrgency = URGENCY_LEVELS[1]
    currentRecordId = null
    step = 'question'
  }

  function handleDrawAgain() {
    showResult = false
    drawResults = null
    step = 'confirm'
  }

  function goToHistory() {
    const event = new CustomEvent('navigate', { detail: { page: 'history', tab: 'question-driven' } })
    window.dispatchEvent(event)
  }

  onMount(() => {
    refreshStats()
    const unsubscribe = ownedShopItems.subscribe(items => {
      ownedItems = items
    })
    return () => unsubscribe && unsubscribe()
  })
</script>

<h1 class="page-title">◆ 问 题 驱 动 占 卜 ◆</h1>

<div class="flow-indicator">
  <div class="flow-step {step === 'question' ? 'active' : ''} {step !== 'question' && recommendationResult ? 'done' : ''}">
    <span class="flow-num">1</span>
    <span class="flow-label">记录问题</span>
  </div>
  <div class="flow-line"></div>
  <div class="flow-step {step === 'recommendation' ? 'active' : ''} {step === 'confirm' || step === 'result' ? 'done' : ''}">
    <span class="flow-num">2</span>
    <span class="flow-label">智能推荐</span>
  </div>
  <div class="flow-line"></div>
  <div class="flow-step {step === 'confirm' ? 'active' : ''} {showResult ? 'done' : ''}">
    <span class="flow-num">3</span>
    <span class="flow-label">抽卡占卜</span>
  </div>
  <div class="flow-line"></div>
  <div class="flow-step {showResult ? 'active done' : ''}">
    <span class="flow-num">4</span>
    <span class="flow-label">沉淀解读</span>
  </div>
</div>

{#if step === 'question'}
  <div class="section-title">记录你的问题与背景</div>

  <div class="question-card">
    <div class="field-section">
      <label class="field-label">
        <span class="required">*</span> 你想问的核心问题
      </label>
      <textarea
        class="question-input"
        bind:value={question}
        placeholder="例如：我和TA的感情会如何发展？我要不要跳槽？..."
        maxlength="200"
      />
      <div class="char-count">{question.length}/200</div>
    </div>

    <div class="field-section">
      <label class="field-label">
        补充背景描述 <span class="optional">（可选）</span>
      </label>
      <textarea
        class="context-input"
        bind:value={context}
        placeholder="例如：我们在一起3年了，最近因为工作原因经常吵架..."
        maxlength="500"
      />
      <div class="char-count">{context.length}/500</div>
    </div>

    <div class="field-section">
      <label class="field-label">当前状态紧急程度</label>
      <div class="urgency-grid">
        {#each URGENCY_LEVELS as urgency}
          <div
            class="urgency-card {selectedUrgency.id === urgency.id ? 'selected' : ''}"
            style="--urgency-color: {urgency.color}"
            on:click={() => selectUrgency(urgency)}
          >
            <div class="urgency-icon">{urgency.icon}</div>
            <div class="urgency-name">{urgency.name}</div>
            <div class="urgency-desc">{urgency.description}</div>
          </div>
        {/each}
      </div>
    </div>

    <div class="quick-tags">
      <div class="tags-label">💡 常见问题类型参考：</div>
      <div class="tags-list">
        {#each Object.values(QUESTION_CATEGORIES) as cat}
          <span
            class="tag-chip"
            style="color: {cat.color}; border-color: {cat.color}"
            on:click={() => { question = cat.description; }}
          >
            {cat.icon} {cat.name}
          </span>
        {/each}
      </div>
    </div>

    <button
      class="btn btn-primary btn-block submit-btn"
      on:click={proceedToRecommendation}
      disabled={!question.trim() && !context.trim()}
    >
      🔍 智能分析并推荐占卜方式 →
    </button>
  </div>

  <div class="history-link" on:click={goToHistory}>
    📜 查看问题占卜历史 →
  </div>

{:else if step === 'recommendation'}
  <div class="nav-header">
    <button class="btn icon-btn" on:click={backToQuestion}>←</button>
    <div class="nav-title">智能推荐结果</div>
  </div>

  <div class="analysis-card">
    <div class="analysis-header">
      <div
        class="analysis-category"
        style="color: {recommendationResult.category.category.color}"
      >
        {recommendationResult.category.category.icon} {recommendationResult.category.category.name}
      </div>
      <div class="analysis-confidence">
        <div class="confidence-label">匹配度</div>
        <div class="confidence-bar">
          <div
            class="confidence-fill"
            style="width: {Math.round(recommendationResult.category.confidence * 100)}%; background: {recommendationResult.category.category.color}"
          ></div>
        </div>
        <div class="confidence-value">{Math.round(recommendationResult.category.confidence * 100)}%</div>
      </div>
    </div>
    <div class="analysis-summary">{recommendationResult.summary}</div>
    <div class="analysis-question-preview">
      <div class="aqp-label">你的问题：</div>
      <div class="aqp-text">"{question || context.slice(0, 100) + (context.length > 100 ? '...' : '')}"</div>
    </div>
  </div>

  <div class="section-title">🎯 为你推荐以下占卜方式</div>

  <div class="recommend-list">
    {#each recommendationResult.recommendedSpreads as rec}
      {@const meta = getSpreadMeta(rec)}
      {@const unlocked = isSpreadUnlocked(rec)}
      <div
        class="recommend-card {rec.rank === 1 ? 'top-pick' : ''} {!unlocked ? 'locked' : ''}"
        style="--theme-color: {meta.color}; --theme-glow: {meta.color}33"
        on:click={() => selectSpreadRecommendation(rec)}
      >
        {#if rec.rank === 1}
          <div class="top-badge">⭐ 最佳推荐</div>
        {/if}
        {#if !unlocked}
          <div class="lock-overlay">
            <div class="lock-icon">🔒</div>
            <div class="lock-text">前往命运商店解锁</div>
          </div>
        {/if}
        <div class="rec-rank" style="color: {meta.color}">#{rec.rank}</div>
        <div class="rec-header">
          <div class="rec-icon">{meta.icon}</div>
          <div class="rec-info">
            <div class="rec-name" style="color: {meta.color}">{meta.name}</div>
            <div class="rec-count">{meta.cardCount} 张牌 · {meta.positions.length} 个维度</div>
          </div>
          <div class="rec-confidence" style="color: {meta.color}">
            {Math.round(rec.confidence * 100)}% 匹配
          </div>
        </div>
        <div class="rec-positions">
          {#each meta.positions as pos, i}
            <span class="pos-chip">{i + 1}. {pos}</span>
          {/each}
        </div>
        <div class="rec-reason">💡 {rec.reason}</div>
      </div>
    {/each}
  </div>

{:else if step === 'confirm'}
  <div class="nav-header">
    <button class="btn icon-btn" on:click={backToRecommendation}>←</button>
    <div class="nav-title" style="color: {selectedSpreadMeta.color}">
      {selectedSpreadMeta.icon} {selectedSpreadMeta.name}
    </div>
  </div>

  <div class="confirm-card" style="--theme-color: {selectedSpreadMeta.color}; --theme-glow: {selectedSpreadMeta.color}33">
    <div class="confirm-header">
      <div class="confirm-icon">{selectedSpreadMeta.icon}</div>
      <div class="confirm-info">
        <div class="confirm-theme">{selectedSpreadMeta.name}占卜</div>
        <div class="confirm-spread">{selectedSpreadMeta.cardCount} 张牌 · {selectedSpreadMeta.positions.length} 维度深度解析</div>
      </div>
    </div>

    <div class="question-preview-block">
      <div class="preview-icon">📝</div>
      <div class="preview-content">
        <div class="preview-row">
          <span class="preview-label">核心问题：</span>
          <span class="preview-text">{question || '(未填写)'}</span>
        </div>
        {#if context}
          <div class="preview-row">
            <span class="preview-label">背景描述：</span>
            <span class="preview-text">{context}</span>
          </div>
        {/if}
        <div class="preview-row">
          <span class="preview-label">紧急程度：</span>
          <span class="preview-text" style="color: {selectedUrgency.color}">
            {selectedUrgency.icon} {selectedUrgency.name}
          </span>
        </div>
      </div>
    </div>

    <div class="spread-preview">
      <div class="preview-title">牌阵位置说明：</div>
      <div class="preview-positions">
        {#each selectedSpreadMeta.positions as pos, i}
          <div class="preview-position">
            <div class="preview-number">{i + 1}</div>
            <div class="preview-label">{pos}</div>
          </div>
        {/each}
      </div>
    </div>

    <button
      class="btn btn-primary btn-block start-btn"
      style="--theme-color: {selectedSpreadMeta.color}"
      on:click={startDivination}
      disabled={isAnimating}
    >
      {#if isAnimating}
        <span class="loading">🔮 正在连接命运数据流...</span>
      {:else}
        🔮 开启问题占卜之旅
      {/if}
    </button>
  </div>
{/if}

{#if showResult && drawResults}
  <ResultModal
    results={drawResults}
    spreadType={selectedSpreadMeta.type === 'multi-spread' ? 'multi-spread' : 'theme'}
    spreadConfig={selectedSpreadMeta.spread}
    customTitle={`◆ ${selectedSpreadMeta.icon} ${selectedSpreadMeta.name} ◆`}
    question={question}
    questionContext={{
      question,
      context,
      urgency: selectedUrgency,
      category: recommendationResult.category.category
    }}
    recordId={currentRecordId}
    recordType="question-driven"
    onClose={handleCloseResult}
    onDrawAgain={handleDrawAgain}
  />
{/if}

<style>
  .flow-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px;
    background: var(--bg-card);
    border-radius: 12px;
    border: 1px solid var(--border-glow);
    margin-bottom: 20px;
  }

  .flow-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    opacity: 0.4;
    transition: all 0.3s ease;
  }

  .flow-step.active {
    opacity: 1;
    transform: scale(1.05);
  }

  .flow-step.done {
    opacity: 0.8;
  }

  .flow-step.done .flow-num {
    background: var(--accent-green, #69f0ae);
    color: var(--bg-primary);
  }

  .flow-num {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--bg-secondary);
    border: 2px solid var(--accent-cyan);
    color: var(--accent-cyan);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: bold;
  }

  .flow-step.active .flow-num {
    background: var(--accent-cyan);
    color: var(--bg-primary);
    box-shadow: 0 0 15px var(--accent-cyan);
  }

  .flow-label {
    font-size: 10px;
    font-family: var(--font-mono);
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .flow-line {
    flex: 1;
    max-width: 40px;
    height: 2px;
    background: linear-gradient(90deg, var(--accent-cyan), var(--accent-magenta));
    opacity: 0.3;
  }

  .question-card {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 20px;
  }

  .field-section {
    margin-bottom: 20px;
  }

  .field-label {
    display: block;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 8px;
    letter-spacing: 0.5px;
  }

  .required {
    color: var(--accent-red);
    margin-right: 4px;
  }

  .optional {
    color: var(--text-dim);
    font-size: 11px;
  }

  .question-input,
  .context-input {
    width: 100%;
    padding: 12px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    color: var(--text-primary);
    font-family: var(--font-body);
    font-size: 14px;
    resize: vertical;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .question-input {
    min-height: 80px;
  }

  .context-input {
    min-height: 100px;
  }

  .question-input:focus,
  .context-input:focus {
    outline: none;
    border-color: var(--accent-cyan);
    box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
  }

  .char-count {
    text-align: right;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
    margin-top: 4px;
  }

  .urgency-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  @media (max-width: 480px) {
    .urgency-grid {
      grid-template-columns: 1fr;
    }
  }

  .urgency-card {
    background: var(--bg-secondary);
    border: 2px solid transparent;
    border-radius: 10px;
    padding: 14px 10px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .urgency-card:hover {
    border-color: var(--urgency-color);
    transform: translateY(-2px);
  }

  .urgency-card.selected {
    border-color: var(--urgency-color);
    background: color-mix(in srgb, var(--urgency-color) 15%, var(--bg-secondary));
    box-shadow: 0 0 15px color-mix(in srgb, var(--urgency-color) 30%, transparent);
  }

  .urgency-icon {
    font-size: 28px;
    margin-bottom: 6px;
  }

  .urgency-name {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--urgency-color);
    margin-bottom: 4px;
    letter-spacing: 0.5px;
  }

  .urgency-desc {
    font-size: 10px;
    color: var(--text-dim);
    line-height: 1.4;
  }

  .quick-tags {
    margin-bottom: 20px;
    padding: 14px;
    background: var(--bg-secondary);
    border-radius: 8px;
  }

  .tags-label {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-secondary);
    margin-bottom: 10px;
  }

  .tags-list {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .tag-chip {
    padding: 5px 12px;
    border: 1px solid;
    border-radius: 20px;
    font-family: var(--font-mono);
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: rgba(0,0,0,0.2);
  }

  .tag-chip:hover {
    transform: scale(1.05);
    background: currentColor;
    color: var(--bg-primary) !important;
  }

  .submit-btn {
    font-size: 14px;
    padding: 14px;
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .nav-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  .nav-title {
    flex: 1;
    font-family: var(--font-mono);
    font-size: 16px;
    letter-spacing: 1px;
    text-shadow: 0 0 10px currentColor;
    color: var(--text-primary);
  }

  .analysis-card {
    background: linear-gradient(135deg, var(--bg-card), rgba(0, 229, 255, 0.05));
    border: 1px solid var(--accent-cyan);
    border-radius: 12px;
    padding: 18px;
    margin-bottom: 20px;
    box-shadow: 0 0 20px rgba(0, 229, 255, 0.1);
  }

  .analysis-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 12px;
  }

  .analysis-category {
    font-family: var(--font-mono);
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 1px;
    text-shadow: 0 0 10px currentColor;
  }

  .analysis-confidence {
    flex: 1;
    max-width: 180px;
  }

  .confidence-label {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
    margin-bottom: 4px;
  }

  .confidence-bar {
    height: 6px;
    background: var(--bg-secondary);
    border-radius: 3px;
    overflow: hidden;
  }

  .confidence-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s ease;
  }

  .confidence-value {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-secondary);
    margin-top: 4px;
    text-align: right;
  }

  .analysis-summary {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.6;
    padding: 10px 12px;
    background: var(--bg-secondary);
    border-radius: 6px;
    margin-bottom: 12px;
  }

  .analysis-question-preview {
    display: flex;
    gap: 10px;
    padding: 10px 12px;
    background: rgba(224, 64, 251, 0.08);
    border-left: 3px solid var(--accent-magenta);
    border-radius: 0 6px 6px 0;
  }

  .aqp-label {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--accent-magenta);
    flex-shrink: 0;
  }

  .aqp-text {
    font-size: 12px;
    color: var(--text-primary);
    font-style: italic;
    line-height: 1.5;
  }

  .recommend-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 20px;
  }

  .recommend-card {
    position: relative;
    background: var(--bg-card);
    border: 1px solid var(--theme-glow);
    border-radius: 12px;
    padding: 18px;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .recommend-card:hover {
    transform: translateY(-3px);
    border-color: var(--theme-color);
    box-shadow: 0 8px 25px var(--theme-glow);
  }

  .recommend-card.top-pick {
    border: 2px solid var(--theme-color);
    background: linear-gradient(135deg, var(--theme-glow), var(--bg-card));
  }

  .recommend-card.locked {
    opacity: 0.85;
  }

  .top-badge {
    position: absolute;
    top: 0;
    right: 20px;
    padding: 4px 12px;
    background: var(--theme-color);
    color: var(--bg-primary);
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: bold;
    border-radius: 0 0 8px 8px;
    letter-spacing: 0.5px;
  }

  .lock-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(2px);
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border-radius: 12px;
  }

  .lock-icon {
    font-size: 32px;
  }

  .lock-text {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--accent-yellow);
  }

  .rec-rank {
    font-family: var(--font-mono);
    font-size: 20px;
    font-weight: bold;
    opacity: 0.3;
    position: absolute;
    top: 14px;
    left: 16px;
  }

  .rec-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 14px;
    padding-left: 40px;
  }

  .rec-icon {
    font-size: 38px;
    filter: drop-shadow(0 0 8px var(--theme-color));
    animation: float 3s ease-in-out infinite;
  }

  .rec-info {
    flex: 1;
  }

  .rec-name {
    font-family: var(--font-mono);
    font-size: 17px;
    font-weight: bold;
    letter-spacing: 1px;
    margin-bottom: 4px;
  }

  .rec-count {
    font-size: 11px;
    color: var(--text-dim);
    font-family: var(--font-mono);
  }

  .rec-confidence {
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: bold;
    padding: 4px 10px;
    background: var(--theme-glow);
    border-radius: 20px;
  }

  .rec-positions {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 12px;
    padding-left: 40px;
  }

  .pos-chip {
    padding: 3px 10px;
    background: var(--bg-secondary);
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-secondary);
  }

  .rec-reason {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.5;
    padding: 10px 12px;
    background: var(--theme-glow);
    border-radius: 6px;
    padding-left: 52px;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }

  .confirm-card {
    background: var(--bg-card);
    border: 1px solid var(--theme-glow);
    border-radius: 12px;
    padding: 20px;
    animation: fade-in 0.4s ease;
  }

  .confirm-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 18px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--theme-glow);
  }

  .confirm-icon {
    font-size: 48px;
    filter: drop-shadow(0 0 10px var(--theme-color));
  }

  .confirm-theme {
    font-family: var(--font-mono);
    font-size: 18px;
    color: var(--theme-color);
    letter-spacing: 2px;
    text-shadow: 0 0 10px var(--theme-color);
    margin-bottom: 4px;
  }

  .confirm-spread {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .question-preview-block {
    display: flex;
    gap: 12px;
    padding: 14px;
    background: var(--bg-secondary);
    border-radius: 8px;
    margin-bottom: 18px;
  }

  .preview-icon {
    font-size: 24px;
    flex-shrink: 0;
  }

  .preview-content {
    flex: 1;
  }

  .preview-row {
    display: flex;
    gap: 8px;
    margin-bottom: 6px;
    font-size: 12px;
    line-height: 1.5;
  }

  .preview-row:last-child {
    margin-bottom: 0;
  }

  .preview-label {
    font-family: var(--font-mono);
    color: var(--text-dim);
    flex-shrink: 0;
  }

  .preview-text {
    color: var(--text-primary);
    flex: 1;
  }

  .spread-preview {
    margin-bottom: 20px;
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: 8px;
  }

  .preview-title {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 12px;
    letter-spacing: 1px;
  }

  .preview-positions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .preview-position {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--theme-glow);
    border-radius: 8px;
  }

  .preview-number {
    width: 22px;
    height: 22px;
    background: var(--theme-color);
    color: var(--bg-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: bold;
    flex-shrink: 0;
  }

  .preview-label {
    font-size: 12px;
    color: var(--theme-color);
    font-family: var(--font-mono);
    margin: 0;
  }

  .start-btn {
    border-color: var(--theme-color) !important;
    color: var(--theme-color) !important;
  }

  .start-btn:hover {
    background: var(--theme-glow) !important;
    box-shadow: 0 0 20px var(--theme-glow) !important;
  }

  .start-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .loading {
    display: inline-block;
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .history-link {
    text-align: center;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--accent-cyan);
    cursor: pointer;
    padding: 16px;
    margin-top: 12px;
    transition: all 0.2s ease;
  }

  .history-link:hover {
    text-shadow: 0 0 10px var(--accent-cyan);
  }

  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
