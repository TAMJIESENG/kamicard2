<template>
  <div class="realtime-chat-management">
    <div class="management-layout">
      <!-- 用户列表 -->
      <div class="user-list-section">
        <div class="section-header">
          <h4>用户列表</h4>
          <el-button size="small" @click="refreshUsers">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
        
        <el-input
          v-model="userSearchKeyword"
          placeholder="搜索用户..."
          clearable
          style="margin-bottom: 16px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <div class="user-list">
          <div
            v-for="user in filteredChatUsers"
            :key="user.id"
            :class="['user-item', { 'user-active': selectedUserId === user.id }]"
            @click="selectUser(user.id)"
          >
            <el-avatar :size="40" :style="{ backgroundColor: user.color }">
              {{ user.username.charAt(0).toUpperCase() }}
            </el-avatar>
            <div class="user-info">
              <div class="user-name">{{ user.username }}</div>
              <div class="user-meta">
                <span class="message-count">{{ user.unreadCount > 0 ? `${user.unreadCount}条未读` : '无未读' }}</span>
                <span class="last-message-time">{{ user.lastMessageTime || '暂无消息' }}</span>
              </div>
            </div>
            <el-badge :value="user.unreadCount" :hidden="user.unreadCount === 0" />
          </div>
          
          <div v-if="filteredChatUsers.length === 0" class="empty-users">
            <el-empty description="暂无用户消息" :image-size="80" />
          </div>
        </div>
      </div>
      
      <!-- 聊天窗口 -->
      <div class="chat-section">
        <div v-if="selectedUserId" class="chat-window">
          <div class="chat-header">
            <span>与 {{ selectedUserName }} 的对话</span>
            <el-button type="primary" size="small" @click="scrollToBottom">
              <el-icon><Bottom /></el-icon>
              滚动到底部
            </el-button>
          </div>
          
          <div class="admin-chat-messages" ref="adminMessagesContainerRef">
            <div v-if="currentChatMessages.length === 0" class="empty-messages">
              <el-empty description="暂无消息，开始对话吧" :image-size="100" />
            </div>
            
            <div
              v-for="(message, index) in currentChatMessages"
              :key="message.id"
              :class="['message-item', { 'message-user': message.sender === 'user', 'message-admin': message.sender === 'admin' }]"
            >
              <div class="message-avatar">
                <el-avatar
                  :size="36"
                  :style="{ backgroundColor: message.sender === 'user' ? '#409eff' : '#67c23a' }"
                >
                  {{ message.sender === 'user' ? selectedUserName?.charAt(0).toUpperCase() : '管理员' }}
                </el-avatar>
              </div>
              
              <div class="message-content-wrapper">
                <div class="message-header">
                  <span class="message-sender">{{ message.sender === 'user' ? selectedUserName : '管理员' }}</span>
                  <span class="message-time">{{ formatTime(message.createTime) }}</span>
                </div>
                
                <div class="message-bubble">
                  <div class="message-text">{{ message.content }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="chat-input-area">
            <el-input
              v-model="adminReplyMessage"
              type="textarea"
              :rows="3"
              placeholder="输入回复消息，按 Ctrl+Enter 发送..."
              @keydown.ctrl.enter="sendAdminReply"
              maxlength="500"
              show-word-limit
              class="message-input"
            />
            
            <div class="input-actions">
              <el-button
                type="primary"
                @click="sendAdminReply"
                :disabled="!canSendAdminReply || adminSending"
                :loading="adminSending"
              >
                <el-icon><Position /></el-icon>
                发送回复
              </el-button>
            </div>
          </div>
        </div>
        
        <div v-else class="no-selection">
          <el-empty description="请选择左侧用户开始对话" :image-size="150" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Bottom, Position } from '@element-plus/icons-vue'

const userSearchKeyword = ref('')
const selectedUserId = ref(null)
const selectedUserName = ref('')
const adminReplyMessage = ref('')
const adminSending = ref(false)
const adminMessagesContainerRef = ref(null)
const refreshInterval = ref(null)

// 所有聊天用户
const chatUsers = ref([])

// 强制刷新的ref，用于触发computed重新计算
const messagesRefreshTrigger = ref(0)

// 当前用户的聊天消息
const currentChatMessages = computed(() => {
  // 依赖messagesRefreshTrigger来强制刷新
  messagesRefreshTrigger.value
  
  if (!selectedUserId.value) return []
  
  try {
    const allMessages = JSON.parse(localStorage.getItem('realtime_chat_messages') || '[]')
    const selectedUserIdStr = String(selectedUserId.value)
    return allMessages
      .filter(msg => String(msg.userId) === selectedUserIdStr)
      .sort((a, b) => new Date(a.createTime) - new Date(b.createTime))
  } catch (error) {
    console.error('加载消息失败:', error)
    return []
  }
})

