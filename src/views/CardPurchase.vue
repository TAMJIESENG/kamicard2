<template>
  <div class="card-purchase-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
    </div>

    <!-- 顶部导航 -->
    <nav class="top-nav">
      <div class="nav-container">
        <div class="nav-brand">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span class="brand-text">CardKey<span class="brand-suffix">Pro</span></span>
        </div>
        
        <div class="nav-search">
          <el-input
            v-model="searchQuery"
            placeholder="搜索商品..."
            clearable
            size="large"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="nav-actions">
          <div class="user-info">
            <el-avatar :size="32" :src="userStore.user?.avatar">
              {{ userStore.user?.username?.charAt(0)?.toUpperCase() || 'U' }}
            </el-avatar>
            <span class="user-name">{{ userStore.user?.username || 'Guest' }}</span>
          </div>
          <div class="cart-btn" @click="showCartSidebar = true">
            <el-badge :value="cartItems.length" :hidden="!cartItems.length">
              <el-icon :size="20"><ShoppingCart /></el-icon>
            </el-badge>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 分类导航 -->
      <section class="category-section">
        <div class="category-scroll">
          <div
            v-for="(zone, index) in zones"
            :key="zone.id"
            class="category-chip animate-fade-in"
            :class="{ active: activeZone === zone.id }"
            :style="{ '--delay': (index * 0.05) + 's' }"
            @click="switchZone(zone.id)"
          >
            <span class="chip-icon">
              <span v-if="!zone.customIcon">{{ zone.icon || '🎯' }}</span>
              <img v-else :src="zone.customIcon" :alt="zone.name" @error="handleIconError(zone)" />
            </span>
            <span class="chip-text">{{ zone.name }}</span>
            <span class="chip-count">{{ zone.productCount }}</span>
          </div>
        </div>
      </section>

      <!-- 筛选栏 -->
      <section class="filter-section animate-fade-in" style="--delay: 0.3s">
        <div class="filter-left">
          <el-select v-model="priceFilter" placeholder="价格" clearable size="default">
            <el-option label="全部" value="" />
            <el-option label="¥0-50" value="0-50" />
            <el-option label="¥50-100" value="50-100" />
            <el-option label="¥100-500" value="100-500" />
            <el-option label="¥500+" value="500+" />
          </el-select>
          <el-select v-model="sortOrder" placeholder="排序" size="default">
            <el-option label="推荐" value="recommended" />
            <el-option label="价格↑" value="price-asc" />
            <el-option label="价格↓" value="price-desc" />
            <el-option label="最新" value="newest" />
            <el-option label="热销" value="sales" />
          </el-select>
        </div>
        <div class="filter-right">
          <span class="result-count">{{ filteredProducts.length }} 款商品</span>
        </div>
      </section>

      <!-- 商品网格 -->
      <section class="products-section" ref="productsSection">
        <div class="products-grid" v-loading="loading">
          <div
            v-for="(product, index) in paginatedProducts"
            :key="product.id"
            class="product-card"
            :class="{ 'out-of-stock': product.stock === 0, 'animate-in': productsVisible }"
            :style="{ '--delay': (index % 12 * 0.05) + 's' }"
          >
            <!-- 商品图片 -->
            <div class="card-image" @click="showProductDetails(product)">
              <img :src="product.image || DEFAULT_PRODUCT_IMAGE" :alt="product.name" @error="handleImageError" />
              <div class="image-overlay">
                <el-icon :size="24"><View /></el-icon>
              </div>
              <div class="card-badges">
                <span v-if="product.isHot" class="badge hot">热销</span>
                <span v-if="product.isNew" class="badge new">新品</span>
                <span v-if="product.stock === 0" class="badge sold-out">售罄</span>
              </div>
            </div>

            <!-- 商品信息 -->
            <div class="card-content">
              <h3 class="product-name" :title="product.name">{{ product.name }}</h3>
              <p class="product-desc">{{ product.description }}</p>
              
              <div class="product-meta">
                <el-rate v-model="product.rating" disabled size="small" />
                <span class="stock-info">库存 {{ product.stock }}</span>
              </div>

              <!-- 价格区域 -->
              <div class="price-area">
                <div v-if="userVipInfo.level > 0" class="vip-price">
                  <span class="current">¥{{ calculateProductPrice(product, 1).finalTotal.toFixed(2) }}</span>
                  <span class="original">¥{{ product.price.toFixed(2) }}</span>
                  <el-tag size="small" :type="userVipInfo.level === 2 ? 'danger' : 'warning'">
                    {{ userVipInfo.name }}
                  </el-tag>
                </div>
                <div v-else class="normal-price">
                  <span class="current">¥{{ product.price.toFixed(2) }}</span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="card-actions">
                <el-button type="primary" :disabled="product.stock === 0" @click="buyNow(product)">
                  立即购买
                </el-button>
                <el-button :disabled="product.stock === 0" @click="addToCart(product)">
                  <el-icon><ShoppingCart /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="filteredProducts.length === 0 && !loading" class="empty-state">
            <el-icon :size="64"><Box /></el-icon>
            <h3>暂无商品</h3>
            <p>当前分类暂无商品，请切换其他分类</p>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrap" v-if="filteredProducts.length > 0">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[12, 24, 48]"
            :total="filteredProducts.length"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </section>
    </main>

    <!-- 购物车侧边栏 -->
    <el-drawer v-model="showCartSidebar" title="购物车" direction="rtl" size="380px">
      <div class="cart-content">
        <div v-if="cartItems.length === 0" class="cart-empty">
          <el-icon :size="48"><ShoppingCart /></el-icon>
          <p>购物车是空的</p>
        </div>
        
        <div v-else class="cart-items">
          <div v-for="item in cartItems" :key="item.id" class="cart-item">
            <img :src="item.image || DEFAULT_PRODUCT_IMAGE" :alt="item.name" />
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <div class="item-price">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
              <div class="item-controls">
                <el-input-number v-model="item.quantity" :min="1" :max="item.stock" size="small" />
                <el-button type="danger" text size="small" @click="removeFromCart(item.id)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer v-if="cartItems.length > 0">
        <div class="cart-footer">
          <div class="cart-total">
            <span>合计</span>
            <span class="total-price">¥{{ cartTotal.toFixed(2) }}</span>
          </div>
          <el-button type="primary" size="large" @click="proceedToCheckout">
            结算 ({{ cartItems.length }})
          </el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 商品详情弹窗 -->
    <el-dialog v-model="showProductDetailDialog" :title="currentDetailProduct?.name" width="800px" class="detail-dialog">
      <div v-if="currentDetailProduct" class="detail-content">
        <div class="detail-left">
          <img :src="currentDetailProduct.image || DEFAULT_PRODUCT_IMAGE" :alt="currentDetailProduct.name" />
        </div>
        <div class="detail-right">
          <div class="detail-badges">
            <el-tag v-if="currentDetailProduct.isHot" type="danger" size="small">热销</el-tag>
            <el-tag v-if="currentDetailProduct.isNew" type="primary" size="small">新品</el-tag>
          </div>
          <h2>{{ currentDetailProduct.name }}</h2>
          <p class="detail-desc">{{ currentDetailProduct.description }}</p>
          
          <div class="detail-rating">
            <el-rate v-model="currentDetailProduct.rating" disabled />
            <span>({{ currentDetailProduct.reviewCount || 0 }}条评价)</span>
          </div>
          
          <div class="detail-price">
            <span class="price-label">价格</span>
            <span class="price-value">¥{{ calculateProductPrice(currentDetailProduct, 1).finalTotal.toFixed(2) }}</span>
            <span v-if="userVipInfo.level > 0" class="price-original">¥{{ currentDetailProduct.price.toFixed(2) }}</span>
          </div>
          
          <div class="detail-stock">
            <span class="stock-label">库存</span>
            <span class="stock-value">{{ currentDetailProduct.stock }} 件</span>
          </div>
          
          <div class="detail-quantity">
            <span class="qty-label">数量</span>
            <el-input-number v-model="detailQuantity" :min="1" :max="currentDetailProduct.stock" />
          </div>
          
          <div class="detail-actions">
            <el-button type="primary" size="large" :disabled="!currentDetailProduct.stock" @click="buyNowFromDetail">
              立即购买
            </el-button>
            <el-button size="large" :disabled="!currentDetailProduct.stock" @click="addToCartFromDetail">
              加入购物车
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 购买确认弹窗 -->
    <el-dialog v-model="showPurchaseDialog" title="确认购买" width="500px" class="purchase-dialog">
      <div v-if="currentProduct" class="purchase-content">
        <div class="purchase-product">
          <img :src="currentProduct.image || DEFAULT_PRODUCT_IMAGE" :alt="currentProduct.name" />
          <div class="product-info">
            <h4>{{ currentProduct.name }}</h4>
            <p>单价：¥{{ calculateFinalPrice(currentProduct.price, 1, true).actualPrice.toFixed(2) }}</p>
          </div>
        </div>

        <!-- 卡密类型选择 -->
        <div v-if="availableCardTypes.length > 0" class="card-type-section">
          <h5>选择类型</h5>
          <div class="card-type-grid">
            <div
              v-for="cardType in availableCardTypes"
              :key="cardType.id"
              class="card-type-item"
              :class="{ active: selectedCardType?.id === cardType.id }"
              @click="selectCardType(cardType)"
            >
              <span class="type-name">{{ cardType.name }}</span>
              <span class="type-price">¥{{ cardType.price?.toFixed(2) || '0.00' }}</span>
              <span class="type-stock">库存: {{ getCardTypeStock(cardType.id) }}</span>
            </div>
          </div>
        </div>

        <!-- 数量选择 -->
        <div class="quantity-section">
          <h5>购买数量</h5>
          <el-input-number v-model="purchaseQuantity" :min="1" :max="getMaxQuantity()" />
          <span class="max-hint">最多 {{ getMaxQuantity() }} 张</span>
        </div>

        <!-- 优惠券 -->
        <div class="coupon-section">
          <h5>优惠券</h5>
          <div v-if="selectedPurchaseCoupon" class="selected-coupon">
            <span>{{ selectedPurchaseCoupon.name }}</span>
            <span class="coupon-discount">-¥{{ purchaseCouponDiscount.toFixed(2) }}</span>
            <el-button type="text" size="small" @click="removePurchaseCoupon">移除</el-button>
          </div>
          <div v-else>
            <!-- 可用优惠券列表 -->
            <div v-if="availableCoupons.length > 0" class="available-coupons">
              <div 
                v-for="coupon in availableCoupons" 
                :key="coupon.id" 
                class="coupon-item"
                @click="selectCoupon(coupon)"
              >
                <div class="coupon-value">
                  <span v-if="coupon.type === 'percentage'">{{ coupon.value }}%</span>
                  <span v-else>¥{{ coupon.value }}</span>
                </div>
                <div class="coupon-info">
                  <div class="coupon-name">{{ coupon.name }}</div>
                  <div class="coupon-condition">
                    <span v-if="coupon.minAmount">满¥{{ coupon.minAmount }}可用</span>
                    <span v-else>无门槛</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="no-coupons">暂无可用优惠券</div>
            <!-- 手动输入优惠券代码 -->
            <div class="coupon-input">
              <el-input v-model="purchaseCouponCode" placeholder="或输入优惠券代码" size="default">
                <template #append>
                  <el-button @click="validatePurchaseCouponCode" :loading="purchaseCouponValidationLoading">验证</el-button>
                </template>
              </el-input>
            </div>
          </div>
        </div>

        <!-- 支付方式 -->
        <div class="payment-section">
          <h5>支付方式</h5>
          <el-radio-group v-model="selectedPaymentMethod">
            <el-radio value="balance">
              余额支付 (¥{{ (userStore.user?.balance || 0).toFixed(2) }})
            </el-radio>
          </el-radio-group>
        </div>

        <!-- 价格汇总 -->
        <div class="price-summary">
          <div class="summary-row">
            <span>商品金额</span>
            <span>¥{{ calculateFinalPrice(currentProduct.price, purchaseQuantity, true).originalTotal.toFixed(2) }}</span>
          </div>
          <div v-if="userVipInfo.level > 0" class="summary-row discount">
            <span>{{ userVipInfo.name }}优惠</span>
            <span>-¥{{ calculateFinalPrice(currentProduct.price, purchaseQuantity, true).totalSavings.toFixed(2) }}</span>
          </div>
          <div v-if="purchaseCouponDiscount > 0" class="summary-row discount">
            <span>优惠券</span>
            <span>-¥{{ purchaseCouponDiscount.toFixed(2) }}</span>
          </div>
          <div class="summary-row total">
            <span>实付金额</span>
            <span class="total-price">¥{{ getPurchaseFinalAmount().toFixed(2) }}</span>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showPurchaseDialog = false">取消</el-button>
        <el-button type="primary" :loading="purchasing" :disabled="!canProceedPurchase" @click="confirmPurchase">
          确认支付
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量购买弹窗 -->
    <el-dialog v-model="showBatchPurchaseDialog" title="批量购买确认" width="600px">
      <div class="batch-content">
        <div class="batch-items">
          <div v-for="item in cartItems" :key="item.id" class="batch-item">
            <img :src="item.image || DEFAULT_PRODUCT_IMAGE" :alt="item.name" />
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <span>×{{ item.quantity }}</span>
            </div>
            <span class="item-price">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
        </div>
        
        <div class="batch-summary">
          <div class="summary-row">
            <span>商品总价</span>
            <span>¥{{ cartTotal.toFixed(2) }}</span>
          </div>
          <div v-if="couponDiscount > 0" class="summary-row discount">
            <span>优惠券</span>
            <span>-¥{{ couponDiscount.toFixed(2) }}</span>
          </div>
          <div class="summary-row total">
            <span>应付金额</span>
            <span class="total-price">¥{{ finalPaymentAmount.toFixed(2) }}</span>
          </div>
        </div>
        
        <div class="payment-method">
          <h5>支付方式</h5>
          <el-radio-group v-model="selectedPaymentMethod">
            <el-radio value="balance">余额支付 (¥{{ (userStore.user?.balance || 0).toFixed(2) }})</el-radio>
          </el-radio-group>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showBatchPurchaseDialog = false">取消</el-button>
        <el-button type="primary" :loading="batchPurchaseLoading" @click="confirmBatchPurchase">确认购买</el-button>
      </template>
    </el-dialog>

    <!-- 评价弹窗 -->
    <el-dialog v-model="showReviewDialog" :title="`评价 - ${currentReviewProduct?.name}`" width="500px">
      <div v-if="currentReviewProduct" class="review-form">
        <div class="review-rating">
          <span>评分</span>
          <el-rate v-model="newReview.rating" :texts="['极差', '较差', '一般', '推荐', '力荐']" show-text />
        </div>
        <el-input v-model="newReview.content" type="textarea" :rows="4" placeholder="分享您的使用体验..." maxlength="500" show-word-limit />
      </div>
      <template #footer>
        <el-button @click="showReviewDialog = false">取消</el-button>
        <el-button type="primary" @click="submitReview" :disabled="!newReview.content.trim()">提交评价</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useVipStore } from '@/stores/vip'
