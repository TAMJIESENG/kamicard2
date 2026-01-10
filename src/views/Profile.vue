<template>
  <div class="profile-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
    </div>
    
    <!-- 浮动导航栏 -->
    <header class="page-header">
      <div class="header-content">
        <div class="header-left">
          <button class="back-btn" @click="$router.go(-1)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="page-title">
            <h1>个人资料</h1>
            <p>管理您的账户信息和安全设置</p>
          </div>
        </div>
        <div class="header-actions">
          <el-button 
            v-if="editing" 
            @click="cancelEdit"
            class="cancel-btn"
          >
            取消
          </el-button>
          <el-button 
            type="primary" 
            @click="editing ? saveProfile() : startEdit()"
            class="save-btn"
          >
            <svg v-if="!editing" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            {{ editing ? '保存更改' : '编辑资料' }}
          </el-button>
        </div>
      </div>
    </header>
      
    <main class="page-main">
        <el-row :gutter="24">
          <el-col :span="8">
            <!-- 头像卡片 -->
            <div class="profile-card avatar-card">
              <div class="card-header-custom">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>头像信息</span>
              </div>
              
              <div class="avatar-section">
                <div class="avatar-container">
                  <el-avatar 
                    :size="120" 
                    :src="userInfo.avatar || ''"
                    class="avatar-display"
                    @click="userInfo.avatar && previewAvatar()"
                    @error="handleAvatarError"
                    :style="{ cursor: userInfo.avatar ? 'pointer' : 'default' }"
                  >
                    <el-icon v-if="!userInfo.avatar || avatarError"><User /></el-icon>
                  </el-avatar>
                  
                  <!-- 头像预览遮罩 -->
                  <div class="avatar-overlay" v-if="userInfo.avatar">
                    <el-button
                      type="danger"
                      circle
                      size="small"
                      class="remove-avatar-btn"
                      @click="removeAvatar"
                      title="删除头像"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                  
                  <p v-if="userInfo.avatar" class="avatar-hint">点击头像预览</p>
                </div>
                
                <div class="avatar-actions">
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    @change="handleAvatarUpload"
                    style="display: none"
                  />
                  
                  <el-button 
                    type="primary" 
                    :loading="uploading"
                    :disabled="uploading"
                    class="change-avatar-btn"
                    @click="fileInput?.click()"
                  >
                    <el-icon v-if="!uploading"><Upload /></el-icon>
                    {{ uploading ? '上传中...' : (userInfo.avatar ? '更换头像' : '设置头像') }}
                  </el-button>
                  
                  <div class="avatar-tips">
                    <p>• 支持 JPG、PNG、GIF 格式</p>
                    <p>• 图片大小不超过 2MB</p>
                    <p>• 建议上传正方形图片</p>
                    <p>• 自动缩放到合适尺寸</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 账户统计卡片 -->
            <div class="profile-card stats-card">
              <div class="card-header-custom">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 3v18h18"/>
                  <path d="M18 17V9M13 17V5M8 17v-3"/>
                </svg>
                <span>账户统计</span>
              </div>
              
              <div class="stats-list">
                <div class="stats-item">
                  <div class="stats-icon register">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <div class="stats-content">
                    <span class="label">注册时间</span>
                    <span class="value">{{ userInfo.registerTime }}</span>
                  </div>
                </div>
                <div class="stats-item">
                  <div class="stats-icon login">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                  </div>
                  <div class="stats-content">
                    <span class="label">最后登录</span>
                    <span class="value">{{ userInfo.lastLogin }}</span>
                  </div>
                </div>
                <div class="stats-item">
                  <div class="stats-icon spent">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                    </svg>
                  </div>
                  <div class="stats-content">
                    <span class="label">累计消费</span>
                    <span class="value highlight">¥{{ userInfo.totalSpent }}</span>
                  </div>
                </div>
                <div class="stats-item">
                  <div class="stats-icon level">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                  </div>
                  <div class="stats-content">
                    <span class="label">会员等级</span>
                    <el-tag :type="getLevelType(userInfo.level)" size="small" effect="dark">
                      {{ userInfo.level }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="16">
            <!-- 基本信息卡片 -->
            <div class="profile-card info-card">
              <div class="card-header-custom">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                <span>基本信息</span>
                <span v-if="editing" class="editing-badge">编辑中</span>
              </div>
              
              <el-form :model="userInfo" label-width="100px" :disabled="!editing" class="profile-form">
                <div class="form-grid">
                  <el-form-item label="用户名">
                    <el-input v-model="userInfo.username" disabled prefix-icon="User" />
                  </el-form-item>
                  
                  <el-form-item label="邮箱">
                    <el-input v-model="userInfo.email" placeholder="请输入邮箱" />
                  </el-form-item>
                  
                  <el-form-item label="手机号">
                    <el-input v-model="userInfo.phone" placeholder="请输入手机号" />
                  </el-form-item>
                  
                  <el-form-item label="真实姓名">
                    <el-input v-model="userInfo.realName" placeholder="请输入真实姓名" />
                  </el-form-item>
                  
                  <el-form-item label="生日">
                    <el-date-picker
                      v-model="userInfo.birthday"
                      type="date"
                      placeholder="选择日期"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      style="width: 100%"
                    />
                  </el-form-item>
                  
                  <el-form-item label="性别">
                    <el-radio-group v-model="userInfo.gender">
                      <el-radio label="male">男</el-radio>
                      <el-radio label="female">女</el-radio>
                      <el-radio label="other">其他</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </div>
                
                <el-form-item label="个人简介" class="bio-item">
                  <el-input
                    v-model="userInfo.bio"
                    type="textarea"
                    :rows="4"
                    placeholder="介绍一下自己..."
                    :maxlength="200"
                    show-word-limit
                  />
                </el-form-item>
              </el-form>
            </div>
            
            <!-- 安全设置卡片 -->
            <div class="profile-card security-card">
              <div class="card-header-custom">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>安全设置</span>
              </div>
              
              <div class="security-settings">
                <div class="security-item">
                  <div class="security-icon password">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  </div>
                  <div class="security-info">
                    <h4>登录密码</h4>
                    <p>定期更新密码，保护账户安全</p>
                  </div>
                  <el-button @click="showPasswordDialog = true" class="security-btn">修改密码</el-button>
                </div>
                
                <div class="security-item">
                  <div class="security-icon two-factor">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  </div>
                  <div class="security-info">
                    <h4>两步验证</h4>
                    <p>开启两步验证，提升账户安全性</p>
                  </div>
                  <el-switch
                    v-model="userInfo.twoFactorEnabled"
                    @change="handleTwoFactorChange"
                    active-color="#10B981"
                  />
                </div>
                
                <div class="security-item">
                  <div class="security-icon email" :class="{ verified: userInfo.emailVerified }">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div class="security-info">
                    <h4>邮箱验证</h4>
                    <p>验证邮箱，确保账户安全</p>
                  </div>
                  <el-tag v-if="userInfo.emailVerified" type="success" effect="dark" size="small">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    已验证
                  </el-tag>
                  <el-button v-else type="warning" size="small" class="verify-btn">去验证</el-button>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </main>
    
    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="900px">
      <PasswordChange />
      
      <template #footer>
        <el-button @click="showPasswordDialog = false">关闭</el-button>
      </template>
    </el-dialog>
    
    
    <!-- 头像预览对话框 -->
    <el-dialog 
      v-model="showAvatarPreview" 
      title="头像预览" 
      width="400px"
      align-center
    >
      <div class="avatar-preview-container">
        <el-avatar :size="200" :src="userInfo.avatar">
          <el-icon><User /></el-icon>
        </el-avatar>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAvatarPreview = false">关闭</el-button>
          <el-button type="danger" @click="removeAvatar">
            <el-icon><Delete /></el-icon>
            删除头像
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Upload, Delete } from '@element-plus/icons-vue'
import PasswordChange from '@/components/PasswordChange.vue'
import { useUserStore } from '@/stores/user'

