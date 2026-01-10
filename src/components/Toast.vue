<template>
  <transition-group name="toast-slide" tag="div" class="toast-container">
    <div 
      v-for="toast in toasts" 
      :key="toast.id"
      class="toast-item"
      :class="[`toast-${toast.type}`]"
    >
      <div class="toast-icon">
        <el-icon v-if="toast.type === 'success'"><SuccessFilled /></el-icon>
        <el-icon v-else-if="toast.type === 'error'"><CircleCloseFilled /></el-icon>
        <el-icon v-else-if="toast.type === 'warning'"><WarningFilled /></el-icon>
        <el-icon v-else><InfoFilled /></el-icon>
      </div>
      <div class="toast-content">
        <div class="toast-title" v-if="toast.title">{{ toast.title }}</div>
        <div class="toast-message">{{ toast.message }}</div>
      </div>
      <button class="toast-close" @click="removeToast(toast.id)">
        <el-icon><Close /></el-icon>
      </button>
    </div>
  </transition-group>
</template>

<script setup>
import { ref } from 'vue'
import { SuccessFilled, CircleCloseFilled, WarningFilled, InfoFilled, Close } from '@element-plus/icons-vue'

const toasts = ref([])
let toastId = 0

const addToast = (options) => {
  const id = ++toastId
  const toast = {
    id,
    type: options.type || 'info',
    title: options.title || '',
    message: options.message || '',
    duration: options.duration || 3000
  }
  
  toasts.value.push(toast)
  
  if (toast.duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, toast.duration)
  }
  
  return id
}

const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// 暴露方法供外部使用
defineExpose({
  success: (message, title) => addToast({ type: 'success', message, title }),
  error: (message, title) => addToast({ type: 'error', message, title }),
  warning: (message, title) => addToast({ type: 'warning', message, title }),
  info: (message, title) => addToast({ type: 'info', message, title }),
  remove: removeToast
})
</script>

<style lang="scss" scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 380px;
}

.toast-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  border-left: 4px solid;
  
  &.toast-success {
    border-left-color: #10b981;
    
    .toast-icon {
      color: #10b981;
      background: rgba(16, 185, 129, 0.1);
    }
  }
  
  &.toast-error {
    border-left-color: #ef4444;
    
    .toast-icon {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }
  }
  
  &.toast-warning {
    border-left-color: #f59e0b;
    
    .toast-icon {
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.1);
    }
  }
  
  &.toast-info {
    border-left-color: #2563eb;
    
    .toast-icon {
      color: #2563eb;
      background: rgba(37, 99, 235, 0.1);
    }
  }
}

.toast-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.toast-content {
  flex: 1;
  min-width: 0;
  
  .toast-title {
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 4px;
    font-size: 14px;
  }
  
  .toast-message {
    color: #6b7280;
    font-size: 13px;
    line-height: 1.5;
  }
}

.toast-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
    color: #6b7280;
  }
}

// 动画
.toast-slide-enter-active {
  animation: slideIn 0.3s ease-out;
}

.toast-slide-leave-active {
  animation: slideOut 0.3s ease-in;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

@media (max-width: 640px) {
  .toast-container {
    left: 20px;
    right: 20px;
    max-width: none;
  }
}
</style>
