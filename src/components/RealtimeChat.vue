<template>
  <div class="realtime-chat">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><ChatLineRound /></el-icon>
          <span>实时联系管理员</span>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索消息..."
              size="small"
              clearable
              style="width: 200px; margin-right: 12px;"
              v-if="messages.length > 0"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-dropdown @command="handleHeaderCommand" trigger="click">
              <el-button size="small" circle>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="export">导出聊天记录</el-dropdown-item>
                  <el-dropdown-item command="clear">清空聊天记录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="unread-badge">
              <el-tag type="info" size="small">未读: {{ unreadCount }}</el-tag>
            </el-badge>
          </div>
        </div>
      </template>
      
      <!-- 聊天窗口 -->
      <div class="chat-container">
        <div class="chat-messages" ref="messagesContainerRef">
          <div v-if="filteredMessages.length === 0 && !searchKeyword" class="empty-messages">
            <el-empty description="暂无消息，开始与管理员对话吧" :image-size="100" />
          </div>
          
          <div v-if="searchKeyword && filteredMessages.length === 0" class="empty-messages">
            <el-empty description="未找到相关消息" :image-size="100" />
          </div>
          
          <!-- 日期分组 -->
          <template v-for="(group, groupIndex) in groupedMessages" :key="group.date">
            <div class="date-divider" v-if="group.date">
              <span class="divider-line"></span>
              <span class="divider-text">{{ formatDate(group.date) }}</span>
              <span class="divider-line"></span>
            </div>
            
            <div 
              v-for="(message, index) in group.messages" 
              :key="message.id"
              :class="['message-item', { 'message-user': message.sender === 'user', 'message-admin': message.sender === 'admin', 'message-highlight': highlightMessageId === message.id }]"
              @contextmenu.prevent="showMessageMenu($event, message)"
            >
            <div class="message-avatar">
              <el-avatar 
                :size="36" 
                :style="{ backgroundColor: message.sender === 'user' ? '#409eff' : '#67c23a' }"
              >
                {{ message.sender === 'user' ? '我' : '管理员' }}
              </el-avatar>
            </div>
            
              <div class="message-content-wrapper">
              <div class="message-header">
                <span class="message-sender">{{ message.sender === 'user' ? currentUser?.username || '我' : '管理员' }}</span>
                <span class="message-time">{{ formatTime(message.createTime) }}</span>
                <el-dropdown @command="handleMessageCommand" trigger="click" v-if="message.sender === 'user' && canRecall(message)">
                  <el-button text size="small" class="message-action-btn">
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="{action: 'copy', message}">复制消息</el-dropdown-item>
                      <el-dropdown-item :command="{action: 'recall', message}" v-if="canRecall(message)">撤回消息</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              
              <div class="message-bubble">
                <!-- 图片消息 -->
                <div v-if="message.type === 'image' && message.imageUrl" class="message-image">
                  <el-image
                    :src="message.imageUrl"
                    :preview-src-list="[message.imageUrl]"
                    fit="cover"
                    style="max-width: 300px; max-height: 300px; border-radius: 8px; cursor: pointer;"
                  />
                </div>
                <!-- 文本消息 -->
                <div class="message-text" v-html="formatMessageContent(message.content)"></div>
                
                <!-- 消息状态 -->
                <div class="message-status" v-if="message.sender === 'user'">
                  <el-icon v-if="message.isRead" class="read-icon" title="已读"><Check /></el-icon>
                  <el-icon v-else class="sent-icon" title="已发送"><CircleCheck /></el-icon>
                  <span v-if="message.recalled" class="recalled-text">已撤回</span>
                </div>
              </div>
            </div>
          </div>
          </template>
        </div>
        
        <!-- 输入区域 -->
        <div class="chat-input-area">
          <!-- 表情选择器 -->
          <div class="emoji-picker-container" v-if="showEmojiPicker">
            <div class="emoji-grid">
              <span 
                v-for="emoji in emojis" 
                :key="emoji"
                class="emoji-item"
                @click="insertEmoji(emoji)"
              >
                {{ emoji }}
              </span>
            </div>
          </div>
          
          <div class="input-toolbar">
            <el-button text circle @click="showEmojiPicker = !showEmojiPicker" title="表情">
              <el-icon><ChatDotSquare /></el-icon>
            </el-button>
            <el-upload
              :action="''"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleImageSelect"
              accept="image/*"
            >
              <el-button text circle title="发送图片">
                <el-icon><Picture /></el-icon>
              </el-button>
            </el-upload>
          </div>
          
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="3"
            placeholder="输入消息，按 Ctrl+Enter 发送..."
            @keydown.ctrl.enter="sendMessage"
            @keydown.enter.exact="handleEnterKey"
            maxlength="1000"
            show-word-limit
            class="message-input"
            ref="inputRef"
          />
          
          <div class="input-actions">
            <el-button 
              type="primary" 
              @click="sendMessage" 
              :disabled="!canSend || sending"
              :loading="sending"
            >
              <el-icon><Position /></el-icon>
              发送
            </el-button>
            <el-button @click="clearInput">
              <el-icon><Delete /></el-icon>
              清空
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { 
  ChatLineRound, Position, Delete, Search, MoreFilled, 
  Check, CircleCheck, ChatDotSquare, Picture 
} from '@element-plus/icons-vue'