const editing = ref(false)
const showPasswordDialog = ref(false)
const showAvatarPreview = ref(false)
const uploading = ref(false)
const avatarError = ref(false)
const fileInput = ref(null)
const userStore = useUserStore()

const userInfo = reactive({
  username: '',
  email: '',
  phone: '',
  realName: '',
  birthday: '',
  gender: 'male',
  bio: '',
  avatar: '',
  registerTime: '',
  lastLogin: '',
  totalSpent: '0.00',
  level: '普通',
  twoFactorEnabled: false,
  emailVerified: false
})

const originalUserInfo = reactive({})

const getLevelType = (level) => {
  const typeMap = {
    'VIP': 'warning',
    'SVIP': 'success',
    '普通': 'info'
  }
  return typeMap[level] || 'info'
}

const startEdit = () => {
  editing.value = true
  Object.assign(originalUserInfo, userInfo)
}

const cancelEdit = () => {
  editing.value = false
  Object.assign(userInfo, originalUserInfo)
}

const saveProfile = async () => {
  try {
    // 从 localStorage 获取当前用户数据
    const savedUser = JSON.parse(localStorage.getItem('user_data') || '{}')
    
    if (!savedUser.id) {
      ElMessage.error('用户信息不完整，请重新登录')
      return
    }
    
    // 更新 all_users 中的用户数据
    const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]')
    const userIndex = allUsers.findIndex(u => String(u.id) === String(savedUser.id))
    
    if (userIndex !== -1) {
      // 更新所有用户列表中的数据
      allUsers[userIndex] = {
        ...allUsers[userIndex],
        email: userInfo.email,
        phone: userInfo.phone,
        realName: userInfo.realName,
        birthday: userInfo.birthday,
        gender: userInfo.gender,
        bio: userInfo.bio,
        avatar: userInfo.avatar,
        twoFactorEnabled: userInfo.twoFactorEnabled
      }
      localStorage.setItem('all_users', JSON.stringify(allUsers))
      
      // 更新当前用户数据
      const updatedUser = {
        ...savedUser,
        email: userInfo.email,
        phone: userInfo.phone,
        realName: userInfo.realName,
        birthday: userInfo.birthday,
        gender: userInfo.gender,
        bio: userInfo.bio,
        avatar: userInfo.avatar,
        twoFactorEnabled: userInfo.twoFactorEnabled
      }
      localStorage.setItem('user_data', JSON.stringify(updatedUser))
      
      ElMessage.success('保存成功')
      editing.value = false
      
      // 刷新用户store数据
      userStore.refreshCurrentUser()
      
      // 触发存储事件通知其他页面
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'user_data', 
        newValue: JSON.stringify(updatedUser),
        url: window.location.href
      }))
    } else {
      ElMessage.error('未找到用户数据，保存失败')
    }
  } catch (error) {
    console.error('保存用户资料失败:', error)
    ElMessage.error('保存失败：' + error.message)
  }
}

