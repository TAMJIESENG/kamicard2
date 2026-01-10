<template>
  <div class="vip-purchase-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <!-- 顶部导航 -->
    <nav class="top-nav">
      <div class="nav-container">
        <router-link to="/dashboard" class="nav-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          返回控制台
        </router-link>
        <div class="nav-user">
          <div class="balance-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
            </svg>
            ¥{{ (currentUser?.balance || 0).toFixed(2) }}
          </div>
          <div class="vip-badge" :class="currentVipInfo.level > 0 ? (currentVipInfo.level === 2 ? 'svip' : 'vip') : 'normal'">
            {{ currentVipInfo.name }}
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- Hero 区域 -->
      <section class="hero-section">
        <div class="hero-badge animate-fade-in" style="--delay: 0s">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          Premium Membership
        </div>
        <h1 class="hero-title animate-fade-in" style="--delay: 0.1s">
          解锁 <span class="gradient-text">VIP特权</span>
        </h1>
        <p class="hero-desc animate-fade-in" style="--delay: 0.2s">
          享受专属折扣、优先支持和高级功能
        </p>
        
        <!-- 数据统计 -->
        <div class="hero-stats animate-fade-in" style="--delay: 0.3s">
          <div class="stat-item">
            <span class="stat-value">95%</span>
            <span class="stat-label">VIP折扣</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">90%</span>
            <span class="stat-label">SVIP折扣</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">24/7</span>
            <span class="stat-label">专属支持</span>
          </div>
        </div>
      </section>

      <!-- 当前状态卡片 -->
      <section v-if="currentUser" class="status-section animate-fade-in" style="--delay: 0.4s">
        <div class="status-card" :class="getStatusCardClass()">
          <div class="status-header">
            <div class="status-dot" :class="getStatusDotClass()"></div>
            <span>当前方案</span>
          </div>
          <div class="status-info">
            <h3>{{ currentVipInfo.name }}</h3>
            <p v-if="vipStatus.isValid" class="status-expire">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>
              </svg>
              {{ vipStatus.daysRemaining }}天后到期
            </p>
            <p v-else-if="currentUser.level !== '普通'" class="status-expired">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              已过期，需要续费
            </p>
          </div>
        </div>
      </section>

      <!-- 会员等级对比 -->
      <section class="comparison-section" ref="comparisonSection">
        <h2 class="section-title animate-fade-in" :class="{ 'animate-in': comparisonVisible }" style="--delay: 0s">会员权益对比</h2>
        <div class="comparison-grid">
          <div 
            v-for="(levelInfo, levelKey, index) in vipLevels" 
            :key="levelKey"
            class="level-card"
            :class="{ 
              'current': currentUser?.level === levelKey,
              'vip-card': levelInfo.level === 1,
              'svip-card': levelInfo.level === 2,
              'animate-in': comparisonVisible
            }"
            :style="{ '--delay': (index * 0.1) + 's' }"
          >
            <div class="level-header">
              <div class="level-icon" :class="'level-' + levelInfo.level">
                <svg v-if="levelInfo.level === 0" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <svg v-else-if="levelInfo.level === 1" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
                </svg>
              </div>
              <h3>{{ levelInfo.name }}</h3>
              <span v-if="currentUser?.level === levelKey" class="current-tag">当前</span>
            </div>
            <ul class="benefits-list">
              <li v-for="benefit in levelInfo.benefits" :key="benefit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                {{ benefit }}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 定价区域 -->
      <section v-if="currentUser?.level !== 'SVIP' || !vipStatus.isValid" class="pricing-section" id="pricing" ref="pricingSection">
        <h2 class="section-title" :class="{ 'animate-in': pricingVisible }" style="--delay: 0s">选择您的方案</h2>
        <p class="section-desc" :class="{ 'animate-in': pricingVisible }" style="--delay: 0.1s">所有方案均包含核心功能，升级享受更多专属权益</p>

        <!-- VIP 套餐 -->
        <div v-if="currentUser?.level !== 'VIP' || !vipStatus.isValid" class="plan-group">
          <div class="plan-header">
            <div class="plan-icon vip">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div class="plan-title-group">
              <h3>VIP专业版</h3>
              <p>适合个人用户和小型团队</p>
            </div>
            <span class="discount-tag vip">95折优惠</span>
          </div>

          <div class="pricing-cards">
            <div 
              v-for="(pkg, key, index) in vipPackages.VIP" 
              :key="key"
              class="pricing-card vip-tier"
              :class="{ 'popular': key === 'yearly', 'animate-in': pricingVisible }"
              :style="{ '--delay': (0.2 + index * 0.1) + 's' }"
            >
              <div v-if="key === 'yearly'" class="popular-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                最受欢迎
              </div>
              
              <h4 class="card-title">{{ pkg.name }}</h4>
              <p class="card-desc">{{ pkg.description }}</p>
              
              <div class="price-display">
                <span class="currency">¥</span>
                <span class="amount">{{ Math.floor(pkg.currentPrice) }}</span>
                <span class="decimal">.{{ (pkg.currentPrice % 1).toFixed(2).slice(2) }}</span>
              </div>
              <p class="price-period">{{ pkg.duration }}天有效期</p>
              <p class="price-daily">约 ¥{{ (pkg.currentPrice / pkg.duration).toFixed(2) }}/天</p>

              <ul class="card-features">
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  95折购买优惠
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  优先客服支持
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  专属VIP标识
                </li>
              </ul>

              <button 
                class="buy-btn vip-btn"
                :disabled="loading"
                @click="selectPackage('VIP', key, pkg)"
              >
                <span v-if="!loading">立即购买</span>
                <span v-else class="loading-state">
                  <svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/>
                  </svg>
                  处理中...
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- SVIP 套餐 -->
        <div class="plan-group svip-group">
          <div class="plan-header">
            <div class="plan-icon svip">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
              </svg>
            </div>
            <div class="plan-title-group">
              <h3>SVIP企业版</h3>
              <p>适合大型团队和企业用户</p>
            </div>
            <span class="discount-tag svip">90折优惠</span>
          </div>

          <div class="pricing-cards">
            <div 
              v-for="(pkg, key, index) in vipPackages.SVIP" 
              :key="key"
              class="pricing-card svip-tier"
              :class="{ 'popular': key === 'yearly', 'animate-in': pricingVisible }"
              :style="{ '--delay': (0.4 + index * 0.1) + 's' }"
            >
              <div v-if="key === 'yearly'" class="popular-badge svip">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/>
                </svg>
                企业首选
              </div>
              
              <h4 class="card-title">{{ pkg.name }}</h4>
              <p class="card-desc">{{ pkg.description }}</p>
              
              <div class="price-display">
                <span class="currency">¥</span>
                <span class="amount">{{ Math.floor(pkg.currentPrice) }}</span>
                <span class="decimal">.{{ (pkg.currentPrice % 1).toFixed(2).slice(2) }}</span>
              </div>
              <p class="price-period">{{ pkg.duration }}天有效期</p>
              <p class="price-daily">约 ¥{{ (pkg.currentPrice / pkg.duration).toFixed(2) }}/天</p>

              <ul class="card-features">
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  90折购买优惠
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  专属客服通道
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  每月免费赠送
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  独享SVIP标识
                </li>
              </ul>

              <button 
                class="buy-btn svip-btn"
                :disabled="loading"
                @click="selectPackage('SVIP', key, pkg)"
              >
                <span v-if="!loading">立即升级</span>
                <span v-else class="loading-state">
                  <svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/>
                  </svg>
                  处理中...
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 已是最高等级 -->
      <section v-else class="max-level-section">
        <div class="max-level-card">
          <div class="max-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
            </svg>
          </div>
          <h3>您已是SVIP超级会员</h3>
          <p>感谢您的支持！您当前享有最高级别的会员权益</p>
          <div class="expire-info">
            VIP到期时间：{{ new Date(vipStatus.expireTime).toLocaleString('zh-CN') }}
          </div>
        </div>
      </section>
    </main>

    <!-- 支付对话框 -->
    <el-dialog
      v-model="paymentDialogVisible"
      title="确认支付"
      width="420px"
      :close-on-click-modal="false"
      class="payment-dialog"
    >
      <div v-if="selectedPackageInfo" class="payment-content">
        <div class="payment-package">
          <h4>{{ selectedPackageInfo.packageData.name }}</h4>
          <p>{{ selectedPackageInfo.packageData.description }}</p>
        </div>
        
        <div class="payment-summary">
          <div class="summary-row">
            <span>套餐价格</span>
            <span>¥{{ selectedPackageInfo.packageData.currentPrice }}</span>
          </div>
          <div class="summary-row total">
            <span>支付金额</span>
            <span class="total-price">¥{{ selectedPackageInfo.packageData.currentPrice }}</span>
          </div>
        </div>
        
        <div class="payment-method">
          <h5>支付方式</h5>
          <el-radio-group v-model="selectedPaymentMethod">
            <el-radio value="balance" class="method-option">
              <div class="method-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                </svg>
                <div>
                  <span class="method-name">余额支付</span>
                  <span class="method-balance">当前余额：¥{{ (currentUser?.balance || 0).toFixed(2) }}</span>
                </div>
              </div>
            </el-radio>
          </el-radio-group>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="paymentDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            :loading="loading"
            @click="confirmPayment"
            :disabled="!selectedPaymentMethod"
          >
            确认支付
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useVipStore } from '@/stores/vip'

