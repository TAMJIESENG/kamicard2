<template>
  <div class="card-query-enhanced">
    <!-- 页面头部 -->
    <div class="query-header">
      <div class="header-content">
        <div class="header-icon">
          <div class="icon-wrapper">
            <el-icon><Search /></el-icon>
          </div>
          <div class="icon-glow"></div>
        </div>
        <div class="header-text">
          <h2>卡密查询中心</h2>
          <p>快速查询卡密状态、使用记录和详细信息</p>
        </div>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-value">{{ queryHistory.length }}</span>
          <span class="stat-label">历史查询</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ successCount }}</span>
          <span class="stat-label">成功查询</span>
        </div>
      </div>
    </div>

    <!-- 查询卡片 -->
    <div class="query-card">
      <div class="card-inner">
        <div class="query-section">
          <div class="section-title">
            <el-icon><Key /></el-icon>
            <span>输入卡密</span>
          </div>
          
          <el-form :model="queryForm" :rules="rules" ref="queryFormRef" @submit.prevent="handleQuery">
            <el-form-item prop="cardNumber">
              <div class="search-input-wrapper">
                <el-input
                  v-model="queryForm.cardNumber"
                  placeholder="请输入卡号进行查询..."
                  size="large"
                  clearable
                  @keyup.enter="handleQuery"
                  class="enhanced-input"
                >
                  <template #prefix>
                    <el-icon class="input-icon"><Key /></el-icon>
                  </template>
                </el-input>
                <el-button 
                  type="primary" 
                  @click="handleQuery" 
                  :loading="loading"
                  class="search-btn"
                  size="large"
                >
                  <el-icon><Search /></el-icon>
                  <span>查询</span>
                </el-button>
              </div>
            </el-form-item>
          </el-form>
          
          <!-- 快捷操作 -->
          <div class="quick-actions">
            <el-button 
              type="info" 
              plain 
              size="small"
              @click="showBatchDialog = true"
              class="action-btn"
            >
              <el-icon><Document /></el-icon>
              批量查询
            </el-button>
            <el-button 
              v-if="queryHistory.length > 0"
              type="warning" 
              plain 
              size="small"
              @click="clearHistory"
              class="action-btn"
            >
              <el-icon><Delete /></el-icon>
              清空历史
            </el-button>
          </div>
        </div>
        
        <!-- 查询历史 -->
        <div v-if="queryHistory.length > 0" class="history-section">
          <div class="section-title">
            <el-icon><Clock /></el-icon>
            <span>最近查询</span>
          </div>
          <div class="history-tags">
            <el-tag
              v-for="(item, index) in queryHistory.slice(0, 6)"
              :key="index"
              class="history-tag"
              type="info"
              effect="plain"
              closable
              @close="removeFromHistory(index)"
              @click="queryFromHistory(item)"
            >
              <el-icon><Key /></el-icon>
              {{ maskCardNumber(item) }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 查询结果 -->
    <transition name="result-fade">
      <div v-if="queryResult" class="result-section">
        <!-- 成功结果 -->
        <div v-if="queryResult.success" class="result-card success">
          <div class="result-header">
            <div class="result-icon success">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="result-title">
              <h3>查询成功</h3>
              <p>已找到卡密信息</p>
            </div>
            <div class="result-status">
              <el-tag 
                :type="getStatusType(queryResult.data.status)" 
                size="large"
                effect="dark"
                class="status-tag"
              >
                {{ getStatusText(queryResult.data.status) }}
              </el-tag>
            </div>
          </div>
          
          <div class="result-body">
            <!-- 卡密信息卡片 -->
            <div class="info-grid">
              <div class="info-card primary">
                <div class="info-icon">
                  <el-icon><Ticket /></el-icon>
                </div>
                <div class="info-content">
                  <span class="info-label">卡号</span>
                  <div class="info-value-row">
                    <span class="info-value card-number">{{ queryResult.data.cardNumber }}</span>
                    <el-button 
                      type="primary" 
                      text
                      size="small"
                      @click="copyCard(queryResult.data.cardNumber)"
                      class="copy-btn"
                    >
                      <el-icon><CopyDocument /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
              
              <div class="info-card">
                <div class="info-icon type">
                  <el-icon><PriceTag /></el-icon>
                </div>
                <div class="info-content">
                  <span class="info-label">卡密类型</span>
                  <span class="info-value">
                    <el-tag :type="getCardTypeTagType(queryResult.data.cardType)" size="small">
                      {{ queryResult.data.cardType || '标准卡' }}
                    </el-tag>
                  </span>
                </div>
              </div>
              
              <div class="info-card">
                <div class="info-icon value">
                  <el-icon><Coin /></el-icon>
                </div>
                <div class="info-content">
                  <span class="info-label">面值</span>
                  <span class="info-value highlight">{{ queryResult.data.value || '¥0.00' }}</span>
                </div>
              </div>
              
              <div class="info-card">
                <div class="info-icon time">
                  <el-icon><Calendar /></el-icon>
                </div>
                <div class="info-content">
                  <span class="info-label">创建时间</span>
                  <span class="info-value">{{ queryResult.data.createTime || '未知' }}</span>
                </div>
              </div>
              
              <div class="info-card">
                <div class="info-icon expire">
                  <el-icon><Timer /></el-icon>
                </div>
                <div class="info-content">
                  <span class="info-label">过期时间</span>
                  <span class="info-value">{{ queryResult.data.expireTime || '永久有效' }}</span>
                </div>
              </div>
              
              <div v-if="queryResult.data.useTime" class="info-card">
                <div class="info-icon used">
                  <el-icon><Check /></el-icon>
                </div>
                <div class="info-content">
                  <span class="info-label">使用时间</span>
                  <span class="info-value">{{ queryResult.data.useTime }}</span>
                </div>
              </div>
              
              <div v-if="queryResult.data.purchaser" class="info-card">
                <div class="info-icon user">
                  <el-icon><User /></el-icon>
                </div>
                <div class="info-content">
                  <span class="info-label">购买用户</span>
                  <span class="info-value">{{ queryResult.data.purchaser }}</span>
                </div>
              </div>
              
              <div v-if="queryResult.data.purchaseTime" class="info-card">
                <div class="info-icon purchase">
                  <el-icon><ShoppingCart /></el-icon>
                </div>
                <div class="info-content">
                  <span class="info-label">购买时间</span>
                  <span class="info-value">{{ queryResult.data.purchaseTime }}</span>
                </div>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="result-actions">
              <el-button 
                v-if="queryResult.data.status === 'unused'"
                type="success" 
                size="large"
                @click="useCard(queryResult.data.cardNumber)"
                :loading="useLoading"
                class="action-btn-large"
              >
                <el-icon><Key /></el-icon>
                使用此卡密
              </el-button>
              
              <el-button 
                v-if="queryResult.data.status === 'sold' && queryResult.data.purchasedBy"
                type="success" 
                size="large"
                @click="activateCard(queryResult.data.cardNumber)"
                :loading="activateLoading"
                class="action-btn-large"
              >
                <el-icon><Unlock /></el-icon>
                激活此卡密
              </el-button>
              
              <el-button 
                size="large"
                @click="queryAnother"
                class="action-btn-large secondary"
              >
                <el-icon><Refresh /></el-icon>
                查询其他
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 失败结果 -->
        <div v-else class="result-card error">
          <div class="result-header">
            <div class="result-icon error">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="result-title">
              <h3>查询失败</h3>
              <p>{{ queryResult.message || '未找到该卡密信息' }}</p>
            </div>
          </div>
          
          <div class="result-body">
            <div class="error-tips">
              <h4>可能的原因：</h4>
              <ul>
                <li>卡号输入错误，请检查是否有多余空格或字符</li>
                <li>该卡密不存在于系统中</li>
                <li>卡密已被删除或过期</li>
              </ul>
            </div>
            
            <div class="result-actions">
              <el-button 
                type="primary" 
                size="large"
                @click="queryAnother"
                class="action-btn-large"
              >
                <el-icon><Refresh /></el-icon>
                重新查询
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 批量查询对话框 -->
    <el-dialog 
      v-model="showBatchDialog" 
      title="批量查询" 
      width="650px"
      class="batch-dialog"
      :close-on-click-modal="false"
    >
      <div class="batch-query-content">
        <div class="batch-input-section">
          <div class="input-header">
            <el-icon><Document /></el-icon>
            <span>输入卡号列表</span>
            <el-tag size="small" type="info">每行一个</el-tag>
          </div>
          <el-input
            v-model="batchQuery.cardNumbers"
            type="textarea"
            :rows="8"
            placeholder="请输入卡号，每行一个&#10;例如：&#10;CARD-XXXX-XXXX-XXXX&#10;CARD-YYYY-YYYY-YYYY"
            class="batch-textarea"
          />
          <div class="input-footer">
            <span class="count-info">
              已输入 {{ getCardCount() }} 个卡号
            </span>
          </div>
        </div>
        
        <div v-if="batchResults.length > 0" class="batch-results">
          <div class="results-header">
            <h4>
              <el-icon><List /></el-icon>
              查询结果
            </h4>
            <div class="results-summary">
              <el-tag type="success" size="small">
                成功: {{ batchResults.filter(r => r.success).length }}
              </el-tag>
              <el-tag type="danger" size="small">
                失败: {{ batchResults.filter(r => !r.success).length }}
              </el-tag>
            </div>
          </div>
          <el-table :data="batchResults" max-height="300" class="batch-table">
            <el-table-column prop="cardNumber" label="卡号" min-width="180">
              <template #default="scope">
                <span class="table-card-number">{{ scope.row.cardNumber }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="查询状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.success ? 'success' : 'danger'" size="small">
                  {{ scope.row.success ? '找到' : '未找到' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="cardType" label="类型" width="100" />
            <el-table-column prop="value" label="面值" width="100" />
          </el-table>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showBatchDialog = false" size="large">关闭</el-button>
          <el-button 
            type="primary" 
            @click="handleBatchQuery" 
            :loading="batchLoading"
            size="large"
            :disabled="!batchQuery.cardNumbers.trim()"
          >
            <el-icon><Search /></el-icon>
            开始批量查询
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCardStore } from '@/stores/card'
import { 
  Key, Search, CopyDocument, Refresh, Document, Delete, Clock,
  CircleCheck, CircleClose, Ticket, PriceTag, Coin, Calendar,
  Timer, Check, User, ShoppingCart, Unlock, List
} from '@element-plus/icons-vue'

const cardStore = useCardStore()

const queryFormRef = ref()
const loading = ref(false)
const useLoading = ref(false)
const activateLoading = ref(false)
const batchLoading = ref(false)
const showBatchDialog = ref(false)
const queryResult = ref(null)
const queryHistory = ref([])
const batchResults = ref([])
const successCount = ref(0)

const queryForm = reactive({
  cardNumber: ''
})

const batchQuery = reactive({
  cardNumbers: ''
})

const rules = {
  cardNumber: [
    { required: true, message: '请输入卡号', trigger: 'blur' },
    { min: 10, message: '卡号长度不能少于10位', trigger: 'blur' }
  ]
}

// 计算批量输入的卡号数量
const getCardCount = () => {
  if (!batchQuery.cardNumbers.trim()) return 0
  return batchQuery.cardNumbers.split('\n').filter(line => line.trim()).length
}

// 遮罩卡号显示
const maskCardNumber = (cardNumber) => {
  if (cardNumber.length <= 8) return cardNumber
  return cardNumber.slice(0, 4) + '****' + cardNumber.slice(-4)
}

const handleQuery = async () => {
  if (!queryFormRef.value) return
  
  await queryFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      try {
        const result = await cardStore.queryCard(queryForm.cardNumber)
        
        queryResult.value = result
        
        if (result.success) {
          addToHistory(queryForm.cardNumber)
          successCount.value++
          ElMessage.success('查询成功')
        } else {
          ElMessage.error(result.message)
        }
      } finally {
        loading.value = false
      }
    }
  })
}