// 过滤后的用户列表
const filteredChatUsers = computed(() => {
  let filtered = chatUsers.value
  
  if (userSearchKeyword.value) {
    const keyword = userSearchKeyword.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.username.toLowerCase().includes(keyword)
    )
  }
  
  return filtered.sort((a, b) => {
    // 未读消息多的排在前面
    if (a.unreadCount !== b.unreadCount) {
      return b.unreadCount - a.unreadCount
    }
    // 最后消息时间晚的排在前面
    if (a.lastMessageTime && b.lastMessageTime) {
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    }
    return 0
  })
})

const canSendAdminReply = computed(() => {
  return adminReplyMessage.value.trim().length > 0 && !adminSending.value
})

// 加载所有有消息的用户
const loadChatUsers = () => {
  try {
    const allMessages = JSON.parse(localStorage.getItem('realtime_chat_messages') || '[]')
    const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]')
    
    // 获取所有有消息的用户ID
    const userIdsWithMessages = [...new Set(allMessages.map(msg => msg.userId))]
    
    // 创建用户列表
    const usersMap = new Map()
    
    userIdsWithMessages.forEach(userId => {
      // 确保userId是字符串类型进行比较
      const userIdStr = String(userId)
      const userMessages = allMessages.filter(msg => String(msg.userId) === userIdStr)
      const lastMessage = userMessages[userMessages.length - 1]
      const unreadCount = userMessages.filter(msg => 
        msg.sender === 'admin' && !msg.isRead
      ).length
      
      // 获取用户信息（确保类型一致）
      const user = allUsers.find(u => String(u.id) === userIdStr)
      if (!user) return
      
      // 生成颜色（使用用户ID的字符串形式）
      const colorValue = userIdStr.length > 0 ? userIdStr.charCodeAt(0) : 0
      
      usersMap.set(userIdStr, {
        id: userIdStr,
        username: user.username || `用户${userIdStr}`,
        unreadCount,
        lastMessageTime: lastMessage ? lastMessage.createTime : null,
        color: `hsl(${colorValue % 360}, 70%, 50%)`
      })
    })
    
    chatUsers.value = Array.from(usersMap.values())
    
    // 如果当前选中的用户不在列表中，清除选择
    if (selectedUserId.value && !usersMap.has(String(selectedUserId.value))) {
      selectedUserId.value = null
      selectedUserName.value = ''
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    chatUsers.value = []
  }
}

// 选择用户
const selectUser = (userId) => {
  selectedUserId.value = userId
  const user = chatUsers.value.find(u => u.id === userId)
  selectedUserName.value = user?.username || ''
  
  // 标记该用户的消息为已读
  markUserMessagesAsRead(userId)
  
  // 刷新用户列表（更新未读数）
  loadChatUsers()
  
  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
}

