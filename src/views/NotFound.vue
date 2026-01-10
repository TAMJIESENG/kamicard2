<template>
  <div class="not-found-page">
    <div class="background-decoration">
      <div class="decoration-shape shape-1"></div>
      <div class="decoration-shape shape-2"></div>
    </div>
    
    <div class="content-container">
      <div class="error-illustration">
        <div class="error-code">
          <span class="digit">4</span>
          <span class="digit zero">
            <div class="zero-inner"></div>
          </span>
          <span class="digit">4</span>
        </div>
      </div>
      
      <div class="error-content">
        <h1 class="error-title">页面未找到</h1>
        <p class="error-description">
          抱歉，您访问的页面不存在或已被移除。
          <br/>
          请检查网址是否正确，或返回首页继续浏览。
        </p>
        
        <div class="action-buttons">
          <el-button type="primary" size="large" @click="goHome" class="home-btn">
            <el-icon><HomeFilled /></el-icon>
            返回首页
          </el-button>
          <el-button size="large" @click="goBack" class="back-btn">
            <el-icon><Back /></el-icon>
            返回上页
          </el-button>
        </div>
        
        <div class="quick-links">
          <span class="links-label">快速访问：</span>
          <router-link to="/login" class="quick-link">登录</router-link>
          <span class="divider">•</span>
          <router-link to="/register" class="quick-link">注册</router-link>
          <span class="divider">•</span>
          <router-link to="/dashboard" class="quick-link">工作台</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { HomeFilled, Back } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style lang="scss" scoped>
.not-found-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 40px 20px;
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
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%);
  
  &.shape-1 {
    width: 500px;
    height: 500px;
    top: -200px;
    right: -200px;
    animation: float 10s ease-in-out infinite;
  }
  
  &.shape-2 {
    width: 400px;
    height: 400px;
    bottom: -150px;
    left: -150px;
    animation: float 12s ease-in-out infinite reverse;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
  }
  50% {
    transform: translateY(-30px) translateX(15px);
  }
}

.content-container {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 600px;
}

.error-illustration {
  margin-bottom: 40px;
}

.error-code {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  
  .digit {
    font-size: 120px;
    font-weight: 800;
    color: #1e293b;
    line-height: 1;
    text-shadow: 4px 4px 0 rgba(37, 99, 235, 0.1);
    
    &.zero {
      width: 100px;
      height: 120px;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      animation: bounce 2s ease-in-out infinite;
      
      .zero-inner {
        width: 40px;
        height: 50px;
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        border-radius: 50%;
      }
    }
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.error-content {
  .error-title {
    font-size: 32px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 16px 0;
  }
  
  .error-description {
    font-size: 16px;
    color: #64748b;
    line-height: 1.7;
    margin: 0 0 32px 0;
  }
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
  
  .home-btn {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    border: none;
    font-weight: 600;
    padding: 12px 28px;
    border-radius: 10px;
    
    &:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);
    }
  }
  
  .back-btn {
    background: white;
    border: 2px solid #e5e7eb;
    color: #374151;
    font-weight: 600;
    padding: 10px 26px;
    border-radius: 10px;
    
    &:hover {
      border-color: #d1d5db;
      background: #f9fafb;
      transform: translateY(-1px);
    }
  }
}

.quick-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  
  .links-label {
    color: #6b7280;
    font-size: 14px;
  }
  
  .quick-link {
    color: #2563eb;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.2s ease;
    
    &:hover {
      color: #1d4ed8;
      text-decoration: underline;
    }
  }
  
  .divider {
    color: #d1d5db;
    font-size: 12px;
  }
}

@media (max-width: 640px) {
  .error-code {
    gap: 8px;
    
    .digit {
      font-size: 80px;
      
      &.zero {
        width: 70px;
        height: 80px;
        
        .zero-inner {
          width: 28px;
          height: 35px;
        }
      }
    }
  }
  
  .error-content {
    .error-title {
      font-size: 24px;
    }
    
    .error-description {
      font-size: 14px;
    }
  }
  
  .action-buttons {
    flex-direction: column;
    
    .home-btn,
    .back-btn {
      width: 100%;
    }
  }
}
</style>
