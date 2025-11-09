<template>
  <div class="password-reset-management">
    <div class="management-header">
      <div class="header-title">
        <h2>密码重置管理</h2>
        <p>查看和管理用户密码重置请求</p>
      </div>
      <div class="header-actions">
        <el-button 
          :icon="Refresh" 
          @click="loadResetRecords"
        >
          刷新
        </el-button>
        <el-button 
          type="danger"
          :icon="Delete"
          @click="clearExpiredRecords"
        >
          清理过期记录
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">总重置请求</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.used }}</div>
          <div class="stat-label">已使用</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.pending }}</div>
          <div class="stat-label">待使用</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.expired }}</div>
          <div class="stat-label">已过期</div>
        </div>
      </div>
    </div>

    <!-- 当前有效的重置请求 -->
    <el-card class="current-request-card" v-if="currentRequest">
      <template #header>
        <div class="card-header">
          <span>当前有效的重置请求</span>
          <el-tag type="warning">待使用</el-tag>
        </div>
      </template>
      <div class="request-details">
        <div class="detail-row">
          <span class="detail-label">用户名:</span>
          <span class="detail-value">{{ currentRequest.username }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">邮箱:</span>
          <span class="detail-value">{{ currentRequest.email }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">验证码:</span>
          <span class="detail-value code-value">{{ currentRequest.code }}</span>
          <el-button 
            size="small" 
            text
            @click="copyCode(currentRequest.code)"
          >
            复制
          </el-button>
        </div>
        <div class="detail-row">
          <span class="detail-label">过期时间:</span>
          <span class="detail-value">{{ formatExpireTime(currentRequest.expireTime) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">剩余时间:</span>
          <span class="detail-value" :class="getTimeClass(currentRequest.expireTime)">
            {{ getRemainingTime(currentRequest.expireTime) }}
          </span>
        </div>
      </div>
    </el-card>

    <!-- 历史记录表格 -->
    <el-card class="history-card">
      <template #header>
        <div class="card-header">
          <span>历史记录</span>
        </div>
      </template>

      <el-table 
        :data="historyRecords" 
        stripe
        style="width: 100%"
        :default-sort="{ prop: 'timestamp', order: 'descending' }"
      >
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column label="验证码" width="120">
          <template #default="{ row }">
            <span class="code-text">{{ row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="getStatusType(row)" 
              size="small"
            >
              {{ getStatusText(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="请求时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.timestamp) }}
          </template>
        </el-table-column>
        <el-table-column label="过期时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.expireTime) }}
          </template>
        </el-table-column>
        <el-table-column label="剩余时间">
          <template #default="{ row }">
            <span :class="getTimeClass(row.expireTime)">
              {{ getRemainingTime(row.expireTime) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button 
              size="small" 
              text
              type="primary"
              @click="viewDetails(row)"
            >
              详情
            </el-button>
            <el-button 
              size="small" 
              text
              type="danger"
              @click="deleteRecord(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-pagination" v-if="historyRecords.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalRecords"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="重置请求详情"
      width="500px"
    >
      <div v-if="selectedRecord" class="detail-dialog">
        <div class="detail-item">
          <label>用户名</label>
          <span>{{ selectedRecord.username }}</span>
        </div>
        <div class="detail-item">
          <label>邮箱</label>
          <span>{{ selectedRecord.email }}</span>
        </div>
        <div class="detail-item">
          <label>验证码</label>
          <span class="code-value">{{ selectedRecord.code }}</span>
        </div>
        <div class="detail-item">
          <label>状态</label>
          <el-tag :type="getStatusType(selectedRecord)">
            {{ getStatusText(selectedRecord) }}
          </el-tag>
        </div>
        <div class="detail-item">
          <label>请求时间</label>
          <span>{{ formatDateTime(selectedRecord.timestamp) }}</span>
        </div>
        <div class="detail-item">
          <label>过期时间</label>
          <span>{{ formatDateTime(selectedRecord.expireTime) }}</span>
        </div>
        <div class="detail-item">
          <label>剩余时间</label>
          <span :class="getTimeClass(selectedRecord.expireTime)">
            {{ getRemainingTime(selectedRecord.expireTime) }}
          </span>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button 
          type="primary" 
          @click="copyCode(selectedRecord.code)"
        >
          复制验证码
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Delete } from '@element-plus/icons-vue'

const currentRequest = ref(null)
const historyRecords = ref([])
const allRecords = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const detailDialogVisible = ref(false)
const selectedRecord = ref(null)
let updateTimer = null

// 统计数据
const stats = computed(() => {
  const now = Date.now()
  return {
    total: allRecords.value.length,
    used: allRecords.value.filter(r => r.used).length,
    pending: allRecords.value.filter(r => !r.used && r.expireTime > now).length,
    expired: allRecords.value.filter(r => !r.used && r.expireTime <= now).length
  }
})

const totalRecords = computed(() => allRecords.value.length)

// 加载重置记录
const loadResetRecords = () => {
  try {
    // 从系统日志中获取密码重置记录
    const logs = JSON.parse(localStorage.getItem('system_logs') || '[]')
    const resetLogs = logs.filter(log => log.type === 'password_reset')
    
    // 从存储中获取当前的重置请求
    const currentData = JSON.parse(localStorage.getItem('password_reset_data') || '{}')
    
    // 构建历史记录列表
    const records = []
    
    // 添加当前请求（如果存在）
    if (currentData.username) {
      const record = {
        ...currentData,
        timestamp: currentData.expireTime - 10 * 60 * 1000 // 推算请求时间
      }
      records.push(record)
      
      // 如果当前请求未使用且未过期，设置为当前请求
      if (!record.used && record.expireTime > Date.now()) {
        currentRequest.value = record
      }
    }
    
    // 从日志中提取更多记录（模拟历史数据）
    resetLogs.forEach(log => {
      if (log.details && log.details.method === 'email_verification') {
        // 这里可以添加更多历史记录的逻辑
      }
    })
    
    allRecords.value = records.sort((a, b) => b.timestamp - a.timestamp)
    updatePaginatedRecords()
    
  } catch (error) {
    console.error('加载重置记录失败:', error)
    ElMessage.error('加载数据失败')
  }
}

// 更新分页数据
const updatePaginatedRecords = () => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  historyRecords.value = allRecords.value.slice(start, end)
}

// 获取状态类型
const getStatusType = (record) => {
  if (record.used) return 'success'
  if (record.expireTime <= Date.now()) return 'danger'
  return 'warning'
}

// 获取状态文本
const getStatusText = (record) => {
  if (record.used) return '已使用'
  if (record.expireTime <= Date.now()) return '已过期'
  return '待使用'
}

// 格式化时间
const formatDateTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 格式化过期时间
const formatExpireTime = (timestamp) => {
  return formatDateTime(timestamp)
}

// 获取剩余时间
const getRemainingTime = (expireTime) => {
  const now = Date.now()
  const remaining = expireTime - now
  
  if (remaining <= 0) {
    return '已过期'
  }
  
  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)
  
  if (minutes > 0) {
    return `${minutes}分${seconds}秒`
  }
  return `${seconds}秒`
}

// 获取时间样式类
const getTimeClass = (expireTime) => {
  const remaining = expireTime - Date.now()
  if (remaining <= 0) return 'time-expired'
  if (remaining < 2 * 60 * 1000) return 'time-warning' // 少于2分钟
  return 'time-normal'
}

// 复制验证码
const copyCode = async (code) => {
  try {
    await navigator.clipboard.writeText(code)
    ElMessage.success('验证码已复制到剪贴板')
  } catch (error) {
    // 降级方案
    const input = document.createElement('input')
    input.value = code
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    ElMessage.success('验证码已复制')
  }
}

// 查看详情
const viewDetails = (record) => {
  selectedRecord.value = record
  detailDialogVisible.value = true
}

// 删除记录
const deleteRecord = (record) => {
  ElMessageBox.confirm(
    '确定要删除这条记录吗？',
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 如果是当前请求，清除localStorage
    if (currentRequest.value && currentRequest.value.code === record.code) {
      localStorage.removeItem('password_reset_data')
      currentRequest.value = null
    }
    
    // 从列表中移除
    const index = allRecords.value.findIndex(r => r.code === record.code)
    if (index > -1) {
      allRecords.value.splice(index, 1)
      updatePaginatedRecords()
    }
    
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 清理过期记录
const clearExpiredRecords = () => {
  const expiredCount = stats.value.expired
  
  if (expiredCount === 0) {
    ElMessage.info('没有过期记录需要清理')
    return
  }
  
  ElMessageBox.confirm(
    `确定要清理 ${expiredCount} 条过期记录吗？`,
    '确认清理',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const now = Date.now()
    allRecords.value = allRecords.value.filter(r => r.used || r.expireTime > now)
    updatePaginatedRecords()
    ElMessage.success(`已清理 ${expiredCount} 条过期记录`)
  }).catch(() => {
    // 取消清理
  })
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  updatePaginatedRecords()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  updatePaginatedRecords()
}

// 定时更新剩余时间
const startAutoUpdate = () => {
  updateTimer = setInterval(() => {
    // 强制更新视图
    if (currentRequest.value) {
      const temp = { ...currentRequest.value }
      currentRequest.value = temp
    }
  }, 1000)
}

onMounted(() => {
  loadResetRecords()
  startAutoUpdate()
})

onUnmounted(() => {
  if (updateTimer) {
    clearInterval(updateTimer)
  }
})
</script>

<style lang="scss" scoped>
.password-reset-management {
  padding: 24px;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-title {
  h2 {
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 8px 0;
  }
  
  p {
    color: #64748b;
    margin: 0;
    font-size: 14px;
  }
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
}

.current-request-card,
.history-card {
  margin-bottom: 24px;
  
  :deep(.el-card__header) {
    padding: 16px 20px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #1e293b;
}

.request-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.detail-label {
  font-weight: 600;
  color: #64748b;
  min-width: 100px;
}

.detail-value {
  flex: 1;
  color: #1e293b;
  
  &.code-value {
    font-family: 'Courier New', monospace;
    font-size: 18px;
    font-weight: 700;
    color: #3b82f6;
    letter-spacing: 2px;
  }
}

.code-text {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #3b82f6;
  letter-spacing: 1px;
}

.time-normal {
  color: #10b981;
  font-weight: 600;
}

.time-warning {
  color: #f59e0b;
  font-weight: 600;
  animation: pulse 1s ease-in-out infinite;
}

.time-expired {
  color: #ef4444;
  font-weight: 600;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.table-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.detail-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  
  label {
    font-weight: 600;
    color: #64748b;
  }
  
  span {
    color: #1e293b;
  }
}
</style>

