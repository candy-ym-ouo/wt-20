<script>
  import { onMount } from 'svelte'
  import ShareCard from './ShareCard.svelte'
  import { Storage } from '../utils/storage.js'
  import {
    generateSummaryText,
    generateShortShareText,
    generateOverallInsight,
    copyToClipboard,
    formatTimestamp
  } from '../utils/shareSystem.js'

  export let results
  export let theme = null
  export let spreadName = null
  export let question = null
  export let timestamp = Date.now()
  export let recordType = null
  export let consecutiveDays = null
  export let onClose
  export let onGoToReview = null

  let activeTab = 'card'
  let copyStatus = ''
  let shareType = 'summary'

  $: summaryText = generateSummaryText(results, {
    theme,
    spreadName,
    question,
    timestamp,
    shareType
  })

  $: shortText = generateShortShareText(results, {
    theme,
    question,
    timestamp
  })

  $: overallInsight = generateOverallInsight(results)

  function handleCopy(text, type) {
    copyToClipboard(text)
      .then(() => {
        copyStatus = type
        Storage.addShareRecord({
          type: 'copy_' + type,
          shareData: { results, theme, spreadName, question, timestamp, recordType }
        })
        setTimeout(() => { copyStatus = '' }, 2000)
      })
      .catch(() => {
        copyStatus = 'error'
        setTimeout(() => { copyStatus = '' }, 2000)
      })
  }

  function handleGoToReview() {
    if (onGoToReview) {
      onGoToReview()
    }
    if (onClose) onClose()
  }

  function handleShareImage() {
    Storage.addShareRecord({
      type: 'image',
      shareData: { results, theme, spreadName, question, timestamp, recordType }
    })
    copyStatus = 'image'
    setTimeout(() => { copyStatus = '' }, 2000)
  }

  const TAB_OPTIONS = [
    { id: 'card', icon: '🎴', label: '可视化卡片' },
    { id: 'summary', icon: '📝', label: '摘要文案' },
    { id: 'insight', icon: '✨', label: '整体启示' }
  ]

  const TEXT_TYPES = [
    { id: 'summary', label: '精简版', desc: '适合快速分享' },
    { id: 'detailed', label: '详细版', desc: '包含完整解读' }
  ]

  function getCopyBtnClass(type) {
    return copyStatus === type ? 'btn btn-success' : 'btn'
  }

  function getCopyBtnText(type, text) {
    if (copyStatus === type) return '✓ 已复制!'
    if (copyStatus === 'error') return '✗ 复制失败'
    return text
  }
</script>