const userStore = useUserStore()
const currentUser = computed(() => userStore.user)

const messagesContainerRef = ref(null)
const inputRef = ref(null)
const inputMessage = ref('')
const sending = ref(false)
const messages = ref([])
const unreadCount = ref(0)
const refreshInterval = ref(null)
const searchKeyword = ref('')
const showEmojiPicker = ref(false)
const highlightMessageId = ref(null)
const selectedImage = ref(null)

// 常用表情
const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', 
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', 
  '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👏', '🙌', '🤲']

const canSend = computed(() => {
  return (inputMessage.value.trim().length > 0 || selectedImage.value) && !sending.value
})

// 过滤后的消息
const filteredMessages = computed(() => {
  if (!searchKeyword.value) return messages.value
  
  const keyword = searchKeyword.value.toLowerCase()
  return messages.value.filter(msg => 
    msg.content.toLowerCase().includes(keyword)
  )
})

// 按日期分组的消息
const groupedMessages = computed(() => {
  const groups = {}
  const msgs = searchKeyword.value ? filteredMessages.value : messages.value
  
  msgs.forEach(msg => {
    const date = new Date(msg.createTime).toDateString()
    if (!groups[date]) {
      groups[date] = {
        date,
        messages: []
      }
    }
    groups[date].messages.push(msg)
  })
  
  return Object.values(groups)
})

// 加载消息
const loadMessages = () => {
  try {
    if (!currentUser.value?.id) {
      messages.value = []
      unreadCount.value = 0
      return
    }
    
    const allMessages = JSON.parse(localStorage.getItem('realtime_chat_messages') || '[]')
    const currentUserIdStr = String(currentUser.value.id)
    
    // 过滤当前用户的消息（确保类型一致）
    messages.value = allMessages
      .filter(msg => String(msg.userId) === currentUserIdStr)
      .sort((a, b) => new Date(a.createTime) - new Date(b.createTime))
    
    // 计算未读消息（管理员发送但用户未读的）
    unreadCount.value = messages.value.filter(msg => 
      msg.sender === 'admin' && !msg.isRead
    ).length
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    console.error('加载消息失败:', error)
  }
}

// 保存消息
const saveMessage = (message) => {
  try {
    const allMessages = JSON.parse(localStorage.getItem('realtime_chat_messages') || '[]')
    allMessages.push(message)
    localStorage.setItem('realtime_chat_messages', JSON.stringify(allMessages))
  } catch (error) {
    console.error('保存消息失败:', error)
  }
}

// 发送消息
const sendMessage = async () => {
  if (!canSend.value) return
  
  if (!currentUser.value) {
    ElMessage.warning('请先登录')
    return
  }
  
  sending.value = true
  
  try {
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.value.id,
      username: currentUser.value.username,
      sender: 'user',
      type: selectedImage.value ? 'image' : 'text',
      content: selectedImage.value ? '' : inputMessage.value.trim(),
      imageUrl: selectedImage.value,
      createTime: new Date().toISOString(),
      isRead: false,
      recalled: false
    }
    
    saveMessage(newMessage)
    
    // 立即刷新消息列表
    loadMessages()
    
    inputMessage.value = ''
    selectedImage.value = null
    showEmojiPicker.value = false
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
    
    ElMessage.success('消息已发送')
  } catch (error) {
    ElMessage.error('发送失败，请稍后重试')
    console.error('发送消息失败:', error)
  } finally {
    sending.value = false
  }
}