import { Search, ShoppingCart, Delete, View, Box } from '@element-plus/icons-vue'

// 默认商品图片 - 使用 Vite 的 BASE_URL
const DEFAULT_PRODUCT_IMAGE = `${import.meta.env.BASE_URL}default-product.jpg`

const userStore = useUserStore()
const vipStore = useVipStore()

// 页面状态
const loading = ref(false)
const searchQuery = ref('')
const activeZone = ref(1)
const priceFilter = ref('')
const sortOrder = ref('recommended')
const currentPage = ref(1)
const pageSize = ref(12)

// 动画相关
const productsSection = ref(null)
const productsVisible = ref(false)
let observer = null

const setupObserver = () => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.target === productsSection.value) {
        productsVisible.value = true
      }
    })
  }, { threshold: 0.1 })
  
  if (productsSection.value) observer.observe(productsSection.value)
}

// 购物车
const showCartSidebar = ref(false)
const cartItems = ref([])
const showBatchPurchaseDialog = ref(false)
const batchPurchaseLoading = ref(false)

// 优惠券
const selectedCoupon = ref(null)
const couponCode = ref('')
const selectedPurchaseCoupon = ref(null)
const purchaseCouponCode = ref('')
const purchaseCouponValidationLoading = ref(false)

// 商品详情
const showProductDetailDialog = ref(false)
const currentDetailProduct = ref(null)
const detailQuantity = ref(1)