const router = useRouter()
const userStore = useUserStore()
const vipStore = useVipStore()

const currentUser = computed(() => userStore.user)
const paymentDialogVisible = ref(false)
const selectedPackageInfo = ref(null)
const selectedPaymentMethod = ref('balance')
const loading = computed(() => vipStore.loading)

// 动画相关
const comparisonSection = ref(null)
const pricingSection = ref(null)
const comparisonVisible = ref(false)
const pricingVisible = ref(false)
let observer = null

const setupObserver = () => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target === comparisonSection.value) {
          comparisonVisible.value = true
        } else if (entry.target === pricingSection.value) {
          pricingVisible.value = true
        }
      }
    })
  }, { threshold: 0.15 })
  
  if (comparisonSection.value) observer.observe(comparisonSection.value)
  if (pricingSection.value) observer.observe(pricingSection.value)
}

const vipLevels = computed(() => vipStore.vipLevels)
const vipPackages = computed(() => vipStore.vipPackages)

const currentVipInfo = computed(() => {
  if (!currentUser.value) return vipLevels.value['普通']
  return vipStore.getUserVipInfo(currentUser.value.level)
})

const vipStatus = computed(() => {
  if (!currentUser.value) return { isValid: false, level: '普通', expireTime: null }
  return vipStore.checkUserVipStatus(currentUser.value.id)
})

