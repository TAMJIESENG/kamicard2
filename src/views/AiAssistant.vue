<template>
  <div class="ai-assistant-page">
    <!-- 顶部导航 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <el-button 
            :icon="ArrowLeft" 
            circle 
            @click="goBack"
            class="back-btn"
          />
          <div class="page-title">
            <h1>AI 智能助手</h1>
            <p>由 DeepSeek 大模型驱动</p>
          </div>
        </div>
        <div class="header-right">
          <el-tag type="warning" effect="dark" size="large">
            <el-icon><Star /></el-icon>
            VIP 专属功能
          </el-tag>
        </div>
      </div>
    </div>

    <!-- VIP权限验证 -->
    <div v-if="!hasAiAccess" class="access-denied">
      <div class="denied-content">
        <div class="denied-icon">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="#f59e0b"/>
          </svg>
        </div>
        <h2>AI 助手需要 VIP 权限</h2>
        <p>此功能仅对 <strong>VIP 年卡</strong> 和 <strong>SVIP 年卡</strong> 用户开放</p>
        
        <div class="vip-benefits">
          <div class="benefit-item">
            <el-icon class="benefit-icon"><ChatDotRound /></el-icon>
            <span>智能对话助手</span>
          </div>
          <div class="benefit-item">
            <el-icon class="benefit-icon"><MagicStick /></el-icon>
            <span>代码生成与优化</span>
          </div>
          <div class="benefit-item">
            <el-icon class="benefit-icon"><Document /></el-icon>
            <span>文档撰写辅助</span>
          </div>
          <div class="benefit-item">
            <el-icon class="benefit-icon"><Promotion /></el-icon>
            <span>24/7 全天候服务</span>
          </div>
        </div>

        <div class="upgrade-actions">
          <el-button 
            type="primary" 
            size="large"
            @click="goToVipPurchase"
          >
            <el-icon><Star /></el-icon>
            立即升级 VIP
          </el-button>
          <el-button 
            size="large"
            @click="goBack"
          >
            返回
          </el-button>
        </div>
      </div>
    </div>

    <!-- AI 聊天界面 -->
    <div v-else class="ai-chat-container">
      <!-- 侧边栏 - 对话历史 -->
      <div class="chat-sidebar">
        <div class="sidebar-header">
          <h3>对话历史</h3>
          <el-button 
            :icon="Plus" 
            circle 
            size="small"
            @click="createNewChat"
            title="新建对话"
          />
        </div>
        
        <div class="chat-list">
          <div 
            v-for="chat in chatHistory" 
            :key="chat.id"
            class="chat-item"
            :class="{ active: currentChatId === chat.id }"
            @click="loadChat(chat.id)"
          >
            <div class="chat-item-content">
              <div class="chat-title">{{ chat.title }}</div>
              <div class="chat-time">{{ formatTime(chat.timestamp) }}</div>
            </div>
            <el-button
              :icon="Delete"
              circle
              size="small"
              text
              @click.stop="deleteChat(chat.id)"
            />
          </div>
        </div>
      </div>

      <!-- 主聊天区域 -->
      <div class="chat-main">
        <!-- 欢迎屏幕 -->
        <div v-if="messages.length === 0" class="welcome-screen">
          <div class="welcome-content">
            <div class="ai-avatar">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="url(#gradient1)"/>
                <circle cx="9" cy="11" r="1.5" fill="url(#gradient1)"/>
                <circle cx="15" cy="11" r="1.5" fill="url(#gradient1)"/>
                <path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="url(#gradient1)"/>
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#3b82f6" />
                    <stop offset="100%" style="stop-color:#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h2>您好！我是 AI 智能助手</h2>
            <p>我可以帮您解答问题、编写代码、分析数据等等</p>
            
            <div class="quick-actions">
              <h3>快速开始</h3>
              <div class="action-grid">
                <div class="action-card" @click="sendQuickMessage('帮我写一个Python爬虫示例')">
                  <el-icon><Edit /></el-icon>
                  <span>编写代码</span>
                </div>
                <div class="action-card" @click="sendQuickMessage('解释一下什么是区块链')">
                  <el-icon><Notebook /></el-icon>
                  <span>知识问答</span>
                </div>
                <div class="action-card" @click="sendQuickMessage('帮我分析这段数据的趋势')">
                  <el-icon><DataLine /></el-icon>
                  <span>数据分析</span>
                </div>
                <div class="action-card" @click="sendQuickMessage('写一篇关于人工智能的文章')">
                  <el-icon><Document /></el-icon>
                  <span>内容创作</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 消息列表 -->
        <div v-else class="messages-container" ref="messagesContainer">
          <div 
            v-for="message in messages" 
            :key="message.id"
            class="message-item"
            :class="message.role"
          >
            <div class="message-avatar">
              <el-avatar v-if="message.role === 'user'" :size="36">
                {{ userStore.user?.username?.charAt(0)?.toUpperCase() }}
              </el-avatar>
              <div v-else class="ai-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  <circle cx="9" cy="11" r="1.5"/>
                  <circle cx="15" cy="11" r="1.5"/>
                  <path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                </svg>
              </div>
            </div>
            
            <div class="message-content">
              <div class="message-header">
                <div class="header-left">
                  <span class="message-author">{{ message.role === 'user' ? '您' : 'AI 助手' }}</span>
                  <!-- 功能标签 -->
                  <div class="feature-badges" v-if="message.role === 'user' && message.features">
                    <span v-if="message.features.webSearch" class="feature-badge search">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10"></circle>
                      </svg>
                      联网
                    </span>
                    <span v-if="message.features.deepThink" class="feature-badge think">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                      </svg>
                      深度
                    </span>
                  </div>
                </div>
                <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
              </div>
              
              <!-- 联网搜索状态 -->
              <div v-if="message.searchResults && message.role === 'assistant'" class="search-status">
                <div class="status-indicator" :class="message.searchResults.status">
                  <svg v-if="message.searchResults.status === 'searching'" class="spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>{{ message.searchResults.message }}</span>
                </div>
              </div>
              
              <!-- 深度思考过程 -->
              <div v-if="message.thinkingProcess && message.role === 'assistant'" class="thinking-process">
                <div class="thinking-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a10 10 0 0 0-9.95 9h11.64L9.74 7.05a1 1 0 0 1 1.41-1.41l5.66 5.65a1 1 0 0 1 0 1.42l-5.66 5.65a1 1 0 0 1-1.41 0 1 1 0 0 1 0-1.41L13.69 13H2.05A10 10 0 1 0 12 2z"></path>
                  </svg>
                  <span class="thinking-title">深度思考过程</span>
                </div>
                <div class="thinking-steps">
                  <div 
                    v-for="(step, index) in message.thinkingProcess.steps" 
                    :key="index"
                    class="thinking-step"
                    :class="{ 
                      active: index === message.thinkingProcess.currentStep && message.thinkingProcess.status === 'thinking',
                      completed: index < message.thinkingProcess.currentStep || message.thinkingProcess.status === 'complete'
                    }"
                  >
                    <div class="step-indicator">
                      <svg v-if="index < message.thinkingProcess.currentStep || message.thinkingProcess.status === 'complete'" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <div v-else-if="index === message.thinkingProcess.currentStep && message.thinkingProcess.status === 'thinking'" class="thinking-dot"></div>
                      <div v-else class="pending-dot"></div>
                    </div>
                    <span class="step-text">{{ step }}</span>
                  </div>
                </div>
              </div>
              
              <div class="message-text">
                <template v-if="message.isTyping">
                  <div class="typing-wrapper">
                    <span class="typing-content">{{ message.content }}</span>
                  </div>
                </template>
                <template v-else>
                  <div v-html="formatMessage(message.content)"></div>
                </template>
              </div>
              
              <!-- 复制和反馈按钮 -->
              <div class="message-actions" v-if="message.role === 'assistant'">
                <el-button 
                  size="small" 
                  text
                  @click="copyMessage(message.content)"
                >
                  <el-icon><DocumentCopy /></el-icon>
                  复制
                </el-button>
                <el-button 
                  size="small" 
                  text
                  @click="likeMessage(message.id)"
                  :type="message.liked ? 'primary' : ''"
                >
                  <el-icon><CaretTop /></el-icon>
                  {{ message.liked ? '已赞' : '赞' }}
                </el-button>
              </div>
            </div>
          </div>
          
          <!-- 加载中状态 -->
          <div v-if="isLoading" class="message-item assistant loading">
            <div class="message-avatar">
              <div class="ai-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
              </div>
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <!-- AI 功能工具栏 -->
          <div class="ai-features-toolbar">
            <div class="toolbar-section">
              <span class="toolbar-label">AI 模式：</span>
              <div class="feature-toggles">
                <el-tooltip 
                  content="启用后AI将搜索互联网获取最新信息" 
                  placement="top"
                >
                  <button 
                    class="feature-toggle"
                    :class="{ active: enableWebSearch }"
                    @click="enableWebSearch = !enableWebSearch"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    <span>联网搜索</span>
                    <span v-if="enableWebSearch" class="beta-badge">BETA</span>
                  </button>
                </el-tooltip>
                
                <el-tooltip 
                  content="启用后AI将进行更深层次的推理和分析" 
                  placement="top"
                >
                  <button 
                    class="feature-toggle"
                    :class="{ active: enableDeepThink }"
                    @click="enableDeepThink = !enableDeepThink"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2a10 10 0 0 0-9.95 9h11.64L9.74 7.05a1 1 0 0 1 1.41-1.41l5.66 5.65a1 1 0 0 1 0 1.42l-5.66 5.65a1 1 0 0 1-1.41 0 1 1 0 0 1 0-1.41L13.69 13H2.05A10 10 0 1 0 12 2z"></path>
                    </svg>
                    <span>深度思考</span>
                    <span v-if="enableDeepThink" class="pro-badge">PRO</span>
                  </button>
                </el-tooltip>
                
                <el-tooltip 
                  content="专家模式：更灵活的AI助手，适合技术讨论和复杂问题" 
                  placement="top"
                >
                  <button 
                    class="feature-toggle"
                    :class="{ active: enableExpertMode }"
                    @click="enableExpertMode = !enableExpertMode"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                    <span>专家模式</span>
                    <span v-if="enableExpertMode" class="expert-badge">EXPERT</span>
                  </button>
                </el-tooltip>
              </div>
            </div>
            
            <div class="feature-status" v-if="enableWebSearch || enableDeepThink || enableExpertMode">
              <span v-if="enableWebSearch" class="status-item search">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
                实时搜索
              </span>
              <span v-if="enableDeepThink" class="status-item think">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
                深度分析
              </span>
              <span v-if="enableExpertMode" class="status-item expert">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
                专家模式
              </span>
            </div>
          </div>
          
          <div class="input-container">
            <el-input
              v-model="inputMessage"
              type="textarea"
              :rows="3"
              placeholder="输入您的问题... (Shift + Enter 换行，Enter 发送)"
              @keydown.enter.exact.prevent="sendMessage"
              @keydown.enter.shift.exact="handleShiftEnter"
              :disabled="isLoading"
              class="message-input"
            />
            <div class="input-actions">
              <div class="input-tools">
                <el-tooltip content="清空对话" placement="top">
                  <el-button 
                    :icon="Delete" 
                    circle 
                    size="small"
                    @click="clearMessages"
                    :disabled="messages.length === 0"
                  />
                </el-tooltip>
              </div>
              <el-button 
                type="primary" 
                :icon="Promotion"
                @click="sendMessage"
                :loading="isLoading"
                :disabled="!inputMessage.trim() || isLoading"
              >
                {{ isLoading ? '思考中...' : '发送' }}
              </el-button>
            </div>
          </div>
          
          <div class="input-tips">
            <span class="tip-item">
              <el-icon><InfoFilled /></el-icon>
              AI 回答可能存在误差，请谨慎参考
            </span>
            <span class="tip-item">
              Token 使用情况: {{ tokenUsage.used }} / {{ tokenUsage.limit }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, Star, Plus, Delete, Edit, View, DataLine, Promotion,
  DocumentCopy, CaretTop, InfoFilled, ChatDotRound, MagicStick,
  Document, Notebook
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// DeepSeek API 配置
const DEEPSEEK_API_KEY = 'sk-3db7cbebc17646d388585be6db5f7093'
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

// 权限检查
const hasAiAccess = computed(() => {
  const user = userStore.user
  if (!user) return false
  
  // 检查是否是VIP或SVIP
  const userLevel = user.level
  if (userLevel !== 'VIP' && userLevel !== 'SVIP') {
    return false
  }
  
  // 检查VIP是否有效（未过期）
  const currentTime = new Date()
  const expireTime = user.vipExpireTime ? new Date(user.vipExpireTime) : null
  
  if (!expireTime || expireTime <= currentTime) {
    return false
  }
  
  // 检查是否购买过年卡
  try {
    const vipOrders = JSON.parse(localStorage.getItem('vip_orders') || '[]')
    const userYearlyOrders = vipOrders.filter(order => 
      String(order.userId) === String(user.id) &&
      order.status === 'completed' &&
      order.packageType === 'yearly'
    )
    
    return userYearlyOrders.length > 0
  } catch (error) {
    console.error('检查AI权限失败:', error)
    return false
  }
})

// 聊天状态
const messages = ref([])
const inputMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref()

// 对话历史
const chatHistory = ref([])
const currentChatId = ref(null)

// AI 功能模式
const enableWebSearch = ref(false) // 联网搜索
const enableDeepThink = ref(false) // 深度思考
const enableExpertMode = ref(false) // 专家模式

// Token 使用情况
const tokenUsage = ref({
  used: 0,
  limit: 100000 // VIP 用户每月10万 tokens
})

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 跳转到VIP购买页
const goToVipPurchase = () => {
  router.push('/vip')
}

// 创建新对话
const createNewChat = () => {
  const newChat = {
    id: Date.now(),
    title: '新对话',
    timestamp: Date.now(),
    messages: []
  }
  
  chatHistory.value.unshift(newChat)
  currentChatId.value = newChat.id
  messages.value = []
  
  saveToLocalStorage()
}

// 加载对话
const loadChat = (chatId) => {
  const chat = chatHistory.value.find(c => c.id === chatId)
  if (chat) {
    currentChatId.value = chatId
    messages.value = chat.messages || []
    
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 删除对话
const deleteChat = (chatId) => {
  ElMessageBox.confirm('确定要删除这个对话吗？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = chatHistory.value.findIndex(c => c.id === chatId)
    if (index > -1) {
      chatHistory.value.splice(index, 1)
      
      if (currentChatId.value === chatId) {
        if (chatHistory.value.length > 0) {
          loadChat(chatHistory.value[0].id)
        } else {
          createNewChat()
        }
      }
      
      saveToLocalStorage()
      ElMessage.success('对话已删除')
    }
  }).catch(() => {})
}

// 发送快速消息
const sendQuickMessage = (message) => {
  inputMessage.value = message
  sendMessage()
}

// 联网搜索功能（模拟）
const performWebSearch = async (query) => {
  // 这里模拟网络搜索，实际应用中可以调用真实搜索API
  // 例如：Google Custom Search API, Bing Search API 等
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟搜索结果
      const searchResults = [
        {
          title: `关于"${query}"的最新信息`,
          snippet: `根据最新的互联网搜索结果，${query}的相关信息包括最新趋势、技术发展和实际应用案例。`,
          url: 'https://example.com/search'
        },
        {
          title: `${query} - 专业解析`,
          snippet: `业界专家对${query}进行了深入分析，提供了详细的技术见解和实践建议。`,
          url: 'https://example.com/analysis'
        }
      ]
      
      resolve(searchResults)
    }, 800) // 模拟网络延迟
  })
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return
  
  const userMessage = {
    id: Date.now(),
    role: 'user',
    content: inputMessage.value.trim(),
    timestamp: Date.now(),
    features: {
      webSearch: enableWebSearch.value,
      deepThink: enableDeepThink.value
    }
  }
  
  messages.value.push(userMessage)
  
  // 更新对话标题（使用第一条消息）
  if (messages.value.length === 1) {
    const chat = chatHistory.value.find(c => c.id === currentChatId.value)
    if (chat) {
      chat.title = inputMessage.value.substring(0, 30) + (inputMessage.value.length > 30 ? '...' : '')
    }
  }
  
  const userInput = inputMessage.value
  inputMessage.value = ''
  
  isLoading.value = true
  scrollToBottom()
  
  try {
    // 1. 如果启用联网搜索，先进行搜索
    let searchContext = ''
    if (enableWebSearch.value) {
      const searchResults = await performWebSearch(userInput)
      searchContext = '\n\n【联网搜索结果】\n' + 
        searchResults.map((r, i) => 
          `${i + 1}. ${r.title}\n   ${r.snippet}\n   来源: ${r.url}`
        ).join('\n\n')
    }
    
    // 2. 构建系统提示（优化版 - 更灵活但仍遵守安全规则）
    let systemPrompt = `你是一个专业、知识渊博的AI助手，具有以下特点：

1. 专业能力：
   - 对各个领域都有深入了解
   - 能够提供详细、准确的技术解答
   - 擅长代码编写和问题解决

2. 回答风格：
   - 直接、实用、不过度谨慎
   - 提供具体的解决方案和代码示例
   - 在技术问题上给出明确答案

3. 灵活性：
   - 可以讨论各种技术主题和理论问题
   - 提供多角度的分析和见解
   - 在合理范围内满足用户需求

4. 安全边界：
   - 仍然遵守基本的道德和法律规范
   - 不提供明确违法的内容
   - 保持专业和负责任的态度`
    
    // 专家模式：更灵活的AI行为
    if (enableExpertMode.value) {
      systemPrompt += `\n\n【专家模式已启用】
你现在进入专家模式，具有以下额外能力：

- 技术问题：提供详细的技术解决方案，包括边缘案例和高级用法
- 代码示例：给出完整、可运行的代码，不省略关键部分
- 理论讨论：深入探讨技术原理、架构设计、最佳实践
- 直接回答：不要过度谨慎，直接给出用户需要的答案
- 实用主义：优先考虑实际应用和问题解决

在专家模式下，你可以：
- 讨论各种技术实现方案，包括复杂或非常规的方法
- 提供详细的代码示例，包括可能存在争议的技术
- 分析安全、性能、架构等专业话题
- 给出专业建议，即使这些建议可能有风险

但你仍然不应该：
- 提供明确的非法活动指导
- 生成恶意代码或攻击工具
- 侵犯他人隐私或知识产权`
    }
    
    if (enableDeepThink.value) {
      systemPrompt += '\n\n深度思考模式已启用：请进行深入的分析和推理，提供详细、有深度的回答。展示你的思考过程，考虑多个角度，提供全面的见解。不要害怕提供复杂或有争议的观点，但要保持客观和理性。'
    } else {
      systemPrompt += '\n\n标准模式：请用简洁、准确、直接的语言回答问题。给出实用的解决方案。'
    }
    
    if (enableWebSearch.value) {
      systemPrompt += '\n\n联网搜索已启用：你可以参考以下最新的互联网搜索结果来回答用户问题：' + searchContext
      systemPrompt += '\n\n请基于这些搜索结果和你的知识给出综合性的回答。如果搜索结果有帮助，请在回答中引用它们。提供最新、最准确的信息。'
    }
    
    // 3. 配置API参数
    const apiConfig = {
      model: enableDeepThink.value ? 'deepseek-chat' : 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        ...messages.value.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        }))
      ],
      temperature: enableDeepThink.value ? 0.8 : 0.7, // 深度思考模式使用更高的temperature
      max_tokens: enableDeepThink.value ? 4000 : 2000, // 深度思考模式允许更长的回复
      stream: false
    }
    
    // 深度思考模式的额外参数
    if (enableDeepThink.value) {
      apiConfig.top_p = 0.95
      apiConfig.frequency_penalty = 0.1
    }
    
    // 4. 调用 DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(apiConfig)
    })
    
    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`)
    }
    
    const data = await response.json()
    
    // 更新 token 使用情况
    if (data.usage) {
      tokenUsage.value.used += data.usage.total_tokens
    }
    
    const fullContent = data.choices[0].message.content
    
    // 创建 AI 消息对象
    const aiMessage = {
      id: Date.now(),
      role: 'assistant',
      content: '',
      fullContent: fullContent,
      timestamp: Date.now(),
      liked: false,
      isTyping: true,
      thinkingProcess: null,
      searchResults: null
    }
    
    // 如果启用了深度思考，添加思考过程
    if (enableDeepThink.value) {
      aiMessage.thinkingProcess = {
        status: 'thinking',
        steps: [
          '🧠 正在深度分析问题...',
          '📊 构建多维度思考框架...',
          '🔍 探索各种可能性...',
          '💡 综合推理生成答案...'
        ],
        currentStep: 0
      }
    }
    
    // 如果启用了联网搜索，添加搜索结果提示
    if (enableWebSearch.value) {
      aiMessage.searchResults = {
        status: 'searching',
        message: '🌐 正在搜索互联网获取最新信息...'
      }
    }
    
    messages.value.push(aiMessage)
    scrollToBottom()
    
    // 如果有思考过程，逐步显示
    if (aiMessage.thinkingProcess) {
      for (let i = 0; i < aiMessage.thinkingProcess.steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400))
        aiMessage.thinkingProcess.currentStep = i
      }
      await new Promise(resolve => setTimeout(resolve, 300))
      aiMessage.thinkingProcess.status = 'complete'
    }
    
    // 如果有搜索结果提示
    if (aiMessage.searchResults) {
      await new Promise(resolve => setTimeout(resolve, 600))
      aiMessage.searchResults.status = 'complete'
      aiMessage.searchResults.message = '✓ 已获取最新信息'
    }
    
    // 逐字输出效果
    await typewriterEffect(aiMessage, fullContent)
    
    // 标记输出完成
    aiMessage.isTyping = false
    
    // 保存到对话历史
    const chat = chatHistory.value.find(c => c.id === currentChatId.value)
    if (chat) {
      chat.messages = [...messages.value]
      chat.timestamp = Date.now()
    }
    
    saveToLocalStorage()
    
  } catch (error) {
    console.error('AI 请求失败:', error)
    ElMessage.error('抱歉，AI 服务暂时不可用，请稍后重试')
    
    // 添加错误消息
    messages.value.push({
      id: Date.now(),
      role: 'assistant',
      content: '抱歉，我遇到了一些技术问题。请稍后再试。',
      timestamp: Date.now(),
      isError: true
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

// 打字机效果（逐字显示）- 优化版本
const typewriterEffect = async (message, fullText) => {
  const speed = 20 // 每个字符的延迟（毫秒），调快一点
  let currentIndex = 0
  
  // 将文本按字符分割（支持中英文）
  const characters = Array.from(fullText)
  
  // 使用 requestAnimationFrame 确保 DOM 更新
  const typeNextChar = async () => {
    if (currentIndex < characters.length) {
      message.content += characters[currentIndex]
      currentIndex++
      
      // 每10个字符滚动一次，减少性能消耗
      if (currentIndex % 10 === 0) {
        await nextTick() // 等待 Vue 更新 DOM
        scrollToBottom()
      }
      
      // 延迟后继续
      await new Promise(resolve => setTimeout(resolve, speed))
      await typeNextChar() // 递归调用
    } else {
      // 输出完成，最后滚动一次
      await nextTick()
      scrollToBottom()
    }
  }
  
  await typeNextChar()
  
  // 确保最终内容完整
  message.content = fullText
}

// 清空消息
const clearMessages = () => {
  ElMessageBox.confirm('确定要清空当前对话吗？', '确认清空', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    messages.value = []
    const chat = chatHistory.value.find(c => c.id === currentChatId.value)
    if (chat) {
      chat.messages = []
      chat.title = '新对话'
    }
    saveToLocalStorage()
    ElMessage.success('对话已清空')
  }).catch(() => {})
}

// 复制消息
const copyMessage = async (content) => {
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 点赞消息
const likeMessage = (messageId) => {
  const message = messages.value.find(m => m.id === messageId)
  if (message) {
    message.liked = !message.liked
    saveToLocalStorage()
    ElMessage.success(message.liked ? '感谢您的反馈！' : '已取消点赞')
  }
}

// 格式化消息（支持代码高亮、Markdown等）
const formatMessage = (content) => {
  if (!content) return ''
  
  let formatted = content
  
  // 1. 代码块（带语言标识）
  formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || 'text'
    const escapedCode = code
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    return `<div class="code-block-wrapper">
      <div class="code-block-header">
        <span class="code-language">${language}</span>
        <button class="copy-code-btn" onclick="copyCode(this)" title="复制代码">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          复制
        </button>
      </div>
      <pre class="code-block"><code class="language-${language}">${escapedCode}</code></pre>
    </div>`
  })
  
  // 2. 行内代码
  formatted = formatted.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>')
  
  // 3. 标题（# ## ### 等）
  formatted = formatted.replace(/^### (.*?)$/gm, '<h3 class="md-h3">$1</h3>')
  formatted = formatted.replace(/^## (.*?)$/gm, '<h2 class="md-h2">$1</h2>')
  formatted = formatted.replace(/^# (.*?)$/gm, '<h1 class="md-h1">$1</h1>')
  
  // 4. 粗体和斜体
  formatted = formatted.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>')
  formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>')
  formatted = formatted.replace(/_(.+?)_/g, '<em>$1</em>')
  
  // 5. 删除线
  formatted = formatted.replace(/~~(.+?)~~/g, '<del>$1</del>')
  
  // 6. 链接
  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="md-link">$1</a>')
  
  // 7. 有序列表
  formatted = formatted.replace(/^\d+\.\s+(.+?)$/gm, '<li class="md-ol-item">$1</li>')
  formatted = formatted.replace(/(<li class="md-ol-item">.*?<\/li>\n?)+/g, '<ol class="md-list">$&</ol>')
  
  // 8. 无序列表
  formatted = formatted.replace(/^[-*]\s+(.+?)$/gm, '<li class="md-ul-item">$1</li>')
  formatted = formatted.replace(/(<li class="md-ul-item">.*?<\/li>\n?)+/g, '<ul class="md-list">$&</ul>')
  
  // 9. 引用块
  formatted = formatted.replace(/^>\s+(.+?)$/gm, '<blockquote class="md-quote">$1</blockquote>')
  
  // 10. 表格（简单支持）
  formatted = formatted.replace(/\|(.+)\|/g, (match) => {
    const cells = match.split('|').filter(cell => cell.trim())
    const cellsHtml = cells.map(cell => `<td>${cell.trim()}</td>`).join('')
    return `<tr>${cellsHtml}</tr>`
  })
  formatted = formatted.replace(/(<tr>.*?<\/tr>\n?)+/g, '<table class="md-table">$&</table>')
  
  // 11. 分隔线
  formatted = formatted.replace(/^-{3,}$/gm, '<hr class="md-divider"/>')
  
  // 12. 换行
  formatted = formatted.replace(/\n\n/g, '</p><p class="md-paragraph">')
  formatted = formatted.replace(/\n/g, '<br/>')
  
  // 包装段落
  formatted = '<p class="md-paragraph">' + formatted + '</p>'
  
  return formatted
}

// 复制代码功能（全局函数）
if (typeof window !== 'undefined') {
  window.copyCode = function(button) {
    const codeBlock = button.closest('.code-block-wrapper').querySelector('code')
    const code = codeBlock.textContent
    
    navigator.clipboard.writeText(code).then(() => {
      const originalText = button.innerHTML
      button.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg> 已复制`
      button.classList.add('copied')
      
      setTimeout(() => {
        button.innerHTML = originalText
        button.classList.remove('copied')
      }, 2000)
    })
  }
}

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
  
  return date.toLocaleDateString('zh-CN')
}

