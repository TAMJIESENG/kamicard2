<template>
  <div class="card-generator-enhanced">
    <!-- 页面头部 -->
    <div class="generator-header">
      <div class="header-content">
        <div class="header-icon">
          <div class="icon-wrapper">
            <el-icon><Ticket /></el-icon>
          </div>
          <div class="icon-pulse"></div>
        </div>
        <div class="header-text">
          <h2>卡密生成中心</h2>
          <p>快速批量生成各类型卡密，支持自定义配置</p>
        </div>
      </div>
      <el-button type="primary" size="large" @click="showGenerateDialog = true" class="generate-main-btn">
        <el-icon><Plus /></el-icon>
        生成卡密
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card total">
        <div class="stat-icon">
          <el-icon><DataAnalysis /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.totalGenerated }}</span>
          <span class="stat-label">总生成数</span>
        </div>
        <div class="stat-trend up">
          <el-icon><TrendCharts /></el-icon>
          +12%
        </div>
      </div>
      
      <div class="stat-card unused">
        <div class="stat-icon">
          <el-icon><Ticket /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.unusedCount }}</span>
          <span class="stat-label">未使用</span>
        </div>
        <div class="stat-progress">
          <div class="progress-bar" :style="{ width: getUnusedPercent() + '%' }"></div>
        </div>
      </div>
      
      <div class="stat-card used">
        <div class="stat-icon">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.usedCount }}</span>
          <span class="stat-label">已使用</span>
        </div>
        <div class="stat-progress">
          <div class="progress-bar" :style="{ width: getUsedPercent() + '%' }"></div>
        </div>
      </div>
      
      <div class="stat-card expired">
        <div class="stat-icon">
          <el-icon><Timer /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.expiredCount }}</span>
          <span class="stat-label">已过期</span>
        </div>
        <div class="stat-badge">
          <el-tag type="danger" size="small">需清理</el-tag>
        </div>
      </div>
    </div>

    <!-- 快捷生成区域 -->
    <div class="quick-generate-section">
      <div class="section-header">
        <div class="section-title">
          <el-icon><Lightning /></el-icon>
          <span>快捷生成</span>
        </div>
        <span class="section-desc">一键快速生成常用卡密</span>
      </div>
      
      <div class="quick-cards">
        <div class="quick-card monthly" @click="quickGenerate('monthly', 10)">
          <div class="card-glow"></div>
          <div class="card-content">
            <div class="card-icon">
              <span>🗓️</span>
            </div>
            <div class="card-info">
              <h4>月卡</h4>
              <p>生成10张 · ¥29.90/张</p>
            </div>
            <div class="card-action">
              <el-button type="success" circle size="small" :loading="loading && currentQuickType === 'monthly'">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
        
        <div class="quick-card quarterly" @click="quickGenerate('quarterly', 5)">
          <div class="card-glow"></div>
          <div class="card-content">
            <div class="card-icon">
              <span>📅</span>
            </div>
            <div class="card-info">
              <h4>季卡</h4>
              <p>生成5张 · ¥79.90/张</p>
            </div>
            <div class="card-action">
              <el-button type="warning" circle size="small" :loading="loading && currentQuickType === 'quarterly'">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
        
        <div class="quick-card yearly" @click="quickGenerate('yearly', 2)">
          <div class="card-glow"></div>
          <div class="card-content">
            <div class="card-icon">
              <span>🎯</span>
            </div>
            <div class="card-info">
              <h4>年卡</h4>
              <p>生成2张 · ¥299.90/张</p>
            </div>
            <div class="card-action">
              <el-button type="danger" circle size="small" :loading="loading && currentQuickType === 'yearly'">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 生成对话框 -->
    <el-dialog 
      v-model="showGenerateDialog" 
      title="批量生成卡密" 
      width="550px"
      class="generate-dialog"
      @close="resetForm"
    >
      <div class="dialog-content">
        <el-form :model="generateForm" :rules="rules" ref="generateFormRef" label-width="100px" class="generate-form">
          <el-form-item label="卡密类型" prop="type">
            <el-select v-model="generateForm.type" placeholder="请选择卡密类型" class="full-width" size="large">
              <el-option 
                v-for="option in cardTypeOptions" 
                :key="option.value"
                :label="option.label" 
                :value="option.value"
              >
                <div class="type-option">
                  <span class="type-icon">{{ option.icon }}</span>
                  <span class="type-label">{{ option.label }}</span>
                  <span class="type-price">¥{{ option.price }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="生成数量" prop="quantity">
            <el-input-number 
              v-model="generateForm.quantity" 
              :min="1" 
              :max="1000" 
              :step="10"
              class="full-width"
              size="large"
            />
          </el-form-item>
          
          <el-form-item label="卡密面值" prop="value">
            <el-input 
              v-model="generateForm.value" 
              placeholder="请输入面值"
              class="full-width"
              size="large"
            >
              <template #prefix>
                <span class="price-prefix">¥</span>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="批次标识">
            <el-input 
              v-model="generateForm.batchId" 
              placeholder="可选，用于标识这批卡密"
              class="full-width"
              size="large"
            />
          </el-form-item>
          
          <el-form-item label="有效期">
            <el-date-picker
              v-model="generateForm.expireTime"
              type="datetime"
              placeholder="选择过期时间（不选则永久有效）"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="full-width"
              size="large"
            />
          </el-form-item>
        </el-form>
        
        <!-- 预览卡片 -->
        <div class="generate-preview">
          <div class="preview-header">
            <el-icon><View /></el-icon>
            <span>生成预览</span>
          </div>
          <div class="preview-content">
            <div class="preview-item">
              <span class="preview-label">预计生成</span>
              <span class="preview-value">{{ generateForm.quantity }} 张{{ getCardTypeName(generateForm.type) }}</span>
            </div>
            <div class="preview-item highlight">
              <span class="preview-label">总价值</span>
              <span class="preview-value">¥{{ calculateTotalValue() }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showGenerateDialog = false" size="large">取消</el-button>
          <el-button type="primary" @click="handleGenerate" :loading="loading" size="large" class="confirm-btn">
            <el-icon><Check /></el-icon>
            确认生成
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 生成结果对话框 -->
    <el-dialog 
      v-model="showResultDialog" 
      title="生成结果" 
      width="700px"
      class="result-dialog"
      :close-on-click-modal="false"
    >
      <div class="result-content">
        <div class="result-header">
          <div class="success-animation">
            <div class="success-circle">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="success-rings">
              <div class="ring ring-1"></div>
              <div class="ring ring-2"></div>
              <div class="ring ring-3"></div>
            </div>
          </div>
          <h3>生成成功！</h3>
          <p>已成功生成 <strong>{{ generatedCards.length }}</strong> 张卡密</p>
        </div>
        
        <div class="result-actions">
          <el-button type="primary" size="large" @click="exportGeneratedCards" class="action-btn">
            <el-icon><Download /></el-icon>
            导出卡密
          </el-button>
          <el-button size="large" @click="copyAllCards" class="action-btn">
            <el-icon><CopyDocument /></el-icon>
            复制所有
          </el-button>
        </div>
        
        <div class="card-list-section">
          <div class="list-header">
            <span>卡密列表</span>
            <el-tag type="info" size="small">共 {{ generatedCards.length }} 张</el-tag>
          </div>
          <el-table :data="generatedCards" max-height="300" class="card-table">
            <el-table-column prop="cardNumber" label="卡号" min-width="200">
              <template #default="scope">
                <span class="card-number-cell">{{ scope.row.cardNumber }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="cardType" label="类型" width="100">
              <template #default="scope">
                <el-tag :type="getCardTypeTag(scope.row.cardType)" size="small">
                  {{ scope.row.cardType }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="value" label="面值" width="100">
              <template #default="scope">
                <span class="value-cell">¥{{ scope.row.value }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="scope">
                <el-button 
                  type="primary" 
                  text
                  size="small"
                  @click="copyCard(scope.row.cardNumber)"
                >
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" size="large" @click="showResultDialog = false">
            完成
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useCardStore } from '@/stores/card'
import { AuditLogger } from '@/utils/security'
import { 
  Plus, CircleCheck, Download, CopyDocument, Ticket, DataAnalysis,
  Timer, Lightning, View, Check, TrendCharts
} from '@element-plus/icons-vue'

const cardStore = useCardStore()

const showGenerateDialog = ref(false)
const showResultDialog = ref(false)
const generateFormRef = ref()
const loading = ref(false)
const currentQuickType = ref('')
const generatedCards = ref([])

const stats = reactive({
  totalGenerated: 156,
  unusedCount: 89,
  usedCount: 52,
  expiredCount: 15
})

const generateForm = reactive({
  type: '',
  quantity: 10,
  value: '',
  batchId: '',
  expireTime: null
})

const cardTypeOptions = [
  { label: '月卡', value: 'monthly', icon: '🗓️', price: '29.90' },
  { label: '季卡', value: 'quarterly', icon: '📅', price: '79.90' },
  { label: '年卡', value: 'yearly', icon: '🎯', price: '299.90' }
]

const rules = {
  type: [{ required: true, message: '请选择卡密类型', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入生成数量', trigger: 'blur' }],
  value: [
    { required: true, message: '请输入卡密面值', trigger: 'blur' },
    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入正确的金额格式', trigger: 'blur' }
  ]
}

const getUnusedPercent = () => {
  if (stats.totalGenerated === 0) return 0
  return Math.round((stats.unusedCount / stats.totalGenerated) * 100)
}

const getUsedPercent = () => {
  if (stats.totalGenerated === 0) return 0
  return Math.round((stats.usedCount / stats.totalGenerated) * 100)
}

const getCardTypeName = (type) => {
  const option = cardTypeOptions.find(opt => opt.value === type)
  return option ? option.label : ''
}

const getCardTypeTag = (type) => {
  const map = { '月卡': 'success', '季卡': 'warning', '年卡': 'danger' }
  return map[type] || 'info'
}

const calculateTotalValue = () => {
  if (generateForm.value && generateForm.quantity) {
    return (parseFloat(generateForm.value) * generateForm.quantity).toFixed(2)
  }
  return '0.00'
}

const quickGenerate = async (type, quantity) => {
  const valueMap = { monthly: '29.90', quarterly: '79.90', yearly: '299.90' }
  
  loading.value = true
  currentQuickType.value = type
  
  try {
    const result = await cardStore.generateCards({ type, quantity, value: valueMap[type] })
    
    if (result.success) {
      ElMessage.success(result.message)
      generatedCards.value = result.data.cards
      showResultDialog.value = true
      updateStats()
      AuditLogger.logCardOperation('upload', { type, quantity, value: valueMap[type], cards: result.data.cards.length, operator: 'admin' })
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    loading.value = false
    currentQuickType.value = ''
  }
}

const handleGenerate = async () => {
  if (!generateFormRef.value) return
  
  await generateFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      try {
        const result = await cardStore.generateCards(generateForm)
        
        if (result.success) {
          ElMessage.success(result.message)
          generatedCards.value = result.data.cards
          showGenerateDialog.value = false
          showResultDialog.value = true
          updateStats()
          AuditLogger.logCardOperation('upload', { type: generateForm.type, quantity: generateForm.quantity, value: generateForm.value, cards: result.data.cards.length, operator: 'admin' })
        } else {
          ElMessage.error(result.message)
        }
      } finally {
        loading.value = false
      }
    }
  })
}

const resetForm = () => {
  generateForm.type = ''
  generateForm.quantity = 10
  generateForm.value = ''
  generateForm.batchId = ''
  generateForm.expireTime = null
  if (generateFormRef.value) generateFormRef.value.clearValidate()
}

const copyCard = async (cardNumber) => {
  try {
    await navigator.clipboard.writeText(cardNumber)
    ElMessage.success('卡号已复制')
    AuditLogger.logCardOperation('copy', { cardNumber: cardNumber.substring(0, 8) + '...', operator: 'admin' })
  } catch { ElMessage.error('复制失败') }
}

const copyAllCards = async () => {
  const cardNumbers = generatedCards.value.map(card => card.cardNumber).join('\n')
  try {
    await navigator.clipboard.writeText(cardNumbers)
    ElMessage.success('所有卡号已复制')
    AuditLogger.logCardOperation('copy', { cardCount: generatedCards.value.length, operator: 'admin', type: 'batch_copy' })
  } catch { ElMessage.error('复制失败') }
}

const exportGeneratedCards = () => {
  cardStore.exportCards(generatedCards.value)
  ElMessage.success('导出成功')
}

const updateStats = () => {
  stats.totalGenerated += generatedCards.value.length
  stats.unusedCount += generatedCards.value.length
}

onMounted(() => {})
</script>


<style lang="scss" scoped>
.card-generator-enhanced {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
  min-height: 100%;
  
  // 页面头部
  .generator-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    padding: 28px 32px;
    background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 60%;
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
          
          .el-icon { font-size: 32px; color: white; }
        }
        
        .icon-pulse {
          position: absolute;
          inset: -8px;
          border-radius: 24px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          animation: pulse-ring 2s infinite;
        }
      }
      
      .header-text {
        h2 { font-size: 28px; font-weight: 700; color: white; margin: 0 0 8px 0; }
        p { font-size: 15px; color: rgba(255, 255, 255, 0.85); margin: 0; }
      }
    }
    
    .generate-main-btn {
      padding: 14px 28px;
      border-radius: 14px;
      background: white;
      color: #059669;
      border: none;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      position: relative;
      z-index: 1;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }
    }
  }
  
  @keyframes pulse-ring {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(1.3); opacity: 0; }
  }
  
  // 统计卡片
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 32px;
    
    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(15, 23, 42, 0.06);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
      }
      
      .stat-icon {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        
        .el-icon { font-size: 24px; color: white; }
      }
      
      .stat-content {
        flex: 1;
        
        .stat-value { display: block; font-size: 28px; font-weight: 700; color: #1e293b; line-height: 1.2; }
        .stat-label { font-size: 13px; color: #64748b; }
      }
      
      &.total {
        .stat-icon { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); }
        .stat-trend { color: #10b981; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 4px; }
      }
      
      &.unused {
        .stat-icon { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
        .stat-progress { position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: #e2e8f0;
          .progress-bar { height: 100%; background: linear-gradient(90deg, #10b981, #059669); transition: width 0.5s ease; }
        }
      }
      
      &.used {
        .stat-icon { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
        .stat-progress { position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: #e2e8f0;
          .progress-bar { height: 100%; background: linear-gradient(90deg, #3b82f6, #2563eb); transition: width 0.5s ease; }
        }
      }
      
      &.expired {
        .stat-icon { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
        .stat-badge { position: absolute; top: 12px; right: 12px; }
      }
    }
  }
  
  // 快捷生成区域
  .quick-generate-section {
    background: white;
    border-radius: 20px;
    padding: 28px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(15, 23, 42, 0.06);
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      
      .section-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
        
        .el-icon { color: #f59e0b; font-size: 22px; }
      }
      
      .section-desc { font-size: 14px; color: #64748b; }
    }
    
    .quick-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      
      .quick-card {
        position: relative;
        border-radius: 16px;
        padding: 24px;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        
        .card-glow {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        &:hover {
          transform: translateY(-6px) scale(1.02);
          
          .card-glow { opacity: 1; }
          .card-action .el-button { transform: scale(1.1); }
        }
        
        .card-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .card-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .card-info {
          flex: 1;
          
          h4 { font-size: 18px; font-weight: 600; color: white; margin: 0 0 4px 0; }
          p { font-size: 13px; color: rgba(255, 255, 255, 0.85); margin: 0; }
        }
        
        .card-action {
          .el-button { transition: transform 0.3s ease; }
        }
        
        &.monthly {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
          .card-glow { background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 70%); }
        }
        
        &.quarterly {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          box-shadow: 0 8px 24px rgba(245, 158, 11, 0.3);
          .card-glow { background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 70%); }
        }
        
        &.yearly {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
          .card-glow { background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 70%); }
        }
      }
    }
  }
}

// 生成对话框
.generate-dialog {
  :deep(.el-dialog) {
    border-radius: 20px;
    overflow: hidden;
    
    .el-dialog__header {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 20px 24px;
      border-bottom: 1px solid #e2e8f0;
      
      .el-dialog__title { font-size: 18px; font-weight: 700; color: #1e293b; }
    }
    
    .el-dialog__body { padding: 24px; }
    .el-dialog__footer { padding: 20px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
  }
  
  .generate-form {
    :deep(.el-form-item__label) { font-weight: 500; color: #374151; }
    
    :deep(.el-input__wrapper),
    :deep(.el-select .el-input__wrapper) {
      border-radius: 10px;
      border: 2px solid #e2e8f0;
      
      &:hover { border-color: #c7d2fe; }
      &.is-focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
    }
    
    .price-prefix { color: #10b981; font-weight: 600; }
    
    .type-option {
      display: flex;
      align-items: center;
      gap: 10px;
      
      .type-icon { font-size: 18px; }
      .type-label { flex: 1; }
      .type-price { color: #10b981; font-weight: 600; font-size: 13px; }
    }
  }
  
  .generate-preview {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border: 1px solid #bae6fd;
    border-radius: 14px;
    padding: 20px;
    margin-top: 8px;
    
    .preview-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #0369a1;
      margin-bottom: 16px;
      
      .el-icon { font-size: 18px; }
    }
    
    .preview-content {
      display: flex;
      justify-content: space-between;
      
      .preview-item {
        .preview-label { display: block; font-size: 13px; color: #64748b; margin-bottom: 4px; }
        .preview-value { font-size: 16px; font-weight: 600; color: #1e293b; }
        
        &.highlight .preview-value { color: #10b981; font-size: 20px; }
      }
    }
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    
    .el-button { border-radius: 10px; font-weight: 500; }
    .confirm-btn { background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; }
  }
}

// 结果对话框
.result-dialog {
  :deep(.el-dialog) {
    border-radius: 20px;
    overflow: hidden;
    
    .el-dialog__header {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 20px 24px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .el-dialog__body { padding: 0; }
    .el-dialog__footer { padding: 20px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
  }
  
  .result-content {
    .result-header {
      text-align: center;
      padding: 40px 24px;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      
      .success-animation {
        position: relative;
        width: 80px;
        height: 80px;
        margin: 0 auto 20px;
        
        .success-circle {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
          animation: scaleIn 0.5s ease-out;
          
          .el-icon { font-size: 40px; color: white; }
        }
        
        .success-rings {
          position: absolute;
          inset: 0;
          
          .ring {
            position: absolute;
            inset: 0;
            border: 2px solid #10b981;
            border-radius: 50%;
            animation: ringExpand 1.5s ease-out infinite;
            
            &.ring-1 { animation-delay: 0s; }
            &.ring-2 { animation-delay: 0.3s; }
            &.ring-3 { animation-delay: 0.6s; }
          }
        }
      }
      
      h3 { font-size: 24px; font-weight: 700; color: #065f46; margin: 0 0 8px 0; }
      p { font-size: 16px; color: #047857; margin: 0;
        strong { color: #059669; font-size: 20px; }
      }
    }
    
    @keyframes scaleIn {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }
    
    @keyframes ringExpand {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(2); opacity: 0; }
    }
    
    .result-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      padding: 24px;
      border-bottom: 1px solid #e2e8f0;
      
      .action-btn {
        border-radius: 12px;
        font-weight: 500;
        padding: 12px 24px;
        
        &.el-button--primary {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border: none;
        }
      }
    }
    
    .card-list-section {
      padding: 24px;
      
      .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        font-weight: 600;
        color: #1e293b;
      }
      
      .card-table {
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #e2e8f0;
        
        .card-number-cell { font-family: 'SF Mono', monospace; font-size: 13px; color: #475569; }
        .value-cell { color: #10b981; font-weight: 600; }
      }
    }
  }
  
  .dialog-footer {
    display: flex;
    justify-content: center;
    
    .el-button {
      border-radius: 12px;
      padding: 12px 48px;
      font-weight: 600;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: none;
    }
  }
}

// 响应式
@media (max-width: 1200px) {
  .card-generator-enhanced {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .quick-generate-section .quick-cards { grid-template-columns: 1fr; }
  }
}

@media (max-width: 768px) {
  .card-generator-enhanced {
    padding: 16px;
    
    .generator-header {
      flex-direction: column;
      gap: 20px;
      padding: 24px 20px;
      text-align: center;
      
      .header-content { flex-direction: column; }
      .generate-main-btn { width: 100%; }
    }
    
    .stats-grid { grid-template-columns: 1fr; gap: 12px; }
  }
}
</style>