// 简单的头像上传功能
const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return
  }

  // 开始上传处理
  uploading.value = true
  
  try {
    // 将文件转换为base64
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        let avatarData = e.target.result
        
        // 如果图片太大，进行简单压缩
        if (avatarData.length > 500 * 1024) { // 500KB
          avatarData = await compressImage(avatarData, 0.8)
        }
        
        await saveAvatarToStorage(avatarData)
        ElMessage.success('头像上传成功!')
      } catch (error) {
        console.error('处理头像失败:', error)
        ElMessage.error('头像上传失败: ' + error.message)
      } finally {
        uploading.value = false
      }
    }
    
    reader.onerror = () => {
      ElMessage.error('读取文件失败')
      uploading.value = false
    }
    
    reader.readAsDataURL(file)
  } catch (error) {
    console.error('上传头像失败:', error)
    ElMessage.error('上传失败: ' + error.message)
    uploading.value = false
  }
  
  // 清空input的值，这样可以重复上传同一个文件
  event.target.value = ''
}

// 简单的图片压缩
const compressImage = (dataURL, quality = 0.8) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // 设置合适的尺寸
      const maxSize = 400
      let { width, height } = img
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = dataURL
  })
}

const saveAvatarToStorage = async (avatarData) => {
  try {
    // 验证头像数据
    if (!avatarData || !avatarData.startsWith('data:image/')) {
      throw new Error('头像数据格式无效')
    }
    
    // 检查数据大小
    const dataSizeKB = avatarData.length / 1024
    if (dataSizeKB > 2000) { // 2MB限制
      throw new Error('头像文件过大，请选择小于2MB的图片')
    }
    
    // 获取当前用户数据
    const savedUser = JSON.parse(localStorage.getItem('user_data') || '{}')
    if (!savedUser.id) {
      throw new Error('用户信息不完整，请重新登录')
    }
    
    // 更新 all_users 中的头像数据
    const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]')
    const userIndex = allUsers.findIndex(u => String(u.id) === String(savedUser.id))
    
    if (userIndex === -1) {
      throw new Error('在用户列表中未找到当前用户')
    }
    
    // 更新头像数据
    allUsers[userIndex].avatar = avatarData
    localStorage.setItem('all_users', JSON.stringify(allUsers))
    
    // 更新当前用户数据
    const updatedUser = { ...savedUser, avatar: avatarData }
    localStorage.setItem('user_data', JSON.stringify(updatedUser))
    
    // 立即更新显示
    userInfo.avatar = avatarData
    
    // 刷新用户store中的数据，确保其他页面同步
    userStore.refreshCurrentUser()
    
    // 触发存储事件通知其他页面
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'user_data',
      newValue: JSON.stringify(updatedUser),
      url: window.location.href
    }))
    
  } catch (error) {
    console.error('保存头像失败:', error)
    
    if (error.name === 'QuotaExceededError') {
      ElMessage.error('浏览器存储空间不足，请清理数据后重试')
    } else {
      ElMessage.error('保存头像失败: ' + error.message)
    }
    
    throw error
  }
}


