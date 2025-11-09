import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useMaintenanceStore } from '@/stores/maintenance'
import { firewallCheck } from '@/utils/firewall'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    beforeEnter: (to, from, next) => {
      // 检查系统设置：是否允许用户注册
      try {
        const systemSettings = JSON.parse(localStorage.getItem('system_settings') || '{}')
        if (systemSettings.allowRegister === false) {
          // 不允许注册，重定向到登录页面并显示提示
          next({ 
            path: '/login', 
            query: { registrationDisabled: 'true' } 
          })
        } else {
          next()
        }
      } catch (error) {
        // 如果读取设置失败，允许访问（默认允许注册）
        next()
      }
    }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPassword.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/vip',
    name: 'VipPurchase',
    component: () => import('@/views/VipPurchase.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/cards',
    name: 'CardPurchase',
    component: () => import('@/views/CardPurchase.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/Admin.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: () => import('@/views/Maintenance.vue')
  },
  {
    path: '/security-key-generator',
    name: 'SecurityKeyGenerator',
    component: () => import('@/views/SecurityKeyGenerator.vue')
  },
  {
    path: '/security-verification',
    name: 'SecurityVerification',
    component: () => import('@/views/SecurityVerification.vue')
  },
  {
    path: '/announcements',
    name: 'Announcements',
    component: () => import('@/views/Announcements.vue')
  },
  {
    path: '/ai-assistant',
    name: 'AiAssistant',
    component: () => import('@/views/AiAssistant.vue'),
    meta: { requiresAuth: true, requiresVip: true }
  },
  {
    path: '/coupon-claim',
    name: 'CouponClaim',
    component: () => import('@/views/CouponClaim.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('@/views/Contact.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory('/ceshi/'),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const maintenanceStore = useMaintenanceStore()
  
  // 防火墙检查
  const firewallResult = firewallCheck(to.fullPath, 'GET', null)
  if (!firewallResult.allowed) {
    ElMessage.error(firewallResult.reason || '访问被防火墙拦截')
    next(false) // 阻止导航
    return
  }
  
  // 检查维护模式 - 强制重新检查localStorage
  const isMaintenanceActive = maintenanceStore.checkMaintenanceMode()
  
  console.log('🔧 路由守卫检查:', {
    isMaintenanceActive,
    isAdmin: userStore.isAdmin,
    toName: to.name,
    fromName: from.name
  })
  
  // 如果系统在维护中，只有管理员可以访问管理页面，其他用户都被重定向到维护页面
  if (isMaintenanceActive) {
    // 管理员可以访问管理页面和维护页面
    if (userStore.isAdmin && (to.name === 'Admin' || to.name === 'Maintenance')) {
      next()
      return
    }
    
    // 非管理员用户只能访问维护页面、登录页面、注册页面或安全相关页面
    if (!userStore.isAdmin && 
        to.name !== 'Maintenance' && 
        to.name !== 'Login' &&
        to.name !== 'Register' &&
        to.name !== 'ForgotPassword' &&
        to.name !== 'SecurityKeyGenerator' &&
        to.name !== 'SecurityVerification') {
      console.log('🚫 维护模式：重定向到维护页面')
      next('/maintenance')
      return
    }
    
    // 如果已经在维护页面，直接通过
    if (to.name === 'Maintenance') {
      next()
      return
    }
  }
  
  // 如果系统不在维护中但访问维护页面，重定向到首页
  if (!isMaintenanceActive && to.name === 'Maintenance') {
    console.log('✅ 维护结束：重定向到首页')
    next('/')
    return
  }
  
  // 检查用户登录状态
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
    return
  }
  
  // 如果已登录，检查用户状态
  if (userStore.isLoggedIn && userStore.user) {
    // 从 all_users 中获取最新用户状态
    try {
      const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]')
      const currentUser = allUsers.find(u => String(u.id) === String(userStore.user.id))
      
      if (currentUser && currentUser.status === 'disabled') {
        // 用户已被禁用，强制登出并重定向到登录页
        console.log('⚠️ 用户账户已被禁用，强制登出')
        userStore.logout()
        // 使用 query 参数传递消息
        next({ path: '/login', query: { disabled: 'true' } })
        return
      }
    } catch (error) {
      console.error('检查用户状态失败:', error)
    }
  }
  
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router