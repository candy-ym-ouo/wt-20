<script>
  import CardDisplay from './CardDisplay.svelte'
  import { RARITY_CONFIG, THEME_CONFIG } from '../data/constants.js'
  import ShareModal from './ShareModal.svelte'
  import { Storage } from '../utils/storage.js'

  export let results
  export let spreadType
  export let onClose
  export let onDrawAgain
  export let customTitle = null
  export let spreadConfig = null
  export let question = null
  export let theme = null
  export let spreadName = null
  export let timestamp = Date.now()
  export let recordType = null
  export let consecutiveDays = null
  export let questionContext = null
  export let recordId = null
  export let existingInterpretation = null

  $: {
    if (customTitle) {
      modalTitle = customTitle
    } else if (spreadType === 'single' || results.length === 1) {
      modalTitle = '◆ 占 卜 结 果 ◆'
    } else {
      modalTitle = `◆ ${results.length} 牌 阵 结 果 ◆`
    }
  }

  $: isMultiSpread = spreadType === 'multi-spread' && spreadConfig

  let modalTitle = ''
  let showShareModal = false
  let showInterpretation = recordType === 'question-driven' || !!existingInterpretation
  let userInterpretation = existingInterpretation || ''
  let interpretationSaved = !!existingInterpretation
  let isSavingInterpretation = false

  function hasPosition(result) {
    return !!result.position
  }

  function getResultByPositionId(posId) {
    return results.find(r => r.positionId === posId)
  }

  function openShare() {
    showShareModal = true
  }

  function closeShare() {
    showShareModal = false
  }

  function goToReview() {
    const event = new CustomEvent('navigate', { detail: 'review' })
    window.dispatchEvent(event)
    onClose()
  }

  async function saveInterpretation() {
    if (isSavingInterpretation) return
    if (!recordId || !userInterpretation.trim()) return

    isSavingInterpretation = true
    await new Promise(r => setTimeout(r, 300))

    const success = Storage.updateQuestionDrivenRecordInterpretation(recordId, userInterpretation.trim())
    if (success) {
      interpretationSaved = true
      setTimeout(() => { interpretationSaved = false }, 2000)
    }
    isSavingInterpretation = false
  }

  $: derivedSpreadName = spreadName || (() => {
    if (spreadType === 'single' || results.length === 1) return '单张占卜'
    if (spreadType === 'three') return '三牌阵'
    if (theme) {
      const tc = THEME_CONFIG[theme]
      return tc?.spreadTypes?.find(s => s.id === spreadType)?.name || `${results.length}牌阵`
    }
    return `${results.length}牌阵`
  })()
</script>

