<template>
  <div class="coupon-claim-page">
    <div class="page-header">
      <h2>每日优惠券</h2>
      <p>每天可以领取1-2张优惠券，快来领取吧！</p>
    </div>

    <!-- 领取统计 -->
    <div class="claim-stats">
      <div class="stat-item">
        <div class="stat-icon today">
          <el-icon><Calendar /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">今日可领取</div>
          <div class="stat-value">{{ remainingClaims }} / {{ dailyClaimLimit }}</div>
        </div>
      </div>
      
      <div class="stat-item">
        <div class="stat-icon total">
          <el-icon><Ticket /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">我的优惠券</div>
          <div class="stat-value">{{ myCoupons.length }} 张</div>
        </div>
      </div>
    </div>

    <!-- 可领取优惠券列表 -->
    <div class="claimable-coupons">
      <h3>可领取优惠券</h3>
      <div class="coupons-grid" v-if="claimableCoupons.length > 0">
        <div
          v-for="coupon in claimableCoupons"
          :key="coupon.id"
          class="coupon-card-claim"
          :class="getCouponTypeClass(coupon.type)"
        >
          <div class="coupon-header">
            <div class="coupon-icon-large">
              <el-icon><Ticket /></el-icon>
            </div>
            <div class="coupon-discount-large">
              {{ getCouponDiscountText(coupon) }}
            </div>
          </div>
          
          <div class="coupon-body">
            <h4 class="coupon-name-large">{{ coupon.name }}</h4>
            <p class="coupon-desc-large">{{ coupon.description }}</p>
            <div class="coupon-meta">
              <span class="validity">有效期至 {{ formatDate(coupon.validTo) }}</span>
            </div>
          </div>
          
          <div class="coupon-footer">
            <el-button
              type="primary"
              size="large"
              :loading="claiming === coupon.id"
              :disabled="remainingClaims <= 0 || hasClaimed(coupon.id)"
              @click="claimCoupon(coupon)"
              class="claim-btn"
            >
              <el-icon v-if="claiming !== coupon.id"><Plus /></el-icon>
              {{ hasClaimed(coupon.id) ? '已领取' : '立即领取' }}
            </el-button>
          </div>
        </div>
      </div>
      
      <el-empty v-else description="暂无可领取的优惠券" />
    </div>

    <!-- 我的优惠券 -->
    <div class="my-coupons-section">
      <h3>我的优惠券</h3>
      <div class="coupons-grid" v-if="myCoupons.length > 0">
        <div
          v-for="coupon in myCoupons"
          :key="coupon.id"
          class="coupon-card-owned"
          :class="{
            'used': coupon.usedCount > 0,
            'expired': new Date(coupon.validTo) <= new Date()
          }"
        >
          <div class="coupon-header-owned">
            <div class="coupon-icon-small">
              <el-icon><Ticket /></el-icon>
            </div>
            <div class="coupon-info-owned">
              <div class="coupon-name-small">{{ coupon.name }}</div>
              <div class="coupon-code-small">{{ coupon.code }}</div>
            </div>
            <div class="coupon-discount-small">
              {{ getCouponDiscountText(coupon) }}
            </div>
          </div>
          
          <div class="coupon-status">
            <el-tag
              :type="getStatusTagType(coupon)"
              size="small"
            >
              {{ getStatusText(coupon) }}
            </el-tag>
          </div>
        </div>
      </div>
      
      <el-empty v-else description="您还没有优惠券，快去领取吧！" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { initializeDailyCoupons } from '@/utils/coupon-auto-generator'
import { Calendar, Ticket, Plus } from '@element-plus/icons-vue'

const userStore = useUserStore()
const claimableCoupons = ref([])
const myCoupons = ref([])
const claiming = ref(null)
const dailyClaimLimit = ref(2) // 每天可领取2张
const claimHistory = ref([])

// 今日已领取数量
const remainingClaims = computed(() => {
  const today = new Date().toDateString()
  const todayClaims = claimHistory.value.filter(record => {
    const claimDate = new Date(record.date).toDateString()
    return claimDate === today
  })
  return Math.max(0, dailyClaimLimit.value - todayClaims.length)
})

