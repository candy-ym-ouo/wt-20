import { Storage } from './storage.js'

const BACKUP_VERSION = 5
const MAX_AUTO_BACKUPS = 10
const CHECKSUM_SEED = 0xDEAD

const BACKUP_FIELDS = [
  'drawHistory',
  'dailyFortuneHistory',
  'themeDivinationHistory',
  'multiSpreadHistory',
  'collection',
  'achievements',
  'stats',
  'settings',
  'wishList',
  'onboarding',
  'storyProgress',
  'storyHistory',
  'decks',
  'themeAlbums',
  'shareHistory',
  'tempEffects',
  'permanentEffects',
  'seasonData',
  'seasonTasks',
  'seasonHiddenEvents',
  'ownedShopItems',
  'shopPurchaseHistory',
  'equippedShopItems',
  'achievementPointsSpent'
]

const SETTINGS_SYNC_RULES = {
  soundEnabled: 'user',
  animationEnabled: 'user',
  theme: 'newest'
}

function computeChecksum(payload) {
  const str = JSON.stringify(payload)
  let hash = CHECKSUM_SEED
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

function validateBackupStructure(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: '备份数据格式无效' }
  }

  if (!data._meta) {
    return { valid: false, error: '缺少备份元数据，可能是旧版格式' }
  }

  if (typeof data._meta.version !== 'number') {
    return { valid: false, error: '备份版本号无效' }
  }

  if (!data._meta.checksum) {
    return { valid: false, error: '缺少校验和' }
  }

  if (!data._meta.exportDate) {
    return { valid: false, error: '缺少导出时间戳' }
  }

  const payload = {}
  for (const key of BACKUP_FIELDS) {
    if (data[key] !== undefined) {
      payload[key] = data[key]
    }
  }

  const expectedChecksum = computeChecksum(payload)
  if (data._meta.checksum !== expectedChecksum) {
    return { valid: false, error: `校验和不匹配（期望 ${expectedChecksum}，实际 ${data._meta.checksum}），数据可能已损坏` }
  }

  return { valid: true }
}

function migrateBackup(data) {
  const version = data._meta?.version || data.version || 0
  const migrated = { ...data }

  if (version < 1) {
    migrated.drawHistory = migrated.drawHistory || []
    migrated.collection = migrated.collection || {}
    migrated.achievements = migrated.achievements || {}
    migrated.stats = migrated.stats || { totalDraws: 0, reversedDraws: 0, legendaryCount: 0, epicCount: 0, rareCount: 0, commonCount: 0, lastDrawDate: null }
    migrated.settings = migrated.settings || { soundEnabled: true, animationEnabled: true, theme: 'cyber' }
  }

  if (version < 2) {
    migrated.dailyFortuneHistory = migrated.dailyFortuneHistory || []
    migrated.themeDivinationHistory = migrated.themeDivinationHistory || []
  }

  if (version < 3) {
    migrated.multiSpreadHistory = migrated.multiSpreadHistory || []
    migrated.decks = migrated.decks || []
    migrated.wishList = migrated.wishList || []
  }

  if (version < 4) {
    migrated.storyProgress = migrated.storyProgress || {}
    migrated.storyHistory = migrated.storyHistory || []
    migrated.onboarding = migrated.onboarding || { startedAt: null, completed: false, completedAt: null, currentStep: 0 }
    migrated.themeAlbums = migrated.themeAlbums || {}
    migrated.shareHistory = migrated.shareHistory || []
    migrated.tempEffects = migrated.tempEffects || {}
    migrated.permanentEffects = migrated.permanentEffects || {}
  }

  if (version < 5) {
    migrated.seasonData = migrated.seasonData || {}
    migrated.seasonTasks = migrated.seasonTasks || {}
    migrated.seasonHiddenEvents = migrated.seasonHiddenEvents || {}
    migrated.ownedShopItems = migrated.ownedShopItems || {}
    migrated.shopPurchaseHistory = migrated.shopPurchaseHistory || []
    migrated.equippedShopItems = migrated.equippedShopItems || { skin: null, card_back: null, animation: null, card_border: null, special_title: null }
    migrated.achievementPointsSpent = migrated.achievementPointsSpent || 0
  }

  migrated._meta = {
    version: BACKUP_VERSION,
    migratedFrom: version,
    migratedAt: Date.now()
  }

  return migrated
}

