<template>
  <div class="empty-state" :class="[`empty-${size}`]">
    <div class="empty-illustration">
      <slot name="icon">
        <div class="default-icon">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="38" stroke="#e5e7eb" stroke-width="2" stroke-dasharray="4 4"/>
            <path d="M28 32h24v4H28v-4zm0 8h16v4H28v-4zm0 8h20v4H28v-4z" fill="#d1d5db"/>
            <circle cx="56" cy="56" r="12" fill="#f3f4f6" stroke="#e5e7eb" stroke-width="2"/>
            <path d="M52 56h8M56 52v8" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </slot>
    </div>
    
    <div class="empty-content">
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-description">{{ description }}</p>
    </div>
    
    <div class="empty-actions" v-if="$slots.actions || actionText">
      <slot name="actions">
        <el-button type="primary" @click="$emit('action')">
          {{ actionText }}
        </el-button>
      </slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '暂无数据'
  },
  description: {
    type: String,
    default: '当前没有可显示的内容'
  },
  actionText: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['small', 'default', 'large'].includes(value)
  }
})

defineEmits(['action'])
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  
  &.empty-small {
    padding: 32px 16px;
    
    .default-icon svg {
      width: 60px;
      height: 60px;
    }
    
    .empty-title {
      font-size: 16px;
    }
    
    .empty-description {
      font-size: 13px;
    }
  }
  
  &.empty-large {
    padding: 80px 32px;
    
    .default-icon svg {
      width: 120px;
      height: 120px;
    }
    
    .empty-title {
      font-size: 24px;
    }
    
    .empty-description {
      font-size: 16px;
    }
  }
}

.empty-illustration {
  margin-bottom: 24px;
  
  .default-icon {
    opacity: 0.8;
    animation: float 3s ease-in-out infinite;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.empty-content {
  max-width: 320px;
  
  .empty-title {
    font-size: 18px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 8px 0;
  }
  
  .empty-description {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
    line-height: 1.6;
  }
}

.empty-actions {
  margin-top: 24px;
}
</style>
