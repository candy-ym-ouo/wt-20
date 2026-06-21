<script>
  import { onMount } from 'svelte'
  import { Storage } from '../utils/storage.js'
  import { CARDS } from '../data/cards.js'

  let stats = null
  let collection = {}
  let achievements = {}
  let drawHistory = []
  let settings = {}

  let showExportSuccess = false
  let showImportSuccess = false
  let showImportError = false
  let importErrorMessage = ''
  let showClearConfirm = false
  let showClearSuccess = false
  let isProcessing = false
  let fileInputEl = null

  function loadData() {
    stats = Storage.getStats()
    collection = Storage.getCollection()
    achievements = Storage.getAchievements()
    drawHistory = Storage.getDrawHistory()
    settings = Storage.getSettings()
  }

  function formatDate(ts) {
    if (!ts) return '无'
    return new Date(ts).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  function getAchievementCount() {
    return Object.keys(achievements).length
  }

  function getCollectedCount() {
    return Object.keys(collection).length
  }

  function handleExport() {
    isProcessing = true
    showExportSuccess = false

    setTimeout(() => {
      try {
        const data = Storage.exportAll()
        const jsonStr = JSON.stringify(data, null, 2)
        const blob = new Blob([jsonStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)

        const date = new Date()
        const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`
        const filename = `cyber_divination_save_${dateStr}.json`

        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        showExportSuccess = true
        setTimeout(() => { showExportSuccess = false }, 4000)
      } catch (e) {
        console.error('Export failed:', e)
      } finally {
        isProcessing = false
      }
    }, 500)
  }

  function triggerImport() {
    if (fileInputEl) {
      fileInputEl.value = ''
      fileInputEl.click()
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    processImportFile(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer?.files?.[0]
    if (file) processImportFile(file)
  }

  function handleDragOver(e) {
    e.preventDefault()
  }

  function processImportFile(file) {
    isProcessing = true
    showImportError = false
    showImportSuccess = false
    importErrorMessage = ''

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target.result
        let data
        try {
          data = JSON.parse(content)
        } catch (parseErr) {
          throw new Error('JSON 解析失败，请确保文件格式正确')
        }

        if (!data || typeof data !== 'object') {
          throw new Error('存档数据格式无效')
        }

        if (!data.drawHistory && !data.collection && !data.stats && !data.achievements) {
          throw new Error('未找到有效的存档内容')
        }

        const overwrite = confirm(
          '⚠ 导入将覆盖当前所有存档数据\n\n' +
          `当前数据：\n` +
          `  抽卡次数：${stats?.totalDraws || 0}\n` +
          `  收集卡牌：${getCollectedCount()}/${CARDS.length}\n` +
          `  成就数量：${getAchievementCount()}\n\n` +
          `待导入数据：\n` +
          `  抽卡次数：${data.stats?.totalDraws || 0}\n` +
          `  收集卡牌：${data.collection ? Object.keys(data.collection).length : 0}/${CARDS.length}\n` +
          `  成就数量：${data.achievements ? Object.keys(data.achievements).length : 0}\n\n` +
          `确定要导入并覆盖吗？此操作不可撤销。`
        )

        if (!overwrite) {
          isProcessing = false
          return
        }

        Storage.importAll(data)
        loadData()
        showImportSuccess = true
        setTimeout(() => { showImportSuccess = false }, 4000)
      } catch (err) {
        importErrorMessage = err.message || '未知错误'
        showImportError = true
        setTimeout(() => { showImportError = false }, 5000)
      } finally {
        isProcessing = false
      }
    }

    reader.onerror = () => {
      importErrorMessage = '文件读取失败'
      showImportError = true
      isProcessing = false
    }

    reader.readAsText(file)
  }

  function triggerClearConfirm() {
    showClearConfirm = true
  }

  function cancelClear() {
    showClearConfirm = false
  }

  function confirmClear() {
    isProcessing = true
    showClearConfirm = false

    setTimeout(() => {
      try {
        Storage.resetAll()
        loadData()
        showClearSuccess = true
        setTimeout(() => { showClearSuccess = false }, 4000)
      } catch (e) {
        console.error('Clear failed:', e)
      } finally {
        isProcessing = false
      }
    }, 500)
  }

  onMount(() => {
    loadData()
  })
</script>

<h1 class="page-title">◆ 存 档 管 理 ◆</h1>

<div class="tabs">
  <div class="tab active">概览</div>
</div>

{#if stats}
  <div class="section-title">当前存档状态</div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value glow-cyan">{stats.totalDraws}</div>
      <div class="stat-label">总抽卡次数</div>
    </div>
    <div class="stat-card">
      <div class="stat-value glow-magenta">{getCollectedCount()}/{CARDS.length}</div>
      <div class="stat-label">卡牌收集</div>
    </div>
    <div class="stat-card">
      <div class="stat-value glow-yellow">{getAchievementCount()}</div>
      <div class="stat-label">解锁成就</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{drawHistory.length}</div>
      <div class="stat-label">历史记录</div>
    </div>
  </div>

  <div class="section-title">详细数据</div>

  <div class="detail-list">
    <div class="detail-row">
      <span class="detail-label mono">稀有度统计</span>
      <span class="detail-value">
        <span class="badge badge-legendary">传说 {stats.legendaryCount}</span>
        <span class="badge badge-epic">史诗 {stats.epicCount}</span>
        <span class="badge badge-rare">稀有 {stats.rareCount}</span>
        <span class="badge badge-common">普通 {stats.commonCount}</span>
      </span>
    </div>
    <div class="detail-row">
      <span class="detail-label mono">逆位抽卡</span>
      <span class="detail-value">
        {stats.reversedDraws} 次
        {stats.totalDraws > 0 ? `（${Math.round(stats.reversedDraws / stats.totalDraws * 100)}%）` : ''}
      </span>
    </div>
    <div class="detail-row">
      <span class="detail-label mono">最后抽卡</span>
      <span class="detail-value">{formatDate(stats.lastDrawDate)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label mono">存档估算大小</span>
      <span class="detail-value">
        {formatSize(
          JSON.stringify(Storage.exportAll()).length
        )}
      </span>
    </div>
  </div>
{/if}

<div class="section-title glow-cyan">📤 导出存档</div>

<div class="action-card">
  <div class="action-desc">
    将所有游戏数据导出为 JSON 文件，可用于备份或迁移到其他设备。
  </div>
  <button
    class="btn btn-primary btn-block"
    on:click={handleExport}
    disabled={isProcessing}
  >
    {isProcessing ? '处理中...' : '⬇ 导出存档文件'}
  </button>
  {#if showExportSuccess}
    <div class="status-success">✓ 存档导出成功！文件已保存到下载目录</div>
  {/if}
</div>

<div class="section-title glow-green">📥 导入存档</div>

<div
  class="action-card drop-zone"
  on:drop={handleDrop}
  on:dragover={handleDragOver}
  on:click={triggerImport}
>
  <div class="drop-icon">📁</div>
  <div class="action-desc center">
    <strong>点击选择文件</strong> 或 拖拽 JSON 文件到此处<br/>
    <span class="muted">导入将覆盖当前所有数据，请谨慎操作</span>
  </div>
  <input
    type="file"
    accept=".json,application/json"
    bind:this={fileInputEl}
    on:change={handleFileSelect}
    hidden
  />
  {#if showImportSuccess}
    <div class="status-success">✓ 存档导入成功！数据已恢复</div>
  {/if}
  {#if showImportError}
    <div class="status-error">✗ 导入失败：{importErrorMessage}</div>
  {/if}
</div>

<div class="section-title glow-red">🗑️ 清空存档</div>

<div class="action-card danger">
  <div class="action-desc">
    <strong class="glow-red">警告：</strong>此操作将永久删除所有游戏进度，
    包括抽卡记录、收藏数据、成就等所有内容，且<strong>无法恢复</strong>。
    建议先导出存档备份。
  </div>
  <button
    class="btn btn-block"
    style="border-color: var(--accent-red); color: var(--accent-red);"
    on:click={triggerClearConfirm}
    disabled={isProcessing}
  >
    {isProcessing ? '处理中...' : '⚠ 清空所有数据'}
  </button>
  {#if showClearSuccess}
    <div class="status-success">✓ 存档已清空，系统已重置</div>
  {/if}
</div>

{#if showClearConfirm}
  <div class="modal-overlay" on:click|self={cancelClear}>
    <div class="modal-content" style="border-color: var(--accent-red);">
      <h2 class="modal-title glow-red">⚠ 确认清空存档</h2>

      <div class="confirm-dialog">
        <div class="confirm-icon">⚠️</div>
        <p class="confirm-text">
          此操作将<strong class="glow-red">永久删除</strong>以下所有数据：
        </p>
        <ul class="confirm-list">
          <li>🎴 {stats.totalDraws || 0} 条抽卡记录</li>
          <li>📚 {getCollectedCount()} 张收藏卡牌数据</li>
          <li>🏆 {getAchievementCount()} 个成就</li>
          <li>⚙️ 所有个性化设置</li>
        </ul>
        <p class="confirm-warn">
          此操作<strong>无法撤销</strong>，建议先导出存档备份。
        </p>
      </div>

      <div class="action-row">
        <button class="btn btn-block" on:click={cancelClear} disabled={isProcessing}>
          取消
        </button>
        <button
          class="btn btn-block"
          style="background: rgba(255,82,82,0.2); border-color: var(--accent-red); color: var(--accent-red);"
          on:click={confirmClear}
          disabled={isProcessing}
        >
          {isProcessing ? '清空中...' : '确认清空'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .detail-list {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    padding: 4px 12px;
    margin-bottom: 20px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    flex-wrap: wrap;
    gap: 8px;
  }

  .detail-row:last-child {
    border-bottom: none;
  }

  .detail-label {
    color: var(--text-dim);
    font-size: 12px;
  }

  .detail-value {
    color: var(--text-primary);
    font-size: 13px;
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: wrap;
  }

  .action-card {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px;
    transition: all 0.2s ease;
  }

  .action-card.danger {
    border-color: rgba(255, 82, 82, 0.4);
    background: linear-gradient(135deg, rgba(255,82,82,0.05), var(--bg-card));
  }

  .action-card.drop-zone {
    cursor: pointer;
    text-align: center;
    border-style: dashed;
    transition: all 0.2s ease;
  }

  .action-card.drop-zone:hover {
    border-color: var(--accent-green);
    background: rgba(105, 240, 174, 0.05);
  }

  .action-desc {
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.7;
    margin-bottom: 14px;
  }

  .action-desc.center {
    text-align: center;
    margin-top: 8px;
  }

  .action-desc .muted {
    color: var(--text-dim);
    font-size: 12px;
  }

  .drop-icon {
    font-size: 42px;
    text-align: center;
    margin-bottom: 4px;
    opacity: 0.6;
  }

  .status-success {
    margin-top: 14px;
    padding: 10px 14px;
    background: rgba(105, 240, 174, 0.15);
    border: 1px solid var(--accent-green);
    border-radius: 6px;
    color: var(--accent-green);
    font-size: 13px;
    font-family: var(--font-mono);
    animation: fade-in 0.3s ease;
  }

  .status-error {
    margin-top: 14px;
    padding: 10px 14px;
    background: rgba(255, 82, 82, 0.15);
    border: 1px solid var(--accent-red);
    border-radius: 6px;
    color: var(--accent-red);
    font-size: 13px;
    font-family: var(--font-mono);
    animation: fade-in 0.3s ease;
  }

  .confirm-dialog {
    padding: 10px 0;
  }

  .confirm-icon {
    font-size: 56px;
    text-align: center;
    margin-bottom: 16px;
    animation: glow-pulse 1.5s ease-in-out infinite;
  }

  .confirm-text {
    color: var(--text-primary);
    font-size: 14px;
    line-height: 1.7;
    margin-bottom: 14px;
  }

  .confirm-list {
    list-style: none;
    padding: 12px 16px;
    background: var(--bg-secondary);
    border-radius: 6px;
    margin-bottom: 14px;
  }

  .confirm-list li {
    padding: 6px 0;
    font-size: 13px;
    color: var(--text-secondary);
    font-family: var(--font-mono);
  }

  .confirm-warn {
    color: var(--accent-red);
    font-size: 13px;
    line-height: 1.6;
    padding: 10px;
    background: rgba(255, 82, 82, 0.1);
    border-radius: 6px;
    border-left: 3px solid var(--accent-red);
  }
</style>
