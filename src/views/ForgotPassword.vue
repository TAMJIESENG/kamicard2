<template>
  <div class="forgot-password-page">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-shape shape-1"></div>
      <div class="decoration-shape shape-2"></div>
      <div class="decoration-shape shape-3"></div>
    </div>
    
    <div class="forgot-password-container">
      <!-- 品牌logo区域 -->
      <div class="brand-section">
        <div class="brand-logo">
          <div class="logo-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M24 4L44 14V34L24 44L4 34V14L24 4Z" stroke="currentColor" stroke-width="2" fill="none"/>
              <path d="M24 12L36 18V30L24 36L12 30V18L24 12Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
              <circle cx="24" cy="24" r="4" fill="currentColor"/>
            </svg>
          </div>
          <h1 class="brand-title">SecureCard</h1>
          <p class="brand-subtitle">密码找回服务</p>
        </div>
      </div>
      
      <!-- 重置密码表单区域 -->
      <div class="form-section">
        <!-- 步骤指示器 -->
        <div class="steps-indicator">
          <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
            <div class="step-number">1</div>
            <div class="step-label">验证身份</div>
          </div>
          <div class="step-line" :class="{ active: currentStep > 1 }"></div>
          <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
            <div class="step-number">2</div>
            <div class="step-label">重置密码</div>
          </div>
          <div class="step-line" :class="{ active: currentStep > 2 }"></div>
          <div class="step" :class="{ active: currentStep >= 3 }">
            <div class="step-number">3</div>
            <div class="step-label">完成</div>
          </div>
        </div>

        <!-- 第一步：验证身份 -->
        <div v-if="currentStep === 1" class="step-content">
          <div class="form-header">
            <h2>找回密码</h2>
            <p>请输入您的账号信息，我们将发送验证码到您的邮箱</p>
          </div>
          
          <el-form 
            :model="verifyForm" 
            :rules="verifyRules" 
            ref="verifyFormRef" 
            class="reset-form"
          >
            <el-form-item prop="username" class="form-field">
              <div class="field-label">
                <label>用户名</label>
              </div>
              <div class="input-wrapper">
                <div class="input-prefix">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <el-input 
                  v-model="verifyForm.username" 
                  placeholder="请输入您的用户名"
                  class="custom-input"
                />
              </div>
            </el-form-item>
            
            <el-form-item prop="email" class="form-field">
              <div class="field-label">
                <label>注册邮箱</label>
              </div>
              <div class="input-wrapper">
                <div class="input-prefix">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                <el-input 
                  v-model="verifyForm.email" 
                  placeholder="请输入注册时的邮箱"
                  class="custom-input"
                />
              </div>
            </el-form-item>
            
            <el-button 
              type="primary" 
              :loading="sending" 
              @click="sendVerificationCode"
              class="submit-button"
            >
              <span v-if="!sending">获取验证码</span>
              <span v-else>发送中...</span>
            </el-button>
          </el-form>
        </div>

        <!-- 第二步：输入验证码和新密码 -->
        <div v-if="currentStep === 2" class="step-content">
          <div class="form-header">
            <h2>重置密码</h2>
            <p>验证码已发送到 {{ maskedEmail }}，请查收</p>
          </div>
          
          <el-form 
            :model="resetForm" 
            :rules="resetRules" 
            ref="resetFormRef" 
            class="reset-form"
          >
            <el-form-item prop="verificationCode" class="form-field">
              <div class="field-label">
                <label>验证码</label>
                <span class="countdown" v-if="countdown > 0">
                  {{ countdown }}秒后可重新发送
                </span>
                <a v-else href="#" @click.prevent="resendCode" class="resend-link">
                  重新发送
                </a>
              </div>
              <div class="input-wrapper">
                <div class="input-prefix">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <el-input 
                  v-model="resetForm.verificationCode" 
                  placeholder="请输入6位验证码"
                  maxlength="6"
                  class="custom-input"
                />
              </div>
            </el-form-item>
            
            <el-form-item prop="newPassword" class="form-field">
              <div class="field-label">
                <label>新密码</label>
              </div>
              <div class="input-wrapper">
                <div class="input-prefix">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                </div>
                <el-input 
                  v-model="resetForm.newPassword" 
                  type="password"
                  placeholder="请输入新密码"
                  show-password
                  class="custom-input"
                />
              </div>
              <div class="password-strength">
                <div class="strength-indicator">
                  <div class="strength-bar" :class="passwordStrength.class"></div>
                  <div class="strength-bar" :class="passwordStrength.class === 'strong' ? 'strong' : ''"></div>
                  <div class="strength-bar" :class="passwordStrength.class === 'strong' ? 'strong' : ''"></div>
                </div>
                <span class="strength-text">{{ passwordStrength.text }}</span>
              </div>
            </el-form-item>
            
            <el-form-item prop="confirmPassword" class="form-field">
              <div class="field-label">
                <label>确认新密码</label>
              </div>
              <div class="input-wrapper">
                <div class="input-prefix">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                </div>
                <el-input 
                  v-model="resetForm.confirmPassword" 
                  type="password"
                  placeholder="请再次输入新密码"
                  show-password
                  class="custom-input"
                />
              </div>
            </el-form-item>
            
            <div class="button-group">
              <el-button 
                @click="currentStep = 1"
                class="back-button"
              >
                返回上一步
              </el-button>
              <el-button 
                type="primary" 
                :loading="resetting" 
                @click="resetPassword"
                class="submit-button"
              >
                <span v-if="!resetting">重置密码</span>
                <span v-else>重置中...</span>
              </el-button>
            </div>
          </el-form>
        </div>

        <!-- 第三步：完成 -->
        <div v-if="currentStep === 3" class="step-content success-content">
          <div class="success-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#10b981" stroke-width="2"/>
              <path d="M8 12l2 2 4-4" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 class="success-title">密码重置成功！</h2>
          <p class="success-desc">您的密码已成功重置，请使用新密码登录</p>
          
          <div class="success-actions">
            <el-button 
              type="primary" 
              size="large"
              @click="goToLogin"
              class="goto-login-button"
            >
              立即登录
            </el-button>
          </div>
        </div>
        
        <div class="form-footer">
          <p>想起密码了？ <router-link to="/login" class="login-link">返回登录</router-link></p>
          <div class="footer-links">
            <router-link to="/" class="footer-link">返回首页</router-link>
            <span class="divider">•</span>
            <router-link to="/register" class="footer-link">注册账户</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const currentStep = ref(1)