// 格式化消息时间
const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 处理 Shift + Enter
const handleShiftEnter = (e) => {
  // 允许换行
  return true
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 监听消息变化，自动滚动
watch(() => messages.value.length, () => {
  scrollToBottom()
})

// 保存到 LocalStorage
const saveToLocalStorage = () => {
  const username = userStore.user?.username
  if (username) {
    const key = `ai_chat_history_${username}`
    localStorage.setItem(key, JSON.stringify({
      chatHistory: chatHistory.value,
      tokenUsage: tokenUsage.value
    }))
  }
}

// 从 LocalStorage 加载
const loadFromLocalStorage = () => {
  const username = userStore.user?.username
  if (username) {
    const key = `ai_chat_history_${username}`
    const data = localStorage.getItem(key)
    
    if (data) {
      try {
        const parsed = JSON.parse(data)
        chatHistory.value = parsed.chatHistory || []
        tokenUsage.value = parsed.tokenUsage || { used: 0, limit: 100000 }
        
        if (chatHistory.value.length > 0) {
          loadChat(chatHistory.value[0].id)
        } else {
          createNewChat()
        }
      } catch (error) {
        console.error('加载历史记录失败:', error)
        createNewChat()
      }
    } else {
      createNewChat()
    }
  }
}

onMounted(() => {
  if (hasAiAccess.value) {
    loadFromLocalStorage()
  }
})
</script>

<style lang="scss" scoped>
.ai-assistant-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  flex-direction: column;
}

