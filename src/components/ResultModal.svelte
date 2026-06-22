<script>
  import { onMount } from 'svelte'
  import CardDisplay from './CardDisplay.svelte'
  import { RARITY_CONFIG, THEME_CONFIG, MULTI_SPREAD_CONFIG } from '../data/constants.js'
  import ShareModal from './ShareModal.svelte'
  import { Storage } from '../utils/storage.js'
  import { getCardById } from '../utils/cardSystem.js'

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
  export let existingNote = null
  export let sourceRecord = null
  export let onOpenRelated = null

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
  $: canAddNote = !!recordId && !!recordType

  let modalTitle = ''
  let showShareModal = false
  let showInterpretation = recordType === 'question-driven' || !!existingInterpretation
  let userInterpretation = existingInterpretation || ''
  let interpretationSaved = !!existingInterpretation
  let isSavingInterpretation = false

  let showNoteSection = true
  let userNote = existingNote || ''
  let noteSaved = !!existingNote
  let isSavingNote = false

  let relatedRecords = []
  let loadingRelated = false

  onMount(() => {
    if (sourceRecord && recordType) {
      loadRelatedRecords()
    }
  })

  function loadRelatedRecords() {
    if (!sourceRecord) return
    loadingRelated = true
    setTimeout(() => {
      relatedRecords = Storage.findRelatedRecords(sourceRecord, recordType, 4)
      loadingRelated = false
    }, 200)
  }

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

  function goToQuestionDriven() {
    const q = questionContext?.question || question || ''
    const c = questionContext?.context || ''
    const event = new CustomEvent('navigate', {
      detail: {
        page: 'question-driven',
        params: {
          prefillQuestion: q,
          prefillContext: c,
          fromRecord: recordId,
          fromType: recordType
        }
      }
    })
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

  async function saveNote() {
    if (isSavingNote) return
    if (!canAddNote || !userNote.trim()) return

    isSavingNote = true
    await new Promise(r => setTimeout(r, 300))

    const success = Storage.updateRecordNote(recordType, recordId, userNote.trim())
    if (success) {
      noteSaved = true
      setTimeout(() => { noteSaved = false }, 2000)
    }
    isSavingNote = false
  }

  function openRelated(rec) {
    if (onOpenRelated) {
      onOpenRelated(rec)
    } else {
      const event = new CustomEvent('navigate', {
        detail: {
          page: 'history',
          params: { openRecordId: rec.id, openRecordType: rec._type }
        }
      })
      window.dispatchEvent(event)
      onClose()
    }
  }

  function getRelatedCardSymbol(rec) {
    try {
      if (rec.cards && rec.cards.length > 0) {
        const card = getCardById(rec.cards[0].cardId)
        return card?.symbol || '🎴'
      } else if (rec.cardId) {
        const card = getCardById(rec.cardId)
        return card?.symbol || '🎴'
      }
    } catch (e) {}
    return '🎴'
  }

  function getRelatedTitle(rec) {
    if (rec.questionContext?.question) {
      return rec.questionContext.question
    }
    if (rec.question) return rec.question
    if (rec.spreadMeta?.name) return rec.spreadMeta.name
    if (rec.spreadId) {
      return MULTI_SPREAD_CONFIG[rec.spreadId]?.name || `${rec.cards?.length || 1}牌阵`
    }
    if (rec.theme) {
      return THEME_CONFIG[rec.theme]?.name || '主题占卜'
    }
    return '占卜记录'
  }

  function getRelatedTime(ts) {
    const diff = Date.now() - ts
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    const d = new Date(ts)
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }

  function getTypeBadge(t) {
    const map = {
      'divination': { label: '占卜', color: '#00e5ff', icon: '🎴' },
      'daily': { label: '日签', color: '#ffd54f', icon: '🎐' },
      'theme': { label: '主题', color: '#e040fb', icon: '🔮' },
      'spread': { label: '牌阵', color: '#69f0ae', icon: '✚' },
      'question-driven': { label: '问题', color: '#ff80ab', icon: '💬' }
    }
    return map[t] || { label: t, color: '#888', icon: '📜' }
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
    <div class="modal-header">
      <h2 class="modal-title">{modalTitle}</h2>
      <button class="close-btn" on:click={onClose} title="关闭">✕</button>
    </div>

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
            {#if result.pityInfo?.triggered}
              <div 
                class="pity-badge pity-{result.pityInfo.type || 'soft'}"
                title="保底触发">
                🛡️ {result.pityInfo.type === 'hard' ? '硬保底' : '软保底'}
                {#if result.pityInfo.pityCount}
                  ({result.pityInfo.pityCount}抽)
                {/if}
              </div>
            {/if}
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

    <div class="action-row-quick">
      <button class="btn-quick" on:click={goToQuestionDriven} title="基于此问题再次解读">
        <span class="q-icon">🔄</span>
        <div class="q-text">
          <div class="q-title">再次解读</div>
          <div class="q-desc">换个牌阵重新看看</div>
        </div>
      </button>
      <button class="btn-quick btn-quick-magenta" on:click={goToReview} title="查看历史复盘">
        <span class="q-icon">📊</span>
        <div class="q-text">
          <div class="q-title">数据复盘</div>
          <div class="q-desc">查看趋势统计</div>
        </div>
      </button>
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

    {#if showNoteSection}
      <div class="note-section {canAddNote ? '' : 'note-disabled'}">
        <div class="note-header">
          <span class="note-icon">🗒️</span>
          <span class="note-title">问题备注</span>
          <span class="note-hint">记录当前状态、后续行动要点</span>
        </div>
        <textarea
          class="note-input"
          bind:value={userNote}
          placeholder={canAddNote ? "记录重要信息：比如当下的情绪、后续要做的事情、关键时间节点..." : "保存记录后可添加备注"}
          maxlength="800"
          disabled={!canAddNote}
        />
        <div class="note-footer">
          <span class="char-count">{userNote.length}/800</span>
          <button
            class="btn btn-primary note-save-btn"
            on:click={saveNote}
            disabled={!canAddNote || !userNote.trim() || isSavingNote}
          >
            {#if noteSaved}
              ✅ 已保存
            {:else if isSavingNote}
              <span class="loading">保存中...</span>
            {:else}
              💾 保存备注
            {/if}
          </button>
        </div>
      </div>
    {/if}

    {#if relatedRecords.length > 0 || loadingRelated}
      <div class="related-section">
        <div class="related-header">
          <span class="related-icon">🔗</span>
          <span class="related-title">关联历史推荐</span>
          <span class="related-hint">相似的过去，帮助你看清现在</span>
        </div>
        {#if loadingRelated}
          <div class="related-loading">
            <div class="loading-dots">
              <span></span><span></span><span></span>
            </div>
            <span class="loading-text">正在发现关联记录...</span>
          </div>
        {:else}
          <div class="related-list">
            {#each relatedRecords as rec}
              {@const typeInfo = getTypeBadge(rec._type)}
              <div class="related-item" on:click={() => openRelated(rec)}>
                <div class="related-symbol" style="color: {typeInfo.color}">
                  {getRelatedCardSymbol(rec)}
                </div>
                <div class="related-info">
                  <div class="related-title-text">
                    {#if rec._matchReasons && rec._matchReasons.length > 0}
                      <span class="match-tags">
                        {#each rec._matchReasons as reason}
                          <span class="match-tag">{reason}</span>
                        {/each}
                      </span>
                    {/if}
                    {getRelatedTitle(rec)}
                  </div>
                  <div class="related-meta">
                    <span 
                      class="type-badge"
                      style="background: {typeInfo.color + '22'}; color: {typeInfo.color}"
                    >
                      {typeInfo.icon} {typeInfo.label}
                    </span>
                    <span class="related-time">{getRelatedTime(rec.timestamp || 0)}</span>
                  </div>
                </div>
                <div class="related-arrow">›</div>
              </div>
            {/each}
          </div>
        {/if}
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
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    position: relative;
  }

  .close-btn {
    position: absolute;
    right: -8px;
    top: -8px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid var(--border-glow);
    background: var(--bg-card);
    color: var(--text-dim);
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 10;
  }

  .close-btn:hover {
    border-color: var(--accent-red);
    color: var(--accent-red);
    transform: scale(1.1);
  }

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

  .action-row-quick {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 20px;
  }

  .btn-quick {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: linear-gradient(135deg, rgba(0, 229, 255, 0.08), rgba(0, 229, 255, 0.02));
    border: 1px solid rgba(0, 229, 255, 0.3);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.25s ease;
    text-align: left;
    font-family: inherit;
  }

  .btn-quick:hover {
    border-color: var(--accent-cyan);
    background: linear-gradient(135deg, rgba(0, 229, 255, 0.15), rgba(0, 229, 255, 0.05));
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 229, 255, 0.15);
  }

  .btn-quick-magenta {
    background: linear-gradient(135deg, rgba(224, 64, 251, 0.08), rgba(224, 64, 251, 0.02));
    border-color: rgba(224, 64, 251, 0.3);
  }

  .btn-quick-magenta:hover {
    border-color: var(--accent-magenta);
    background: linear-gradient(135deg, rgba(224, 64, 251, 0.15), rgba(224, 64, 251, 0.05));
    box-shadow: 0 4px 15px rgba(224, 64, 251, 0.15);
  }

  .q-icon {
    font-size: 24px;
    flex-shrink: 0;
  }

  .q-text {
    flex: 1;
    min-width: 0;
  }

  .q-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 2px;
    letter-spacing: 0.5px;
  }

  .q-desc {
    font-size: 10px;
    color: var(--text-dim);
    font-family: var(--font-mono);
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

  .note-section {
    background: linear-gradient(135deg, rgba(255, 171, 64, 0.06), rgba(255, 213, 79, 0.04));
    border: 1px solid rgba(255, 171, 64, 0.5);
    border-radius: 10px;
    padding: 14px 16px;
    margin-top: 16px;
    margin-bottom: 16px;
    transition: all 0.2s ease;
  }

  .note-section.note-disabled {
    opacity: 0.6;
    background: rgba(0, 0, 0, 0.2);
    border-color: var(--border-glow);
  }

  .note-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .note-icon {
    font-size: 18px;
  }

  .note-title {
    font-family: var(--font-mono);
    font-size: 13px;
    color: #ffab40;
    letter-spacing: 1px;
  }

  .note-section.note-disabled .note-title {
    color: var(--text-dim);
  }

  .note-hint {
    font-size: 10px;
    color: var(--text-dim);
    margin-left: auto;
    font-family: var(--font-mono);
  }

  .note-input {
    width: 100%;
    min-height: 80px;
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

  .note-input:focus:not(:disabled) {
    outline: none;
    border-color: #ffab40;
    box-shadow: 0 0 10px rgba(255, 171, 64, 0.25);
  }

  .note-input:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .note-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    gap: 10px;
  }

  .note-save-btn {
    padding: 8px 16px !important;
    font-size: 12px !important;
    min-width: 120px;
    background: linear-gradient(135deg, #ffab40, #ffd54f) !important;
    color: #1a1a2e !important;
  }

  .note-save-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .related-section {
    background: linear-gradient(135deg, rgba(105, 240, 174, 0.06), rgba(0, 229, 255, 0.04));
    border: 1px solid rgba(105, 240, 174, 0.4);
    border-radius: 10px;
    padding: 14px 16px;
    margin-top: 16px;
    margin-bottom: 16px;
  }

  .related-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }

  .related-icon {
    font-size: 18px;
  }

  .related-title {
    font-family: var(--font-mono);
    font-size: 13px;
    color: #69f0ae;
    letter-spacing: 1px;
  }

  .related-hint {
    font-size: 10px;
    color: var(--text-dim);
    margin-left: auto;
    font-family: var(--font-mono);
  }

  .related-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 20px;
  }

  .loading-dots {
    display: flex;
    gap: 4px;
  }

  .loading-dots span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #69f0ae;
    animation: dotBounce 1.4s ease-in-out infinite;
  }

  .loading-dots span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .loading-dots span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes dotBounce {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
  }

  .loading-text {
    font-size: 12px;
    color: var(--text-dim);
    font-family: var(--font-mono);
  }

  .related-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .related-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .related-item:hover {
    border-color: #69f0ae;
    background: rgba(105, 240, 174, 0.05);
    transform: translateX(4px);
  }

  .related-symbol {
    font-size: 20px;
    flex-shrink: 0;
    width: 28px;
    text-align: center;
  }

  .related-info {
    flex: 1;
    min-width: 0;
  }

  .related-title-text {
    font-size: 12px;
    color: var(--text-primary);
    line-height: 1.4;
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .match-tags {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-right: 6px;
  }

  .match-tag {
    display: inline;
    padding: 1px 6px;
    background: rgba(105, 240, 174, 0.15);
    color: #69f0ae;
    border-radius: 3px;
    font-family: var(--font-mono);
    font-size: 9px;
    margin-right: 4px;
  }

  .related-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .type-badge {
    padding: 2px 6px;
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 9px;
  }

  .related-time {
    font-size: 10px;
    color: var(--text-dim);
    font-family: var(--font-mono);
  }

  .related-arrow {
    font-size: 20px;
    color: var(--text-dim);
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }

  .related-item:hover .related-arrow {
    color: #69f0ae;
    transform: translateX(4px);
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

  .pity-badge {
    margin-top: 6px;
    padding: 3px 8px;
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 10px;
    text-align: center;
    animation: pityGlow 2s ease-in-out infinite;
  }

  .pity-badge.pity-soft {
    background: rgba(255, 207, 64, 0.15);
    border: 1px solid var(--accent-yellow);
    color: var(--accent-yellow);
  }

  .pity-badge.pity-hard {
    background: rgba(255, 71, 87, 0.15);
    border: 1px solid var(--accent-red);
    color: var(--accent-red);
  }

  @keyframes pityGlow {
    0%, 100% {
      box-shadow: 0 0 5px currentColor;
    }
    50% {
      box-shadow: 0 0 15px currentColor;
    }
  }
</style>
