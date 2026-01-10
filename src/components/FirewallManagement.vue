<template>
  <div class="firewall-management">
    <!-- 威胁概览卡片 -->
    <div class="threat-overview">
      <div class="threat-card" :style="{ borderColor: threatLevel.color }">
        <div class="threat-indicator" :style="{ background: threatLevel.color }">
          <div class="threat-score">{{ threatLevel.score }}</div>
          <div class="threat-label">威胁指数</div>
        </div>
        <div class="threat-info">
          <div class="threat-status">
            <span class="status-dot" :style="{ background: threatLevel.color }"></span>
            <span class="status-text">{{ threatLevel.description }}</span>
          </div>
          <div class="threat-stats">
            <div class="stat-item">
              <span class="stat-value">{{ stats.overview.blocked24h || 0 }}</span>
              <span class="stat-label">24h拦截</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ stats.overview.activeBans || 0 }}</span>
              <span class="stat-label">活跃封禁</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ stats.overview.blockRate || '0%' }}</span>
              <span class="stat-label">拦截率</span>
            </div>
          </div>
        </div>
        <div class="threat-actions">
          <el-button size="small" @click="refreshStats">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button size="small" type="primary" @click="cleanupData">
            <el-icon><Delete /></el-icon>
            清理
          </el-button>
        </div>
      </div>
    </div>

    <el-card class="management-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><Lock /></el-icon>
            防火墙管理
          </span>
          <div class="header-actions">
            <el-button size="small" @click="exportConfig">
              <el-icon><Download /></el-icon>
              导出配置
            </el-button>
            <el-upload
              :before-upload="handleImportConfig"
              :show-file-list="false"
              accept=".json"
              style="display: inline-block; margin: 0 10px;"
            >
              <el-button size="small">
                <el-icon><Upload /></el-icon>
                导入配置
              </el-button>
            </el-upload>
            <el-switch
              v-model="settings.enabled"
              @change="handleEnabledChange"
              active-text="启用"
              inactive-text="禁用"
            />
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="firewall-tabs">
        <!-- 基本设置 -->
        <el-tab-pane label="基本设置" name="basic">
          <div class="settings-section">
            <h3>防火墙状态</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="防火墙状态">
                <el-tag :type="settings.enabled ? 'success' : 'info'">
                  {{ settings.enabled ? '已启用' : '已禁用' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="频率限制">
                <el-tag :type="settings.rateLimit.enabled ? 'success' : 'info'">
                  {{ settings.rateLimit.enabled ? '已启用' : '已禁用' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="登录保护">
                <el-tag :type="settings.loginProtection.enabled ? 'success' : 'info'">
                  {{ settings.loginProtection.enabled ? '已启用' : '已禁用' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="恶意检测">
                <el-tag :type="settings.maliciousPatterns.enabled ? 'success' : 'info'">
                  {{ settings.maliciousPatterns.enabled ? '已启用' : '已禁用' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="settings-section">
            <h3>频率限制设置</h3>
            <el-form :model="settings.rateLimit" label-width="200px">
              <el-form-item label="启用频率限制">
                <el-switch v-model="settings.rateLimit.enabled" />
              </el-form-item>
              <el-form-item label="每分钟最大请求数">
                <el-input-number
                  v-model="settings.rateLimit.maxRequests"
                  :min="10"
                  :max="1000"
                  :disabled="!settings.rateLimit.enabled"
                />
                <span class="form-tip">超过此数量的请求将被限制</span>
              </el-form-item>
              <el-form-item label="时间窗口（分钟）">
                <el-input-number
                  v-model="timeWindowMinutes"
                  :min="1"
                  :max="60"
                  :disabled="!settings.rateLimit.enabled"
                  @change="handleTimeWindowChange"
                />
                <span class="form-tip">统计请求的时间范围</span>
              </el-form-item>
              <el-form-item label="封禁时长（分钟）">
                <el-input-number
                  v-model="banDurationMinutes"
                  :min="1"
                  :max="1440"
                  :disabled="!settings.rateLimit.enabled"
                  @change="handleBanDurationChange"
                />
                <span class="form-tip">超过限制后封禁的时长</span>
              </el-form-item>
            </el-form>
          </div>

          <div class="settings-section">
            <h3>登录保护设置</h3>
            <el-form :model="settings.loginProtection" label-width="200px">
              <el-form-item label="启用登录保护">
                <el-switch v-model="settings.loginProtection.enabled" />
              </el-form-item>
              <el-form-item label="最大尝试次数">
                <el-input-number
                  v-model="settings.loginProtection.maxAttempts"
                  :min="3"
                  :max="20"
                  :disabled="!settings.loginProtection.enabled"
                />
                <span class="form-tip">超过此次数将被锁定</span>
              </el-form-item>
              <el-form-item label="锁定时长（分钟）">
                <el-input-number
                  v-model="lockoutDurationMinutes"
                  :min="5"
                  :max="1440"
                  :disabled="!settings.loginProtection.enabled"
                  @change="handleLockoutDurationChange"
                />
                <span class="form-tip">账户被锁定的时长</span>
              </el-form-item>
              <el-form-item label="时间窗口（分钟）">
                <el-input-number
                  v-model="loginTimeWindowMinutes"
                  :min="1"
                  :max="60"
                  :disabled="!settings.loginProtection.enabled"
                  @change="handleLoginTimeWindowChange"
                />
                <span class="form-tip">统计登录尝试的时间范围</span>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- IP管理 -->
        <el-tab-pane label="IP管理" name="ip">
          <div class="settings-section">
            <h3>IP白名单</h3>
            <div class="ip-list-container">
              <div class="ip-input-group">
                <el-input
                  v-model="newWhitelistIP"
                  placeholder="输入IP地址或客户端ID"
                  style="width: 300px; margin-right: 10px;"
                />
                <el-button type="primary" @click="addWhitelistIP">
                  <el-icon><Plus /></el-icon>
                  添加
                </el-button>
              </div>
              <el-table :data="settings.ipWhitelist" border style="margin-top: 20px;" max-height="400">
                <el-table-column prop="ip" label="IP地址/客户端ID" />
                <el-table-column label="操作" width="120">
                  <template #default="{ row }">
                    <el-button
                      type="danger"
                      size="small"
                      @click="removeWhitelistIP(row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <div class="settings-section">
            <h3>IP黑名单</h3>
            <div class="ip-list-container">
              <div class="ip-input-group">
                <el-input
                  v-model="newBlacklistIP"
                  placeholder="输入IP地址或客户端ID"
                  style="width: 300px; margin-right: 10px;"
                />
                <el-button type="danger" @click="addBlacklistIP">
                  <el-icon><Plus /></el-icon>
                  添加
                </el-button>
              </div>
              <el-table :data="settings.ipBlacklist" border style="margin-top: 20px;" max-height="400">
                <el-table-column prop="ip" label="IP地址/客户端ID" />
                <el-table-column label="操作" width="120">
                  <template #default="{ row }">
                    <el-button
                      type="primary"
                      size="small"
                      @click="removeBlacklistIP(row)"
                    >
                      移除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <div class="settings-section">
            <h3>自动封禁列表</h3>
            <el-table :data="autoBannedIPs" border style="margin-top: 20px;" max-height="400">
              <el-table-column prop="ip" label="IP地址/客户端ID" />
              <el-table-column prop="reason" label="封禁原因" />
              <el-table-column label="封禁时间">
                <template #default="{ row }">
                  {{ formatTime(row.bannedAt) }}
                </template>
              </el-table-column>
              <el-table-column label="解封时间">
                <template #default="{ row }">
                  {{ formatTime(row.bannedUntil) }}
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="isBannedExpired(row.bannedUntil) ? 'info' : 'danger'">
                    {{ isBannedExpired(row.bannedUntil) ? '已过期' : '封禁中' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button
                    type="primary"
                    size="small"
                    @click="handleUnbanIP(row.ip)"
                    :disabled="isBannedExpired(row.bannedUntil)"
                  >
                    解封
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 恶意检测 -->
        <el-tab-pane label="恶意检测" name="malicious">
          <div class="settings-section">
            <h3>检测规则</h3>
            <el-form :model="settings.maliciousPatterns" label-width="200px">
              <el-form-item label="启用恶意检测">
                <el-switch v-model="settings.maliciousPatterns.enabled" />
              </el-form-item>
              <el-form-item label="SQL注入检测">
                <el-switch
                  v-model="settings.maliciousPatterns.sqlInjection"
                  :disabled="!settings.maliciousPatterns.enabled"
                />
              </el-form-item>
              <el-form-item label="XSS攻击检测">
                <el-switch
                  v-model="settings.maliciousPatterns.xss"
                  :disabled="!settings.maliciousPatterns.enabled"
                />
              </el-form-item>
              <el-form-item label="路径遍历检测">
                <el-switch
                  v-model="settings.maliciousPatterns.pathTraversal"
                  :disabled="!settings.maliciousPatterns.enabled"
                />
              </el-form-item>
              <el-form-item label="命令注入检测">
                <el-switch
                  v-model="settings.maliciousPatterns.commandInjection"
                  :disabled="!settings.maliciousPatterns.enabled"
                />
              </el-form-item>
            </el-form>
          </div>

          <div class="settings-section">
            <h3>自动封禁设置</h3>
            <el-form :model="settings.autoBan" label-width="200px">
              <el-form-item label="启用自动封禁">
                <el-switch v-model="settings.autoBan.enabled" />
              </el-form-item>
              <el-form-item label="违规次数阈值">
                <el-input-number
                  v-model="settings.autoBan.threshold"
                  :min="3"
                  :max="50"
                  :disabled="!settings.autoBan.enabled"
                />
                <span class="form-tip">达到此次数将自动封禁IP</span>
              </el-form-item>
              <el-form-item label="封禁时长（分钟）">
                <el-input-number
                  v-model="autoBanDurationMinutes"
                  :min="10"
                  :max="1440"
                  :disabled="!settings.autoBan.enabled"
                  @change="handleAutoBanDurationChange"
                />
                <span class="form-tip">自动封禁的时长</span>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 日志记录 -->
        <el-tab-pane label="安全日志" name="logs">
          <div class="settings-section">
            <div class="logs-header">
              <h3>防火墙日志</h3>
              <div class="logs-actions">
                <el-button type="danger" @click="clearLogs">
                  <el-icon><Delete /></el-icon>
                  清空日志
                </el-button>
                <el-select
                  v-model="logFilter"
                  placeholder="筛选类型"
                  style="width: 150px; margin-left: 10px;"
                >
                  <el-option label="全部" value="" />
                  <el-option label="拦截" value="blocked" />
                  <el-option label="允许" value="allowed" />
                  <el-option label="警告" value="warning" />
                </el-select>
              </div>
            </div>
            <el-table :data="filteredLogs" border style="margin-top: 20px;" max-height="500">
              <el-table-column prop="timestamp" label="时间" width="180">
                <template #default="{ row }">
                  {{ formatTime(row.timestamp) }}
                </template>
              </el-table-column>
              <el-table-column prop="type" label="类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="getLogTypeColor(row.type)">
                    {{ getLogTypeText(row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="ip" label="IP/客户端ID" width="150" />
              <el-table-column prop="reason" label="原因/说明" />
              <el-table-column prop="url" label="URL" show-overflow-tooltip />
              <el-table-column prop="method" label="方法" width="80" />
            </el-table>
            <el-pagination
              v-model:current-page="logPage"
              :page-size="logPageSize"
              :total="filteredLogs.length"
              layout="prev, pager, next"
              style="margin-top: 20px; justify-content: center;"
            />
          </div>
        </el-tab-pane>
      </el-tabs>

      <div class="action-buttons">
        <el-button type="primary" @click="saveSettings">
          <el-icon><Check /></el-icon>
          保存设置
        </el-button>
        <el-button @click="resetSettings">
          <el-icon><Refresh /></el-icon>
          重置为默认
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Lock, Plus, Delete, Check, Refresh, Download, Upload } from '@element-plus/icons-vue'
import {
  getFirewallSettings,
  saveFirewallSettings,
  getFirewallLogs,
  clearFirewallLogs,
  getBannedIPs,
  unbanIP,
  getFirewallStats,
  getThreatLevel,
  exportFirewallConfig,
  importFirewallConfig,
  cleanupExpiredData,
  batchBanIPs,
  batchUnbanIPs
} from '@/utils/firewall'

const activeTab = ref('basic')
const settings = reactive(getFirewallSettings())
const logs = ref([])
const logFilter = ref('')
const logPage = ref(1)
const logPageSize = ref(50)
const newWhitelistIP = ref('')
const newBlacklistIP = ref('')
const autoBannedIPs = ref([])
const stats = ref({ overview: {}, trends: {}, attackTypes: {}, recentBlocked: [], topViolators: [] })
const threatLevel = ref({ score: 0, level: 'safe', color: '#22c55e', description: '安全' })
const batchIPInput = ref('')
const selectedBannedIPs = ref([])

// 时间转换（毫秒转分钟）
const timeWindowMinutes = computed({
  get: () => Math.floor(settings.rateLimit.timeWindow / 60000),
  set: (val) => {
    settings.rateLimit.timeWindow = val * 60000
  }
})

const banDurationMinutes = computed({
  get: () => Math.floor(settings.rateLimit.banDuration / 60000),
  set: (val) => {
    settings.rateLimit.banDuration = val * 60000
  }
})

const lockoutDurationMinutes = computed({
  get: () => Math.floor(settings.loginProtection.lockoutDuration / 60000),
  set: (val) => {
    settings.loginProtection.lockoutDuration = val * 60000
  }
})

const loginTimeWindowMinutes = computed({
  get: () => Math.floor(settings.loginProtection.timeWindow / 60000),
  set: (val) => {
    settings.loginProtection.timeWindow = val * 60000
  }
})

const autoBanDurationMinutes = computed({
  get: () => Math.floor(settings.autoBan.banDuration / 60000),
  set: (val) => {
    settings.autoBan.banDuration = val * 60000
  }
})

const handleTimeWindowChange = (val) => {
  if (val) {
    settings.rateLimit.timeWindow = val * 60000
  }
}

const handleBanDurationChange = (val) => {
  if (val) {
    settings.rateLimit.banDuration = val * 60000
  }
}

const handleLockoutDurationChange = (val) => {
  if (val) {
    settings.loginProtection.lockoutDuration = val * 60000
  }
}

const handleLoginTimeWindowChange = (val) => {
  if (val) {
    settings.loginProtection.timeWindow = val * 60000
  }
}

const handleAutoBanDurationChange = (val) => {
  if (val) {
    settings.autoBan.banDuration = val * 60000
  }
}

const handleEnabledChange = (val) => {
  if (val) {
    ElMessage.success('防火墙已启用')
  } else {
    ElMessage.warning('防火墙已禁用')
  }
}

// IP管理
const addWhitelistIP = () => {
  if (!newWhitelistIP.value.trim()) {
    ElMessage.warning('请输入IP地址或客户端ID')
    return
  }
  if (settings.ipWhitelist.includes(newWhitelistIP.value.trim())) {
    ElMessage.warning('该IP已在白名单中')
    return
  }
  settings.ipWhitelist.push(newWhitelistIP.value.trim())
  newWhitelistIP.value = ''
  ElMessage.success('已添加到白名单')
}

const removeWhitelistIP = (ip) => {
  const index = settings.ipWhitelist.indexOf(ip)
  if (index > -1) {
    settings.ipWhitelist.splice(index, 1)
    ElMessage.success('已从白名单移除')
  }
}

const addBlacklistIP = () => {
  if (!newBlacklistIP.value.trim()) {
    ElMessage.warning('请输入IP地址或客户端ID')
    return
  }
  if (settings.ipBlacklist.includes(newBlacklistIP.value.trim())) {
    ElMessage.warning('该IP已在黑名单中')
    return
  }
  settings.ipBlacklist.push(newBlacklistIP.value.trim())
  newBlacklistIP.value = ''
  ElMessage.success('已添加到黑名单')
}

const removeBlacklistIP = (ip) => {
  ElMessageBox.confirm('确定要从黑名单移除该IP吗？', '确认', {
    type: 'warning'
  }).then(() => {
    const index = settings.ipBlacklist.indexOf(ip)
    if (index > -1) {
      settings.ipBlacklist.splice(index, 1)
      ElMessage.success('已从黑名单移除')
    }
  }).catch(() => {})
}

// 日志管理
const filteredLogs = computed(() => {
  let result = logs.value
  if (logFilter.value) {
    result = result.filter(log => log.type === logFilter.value)
  }
  const start = (logPage.value - 1) * logPageSize.value
  return result.slice(start, start + logPageSize.value)
})

const getLogTypeColor = (type) => {
  const colors = {
    blocked: 'danger',
    allowed: 'success',
    warning: 'warning'
  }
  return colors[type] || 'info'
}

const getLogTypeText = (type) => {
  const texts = {
    blocked: '拦截',
    allowed: '允许',
    warning: '警告'
  }
  return texts[type] || type
}

const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  try {
    const date = new Date(timeStr)
    return date.toLocaleString('zh-CN')
  } catch {
    return timeStr
  }
}

const clearLogs = () => {
  ElMessageBox.confirm('确定要清空所有日志吗？此操作不可恢复！', '确认', {
    type: 'warning'
  }).then(() => {
    if (clearFirewallLogs()) {
      logs.value = []
      ElMessage.success('日志已清空')
    } else {
      ElMessage.error('清空日志失败')
    }
  }).catch(() => {})
}

// 自动封禁管理
const isBannedExpired = (bannedUntil) => {
  if (!bannedUntil) return true
  return Date.now() >= new Date(bannedUntil).getTime()
}

const handleUnbanIP = (ip) => {
  ElMessageBox.confirm('确定要解封该IP吗？', '确认', {
    type: 'warning'
  }).then(() => {
    if (unbanIP(ip)) {
      loadAutoBannedIPs()
      ElMessage.success('IP已解封')
    } else {
      ElMessage.error('解封失败')
    }
  }).catch(() => {})
}

const loadAutoBannedIPs = () => {
  const banned = getBannedIPs()
  autoBannedIPs.value = banned.auto
}

// 保存设置
const saveSettings = () => {
  if (saveFirewallSettings(settings)) {
    ElMessage.success('设置已保存')
    // 重新加载设置
    Object.assign(settings, getFirewallSettings())
  } else {
    ElMessage.error('保存设置失败')
  }
}

// 重置设置
const resetSettings = () => {
  ElMessageBox.confirm('确定要重置为默认设置吗？此操作不可恢复！', '确认', {
    type: 'warning'
  }).then(() => {
    localStorage.removeItem('firewall_settings')
    Object.assign(settings, getFirewallSettings())
    ElMessage.success('已重置为默认设置')
  }).catch(() => {})
}

// 加载日志
const loadLogs = () => {
  logs.value = getFirewallLogs(1000, logFilter.value || null)
}

// 刷新统计数据
const refreshStats = () => {
  stats.value = getFirewallStats()
  threatLevel.value = getThreatLevel()
}

// 清理过期数据
const cleanupData = () => {
  ElMessageBox.confirm('确定要清理过期数据吗？这将清除过期的封禁记录和违规记录。', '确认', {
    type: 'warning'
  }).then(() => {
    const result = cleanupExpiredData()
    if (result.success) {
      ElMessage.success('过期数据已清理')
      refreshStats()
      loadAutoBannedIPs()
    } else {
      ElMessage.error('清理失败: ' + result.error)
    }
  }).catch(() => {})
}

// 导出配置
const exportConfig = () => {
  const config = exportFirewallConfig()
  if (config) {
    const blob = new Blob([config], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `firewall-config-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('配置已导出')
  } else {
    ElMessage.error('导出失败')
  }
}

// 导入配置
const handleImportConfig = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = importFirewallConfig(e.target.result)
    if (result.success) {
      ElMessage.success(result.message)
      Object.assign(settings, getFirewallSettings())
      refreshStats()
      loadLogs()
      loadAutoBannedIPs()
    } else {
      ElMessage.error('导入失败: ' + result.message)
    }
  }
  reader.readAsText(file)
  return false
}

// 批量封禁
const handleBatchBan = () => {
  if (!batchIPInput.value.trim()) {
    ElMessage.warning('请输入要封禁的IP列表')
    return
  }
  
  const ips = batchIPInput.value.split('\n').map(ip => ip.trim()).filter(ip => ip)
  if (ips.length === 0) {
    ElMessage.warning('没有有效的IP地址')
    return
  }
  
  ElMessageBox.confirm(`确定要封禁 ${ips.length} 个IP吗？`, '确认批量封禁', {
    type: 'warning'
  }).then(() => {
    const result = batchBanIPs(ips, '管理员批量封禁')
    if (result.success) {
      ElMessage.success(`成功封禁 ${result.addedCount} 个IP`)
      batchIPInput.value = ''
      Object.assign(settings, getFirewallSettings())
      refreshStats()
    } else {
      ElMessage.error('批量封禁失败')
    }
  }).catch(() => {})
}

// 批量解封
const handleBatchUnban = () => {
  if (selectedBannedIPs.value.length === 0) {
    ElMessage.warning('请先选择要解封的IP')
    return
  }
  
  ElMessageBox.confirm(`确定要解封选中的 ${selectedBannedIPs.value.length} 个IP吗？`, '确认批量解封', {
    type: 'warning'
  }).then(() => {
    const result = batchUnbanIPs(selectedBannedIPs.value)
    if (result.success) {
      ElMessage.success(`成功解封 ${result.unbannedCount} 个IP`)
      selectedBannedIPs.value = []
      loadAutoBannedIPs()
      refreshStats()
    } else {
      ElMessage.error('批量解封失败')
    }
  }).catch(() => {})
}

// 初始化
onMounted(() => {
  loadLogs()
  loadAutoBannedIPs()
  refreshStats()
  
  // 定期刷新
  setInterval(() => {
    loadLogs()
    loadAutoBannedIPs()
    refreshStats()
  }, 10000)
})

watch(logFilter, () => {
  logPage.value = 1
  loadLogs()
})
</script>

<style lang="scss" scoped>
.firewall-management {
  // 威胁概览卡片
  .threat-overview {
    margin-bottom: 20px;
    
    .threat-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 24px;
      border: 2px solid;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      
      .threat-indicator {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        flex-shrink: 0;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        
        .threat-score {
          font-size: 32px;
          font-weight: 800;
          line-height: 1;
        }
        
        .threat-label {
          font-size: 11px;
          margin-top: 4px;
          opacity: 0.9;
        }
      }
      
      .threat-info {
        flex: 1;
        
        .threat-status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          
          .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            animation: pulse 2s infinite;
          }
          
          .status-text {
            font-size: 20px;
            font-weight: 700;
            color: #1f2937;
          }
        }
        
        .threat-stats {
          display: flex;
          gap: 32px;
          
          .stat-item {
            display: flex;
            flex-direction: column;
            
            .stat-value {
              font-size: 24px;
              font-weight: 700;
              color: #1f2937;
            }
            
            .stat-label {
              font-size: 12px;
              color: #6b7280;
              margin-top: 2px;
            }
          }
        }
      }
      
      .threat-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .management-card {
    border-radius: 12px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        font-weight: 600;
      }
      
      .header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }

  .firewall-tabs {
    margin-top: 20px;
  }

  .settings-section {
    margin-bottom: 40px;
    
    h3 {
      margin-bottom: 20px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      border-left: 4px solid #2563eb;
      padding-left: 10px;
    }

    .form-tip {
      margin-left: 10px;
      color: #909399;
      font-size: 12px;
    }
  }

  .ip-list-container {
    .ip-input-group {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
  }

  .logs-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      border: none;
      padding: 0;
    }

    .logs-actions {
      display: flex;
      align-items: center;
    }
  }

  .action-buttons {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    gap: 10px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
  }
  
  // 攻击类型统计
  .attack-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    margin-top: 20px;
    
    .attack-stat-item {
      background: #f8fafc;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      border: 1px solid #e5e7eb;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .attack-type {
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 8px;
      }
      
      .attack-count {
        font-size: 28px;
        font-weight: 700;
        color: #ef4444;
      }
    }
  }
  
  // 违规者排行
  .violators-list {
    .violator-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: #f8fafc;
      border-radius: 8px;
      margin-bottom: 8px;
      border: 1px solid #e5e7eb;
      
      .violator-rank {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #2563eb;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 12px;
        
        &.top-3 {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }
      }
      
      .violator-ip {
        flex: 1;
        margin-left: 12px;
        font-family: monospace;
        color: #374151;
      }
      
      .violator-count {
        font-weight: 600;
        color: #ef4444;
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .firewall-management {
    .threat-card {
      flex-direction: column;
      text-align: center;
      
      .threat-stats {
        justify-content: center;
      }
      
      .threat-actions {
        flex-direction: row;
      }
    }
  }
}
</style>