const handleBatchQuery = async () => {
  if (!batchQuery.cardNumbers.trim()) {
    ElMessage.error('请输入卡号')
    return
  }
  
  const cardNumbers = batchQuery.cardNumbers
    .split('\n')
    .map(card => card.trim())
    .filter(card => card)
  
  if (cardNumbers.length === 0) {
    ElMessage.error('请输入有效的卡号')
    return
  }
  
  batchLoading.value = true
  batchResults.value = []
  
  try {
    for (const cardNumber of cardNumbers) {
      const result = await cardStore.queryCard(cardNumber)
      
      batchResults.value.push({
        cardNumber,
        success: result.success,
        cardType: result.success ? result.data.cardType : '',
        value: result.success ? result.data.value : '',
        status: result.success ? result.data.status : ''
      })
    }
    
    ElMessage.success(`批量查询完成，共查询 ${cardNumbers.length} 张卡密`)
  } finally {
    batchLoading.value = false
  }
}

const useCard = async (cardNumber) => {
  try {
    await ElMessageBox.confirm(
      `确认使用卡密 ${cardNumber}？使用后将无法撤销。`,
      '确认使用',
      {
        confirmButtonText: '确认使用',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    useLoading.value = true
    
    const result = await cardStore.useCard(cardNumber)
    
    if (result.success) {
      ElMessage.success(result.message)
      queryResult.value.data.status = 'used'
      queryResult.value.data.useTime = new Date().toLocaleString('zh-CN')
    } else {
      ElMessage.error(result.message)
    }
  } catch {
    
  } finally {
    useLoading.value = false
  }
}

const activateCard = async (cardNumber) => {
  try {
    await ElMessageBox.confirm(
      `确认激活卡密 ${cardNumber}？激活后可正常使用。`,
      '确认激活',
      {
        confirmButtonText: '确认激活',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    activateLoading.value = true
    
    const result = await cardStore.activateCard(cardNumber, queryResult.value.data.purchasedBy)
    
    if (result.success) {
      ElMessage.success(result.message)
      queryResult.value.data.status = 'used'
      queryResult.value.data.useTime = new Date().toLocaleString('zh-CN')
    } else {
      ElMessage.error(result.message)
    }
  } catch {
    
  } finally {
    activateLoading.value = false
  }
}

const copyCard = async (cardNumber) => {
  try {
    await navigator.clipboard.writeText(cardNumber)
    ElMessage.success('卡号已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const queryAnother = () => {
  queryResult.value = null
  queryForm.cardNumber = ''
  
  if (queryFormRef.value) {
    queryFormRef.value.clearValidate()
  }
}

const queryFromHistory = (cardNumber) => {
  queryForm.cardNumber = cardNumber
  handleQuery()
}

const addToHistory = (cardNumber) => {
  if (!queryHistory.value.includes(cardNumber)) {
    queryHistory.value.unshift(cardNumber)
    
    if (queryHistory.value.length > 10) {
      queryHistory.value.pop()
    }
    
    localStorage.setItem('cardQueryHistory', JSON.stringify(queryHistory.value))
  }
}

const removeFromHistory = (index) => {
  queryHistory.value.splice(index, 1)
  localStorage.setItem('cardQueryHistory', JSON.stringify(queryHistory.value))
}

const clearHistory = () => {
  queryHistory.value = []
  localStorage.removeItem('cardQueryHistory')
  ElMessage.success('历史记录已清空')
}

const getStatusType = (status) => {
  return cardStore.getCardStatusType(status)
}

const getStatusText = (status) => {
  return cardStore.getCardStatusText(status)
}

const getCardTypeTagType = (type) => {
  const typeMap = {
    '月卡': 'success',
    '季卡': 'warning',
    '年卡': 'danger'
  }
  return typeMap[type] || 'info'
}

onMounted(() => {
  const history = localStorage.getItem('cardQueryHistory')
  if (history) {
    try {
      queryHistory.value = JSON.parse(history)
    } catch (error) {
      queryHistory.value = []
    }
  }
  
  // 加载成功查询计数
  const count = localStorage.getItem('cardQuerySuccessCount')
  if (count) {
    successCount.value = parseInt(count) || 0
  }
})
</script>


<style lang="scss" scoped>
.card-query-enhanced {
  min-height: 100%;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
  
  // 页面头部
  .query-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    padding: 28px 32px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 100%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    }
    
    .header-content {
      display: flex;
      align-items: center;
      gap: 20px;
      position: relative;
      z-index: 1;
      
      .header-icon {
        position: relative;
        
        .icon-wrapper {
          width: 64px;
          height: 64px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          
          .el-icon {
            font-size: 32px;
            color: white;
          }
        }
        
        .icon-glow {
          position: absolute;
          inset: -4px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          filter: blur(8px);
          z-index: -1;
        }
      }
      
      .header-text {
        h2 {
          font-size: 28px;
          font-weight: 700;
          color: white;
          margin: 0 0 8px 0;
          letter-spacing: -0.02em;
        }
        
        p {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.85);
          margin: 0;
        }
      }
    }
    
    .header-stats {
      display: flex;
      align-items: center;
      gap: 24px;
      position: relative;
      z-index: 1;
      
      .stat-item {
        text-align: center;
        
        .stat-value {
          display: block;
          font-size: 28px;
          font-weight: 700;
          color: white;
        }
        
        .stat-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
        }
      }
      
      .stat-divider {
        width: 1px;
        height: 40px;
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
  
  // 查询卡片
  .query-card {
    background: white;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(15, 23, 42, 0.06);
    overflow: hidden;
    margin-bottom: 24px;
    
    .card-inner {
      padding: 32px;
    }
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 20px;
      
      .el-icon {
        color: #6366f1;
        font-size: 20px;
      }
    }
    
    .query-section {
      .search-input-wrapper {
        display: flex;
        gap: 12px;
        
        .enhanced-input {
          flex: 1;
          
          :deep(.el-input__wrapper) {
            border-radius: 14px;
            padding: 4px 16px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            border: 2px solid #e2e8f0;
            transition: all 0.3s ease;
            
            &:hover {
              border-color: #c7d2fe;
            }
            
            &.is-focus {
              border-color: #6366f1;
              box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
            }
          }
          
          .input-icon {
            color: #94a3b8;
            font-size: 18px;
          }
        }
        
        .search-btn {
          padding: 0 28px;
          border-radius: 14px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border: none;
          font-weight: 600;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
          transition: all 0.3s ease;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
          }
          
          span {
            margin-left: 6px;
          }
        }
      }
      
      .quick-actions {
        display: flex;
        gap: 12px;
        margin-top: 16px;
        
        .action-btn {
          border-radius: 10px;
          font-weight: 500;
        }
      }
    }
    
    .history-section {
      margin-top: 28px;
      padding-top: 24px;
      border-top: 1px solid #f1f5f9;
      
      .history-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        
        .history-tag {
          padding: 8px 14px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          
          .el-icon {
            font-size: 14px;
          }
          
          &:hover {
            background: #6366f1;
            color: white;
            border-color: #6366f1;
            transform: translateY(-2px);
          }
        }
      }
    }
  }
  
  // 查询结果
  .result-section {
    .result-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      border: 1px solid rgba(15, 23, 42, 0.06);
      overflow: hidden;
      
      &.success {
        border-top: 4px solid #10b981;
      }
      
      &.error {
        border-top: 4px solid #ef4444;
      }
      
      .result-header {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 28px 32px;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-bottom: 1px solid #e2e8f0;
        
        .result-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          
          .el-icon {
            font-size: 28px;
            color: white;
          }
          
          &.success {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
          }
          
          &.error {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
          }
        }
        
        .result-title {
          flex: 1;
          
          h3 {
            font-size: 22px;
            font-weight: 700;
            color: #1e293b;
            margin: 0 0 6px 0;
          }
          
          p {
            font-size: 14px;
            color: #64748b;
            margin: 0;
          }
        }
        
        .result-status {
          .status-tag {
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 12px;
          }
        }
      }
      
      .result-body {
        padding: 32px;
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
          
          .info-card {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 20px;
            background: #f8fafc;
            border-radius: 14px;
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
              border-color: #c7d2fe;
            }
            
            &.primary {
              grid-column: 1 / -1;
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              border-color: #bae6fd;
            }
            
            .info-icon {
              width: 48px;
              height: 48px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
              flex-shrink: 0;
              
              .el-icon {
                font-size: 22px;
                color: white;
              }
              
              &.type { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
              &.value { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
              &.time { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
              &.expire { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
              &.used { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); }
              &.user { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); }
              &.purchase { background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); }
            }
            
            .info-content {
              flex: 1;
              min-width: 0;
              
              .info-label {
                display: block;
                font-size: 13px;
                color: #64748b;
                margin-bottom: 4px;
              }
              
              .info-value {
                font-size: 15px;
                font-weight: 600;
                color: #1e293b;
                
                &.highlight {
                  color: #10b981;
                  font-size: 18px;
                }
                
                &.card-number {
                  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
                  letter-spacing: 0.5px;
                }
              }
              
              .info-value-row {
                display: flex;
                align-items: center;
                gap: 8px;
                
                .copy-btn {
                  padding: 4px 8px;
                  border-radius: 6px;
                  
                  &:hover {
                    background: rgba(99, 102, 241, 0.1);
                  }
                }
              }
            }
          }
        }
        
        .error-tips {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 24px;
          
          h4 {
            font-size: 15px;
            font-weight: 600;
            color: #991b1b;
            margin: 0 0 12px 0;
          }
          
          ul {
            margin: 0;
            padding-left: 20px;
            
            li {
              color: #b91c1c;
              font-size: 14px;
              line-height: 1.8;
            }
          }
        }
        
        .result-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
          
          .action-btn-large {
            padding: 14px 32px;
            border-radius: 14px;
            font-weight: 600;
            font-size: 15px;
            transition: all 0.3s ease;
            
            &:not(.secondary) {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              border: none;
              box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
              
              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
              }
            }
            
            &.secondary {
              background: #f1f5f9;
              border: 1px solid #e2e8f0;
              color: #64748b;
              
              &:hover {
                background: #e2e8f0;
                color: #475569;
              }
            }
          }
        }
      }
    }
  }
  
  // 结果动画
  .result-fade-enter-active {
    animation: resultSlideIn 0.5s ease-out;
  }
  
  .result-fade-leave-active {
    animation: resultSlideIn 0.3s ease-in reverse;
  }
  
  @keyframes resultSlideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