const verifyFormRef = ref()
const resetFormRef = ref()
const sending = ref(false)
const resetting = ref(false)
const countdown = ref(0)
let countdownTimer = null

// 存储验证信息
const verificationData = ref({
  username: '',
  email: '',
  code: '',
  expireTime: 0
})

const verifyForm = reactive({
  username: '',
  email: ''
})

const resetForm = reactive({
  verificationCode: '',
  newPassword: '',
  confirmPassword: ''
})

const verifyRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== resetForm.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const resetRules = {
  verificationCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 密码强度计算
const passwordStrength = computed(() => {
  const password = resetForm.newPassword
  if (!password) return { class: '', text: '请设置密码' }
  
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  
  if (score < 3) return { class: 'weak', text: '密码强度：弱' }
  if (score < 5) return { class: 'medium', text: '密码强度：中' }
  return { class: 'strong', text: '密码强度：强' }
})

// 邮箱掩码显示
const maskedEmail = computed(() => {
  const email = verifyForm.email
  if (!email) return ''
  
  const [username, domain] = email.split('@')
  if (!domain) return email
  
  const visibleChars = Math.min(3, Math.floor(username.length / 2))
  const masked = username.substring(0, visibleChars) + '***'
  return masked + '@' + domain
})

// 生成6位验证码
const generateVerificationCode = () => {
  return Math.random().toString().slice(2, 8).padStart(6, '0')
}

// 发送验证码
const sendVerificationCode = async () => {
  if (!verifyFormRef.value) return
  
  await verifyFormRef.value.validate(async (valid) => {
    if (valid) {
      sending.value = true
      
      try {
        // 模拟后台验证用户信息
        const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]')
        const user = allUsers.find(u => 
          u.username === verifyForm.username && u.email === verifyForm.email
        )
        
        if (!user) {
          ElMessage.error('用户名或邮箱不匹配，请检查后重试')
          return
        }
        
        // 生成验证码
        const code = generateVerificationCode()
        const expireTime = Date.now() + 10 * 60 * 1000 // 10分钟有效期
        
        // 存储到"后台"（localStorage模拟）
        const resetData = {
          username: verifyForm.username,
          email: verifyForm.email,
          code: code,
          expireTime: expireTime,
          used: false
        }
        
        // 保存到后台数据库（这里用localStorage模拟）
        localStorage.setItem('password_reset_data', JSON.stringify(resetData))
        
        // 保存到当前会话
        verificationData.value = resetData
        
        // 模拟发送邮件（实际项目中这里应该调用后端API发送邮件）
        console.log('=== 模拟发送邮件 ===')
        console.log('收件人:', verifyForm.email)
        console.log('验证码:', code)
        console.log('有效期: 10分钟')
        console.log('=====================')
        
        ElMessage.success({
          message: `验证码已发送到 ${maskedEmail.value}！（开发环境：${code}）`,
          duration: 5000
        })
        
        // 进入下一步
        currentStep.value = 2
        
        // 启动倒计时
        startCountdown()
        
      } catch (error) {
        console.error('发送验证码失败:', error)
        ElMessage.error('发送验证码失败，请稍后重试')
      } finally {
        sending.value = false
      }
    }
  })
}