<div class="modal-overlay" on:click|self={onClose}>
  <div class="modal-content">
    <h2 class="modal-title">{modalTitle}</h2>

    {#if questionContext}
      <div class="question-context-block">
        <div class="context-header">
          <span class="context-icon">📝</span>
          <span class="context-title">问题背景</span>
          {#if questionContext.category}
            <span
              class="context-category"
              style="color: {questionContext.category.color}"
            >
              {questionContext.category.icon} {questionContext.category.name}
            </span>
          {/if}
        </div>
        {#if questionContext.question}
          <div class="context-row">
            <span class="context-label">核心问题：</span>
            <span class="context-text">{questionContext.question}</span>
          </div>
        {/if}
        {#if questionContext.context}
          <div class="context-row">
            <span class="context-label">背景描述：</span>
            <span class="context-text">{questionContext.context}</span>
          </div>
        {/if}
        {#if questionContext.urgency}
          <div class="context-row">
            <span class="context-label">紧急程度：</span>
            <span class="context-text" style="color: {questionContext.urgency.color}">
              {questionContext.urgency.icon} {questionContext.urgency.name}
            </span>
          </div>
        {/if}
      </div>
    {:else if question}
      <div class="question-block">
        <span class="question-icon">❓</span>
        <span class="question-text">{question}</span>
      </div>
    {/if}

    {#if isMultiSpread}
      <div
        class="spread-result-layout layout-{spreadConfig.layout.type}"
        style="--spread-color: {spreadConfig.color};"
      >
        {#each spreadConfig.layout.positions as lp}
          {@const result = getResultByPositionId(lp.key)}
          {@const posConfig = spreadConfig.positions.find(p => p.id === lp.key)}
          <div
            class="spread-slot"
            style="grid-row: {lp.row + 1}; grid-column: {lp.col + 1};"
          >
            {#if result}
              <div class="slot-position-name mono">{posConfig?.name || lp.key}</div>
              <CardDisplay
                card={result.card}
                isReversed={result.isReversed}
                size="small"
              />
              <div class="mono slot-orientation">
                {result.isReversed ? '逆位' : '正位'}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {:else}
      <div class="result-cards">
        {#each results as result, i}
          <div class="result-card-wrapper">
            {#if hasPosition(result)}
              <div class="result-position mono">{result.position}</div>
            {/if}
            <CardDisplay
              card={result.card}
              isReversed={result.isReversed}
              size="small"
            />
            <div class="mono" style="font-size: 10px; color: var(--text-dim)">
              {result.isReversed ? '逆位' : '正位'}
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <div class="reading-content">
      {#each results as result, i}
        {#if hasPosition(result)}
          <div class="reading-position-label mono glow-magenta">
            ▸ {result.position}
          </div>
        {/if}

        <div class="reading-block">
          <div class="keywords">
            {#each result.card.keywords as kw}
              <span class="keyword">{kw}</span>
            {/each}
          </div>

          <h3 class="reading-title">{result.reading.title}</h3>
          <p class="reading-text">{result.reading.meaning}</p>
          <div class="reading-advice">
            💡 {result.reading.advice}
          </div>
          <div class="reading-fortune">{result.reading.fortune}</div>
        </div>
      {/each}
    </div>

    {#if showInterpretation}
      <div class="interpretation-section">
        <div class="interpretation-header">
          <span class="interpretation-icon">📖</span>
          <span class="interpretation-title">我的解读笔记</span>
          <span class="interpretation-hint">沉淀你的思考，下次回顾更有价值</span>
        </div>
        <textarea
          class="interpretation-input"
          bind:value={userInterpretation}
          placeholder="写下你对这次占卜的个人理解、感受、行动方案..."
          maxlength="500"
        />
        <div class="interpretation-footer">
          <span class="char-count">{userInterpretation.length}/500</span>
          <button
            class="btn btn-primary interpretation-save-btn"
            on:click={saveInterpretation}
            disabled={!userInterpretation.trim() || isSavingInterpretation || !recordId}
          >
            {#if interpretationSaved}
              ✅ 已保存
            {:else if isSavingInterpretation}
              <span class="loading">保存中...</span>
            {:else}
              💾 保存解读笔记
            {/if}
          </button>
        </div>
      </div>
    {/if}

    <div class="action-row-secondary">
      <button class="btn btn-block btn-yellow" on:click={openShare}>
        📤 分享结果
      </button>
      <button class="btn btn-block btn-magenta" on:click={goToReview}>
        📊 历史回顾
      </button>
    </div>

    <div class="action-row">
      <button class="btn btn-block" on:click={onClose}>关闭</button>
      <button class="btn btn-block btn-primary" on:click={onDrawAgain}>再次抽卡</button>
    </div>
  </div>
</div>

{#if showShareModal}
  <ShareModal
    {results}
    {theme}
    spreadName={derivedSpreadName}
    {question}
    {timestamp}
    {recordType}
    {consecutiveDays}
    onClose={closeShare}
    onGoToReview={goToReview}
  />
{/if}

<style>
  .question-context-block {
    background: linear-gradient(135deg, rgba(224, 64, 251, 0.08), rgba(0, 229, 255, 0.05));
    border: 1px solid var(--accent-magenta);
    border-radius: 10px;
    padding: 14px 16px;
    margin-bottom: 18px;
  }

  .context-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px dashed rgba(224, 64, 251, 0.3);
  }

  .context-icon {
    font-size: 18px;
  }

  .context-title {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--accent-magenta);
    letter-spacing: 1px;
    flex: 1;
  }

  .context-category {
    font-family: var(--font-mono);
    font-size: 11px;
    padding: 3px 10px;
    background: rgba(0,0,0,0.3);
    border-radius: 20px;
    border: 1px solid currentColor;
  }

  .context-row {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 12px;
    line-height: 1.6;
  }

  .context-row:last-child {
    margin-bottom: 0;
  }

  .context-label {
    font-family: var(--font-mono);
    color: var(--text-dim);
    flex-shrink: 0;
  }

  .context-text {
    color: var(--text-primary);
    flex: 1;
  }

  .question-block {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 16px;
    background: rgba(224, 64, 251, 0.08);
    border-left: 3px solid var(--accent-magenta);
    border-radius: 0 8px 8px 0;
    margin-bottom: 16px;
  }

  .question-icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  .question-text {
    font-size: 13px;
    color: var(--text-primary);
    line-height: 1.6;
    font-style: italic;
  }

  .interpretation-section {
    background: linear-gradient(135deg, rgba(0, 229, 255, 0.06), rgba(105, 240, 174, 0.04));
    border: 1px solid var(--accent-cyan);
    border-radius: 10px;
    padding: 14px 16px;
    margin-top: 20px;
    margin-bottom: 16px;
  }

  .interpretation-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .interpretation-icon {
    font-size: 18px;
  }

  .interpretation-title {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--accent-cyan);
    letter-spacing: 1px;
  }

  .interpretation-hint {
    font-size: 10px;
    color: var(--text-dim);
    margin-left: auto;
    font-family: var(--font-mono);
  }

  .interpretation-input {
    width: 100%;
    min-height: 90px;
    padding: 12px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    color: var(--text-primary);
    font-family: var(--font-body);
    font-size: 13px;
    resize: vertical;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .interpretation-input:focus {
    outline: none;
    border-color: var(--accent-cyan);
    box-shadow: 0 0 10px rgba(0, 229, 255, 0.25);
  }

  .interpretation-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    gap: 10px;
  }

  .char-count {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
  }

  .interpretation-save-btn {
    padding: 8px 16px !important;
    font-size: 12px !important;
    min-width: 140px;
  }

  .interpretation-save-btn:disabled {
    opacity: 0.5;
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

  .reading-position-label {
    font-size: 12px;
    letter-spacing: 2px;
    margin-bottom: 8px;
    padding-left: 4px;
  }
  .result-cards {
    animation: fade-in 0.5s ease;
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
    margin: 20px 0;
  }
  .spread-result-layout {
    animation: fade-in 0.5s ease;
    display: grid;
    gap: 10px;
    justify-content: center;
    align-items: center;
    padding: 20px 10px;
    margin: 20px 0;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    border: 1px solid var(--spread-color);
    box-shadow: 0 0 20px color-mix(in srgb, var(--spread-color) 20%, transparent);
  }
  .spread-result-layout.layout-cross {
    grid-template-columns: repeat(3, 80px);
    grid-template-rows: repeat(3, auto);
  }
  .spread-result-layout.layout-relationship {
    grid-template-columns: repeat(2, 90px);
    grid-template-rows: repeat(2, auto);
    gap: 16px;
  }
  .spread-result-layout.layout-decision {
    grid-template-columns: repeat(3, 80px);
    grid-template-rows: repeat(3, auto);
  }
  .spread-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .slot-position-name {
    font-size: 11px;
    color: var(--spread-color);
    letter-spacing: 0.5px;
    white-space: nowrap;
    text-shadow: 0 0 8px var(--spread-color);
  }
  .slot-orientation {
    font-size: 10px;
    color: var(--text-dim);
  }
  .reading-content {
    width: 100%;
    margin-top: 20px;
  }
  .reading-block {
    animation: fade-in 0.6s ease backwards;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
  }
  .reading-block:nth-child(2) { animation-delay: 0.1s; }
  .reading-block:nth-child(3) { animation-delay: 0.2s; }
  .reading-block:nth-child(4) { animation-delay: 0.3s; }
  .reading-block:nth-child(5) { animation-delay: 0.4s; }
  .keywords {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 8px;
    margin-bottom: 8px;
  }
  .keyword {
    background: rgba(224, 64, 251, 0.2);
    color: var(--accent-magenta);
    padding: 3px 10px;
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 11px;
  }
  .reading-title {
    font-family: var(--font-mono);
    font-size: 15px;
    color: var(--accent-cyan);
    margin-bottom: 10px;
    letter-spacing: 0.5px;
  }
  .reading-text {
    font-size: 14px;
    color: var(--text-primary);
    line-height: 1.8;
    margin-bottom: 10px;
  }
  .reading-advice {
    background: rgba(0, 229, 255, 0.08);
    border-left: 3px solid var(--accent-cyan);
    padding: 10px 14px;
    margin-top: 10px;
    font-size: 13px;
    color: var(--accent-cyan);
    line-height: 1.7;
    border-radius: 0 4px 4px 0;
  }
  .reading-fortune {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--accent-yellow);
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed var(--border-glow);
  }

  .action-row-secondary {
    display: flex;
    gap: 10px;
    margin-top: 16px;
  }

  .action-row-secondary .btn {
    flex: 1;
    font-size: 12px;
    padding: 10px 16px;
  }
</style>