// 标记消息为已读
const markAsRead = () => {
  try {
    if (!currentUser.value?.id) return
    
    const allMessages = JSON.parse(localStorage.getItem('realtime_chat_messages') || '[]')
    const currentUserIdStr = String(currentUser.value.id)
    let updated = false
    
    allMessages.forEach(msg => {
      if (String(msg.userId) === currentUserIdStr && msg.sender === 'admin' && !msg.isRead) {
        msg.isRead = true
        updated = true
      }
    })
    
    if (updated) {
      localStorage.setItem('realtime_chat_messages', JSON.stringify(allMessages))
      unreadCount.value = 0
    }
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainerRef.value) {
    messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight
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

// 处理 Enter 键
const handleEnterKey = (event) => {
  // 如果是 Ctrl+Enter，不做处理，让默认行为触发
  if (event.ctrlKey) {
    return
  }
  // 普通 Enter 不发送，需要 Ctrl+Enter
  event.preventDefault()
}

// 格式化消息内容（支持换行和链接）
const formatMessageContent = (content) => {
  if (!content) return ''
  // 处理换行
  let formatted = content.replace(/\n/g, '<br>')
  // 处理URL链接
  const urlRegex = /(https?:\/\/[^\s]+)/g
  formatted = formatted.replace(urlRegex, '<a href="$1" target="_blank" style="color: #409eff;">$1</a>')
  return formatted
}

// 格式化日期
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return '今天'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天'
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
    }
  } catch (error) {
    return dateString
  }
}

// 插入表情
const insertEmoji = (emoji) => {
  if (inputRef.value) {
    const textarea = inputRef.value.$el.querySelector('textarea')
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      inputMessage.value = 
        inputMessage.value.substring(0, start) + 
        emoji + 
        inputMessage.value.substring(end)
      nextTick(() => {
        textarea.focus()
        textarea.setSelectionRange(start + emoji.length, start + emoji.length)
      })
    }
  }
}

// 选择图片
const handleImageSelect = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    selectedImage.value = e.target.result
    showEmojiPicker.value = false
  }
  reader.readAsDataURL(file.raw)
}

// 清空输入
const clearInput = () => {
  inputMessage.value = ''
  selectedImage.value = null
}

// 检查是否可以撤回（2分钟内）
const canRecall = (message) => {
  if (message.sender !== 'user' || message.recalled) return false
  const messageTime = new Date(message.createTime)
  const now = new Date()
  const diff = now - messageTime
  return diff < 120000 // 2分钟
}

// 显示消息菜单
const showMessageMenu = (event, message) => {
  // 右键菜单已通过dropdown实现
}

// 处理消息操作
const handleMessageCommand = ({ action, message }) => {
  if (action === 'copy') {
    navigator.clipboard.writeText(message.content).then(() => {
      ElMessage.success('消息已复制')
    }).catch(() => {
      ElMessage.error('复制失败')
    })
  } else if (action === 'recall') {
    recallMessage(message)
  }
}

// 撤回消息
const recallMessage = (message) => {
  ElMessageBox.confirm(
    '确定要撤回这条消息吗？',
    '确认撤回',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    try {
      const allMessages = JSON.parse(localStorage.getItem('realtime_chat_messages') || '[]')
      const msgIndex = allMessages.findIndex(msg => msg.id === message.id)
      if (msgIndex !== -1) {
        allMessages[msgIndex].recalled = true
        allMessages[msgIndex].content = '[消息已撤回]'
        localStorage.setItem('realtime_chat_messages', JSON.stringify(allMessages))
        
        const localIndex = messages.value.findIndex(msg => msg.id === message.id)
        if (localIndex !== -1) {
          messages.value[localIndex].recalled = true
          messages.value[localIndex].content = '[消息已撤回]'
        }
        
        ElMessage.success('消息已撤回')
      }
    } catch (error) {
      ElMessage.error('撤回失败')
      console.error('撤回消息失败:', error)
    }
  }).catch(() => {})
}

// 处理头部命令
const handleHeaderCommand = (command) => {
  if (command === 'export') {
    exportMessages()
  } else if (command === 'clear') {
    clearMessages()
  }
}