// 评价
const showReviewDialog = ref(false)
const currentReviewProduct = ref(null)
const newReview = reactive({ rating: 5, content: '' })

// 购买
const showPurchaseDialog = ref(false)
const currentProduct = ref(null)
const purchaseQuantity = ref(1)
const selectedPaymentMethod = ref('balance')
const purchasing = ref(false)
const selectedCardType = ref(null)

// 数据
const zones = ref([])
const products = ref([])

// 用户VIP信息
const user = computed(() => userStore.user)
const userVipInfo = computed(() => {
  if (!user.value) return vipStore.vipLevels['普通']
  return vipStore.getUserVipInfo(user.value.level || '普通')
})

// 计算属性
const currentZoneProducts = computed(() => products.value.filter(p => p.zoneId === activeZone.value))

const filteredProducts = computed(() => {
  let filtered = currentZoneProducts.value
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query))
  }
  if (priceFilter.value) {
    const [min, max] = priceFilter.value.split('-').map(v => v === '+' ? Infinity : parseInt(v))
    filtered = filtered.filter(p => p.price >= min && (max === undefined || p.price <= max))
  }
  switch (sortOrder.value) {
    case 'price-asc': filtered.sort((a, b) => a.price - b.price); break
    case 'price-desc': filtered.sort((a, b) => b.price - a.price); break
    case 'newest': filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break
    case 'sales': filtered.sort((a, b) => (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0)); break
    default: filtered.sort((a, b) => {
      if (a.isHot && !b.isHot) return -1
      if (!a.isHot && b.isHot) return 1
      return b.rating - a.rating
    })
  }
  return filtered
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredProducts.value.slice(start, start + pageSize.value)
})