// 启动倒计时
const startCountdown = () => {
  countdown.value = 60
  
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

// 重新发送验证码
const resendCode = async () => {
  sending.value = true
  
  try {
    // 生成新验证码
    const code = generateVerificationCode()
    const expireTime = Date.now() + 10 * 60 * 1000
    
    const resetData = {
      username: verifyForm.username,
      email: verifyForm.email,
      code: code,
      expireTime: expireTime,
      used: false
    }
    
    localStorage.setItem('password_reset_data', JSON.stringify(resetData))
    verificationData.value = resetData
    
    console.log('=== 重新发送验证码 ===')
    console.log('收件人:', verifyForm.email)
    console.log('验证码:', code)
    console.log('=====================')
    
    ElMessage.success({
      message: `验证码已重新发送！（开发环境：${code}）`,
      duration: 5000
    })
    
    startCountdown()
    
  } catch (error) {
    ElMessage.error('发送失败，请稍后重试')
  } finally {
    sending.value = false
  }
}

// 重置密码
const resetPassword = async () => {
  if (!resetFormRef.value) return
  
  await resetFormRef.value.validate(async (valid) => {
    if (valid) {
      resetting.value = true
      
      try {
        // 从"后台"获取验证数据
        const storedData = JSON.parse(localStorage.getItem('password_reset_data') || '{}')
        
        // 验证验证码
        if (storedData.code !== resetForm.verificationCode) {
          ElMessage.error('验证码错误，请检查后重试')
          return
        }
        
        // 验证是否过期
        if (Date.now() > storedData.expireTime) {
          ElMessage.error('验证码已过期，请重新获取')
          return
        }
        
        // 验证是否已使用
        if (storedData.used) {
          ElMessage.error('验证码已使用，请重新获取')
          return
        }
        
        // 验证用户信息是否匹配
        if (storedData.username !== verifyForm.username || storedData.email !== verifyForm.email) {
          ElMessage.error('验证信息不匹配')
          return
        }
        
        // 更新用户密码
        const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]')
        const userIndex = allUsers.findIndex(u => u.username === verifyForm.username)
        
        if (userIndex === -1) {
          ElMessage.error('用户不存在')
          return
        }
        
        // 更新密码
        allUsers[userIndex].password = resetForm.newPassword
        localStorage.setItem('all_users', JSON.stringify(allUsers))
        
        // 标记验证码为已使用
        storedData.used = true
        localStorage.setItem('password_reset_data', JSON.stringify(storedData))
        
        // 记录密码修改日志
        const logs = JSON.parse(localStorage.getItem('system_logs') || '[]')
        logs.unshift({
          id: Date.now(),
          type: 'password_reset',
          level: 'info',
          message: `用户 ${verifyForm.username} 通过邮箱验证重置了密码`,
          username: verifyForm.username,
          timestamp: new Date().toISOString(),
          details: {
            email: verifyForm.email,
            method: 'email_verification'
          }
        })
        localStorage.setItem('system_logs', JSON.stringify(logs.slice(0, 1000)))
        
        ElMessage.success('密码重置成功！')
        
        // 进入成功页面
        currentStep.value = 3
        
      } catch (error) {
        console.error('重置密码失败:', error)
        ElMessage.error('重置密码失败，请稍后重试')
      } finally {
        resetting.value = false
      }
    }
  })
}

// 前往登录
const goToLogin = () => {
  router.push('/login')
}

// 组件卸载时清理定时器
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style lang="scss" scoped>
.forgot-password-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.decoration-shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
  
  &.shape-1 {
    width: 520px;
    height: 520px;
    top: -260px;
    right: -260px;
    animation: float 8s ease-in-out infinite;
  }
  
  &.shape-2 {
    width: 320px;
    height: 320px;
    bottom: -160px;
    left: -160px;
    animation: float 10s ease-in-out infinite reverse;
  }
  
  &.shape-3 {
    width: 200px;
    height: 200px;
    top: 20%;
    left: 10%;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(101, 163, 13, 0.1) 100%);
    animation: float 12s ease-in-out infinite;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
  }
  25% {
    transform: translateY(-20px) translateX(10px);
  }
  50% {
    transform: translateY(0px) translateX(20px);
  }
  75% {
    transform: translateY(20px) translateX(10px);
  }
}

.forgot-password-container {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    max-width: 520px;
    padding: 40px 20px;
  }
}

.brand-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 60px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 1024px) {
    display: none;
  }
}

.brand-logo {
  text-align: center;
  animation: slideInLeft 0.8s ease-out;
}

.logo-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
}

