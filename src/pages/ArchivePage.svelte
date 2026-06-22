<script>
  import { onMount } from 'svelte'
  import { Storage } from '../utils/storage.js'
  import { BackupManager } from '../utils/backupManager.js'
  import { CARDS } from '../data/cards.js'

  let activeTab = 'overview'
  const TABS = [
    { id: 'overview', label: '概览', icon: '📊' },
    { id: 'backup', label: '备份恢复', icon: '🔄' },
    { id: 'export-import', label: '导出导入', icon: '💾' }
  ]

  let stats = null
  let collection = {}
  let achievements = {}
  let drawHistory = []
  let themeHistory = []
  let dailyHistory = []
  let settings = {}

  let showExportSuccess = false
  let exportResult = null
  let showImportSuccess = false
  let importResult = null
  let showImportError = false
  let importErrorMessage = ''
  let showClearConfirm = false
  let showClearSuccess = false
  let isProcessing = false
  let fileInputEl = null

  let autoBackups = []
  let backupStats = null
  let showRecoveryConfirm = false
  let recoveryTargetId = null
  let recoverySuccess = false
  let recoveryResult = null
  let verifyAllResult = null
  let isVerifying = false

  let verifyResult = null
  let verifySummary = null
  let pendingImportData = null
  let showImportConfirm = false

  function loadData() {
    stats = Storage.getStats()
    collection = Storage.getCollection()
    achievements = Storage.getAchievements()
    drawHistory = Storage.getDrawHistory()
    themeHistory = Storage.getThemeDivinationHistory()
    dailyHistory = Storage.getDailyFortuneHistory()
    settings = Storage.getSettings()
  }

  function loadBackupData() {
    autoBackups = BackupManager.listAutoBackups()
    backupStats = BackupManager.getAutoBackupStats()
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

  function getReasonLabel(reason) {
    const labels = {
      auto: '自动备份',
      pre_import: '导入前备份',
      pre_recovery: '恢复前备份',
      pre_clear: '清空前备份',
      manual: '手动备份'
    }
    return labels[reason] || reason
  }

  function getReasonIcon(reason) {
    const icons = {
      auto: '🔄',
      pre_import: '📥',
      pre_recovery: '🔙',
      pre_clear: '🗑️',
      manual: '👤'
    }
    return icons[reason] || '📦'
  }

  function handleExport() {
    isProcessing = true
    showExportSuccess = false
    exportResult = null

    setTimeout(() => {
      try {
        BackupManager.autoBackup('manual')
        const result = BackupManager.exportToFile()
        exportResult = result
        showExportSuccess = true
        loadBackupData()
        setTimeout(() => { showExportSuccess = false }, 4000)
      } catch (e) {
        console.error('Export failed:', e)
      } finally {
        isProcessing = false
      }
    }, 500)
  }

  function triggerImport() {
    verifyResult = null
    verifySummary = null
    pendingImportData = null
    showImportError = false
    importErrorMessage = ''
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
    importErrorMessage = ''
    verifyResult = null
    verifySummary = null
    pendingImportData = null

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target.result

        verifyResult = BackupManager.verifyBackupFile(content)

        if (!verifyResult.valid) {
          importErrorMessage = verifyResult.error
          showImportError = true
          setTimeout(() => { showImportError = false }, 6000)
          return
        }

        let data
        try {
          data = JSON.parse(content)
        } catch (parseErr) {
          importErrorMessage = 'JSON 解析失败'
          showImportError = true
          return
        }

        verifySummary = BackupManager.getBackupSummary(data)
        pendingImportData = content
        showImportConfirm = true
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

  function cancelImportConfirm() {
    showImportConfirm = false
    pendingImportData = null
    verifyResult = null
    verifySummary = null
  }

  function confirmImport() {
    if (!pendingImportData) return
    isProcessing = true
    showImportConfirm = false

    setTimeout(() => {
      try {
        const result = BackupManager.importBackup(pendingImportData)
        if (result.success) {
          importResult = result
          showImportSuccess = true
          loadData()
          loadBackupData()
          setTimeout(() => { showImportSuccess = false }, 5000)
        } else {
          importErrorMessage = result.error
          showImportError = true
          setTimeout(() => { showImportError = false }, 6000)
        }
      } catch (err) {
        importErrorMessage = err.message || '导入失败'
        showImportError = true
        setTimeout(() => { showImportError = false }, 5000)
      } finally {
        isProcessing = false
        pendingImportData = null
        verifyResult = null
        verifySummary = null
      }
    }, 500)
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
        BackupManager.autoBackup('pre_clear')
        Storage.resetAll()
        loadData()
        loadBackupData()
        showClearSuccess = true
        setTimeout(() => { showClearSuccess = false }, 4000)
      } catch (e) {
        console.error('Clear failed:', e)
      } finally {
        isProcessing = false
      }
    }, 500)
  }

  function createManualBackup() {
    isProcessing = true
    try {
      const result = BackupManager.autoBackup('manual')
      if (!result.success) {
        importErrorMessage = result.error
        showImportError = true
        setTimeout(() => { showImportError = false }, 5000)
      }
      loadBackupData()
    } catch (e) {
      importErrorMessage = e.message || '创建备份失败'
      showImportError = true
      setTimeout(() => { showImportError = false }, 5000)
    } finally {
      isProcessing = false
    }
  }

  function triggerRecovery(backupId) {
    recoveryTargetId = backupId
    showRecoveryConfirm = true
  }

  function cancelRecovery() {
    showRecoveryConfirm = false
    recoveryTargetId = null
  }

  function confirmRecovery() {
    if (!recoveryTargetId) return
    isProcessing = true
    showRecoveryConfirm = false

    setTimeout(() => {
      try {
        const result = BackupManager.recoverFromBackup(recoveryTargetId)
        if (result.success) {
          recoveryResult = result
          recoverySuccess = true
          loadData()
          loadBackupData()
          setTimeout(() => { recoverySuccess = false; recoveryResult = null }, 4000)
        } else {
          importErrorMessage = result.error
          showImportError = true
          setTimeout(() => { showImportError = false }, 5000)
        }
      } catch (e) {
        console.error('Recovery failed:', e)
      } finally {
        isProcessing = false
        recoveryTargetId = null
      }
    }, 500)
  }

  function deleteBackup(backupId) {
    BackupManager.deleteAutoBackup(backupId)
    loadBackupData()
    verifyAllResult = null
  }

  function runVerifyAll() {
    isVerifying = true
    verifyAllResult = null
    setTimeout(() => {
      try {
        verifyAllResult = BackupManager.verifyAllAutoBackups()
      } catch (e) {
        importErrorMessage = e.message || '校验失败'
        showImportError = true
        setTimeout(() => { showImportError = false }, 5000)
      } finally {
        isVerifying = false
      }
    }, 300)
  }

  function getBackupVerifyStatus(backupId) {
    if (!verifyAllResult) return null
    const detail = verifyAllResult.details.find(d => d.id === backupId)
    return detail || null
  }

  onMount(() => {
    loadData()
    loadBackupData()
  })