// 处理头像加载错误
const handleAvatarError = (e) => {
  console.error('头像加载失败:', e)
  avatarError.value = true
  
  // 简单的重试机制
  setTimeout(() => {
    if (userInfo.avatar) {
      avatarError.value = false
      const currentAvatar = userInfo.avatar
      userInfo.avatar = ''
      nextTick(() => {
        userInfo.avatar = currentAvatar
      })
    }
  }, 1000)
}

// 预览头像
const previewAvatar = () => {
  showAvatarPreview.value = true
}


// 删除头像
const removeAvatar = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要删除当前头像吗？删除后将显示默认头像。',
      '删除头像',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 清空头像数据
    userInfo.avatar = ''
    
    // 从存储中删除头像
    const savedUser = JSON.parse(localStorage.getItem('user_data') || '{}')
    
    if (savedUser.id) {
      // 更新 all_users 中的头像数据
      const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]')
      const userIndex = allUsers.findIndex(u => String(u.id) === String(savedUser.id))
      
      if (userIndex !== -1) {
        delete allUsers[userIndex].avatar
        localStorage.setItem('all_users', JSON.stringify(allUsers))
        
        // 更新当前用户数据
        delete savedUser.avatar
        localStorage.setItem('user_data', JSON.stringify(savedUser))
        
        // 刷新用户store中的数据
        userStore.refreshCurrentUser()
        
        ElMessage.success('头像已删除')
        
        // 关闭预览对话框
        showAvatarPreview.value = false
      }
    }
  } catch {
    // 用户取消删除
  }
}

const handleTwoFactorChange = (value) => {
  if (value) {
    ElMessage.success('两步验证已开启')
  } else {
    ElMessage.info('两步验证已关闭')
  }
}

