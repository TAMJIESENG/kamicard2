<template>
  <div class="coupon-claim-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>
    
    <!-- 浮动导航栏 -->
    <header class="page-header-nav">
      <div class="header-content">
        <div class="header-left">
          <button class="back-btn" @click="$router.go(-1)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="page-title-info">
            <h1>优惠券中心</h1>
            <p>每天可领取 {{ dailyClaimLimit }} 张优惠券</p>
          </div>
        </div>
        <div class="header-stats">
          <div class="mini-stat">
            <span class="mini-stat-value">{{ remainingClaims }}</span>
            <span class="mini-stat-label">今日可领</span>
          </div>
          <div class="mini-stat">
            <span class="mini-stat-value">{{ myCoupons.length }}</span>
            <span class="mini-stat-label">我的券</span>
          </div>
        </div>
      </div>
    </header>

    <main class="page-main">
      <!-- 领取统计卡片 -->
      <div class="stats-section">
        <div class="stat-card today-card">
          <div class="stat-card-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="stat-card-content">
            <span class="stat-card-label">今日可领取</span>
            <div class="stat-card-value">
              <span class="current">{{ remainingClaims }}</span>
              <span class="divider">/</span>
              <span class="total">{{ dailyClaimLimit }}</span>
            </div>
          </div>
          <div class="stat-card-progress">
            <div class="progress-bar" :style="{ width: ((dailyClaimLimit - remainingClaims) / dailyClaimLimit * 100) + '%' }"></div>
          </div>
        </div>
        
        <div class="stat-card owned-card">
          <div class="stat-card-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
            </svg>
          </div>
          <div class="stat-card-content">
            <span class="stat-card-label">我的优惠券</span>
            <div class="stat-card-value">
              <span class="current">{{ myCoupons.length }}</span>
              <span class="unit">张</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 可领取优惠券列表 -->
      <section class="coupons-section">
        <div class="section-header">
          <div class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3>可领取优惠券</h3>
          </div>
          <span class="section-count">{{ claimableCoupons.length }} 张可领</span>
        </div>
        
        <div class="coupons-grid" v-if="claimableCoupons.length > 0">
          <div
            v-for="(coupon, index) in claimableCoupons"
            :key="coupon.id"
            class="coupon-card"
            :class="getCouponTypeClass(coupon.type)"
            :style="{ '--delay': index * 0.05 + 's' }"
          >
            <div class="coupon-left">
              <div class="coupon-badge">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                </svg>
              </div>
              <div class="coupon-value">
                {{ getCouponDiscountText(coupon) }}
              </div>
            </div>
            
            <div class="coupon-right">
              <div class="coupon-info">
                <h4 class="coupon-name">{{ coupon.name }}</h4>
                <p class="coupon-desc">{{ coupon.description }}</p>
                <div class="coupon-meta">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  <span>有效期至 {{ formatDate(coupon.validTo) }}</span>
                </div>
              </div>
              
              <el-button
                type="primary"
                :loading="claiming === coupon.id"
                :disabled="remainingClaims <= 0 || hasClaimed(coupon.id)"
                @click="claimCoupon(coupon)"
                class="claim-btn"
              >
                <svg v-if="claiming !== coupon.id && !hasClaimed(coupon.id)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {{ hasClaimed(coupon.id) ? '已领取' : '立即领取' }}
              </el-button>
            </div>
            
            <!-- 装饰圆点 -->
            <div class="coupon-dots">
              <span class="dot top"></span>
              <span class="dot bottom"></span>
            </div>
          </div>
        </div>
        
        <div class="empty-state" v-else>
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
            </svg>
          </div>
          <p>暂无可领取的优惠券</p>
          <span>明天再来看看吧~</span>
        </div>
      </section>

      <!-- 我的优惠券 -->
      <section class="coupons-section my-coupons">
        <div class="section-header">
          <div class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <h3>我的优惠券</h3>
          </div>
          <span class="section-count">{{ myCoupons.length }} 张</span>
        </div>
        
        <div class="my-coupons-grid" v-if="myCoupons.length > 0">
          <div
            v-for="coupon in myCoupons"
            :key="coupon.id"
            class="my-coupon-card"
            :class="{
              'used': coupon.usedCount > 0,
              'expired': new Date(coupon.validTo) <= new Date()
            }"
          >
            <div class="my-coupon-left">
              <div class="my-coupon-value">{{ getCouponDiscountText(coupon) }}</div>
            </div>
            <div class="my-coupon-right">
              <div class="my-coupon-name">{{ coupon.name }}</div>
              <div class="my-coupon-code">{{ coupon.code }}</div>
              <el-tag :type="getStatusTagType(coupon)" size="small" effect="plain">
                {{ getStatusText(coupon) }}
              </el-tag>
            </div>
          </div>
        </div>
        
        <div class="empty-state" v-else>
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <p>您还没有优惠券</p>
          <span>快去上方领取吧！</span>
        </div>
      </section>
    </main>
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
// 设计系统
$primary: #2563EB;
$primary-light: #3B82F6;
$secondary: #8B5CF6;
$success: #10B981;
$warning: #F59E0B;
$danger: #EF4444;
$text: #1E293B;
$text-muted: #64748B;
$border: #E2E8F0;
$bg: #F8FAFC;
$card-bg: rgba(255, 255, 255, 0.95);