.brand-title {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 16px;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

.form-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 80px 60px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  
  @media (max-width: 1024px) {
    padding: 40px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  
  @media (max-width: 640px) {
    padding: 32px 24px;
  }
}

.steps-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 48px;
  animation: slideInDown 0.8s ease-out;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  
  .step-number {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #e5e7eb;
    color: #9ca3af;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 16px;
    transition: all 0.3s ease;
  }
  
  .step-label {
    font-size: 13px;
    color: #9ca3af;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  
  &.active {
    .step-number {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    
    .step-label {
      color: #3b82f6;
    }
  }
  
  &.completed {
    .step-number {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }
    
    .step-label {
      color: #10b981;
    }
  }
}

.step-line {
  width: 80px;
  height: 2px;
  background: #e5e7eb;
  margin: 0 16px;
  transition: all 0.3s ease;
  
  &.active {
    background: linear-gradient(90deg, #3b82f6 0%, #10b981 100%);
  }
}

.step-content {
  animation: fadeInUp 0.8s ease-out;
}

.form-header {
  margin-bottom: 32px;
  text-align: center;
  
  h2 {
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 12px 0;
    line-height: 1.2;
  }
  
  p {
    color: #64748b;
    font-size: 15px;
    margin: 0;
    line-height: 1.6;
  }
}

.reset-form {
  max-width: 420px;
  margin: 0 auto;
  width: 100%;
}

.form-field {
  margin-bottom: 24px;
  
  :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
  
  :deep(.el-form-item__error) {
    font-size: 13px;
    color: #ef4444;
    margin-top: 6px;
    padding-left: 4px;
  }
}

.field-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  label {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
  }
  
  .countdown {
    font-size: 13px;
    color: #6b7280;
  }
  
  .resend-link {
    font-size: 13px;
    color: #3b82f6;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s ease;
    
    &:hover {
      color: #2563eb;
      text-decoration: underline;
    }
  }
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  
  .input-prefix {
    position: absolute;
    left: 16px;
    color: #6b7280;
    z-index: 10;
    display: flex;
    align-items: center;
  }
  
  .custom-input {
    width: 100%;
    
    :deep(.el-input__wrapper) {
      background: #ffffff;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 0 16px 0 48px;
      height: 48px;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;
      
      &:hover {
        border-color: #d1d5db;
      }
      
      &.is-focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }
    
    :deep(.el-input__inner) {
      font-size: 15px;
      color: #111827;
      
      &::placeholder {
        color: #9ca3af;
      }
    }
  }
}

.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.strength-indicator {
  flex: 1;
  display: flex;
  gap: 4px;
  height: 4px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: #e5e7eb;
  transition: background-color 0.3s ease;
  
  &.weak {
    background: #ef4444;
  }
  
  &.medium {
    background: #f59e0b;
  }
  
  &.strong {
    background: #10b981;
  }
}

.strength-text {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  white-space: nowrap;
}

.submit-button {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px 0 rgba(59, 130, 246, 0.5);
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.button-group {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 12px;
  
  .back-button {
    height: 48px;
    background: #ffffff;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    color: #374151;
    
    &:hover {
      border-color: #d1d5db;
      background: #f9fafb;
    }
  }
}

.success-content {
  text-align: center;
  padding: 40px 20px;
}

.success-icon {
  margin: 0 auto 32px;
  animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.success-title {
  font-size: 28px;
  font-weight: 700;
  color: #10b981;
  margin: 0 0 16px 0;
}

.success-desc {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 40px 0;
  line-height: 1.6;
}

.success-actions {
  display: flex;
  justify-content: center;
}

.goto-login-button {
  height: 48px;
  padding: 0 48px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  
  &:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px 0 rgba(16, 185, 129, 0.4);
  }
}

.form-footer {
  margin-top: 32px;
  text-align: center;
  
  p {
    font-size: 15px;
    color: #6b7280;
    margin: 0 0 16px 0;
    
    .login-link {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s ease;
      
      &:hover {
        color: #2563eb;
        text-decoration: underline;
      }
    }
  }
  
  .footer-links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
    
    .footer-link {
      font-size: 13px;
      color: #9ca3af;
      text-decoration: none;
      transition: color 0.2s ease;
      
      &:hover {
        color: #6b7280;
        text-decoration: underline;
      }
    }
    
    .divider {
      color: #d1d5db;
      font-size: 12px;
    }
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 640px) {
  .form-header {
    h2 {
      font-size: 24px;
    }
    
    p {
      font-size: 14px;
    }
  }
  
  .steps-indicator {
    .step-number {
      width: 36px;
      height: 36px;
      font-size: 14px;
    }
    
    .step-label {
      font-size: 12px;
    }
    
    .step-line {
      width: 40px;
    }
  }
  
  .button-group {
    grid-template-columns: 1fr;
  }
}
</style>