onMounted(() => {
  // 从 localStorage 加载用户数据
  const savedUser = localStorage.getItem('user_data')
  if (savedUser) {
    const userData = JSON.parse(savedUser)
    
    // 从 all_users 中获取最新的用户数据
    const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]')
    const currentUser = allUsers.find(u => String(u.id) === String(userData.id))
    
    if (currentUser) {
      // 使用 all_users 中的最新数据
      Object.assign(userInfo, {
        username: currentUser.username,
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        realName: currentUser.realName || '',
        birthday: currentUser.birthday || '',
        gender: currentUser.gender || 'male',
        bio: currentUser.bio || '',
        avatar: currentUser.avatar || '',
        registerTime: currentUser.registerTime,
        lastLogin: new Date().toLocaleString('zh-CN'),
        totalSpent: '0.00',
        level: currentUser.level || '普通',
        twoFactorEnabled: currentUser.twoFactorEnabled || false,
        emailVerified: currentUser.emailVerified || false
      })
    } else {
      // 备用：使用 user_data 中的数据
      Object.assign(userInfo, {
        username: userData.username,
        email: userData.email || '',
        phone: userData.phone || '',
        realName: userData.realName || '',
        birthday: userData.birthday || '',
        gender: userData.gender || 'male',
        bio: userData.bio || '',
        avatar: userData.avatar || '',
        registerTime: userData.registerTime,
        lastLogin: new Date().toLocaleString('zh-CN'),
        totalSpent: '0.00',
        level: userData.level || '普通',
        twoFactorEnabled: userData.twoFactorEnabled || false,
        emailVerified: userData.emailVerified || false
      })
    }
    
    // 验证头像数据有效性
    if (userInfo.avatar) {
      nextTick(() => {
        // 测试头像是否能正常加载
        const testImg = new Image()
        testImg.onload = () => {
          avatarError.value = false
        }
        testImg.onerror = () => {
          console.warn('头像数据损坏，将清除无效头像')
          avatarError.value = true
          // 如果头像无效，可以选择清除它
          // userInfo.avatar = ''
        }
        testImg.src = userInfo.avatar
      })
    }
  }
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

.profile-page {
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
  opacity: 0.3;
  
  &.orb-1 {
    width: 500px;
    height: 500px;
    background: linear-gradient(135deg, rgba($primary, 0.2), rgba($secondary, 0.15));
    top: -150px;
    right: -150px;
  }
  
  &.orb-2 {
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, rgba($success, 0.15), rgba($primary, 0.1));
    bottom: -100px;
    left: -100px;
  }
}

// 浮动导航栏
.page-header {
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
  padding: 16px 24px;
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

.page-title {
  h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: $text;
  }
  
  p {
    margin: 4px 0 0;
    font-size: 13px;
    color: $text-muted;
  }
}

.header-actions {
  display: flex;
  gap: 12px;
  
  .cancel-btn {
    border-radius: 10px;
  }
  
  .save-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    border-radius: 10px;
    padding: 10px 20px;
    font-weight: 500;
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

// 卡片通用样式
.profile-card {
  background: $card-bg;
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba($border, 0.6);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  padding: 24px;
  margin-bottom: 20px;
  transition: all 0.25s ease;
  
  &:hover {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  }
}

.card-header-custom {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba($border, 0.6);
  color: $text;
  font-weight: 600;
  font-size: 16px;
  
  svg {
    color: $primary;
  }
  
  .editing-badge {
    margin-left: auto;
    padding: 4px 10px;
    background: rgba($warning, 0.1);
    color: $warning;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
  }
}

// 头像区域
.avatar-section {
  text-align: center;
  
  .avatar-container {
    position: relative;
    display: inline-block;
    margin-bottom: 20px;
    
    .avatar-overlay {
      position: absolute;
      top: -4px;
      right: -4px;
      
      .remove-avatar-btn {
        background: rgba($danger, 0.9);
        border: 2px solid #fff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        
        &:hover {
          background: $danger;
          transform: scale(1.1);
        }
      }
    }
    
    .avatar-display {
      transition: all 0.25s ease;
      background: linear-gradient(135deg, #E2E8F0, #F1F5F9);
      border: 4px solid white;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      
      &:hover {
        transform: scale(1.05);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
      }
    }
    
    .avatar-hint {
      margin-top: 10px;
      font-size: 12px;
      color: $text-muted;
    }
  }
  
  .avatar-actions {
    .change-avatar-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin: 0 auto 16px;
      min-width: 140px;
      border-radius: 10px;
      transition: all 0.25s ease;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba($primary, 0.3);
      }
    }
    
    .avatar-tips {
      padding: 14px;
      background: linear-gradient(135deg, rgba($primary, 0.04), rgba($secondary, 0.04));
      border-radius: 12px;
      border-left: 3px solid $primary;
      
      p {
        margin: 6px 0;
        font-size: 12px;
        color: $text-muted;
        line-height: 1.5;
        text-align: left;
        
        &:first-child { margin-top: 0; }
        &:last-child { margin-bottom: 0; }
      }
    }
  }
}

