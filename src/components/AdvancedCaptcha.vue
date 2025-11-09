<template>
  <div class="advanced-captcha">
    <!-- 验证模式选择 -->
    <div class="captcha-mode-indicator">
      <span class="mode-badge">
        <svg v-if="currentMode === 'slider'" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
        <svg v-else-if="currentMode === 'click'" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
        </svg>
        {{ modeText }}
      </span>
      <span v-if="failCount > 0" class="fail-indicator">失败 {{ failCount }} 次</span>
    </div>

    <!-- 滑动拼图模式 -->
    <div v-show="currentMode === 'slider'" class="captcha-container slider-mode">
      <canvas 
        ref="puzzleCanvas" 
        class="puzzle-canvas"
        :width="canvasWidth" 
        :height="canvasHeight"
      ></canvas>
      <canvas 
        ref="blockCanvas" 
        class="block-canvas"
        :class="{ 'with-rotation': blockRotation !== 0 }"
        :width="blockSize * 1.5" 
        :height="canvasHeight"
        :style="{ 
          left: blockX + 'px',
          transform: `rotate(${blockRotation}deg)`
        }"
      ></canvas>
      <div class="loading-overlay" v-if="loading">
        <div class="loading-spinner"></div>
        <p>正在生成验证码...</p>
      </div>
      
      <!-- 时间提示 -->
      <div class="time-indicator" :class="{ 'warning': elapsedTime > 10 }">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
        </svg>
        {{ elapsedTime }}s
      </div>
    </div>

    <!-- 点击验证模式 -->
    <div v-show="currentMode === 'click'" class="captcha-container click-mode">
      <canvas 
        ref="clickCanvas" 
        class="click-canvas"
        :width="canvasWidth" 
        :height="canvasHeight"
        @click="handleCanvasClick"
      ></canvas>
      <div class="click-marks">
        <div 
          v-for="(mark, index) in clickMarks" 
          :key="index"
          class="click-mark"
          :style="{ left: mark.x + 'px', top: mark.y + 'px' }"
        >
          {{ index + 1 }}
        </div>
      </div>
      <div class="click-instruction">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
        {{ clickInstruction }}
      </div>
      <div class="loading-overlay" v-if="loading">
        <div class="loading-spinner"></div>
        <p>正在生成验证码...</p>
      </div>
    </div>

    <!-- 计算验证模式 -->
    <div v-show="currentMode === 'calculate'" class="captcha-container calculate-mode">
      <div class="calculate-content">
        <div class="calculate-question">
          <span class="question-text">{{ calculateQuestion }}</span>
          <span class="equals">=</span>
          <input 
            v-model="calculateAnswer" 
            type="number" 
            class="calculate-input"
            placeholder="?"
            @keyup.enter="verifyCalculate"
          />
        </div>
        <div class="calculate-hint">请计算上述算式的结果</div>
      </div>
    </div>

    <!-- 滑块轨道（仅滑动模式） -->
    <div v-show="currentMode === 'slider'" class="slider-track">
      <div class="slider-bg">
        <div 
          class="slider-fill" 
          :style="{ width: sliderWidth + 'px' }"
        ></div>
      </div>
      <div 
        class="slider-handle" 
        :class="{ 
          'dragging': isDragging, 
          'success': isSuccess,
          'failed': isFailed 
        }"
        :style="{ left: sliderWidth + 'px' }"
        @mousedown="startDrag"
        @touchstart="startDrag"
      >
        <svg v-if="!isSuccess && !isFailed" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
        </svg>
        <svg v-else-if="isSuccess" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </div>
      <div class="slider-text">
        <span v-if="!isSuccess && !isFailed">{{ sliderText }}</span>
        <span v-else-if="isSuccess" class="success-text">✓ 验证成功</span>
        <span v-else class="failed-text">✗ 验证失败</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="captcha-actions">
      <button 
        v-if="currentMode === 'click'" 
        type="button" 
        class="action-btn verify-btn"
        @click="verifyClick"
        :disabled="clickMarks.length < clickTargetCount || loading"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        验证
      </button>
      
      <button 
        v-if="currentMode === 'calculate'" 
        type="button" 
        class="action-btn verify-btn"
        @click="verifyCalculate"
        :disabled="!calculateAnswer || loading"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        确认
      </button>
      
      <button 
        type="button" 
        class="action-btn refresh-btn" 
        @click="refreshCaptcha"
        :disabled="loading"
        title="刷新验证码"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>
        刷新
      </button>
      
      <button 
        type="button" 
        class="action-btn switch-btn" 
        @click="switchMode"
        :disabled="loading"
        title="切换验证方式"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
        </svg>
        换一个
      </button>
    </div>

    <!-- 轨迹分析调试信息（开发模式） -->
    <div v-if="showDebugInfo && trajectoryAnalysis" class="debug-info">
      <div class="debug-item">
        <span>轨迹点数:</span>
        <span>{{ trajectoryAnalysis.pointCount }}</span>
      </div>
      <div class="debug-item">
        <span>总时间:</span>
        <span>{{ trajectoryAnalysis.totalTime }}ms</span>
      </div>
      <div class="debug-item">
        <span>平滑度:</span>
        <span :class="{'text-success': trajectoryAnalysis.smoothness > 0.7}">
          {{ (trajectoryAnalysis.smoothness * 100).toFixed(0) }}%
        </span>
      </div>
      <div class="debug-item">
        <span>位置准确度:</span>
        <span :class="{'text-success': trajectoryAnalysis.accuracy > 0.9}">
          {{ (trajectoryAnalysis.accuracy * 100).toFixed(0) }}%
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'