function syncSettings(importedSettings, currentSettings) {
  const merged = { ...currentSettings }

  for (const [key, rule] of Object.entries(SETTINGS_SYNC_RULES)) {
    if (importedSettings[key] === undefined) continue

    if (rule === 'newest') {
      merged[key] = importedSettings[key]
    } else if (rule === 'user') {
      merged[key] = importedSettings[key]
    }
  }

  for (const key of Object.keys(importedSettings)) {
    if (merged[key] === undefined) {
      merged[key] = importedSettings[key]
    }
  }

  return merged
}

export const BackupManager = {
  BACKUP_VERSION,

  createBackup() {
    const rawData = Storage.exportAll()
    const payload = {}
    for (const key of BACKUP_FIELDS) {
      if (rawData[key] !== undefined) {
        payload[key] = rawData[key]
      }
    }

    const checksum = computeChecksum(payload)

    return {
      ...payload,
      _meta: {
        version: BACKUP_VERSION,
        checksum,
        exportDate: Date.now(),
        appId: 'cyber_divination',
        backupType: 'manual'
      }
    }
  },

  exportToFile() {
    const backup = this.createBackup()
    const jsonStr = JSON.stringify(backup, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const date = new Date()
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`
    const filename = `cyber_divination_backup_v${BACKUP_VERSION}_${dateStr}.json`

    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return { success: true, filename, size: jsonStr.length }
  },

  importBackup(jsonStr) {
    let data
    try {
      data = JSON.parse(jsonStr)
    } catch (e) {
      return { success: false, error: 'JSON 解析失败，请确保文件格式正确', phase: 'parse' }
    }

    if (!data || typeof data !== 'object') {
      return { success: false, error: '备份数据格式无效', phase: 'validate' }
    }

    const isLegacy = !data._meta && (data.version !== undefined)
    if (isLegacy) {
      data._meta = { version: data.version || 0, checksum: null, exportDate: data.exportDate || null }
    }

    const isOldNoMeta = !data._meta
    if (isOldNoMeta) {
      data._meta = { version: 0, checksum: null, exportDate: null }
    }

    const hasValidContent = BACKUP_FIELDS.some(key => data[key] !== undefined)
    if (!hasValidContent) {
      return { success: false, error: '未找到有效的备份数据内容', phase: 'validate' }
    }

    if (data._meta.checksum) {
      const integrity = validateBackupStructure(data)
      if (!integrity.valid) {
        return { success: false, error: integrity.error, phase: 'integrity' }
      }
    }

    const needsMigration = data._meta.version < BACKUP_VERSION
    if (needsMigration) {
      data = migrateBackup(data)
    }

    const importedSettings = data.settings || {}
    const currentSettings = Storage.getSettings()
    const mergedSettings = syncSettings(importedSettings, currentSettings)
    data.settings = mergedSettings

    this.autoBackup('pre_import')

    Storage.importAll(data)

    return {
      success: true,
      migrated: needsMigration,
      migratedFrom: data._meta.migratedFrom,
      version: data._meta.version,
      settingsMerged: true,
      backupCreated: true
    }
  },

  autoBackup(reason = 'auto') {
    const backups = Storage.getAutoBackups()

    const rawData = Storage.exportAll()
    const payload = {}
    for (const key of BACKUP_FIELDS) {
      if (rawData[key] !== undefined) {
        payload[key] = rawData[key]
      }
    }

    const checksum = computeChecksum(payload)

    const backup = {
      id: `auto_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      reason,
      createdAt: Date.now(),
      checksum,
      size: JSON.stringify(payload).length,
      _meta: {
        version: BACKUP_VERSION,
        checksum,
        exportDate: Date.now(),
        appId: 'cyber_divination',
        backupType: 'auto'
      },
      ...payload
    }

    backups.unshift(backup)
    if (backups.length > MAX_AUTO_BACKUPS) {
      backups.splice(MAX_AUTO_BACKUPS)
    }

    Storage.saveAutoBackups(backups)
    return backup
  },

  listAutoBackups() {
    return Storage.getAutoBackups()
  },

  recoverFromBackup(backupId) {
    const backups = Storage.getAutoBackups()
    const backup = backups.find(b => b.id === backupId)

    if (!backup) {
      return { success: false, error: '未找到指定的自动备份' }
    }

    if (backup._meta?.checksum) {
      const payload = {}
      for (const key of BACKUP_FIELDS) {
        if (backup[key] !== undefined) {
          payload[key] = backup[key]
        }
      }
      const expectedChecksum = computeChecksum(payload)
      if (backup._meta.checksum !== expectedChecksum) {
        return { success: false, error: '自动备份校验失败，数据可能已损坏' }
      }
    }

    this.autoBackup('pre_recovery')

    Storage.importAll(backup)

    return { success: true, recoveredAt: Date.now(), backupCreatedAt: backup.createdAt, reason: backup.reason }
  },

  deleteAutoBackup(backupId) {
    const backups = Storage.getAutoBackups()
    const filtered = backups.filter(b => b.id !== backupId)
    if (filtered.length === backups.length) {
      return false
    }
    Storage.saveAutoBackups(filtered)
    return true
  },

  verifyBackupFile(jsonStr) {
    let data
    try {
      data = JSON.parse(jsonStr)
    } catch (e) {
      return { valid: false, error: 'JSON 解析失败', phase: 'parse' }
    }

    if (!data || typeof data !== 'object') {
      return { valid: false, error: '备份数据格式无效', phase: 'validate' }
    }

    const isLegacy = !data._meta && data.version !== undefined
    if (isLegacy) {
      const hasValidContent = BACKUP_FIELDS.some(key => data[key] !== undefined)
      if (!hasValidContent) {
        return { valid: false, error: '旧版备份中未找到有效数据', phase: 'validate' }
      }
      return {
        valid: true,
        version: data.version,
        isLegacy: true,
        needsMigration: data.version < BACKUP_VERSION,
        exportDate: data.exportDate || null,
        fields: BACKUP_FIELDS.filter(key => data[key] !== undefined)
      }
    }

    if (!data._meta) {
      const hasValidContent = BACKUP_FIELDS.some(key => data[key] !== undefined)
      if (!hasValidContent) {
        return { valid: false, error: '未找到有效备份数据', phase: 'validate' }
      }
      return {
        valid: true,
        version: 0,
        isLegacy: true,
        needsMigration: true,
        exportDate: null,
        fields: BACKUP_FIELDS.filter(key => data[key] !== undefined)
      }
    }

    if (data._meta.checksum) {
      const integrity = validateBackupStructure(data)
      if (!integrity.valid) {
        return { valid: false, error: integrity.error, phase: 'integrity' }
      }
    }

    return {
      valid: true,
      version: data._meta.version,
      isLegacy: false,
      needsMigration: data._meta.version < BACKUP_VERSION,
      exportDate: data._meta.exportDate,
      backupType: data._meta.backupType,
      fields: BACKUP_FIELDS.filter(key => data[key] !== undefined)
    }
  },

  getBackupSummary(data) {
    if (!data) return null
    return {
      version: data._meta?.version || data.version || 0,
      exportDate: data._meta?.exportDate || data.exportDate || null,
      drawCount: data.stats?.totalDraws || 0,
      collectionCount: data.collection ? Object.keys(data.collection).length : 0,
      achievementCount: data.achievements ? Object.keys(data.achievements).length : 0,
      dailyFortuneCount: data.dailyFortuneHistory?.length || 0,
      themeDivinationCount: data.themeDivinationHistory?.length || 0,
      wishCount: data.wishList?.length || 0,
      seasonDataCount: data.seasonData ? Object.keys(data.seasonData).length : 0,
      hasSettings: !!data.settings
    }
  },

  getAutoBackupStats() {
    const backups = Storage.getAutoBackups()
    return {
      count: backups.length,
      totalSize: backups.reduce((sum, b) => sum + (b.size || 0), 0),
      oldest: backups.length > 0 ? backups[backups.length - 1].createdAt : null,
      newest: backups.length > 0 ? backups[0].createdAt : null
    }
  }
}
