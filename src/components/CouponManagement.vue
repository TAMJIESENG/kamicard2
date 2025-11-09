<template>
  <div class="coupon-management">
    <div class="page-header">
      <div class="header-content">
        <h2>优惠券管理</h2>
        <p>创建和管理优惠券，提升用户购买体验</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          创建优惠券
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><Ticket /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ coupons.length }}</div>
          <div class="stat-label">总优惠券</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon active">
          <el-icon><Check /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ activeCoupons.length }}</div>
          <div class="stat-label">有效优惠券</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon used">
          <el-icon><DocumentChecked /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ totalUsedCount }}</div>
          <div class="stat-label">总使用次数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon discount">
          <el-icon><Money /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">¥{{ totalDiscountAmount.toFixed(2) }}</div>
          <div class="stat-label">总优惠金额</div>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <div class="filter-left">
        <el-input
          v-model="searchQuery"
          placeholder="搜索优惠券名称或代码"
          clearable
          style="width: 300px;"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 150px; margin-left: 12px;">
          <el-option label="全部" value="" />
          <el-option label="有效" value="active" />
          <el-option label="已过期" value="expired" />
          <el-option label="已停用" value="inactive" />
        </el-select>
        
        <el-select v-model="typeFilter" placeholder="类型筛选" clearable style="width: 150px; margin-left: 12px;">
          <el-option label="全部" value="" />
          <el-option label="百分比折扣" value="percentage" />
          <el-option label="固定金额" value="fixed" />
          <el-option label="满减优惠" value="threshold" />
        </el-select>
      </div>
      
      <div class="filter-right">
        <el-button @click="refreshCoupons">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 优惠券列表 -->
    <div class="coupons-table">
      <el-table
        :data="filteredCoupons"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="优惠券名称" width="200">
          <template #default="{ row }">
            <div class="coupon-name-cell">
              <div class="name">{{ row.name }}</div>
              <div class="code">{{ row.code }}</div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="value" label="优惠内容" width="150">
          <template #default="{ row }">
            <div class="discount-info">
              {{ getDiscountDescription(row) }}
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="usage" label="使用情况" width="120">
          <template #default="{ row }">
            <div class="usage-info">
              <div class="used">{{ row.usedCount }}</div>
              <div class="total">/ {{ row.usageLimit }}</div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="validTo" label="有效期" width="180">
          <template #default="{ row }">
            <div class="validity-info">
              <div class="from">{{ formatDate(row.validFrom) }}</div>
              <div class="to">{{ formatDate(row.validTo) }}</div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row)">
              {{ getStatusLabel(row) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="isPublic" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isPublic ? 'success' : 'warning'" size="small">
              {{ row.isPublic ? '公开' : '专属' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="userId" label="专属用户" width="150">
          <template #default="{ row }">
            <span v-if="row.userId">{{ getUserName(row.userId) }}</span>
            <span v-else-if="row.userIds && row.userIds.length > 0">
              {{ row.userIds.length }}个用户
            </span>
            <span v-else style="color: #999;">-</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editCoupon(row)">编辑</el-button>
            <el-button 
              size="small" 
              type="info"
              @click="showSendCouponDialog(row)"
            >
              发送
            </el-button>
            <el-button 
              size="small" 
              :type="row.isActive ? 'warning' : 'success'"
              @click="toggleCouponStatus(row)"
            >
              {{ row.isActive ? '停用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="deleteCoupon(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 创建/编辑优惠券对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingCoupon ? '编辑优惠券' : '创建优惠券'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="couponFormRef"
        :model="couponForm"
        :rules="couponRules"
        label-width="120px"
      >
        <el-form-item label="优惠券名称" prop="name">
          <el-input v-model="couponForm.name" placeholder="请输入优惠券名称" />
        </el-form-item>
        
        <el-form-item label="优惠券代码" prop="code">
          <el-input 
            v-model="couponForm.code" 
            placeholder="请输入优惠券代码"
            :disabled="editingCoupon"
          />
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="couponForm.description" 
            type="textarea" 
            placeholder="请输入优惠券描述"
            :rows="2"
          />
        </el-form-item>
        
        <el-form-item label="优惠券类型" prop="type">
          <el-select v-model="couponForm.type" placeholder="选择优惠券类型" style="width: 100%;">
            <el-option label="百分比折扣" value="percentage" />
            <el-option label="固定金额" value="fixed" />
            <el-option label="满减优惠" value="threshold" />
          </el-select>
        </el-form-item>
        
        <!-- 百分比折扣 -->
        <template v-if="couponForm.type === 'percentage'">
          <el-form-item label="折扣百分比" prop="value">
            <el-input-number 
              v-model="couponForm.value" 
              :min="1" 
              :max="99" 
              placeholder="折扣百分比"
              style="width: 100%;"
            />
            <span style="margin-left: 8px;">%</span>
          </el-form-item>
          <el-form-item label="最大折扣金额">
            <el-input-number 
              v-model="couponForm.maxDiscount" 
              :min="0" 
              placeholder="最大折扣金额（可选）"
              style="width: 100%;"
            />
          </el-form-item>
        </template>
        
        <!-- 固定金额 -->
        <template v-if="couponForm.type === 'fixed'">
          <el-form-item label="折扣金额" prop="value">
            <el-input-number 
              v-model="couponForm.value" 
              :min="0.01" 
              placeholder="折扣金额"
              style="width: 100%;"
            />
            <span style="margin-left: 8px;">元</span>
          </el-form-item>
        </template>
        
        <!-- 满减优惠 -->
        <template v-if="couponForm.type === 'threshold'">
          <el-form-item label="最低消费金额" prop="minAmount">
            <el-input-number 
              v-model="couponForm.minAmount" 
              :min="0" 
              placeholder="最低消费金额"
              style="width: 100%;"
            />
            <span style="margin-left: 8px;">元</span>
          </el-form-item>
          <el-form-item label="减免金额" prop="discountAmount">
            <el-input-number 
              v-model="couponForm.discountAmount" 
              :min="0.01" 
              placeholder="减免金额"
              style="width: 100%;"
            />
            <span style="margin-left: 8px;">元</span>
          </el-form-item>
        </template>
        
        <el-form-item label="最低消费金额">
          <el-input-number 
            v-model="couponForm.minAmount" 
            :min="0" 
            placeholder="最低消费金额（可选）"
            style="width: 100%;"
          />
          <span style="margin-left: 8px;">元</span>
        </el-form-item>
        
        <el-form-item label="使用次数限制" prop="usageLimit">
          <el-input-number 
            v-model="couponForm.usageLimit" 
            :min="1" 
            placeholder="使用次数限制"
            style="width: 100%;"
          />
        </el-form-item>
        
        <el-form-item label="有效期">
          <el-date-picker
            v-model="validityRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss.sssZ"
            style="width: 100%;"
          />
        </el-form-item>
        
        <el-form-item label="优惠券类型">
          <el-radio-group v-model="couponForm.isPublic">
            <el-radio :label="true">公开优惠券</el-radio>
            <el-radio :label="false">专属优惠券</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-switch 
            v-model="couponForm.isActive" 
            active-text="启用" 
            inactive-text="停用"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="saveCoupon" :loading="saving">
            {{ editingCoupon ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 发送优惠券对话框 -->
    <el-dialog
      v-model="showSendDialog"
      title="发送优惠券给用户"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form label-width="100px">
        <el-form-item label="优惠券">
          <el-input :value="sendingCoupon?.name" disabled />
        </el-form-item>
        
        <el-form-item label="选择用户">
          <el-select
            v-model="selectedUserIds"
            multiple
            filterable
            placeholder="请选择用户"
            style="width: 100%;"
            :loading="loadingUsers"
            no-data-text="暂无用户可选择"
          >
            <el-option
              v-for="user in allUsers"
              :key="user.id"
              :label="`${user.username}${user.email ? ' (' + user.email + ')' : ''}${user.role === 'admin' ? ' [管理员]' : ''}${user.status === 'disabled' ? ' [已禁用]' : ''}`"
              :value="user.id"
              :disabled="user.status === 'disabled'"
            >
              <span style="float: left">
                {{ user.username }}
                <el-tag v-if="user.role === 'admin'" size="small" type="warning" style="margin-left: 8px;">
                  管理员
                </el-tag>
              </span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ user.email || '无邮箱' }}
                <el-tag v-if="user.status === 'disabled'" size="small" type="danger" style="margin-left: 8px;">
                  已禁用
                </el-tag>
              </span>
            </el-option>
          </el-select>
          <div v-if="allUsers.length === 0" style="margin-top: 8px; color: #909399; font-size: 12px;">
            提示：已禁用的用户无法接收优惠券
          </div>
          <div v-else style="margin-top: 8px; color: #909399; font-size: 12px;">
            提示：可以选择管理员和普通用户发送优惠券，已禁用的用户无法接收
          </div>
        </el-form-item>
        
        <el-alert
          type="info"
          :closable="false"
          style="margin-bottom: 20px;"
        >
          专属优惠券只能被指定的用户使用，其他用户无法使用此优惠券
        </el-alert>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showSendDialog = false">取消</el-button>
          <el-button type="primary" @click="sendCouponToUsers" :loading="sending">
            发送
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Ticket, Check, DocumentChecked, Money, Search, Refresh
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const showCreateDialog = ref(false)
const editingCoupon = ref(null)
const coupons = ref([])
const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const validityRange = ref([])
const showSendDialog = ref(false)
const sendingCoupon = ref(null)
const selectedUserIds = ref([])
const allUsers = ref([])
const sending = ref(false)
const loadingUsers = ref(false)

// 表单数据
const couponForm = reactive({
  name: '',
  code: '',
  description: '',
  type: 'percentage',
  value: 10,
  maxDiscount: null,
  minAmount: 0,
  discountAmount: null,
  usageLimit: 100,
  isActive: true,
  isPublic: true,
  userId: null,
  userIds: null
})

// 表单验证规则
const couponRules = {
  name: [
    { required: true, message: '请输入优惠券名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入优惠券代码', trigger: 'blur' },
    { pattern: /^[A-Z0-9_]+$/, message: '优惠券代码只能包含大写字母、数字和下划线', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入优惠券描述', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择优惠券类型', trigger: 'change' }
  ],
  value: [
    { required: true, message: '请输入优惠值', trigger: 'blur' }
  ],
  usageLimit: [
    { required: true, message: '请输入使用次数限制', trigger: 'blur' }
  ]
}

// 计算属性
const activeCoupons = computed(() => {
  return coupons.value.filter(coupon => 
    coupon.isActive && 
    new Date(coupon.validTo) > new Date() &&
    coupon.usedCount < coupon.usageLimit
  )
})

const totalUsedCount = computed(() => {
  return coupons.value.reduce((total, coupon) => total + coupon.usedCount, 0)
})

const totalDiscountAmount = computed(() => {
  // 这里可以根据实际使用情况计算总优惠金额
  return coupons.value.reduce((total, coupon) => {
    if (coupon.type === 'percentage') {
      return total + (coupon.usedCount * (coupon.maxDiscount || 50))
    } else if (coupon.type === 'fixed') {
      return total + (coupon.usedCount * coupon.value)
    } else if (coupon.type === 'threshold') {
      return total + (coupon.usedCount * coupon.discountAmount)
    }
    return total
  }, 0)
})

const filteredCoupons = computed(() => {
  let filtered = coupons.value
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(coupon => 
      coupon.name.toLowerCase().includes(query) ||
      coupon.code.toLowerCase().includes(query)
    )
  }
  
  // 状态过滤
  if (statusFilter.value) {
    filtered = filtered.filter(coupon => {
      if (statusFilter.value === 'active') {
        return coupon.isActive && new Date(coupon.validTo) > new Date() && coupon.usedCount < coupon.usageLimit
      } else if (statusFilter.value === 'expired') {
        return new Date(coupon.validTo) <= new Date()
      } else if (statusFilter.value === 'inactive') {
        return !coupon.isActive
      }
      return true
    })
  }
  
  // 类型过滤
  if (typeFilter.value) {
    filtered = filtered.filter(coupon => coupon.type === typeFilter.value)
  }
  
  return filtered
})

// 方法
const loadCoupons = () => {
  loading.value = true
  try {
    const storedCoupons = JSON.parse(localStorage.getItem('coupons') || '[]')
    coupons.value = storedCoupons
  } catch (error) {
    console.error('加载优惠券失败:', error)
    ElMessage.error('加载优惠券失败')
  } finally {
    loading.value = false
  }
}

const refreshCoupons = () => {
  loadCoupons()
  ElMessage.success('优惠券列表已刷新')
}

const getTypeTagType = (type) => {
  const typeMap = {
    'percentage': 'success',
    'fixed': 'warning',
    'threshold': 'info'
  }
  return typeMap[type] || 'info'
}

const getTypeLabel = (type) => {
  const typeMap = {
    'percentage': '百分比折扣',
    'fixed': '固定金额',
    'threshold': '满减优惠'
  }
  return typeMap[type] || type
}

const getDiscountDescription = (coupon) => {
  if (coupon.type === 'percentage') {
    return `${coupon.value}%折扣${coupon.maxDiscount ? `，最高减¥${coupon.maxDiscount}` : ''}`
  } else if (coupon.type === 'fixed') {
    return `立减¥${coupon.value}`
  } else if (coupon.type === 'threshold') {
    return `满¥${coupon.minAmount}减¥${coupon.discountAmount}`
  }
  return coupon.description
}

const getStatusTagType = (coupon) => {
  if (!coupon.isActive) return 'info'
  if (new Date(coupon.validTo) <= new Date()) return 'danger'
  if (coupon.usedCount >= coupon.usageLimit) return 'warning'
  return 'success'
}

const getStatusLabel = (coupon) => {
  if (!coupon.isActive) return '已停用'
  if (new Date(coupon.validTo) <= new Date()) return '已过期'
  if (coupon.usedCount >= coupon.usageLimit) return '已用完'
  return '有效'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const editCoupon = (coupon) => {
  editingCoupon.value = coupon
  Object.assign(couponForm, {
    name: coupon.name,
    code: coupon.code,
    description: coupon.description,
    type: coupon.type,
    value: coupon.value,
    maxDiscount: coupon.maxDiscount,
    minAmount: coupon.minAmount,
    discountAmount: coupon.discountAmount,
    usageLimit: coupon.usageLimit,
    isActive: coupon.isActive,
    isPublic: coupon.isPublic !== undefined ? coupon.isPublic : true,
    userId: coupon.userId || null,
    userIds: coupon.userIds || null
  })
  
  validityRange.value = [
    new Date(coupon.validFrom).toISOString(),
    new Date(coupon.validTo).toISOString()
  ]
  
  showCreateDialog.value = true
}

const toggleCouponStatus = async (coupon) => {
  try {
    coupon.isActive = !coupon.isActive
    const allCoupons = JSON.parse(localStorage.getItem('coupons') || '[]')
    const index = allCoupons.findIndex(c => c.id === coupon.id)
    if (index !== -1) {
      allCoupons[index] = coupon
      localStorage.setItem('coupons', JSON.stringify(allCoupons))
      ElMessage.success(`优惠券已${coupon.isActive ? '启用' : '停用'}`)
      loadCoupons()
    }
  } catch (error) {
    console.error('更新优惠券状态失败:', error)
    ElMessage.error('更新失败')
  }
}

const deleteCoupon = async (coupon) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除优惠券"${coupon.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const allCoupons = JSON.parse(localStorage.getItem('coupons') || '[]')
    const filteredCoupons = allCoupons.filter(c => c.id !== coupon.id)
    localStorage.setItem('coupons', JSON.stringify(filteredCoupons))
    
    ElMessage.success('优惠券已删除')
    loadCoupons()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除优惠券失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const saveCoupon = async () => {
  try {
    // 验证表单
    if (!couponForm.name || !couponForm.code || !couponForm.description) {
      ElMessage.warning('请填写必填字段')
      return
    }
    
    // 验证优惠券代码唯一性
    if (!editingCoupon.value) {
      const existingCoupon = coupons.value.find(c => c.code === couponForm.code)
      if (existingCoupon) {
        ElMessage.warning('优惠券代码已存在')
        return
      }
    }
    
    saving.value = true
    
    const couponData = {
      id: editingCoupon.value ? editingCoupon.value.id : `coupon_${Date.now()}`,
      name: couponForm.name,
      code: couponForm.code.toUpperCase(),
      description: couponForm.description,
      type: couponForm.type,
      value: couponForm.value,
      maxDiscount: couponForm.maxDiscount,
      minAmount: couponForm.minAmount || 0,
      discountAmount: couponForm.discountAmount,
      usageLimit: couponForm.usageLimit,
      usedCount: editingCoupon.value ? editingCoupon.value.usedCount : 0,
      isActive: couponForm.isActive,
      isPublic: couponForm.isPublic,
      userId: couponForm.userId || null,
      userIds: couponForm.userIds || null,
      validFrom: validityRange.value[0],
      validTo: validityRange.value[1],
      applicableProducts: [],
      applicableZones: []
    }
    
    const allCoupons = JSON.parse(localStorage.getItem('coupons') || '[]')
    
    if (editingCoupon.value) {
      // 更新现有优惠券
      const index = allCoupons.findIndex(c => c.id === editingCoupon.value.id)
      if (index !== -1) {
        allCoupons[index] = couponData
      }
    } else {
      // 添加新优惠券
      allCoupons.push(couponData)
    }
    
    localStorage.setItem('coupons', JSON.stringify(allCoupons))
    
    ElMessage.success(editingCoupon.value ? '优惠券已更新' : '优惠券已创建')
    showCreateDialog.value = false
    resetForm()
    loadCoupons()
    
  } catch (error) {
    console.error('保存优惠券失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  editingCoupon.value = null
  Object.assign(couponForm, {
    name: '',
    code: '',
    description: '',
    type: 'percentage',
    value: 10,
    maxDiscount: null,
    minAmount: 0,
    discountAmount: null,
    usageLimit: 100,
    isActive: true,
    isPublic: true,
    userId: null,
    userIds: null
  })
  validityRange.value = []
}

// 加载所有用户
const loadAllUsers = () => {
  loadingUsers.value = true
  try {
    // 使用正确的key: all_users
    const users = JSON.parse(localStorage.getItem('all_users') || '[]')
    
    if (users.length === 0) {
      console.warn('未找到用户数据')
      allUsers.value = []
      ElMessage.warning('系统中暂无用户')
      loadingUsers.value = false
      return
    }
    
    // 包含所有用户（包括管理员），并按用户名排序
    allUsers.value = users
      .map(user => ({
        id: user.id,
        username: user.username,
        email: user.email || '',
        status: user.status || 'active',
        role: user.role || 'user'
      }))
      .sort((a, b) => {
        // 先按角色排序（管理员在前），再按用户名排序
        if (a.role === 'admin' && b.role !== 'admin') return -1
        if (a.role !== 'admin' && b.role === 'admin') return 1
        return a.username.localeCompare(b.username)
      })
    
    console.log(`✅ 已加载 ${allUsers.value.length} 个用户`)
  } catch (error) {
    console.error('加载用户失败:', error)
    allUsers.value = []
    ElMessage.error('加载用户列表失败')
  } finally {
    loadingUsers.value = false
  }
}

// 获取用户名
const getUserName = (userId) => {
  // 先从内存中查找
  const user = allUsers.value.find(u => u.id === userId)
  if (user) {
    return user.username
  }
  
  // 如果内存中找不到，从localStorage中查找
  try {
    const users = JSON.parse(localStorage.getItem('all_users') || '[]')
    const foundUser = users.find(u => String(u.id) === String(userId))
    return foundUser ? foundUser.username : `用户ID: ${userId}`
  } catch (error) {
    return `用户ID: ${userId}`
  }
}

// 显示发送优惠券对话框
const showSendCouponDialog = (coupon) => {
  sendingCoupon.value = coupon
  selectedUserIds.value = []
  loadAllUsers()
  showSendDialog.value = true
}

// 发送优惠券给用户
const sendCouponToUsers = async () => {
  if (!sendingCoupon.value || selectedUserIds.value.length === 0) {
    ElMessage.warning('请至少选择一个用户')
    return
  }
  
  sending.value = true
  
  try {
    const allCoupons = JSON.parse(localStorage.getItem('coupons') || '[]')
    const couponIndex = allCoupons.findIndex(c => c.id === sendingCoupon.value.id)
    
    if (couponIndex === -1) {
      ElMessage.error('优惠券不存在')
      return
    }
    
    // 创建专属优惠券副本给每个用户
    selectedUserIds.value.forEach(userId => {
      const userIdStr = String(userId) // 确保userId是字符串
      const userSpecificCoupon = {
        ...sendingCoupon.value,
        id: `${sendingCoupon.value.id}_user_${userId}_${Date.now()}`,
        code: `${sendingCoupon.value.code}_${userIdStr.slice(-4)}`,
        isPublic: false,
        userId: userId,
        userIds: null,
        usedCount: 0,
        usageLimit: 1 // 专属优惠券只能使用一次
      }
      allCoupons.push(userSpecificCoupon)
    })
    
    localStorage.setItem('coupons', JSON.stringify(allCoupons))
    
    ElMessage.success(`优惠券已成功发送给 ${selectedUserIds.value.length} 个用户`)
    showSendDialog.value = false
    loadCoupons()
    
  } catch (error) {
    console.error('发送优惠券失败:', error)
    ElMessage.error('发送失败')
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  loadCoupons()
})
</script>

<style lang="scss" scoped>
.coupon-management {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .header-content {
    h2 {
      margin: 0 0 8px 0;
      color: #1f2937;
      font-size: 24px;
      font-weight: 700;
    }
    
    p {
      margin: 0;
      color: #6b7280;
      font-size: 14px;
    }
  }
  
  .header-actions {
    .el-button {
      height: 40px;
      padding: 0 20px;
      border-radius: 8px;
      font-weight: 600;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
  
  .stat-card {
    display: flex;
    align-items: center;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #f3f4f6;
      color: #6b7280;
      margin-right: 16px;
      
      &.active {
        background: #d1fae5;
        color: #059669;
      }
      
      &.used {
        background: #fef3c7;
        color: #d97706;
      }
      
      &.discount {
        background: #dbeafe;
        color: #2563eb;
      }
    }
    
    .stat-content {
      .stat-number {
        font-size: 24px;
        font-weight: 700;
        color: #1f2937;
        line-height: 1;
        margin-bottom: 4px;
      }
      
      .stat-label {
        font-size: 14px;
        color: #6b7280;
      }
    }
  }
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .filter-left {
    display: flex;
    align-items: center;
  }
  
  .filter-right {
    .el-button {
      height: 36px;
      padding: 0 16px;
      border-radius: 6px;
    }
  }
}

.coupons-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  
  :deep(.el-table) {
    .coupon-name-cell {
      .name {
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 4px;
      }
      
      .code {
        font-size: 12px;
        color: #6b7280;
        font-family: monospace;
      }
    }
    
    .discount-info {
      font-size: 14px;
      color: #1f2937;
    }
    
    .usage-info {
      .used {
        font-weight: 600;
        color: #1f2937;
      }
      
      .total {
        color: #6b7280;
      }
    }
    
    .validity-info {
      font-size: 12px;
      
      .from {
        color: #6b7280;
        margin-bottom: 2px;
      }
      
      .to {
        color: #1f2937;
        font-weight: 500;
      }
    }
  }
}

:deep(.el-dialog) {
  .el-form {
    .el-form-item {
      margin-bottom: 20px;
      
      .el-form-item__label {
        font-weight: 600;
        color: #374151;
      }
    }
  }
  
  .dialog-footer {
    text-align: right;
    
    .el-button {
      height: 36px;
      padding: 0 20px;
      border-radius: 6px;
      font-weight: 600;
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .coupon-management {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-section {
    flex-direction: column;
    gap: 16px;
    
    .filter-left {
      flex-direction: column;
      gap: 12px;
      width: 100%;
      
      .el-input,
      .el-select {
        width: 100% !important;
        margin-left: 0 !important;
      }
    }
  }
}
</style>