// 统计列表
.stats-list {
  .stats-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 0;
    border-bottom: 1px solid rgba($border, 0.5);
    
    &:last-child { border-bottom: none; }
    
    .stats-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      
      &.register {
        background: rgba($primary, 0.1);
        color: $primary;
      }
      &.login {
        background: rgba($secondary, 0.1);
        color: $secondary;
      }
      &.spent {
        background: rgba($success, 0.1);
        color: $success;
      }
      &.level {
        background: rgba($warning, 0.1);
        color: $warning;
      }
    }
    
    .stats-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      
      .label {
        font-size: 13px;
        color: $text-muted;
      }
      
      .value {
        font-size: 14px;
        font-weight: 600;
        color: $text;
        
        &.highlight {
          color: $success;
        }
      }
    }
  }
}

// 表单样式
.profile-form {
  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0 24px;
  }
  
  .bio-item {
    grid-column: 1 / -1;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 20px;
    
    .el-form-item__label {
      color: $text-muted;
      font-weight: 500;
    }
    
    .el-input__wrapper {
      border-radius: 10px;
      box-shadow: 0 0 0 1px $border;
      transition: all 0.2s ease;
      
      &:hover {
        box-shadow: 0 0 0 1px rgba($primary, 0.3);
      }
      
      &.is-focus {
        box-shadow: 0 0 0 2px rgba($primary, 0.2);
      }
    }
    
    .el-textarea__inner {
      border-radius: 10px;
    }
  }
}

// 安全设置
.security-settings {
  .security-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    margin: 0 -24px;
    border-bottom: 1px solid rgba($border, 0.5);
    transition: background 0.2s ease;
    
    &:first-child {
      margin-top: -4px;
    }
    
    &:last-child {
      border-bottom: none;
      margin-bottom: -4px;
    }
    
    &:hover {
      background: rgba($bg, 0.5);
    }
    
    .security-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      
      &.password {
        background: rgba($primary, 0.1);
        color: $primary;
      }
      &.two-factor {
        background: rgba($success, 0.1);
        color: $success;
      }
      &.email {
        background: rgba($warning, 0.1);
        color: $warning;
        
        &.verified {
          background: rgba($success, 0.1);
          color: $success;
        }
      }
    }
    
    .security-info {
      flex: 1;
      
      h4 {
        margin: 0 0 4px;
        font-size: 15px;
        font-weight: 600;
        color: $text;
      }
      
      p {
        margin: 0;
        font-size: 13px;
        color: $text-muted;
      }
    }
    
    .security-btn {
      border-radius: 10px;
    }
    
    .verify-btn {
      border-radius: 8px;
    }
  }
}

// 头像预览对话框
.avatar-preview-container {
  text-align: center;
  padding: 24px;
  
  .el-avatar {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    border: 4px solid #fff;
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

// 响应式
@media (max-width: 1024px) {
  .page-header {
    margin: 12px 16px 0;
  }
  
  .page-main {
    padding: 20px 16px;
  }
  
  :deep(.el-col-8) {
    max-width: 100%;
    flex: 0 0 100%;
  }
  
  :deep(.el-col-16) {
    max-width: 100%;
    flex: 0 0 100%;
  }
  
  .profile-form .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    margin: 8px 12px 0;
    border-radius: 12px;
  }
  
  .header-content {
    padding: 12px 16px;
  }
  
  .page-title p {
    display: none;
  }
  
  .security-item {
    flex-wrap: wrap;
    
    .security-info {
      flex: 1 1 calc(100% - 64px);
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .gradient-orb,
  .profile-card,
  .avatar-display {
    animation: none !important;
    transition: none !important;
  }
}
</style>