const emit = defineEmits(['success', 'fail'])
const props = defineProps({
  showDebugInfo: {
    type: Boolean,
    default: false
  }
})

// Canvas 相关
const puzzleCanvas = ref()
const blockCanvas = ref()
const clickCanvas = ref()
const canvasWidth = 320
const canvasHeight = 160
const blockSize = 50
const blockRadius = 8
const tolerance = 8

// 验证模式
const modes = ['slider', 'click', 'calculate']
const currentMode = ref('slider')
const failCount = ref(0)

// 滑块相关
const sliderWidth = ref(0)
const isDragging = ref(false)
const isSuccess = ref(false)
const isFailed = ref(false)
const loading = ref(false)
const sliderText = ref('向右拖动滑块完成验证')

// 拼图相关
const blockX = ref(0)
const blockY = ref(0)
const correctX = ref(0)
const blockRotation = ref(0) // 新增：拼图块旋转角度
const blockScale = ref(1) // 新增：拼图块缩放
const puzzleShape = ref(0)
const shapeParams = ref({})

// 轨迹验证相关
const dragTrajectory = ref([])
const startTime = ref(0)
const elapsedTime = ref(0)
const timerInterval = ref(null)
const trajectoryAnalysis = ref(null)

// 点击验证相关
const clickMarks = ref([])
const clickTargets = ref([])
const clickTargetCount = ref(3)
const clickInstruction = ref('')

// 计算验证相关
const calculateQuestion = ref('')
const calculateAnswer = ref('')
const calculateCorrectAnswer = ref(0)

// 模式文本
const modeText = computed(() => {
  switch (currentMode.value) {
    case 'slider': return '滑动拼图验证'
    case 'click': return '点击验证'
    case 'calculate': return '计算验证'
    default: return '验证'
  }
})