const cartTotal = computed(() => cartItems.value.reduce((t, i) => t + i.price * i.quantity, 0))
const couponDiscount = computed(() => selectedCoupon.value ? Math.min(cartTotal.value * 0.1, 50) : 0)
const finalPaymentAmount = computed(() => Math.max(0, cartTotal.value - couponDiscount.value))

const availableCardTypes = computed(() => {
  const types = currentProduct.value?.cardTypes || []
  const allCards = JSON.parse(localStorage.getItem('all_cards') || '[]')
  return types.map(type => {
    const typeCards = allCards.filter(card => 
      card.status === 'unused' && !card.purchasedBy &&
      String(card.zoneId) === String(currentProduct.value?.zoneId) &&
      String(card.productId) === String(currentProduct.value?.id) &&
      String(card.cardTypeId) === String(type.id)
    )
    if (typeCards.length > 0 && typeCards[0].cardTypePrice) {
      type.price = typeCards[0].cardTypePrice
    }
    return type
  })
})

const purchaseCouponDiscount = computed(() => {
  if (!selectedPurchaseCoupon.value || !currentProduct.value) return 0
  const basePrice = calculateFinalPrice(currentProduct.value.price, purchaseQuantity.value, true).finalTotal
  const coupon = selectedPurchaseCoupon.value
  if (coupon.type === 'percentage') return Math.min(basePrice * (coupon.value / 100), coupon.maxDiscount || Infinity)
  if (coupon.type === 'fixed') return Math.min(coupon.value, basePrice)
  if (coupon.type === 'threshold' && basePrice >= coupon.minAmount) return coupon.discountAmount
  return 0
})

// 获取用户可用优惠券
const availableCoupons = computed(() => {
  if (!userStore.user?.id) return []
  const allCoupons = JSON.parse(localStorage.getItem('coupons') || '[]')
  const userId = String(userStore.user.id)
  const now = new Date()
  
  // 用于去重的 Map，key 是优惠券的原始 ID（去掉 _claimed_ 等后缀）
  const couponMap = new Map()
  
  allCoupons.forEach(coupon => {
    // 必须是激活状态
    if (!coupon.isActive) return
    // 检查有效期
    if (new Date(coupon.validTo) < now) return
    if (new Date(coupon.validFrom) > now) return
    // 检查使用次数
    if (coupon.usedCount >= coupon.usageLimit) return
    // 检查是否属于当前用户（专属优惠券或已领取的）
    const couponUserId = coupon.userId ? String(coupon.userId) : null
    if (couponUserId !== userId) {
      // 检查 userIds 数组
      if (!coupon.userIds || !coupon.userIds.map(String).includes(userId)) {
        return
      }
    }
    
    // 提取原始优惠券 ID（去掉 _claimed_xxx 或 _user_xxx 后缀）
    const originalId = coupon.id.toString().split('_claimed_')[0].split('_user_')[0]
    
    // 优先保留用户专属的副本（带 _claimed_ 或 _user_ 的）
    const existing = couponMap.get(originalId)
    if (!existing || coupon.id.toString().includes('_claimed_') || coupon.id.toString().includes('_user_')) {
      couponMap.set(originalId, coupon)
    }
  })
  
  return Array.from(couponMap.values())
})

// 选择优惠券
const selectCoupon = (coupon) => {
  selectedPurchaseCoupon.value = coupon
  ElMessage.success(`已选择优惠券: ${coupon.name}`)
}

const canProceedPurchase = computed(() => {
  if (!currentProduct.value) return false
  if (availableCardTypes.value.length > 0 && !selectedCardType.value) return false
  if (selectedCardType.value && getCardTypeStock(selectedCardType.value.id) < purchaseQuantity.value) return false
  if (selectedPaymentMethod.value === 'balance') {
    return (userStore.user?.balance || 0) >= getPurchaseFinalAmount()
  }
  return true
})

// 方法
const switchZone = (zoneId) => { activeZone.value = zoneId; currentPage.value = 1 }
const handleSizeChange = (val) => { pageSize.value = val; currentPage.value = 1 }
const handleCurrentChange = (val) => { currentPage.value = val }
const handleIconError = (zone) => { zone.customIcon = ''; zone.icon = zone.icon || '🎯' }
const handleImageError = (e) => { e.target.src = DEFAULT_PRODUCT_IMAGE }