.coupon-claim-page {
  min-height: 100vh;
  background: linear-gradient(135deg, $bg 0%, #EEF2FF 100%);
  position: relative;
  overflow-x: hidden;
}

// 背景装饰
.bg-decoration {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.35;
  
  &.orb-1 {
    width: 500px;
    height: 500px;
    background: linear-gradient(135deg, rgba($primary, 0.25), rgba($secondary, 0.2));
    top: -150px;
    right: -100px;
  }
  
  &.orb-2 {
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, rgba(#F472B6, 0.2), rgba($danger, 0.15));
    bottom: 20%;
    left: -150px;
  }
  
  &.orb-3 {
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, rgba($success, 0.15), rgba(#06B6D4, 0.1));
    top: 40%;
    right: 10%;
  }
}

// 浮动导航栏
.page-header-nav {
  position: sticky;
  top: 16px;
  z-index: 100;
  margin: 16px 24px 0;
  background: $card-bg;
  backdrop-filter: blur(20px);
  border: 1px solid rgba($border, 0.6);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid $border;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: $text-muted;
  
  &:hover {
    border-color: $primary;
    color: $primary;
    background: rgba($primary, 0.05);
  }
}

.page-title-info {
  h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: $text;
  }
  
  p {
    margin: 2px 0 0;
    font-size: 13px;
    color: $text-muted;
  }
}

.header-stats {
  display: flex;
  gap: 24px;
  
  .mini-stat {
    text-align: center;
    
    .mini-stat-value {
      display: block;
      font-size: 24px;
      font-weight: 700;
      color: $primary;
    }
    
    .mini-stat-label {
      font-size: 12px;
      color: $text-muted;
    }
  }
}

// 主内容区
.page-main {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

// 统计卡片
.stats-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: $card-bg;
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba($border, 0.6);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.25s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  }
  
  &.today-card {
    .stat-card-icon {
      background: linear-gradient(135deg, $primary, $primary-light);
    }
    .stat-card-progress .progress-bar {
      background: linear-gradient(90deg, $primary, $primary-light);
    }
  }
  
  &.owned-card {
    .stat-card-icon {
      background: linear-gradient(135deg, #F472B6, #EC4899);
    }
  }
  
  .stat-card-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }
  
  .stat-card-content {
    flex: 1;
    
    .stat-card-label {
      font-size: 14px;
      color: $text-muted;
      margin-bottom: 4px;
      display: block;
    }
    
    .stat-card-value {
      display: flex;
      align-items: baseline;
      gap: 4px;
      
      .current {
        font-size: 32px;
        font-weight: 700;
        color: $text;
      }
      
      .divider {
        font-size: 20px;
        color: $text-muted;
      }
      
      .total, .unit {
        font-size: 16px;
        color: $text-muted;
      }
    }
  }
  
  .stat-card-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: rgba($border, 0.5);
    
    .progress-bar {
      height: 100%;
      border-radius: 0 2px 2px 0;
      transition: width 0.5s ease;
    }
  }
}

// 优惠券区域
.coupons-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    
    svg {
      color: $primary;
    }
    
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: $text;
    }
  }
  
  .section-count {
    padding: 6px 14px;
    background: rgba($primary, 0.1);
    color: $primary;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
  }
}