// 批量查询对话框
.batch-dialog {
  :deep(.el-dialog) {
    border-radius: 20px;
    overflow: hidden;
    
    .el-dialog__header {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 20px 24px;
      border-bottom: 1px solid #e2e8f0;
      
      .el-dialog__title {
        font-size: 18px;
        font-weight: 700;
        color: #1e293b;
      }
    }
    
    .el-dialog__body {
      padding: 24px;
    }
    
    .el-dialog__footer {
      padding: 20px 24px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }
  }
  
  .batch-query-content {
    .batch-input-section {
      .input-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
        font-weight: 600;
        color: #1e293b;
        
        .el-icon {
          color: #6366f1;
        }
      }
      
      .batch-textarea {
        :deep(.el-textarea__inner) {
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          padding: 16px;
          font-family: 'SF Mono', 'Monaco', monospace;
          font-size: 14px;
          line-height: 1.6;
          
          &:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
          }
        }
      }
      
      .input-footer {
        margin-top: 8px;
        text-align: right;
        
        .count-info {
          font-size: 13px;
          color: #64748b;
        }
      }
    }
    
    .batch-results {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      
      .results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        
        h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
          
          .el-icon {
            color: #6366f1;
          }
        }
        
        .results-summary {
          display: flex;
          gap: 8px;
        }
      }
      
      .batch-table {
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #e2e8f0;
        
        .table-card-number {
          font-family: 'SF Mono', 'Monaco', monospace;
          font-size: 13px;
          color: #475569;
        }
      }
    }
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    
    .el-button {
      border-radius: 10px;
      font-weight: 500;
      
      &.el-button--primary {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        border: none;
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .card-query-enhanced {
    padding: 16px;
    
    .query-header {
      flex-direction: column;
      gap: 20px;
      padding: 24px 20px;
      text-align: center;
      
      .header-content {
        flex-direction: column;
        
        .header-text h2 {
          font-size: 24px;
        }
      }
    }
    
    .query-card {
      .card-inner {
        padding: 20px;
      }
      
      .query-section {
        .search-input-wrapper {
          flex-direction: column;
          
          .search-btn {
            width: 100%;
          }
        }
      }
    }
    
    .result-section {
      .result-card {
        .result-header {
          flex-direction: column;
          text-align: center;
          gap: 16px;
          padding: 24px 20px;
        }
        
        .result-body {
          padding: 20px;
          
          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .result-actions {
            flex-direction: column;
            
            .action-btn-large {
              width: 100%;
            }
          }
        }
      }
    }
  }
}
</style>