// 标记用户消息为已读
const markUserMessagesAsRead = (userId) => {
  try {
    const allMessages = JSON.parse(localStorage.getItem('realtime_chat_messages') || '[]')
    const userIdStr = String(userId)
    let updated = false
    
    allMessages.forEach(msg => {
      if (String(msg.userId) === userIdStr && msg.sender === 'admin' && !msg.isRead) {
        msg.isRead = true
        updated = true
      }
    })
    
    if (updated) {
      localStorage.setItem('realtime_chat_messages', JSON.stringify(allMessages))
    }
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

// 发送管理员回复
const sendAdminReply = async () => {
  if (!canSendAdminReply.value || !selectedUserId.value) return
  
  adminSending.value = true
  
  try {
    const allMessages = JSON.parse(localStorage.getItem('realtime_chat_messages') || '[]')
    
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: selectedUserId.value,
      username: selectedUserName.value,
      sender: 'admin',
      content: adminReplyMessage.value.trim(),
      createTime: new Date().toISOString(),
      isRead: false
    }
    
    allMessages.push(newMessage)
    localStorage.setItem('realtime_chat_messages', JSON.stringify(allMessages))
    
    adminReplyMessage.value = ''
    
    // 触发消息列表更新
    messagesRefreshTrigger.value++
    
    // 刷新用户列表
    loadChatUsers()
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
    
    ElMessage.success('回复已发送')
  } catch (error) {
    ElMessage.error('发送失败，请稍后重试')
    console.error('发送回复失败:', error)
  } finally {
    adminSending.value = false
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (adminMessagesContainerRef.value) {
    adminMessagesContainerRef.value.scrollTop = adminMessagesContainerRef.value.scrollHeight
  }
}

// 格式化时间
const formatTime = (timeString) => {
  try {
    const date = new Date(timeString)
    const now = new Date()
    const diff = now - date
    
    // 今天
    if (diff < 86400000 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    
    // 昨天
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth()) {
      return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
    }
    
    // 更早的日期
    return date.toLocaleString('zh-CN', { 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } catch (error) {
    return timeString
  }
}

// 刷新用户列表
const refreshUsers = () => {
  loadChatUsers()
  ElMessage.success('已刷新')
}

// 自动刷新（每1.5秒，确保实时性）
const startAutoRefresh = () => {
  refreshInterval.value = setInterval(() => {
    loadChatUsers()
    // 触发消息列表更新，强制computed重新计算
    messagesRefreshTrigger.value++
  }, 1500) // 缩短到1.5秒，提高实时性
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

// 监听消息变化，自动滚动
watch(() => currentChatMessages.value.length, () => {
  nextTick(() => {
    scrollToBottom()
  })
})

onMounted(() => {
  loadChatUsers()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style lang="scss" scoped>
.realtime-chat-management {
  .management-layout {
    display: flex;
    gap: 20px;
    height: 700px;
  }
  
  .user-list-section {
    width: 300px;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    padding: 16px;
    background: #fff;
    display: flex;
    flex-direction: column;
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      h4 {
        margin: 0;
        color: #303133;
      }
    }
    
    .user-list {
      flex: 1;
      overflow-y: auto;
      
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: #c0c4cc;
        border-radius: 3px;
      }
      
      .user-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        margin-bottom: 8px;
        position: relative;
        
        &:hover {
          background: #f5f7fa;
        }
        
        &.user-active {
          background: #ecf5ff;
          border: 1px solid #409eff;
        }
        
        .user-info {
          flex: 1;
          min-width: 0;
          
          .user-name {
            font-weight: 500;
            color: #303133;
            margin-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .user-meta {
            display: flex;
            flex-direction: column;
            gap: 2px;
            font-size: 12px;
            color: #909399;
            
            .message-count {
              color: #f56c6c;
            }
            
            .last-message-time {
              color: #909399;
            }
          }
        }
      }
      
      .empty-users {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
      }
    }
  }
  
  .chat-section {
    flex: 1;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
    
    .chat-window {
      height: 100%;
      display: flex;
      flex-direction: column;
      
      .chat-header {
        padding: 16px;
        border-bottom: 1px solid #ebeef5;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f5f7fa;
      }
      
      .admin-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        background: #f5f7fa;
        
        &::-webkit-scrollbar {
          width: 6px;
        }
        
        &::-webkit-scrollbar-thumb {
          background: #c0c4cc;
          border-radius: 3px;
        }
        
        .empty-messages {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
        }
        
        .message-item {
          display: flex;
          margin-bottom: 20px;
          animation: fadeIn 0.3s ease-in;
          
          &.message-user {
            flex-direction: row-reverse;
            
            .message-content-wrapper {
              align-items: flex-end;
              
              .message-bubble {
                background: #409eff;
                color: #fff;
                border-radius: 12px 12px 2px 12px;
                
                .message-text {
                  color: #fff;
                }
              }
            }
          }
          
          &.message-admin {
            .message-content-wrapper {
              align-items: flex-start;
              
              .message-bubble {
                background: #fff;
                color: #303133;
                border-radius: 12px 12px 12px 2px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                
                .message-text {
                  color: #303133;
                }
              }
            }
          }
          
          .message-avatar {
            margin: 0 12px;
          }
          
          .message-content-wrapper {
            max-width: 70%;
            display: flex;
            flex-direction: column;
            
            .message-header {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 6px;
              font-size: 12px;
              
              .message-sender {
                font-weight: 500;
                color: #606266;
              }
              
              .message-time {
                color: #909399;
              }
            }
            
            .message-bubble {
              padding: 12px 16px;
              word-wrap: break-word;
              word-break: break-all;
              
              .message-text {
                line-height: 1.6;
                white-space: pre-wrap;
              }
            }
          }
        }
      }
      
      .chat-input-area {
        border-top: 1px solid #ebeef5;
        padding: 16px;
        background: #fff;
        
        .message-input {
          margin-bottom: 12px;
        }
        
        .input-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
      }
    }
    
    .no-selection {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