<div class="modal-overlay" on:click|self={onClose}>
  <div class="modal-content share-modal">
    <div class="share-header">
      <h2 class="modal-title">◆ 分 享 占 卜 结 果 ◆</h2>
      <button class="close-btn" on:click={onClose}>✕</button>
    </div>

    <div class="share-tabs">
      {#each TAB_OPTIONS as tab}
        <div
          class="share-tab {activeTab === tab.id ? 'active' : ''}"
          on:click={() => (activeTab = tab.id)}
        >
          <span class="tab-icon">{tab.icon}</span>
          <span class="tab-label">{tab.label}</span>
        </div>
      {/each}
    </div>

    {#if activeTab === 'card'}
      <div class="card-section">
        <div class="card-wrapper">
          <ShareCard
            {results}
            {theme}
            {spreadName}
            {question}
            {timestamp}
            {recordType}
            {consecutiveDays}
          />
        </div>

        <div class="share-actions">
          <button class="btn btn-primary btn-block" on:click={handleShareImage}>
            {copyStatus === 'image' ? '✓ 已生成' : '📸 保存为图片'}
          </button>
        </div>

        <div class="share-hint mono">
          💡 提示：长按或右键卡片可保存图片
        </div>
      </div>

    {:else if activeTab === 'summary'}
      <div class="summary-section">
        <div class="text-type-selector">
          {#each TEXT_TYPES as type}
            <div
              class="type-option {shareType === type.id ? 'active' : ''}"
              on:click={() => (shareType = type.id)}
            >
              <div class="type-label">{type.label}</div>
              <div class="type-desc">{type.desc}</div>
            </div>
          {/each}
        </div>

        <div class="text-preview-wrapper">
          <div class="text-preview-header mono">
            📋 文案预览
          </div>
          <pre class="text-preview">{summaryText}</pre>
        </div>

        <div class="copy-actions">
          <button
            class={getCopyBtnClass('summary')}
            on:click={() => handleCopy(summaryText, 'summary')}
          >
            {getCopyBtnText('summary', '📋 复制完整文案')}
          </button>
          <button
            class={getCopyBtnClass('short')}
            on:click={() => handleCopy(shortText, 'short')}
          >
            {getCopyBtnText('short', '📱 复制社交短文案')}
          </button>
        </div>
      </div>

    {:else if activeTab === 'insight'}
      <div class="insight-section">
        <div class="insight-meta-card">
          <div class="meta-row">
            <span class="meta-key">📅 占卜时间</span>
            <span class="meta-value mono">{formatTimestamp(timestamp)}</span>
          </div>
          {#if spreadName}
            <div class="meta-row">
              <span class="meta-key">🎴 牌阵类型</span>
              <span class="meta-value">{spreadName}</span>
            </div>
          {/if}
          {#if question}
            <div class="meta-row">
              <span class="meta-key">💭 你的问题</span>
              <span class="meta-value">{question}</span>
            </div>
          {/if}
          <div class="meta-row">
            <span class="meta-key">🎴 抽卡数量</span>
            <span class="meta-value">{results.length} 张</span>
          </div>
        </div>

        {#if overallInsight}
          <div class="insight-content">
            <div class="insight-title glow-magenta">
              ✨ 整体启示
            </div>
            <div class="insight-text">
              {#each overallInsight.split('\n\n') as paragraph}
                <p>{paragraph}</p>
              {/each}
            </div>
          </div>
        {/if}

        <div class="quick-cards">
          <div class="quick-cards-title mono">🎴 抽到的卡牌</div>
          <div class="quick-cards-list">
            {#each results as result, i}
              <div class="quick-card-item">
                <span class="qc-index mono">{i + 1}</span>
                <span class="qc-symbol">{result.card.symbol}</span>
                <span class="qc-name">{result.card.name}</span>
                <span class="qc-orientation {result.isReversed ? 'rev' : 'up'}">
                  {result.isReversed ? '逆' : '正'}
                </span>
              </div>
            {/each}
          </div>
        </div>

        <div class="share-actions">
          {#if onGoToReview}
            <button class="btn btn-primary btn-block" on:click={handleGoToReview}>
              📊 查看历史回顾
            </button>
          {/if}
        </div>
      </div>
    {/if}

    <div class="action-row share-footer">
      <button class="btn btn-block" on:click={onClose}>关闭</button>
    </div>
  </div>
</div>

<style>
  .share-modal {
    max-width: 480px;
    padding: 0;
    overflow: hidden;
  }

  .share-header {
    position: relative;
    padding: 20px 20px 12px;
    background: linear-gradient(135deg, rgba(224, 64, 251, 0.1), rgba(0, 229, 255, 0.1));
    border-bottom: 1px solid var(--border-glow);
  }

  .share-header .modal-title {
    margin: 0;
    font-size: 17px;
  }

  .close-btn {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 32px;
    height: 32px;
    background: transparent;
    border: 1px solid var(--text-dim);
    color: var(--text-dim);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.2s;
  }

  .close-btn:hover {
    border-color: var(--accent-red);
    color: var(--accent-red);
  }

  .share-tabs {
    display: flex;
    gap: 0;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-glow);
  }

  .share-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px 8px;
    cursor: pointer;
    color: var(--text-dim);
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }

  .share-tab:hover {
    color: var(--text-secondary);
    background: rgba(0, 0, 0, 0.2);
  }

  .share-tab.active {
    color: var(--accent-cyan);
    border-bottom-color: var(--accent-cyan);
    background: rgba(0, 229, 255, 0.05);
  }

  .tab-icon {
    font-size: 20px;
  }

  .tab-label {
    font-size: 11px;
    font-family: var(--font-mono);
    letter-spacing: 0.5px;
  }

  .card-section,
  .summary-section,
  .insight-section {
    padding: 20px;
    max-height: 60vh;
    overflow-y: auto;
  }

  .card-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

  .text-type-selector {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 16px;
  }

  .type-option {
    padding: 12px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }

  .type-option:hover {
    border-color: var(--accent-cyan);
  }

  .type-option.active {
    background: rgba(0, 229, 255, 0.1);
    border-color: var(--accent-cyan);
    box-shadow: 0 0 15px rgba(0, 229, 255, 0.2);
  }

  .type-label {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--accent-cyan);
    margin-bottom: 4px;
  }

  .type-desc {
    font-size: 11px;
    color: var(--text-dim);
  }

  .text-preview-wrapper {
    margin-bottom: 16px;
  }

  .text-preview-header {
    font-size: 12px;
    color: var(--accent-magenta);
    margin-bottom: 8px;
    padding-left: 8px;
    border-left: 3px solid var(--accent-magenta);
  }

  .text-preview {
    background: var(--bg-secondary);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    padding: 14px;
    font-family: var(--font-mono);
    font-size: 12px;
    line-height: 1.8;
    color: var(--text-primary);
    white-space: pre-wrap;
    max-height: 200px;
    overflow-y: auto;
    user-select: text;
  }

  .copy-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .copy-actions .btn {
    width: 100%;
  }

  .btn-success {
    border-color: var(--accent-green);
    color: var(--accent-green);
    background: rgba(105, 240, 174, 0.15);
  }

  .insight-meta-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-glow);
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 16px;
  }

  .meta-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 6px 0;
    gap: 12px;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
  }

  .meta-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .meta-row:first-child {
    padding-top: 0;
  }

  .meta-key {
    font-size: 12px;
    color: var(--text-dim);
    flex-shrink: 0;
  }

  .meta-value {
    font-size: 12px;
    color: var(--text-primary);
    text-align: right;
    max-width: 65%;
    word-break: break-word;
  }

  .insight-content {
    background: linear-gradient(135deg, rgba(224, 64, 251, 0.08), rgba(0, 229, 255, 0.08));
    border: 1px solid var(--accent-magenta);
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 16px;
  }

  .insight-title {
    font-family: var(--font-mono);
    font-size: 14px;
    margin-bottom: 12px;
    text-align: center;
    letter-spacing: 1px;
  }

  .insight-text {
    font-size: 13px;
    line-height: 1.9;
    color: var(--text-primary);
  }

  .insight-text p {
    margin-bottom: 12px;
  }

  .insight-text p:last-child {
    margin-bottom: 0;
  }

  .quick-cards {
    background: var(--bg-secondary);
    border: 1px solid var(--border-glow);
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 16px;
  }

  .quick-cards-title {
    font-size: 12px;
    color: var(--accent-yellow);
    margin-bottom: 10px;
  }

  .quick-cards-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .quick-card-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
  }

  .qc-index {
    width: 20px;
    height: 20px;
    background: var(--accent-cyan);
    color: var(--bg-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: bold;
    flex-shrink: 0;
  }

  .qc-symbol {
    font-size: 18px;
    flex-shrink: 0;
  }

  .qc-name {
    flex: 1;
    font-size: 12px;
    color: var(--text-primary);
  }

  .qc-orientation {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: bold;
    flex-shrink: 0;
  }

  .qc-orientation.up {
    background: rgba(0, 229, 255, 0.2);
    color: var(--accent-cyan);
  }

  .qc-orientation.rev {
    background: rgba(255, 82, 82, 0.2);
    color: var(--accent-red);
  }

  .share-actions {
    margin-bottom: 8px;
  }

  .share-hint {
    text-align: center;
    font-size: 11px;
    color: var(--text-dim);
    padding: 8px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
  }

  .share-footer {
    padding: 16px 20px 20px;
    border-top: 1px solid var(--border-glow);
    background: var(--bg-secondary);
    margin-top: 0;
  }

  .card-section::-webkit-scrollbar,
  .summary-section::-webkit-scrollbar,
  .insight-section::-webkit-scrollbar {
    width: 4px;
  }

  .card-section::-webkit-scrollbar-thumb,
  .summary-section::-webkit-scrollbar-thumb,
  .insight-section::-webkit-scrollbar-thumb {
    background: var(--accent-cyan);
    border-radius: 2px;
  }
</style>