// 导出聊天记录
const exportMessages = () => {
  try {
    const exportData = {
      exportTime: new Date().toLocaleString('zh-CN'),
      user: currentUser.value?.username || '未知用户',
      totalMessages: messages.value.length,
      messages: messages.value.map(msg => ({
        时间: formatTime(msg.createTime),
        发送者: msg.sender === 'user' ? '我' : '管理员',
        内容: msg.recalled ? '[消息已撤回]' : msg.content,
        类型: msg.type || 'text'
      }))
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `聊天记录_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    ElMessage.success('聊天记录已导出')
  } catch (error) {
    ElMessage.error('导出失败')
    console.error('导出失败:', error)
  }
}

// 清空消息记录
const clearMessages = () => {
  ElMessageBox.confirm(
    '确定要清空所有聊天记录吗？此操作不可恢复。',
    '确认清空',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    try {
      if (!currentUser.value?.id) return
      
      const allMessages = JSON.parse(localStorage.getItem('realtime_chat_messages') || '[]')
      const currentUserIdStr = String(currentUser.value.id)
      const filteredMessages = allMessages.filter(msg => String(msg.userId) !== currentUserIdStr)
      localStorage.setItem('realtime_chat_messages', JSON.stringify(filteredMessages))
      messages.value = []
      unreadCount.value = 0
      searchKeyword.value = ''
      ElMessage.success('聊天记录已清空')
    } catch (error) {
      ElMessage.error('清空失败')
      console.error('清空消息失败:', error)
    }
  }).catch(() => {})
}

// 自动刷新消息（每1.5秒，确保实时性）
const startAutoRefresh = () => {
  refreshInterval.value = setInterval(() => {
    loadMessages()
  }, 1500) // 缩短到1.5秒，提高实时性
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

// 页面可见性变化时立即刷新
const handleVisibilityChange = () => {
  if (!document.hidden) {
    loadMessages()
    markAsRead()
  }
}

// 窗口焦点变化时立即刷新
const handleFocus = () => {
  loadMessages()
  markAsRead()
}

onMounted(() => {
  loadMessages()
  markAsRead()
  startAutoRefresh()
  
  // 监听页面可见性变化
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // 监听窗口焦点变化
  window.addEventListener('focus', handleFocus)
})

onUnmounted(() => {
  stopAutoRefresh()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', handleFocus)
})

// 监听消息变化，自动滚动到底部
watch(() => messages.value.length, () => {
  nextTick(() => {
    scrollToBottom()
  })
})

// 监听未读消息数变化，有新消息时自动滚动
watch(() => unreadCount.value, (newVal, oldVal) => {
  if (newVal > oldVal && newVal > 0) {
    // 有新未读消息，滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  }
})
</script>

<style lang="scss" scoped>
.realtime-chat {
  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #409eff;
    font-weight: bold;
    
    .header-icon {
      font-size: 18px;
    }
    
    .header-actions {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .unread-badge {
      margin-left: 0;
    }
  }
  
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 600px;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .chat-messages {
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
          position: relative;
          
          .message-sender {
            font-weight: 500;
            color: #606266;
          }
          
          .message-time {
            color: #909399;
          }
          
          .message-action-btn {
            margin-left: auto;
            opacity: 0;
            transition: opacity 0.2s;
          }
        }
        
        &:hover .message-action-btn {
          opacity: 1;
        }
        
        .message-bubble {
          padding: 12px 16px;
          word-wrap: break-word;
          word-break: break-all;
          position: relative;
          
          .message-image {
            margin-bottom: 4px;
          }
          
          .message-text {
            line-height: 1.6;
            white-space: pre-wrap;
            
            :deep(a) {
              color: #409eff;
              text-decoration: none;
              
              &:hover {
                text-decoration: underline;
              }
            }
          }
          
          .message-status {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-top: 4px;
            font-size: 12px;
            
            .read-icon {
              color: #67c23a;
              font-size: 14px;
            }
            
            .sent-icon {
              color: #909399;
              font-size: 14px;
            }
            
            .recalled-text {
              color: #909399;
              font-style: italic;
            }
          }
        }
        
        &.message-highlight {
          animation: highlight 2s ease-in-out;
        }
        
        .date-divider {
          display: flex;
          align-items: center;
          margin: 20px 0;
          font-size: 12px;
          color: #909399;
          
          .divider-line {
            flex: 1;
            height: 1px;
            background: #ebeef5;
          }
          
          .divider-text {
            padding: 0 12px;
          }
        }
      }
    }
  }
  
  .chat-input-area {
    border-top: 1px solid #ebeef5;
    padding: 16px;
    background: #fff;
    position: relative;
    
    .emoji-picker-container {
      position: absolute;
      bottom: 100%;
      left: 0;
      right: 0;
      background: #fff;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 8px;
      max-height: 200px;
      overflow-y: auto;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      z-index: 10;
      
      .emoji-grid {
        display: grid;
        grid-template-columns: repeat(10, 1fr);
        gap: 4px;
        
        .emoji-item {
          font-size: 20px;
          padding: 4px;
          cursor: pointer;
          text-align: center;
          border-radius: 4px;
          transition: background 0.2s;
          
          &:hover {
            background: #f5f7fa;
          }
        }
      }
    }
    
    .input-toolbar {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }
    
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

@keyframes highlight {
  0%, 100% {
    background: transparent;
  }
  50% {
    background: #fff3cd;
  }
}
</style>