// 优惠券卡片网格
.coupons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

// 优惠券卡片 - 票券样式
.coupon-card {
  background: white;
  border-radius: 16px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba($border, 0.5);
  position: relative;
  transition: all 0.25s ease;
  animation: fadeInUp 0.5s ease forwards;
  animation-delay: var(--delay);
  opacity: 0;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  }
  
  // 类型颜色
  &.type-percentage .coupon-left {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }
  
  &.type-fixed .coupon-left {
    background: linear-gradient(135deg, #f093fb, #f5576c);
  }
  
  &.type-threshold .coupon-left {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
  }
  
  .coupon-left {
    width: 120px;
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    position: relative;
    flex-shrink: 0;
    
    .coupon-badge {
      opacity: 0.6;
      margin-bottom: 8px;
    }
    
    .coupon-value {
      font-size: 28px;
      font-weight: 700;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
  }
  
  .coupon-right {
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    .coupon-info {
      .coupon-name {
        margin: 0 0 6px;
        font-size: 16px;
        font-weight: 600;
        color: $text;
      }
      
      .coupon-desc {
        margin: 0 0 10px;
        font-size: 13px;
        color: $text-muted;
        line-height: 1.5;
      }
      
      .coupon-meta {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #9CA3AF;
        
        svg {
          flex-shrink: 0;
        }
      }
    }
    
    .claim-btn {
      margin-top: 16px;
      width: 100%;
      height: 40px;
      border-radius: 10px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.25s ease;
      
      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba($primary, 0.3);
      }
    }
  }
  
  // 装饰圆点（票券效果）
  .coupon-dots {
    position: absolute;
    left: 112px;
    top: 0;
    bottom: 0;
    width: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    pointer-events: none;
    
    .dot {
      width: 16px;
      height: 16px;
      background: $bg;
      border-radius: 50%;
      
      &.top {
        transform: translateY(-50%);
      }
      
      &.bottom {
        transform: translateY(50%);
      }
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 我的优惠券网格
.my-coupons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.my-coupon-card {
  background: white;
  border-radius: 12px;
  display: flex;
  overflow: hidden;
  border: 1px solid rgba($border, 0.6);
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
  
  &.used, &.expired {
    opacity: 0.5;
    
    .my-coupon-left {
      background: linear-gradient(135deg, #9CA3AF, #6B7280);
    }
  }
  
  .my-coupon-left {
    width: 80px;
    background: linear-gradient(135deg, $primary, $secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    .my-coupon-value {
      color: white;
      font-size: 18px;
      font-weight: 700;
      text-align: center;
    }
  }
  
  .my-coupon-right {
    flex: 1;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .my-coupon-name {
      font-size: 14px;
      font-weight: 600;
      color: $text;
    }
    
    .my-coupon-code {
      font-size: 12px;
      color: $text-muted;
      font-family: monospace;
    }
  }
}

// 空状态
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: $card-bg;
  border-radius: 16px;
  border: 1px dashed rgba($border, 0.8);
  
  .empty-icon {
    margin-bottom: 16px;
    color: #CBD5E1;
  }
  
  p {
    margin: 0 0 4px;
    font-size: 16px;
    color: $text;
    font-weight: 500;
  }
  
  span {
    font-size: 14px;
    color: $text-muted;
  }
}

// 响应式
@media (max-width: 768px) {
  .page-header-nav {
    margin: 8px 12px 0;
    border-radius: 12px;
  }
  
  .header-content {
    padding: 12px 16px;
  }
  
  .page-title-info p {
    display: none;
  }
  
  .header-stats {
    gap: 16px;
    
    .mini-stat-value {
      font-size: 20px;
    }
  }
  
  .page-main {
    padding: 16px 12px;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .coupons-grid {
    grid-template-columns: 1fr;
  }
  
  .coupon-card {
    .coupon-left {
      width: 100px;
      
      .coupon-value {
        font-size: 24px;
      }
    }
    
    .coupon-dots {
      left: 92px;
    }
  }
  
  .my-coupons-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gradient-orb,
  .coupon-card,
  .stat-card {
    animation: none !important;
    transition: none !important;
  }
}
</style>