const calculateProductPrice = (product, quantity = 1) => {
  let actualPrice = product.price
  if (product.cardTypes?.length > 0) {
    const allCards = JSON.parse(localStorage.getItem('all_cards') || '[]')
    const availableType = product.cardTypes.find(ct => {
      const cards = allCards.filter(c => c.status === 'unused' && !c.purchasedBy &&
        String(c.zoneId) === String(product.zoneId) && String(c.productId) === String(product.id) && String(c.cardTypeId) === String(ct.id))
      return cards.length > 0
    })
    if (availableType) {
      const cards = allCards.filter(c => c.status === 'unused' && !c.purchasedBy &&
        String(c.zoneId) === String(product.zoneId) && String(c.productId) === String(product.id) && String(c.cardTypeId) === String(availableType.id))
      if (cards[0]?.cardTypePrice) actualPrice = cards[0].cardTypePrice
    }
  }
  const discountInfo = vipStore.calculateDiscountPrice(actualPrice, user.value?.level || '普通')
  return {
    originalTotal: actualPrice * quantity,
    finalTotal: discountInfo.finalPrice * quantity,
    totalSavings: discountInfo.savings * quantity,
    hasDiscount: discountInfo.discount > 0,
    actualPrice
  }
}

const calculateFinalPrice = (basePrice, quantity = 1, useCardTypePrice = false) => {
  let actualPrice = basePrice
  if (useCardTypePrice && selectedCardType.value) {
    const allCards = JSON.parse(localStorage.getItem('all_cards') || '[]')
    const cards = allCards.filter(c => c.status === 'unused' && !c.purchasedBy &&
      c.zoneId === currentProduct.value?.zoneId && c.productId === currentProduct.value?.id && c.cardTypeId === selectedCardType.value.id)
    if (cards[0]?.cardTypePrice) actualPrice = cards[0].cardTypePrice
    else if (selectedCardType.value.price) actualPrice = selectedCardType.value.price
  }
  const discountInfo = vipStore.calculateDiscountPrice(actualPrice, user.value?.level || '普通')
  return {
    originalTotal: actualPrice * quantity,
    finalTotal: discountInfo.finalPrice * quantity,
    totalSavings: discountInfo.savings * quantity,
    hasDiscount: discountInfo.discount > 0,
    actualPrice
  }
}

const getPurchaseFinalAmount = () => {
  if (!currentProduct.value) return 0
  return Math.max(0, calculateFinalPrice(currentProduct.value.price, purchaseQuantity.value, true).finalTotal - purchaseCouponDiscount.value)
}

const getCardTypeStock = (cardTypeId) => {
  const allCards = JSON.parse(localStorage.getItem('all_cards') || '[]')
  return allCards.filter(c => String(c.zoneId) === String(currentProduct.value?.zoneId) &&
    String(c.productId) === String(currentProduct.value?.id) && String(c.cardTypeId) === String(cardTypeId) &&
    c.status === 'unused' && !c.purchasedBy).length
}

const getMaxQuantity = () => {
  if (!currentProduct.value) return 1
  return Math.max(1, Math.min(selectedCardType.value ? getCardTypeStock(selectedCardType.value.id) : currentProduct.value.stock || 0, 99))
}

const selectCardType = (cardType) => {
  selectedCardType.value = cardType
  const maxQty = getMaxQuantity()
  if (purchaseQuantity.value > maxQty) purchaseQuantity.value = Math.max(1, maxQty)
}

// 购物车操作
const addToCart = (product) => {
  const existing = cartItems.value.find(i => i.id === product.id)
  if (existing) {
    if (existing.quantity + 1 <= product.stock) { existing.quantity++; ElMessage.success('已添加到购物车') }
    else ElMessage.warning('库存不足')
  } else {
    cartItems.value.push({ ...product, quantity: 1 })
    ElMessage.success('已添加到购物车')
  }
}

const removeFromCart = (productId) => {
  const idx = cartItems.value.findIndex(i => i.id === productId)
  if (idx !== -1) { cartItems.value.splice(idx, 1); ElMessage.success('已移除') }
}

const addToCartFromDetail = () => {
  if (!currentDetailProduct.value) return
  const existing = cartItems.value.find(i => i.id === currentDetailProduct.value.id)
  if (existing) {
    if (existing.quantity + detailQuantity.value <= currentDetailProduct.value.stock) {
      existing.quantity += detailQuantity.value
      ElMessage.success('已添加到购物车')
    } else ElMessage.warning('库存不足')
  } else {
    cartItems.value.push({ ...currentDetailProduct.value, quantity: detailQuantity.value })
    ElMessage.success('已添加到购物车')
  }
  showProductDetailDialog.value = false
}

// 购买操作
const buyNow = (product) => {
  currentProduct.value = product
  purchaseQuantity.value = 1
  selectedPaymentMethod.value = 'balance'
  selectedCardType.value = null
  selectedPurchaseCoupon.value = null
  purchaseCouponCode.value = ''
  showPurchaseDialog.value = true
  if (product.cardTypes?.length > 0) {
    const firstAvailable = product.cardTypes.find(t => getCardTypeStock(t.id) > 0)
    if (firstAvailable) selectedCardType.value = firstAvailable
  }
}

const buyNowFromDetail = () => {
  if (!currentDetailProduct.value) return
  currentProduct.value = currentDetailProduct.value
  purchaseQuantity.value = detailQuantity.value
  selectedPaymentMethod.value = 'balance'
  selectedCardType.value = null
  selectedPurchaseCoupon.value = null
  purchaseCouponCode.value = ''
  showProductDetailDialog.value = false
  showPurchaseDialog.value = true
}

const proceedToCheckout = () => {
  if (!cartItems.value.length) { ElMessage.warning('购物车是空的'); return }
  if (!userStore.user) { ElMessage.warning('请先登录'); return }
  showBatchPurchaseDialog.value = true
}