const getStatusCardClass = () => {
  if (currentVipInfo.value.level === 0) return 'normal'
  if (currentVipInfo.value.level === 1) return 'vip'
  return 'svip'
}

const getStatusDotClass = () => {
  if (!vipStatus.value.isValid && currentUser.value?.level !== '普通') return 'expired'
  return getStatusCardClass()
}

const selectPackage = (vipType, packageType, packageData) => {
  if (!currentUser.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  selectedPackageInfo.value = { vipType, packageType, packageData }
  paymentDialogVisible.value = true
}

const confirmPayment = async () => {
  if (!selectedPackageInfo.value || !selectedPaymentMethod.value) {
    ElMessage.warning('请选择支付方式')
    return
  }

  const { vipType, packageType } = selectedPackageInfo.value
  
  try {
    const result = await vipStore.purchaseVip(vipType, packageType, selectedPaymentMethod.value)
    
    if (result.success) {
      ElMessage.success(result.message)
      paymentDialogVisible.value = false
      selectedPackageInfo.value = null
      userStore.refreshCurrentUser()
      setTimeout(() => router.push('/profile'), 1500)
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    ElMessage.error('购买失败，请重试')
  }
}

onMounted(() => {
  if (!currentUser.value) {
    ElMessageBox.confirm('请先登录后再查看VIP服务', '提示', {
      confirmButtonText: '去登录',
      cancelButtonText: '取消',
      type: 'info'
    }).then(() => router.push('/login')).catch(() => router.push('/'))
  }
  
  // 设置滚动动画观察器
  setTimeout(setupObserver, 100)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>


<style lang="scss" scoped>
// 设计系统变量
$primary: #2563EB;
$primary-light: #3B82F6;
$secondary: #6366F1;
$cta: #F97316;
$success: #10B981;
$warning: #F59E0B;
$vip-gold: #F59E0B;
$svip-purple: #8B5CF6;
$bg: #F8FAFC;
$text: #1E293B;
$text-muted: #64748B;
$border: #E2E8F0;
$card-bg: rgba(255, 255, 255, 0.8);

// 动画关键帧
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.3; }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

// 动画类
.animate-fade-in {
  opacity: 0;
  animation: fadeInUp 0.8s ease-out forwards;
  animation-delay: var(--delay, 0s);
}

.animate-in {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.6s ease-out forwards;
  animation-delay: var(--delay, 0s);
}

.vip-purchase-page {
  min-height: 100vh;
  background: linear-gradient(135deg, $bg 0%, #EEF2FF 100%);
  position: relative;
  overflow-x: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
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
  filter: blur(80px);
  opacity: 0.5;
  
  &.orb-1 {
    width: 500px;
    height: 500px;
    background: linear-gradient(135deg, rgba($primary, 0.15), rgba($secondary, 0.1));
    top: -200px;
    right: -100px;
    animation: float 20s ease-in-out infinite, pulse 8s ease-in-out infinite;
  }
  
  &.orb-2 {
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, rgba($svip-purple, 0.12), rgba($primary, 0.08));
    bottom: -150px;
    left: -100px;
    animation: float 25s ease-in-out infinite reverse, pulse 10s ease-in-out infinite;
    animation-delay: 2s;
  }
  
  &.orb-3 {
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, rgba($vip-gold, 0.1), rgba($cta, 0.08));
    top: 40%;
    left: 50%;
    animation: float 18s ease-in-out infinite, pulse 6s ease-in-out infinite;
    animation-delay: 4s;
  }
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

// 顶部导航
.top-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba($border, 0.8);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-back {
  display: flex;
  align-items: center;
  gap: 8px;
  color: $text-muted;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    color: $primary;
    background: rgba($primary, 0.08);
  }
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.balance-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, $success, #059669);
  color: white;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.vip-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  
  &.normal {
    background: $border;
    color: $text-muted;
  }
  
  &.vip {
    background: linear-gradient(135deg, $vip-gold, #D97706);
    color: white;
  }
  
  &.svip {
    background: linear-gradient(135deg, $svip-purple, #7C3AED);
    color: white;
  }
}

// 主内容
.main-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px 80px;
}

// Hero 区域
.hero-section {
  text-align: center;
  margin-bottom: 48px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba($primary, 0.1);
  color: $primary;
  border-radius: 24px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 20px;
}

.hero-title {
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 700;
  color: $text;
  margin: 0 0 16px;
  line-height: 1.2;
}

.gradient-text {
  background: linear-gradient(135deg, $primary, $svip-purple);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  font-size: 18px;
  color: $text-muted;
  margin: 0 0 32px;
}

.hero-stats {
  display: inline-flex;
  align-items: center;
  gap: 24px;
  padding: 20px 32px;
  background: $card-bg;
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba($border, 0.8);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: $text;
}

.stat-label {
  font-size: 13px;
  color: $text-muted;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: $border;
}

// 状态卡片
.status-section {
  display: flex;
  justify-content: center;
  margin-bottom: 48px;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: $card-bg;
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 1px solid $border;
  
  &.vip {
    border-color: rgba($vip-gold, 0.3);
    background: linear-gradient(135deg, rgba($vip-gold, 0.05), transparent);
  }
  
  &.svip {
    border-color: rgba($svip-purple, 0.3);
    background: linear-gradient(135deg, rgba($svip-purple, 0.05), transparent);
  }
}

.status-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: $text-muted;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $border;
  
  &.vip { background: $vip-gold; }
  &.svip { background: $svip-purple; }
  &.expired { background: #EF4444; }
}

.status-info {
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: $text;
  }
  
  p {
    margin: 4px 0 0;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .status-expire { color: $success; }
  .status-expired { color: #EF4444; }
}

// 会员对比
.comparison-section {
  margin-bottom: 64px;
}

.section-title {
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  color: $text;
  margin: 0 0 32px;
}

.section-desc {
  text-align: center;
  color: $text-muted;
  margin: -16px 0 32px;
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.level-card {
  background: $card-bg;
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid $border;
  padding: 24px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  }
  
  &.current {
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba($primary, 0.1);
  }
  
  &.vip-card {
    border-color: rgba($vip-gold, 0.3);
    
    .level-icon { background: linear-gradient(135deg, $vip-gold, #D97706); }
  }
  
  &.svip-card {
    border-color: rgba($svip-purple, 0.3);
    
    .level-icon { background: linear-gradient(135deg, $svip-purple, #7C3AED); }
  }
}

.level-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: $text;
    flex: 1;
  }
}

.level-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  
  &.level-0 { background: $border; color: $text-muted; }
  &.level-1 { background: linear-gradient(135deg, $vip-gold, #D97706); }
  &.level-2 { background: linear-gradient(135deg, $svip-purple, #7C3AED); }
}

.current-tag {
  padding: 4px 10px;
  background: rgba($primary, 0.1);
  color: $primary;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    font-size: 14px;
    color: $text;
    border-bottom: 1px solid rgba($border, 0.5);
    
    &:last-child { border-bottom: none; }
    
    svg { color: $success; flex-shrink: 0; }
  }
}

// 定价区域
.pricing-section {
  margin-bottom: 48px;
}

.plan-group {
  margin-bottom: 48px;
  
  &.svip-group {
    .plan-header .plan-icon { background: linear-gradient(135deg, $svip-purple, #7C3AED); }
  }
}

.plan-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.plan-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  
  &.vip { background: linear-gradient(135deg, $vip-gold, #D97706); }
  &.svip { background: linear-gradient(135deg, $svip-purple, #7C3AED); }
}

.plan-title-group {
  flex: 1;
  
  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: $text;
  }
  
  p {
    margin: 4px 0 0;
    font-size: 14px;
    color: $text-muted;
  }
}

.discount-tag {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  
  &.vip {
    background: rgba($vip-gold, 0.15);
    color: #B45309;
  }
  
  &.svip {
    background: rgba($svip-purple, 0.15);
    color: $svip-purple;
  }
}

.pricing-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.pricing-card {
  position: relative;
  background: $card-bg;
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid $border;
  padding: 28px 24px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.1);
  }
  
  &.popular {
    border-color: $primary;
    box-shadow: 0 8px 32px rgba($primary, 0.15);
    
    &.svip-tier {
      border-color: $svip-purple;
      box-shadow: 0 8px 32px rgba($svip-purple, 0.15);
    }
  }
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: linear-gradient(135deg, $primary, $primary-light);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  
  &.svip {
    background: linear-gradient(135deg, $svip-purple, #7C3AED);
  }
}

.card-title {
  margin: 8px 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: $text;
}

.card-desc {
  margin: 0 0 20px;
  font-size: 13px;
  color: $text-muted;
}

.price-display {
  margin-bottom: 8px;
  
  .currency {
    font-size: 20px;
    font-weight: 600;
    color: $text;
    vertical-align: top;
  }
  
  .amount {
    font-size: 48px;
    font-weight: 700;
    color: $text;
    line-height: 1;
  }
  
  .decimal {
    font-size: 20px;
    font-weight: 600;
    color: $text;
  }
}

.price-period {
  margin: 0;
  font-size: 14px;
  color: $text-muted;
}

.price-daily {
  margin: 4px 0 20px;
  font-size: 12px;
  color: $text-muted;
}

.card-features {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  text-align: left;
  
  li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    font-size: 13px;
    color: $text;
    
    svg { color: $success; flex-shrink: 0; }
  }
}

.buy-btn {
  width: 100%;
  padding: 14px 24px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.vip-btn {
    background: linear-gradient(135deg, $vip-gold, #D97706);
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba($vip-gold, 0.4);
    }
  }
  
  &.svip-btn {
    background: linear-gradient(135deg, $svip-purple, #7C3AED);
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba($svip-purple, 0.4);
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 最高等级
.max-level-section {
  display: flex;
  justify-content: center;
}

.max-level-card {
  text-align: center;
  padding: 48px;
  background: linear-gradient(135deg, rgba($svip-purple, 0.08), rgba($primary, 0.05));
  border-radius: 20px;
  border: 1px solid rgba($svip-purple, 0.2);
  max-width: 480px;
  
  .max-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    background: linear-gradient(135deg, $svip-purple, #7C3AED);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
  
  h3 {
    margin: 0 0 12px;
    font-size: 24px;
    font-weight: 700;
    color: $text;
  }
  
  p {
    margin: 0 0 20px;
    color: $text-muted;
  }
  
  .expire-info {
    padding: 12px 20px;
    background: rgba($svip-purple, 0.1);
    border-radius: 10px;
    font-size: 14px;
    color: $svip-purple;
    font-weight: 500;
  }
}

// 支付对话框
.payment-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;
  }
  
  :deep(.el-dialog__header) {
    padding: 20px 24px;
    border-bottom: 1px solid $border;
  }
  
  :deep(.el-dialog__body) {
    padding: 24px;
  }
}

.payment-content {
  .payment-package {
    text-align: center;
    padding-bottom: 20px;
    border-bottom: 1px solid $border;
    margin-bottom: 20px;
    
    h4 {
      margin: 0 0 8px;
      font-size: 18px;
      font-weight: 600;
      color: $text;
    }
    
    p {
      margin: 0;
      font-size: 14px;
      color: $text-muted;
    }
  }
}

.payment-summary {
  margin-bottom: 24px;
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    font-size: 14px;
    color: $text-muted;
    border-bottom: 1px solid rgba($border, 0.5);
    
    &.total {
      border-bottom: none;
      padding-top: 16px;
      font-weight: 600;
      color: $text;
      
      .total-price {
        font-size: 20px;
        color: $cta;
      }
    }
  }
}

.payment-method {
  h5 {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 600;
    color: $text;
  }
  
  .method-option {
    width: 100%;
    
    :deep(.el-radio__label) {
      width: 100%;
    }
  }
  
  .method-content {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba($primary, 0.04);
    border-radius: 10px;
    
    svg { color: $success; }
    
    .method-name {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: $text;
    }
    
    .method-balance {
      display: block;
      font-size: 12px;
      color: $text-muted;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 响应式
@media (max-width: 768px) {
  .nav-container {
    padding: 12px 16px;
  }
  
  .main-content {
    padding: 32px 16px 60px;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }
  
  .stat-divider {
    width: 60px;
    height: 1px;
  }
  
  .plan-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .pricing-cards {
    grid-template-columns: 1fr;
  }
}

// 减少动画
@media (prefers-reduced-motion: reduce) {
  .gradient-orb,
  .level-card,
  .pricing-card,
  .buy-btn,
  .animate-fade-in,
  .animate-in {
    animation: none !important;
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