</script>

<h1 class="page-title">◆ 存 档 管 理 ◆</h1>

<div class="tabs">
  {#each TABS as tab}
    <div
      class="tab {activeTab === tab.id ? 'active' : ''}"
      on:click={() => (activeTab = tab.id)}
    >
      {tab.icon} {tab.label}
    </div>
  {/each}
</div>

{#if activeTab === 'overview'}
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
        <div class="stat-label">抽卡记录</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: #e040fb;">{themeHistory.length}</div>
        <div class="stat-label">主题占卜</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: #ffd54f;">{dailyHistory.length}</div>
        <div class="stat-label">每日签记录</div>
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
      <div class="detail-row">
        <span class="detail-label mono">备份格式版本</span>
        <span class="detail-value" style="color: var(--accent-cyan);">v{BackupManager.BACKUP_VERSION}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label mono">自动备份数量</span>
        <span class="detail-value">{backupStats?.count || 0} 个（{formatSize(backupStats?.totalSize || 0)}）</span>
      </div>
    </div>
  {/if}
{/if}

{#if activeTab === 'backup'}
  <div class="section-title glow-cyan">🔄 自动备份</div>

  <div class="action-card">
    <div class="action-desc">
      系统会在导入、恢复、清空等危险操作前自动创建备份，最多保留 {10} 个自动备份。你也可以手动创建备份点。
    </div>
    <div class="backup-stats">
      <div class="backup-stat-item">
        <span class="backup-stat-label">备份数量</span>
        <span class="backup-stat-value">{backupStats?.count || 0} / 10</span>
      </div>
      <div class="backup-stat-item">
        <span class="backup-stat-label">占用空间</span>
        <span class="backup-stat-value">{formatSize(backupStats?.totalSize || 0)}</span>
      </div>
      <div class="backup-stat-item">
        <span class="backup-stat-label">最早备份</span>
        <span class="backup-stat-value">{formatDate(backupStats?.oldest)}</span>
      </div>
      <div class="backup-stat-item">
        <span class="backup-stat-label">最新备份</span>
        <span class="backup-stat-value">{formatDate(backupStats?.newest)}</span>
      </div>
    </div>
    <button
      class="btn btn-primary btn-block"
      on:click={createManualBackup}
      disabled={isProcessing}
    >
      {isProcessing ? '处理中...' : '💾 手动创建备份'}
    </button>
  </div>

  <div class="section-title">
    备份列表
    <button
      class="btn btn-sm btn-verify-all"
      on:click={runVerifyAll}
      disabled={isVerifying || autoBackups.length === 0}
    >
      {isVerifying ? '校验中...' : '🔍 校验全部'}
    </button>
  </div>

  {#if verifyAllResult}
    <div class="verify-summary {verifyAllResult.invalid > 0 ? 'has-errors' : 'all-good'}">
      <span>共 {verifyAllResult.total} 个备份</span>
      <span class="verify-valid">✓ 有效 {verifyAllResult.valid}</span>
      <span class="verify-invalid">✗ 无效 {verifyAllResult.invalid}</span>
    </div>
  {/if}

  {#if autoBackups.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📭</div>
      <div class="empty-text">暂无自动备份</div>
      <div class="empty-hint">执行导入或清空操作时将自动创建备份</div>
    </div>
  {:else}
    <div class="backup-list">
      {#each autoBackups as backup, i}
        {@const verifyStatus = getBackupVerifyStatus(backup.id)}
        <div class="backup-item {verifyStatus && !verifyStatus.valid ? 'backup-invalid' : ''}">
          <div class="backup-item-header">
            <span class="backup-reason">
              {getReasonIcon(backup.reason)} {getReasonLabel(backup.reason)}
              {#if verifyStatus}
                {#if verifyStatus.valid}
                  <span class="verify-badge verify-ok" title="校验通过">✓</span>
                {:else}
                  <span class="verify-badge verify-bad" title="校验失败">✗</span>
                {/if}
              {/if}
            </span>
            <span class="backup-time">{formatDate(backup.createdAt)}</span>
          </div>
          <div class="backup-item-meta">
            <span>版本 v{backup._meta?.version || '?'}</span>
            <span>{formatSize(backup.size || 0)}</span>
            <span>校验 {backup.checksum?.slice(0, 8) || '—'}</span>
          </div>
          {#if verifyStatus && !verifyStatus.valid}
            <div class="backup-error-detail">
              ⚠ {verifyStatus.error}
            </div>
          {/if}
          <div class="backup-item-actions">
            <button
              class="btn btn-sm btn-recover"
              on:click={() => triggerRecovery(backup.id)}
              disabled={isProcessing || (verifyStatus && !verifyStatus.valid)}
            >
              🔙 恢复
            </button>
            <button
              class="btn btn-sm btn-delete"
              on:click={() => deleteBackup(backup.id)}
              disabled={isProcessing}
            >
              🗑️ 删除
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if recoverySuccess && recoveryResult}
    <div class="status-success">
      ✓ 恢复成功！已从 {formatDate(recoveryResult.backupCreatedAt)} 的备份恢复数据（原因：{getReasonLabel(recoveryResult.reason)}）
    </div>
  {/if}
{/if}

{#if activeTab === 'export-import'}
  <div class="section-title glow-cyan">📤 导出备份</div>

  <div class="action-card">
    <div class="action-desc">
      将所有游戏数据导出为带版本号和校验和的 JSON 备份文件，支持跨设备迁移和版本升级。导出前将自动创建一个本地备份。
    </div>
    <div class="export-meta">
      <span class="meta-tag">版本 v{BackupManager.BACKUP_VERSION}</span>
      <span class="meta-tag">含校验和</span>
      <span class="meta-tag">自动备份</span>
    </div>
    <button
      class="btn btn-primary btn-block"
      on:click={handleExport}
      disabled={isProcessing}
    >
      {isProcessing ? '处理中...' : '⬇ 导出备份文件'}
    </button>
    {#if showExportSuccess && exportResult}
      <div class="status-success">
        ✓ 备份导出成功！<br/>
        文件：{exportResult.filename}<br/>
        大小：{formatSize(exportResult.size)}
      </div>
    {/if}
  </div>

  <div class="section-title glow-green">📥 导入备份</div>

  <div
    class="action-card drop-zone"
    on:drop={handleDrop}
    on:dragover={handleDragOver}
    on:click={triggerImport}
  >
    <div class="drop-icon">📁</div>
    <div class="action-desc center">
      <strong>点击选择文件</strong> 或 拖拽 JSON 文件到此处<br/>
      <span class="muted">支持版本校验与自动迁移 · 导入前自动创建备份 · 设置智能合并</span>
    </div>
    <input
      type="file"
      accept=".json,application/json"
      bind:this={fileInputEl}
      on:change={handleFileSelect}
      hidden
    />
    {#if showImportSuccess && importResult}
      <div class="status-success">
        ✓ 备份导入成功！<br/>
        {#if importResult.migrated}
          ⚡ 已从 v{importResult.migratedFrom} 自动迁移到 v{importResult.version}<br/>
        {/if}
        {#if importResult.settingsMerged}
          ⚙️ 设置已智能合并（保留当前偏好，新增导入项）<br/>
        {/if}
        {#if importResult.backupCreated}
          💾 导入前已自动创建备份
        {/if}
      </div>
    {/if}
    {#if showImportError}
      <div class="status-error">✗ 导入失败：{importErrorMessage}</div>
    {/if}
  </div>

  {#if verifyResult && verifyResult.valid && !showImportConfirm}
    <div class="verify-card">
      <div class="verify-header">🔍 备份校验通过</div>
      <div class="verify-details">
        {#if verifyResult.isLegacy}
          <div class="verify-row">
            <span class="verify-label">格式类型</span>
            <span class="verify-value" style="color: #ffd54f;">旧版格式（v{verifyResult.version}）</span>
          </div>
        {:else}
          <div class="verify-row">
            <span class="verify-label">格式类型</span>
            <span class="verify-value" style="color: #69f0ae;">新版格式（v{verifyResult.version}）</span>
          </div>
        {/if}
        {#if verifyResult.needsMigration}
          <div class="verify-row">
            <span class="verify-label">版本迁移</span>
            <span class="verify-value" style="color: #ffd54f;">需要（v{verifyResult.version} → v{BackupManager.BACKUP_VERSION}）</span>
          </div>
        {:else}
          <div class="verify-row">
            <span class="verify-label">版本迁移</span>
            <span class="verify-value" style="color: #69f0ae;">不需要</span>
          </div>
        {/if}
        <div class="verify-row">
          <span class="verify-label">数据字段</span>
          <span class="verify-value">{verifyResult.fields.length} 个</span>
        </div>
      </div>
    </div>
  {/if}

  <div class="section-title glow-red">🗑️ 清空存档</div>

  <div class="action-card danger">
    <div class="action-desc">
      <strong class="glow-red">警告：</strong>此操作将永久删除所有游戏进度，
      包括抽卡记录、收藏数据、成就等所有内容。清空前将自动创建备份，但清空后仅能从备份恢复。
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
      <div class="status-success">✓ 存档已清空，系统已重置（清空前已自动备份）</div>
    {/if}
  </div>
{/if}

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
          <li>🔮 {themeHistory.length || 0} 条主题占卜记录</li>
          <li>🎐 {dailyHistory.length || 0} 条每日签记录</li>
          <li>📚 {getCollectedCount()} 张收藏卡牌数据</li>
          <li>🏆 {getAchievementCount()} 个成就</li>
          <li>⚙️ 所有个性化设置</li>
        </ul>
        <p class="confirm-warn">
          清空前将自动创建备份，清空后可从「备份恢复」页签恢复数据。
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

{#if showImportConfirm && verifyResult && verifySummary}
  <div class="modal-overlay" on:click|self={cancelImportConfirm}>
    <div class="modal-content">
      <h2 class="modal-title">📥 确认导入备份</h2>

      <div class="confirm-dialog">
        <div class="verify-card" style="margin-bottom: 16px;">
          <div class="verify-header">🔍 备份校验结果</div>
          <div class="verify-details">
            <div class="verify-row">
              <span class="verify-label">备份版本</span>
              <span class="verify-value">v{verifyResult.version}</span>
            </div>
            {#if verifyResult.isLegacy}
              <div class="verify-row">
                <span class="verify-label">格式</span>
                <span class="verify-value" style="color: #ffd54f;">旧版格式</span>
              </div>
            {/if}
            {#if verifyResult.needsMigration}
              <div class="verify-row">
                <span class="verify-label">迁移</span>
                <span class="verify-value" style="color: #ffd54f;">将自动迁移到 v{BackupManager.BACKUP_VERSION}</span>
              </div>
            {/if}
            <div class="verify-row">
              <span class="verify-label">数据字段</span>
              <span class="verify-value">{verifyResult.fields.length} 个</span>
            </div>
          </div>
        </div>

        <div class="compare-grid">
          <div class="compare-col">
            <div class="compare-title">当前数据</div>
            <ul class="confirm-list">
              <li>🎴 抽卡 {stats?.totalDraws || 0} 次</li>
              <li>📚 收集 {getCollectedCount()}/{CARDS.length}</li>
              <li>🏆 成就 {getAchievementCount()}</li>
              <li>🔮 主题占卜 {themeHistory.length}</li>
              <li>🎐 每日签 {dailyHistory.length}</li>
              <li>📊 周报 {Storage.getWeeklyReports().length}</li>
              <li>✨ 隐藏事件 {Storage.getHiddenEventsLog().length}</li>
            </ul>
          </div>
          <div class="compare-col">
            <div class="compare-title">待导入数据</div>
            <ul class="confirm-list">
              <li>🎴 抽卡 {verifySummary.drawCount} 次</li>
              <li>📚 收集 {verifySummary.collectionCount}/{CARDS.length}</li>
              <li>🏆 成就 {verifySummary.achievementCount}</li>
              <li>🔮 主题占卜 {verifySummary.themeDivinationCount}</li>
              <li>🎐 每日签 {verifySummary.dailyFortuneCount}</li>
              <li>📊 周报 {verifySummary.weeklyReportCount || 0}</li>
              <li>✨ 隐藏事件 {verifySummary.hiddenEventCount || 0}</li>
            </ul>
          </div>
        </div>

        <div class="import-actions-list">
          {#if verifyResult.needsMigration}
            <div class="import-action-item">⚡ 将自动迁移备份格式到最新版本</div>
          {/if}
          <div class="import-action-item">💾 导入前将自动创建本地备份</div>
          <div class="import-action-item">⚙️ 设置数据将智能合并（保留当前偏好）</div>
        </div>
      </div>

      <div class="action-row">
        <button class="btn btn-block" on:click={cancelImportConfirm} disabled={isProcessing}>
          取消
        </button>
        <button
          class="btn btn-primary btn-block"
          on:click={confirmImport}
          disabled={isProcessing}
        >
          {isProcessing ? '导入中...' : '确认导入'}
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showRecoveryConfirm}
  <div class="modal-overlay" on:click|self={cancelRecovery}>
    <div class="modal-content" style="border-color: #e040fb;">
      <h2 class="modal-title" style="color: #e040fb;">🔙 确认恢复备份</h2>

      <div class="confirm-dialog">
        <div class="confirm-icon">🔄</div>
        <p class="confirm-text">
          恢复备份将<strong style="color: #e040fb;">覆盖当前所有数据</strong>，替换为备份时的数据状态。
        </p>
        <p class="confirm-warn" style="border-left-color: #e040fb; background: rgba(224,64,251,0.1); color: #e040fb;">
          恢复前将自动创建当前数据的备份，可在备份列表中找到。
        </p>
      </div>

      <div class="action-row">
        <button class="btn btn-block" on:click={cancelRecovery} disabled={isProcessing}>
          取消
        </button>
        <button
          class="btn btn-block"
          style="background: rgba(224,64,251,0.2); border-color: #e040fb; color: #e040fb;"
          on:click={confirmRecovery}
          disabled={isProcessing}
        >
          {isProcessing ? '恢复中...' : '确认恢复'}
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

  .export-meta {
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
    flex-wrap: wrap;
  }

  .meta-tag {
    background: rgba(0, 229, 255, 0.1);
    border: 1px solid rgba(0, 229, 255, 0.3);
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 11px;
    color: var(--accent-cyan);
    font-family: var(--font-mono);
  }

  .backup-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 14px;
  }

  .backup-stat-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .backup-stat-label {
    font-size: 11px;
    color: var(--text-dim);
  }

  .backup-stat-value {
    font-size: 13px;
    color: var(--text-primary);
    font-family: var(--font-mono);
  }

  .backup-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
  }

  .backup-item {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    padding: 14px;
    transition: all 0.2s ease;
  }

  .backup-item:hover {
    border-color: rgba(224, 64, 251, 0.4);
  }

  .backup-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .backup-reason {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .backup-time {
    font-size: 11px;
    color: var(--text-dim);
    font-family: var(--font-mono);
  }

  .backup-item-meta {
    display: flex;
    gap: 12px;
    margin-bottom: 10px;
    font-size: 11px;
    color: var(--text-dim);
    font-family: var(--font-mono);
  }

  .backup-item-actions {
    display: flex;
    gap: 8px;
  }

  .btn-sm {
    padding: 4px 12px;
    font-size: 12px;
    border-radius: 4px;
  }

  .btn-recover {
    border-color: #e040fb;
    color: #e040fb;
  }

  .btn-recover:hover {
    background: rgba(224, 64, 251, 0.15);
  }

  .btn-delete {
    border-color: var(--text-dim);
    color: var(--text-dim);
  }

  .btn-delete:hover {
    border-color: var(--accent-red);
    color: var(--accent-red);
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--text-dim);
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 15px;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }

  .empty-hint {
    font-size: 12px;
    color: var(--text-dim);
  }

  .verify-card {
    background: var(--bg-card);
    border: 1px solid rgba(105, 240, 174, 0.3);
    border-radius: 8px;
    padding: 14px;
    margin-bottom: 20px;
  }

  .verify-header {
    font-size: 14px;
    font-weight: 600;
    color: #69f0ae;
    margin-bottom: 10px;
  }

  .verify-details {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .verify-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .verify-label {
    font-size: 12px;
    color: var(--text-dim);
  }

  .verify-value {
    font-size: 13px;
    color: var(--text-primary);
    font-family: var(--font-mono);
  }

  .compare-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 14px;
  }

  .compare-col {
    min-width: 0;
  }

  .compare-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
    text-align: center;
  }

  .import-actions-list {
    background: var(--bg-secondary);
    border-radius: 6px;
    padding: 10px 14px;
  }

  .import-action-item {
    font-size: 12px;
    color: var(--text-secondary);
    padding: 4px 0;
    line-height: 1.5;
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
    line-height: 1.7;
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

  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .btn-verify-all {
    border-color: #69f0ae;
    color: #69f0ae;
    font-size: 11px;
    padding: 2px 10px;
  }

  .btn-verify-all:hover {
    background: rgba(105, 240, 174, 0.15);
  }

  .btn-verify-all:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .verify-summary {
    display: flex;
    gap: 16px;
    padding: 10px 14px;
    border-radius: 6px;
    margin-bottom: 14px;
    font-size: 12px;
    font-family: var(--font-mono);
  }

  .verify-summary.all-good {
    background: rgba(105, 240, 174, 0.1);
    border: 1px solid rgba(105, 240, 174, 0.3);
    color: var(--text-secondary);
  }

  .verify-summary.has-errors {
    background: rgba(255, 82, 82, 0.1);
    border: 1px solid rgba(255, 82, 82, 0.3);
    color: var(--text-secondary);
  }

  .verify-valid {
    color: #69f0ae;
  }

  .verify-invalid {
    color: var(--accent-red);
  }

  .verify-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    font-size: 10px;
    font-weight: bold;
    margin-left: 6px;
    vertical-align: middle;
  }

  .verify-badge.verify-ok {
    background: rgba(105, 240, 174, 0.2);
    color: #69f0ae;
    border: 1px solid #69f0ae;
  }

  .verify-badge.verify-bad {
    background: rgba(255, 82, 82, 0.2);
    color: var(--accent-red);
    border: 1px solid var(--accent-red);
  }

  .backup-item.backup-invalid {
    border-color: rgba(255, 82, 82, 0.4);
    background: linear-gradient(135deg, rgba(255,82,82,0.05), var(--bg-card));
  }

  .backup-error-detail {
    padding: 8px 10px;
    background: rgba(255, 82, 82, 0.1);
    border: 1px solid rgba(255, 82, 82, 0.3);
    border-radius: 4px;
    font-size: 11px;
    color: var(--accent-red);
    font-family: var(--font-mono);
    margin: 8px 0;
    line-height: 1.5;
  }

  @media (max-width: 400px) {
    .compare-grid {
      grid-template-columns: 1fr;
    }
    .backup-stats {
      grid-template-columns: 1fr;
    }
  }
</style>
