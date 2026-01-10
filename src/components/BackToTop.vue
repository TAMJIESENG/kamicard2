<template>
  <transition name="fade-slide">
    <div 
      v-show="visible" 
      class="back-to-top"
      @click="scrollToTop"
      :title="'返回顶部'"
    >
      <el-icon :size="20"><ArrowUp /></el-icon>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ArrowUp } from '@element-plus/icons-vue'

const props = defineProps({
  visibilityHeight: {
    type: Number,
    default: 300
  },
  smooth: {
    type: Boolean,
    default: true
  }
})

const visible = ref(false)

const handleScroll = () => {
  visible.value = window.scrollY > props.visibilityHeight
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: props.smooth ? 'smooth' : 'auto'
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="scss" scoped>
.back-to-top {
  position: fixed;
  right: 24px;
  bottom: 80px;
  z-index: 999;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);
  }
  
  &:active {
    transform: translateY(-2px);
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 768px) {
  .back-to-top {
    right: 16px;
    bottom: 70px;
    width: 40px;
    height: 40px;
  }
}
</style>