const showProductDetails = (product) => {
  currentDetailProduct.value = product
  detailQuantity.value = 1
  showProductDetailDialog.value = true
}

// 优惠券
const validatePurchaseCouponCode = async () => {
  if (!purchaseCouponCode.value.trim()) { ElMessage.warning('请输入优惠券代码'); return }
  purchaseCouponValidationLoading.value = true
  try {
    const allCoupons = JSON.parse(localStorage.getItem('coupons') || '[]')
    const coupon = allCoupons.find(c => c.code.toUpperCase() === purchaseCouponCode.value.toUpperCase())
    if (!coupon) { ElMessage.error('优惠券不存在'); return }
    if (coupon.usedCount >= coupon.usageLimit) { ElMessage.error('优惠券已用完'); return }
    if (new Date() > new Date(coupon.validTo)) { ElMessage.error('优惠券已过期'); return }
    selectedPurchaseCoupon.value = coupon
    ElMessage.success('优惠券验证成功')
  } finally { purchaseCouponValidationLoading.value = false }
}

const removePurchaseCoupon = () => { selectedPurchaseCoupon.value = null; purchaseCouponCode.value = '' }

// 确认购买
const confirmPurchase = async () => {
  if (!currentProduct.value) return
  purchasing.value = true
  try {
    const allCards = JSON.parse(localStorage.getItem('all_cards') || '[]')
    let availableCards = selectedCardType.value
      ? allCards.filter(c => c.status === 'unused' && !c.purchasedBy &&
          String(c.zoneId) === String(currentProduct.value.zoneId) && String(c.productId) === String(currentProduct.value.id) &&
          String(c.cardTypeId) === String(selectedCardType.value.id))
      : allCards.filter(c => c.status === 'unused' && !c.purchasedBy &&
          String(c.zoneId) === String(currentProduct.value.zoneId) && String(c.productId) === String(currentProduct.value.id))
    
    if (availableCards.length < purchaseQuantity.value) { ElMessage.error('库存不足'); return }
    
    await new Promise(r => setTimeout(r, 1000))
    
    const priceInfo = calculateFinalPrice(currentProduct.value.price, purchaseQuantity.value, true)
    const totalCost = Math.max(0, priceInfo.finalTotal - purchaseCouponDiscount.value)
    const purchasedCards = availableCards.slice(0, purchaseQuantity.value)
    const purchaseTime = new Date().toLocaleString('zh-CN')
    
    // 更新卡密状态
    purchasedCards.forEach(pc => {
      const idx = allCards.findIndex(c => c.id === pc.id)
      if (idx !== -1) {
        allCards[idx].status = 'sold'
        allCards[idx].purchasedBy = userStore.user.id
        allCards[idx].purchaser = userStore.user.username
        allCards[idx].purchaseTime = purchaseTime
      }
    })
    localStorage.setItem('all_cards', JSON.stringify(allCards))
    
    // 创建订单
    const order = {
      id: Date.now(),
      orderNumber: `CD${Date.now()}`,
      userId: userStore.user.id,
      username: userStore.user.username,
      productId: currentProduct.value.id,
      productName: currentProduct.value.name,
      quantity: purchaseQuantity.value,
      totalAmount: totalCost,
      status: 'completed',
      createTime: purchaseTime,
      cardKeys: purchasedCards.map(c => c.cardNumber)
    }
    const allOrders = JSON.parse(localStorage.getItem('all_orders') || '[]')
    allOrders.unshift(order)
    localStorage.setItem('all_orders', JSON.stringify(allOrders))
    
    // 扣除余额
    if (selectedPaymentMethod.value === 'balance') {
      await userStore.updateUserBalance(userStore.user.id, (userStore.user.balance || 0) - totalCost, `购买：${currentProduct.value.name}`)
      await userStore.refreshCurrentUser()
    }
    
    loadData()
    ElMessage.success(`购买成功！实付¥${totalCost.toFixed(2)}`)
    showPurchaseDialog.value = false
    
    // 显示卡密
    ElMessageBox.alert(
      `<div style="max-height:300px;overflow-y:auto;">
        <p><strong>您的卡密：</strong></p>
        ${order.cardKeys.map(k => `<div style="margin:8px 0;padding:8px;background:#f5f7fa;border-radius:4px;font-family:monospace;">${k}</div>`).join('')}
        <p style="color:#E6A23C;margin-top:16px;"><strong>请妥善保管！</strong></p>
      </div>`,
      '卡密信息',
      { confirmButtonText: '我已保存', dangerouslyUseHTMLString: true }
    )
  } catch (e) {
    console.error(e)
    ElMessage.error('购买失败')
  } finally { purchasing.value = false }
}

// 批量购买
const confirmBatchPurchase = async () => {
  if (!selectedPaymentMethod.value) { ElMessage.warning('请选择支付方式'); return }
  batchPurchaseLoading.value = true
  try {
    // 简化的批量购买逻辑
    const totalCost = finalPaymentAmount.value
    if ((userStore.user?.balance || 0) < totalCost) { ElMessage.error('余额不足'); return }
    
    await userStore.updateUserBalance(userStore.user.id, (userStore.user.balance || 0) - totalCost, '批量购买')
    await userStore.refreshCurrentUser()
    
    cartItems.value = []
    showBatchPurchaseDialog.value = false
    ElMessage.success('批量购买成功！')
  } catch (e) {
    ElMessage.error('购买失败')
  } finally { batchPurchaseLoading.value = false }
}

// 评价
const submitReview = () => {
  if (!newReview.content.trim()) { ElMessage.warning('请填写评价内容'); return }
  ElMessage.success('评价提交成功')
  showReviewDialog.value = false
}