// 生成更复杂的随机背景
const generateComplexBackground = (ctx, width, height) => {
  // 增加更多背景类型
  const backgroundTypes = [
    'particles', 'waves', 'maze', 'circuit', 'hexagon', 
    'noise', 'fractal', 'grid', 'spiral', 'bubbles',
    'lightning', 'stars', 'mosaic', 'wave-interference'
  ]
  const bgType = backgroundTypes[Math.floor(Math.random() * backgroundTypes.length)]
  
  // 更丰富的颜色主题
  const colorThemes = [
    ['#667eea', '#764ba2'], ['#f093fb', '#f5576c'], ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'], ['#fa709a', '#fee140'], ['#30cfd0', '#330867'],
    ['#a8edea', '#fed6e3'], ['#ff9a9e', '#fecfef'], ['#ffecd2', '#fcb69f'],
    ['#ff6e7f', '#bfe9ff'], ['#e0c3fc', '#8ec5fc'], ['#f093fb', '#f5576c']
  ]
  const theme = colorThemes[Math.floor(Math.random() * colorThemes.length)]
  
  // 基础渐变背景
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, theme[0])
  gradient.addColorStop(1, theme[1])
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  // 根据类型添加特殊效果
  switch (bgType) {
    case 'particles':
      // 粒子效果
      for (let i = 0; i < 100; i++) {
        ctx.beginPath()
        ctx.arc(
          Math.random() * width, 
          Math.random() * height, 
          Math.random() * 3 + 1,
          0, Math.PI * 2
        )
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.6})`
        ctx.fill()
      }
      break
      
    case 'lightning':
      // 闪电效果
      ctx.strokeStyle = `rgba(255, 255, 255, 0.4)`
      ctx.lineWidth = 2
      for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        let x = Math.random() * width
        let y = 0
        ctx.moveTo(x, y)
        
        while (y < height) {
          x += (Math.random() - 0.5) * 40
          y += Math.random() * 30 + 10
          ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      break
      
    case 'spiral':
      // 螺旋效果
      ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`
      ctx.lineWidth = 1.5
      const centerX = width / 2
      const centerY = height / 2
      
      for (let s = 0; s < 3; s++) {
        ctx.beginPath()
        for (let angle = 0; angle < Math.PI * 8; angle += 0.1) {
          const radius = angle * 3
          const x = centerX + radius * Math.cos(angle + s * Math.PI * 2 / 3)
          const y = centerY + radius * Math.sin(angle + s * Math.PI * 2 / 3)
          if (angle === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      break
      
    case 'mosaic':
      // 马赛克效果
      const mosaicSize = 15
      for (let x = 0; x < width; x += mosaicSize) {
        for (let y = 0; y < height; y += mosaicSize) {
          if (Math.random() > 0.5) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`
            ctx.fillRect(x, y, mosaicSize - 1, mosaicSize - 1)
          }
        }
      }
      break
  }
  
  // 添加密集干扰线条
  for (let i = 0; i < 15; i++) {
    ctx.beginPath()
    ctx.moveTo(Math.random() * width, Math.random() * height)
    ctx.lineTo(Math.random() * width, Math.random() * height)
    ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.random() * 0.4})`
    ctx.lineWidth = Math.random() * 2
    ctx.stroke()
  }
  
  // 添加密集噪点
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const size = Math.random() * 3 + 1
    ctx.fillStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.random() * 0.7})`
    ctx.fillRect(x, y, size, size)
  }
}

// 创建超复杂的拼图形状
const createComplexPuzzlePath = (ctx, x, y, size, useStoredShape = false) => {
  let puzzleType, r, params
  
  if (useStoredShape && shapeParams.value.puzzleType !== undefined) {
    puzzleType = shapeParams.value.puzzleType
    r = shapeParams.value.r
    params = shapeParams.value.params
  } else {
    // 增加到10种拼图类型
    puzzleType = Math.floor(Math.random() * 10)
    r = blockRadius + Math.random() * 4 - 2
    
    // 生成随机参数
    params = {
      bumps: [],
      indents: [],
      vertices: []
    }
    
    // 生成多个凸起和凹陷
    const bumpCount = 2 + Math.floor(Math.random() * 3)
    for (let i = 0; i < bumpCount; i++) {
      params.bumps.push({
        size: size * (0.1 + Math.random() * 0.15),
        pos: 0.2 + Math.random() * 0.6,
        side: Math.floor(Math.random() * 4) // 0:上, 1:右, 2:下, 3:左
      })
    }
    
    const indentCount = 1 + Math.floor(Math.random() * 2)
    for (let i = 0; i < indentCount; i++) {
      params.indents.push({
        size: size * (0.08 + Math.random() * 0.12),
        pos: 0.2 + Math.random() * 0.6,
        side: Math.floor(Math.random() * 4)
      })
    }
    
    shapeParams.value = { puzzleType, r, params }
    puzzleShape.value = puzzleType
  }
  
  ctx.beginPath()
  
  // 根据类型绘制不同的复杂形状
  switch (puzzleType) {
    case 0: // 多凸起拼图
      drawMultiBumpShape(ctx, x, y, size, r, params)
      break
    case 1: // 星形拼图
      drawStarShape(ctx, x, y, size, params)
      break
    case 2: // 齿轮状拼图
      drawGearShape(ctx, x, y, size, params)
      break
    case 3: // 云朵状拼图
      drawCloudShape(ctx, x, y, size, params)
      break
    case 4: // 拼图锁扣形
      drawJigsawShape(ctx, x, y, size, r, params)
      break
    case 5: // 六边形变体
      drawHexagonShape(ctx, x, y, size, params)
      break
    case 6: // 心形
      drawHeartShape(ctx, x, y, size)
      break
    case 7: // 闪电形
      drawLightningShape(ctx, x, y, size, params)
      break
    case 8: // 叶子形
      drawLeafShape(ctx, x, y, size, params)
      break
    case 9: // 不规则多边形
      drawIrregularPolygon(ctx, x, y, size, params)
      break
  }
}

// 绘制各种复杂形状的辅助函数
const drawMultiBumpShape = (ctx, x, y, size, r, params) => {
  ctx.moveTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  
  // 顶部可能有凸起或凹陷
  let currentX = x + r
  params.bumps.filter(b => b.side === 0).forEach(bump => {
    const pos = x + size * bump.pos
    ctx.lineTo(pos - bump.size, y)
    ctx.arc(pos, y - bump.size, bump.size, 0, Math.PI, false)
    ctx.lineTo(pos + bump.size, y)
  })
  
  params.indents.filter(i => i.side === 0).forEach(indent => {
    const pos = x + size * indent.pos
    ctx.lineTo(pos - indent.size, y)
    ctx.arc(pos, y + indent.size, indent.size, Math.PI, 0, true)
    ctx.lineTo(pos + indent.size, y)
  })
  
  ctx.lineTo(x + size - r, y)
  ctx.arcTo(x + size, y, x + size, y + r, r)
  
  // 右侧
  currentX = y + r
  params.bumps.filter(b => b.side === 1).forEach(bump => {
    const pos = y + size * bump.pos
    ctx.lineTo(x + size, pos - bump.size)
    ctx.arc(x + size + bump.size, pos, bump.size, Math.PI, 0, false)
    ctx.lineTo(x + size, pos + bump.size)
  })
  
  ctx.lineTo(x + size, y + size - r)
  ctx.arcTo(x + size, y + size, x + size - r, y + size, r)
  ctx.lineTo(x + r, y + size)
  ctx.arcTo(x, y + size, x, y + size - r, r)
  ctx.closePath()
}

const drawStarShape = (ctx, x, y, size, params) => {
  const points = 5 + Math.floor(Math.random() * 3)
  const centerX = x + size / 2
  const centerY = y + size / 2
  const outerRadius = size / 2
  const innerRadius = outerRadius * 0.5
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = (i * Math.PI) / points
    const px = centerX + radius * Math.cos(angle - Math.PI / 2)
    const py = centerY + radius * Math.sin(angle - Math.PI / 2)
    
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
}

const drawGearShape = (ctx, x, y, size, params) => {
  const teeth = 6 + Math.floor(Math.random() * 4)
  const centerX = x + size / 2
  const centerY = y + size / 2
  const radius = size / 2
  const toothHeight = radius * 0.2
  
  for (let i = 0; i < teeth; i++) {
    const angle1 = (i * 2 * Math.PI) / teeth
    const angle2 = ((i + 0.4) * 2 * Math.PI) / teeth
    const angle3 = ((i + 0.6) * 2 * Math.PI) / teeth
    const angle4 = ((i + 1) * 2 * Math.PI) / teeth
    
    const r1 = radius - toothHeight
    const r2 = radius
    
    if (i === 0) {
      ctx.moveTo(centerX + r1 * Math.cos(angle1), centerY + r1 * Math.sin(angle1))
    }
    
    ctx.lineTo(centerX + r1 * Math.cos(angle2), centerY + r1 * Math.sin(angle2))
    ctx.lineTo(centerX + r2 * Math.cos(angle2), centerY + r2 * Math.sin(angle2))
    ctx.lineTo(centerX + r2 * Math.cos(angle3), centerY + r2 * Math.sin(angle3))
    ctx.lineTo(centerX + r1 * Math.cos(angle3), centerY + r1 * Math.sin(angle3))
    ctx.lineTo(centerX + r1 * Math.cos(angle4), centerY + r1 * Math.sin(angle4))
  }
  ctx.closePath()
}

const drawCloudShape = (ctx, x, y, size, params) => {
  const circles = [
    { x: x + size * 0.25, y: y + size * 0.5, r: size * 0.25 },
    { x: x + size * 0.5, y: y + size * 0.3, r: size * 0.3 },
    { x: x + size * 0.75, y: y + size * 0.5, r: size * 0.25 }
  ]
  
  ctx.moveTo(x, y + size * 0.5)
  circles.forEach((circle, i) => {
    ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2, false)
  })
  ctx.closePath()
}

const drawJigsawShape = (ctx, x, y, size, r, params) => {
  // 经典拼图形状，但更复杂
  const tabSize = size * 0.2
  const tabDepth = size * 0.15
  
  ctx.moveTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  
  // 顶部拼图扣
  const topTab = size * 0.5
  ctx.lineTo(x + topTab - tabSize, y)
  ctx.bezierCurveTo(
    x + topTab - tabSize, y - tabDepth,
    x + topTab + tabSize, y - tabDepth,
    x + topTab + tabSize, y
  )
  
  ctx.lineTo(x + size - r, y)
  ctx.arcTo(x + size, y, x + size, y + r, r)
  
  // 右侧拼图扣
  const rightTab = size * 0.5
  ctx.lineTo(x + size, y + rightTab - tabSize)
  ctx.bezierCurveTo(
    x + size + tabDepth, y + rightTab - tabSize,
    x + size + tabDepth, y + rightTab + tabSize,
    x + size, y + rightTab + tabSize
  )
  
  ctx.lineTo(x + size, y + size - r)
  ctx.arcTo(x + size, y + size, x + size - r, y + size, r)
  ctx.lineTo(x + r, y + size)
  ctx.arcTo(x, y + size, x, y + size - r, r)
  ctx.closePath()
}

const drawHexagonShape = (ctx, x, y, size, params) => {
  const centerX = x + size / 2
  const centerY = y + size / 2
  const radius = size / 2
  
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3
    const px = centerX + radius * Math.cos(angle)
    const py = centerY + radius * Math.sin(angle)
    
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
}

const drawHeartShape = (ctx, x, y, size) => {
  const centerX = x + size / 2
  const topY = y + size * 0.3
  
  ctx.moveTo(centerX, topY + size * 0.5)
  
  ctx.bezierCurveTo(
    centerX, topY,
    centerX - size / 2, topY,
    centerX - size / 2, topY + size * 0.3
  )
  
  ctx.bezierCurveTo(
    centerX - size / 2, topY + size * 0.5,
    centerX, topY + size * 0.7,
    centerX, topY + size * 0.8
  )
  
  ctx.bezierCurveTo(
    centerX, topY + size * 0.7,
    centerX + size / 2, topY + size * 0.5,
    centerX + size / 2, topY + size * 0.3
  )
  
  ctx.bezierCurveTo(
    centerX + size / 2, topY,
    centerX, topY,
    centerX, topY + size * 0.5
  )
  
  ctx.closePath()
}

const drawLightningShape = (ctx, x, y, size, params) => {
  ctx.moveTo(x + size * 0.4, y)
  ctx.lineTo(x + size * 0.6, y)
  ctx.lineTo(x + size * 0.3, y + size * 0.5)
  ctx.lineTo(x + size * 0.5, y + size * 0.5)
  ctx.lineTo(x + size * 0.2, y + size)
  ctx.lineTo(x + size * 0.45, y + size * 0.6)
  ctx.lineTo(x + size * 0.3, y + size * 0.6)
  ctx.closePath()
}

const drawLeafShape = (ctx, x, y, size, params) => {
  const centerX = x + size / 2
  const centerY = y + size / 2
  
  ctx.moveTo(centerX, y)
  ctx.quadraticCurveTo(x + size, centerY, centerX, y + size)
  ctx.quadraticCurveTo(x, centerY, centerX, y)
  ctx.closePath()
}

const drawIrregularPolygon = (ctx, x, y, size, params) => {
  const sides = 5 + Math.floor(Math.random() * 4)
  const centerX = x + size / 2
  const centerY = y + size / 2
  const baseRadius = size / 2
  
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides
    const radiusVariation = 0.6 + Math.random() * 0.8
    const radius = baseRadius * radiusVariation
    const px = centerX + radius * Math.cos(angle)
    const py = centerY + radius * Math.sin(angle)
    
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
}

// 初始化滑动拼图
const initSliderPuzzle = () => {
  if (!puzzleCanvas.value || !blockCanvas.value) return
  
  loading.value = true
  elapsedTime.value = 0
  
  setTimeout(() => {
    const puzzleCtx = puzzleCanvas.value.getContext('2d')
    const blockCtx = blockCanvas.value.getContext('2d')
    
    puzzleCtx.clearRect(0, 0, canvasWidth, canvasHeight)
    blockCtx.clearRect(0, 0, blockSize * 1.5, canvasHeight)
    
    // 生成随机位置和旋转角度
    const minX = 40
    const maxX = canvasWidth - blockSize - 70
    const minY = 15
    const maxY = canvasHeight - blockSize - 25
    
    correctX.value = minX + Math.random() * (maxX - minX)
    blockY.value = minY + Math.random() * (maxY - minY)
    
    // 根据失败次数增加难度
    if (failCount.value > 2) {
      blockRotation.value = (Math.random() - 0.5) * 30 // -15到15度旋转
    } else {
      blockRotation.value = 0
    }
    
    if (failCount.value > 4) {
      blockScale.value = 0.8 + Math.random() * 0.4 // 0.8到1.2倍缩放
    } else {
      blockScale.value = 1
    }
    
    // 生成背景
    generateComplexBackground(puzzleCtx, canvasWidth, canvasHeight)
    
    // 保存拼图块区域
    const imageData = puzzleCtx.getImageData(correctX.value, blockY.value, blockSize, blockSize)
    
    // 创建缺口
    puzzleCtx.save()
    puzzleCtx.globalCompositeOperation = 'destination-out'
    createComplexPuzzlePath(puzzleCtx, correctX.value, blockY.value, blockSize)
    puzzleCtx.fill()
    puzzleCtx.restore()
    
    // 绘制缺口边框
    puzzleCtx.save()
    puzzleCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
    puzzleCtx.lineWidth = 2
    puzzleCtx.shadowColor = 'rgba(0, 0, 0, 0.4)'
    puzzleCtx.shadowBlur = 4
    createComplexPuzzlePath(puzzleCtx, correctX.value, blockY.value, blockSize, true)
    puzzleCtx.stroke()
    puzzleCtx.restore()
    
    // 绘制拼图块
    blockCtx.save()
    blockCtx.putImageData(imageData, 0, blockY.value)
    blockCtx.globalCompositeOperation = 'destination-in'
    createComplexPuzzlePath(blockCtx, 0, blockY.value, blockSize, true)
    blockCtx.fill()
    blockCtx.restore()
    
    // 添加拼图块边框和阴影
    blockCtx.save()
    blockCtx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
    blockCtx.lineWidth = 2
    blockCtx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    blockCtx.shadowBlur = 8
    createComplexPuzzlePath(blockCtx, 0, blockY.value, blockSize, true)
    blockCtx.stroke()
    blockCtx.restore()
    
    loading.value = false
    startTimer()
  }, 300)
}

// 初始化点击验证
const initClickCaptcha = () => {
  if (!clickCanvas.value) return
  
  loading.value = true
  clickMarks.value = []
  clickTargets.value = []
  
  setTimeout(() => {
    const ctx = clickCanvas.value.getContext('2d')
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    
    // 生成背景
    generateComplexBackground(ctx, canvasWidth, canvasHeight)
    
    // 根据失败次数增加目标数量
    clickTargetCount.value = 3 + Math.min(failCount.value, 3)
    
    // 生成随机文字或图标作为目标
    const chars = '春夏秋冬梅兰竹菊天地人和'
    const targetChars = []
    for (let i = 0; i < clickTargetCount.value; i++) {
      targetChars.push(chars[Math.floor(Math.random() * chars.length)])
    }
    
    clickInstruction.value = `请依次点击：${targetChars.join(' → ')}`
    
    // 在画布上随机放置字符
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    const allChars = chars.split('')
    const positions = []
    
    // 先放置目标字符
    targetChars.forEach(char => {
      let x, y, overlap
      do {
        overlap = false
        x = 30 + Math.random() * (canvasWidth - 60)
        y = 30 + Math.random() * (canvasHeight - 60)
        
        for (const pos of positions) {
          const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2)
          if (distance < 40) {
            overlap = true
            break
          }
        }
      } while (overlap)
      
      positions.push({ x, y, char, isTarget: true })
      clickTargets.value.push({ x, y, char })
    })
    
    // 添加干扰字符
    for (let i = 0; i < 8; i++) {
      const char = allChars[Math.floor(Math.random() * allChars.length)]
      let x, y, overlap
      
      do {
        overlap = false
        x = 30 + Math.random() * (canvasWidth - 60)
        y = 30 + Math.random() * (canvasHeight - 60)
        
        for (const pos of positions) {
          const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2)
          if (distance < 35) {
            overlap = true
            break
          }
        }
      } while (overlap)
      
      positions.push({ x, y, char, isTarget: false })
    }
    
    // 绘制所有字符
    positions.forEach(pos => {
      ctx.save()
      ctx.fillStyle = pos.isTarget ? '#3b82f6' : '#6b7280'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 3
      ctx.fillText(pos.char, pos.x, pos.y)
      ctx.restore()
    })
    
    loading.value = false
    startTimer()
  }, 300)
}

// 初始化计算验证
const initCalculateCaptcha = () => {
  loading.value = true
  calculateAnswer.value = ''
  
  setTimeout(() => {
    // 根据失败次数增加难度
    const difficulty = Math.min(failCount.value, 5)
    
    let num1, num2, operator, question
    
    if (difficulty < 2) {
      // 简单加减法
      num1 = Math.floor(Math.random() * 50) + 1
      num2 = Math.floor(Math.random() * 50) + 1
      operator = Math.random() > 0.5 ? '+' : '-'
      
      if (operator === '+') {
        calculateCorrectAnswer.value = num1 + num2
      } else {
        if (num1 < num2) [num1, num2] = [num2, num1]
        calculateCorrectAnswer.value = num1 - num2
      }
      
      question = `${num1} ${operator} ${num2}`
    } else if (difficulty < 4) {
      // 中等：包含乘法
      num1 = Math.floor(Math.random() * 12) + 1
      num2 = Math.floor(Math.random() * 12) + 1
      const operators = ['+', '-', '×']
      operator = operators[Math.floor(Math.random() * operators.length)]
      
      switch (operator) {
        case '+':
          calculateCorrectAnswer.value = num1 + num2
          break
        case '-':
          if (num1 < num2) [num1, num2] = [num2, num1]
          calculateCorrectAnswer.value = num1 - num2
          break
        case '×':
          calculateCorrectAnswer.value = num1 * num2
          break
      }
      
      question = `${num1} ${operator} ${num2}`
    } else {
      // 困难：两步运算
      const num3 = Math.floor(Math.random() * 10) + 1
      num1 = Math.floor(Math.random() * 20) + 1
      num2 = Math.floor(Math.random() * 10) + 1
      
      const op1 = Math.random() > 0.5 ? '+' : '×'
      const op2 = Math.random() > 0.5 ? '+' : '-'
      
      if (op1 === '×') {
        const temp = num1 * num2
        calculateCorrectAnswer.value = op2 === '+' ? temp + num3 : temp - num3
        question = `${num1} × ${num2} ${op2} ${num3}`
      } else {
        const temp = num1 + num2
        calculateCorrectAnswer.value = op2 === '+' ? temp + num3 : temp - num3
        question = `${num1} + ${num2} ${op2} ${num3}`
      }
    }
    
    calculateQuestion.value = question
    loading.value = false
    startTimer()
  }, 200)
}

// 启动计时器
const startTimer = () => {
  startTime.value = Date.now()
  elapsedTime.value = 0
  
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  
  timerInterval.value = setInterval(() => {
    elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000)
  }, 1000)
}

// 停止计时器
const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

// 轨迹分析
const analyzeTrajectory = (trajectory) => {
  if (trajectory.length < 3) {
    return {
      pointCount: trajectory.length,
      totalTime: 0,
      smoothness: 0,
      accuracy: 0,
      isHuman: false
    }
  }
  
  const totalTime = trajectory[trajectory.length - 1].time - trajectory[0].time
  const pointCount = trajectory.length
  
  // 计算轨迹平滑度（检查速度变化）
  let speedChanges = 0
  for (let i = 1; i < trajectory.length - 1; i++) {
    const speed1 = Math.abs(trajectory[i].x - trajectory[i - 1].x) / (trajectory[i].time - trajectory[i - 1].time + 1)
    const speed2 = Math.abs(trajectory[i + 1].x - trajectory[i].x) / (trajectory[i + 1].time - trajectory[i].time + 1)
    const speedChange = Math.abs(speed2 - speed1)
    speedChanges += speedChange
  }
  
  const avgSpeedChange = speedChanges / (trajectory.length - 2)
  const smoothness = 1 / (1 + avgSpeedChange) // 速度变化越小，平滑度越高
  
  // 人类行为特征：
  // 1. 时间应该在合理范围内（不能太快也不能太慢）
  // 2. 轨迹点数应该足够（人类滑动会产生多个采样点）
  // 3. 平滑度应该在合理范围（人类滑动不会完全匀速，但也不会跳跃太大）
  
  const timeScore = totalTime > 300 && totalTime < 10000 ? 1 : 0.5
  const pointScore = pointCount > 10 ? 1 : pointCount / 10
  const smoothScore = smoothness > 0.5 ? 1 : smoothness / 0.5
  
  const accuracy = (timeScore + pointScore + smoothScore) / 3
  const isHuman = accuracy > 0.6 && smoothness > 0.3
  
  return {
    pointCount,
    totalTime,
    smoothness,
    accuracy,
    isHuman
  }
}

// 开始拖动
const startDrag = (e) => {
  if (isSuccess.value || loading.value || isFailed.value) return
  
  e.preventDefault()
  isDragging.value = true
  dragTrajectory.value = []
  
  const startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
  const startSliderWidth = sliderWidth.value
  const startDragTime = Date.now()
  
  // 记录起始点
  dragTrajectory.value.push({
    x: startSliderWidth,
    time: 0
  })
  
  const handleMove = (moveE) => {
    if (!isDragging.value) return
    
    moveE.preventDefault()
    const currentX = moveE.type.includes('touch') ? moveE.touches[0].clientX : moveE.clientX
    const deltaX = currentX - startX
    const newWidth = Math.max(0, Math.min(canvasWidth - blockSize, startSliderWidth + deltaX))
    
    sliderWidth.value = newWidth
    blockX.value = newWidth
    
    // 记录轨迹点
    dragTrajectory.value.push({
      x: newWidth,
      time: Date.now() - startDragTime
    })
  }
  
  const handleEnd = (endE) => {
    if (!isDragging.value) return
    
    endE?.preventDefault()
    isDragging.value = false
    stopTimer()
    
    checkSliderResult()
    
    document.removeEventListener('mousemove', handleMove, { passive: false })
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchmove', handleMove, { passive: false })
    document.removeEventListener('touchend', handleEnd)
  }
  
  document.addEventListener('mousemove', handleMove, { passive: false })
  document.addEventListener('mouseup', handleEnd)
  document.addEventListener('touchmove', handleMove, { passive: false })
  document.addEventListener('touchend', handleEnd)
}

// 检查滑动结果
const checkSliderResult = () => {
  const distance = Math.abs(blockX.value - correctX.value)
  
  // 分析轨迹
  trajectoryAnalysis.value = analyzeTrajectory(dragTrajectory.value)
  
  // 综合判断
  const positionCorrect = distance <= tolerance
  const trajectoryValid = trajectoryAnalysis.value.isHuman
  const timeValid = elapsedTime.value >= 1 && elapsedTime.value <= 30
  
  if (positionCorrect && trajectoryValid && timeValid) {
    // 验证成功
    isSuccess.value = true
    isFailed.value = false
    sliderText.value = '验证成功'
    failCount.value = 0
    emit('success', {
      mode: 'slider',
      time: elapsedTime.value,
      trajectory: trajectoryAnalysis.value
    })
  } else {
    // 验证失败
    isFailed.value = true
    isSuccess.value = false
    failCount.value++
    
    let reason = ''
    if (!positionCorrect) reason = `位置偏差 ${Math.round(distance)}px`
    else if (!trajectoryValid) reason = '轨迹异常'
    else if (!timeValid) reason = '时间异常'
    
    sliderText.value = reason
    
    // 失败动画
    const slider = document.querySelector('.slider-handle')
    if (slider) {
      slider.style.animation = 'shake 0.5s ease-in-out'
      setTimeout(() => {
        slider.style.animation = ''
      }, 500)
    }
    
    setTimeout(() => {
      sliderWidth.value = 0
      blockX.value = 0
      isFailed.value = false
      sliderText.value = '向右拖动滑块完成验证'
      emit('fail', { mode: 'slider', reason })
      
      // 连续失败3次后自动切换验证方式
      if (failCount.value >= 3 && failCount.value % 3 === 0) {
        setTimeout(() => {
          switchMode()
        }, 1000)
      }
    }, 1500)
  }
}

// 处理画布点击
const handleCanvasClick = (e) => {
  if (loading.value || clickMarks.value.length >= clickTargetCount.value) return
  
  const rect = clickCanvas.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  
  clickMarks.value.push({ x, y })
}

// 验证点击结果
const verifyClick = () => {
  if (clickMarks.value.length < clickTargetCount.value) {
    return
  }
  
  stopTimer()
  
  // 检查点击顺序和位置
  let correctCount = 0
  const errorMargin = 25
  
  for (let i = 0; i < clickTargetCount.value; i++) {
    const mark = clickMarks.value[i]
    const target = clickTargets.value[i]
    
    const distance = Math.sqrt((mark.x - target.x) ** 2 + (mark.y - target.y) ** 2)
    
    if (distance <= errorMargin) {
      correctCount++
    }
  }
  
  const timeValid = elapsedTime.value >= 2 && elapsedTime.value <= 30
  
  if (correctCount === clickTargetCount.value && timeValid) {
    isSuccess.value = true
    failCount.value = 0
    emit('success', {
      mode: 'click',
      time: elapsedTime.value,
      accuracy: correctCount / clickTargetCount.value
    })
    
    // 显示成功提示
    clickInstruction.value = '✓ 验证成功！'
  } else {
    failCount.value++
    emit('fail', {
      mode: 'click',
      reason: `正确 ${correctCount}/${clickTargetCount.value}`
    })
    
    clickInstruction.value = `✗ 只正确了 ${correctCount}/${clickTargetCount.value} 个`
    
    setTimeout(() => {
      refreshCaptcha()
    }, 2000)
  }
}

// 验证计算结果
const verifyCalculate = () => {
  if (!calculateAnswer.value) return
  
  stopTimer()
  
  const userAnswer = parseInt(calculateAnswer.value)
  const timeValid = elapsedTime.value >= 1 && elapsedTime.value <= 60
  
  if (userAnswer === calculateCorrectAnswer.value && timeValid) {
    isSuccess.value = true
    failCount.value = 0
    emit('success', {
      mode: 'calculate',
      time: elapsedTime.value
    })
  } else {
    failCount.value++
    emit('fail', {
      mode: 'calculate',
      reason: userAnswer !== calculateCorrectAnswer.value ? '答案错误' : '时间超时'
    })
    
    setTimeout(() => {
      refreshCaptcha()
    }, 2000)
  }
}

// 切换验证模式
const switchMode = () => {
  const currentIndex = modes.indexOf(currentMode.value)
  const nextIndex = (currentIndex + 1) % modes.length
  currentMode.value = modes[nextIndex]
  
  reset()
  initCaptcha()
}

// 刷新验证码
const refreshCaptcha = () => {
  reset()
  initCaptcha()
}

// 初始化验证码
const initCaptcha = () => {
  stopTimer()
  
  switch (currentMode.value) {
    case 'slider':
      initSliderPuzzle()
      break
    case 'click':
      initClickCaptcha()
      break
    case 'calculate':
      initCalculateCaptcha()
      break
  }
}

// 重置状态
const reset = () => {
  sliderWidth.value = 0
  blockX.value = 0
  isDragging.value = false
  isSuccess.value = false
  isFailed.value = false
  sliderText.value = '向右拖动滑块完成验证'
  clickMarks.value = []
  clickTargets.value = []
  calculateAnswer.value = ''
  dragTrajectory.value = []
  trajectoryAnalysis.value = null
  elapsedTime.value = 0
  stopTimer()
}

onMounted(() => {
  nextTick(() => {
    initCaptcha()
  })
})

onUnmounted(() => {
  stopTimer()
})

defineExpose({
  refresh: refreshCaptcha,
  reset,
  isSuccess: () => isSuccess.value,
  switchMode
})
</script>

<style lang="scss" scoped>
.advanced-captcha {
  width: 100%;
  user-select: none;
}

.captcha-mode-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.mode-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #3b82f6;
  
  svg {
    color: #3b82f6;
  }
}

.fail-indicator {
  font-size: 12px;
  color: #ef4444;
  font-weight: 600;
}

.captcha-container {
  position: relative;
  width: 320px;
  height: 160px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  margin-bottom: 16px;
  background: #f8fafc;
}

.puzzle-canvas,
.click-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.block-canvas {
  position: absolute;
  top: 0;
  transition: left 0.05s ease-out;
  transform-origin: center center;
  
  &.with-rotation {
    animation: subtleRotate 2s ease-in-out infinite;
  }
}

@keyframes subtleRotate {
  0%, 100% { transform: rotate(var(--rotation, 0deg)); }
  50% { transform: rotate(calc(var(--rotation, 0deg) + 2deg)); }
}

.time-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &.warning {
    background: #fef3c7;
    color: #d97706;
    animation: pulse 1s ease-in-out infinite;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.click-mode {
  cursor: pointer;
  
  &:hover {
    border-color: #3b82f6;
  }
}

.click-marks {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.click-mark {
  position: absolute;
  width: 32px;
  height: 32px;
  margin-left: -16px;
  margin-top: -16px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
  animation: clickMarkAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes clickMarkAppear {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.click-instruction {
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.calculate-mode {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.calculate-content {
  text-align: center;
  padding: 20px;
}

.calculate-question {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
}

.question-text {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.equals {
  font-size: 24px;
  color: #64748b;
}

.calculate-input {
  width: 80px;
  height: 48px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: #1e293b;
  background: white;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}

.calculate-hint {
  font-size: 13px;
  color: #6b7280;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  backdrop-filter: blur(4px);
  
  p {
    font-size: 13px;
    color: #6b7280;
    margin: 0;
  }
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.slider-track {
  position: relative;
  width: 320px;
  height: 44px;
  border-radius: 22px;
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  overflow: hidden;
  margin-bottom: 12px;
}

.slider-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.slider-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  transition: width 0.05s ease-out;
  border-radius: 22px;
  
  .success ~ & {
    background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  }
  
  .failed ~ & {
    background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
  }
}

.slider-handle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  z-index: 10;
  
  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  }
  
  &.dragging {
    cursor: grabbing;
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
  
  &.success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-color: #059669;
    color: white;
    cursor: default;
  }
  
  &.failed {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    border-color: #dc2626;
    color: white;
  }
}

.slider-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
  pointer-events: none;
  white-space: nowrap;
  
  .success-text {
    color: #10b981;
  }
  
  .failed-text {
    color: #ef4444;
  }
}

.captcha-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  &:hover:not(:disabled) {
    border-color: #3b82f6;
    color: #3b82f6;
    background: #f8fafc;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.verify-btn {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border-color: transparent;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      color: white;
    }
  }
  
  &.refresh-btn:hover:not(:disabled) {
    transform: rotate(90deg);
  }
}

.debug-info {
  margin-top: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 12px;
}

.debug-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  color: #64748b;
  
  span:first-child {
    font-weight: 600;
  }
  
  .text-success {
    color: #10b981;
    font-weight: 700;
  }
}

@keyframes shake {
  0%, 100% { transform: translateY(-50%) translateX(0); }
  25% { transform: translateY(-50%) translateX(-5px); }
  75% { transform: translateY(-50%) translateX(5px); }
}
</style>