// 检查是否已领取
const hasClaimed = (couponId) => {
  return claimHistory.value.some(record => record.couponId === couponId)
}

// 加载可领取优惠券
const loadClaimableCoupons = () => {
  try {
    const allCoupons = JSON.parse(localStorage.getItem('coupons') || '[]')
    const currentUserId = userStore.user?.id
    
    // 过滤出公开的、有效的、未领取的优惠券
    claimableCoupons.value = allCoupons.filter(coupon => {
      // 检查是否有效
      if (!coupon.isActive) {
        return false
      }
      
      // 检查有效期
      const validTo = new Date(coupon.validTo)
      const now = new Date()
      if (validTo <= now) {
        return false
      }
      
      // 必须是公开优惠券（isPublic === true 或 undefined/null 时默认为公开）
      if (coupon.isPublic === false) {
        return false
      }
      
      // 不能是专属优惠券（已经有userId或userIds的）
      if (coupon.userId || (coupon.userIds && Array.isArray(coupon.userIds) && coupon.userIds.length > 0)) {
        return false
      }
      
      // 每日生成的优惠券通常id以"daily_"开头，这些是公开的
      // 检查是否已领取
      if (hasClaimed(coupon.id)) {
        return false
      }
      
      return true
    })
  } catch (error) {
    console.error('加载可领取优惠券失败:', error)
    ElMessage.error('加载失败')
  }
}

// 加载我的优惠券
const loadMyCoupons = () => {
  try {
    const allCoupons = JSON.parse(localStorage.getItem('coupons') || '[]')
    const currentUserId = userStore.user?.id
    
    myCoupons.value = allCoupons.filter(coupon => {
      // 专属优惠券（发送给我的）
      // 统一转换为字符串进行比较
      const couponUserId = coupon.userId ? String(coupon.userId) : null
      const userIdStr = String(currentUserId)
      if (couponUserId === userIdStr || (coupon.userIds && coupon.userIds.map(String).includes(userIdStr))) {
        return true
      }
      
      // 已领取的公开优惠券
      return hasClaimed(coupon.id)
    }).sort((a, b) => {
      // 按有效期排序，即将过期的在前
      return new Date(a.validTo) - new Date(b.validTo)
    })
  } catch (error) {
    console.error('加载我的优惠券失败:', error)
  }
}

// 加载领取历史
const loadClaimHistory = () => {
  try {
    const currentUserId = userStore.user?.id
    const allHistory = JSON.parse(localStorage.getItem(`coupon_claim_history_${currentUserId}`) || '[]')
    claimHistory.value = allHistory
  } catch (error) {
    console.error('加载领取历史失败:', error)
    claimHistory.value = []
  }
}

// 领取优惠券
const claimCoupon = async (coupon) => {
  if (remainingClaims.value <= 0) {
    ElMessage.warning('今日领取次数已用完，明天再来吧！')
    return
  }
  
  if (hasClaimed(coupon.id)) {
    ElMessage.warning('您已经领取过这张优惠券了')
    return
  }
  
  claiming.value = coupon.id
  
  try {
    // 模拟网络请求
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 记录领取历史
    const currentUserId = userStore.user?.id
    const today = new Date().toISOString()
    
    const claimRecord = {
      couponId: coupon.id,
      couponCode: coupon.code,
      userId: currentUserId,
      date: today
    }
    
    claimHistory.value.push(claimRecord)
    localStorage.setItem(`coupon_claim_history_${currentUserId}`, JSON.stringify(claimHistory.value))
    
    // 如果是公开优惠券，创建用户专属副本
    const allCoupons = JSON.parse(localStorage.getItem('coupons') || '[]')
    const userIdStr = String(currentUserId)
    const userSpecificCoupon = {
      ...coupon,
      id: `${coupon.id}_claimed_${currentUserId}_${Date.now()}`,
      code: `${coupon.code}_${userIdStr.slice(-4)}`,
      isPublic: false,
      userId: currentUserId,
      userIds: null,
      usedCount: 0,
      usageLimit: coupon.usageLimit || 1
    }
    allCoupons.push(userSpecificCoupon)
    localStorage.setItem('coupons', JSON.stringify(allCoupons))
    
    ElMessage.success(`恭喜！已成功领取"${coupon.name}"`)
    
    // 重新加载
    loadClaimableCoupons()
    loadMyCoupons()
    
  } catch (error) {
    console.error('领取优惠券失败:', error)
    ElMessage.error('领取失败，请重试')
  } finally {
    claiming.value = null
  }
}