// 数据加载
const loadData = async () => {
  loading.value = true
  try {
    // 加载专区 - 从 card_zones 读取
    const savedZones = JSON.parse(localStorage.getItem('card_zones') || '[]')
    zones.value = savedZones.length ? savedZones : [{ id: 1, name: '默认专区', icon: '🎯', productCount: 0 }]
    if (zones.value.length && !zones.value.find(z => z.id === activeZone.value)) activeZone.value = zones.value[0].id
    
    // 加载商品 - 从 card_products 读取
    const savedProducts = JSON.parse(localStorage.getItem('card_products') || '[]')
    const allCards = JSON.parse(localStorage.getItem('all_cards') || '[]')
    
    products.value = savedProducts.map(p => {
      const stock = allCards.filter(c => c.status === 'unused' && !c.purchasedBy &&
        String(c.zoneId) === String(p.zoneId) && String(c.productId) === String(p.id)).length
      return { ...p, stock, quantity: 1, rating: p.rating || 4.5 }
    })
    
    // 更新专区商品数量
    zones.value.forEach(z => { z.productCount = products.value.filter(p => String(p.zoneId) === String(z.id)).length })
  } finally { loading.value = false }
}

onMounted(() => {
  loadData()
  setTimeout(setupObserver, 100)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<style lang="scss" scoped>
// 设计系统
$primary: #2563EB;
$primary-light: #3B82F6;
$success: #10B981;
$warning: #F59E0B;
$danger: #EF4444;
$text: #1E293B;
$text-muted: #64748B;
$border: #E2E8F0;
$bg: #F8FAFC;
$card-bg: rgba(255, 255, 255, 0.9);

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

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.1); opacity: 0.3; }
}

// 动画类
.animate-fade-in {
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
  animation-delay: var(--delay, 0s);
}

.animate-in {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s ease-out forwards;
  animation-delay: var(--delay, 0s);
}

.card-purchase-page {
  min-height: 100vh;
  background: linear-gradient(135deg, $bg 0%, #EEF2FF 100%);
  position: relative;
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
  opacity: 0.4;
  
  &.orb-1 {
    width: 600px;
    height: 600px;
    background: linear-gradient(135deg, rgba($primary, 0.2), rgba(#8B5CF6, 0.15));
    top: -200px;
    right: -200px;
    animation: pulse 10s ease-in-out infinite;
  }
  
  &.orb-2 {
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, rgba($success, 0.15), rgba($primary, 0.1));
    bottom: -100px;
    left: -100px;
    animation: pulse 12s ease-in-out infinite;
    animation-delay: 3s;
  }
}

// 导航
.top-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba($border, 0.8);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  
  .brand-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, $primary, #8B5CF6);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    
    svg { width: 20px; height: 20px; }
  }
  
  .brand-text {
    font-size: 20px;
    font-weight: 700;
    color: $text;
    
    .brand-suffix {
      color: $primary;
      font-weight: 600;
    }
  }
}

.nav-search {
  flex: 1;
  max-width: 400px;
  
  :deep(.el-input__wrapper) {
    border-radius: 10px;
    background: rgba($bg, 0.8);
  }
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .user-name {
    font-size: 14px;
    font-weight: 500;
    color: $text;
  }
}

.cart-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba($primary, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  color: $primary;
  
  &:hover {
    background: rgba($primary, 0.15);
  }
}

// 主内容
.main-content {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

// 分类
.category-section {
  margin-bottom: 24px;
}

.category-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 0;
  
  &::-webkit-scrollbar { height: 4px; }
  &::-webkit-scrollbar-thumb { background: $border; border-radius: 2px; }
}

.category-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: $card-bg;
  border: 1px solid $border;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover { border-color: $primary; }
  
  &.active {
    background: linear-gradient(135deg, $primary, $primary-light);
    border-color: transparent;
    color: white;
    
    .chip-count { background: rgba(255,255,255,0.2); color: white; }
  }
  
  .chip-icon {
    font-size: 18px;
    
    img { width: 20px; height: 20px; border-radius: 4px; }
  }
  
  .chip-text { font-weight: 500; }
  
  .chip-count {
    padding: 2px 8px;
    background: rgba($primary, 0.1);
    border-radius: 10px;
    font-size: 12px;
    color: $primary;
  }
}

// 筛选
.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: $card-bg;
  border-radius: 12px;
  border: 1px solid $border;
}

.filter-left {
  display: flex;
  gap: 12px;
  
  :deep(.el-select) { width: 120px; }
}

.result-count {
  font-size: 14px;
  color: $text-muted;
}

// 商品网格
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  min-height: 400px;
}

.product-card {
  background: $card-bg;
  border-radius: 16px;
  border: 1px solid $border;
  overflow: hidden;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
  }
  
  &.out-of-stock { opacity: 0.6; }
}

.card-image {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
  cursor: pointer;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  
  &:hover img { transform: scale(1.05); }
  
  .image-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
    color: white;
  }
  
  &:hover .image-overlay { opacity: 1; }
}

.card-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 6px;
  
  .badge {
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    
    &.hot { background: $danger; color: white; }
    &.new { background: $primary; color: white; }
    &.sold-out { background: $text-muted; color: white; }
  }
}

.card-content {
  padding: 16px;
}

.product-name {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: $text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: $text-muted;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  .stock-info {
    font-size: 12px;
    color: $text-muted;
  }
}

.price-area {
  margin-bottom: 16px;
}

.vip-price, .normal-price {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.current {
  font-size: 20px;
  font-weight: 700;
  color: $danger;
}

.original {
  font-size: 14px;
  color: $text-muted;
  text-decoration: line-through;
}

.card-actions {
  display: flex;
  gap: 8px;
  
  .el-button { flex: 1; }
  .el-button:last-child { flex: none; width: 44px; }
}

// 空状态
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px 20px;
  color: $text-muted;
  
  h3 { margin: 16px 0 8px; color: $text; }
}