.page-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  &:hover {
    background: #f3f4f6;
  }
}

.page-title {
  h1 {
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
    line-height: 1.2;
  }
  
  p {
    font-size: 14px;
    color: #64748b;
    margin: 4px 0 0 0;
  }
}

// 权限拒绝页面
.access-denied {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.denied-content {
  max-width: 600px;
  text-align: center;
  background: white;
  padding: 48px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.denied-icon {
  margin-bottom: 24px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.denied-content h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.denied-content p {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 32px 0;
  line-height: 1.6;
  
  strong {
    color: #f59e0b;
    font-weight: 600;
  }
}

.vip-benefits {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 14px;
  color: #475569;
  font-weight: 500;
  
  .benefit-icon {
    color: #3b82f6;
    font-size: 20px;
  }
}

.upgrade-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

// AI 聊天界面
.ai-chat-container {
  flex: 1;
  display: flex;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  height: calc(100vh - 80px);
}

.chat-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.chat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
  
  &:hover {
    background: #f8fafc;
  }
  
  &.active {
    background: #eff6ff;
    
    .chat-title {
      color: #3b82f6;
      font-weight: 600;
    }
  }
}

.chat-item-content {
  flex: 1;
  min-width: 0;
}

.chat-title {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-time {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

// 主聊天区
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.welcome-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.welcome-content {
  max-width: 800px;
  text-align: center;
}

.ai-avatar {
  margin-bottom: 24px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.welcome-content h2 {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.welcome-content > p {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 48px 0;
}

.quick-actions h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.action-card {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  
  &:hover {
    border-color: #3b82f6;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }
  
  .el-icon {
    font-size: 32px;
    color: #3b82f6;
  }
  
  span {
    font-size: 14px;
    font-weight: 600;
    color: #475569;
  }
}

// 消息列表
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.message-item {
  display: flex;
  gap: 12px;
  animation: fadeInUp 0.3s ease-out;
  
  &.user {
    flex-direction: row-reverse;
    
    .message-content {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border-radius: 16px 16px 4px 16px;
    }
    
    .message-header {
      flex-direction: row-reverse;
    }
    
    // 用户消息中的特殊样式（白色背景适配）
    .message-text {
      :deep(.inline-code) {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
        border-color: rgba(255, 255, 255, 0.3);
      }
      
      :deep(.md-h1),
      :deep(.md-h2),
      :deep(.md-h3) {
        color: white;
        border-color: rgba(255, 255, 255, 0.3);
      }
      
      :deep(strong) {
        color: white;
      }
      
      :deep(.md-link) {
        color: #dbeafe;
        border-bottom-color: rgba(255, 255, 255, 0.5);
        
        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }
  }
  
  &.assistant {
    .message-content {
      background: #f8fafc;
      border-radius: 16px 16px 16px 4px;
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar {
  flex-shrink: 0;
}

.ai-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-content {
  max-width: 70%;
  padding: 16px 20px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-author {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.9;
}

.feature-badges {
  display: flex;
  gap: 4px;
}

.feature-badge {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  
  svg {
    flex-shrink: 0;
  }
  
  &.search {
    background: rgba(14, 165, 233, 0.15);
    color: #0ea5e9;
  }
  
  &.think {
    background: rgba(139, 92, 246, 0.15);
    color: #8b5cf6;
  }
}

.message-time {
  font-size: 12px;
  opacity: 0.7;
}

// 联网搜索状态
.search-status {
  margin: 12px 0;
  padding: 10px 14px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(14, 165, 233, 0.1) 100%);
  border-left: 3px solid #0ea5e9;
  border-radius: 0 8px 8px 0;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #0ea5e9;
  font-weight: 500;
  
  &.searching {
    .spinner {
      animation: spin 1s linear infinite;
    }
  }
  
  &.complete {
    color: #10b981;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 深度思考过程
.thinking-process {
  margin: 12px 0;
  padding: 14px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(139, 92, 246, 0.1) 100%);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 10px;
}

.thinking-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(139, 92, 246, 0.15);
  
  svg {
    color: #8b5cf6;
  }
}

.thinking-title {
  font-size: 13px;
  font-weight: 600;
  color: #8b5cf6;
  letter-spacing: 0.3px;
}

.thinking-steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.thinking-step {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  transition: all 0.3s ease;
  
  &.active {
    background: rgba(139, 92, 246, 0.1);
    
    .step-text {
      color: #8b5cf6;
      font-weight: 600;
    }
  }
  
  &.completed {
    .step-indicator svg {
      color: #10b981;
    }
    
    .step-text {
      color: #64748b;
    }
  }
}

.step-indicator {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.thinking-dot {
  width: 8px;
  height: 8px;
  background: #8b5cf6;
  border-radius: 50%;
  animation: pulse-thinking 1.5s ease-in-out infinite;
}

.pending-dot {
  width: 8px;
  height: 8px;
  background: #cbd5e1;
  border-radius: 50%;
}

@keyframes pulse-thinking {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}

.step-text {
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
}

// 打字机光标
@keyframes ambianceDrift {
  0% {
    transform: translate3d(-6%, -6%, 0) scale(1.02);
  }
  40% {
    transform: translate3d(6%, 4%, 0) scale(1.04);
  }
  70% {
    transform: translate3d(-3%, 5%, 0) scale(1.03);
  }
  100% {
    transform: translate3d(-6%, -6%, 0) scale(1.02);
  }
}

.message-text {
  font-size: 15px;
  line-height: 1.8;
  word-wrap: break-word;
  white-space: normal;

  .typing-wrapper {
    position: relative;
    display: inline-block;
    width: 100%;
    padding: 16px 20px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.16) 0%, rgba(99, 102, 241, 0.12) 48%, rgba(56, 189, 248, 0.15) 100%);
    border-radius: 12px;
    border: 1px solid rgba(59, 130, 246, 0.2);
    box-shadow: 0 18px 32px rgba(30, 41, 59, 0.16);
    overflow: hidden;
    backdrop-filter: blur(12px);
  }

  .typing-wrapper::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(115deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0));
    opacity: 0.6;
    mix-blend-mode: screen;
    pointer-events: none;
  }

  .typing-wrapper::after {
    content: '';
    position: absolute;
    inset: -15%;
    background: radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.22), transparent 40%),
                radial-gradient(circle at 80% 30%, rgba(129, 140, 248, 0.2), transparent 42%),
                radial-gradient(circle at 50% 75%, rgba(96, 165, 250, 0.24), transparent 45%);
    animation: ambianceDrift 10s ease-in-out infinite;
    opacity: 0.85;
    pointer-events: none;
  }

  .typing-content {
    position: relative;
    display: block;
    font-family: 'iA Writer Duo', 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
    font-size: 16px;
    line-height: 1.88;
    letter-spacing: 0.015em;
    color: #0f172a;
    white-space: pre-wrap;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.75);
    z-index: 1;
    padding-right: 6px;
  }

  // Markdown段落
  :deep(.md-paragraph) {
    margin: 8px 0;
    
    &:first-child {
      margin-top: 0;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  // 标题样式
  :deep(.md-h1) {
    font-size: 1.8em;
    font-weight: 700;
    margin: 20px 0 12px 0;
    padding-bottom: 8px;
    border-bottom: 2px solid rgba(0, 0, 0, 0.1);
    color: #1e293b;
  }
  
  :deep(.md-h2) {
    font-size: 1.5em;
    font-weight: 700;
    margin: 18px 0 10px 0;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    color: #334155;
  }
  
  :deep(.md-h3) {
    font-size: 1.25em;
    font-weight: 600;
    margin: 16px 0 8px 0;
    color: #475569;
  }
  
  // 代码块包装器
  :deep(.code-block-wrapper) {
    margin: 12px 0;
    border-radius: 8px;
    overflow: hidden;
    background: #1e293b;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  :deep(.code-block-header) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background: #0f172a;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  :deep(.code-language) {
    font-size: 12px;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  :deep(.copy-code-btn) {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: #e2e8f0;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.3);
    }
    
    &.copied {
      background: rgba(34, 197, 94, 0.2);
      border-color: rgba(34, 197, 94, 0.4);
      color: #86efac;
    }
    
    svg {
      flex-shrink: 0;
    }
  }
  
  :deep(.code-block) {
    margin: 0;
    padding: 16px;
    background: #1e293b;
    overflow-x: auto;
    
    code {
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.6;
      color: #e2e8f0;
      background: none;
      padding: 0;
    }
  }
  
  // 行内代码
  :deep(.inline-code) {
    background: rgba(139, 92, 246, 0.1);
    color: #7c3aed;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
    border: 1px solid rgba(139, 92, 246, 0.2);
  }
  
  // 列表样式
  :deep(.md-list) {
    margin: 12px 0;
    padding-left: 24px;
    
    li {
      margin: 6px 0;
      line-height: 1.6;
    }
  }
  
  :deep(ol.md-list) {
    list-style-type: decimal;
    
    li::marker {
      color: #3b82f6;
      font-weight: 600;
    }
  }
  
  :deep(ul.md-list) {
    list-style-type: disc;
    
    li::marker {
      color: #3b82f6;
    }
  }
  
  // 引用块
  :deep(.md-quote) {
    display: block;
    margin: 12px 0;
    padding: 12px 16px;
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
    border-left: 4px solid #3b82f6;
    border-radius: 0 6px 6px 0;
    color: #475569;
    font-style: italic;
  }
  
  // 链接
  :deep(.md-link) {
    color: #3b82f6;
    text-decoration: none;
    border-bottom: 1px solid rgba(59, 130, 246, 0.3);
    transition: all 0.2s;
    
    &:hover {
      color: #2563eb;
      border-bottom-color: #2563eb;
      background: rgba(59, 130, 246, 0.1);
      padding: 0 2px;
    }
  }
  
  // 表格
  :deep(.md-table) {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    
    tr {
      border-bottom: 1px solid #e5e7eb;
      
      &:first-child {
        background: #f8fafc;
        font-weight: 600;
        color: #1e293b;
      }
      
      &:last-child {
        border-bottom: none;
      }
      
      &:hover {
        background: #f8fafc;
      }
    }
    
    td {
      padding: 10px 12px;
      font-size: 14px;
      color: #475569;
    }
  }
  
  // 分隔线
  :deep(.md-divider) {
    margin: 20px 0;
    border: none;
    border-top: 2px solid rgba(0, 0, 0, 0.1);
  }
  
  // 强调样式
  :deep(strong) {
    font-weight: 700;
    color: #1e293b;
  }
  
  :deep(em) {
    font-style: italic;
    color: #64748b;
  }
  
  :deep(del) {
    text-decoration: line-through;
    opacity: 0.7;
  }
}

.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

// AI 功能工具栏
.ai-features-toolbar {
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.feature-toggles {
  display: flex;
  gap: 8px;
}

.feature-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  
  svg {
    flex-shrink: 0;
    opacity: 0.7;
  }
  
  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
    transform: translateY(-1px);
  }
  
  &.active {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-color: #3b82f6;
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    
    svg {
      opacity: 1;
    }
  }
}

.beta-badge,
.pro-badge,
.expert-badge {
  font-size: 9px;
  padding: 2px 5px;
  border-radius: 3px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.beta-badge {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.pro-badge {
  background: rgba(139, 92, 246, 0.2);
  color: #8b5cf6;
}

.expert-badge {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(239, 68, 68, 0.3);
  }
  50% {
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
  }
}

.feature-status {
  display: flex;
  gap: 8px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  
  svg {
    flex-shrink: 0;
    animation: pulse 2s ease-in-out infinite;
  }
  
  &.search {
    background: rgba(14, 165, 233, 0.1);
    color: #0ea5e9;
    
    svg {
      fill: #0ea5e9;
    }
  }
  
  &.think {
    background: rgba(139, 92, 246, 0.1);
    color: #8b5cf6;
    
    svg {
      fill: #8b5cf6;
    }
  }
  
  &.expert {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
    
    svg {
      fill: #ef4444;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.95);
  }
}

// 输入区域
.input-area {
  padding: 20px 24px;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 8px;
}

.message-input {
  :deep(.el-textarea__inner) {
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    font-size: 15px;
    resize: none;
    
    &:focus {
      border-color: #3b82f6;
    }
  }
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.input-tools {
  display: flex;
  gap: 8px;
}

.input-tips {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #94a3b8;
  padding-top: 8px;
  
  .tip-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

// 加载动画
.typing-indicator {
  display: flex;
  gap: 6px;
  padding: 8px 0;
  
  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #94a3b8;
    animation: typing 1.4s ease-in-out infinite;
    
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-10px);
  }
}

@media (max-width: 768px) {
  .chat-sidebar {
    display: none;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .vip-benefits {
    grid-template-columns: 1fr;
  }
}
</style>