// 获取优惠券折扣文本
const getCouponDiscountText = (coupon) => {
  if (coupon.type === 'percentage') {
    return `-${coupon.value}%`
  } else if (coupon.type === 'fixed') {
    return `-¥${coupon.value}`
  } else if (coupon.type === 'threshold') {
    return `-¥${coupon.discountAmount}`
  }
  return '-¥0'
}

// 获取优惠券类型样式类
const getCouponTypeClass = (type) => {
  const typeMap = {
    'percentage': 'type-percentage',
    'fixed': 'type-fixed',
    'threshold': 'type-threshold'
  }
  return typeMap[type] || 'type-default'
}

// 获取状态标签类型
const getStatusTagType = (coupon) => {
  if (new Date(coupon.validTo) <= new Date()) return 'info'
  if (coupon.usedCount > 0) return 'success'
  return 'warning'
}

// 获取状态文本
const getStatusText = (coupon) => {
  if (new Date(coupon.validTo) <= new Date()) return '已过期'
  if (coupon.usedCount > 0) return '已使用'
  return '未使用'
}

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

onMounted(() => {
  // 检查并生成每日优惠券（如果还没有生成）
  initializeDailyCoupons()
  
  loadClaimHistory()
  loadClaimableCoupons()
  loadMyCoupons()
})
</script>

<style lang="scss" scoped>
.coupon-claim-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  
  h2 {
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 8px;
  }
  
  p {
    font-size: 14px;
    color: #6b7280;
  }
}

.claim-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 32px;
  
  .stat-item {
    display: flex;
    align-items: center;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-right: 16px;
      
      &.today {
        background: #dbeafe;
        color: #2563eb;
      }
      
      &.total {
        background: #fce7f3;
        color: #db2777;
      }
    }
    
    .stat-content {
      .stat-label {
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 4px;
      }
      
      .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #1f2937;
      }
    }
  }
}

.claimable-coupons,
.my-coupons-section {
  margin-bottom: 32px;
  
  h3 {
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 20px;
  }
}

.coupons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.coupon-card-claim {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
  
  &.type-percentage {
    .coupon-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  }
  
  &.type-fixed {
    .coupon-header {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
  }
  
  &.type-threshold {
    .coupon-header {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
  }
  
  .coupon-header {
    padding: 24px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .coupon-icon-large {
      font-size: 48px;
      opacity: 0.9;
    }
    
    .coupon-discount-large {
      font-size: 36px;
      font-weight: 700;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
  }
  
  .coupon-body {
    padding: 20px;
    
    .coupon-name-large {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 8px 0;
    }
    
    .coupon-desc-large {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 12px 0;
      line-height: 1.5;
    }
    
    .coupon-meta {
      font-size: 12px;
      color: #9ca3af;
      
      .validity {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
  
  .coupon-footer {
    padding: 0 20px 20px;
    
    .claim-btn {
      width: 100%;
      height: 44px;
      font-size: 16px;
      font-weight: 600;
    }
  }
}

.coupon-card-owned {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &.used,
  &.expired {
    opacity: 0.6;
  }
  
  .coupon-header-owned {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    
    .coupon-icon-small {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
    }
    
    .coupon-info-owned {
      flex: 1;
      
      .coupon-name-small {
        font-size: 15px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 4px;
      }
      
      .coupon-code-small {
        font-size: 12px;
        color: #6b7280;
        font-family: monospace;
      }
    }
    
    .coupon-discount-small {
      font-size: 18px;
      font-weight: 700;
      color: #dc2626;
    }
  }
  
  .coupon-status {
    text-align: right;
  }
}

@media (max-width: 768px) {
  .coupons-grid {
    grid-template-columns: 1fr;
  }
  
  .claim-stats {
    grid-template-columns: 1fr;
  }
}
</style>