// 分页
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

// 购物车
.cart-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.cart-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: $text-muted;
  
  p { margin-top: 12px; }
}

.cart-items {
  flex: 1;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid $border;
  
  img {
    width: 64px;
    height: 64px;
    border-radius: 8px;
    object-fit: cover;
  }
  
  .item-info {
    flex: 1;
    
    h4 {
      margin: 0 0 4px;
      font-size: 14px;
      font-weight: 500;
    }
    
    .item-price {
      font-size: 16px;
      font-weight: 600;
      color: $danger;
      margin-bottom: 8px;
    }
    
    .item-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}

.cart-footer {
  padding-top: 16px;
  border-top: 1px solid $border;
  
  .cart-total {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    
    .total-price {
      font-size: 20px;
      font-weight: 700;
      color: $danger;
    }
  }
  
  .el-button { width: 100%; }
}

// 详情弹窗
.detail-content {
  display: flex;
  gap: 32px;
}

.detail-left {
  flex: 1;
  
  img {
    width: 100%;
    border-radius: 12px;
  }
}

.detail-right {
  flex: 1;
  
  .detail-badges {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  h2 {
    margin: 0 0 12px;
    font-size: 24px;
    color: $text;
  }
  
  .detail-desc {
    color: $text-muted;
    margin-bottom: 16px;
    line-height: 1.6;
  }
  
  .detail-rating {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    
    span { font-size: 13px; color: $text-muted; }
  }
  
  .detail-price, .detail-stock, .detail-quantity {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    
    .price-label, .stock-label, .qty-label {
      width: 60px;
      color: $text-muted;
      font-size: 14px;
    }
    
    .price-value {
      font-size: 28px;
      font-weight: 700;
      color: $danger;
    }
    
    .price-original {
      font-size: 16px;
      color: $text-muted;
      text-decoration: line-through;
    }
  }
  
  .detail-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    
    .el-button { flex: 1; }
  }
}

// 购买弹窗
.purchase-content {
  .purchase-product {
    display: flex;
    gap: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid $border;
    margin-bottom: 20px;
    
    img {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      object-fit: cover;
    }
    
    .product-info {
      h4 { margin: 0 0 8px; font-size: 16px; }
      p { margin: 0; color: $text-muted; font-size: 14px; }
    }
  }
  
  h5 {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 600;
    color: $text;
  }
}

.card-type-section, .quantity-section, .coupon-section, .payment-section {
  margin-bottom: 20px;
}

.card-type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.card-type-item {
  padding: 12px;
  border: 1px solid $border;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover { border-color: $primary; }
  
  &.active {
    border-color: $primary;
    background: rgba($primary, 0.05);
  }
  
  .type-name { display: block; font-weight: 500; margin-bottom: 4px; }
  .type-price { display: block; color: $danger; font-weight: 600; }
  .type-stock { display: block; font-size: 12px; color: $text-muted; }
}

.quantity-section {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .max-hint { font-size: 12px; color: $text-muted; }
}

.selected-coupon {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba($success, 0.1);
  border-radius: 8px;
  
  .coupon-discount { color: $success; font-weight: 600; margin-left: auto; }
}

.available-coupons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  
  .coupon-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: linear-gradient(135deg, rgba($primary, 0.08), rgba($primary, 0.02));
    border: 1px dashed rgba($primary, 0.3);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      border-color: $primary;
      background: linear-gradient(135deg, rgba($primary, 0.12), rgba($primary, 0.05));
      transform: translateY(-1px);
    }
    
    .coupon-value {
      font-size: 16px;
      font-weight: 700;
      color: $danger;
      min-width: 50px;
    }
    
    .coupon-info {
      .coupon-name {
        font-size: 13px;
        font-weight: 500;
        color: $text;
        margin-bottom: 2px;
      }
      .coupon-condition {
        font-size: 11px;
        color: $text-muted;
      }
    }
  }
}

.no-coupons {
  padding: 12px;
  text-align: center;
  color: $text-muted;
  font-size: 13px;
  background: $bg;
  border-radius: 8px;
  margin-bottom: 12px;
}

.coupon-input {
  margin-top: 8px;
}

.price-summary {
  background: $bg;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 14px;
    
    &.discount span:last-child { color: $success; }
    
    &.total {
      border-top: 1px solid $border;
      padding-top: 12px;
      margin-top: 8px;
      font-weight: 600;
      
      .total-price { font-size: 20px; color: $danger; }
    }
  }
}

// 批量购买
.batch-content {
  .batch-items {
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 20px;
  }
  
  .batch-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid $border;
    
    img { width: 48px; height: 48px; border-radius: 6px; object-fit: cover; }
    
    .item-info {
      flex: 1;
      h4 { margin: 0; font-size: 14px; }
      span { font-size: 13px; color: $text-muted; }
    }
    
    .item-price { font-weight: 600; color: $danger; }
  }
  
  .batch-summary {
    background: $bg;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      
      &.discount span:last-child { color: $success; }
      &.total { font-weight: 600; .total-price { color: $danger; font-size: 18px; } }
    }
  }
  
  .payment-method h5 { margin: 0 0 12px; font-size: 14px; }
}

// 评价
.review-form {
  .review-rating {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    
    span { font-size: 14px; color: $text-muted; }
  }
}

// 响应式
@media (max-width: 768px) {
  .nav-container { padding: 12px 16px; }
  .nav-search { display: none; }
  .main-content { padding: 16px; }
  .products-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .detail-content { flex-direction: column; }
  .card-type-grid { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .product-card, 
  .category-chip,
  .gradient-orb,
  .animate-fade-in,
  .animate-in { 
    animation: none !important;
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
