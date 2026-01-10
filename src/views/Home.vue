<template>
  <div class="home-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <!-- 导航栏 -->
    <header class="main-header">
      <nav class="nav-container">
        <div class="nav-brand" @click="$router.push('/')">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <path d="M8 10h8M8 14h5"/>
            </svg>
          </div>
          <span class="brand-text">CardKey<span class="brand-accent">Pro</span></span>
        </div>

        <div class="nav-links" v-if="!isLoggedIn">
          <a href="#features" @click.prevent="scrollTo('features')">功能</a>
          <a href="#stats" @click.prevent="scrollTo('stats')">数据</a>
          <a href="#advantages" @click.prevent="scrollTo('advantages')">优势</a>
        </div>

        <div class="nav-actions">
          <template v-if="!isLoggedIn">
            <el-button text @click="$router.push('/login')">登录</el-button>
            <el-button type="primary" @click="$router.push('/register')">免费开始</el-button>
          </template>
          <template v-else>
            <el-tooltip v-if="hasNewAnnouncements" content="有新公告" placement="bottom">
              <el-badge is-dot>
                <el-button :icon="Bell" circle @click="$router.push('/announcements')" />
              </el-badge>
            </el-tooltip>
            <el-button v-else :icon="Bell" circle @click="$router.push('/announcements')" />
            
            <el-dropdown @command="handleCommand">
              <div class="user-trigger">
                <el-avatar :size="36" :src="user?.avatar">
                  {{ user?.username?.charAt(0)?.toUpperCase() }}
                </el-avatar>
                <span class="user-name">{{ user?.username }}</span>
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="dashboard">
                    <el-icon><Monitor /></el-icon>工作台
                  </el-dropdown-item>
                  <el-dropdown-item command="cards">
                    <el-icon><ShoppingCart /></el-icon>卡密商城
                  </el-dropdown-item>
                  <el-dropdown-item command="coupon">
                    <el-icon><Ticket /></el-icon>领取优惠券
                  </el-dropdown-item>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>个人设置
                  </el-dropdown-item>
                  <el-dropdown-item v-if="showAiOption" command="ai">
                    <el-icon><ChatDotRound /></el-icon>AI 助手
                    <el-tag size="small" type="warning" style="margin-left:8px">VIP</el-tag>
                  </el-dropdown-item>
                  <el-dropdown-item command="contact">
                    <el-icon><Service /></el-icon>联系管理员
                  </el-dropdown-item>
                  <el-dropdown-item v-if="isAdmin" command="admin">
                    <el-icon><Tools /></el-icon>系统管理
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </div>
      </nav>
    </header>

    <!-- Hero 区域 -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <div class="hero-badge animate-fade-in" style="--delay: 0s">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            企业级卡密管理系统
          </div>
          
          <h1 class="hero-title animate-fade-in" style="--delay: 0.1s">
            安全可靠的<br/>
            <span class="gradient-text">数字卡密</span>管理方案
          </h1>
          
          <p class="hero-desc animate-fade-in" style="--delay: 0.2s">
            专为企业和开发者打造的专业卡密系统，提供完整的生成、分发、统计和管理功能。
          </p>

          <!-- 统计数据 -->
          <div class="hero-stats animate-fade-in" style="--delay: 0.3s">
            <div class="stat-item">
              <span class="stat-value counter" :data-target="stats.totalCards">{{ animatedCards }}</span>
              <span class="stat-label">累计卡密</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value counter" :data-target="stats.totalUsers">{{ animatedUsers }}</span>
              <span class="stat-label">活跃用户</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">99.9%</span>
              <span class="stat-label">可用性</span>
            </div>
          </div>

          <!-- CTA 按钮 -->
          <div class="hero-actions animate-fade-in" style="--delay: 0.4s">
            <template v-if="!isLoggedIn">
              <el-button type="primary" size="large" class="cta-btn" @click="$router.push('/register')">
                立即开始
                <el-icon><ArrowRight /></el-icon>
              </el-button>
              <el-button size="large" @click="$router.push('/login')">
                登录账户
              </el-button>
            </template>
            <template v-else>
              <el-button type="primary" size="large" class="cta-btn" @click="$router.push('/dashboard')">
                进入工作台
                <el-icon><ArrowRight /></el-icon>
              </el-button>
              <el-button v-if="isAdmin" size="large" @click="$router.push('/admin')">
                系统管理
              </el-button>
            </template>
          </div>
        </div>

        <!-- 右侧预览 - 实时安全监控面板 -->
        <div class="hero-visual animate-fade-in" style="--delay: 0.5s">
          <!-- 安全状态卡片 -->
          <div class="security-panel">
            <div class="panel-header">
              <div class="status-indicator online">
                <span class="pulse-ring"></span>
                <span class="status-dot"></span>
              </div>
              <span class="panel-title">系统安全状态</span>
              <span class="status-text">运行正常</span>
            </div>
            
            <!-- 实时指标 -->
            <div class="realtime-metrics">
              <div class="metric-item">
                <div class="metric-icon shield">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>
                <div class="metric-info">
                  <span class="metric-value">{{ securityStats.threatsBlocked }}</span>
                  <span class="metric-label">威胁已拦截</span>
                </div>
              </div>
              
              <div class="metric-item">
                <div class="metric-icon lock">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </div>
                <div class="metric-info">
                  <span class="metric-value">{{ securityStats.encryptedData }}</span>
                  <span class="metric-label">数据加密</span>
                </div>
              </div>
              
              <div class="metric-item">
                <div class="metric-icon server">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                </div>
                <div class="metric-info">
                  <span class="metric-value">{{ securityStats.uptime }}</span>
                  <span class="metric-label">系统运行</span>
                </div>
              </div>
            </div>
            
            <!-- 实时活动流 -->
            <div class="activity-stream">
              <div class="stream-header">
                <span class="live-badge">
                  <span class="live-dot"></span>
                  实时监控
                </span>
              </div>
              <div class="stream-list">
                <div 
                  v-for="(log, i) in securityLogs" 
                  :key="i" 
                  class="stream-item"
                  :class="log.type"
                >
                  <span class="stream-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path :d="log.iconPath"/>
                    </svg>
                  </span>
                  <span class="stream-text">{{ log.text }}</span>
                  <span class="stream-time">{{ log.time }}</span>
                </div>
              </div>
            </div>
            
            <!-- 安全认证徽章 -->
            <div class="security-badges">
              <div class="badge-item" title="SSL加密">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                </svg>
              </div>
              <div class="badge-item" title="数据加密">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </div>
              <div class="badge-item" title="DDoS防护">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div class="badge-item" title="24/7监控">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 数据统计展示区域 -->
    <section class="stats-showcase-section" id="stats" ref="statsSection">
      <div class="section-container">
        <div class="section-header" :class="{ 'animate-in': statsVisible }">
          <span class="section-badge">实时数据</span>
          <h2 class="section-title">平台运营数据</h2>
          <p class="section-desc">透明的数据展示，让您了解平台的真实运营状况</p>
        </div>

        <!-- KPI 卡片 -->
        <div class="kpi-grid">
          <div 
            v-for="(kpi, i) in kpiData" 
            :key="i" 
            class="kpi-card"
            :class="{ 'animate-in': statsVisible }"
            :style="{ '--delay': (i * 0.1) + 's' }"
          >
            <div class="kpi-icon" :style="{ background: kpi.bgColor }">
              <svg :viewBox="kpi.iconViewBox || '0 0 24 24'" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path :d="kpi.iconPath" />
              </svg>
            </div>
            <div class="kpi-content">
              <span class="kpi-value">{{ kpi.value }}</span>
              <span class="kpi-label">{{ kpi.label }}</span>
            </div>
            <div class="kpi-trend" :class="kpi.trend > 0 ? 'up' : 'down'">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path v-if="kpi.trend > 0" d="M7 14l5-5 5 5H7z"/>
                <path v-else d="M7 10l5 5 5-5H7z"/>
              </svg>
              {{ Math.abs(kpi.trend) }}%
            </div>
          </div>
        </div>

        <!-- 图表区域 -->
        <div class="charts-grid">
          <!-- 趋势图 -->
          <div class="chart-card" :class="{ 'animate-in': statsVisible }" style="--delay: 0.4s">
            <div class="chart-header">
              <h4>卡密生成趋势</h4>
              <div class="chart-legend">
                <span class="legend-item"><span class="dot primary"></span>本月</span>
                <span class="legend-item"><span class="dot secondary"></span>上月</span>
              </div>
            </div>
            <div class="chart-body">
              <svg viewBox="0 0 400 150" class="trend-chart">
                <!-- 网格线 -->
                <g class="grid-lines">
                  <line x1="40" y1="20" x2="380" y2="20" stroke="#E2E8F0" stroke-dasharray="4"/>
                  <line x1="40" y1="55" x2="380" y2="55" stroke="#E2E8F0" stroke-dasharray="4"/>
                  <line x1="40" y1="90" x2="380" y2="90" stroke="#E2E8F0" stroke-dasharray="4"/>
                  <line x1="40" y1="125" x2="380" y2="125" stroke="#E2E8F0"/>
                </g>
                <!-- Y轴标签 -->
                <g class="y-labels" fill="#64748B" font-size="10">
                  <text x="30" y="24" text-anchor="end">1000</text>
                  <text x="30" y="59" text-anchor="end">750</text>
                  <text x="30" y="94" text-anchor="end">500</text>
                  <text x="30" y="129" text-anchor="end">250</text>
                </g>
                <!-- 上月数据 (灰色) -->
                <path 
                  d="M40 100 L100 85 L160 95 L220 70 L280 80 L340 60 L380 75" 
                  fill="none" 
                  stroke="#CBD5E1" 
                  stroke-width="2"
                  class="chart-line-secondary"
                />
                <!-- 本月数据 (蓝色渐变) -->
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#2563EB" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="#2563EB" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <path 
                  d="M40 90 L100 65 L160 75 L220 45 L280 55 L340 30 L380 40 L380 125 L40 125 Z" 
                  fill="url(#areaGradient)"
                  class="chart-area"
                />
                <path 
                  d="M40 90 L100 65 L160 75 L220 45 L280 55 L340 30 L380 40" 
                  fill="none" 
                  stroke="#2563EB" 
                  stroke-width="2.5"
                  stroke-linecap="round"
                  class="chart-line-primary"
                />
                <!-- 数据点 -->
                <g class="data-points">
                  <circle cx="40" cy="90" r="4" fill="#2563EB"/>
                  <circle cx="100" cy="65" r="4" fill="#2563EB"/>
                  <circle cx="160" cy="75" r="4" fill="#2563EB"/>
                  <circle cx="220" cy="45" r="4" fill="#2563EB"/>
                  <circle cx="280" cy="55" r="4" fill="#2563EB"/>
                  <circle cx="340" cy="30" r="4" fill="#2563EB"/>
                  <circle cx="380" cy="40" r="4" fill="#2563EB"/>
                </g>
                <!-- X轴标签 -->
                <g class="x-labels" fill="#64748B" font-size="10">
                  <text x="40" y="142">周一</text>
                  <text x="100" y="142">周二</text>
                  <text x="160" y="142">周三</text>
                  <text x="220" y="142">周四</text>
                  <text x="280" y="142">周五</text>
                  <text x="340" y="142">周六</text>
                  <text x="380" y="142">周日</text>
                </g>
              </svg>
            </div>
          </div>

          <!-- 分类占比 -->
          <div class="chart-card" :class="{ 'animate-in': statsVisible }" style="--delay: 0.5s">
            <div class="chart-header">
              <h4>卡密类型分布</h4>
            </div>
            <div class="chart-body donut-chart-container">
              <svg viewBox="0 0 160 160" class="donut-chart">
                <circle cx="80" cy="80" r="60" fill="none" stroke="#E2E8F0" stroke-width="20"/>
                <circle cx="80" cy="80" r="60" fill="none" stroke="#2563EB" stroke-width="20" 
                  stroke-dasharray="188.5 377" stroke-dashoffset="0" class="donut-segment seg-1"/>
                <circle cx="80" cy="80" r="60" fill="none" stroke="#8B5CF6" stroke-width="20" 
                  stroke-dasharray="113.1 377" stroke-dashoffset="-188.5" class="donut-segment seg-2"/>
                <circle cx="80" cy="80" r="60" fill="none" stroke="#10B981" stroke-width="20" 
                  stroke-dasharray="75.4 377" stroke-dashoffset="-301.6" class="donut-segment seg-3"/>
                <text x="80" y="75" text-anchor="middle" fill="#1E293B" font-size="20" font-weight="700">{{ stats.totalCards || '0' }}</text>
                <text x="80" y="95" text-anchor="middle" fill="#64748B" font-size="11">总卡密</text>
              </svg>
              <div class="donut-legend">
                <div class="legend-row">
                  <span class="legend-color" style="background: #2563EB"></span>
                  <span class="legend-text">游戏卡密</span>
                  <span class="legend-value">50%</span>
                </div>
                <div class="legend-row">
                  <span class="legend-color" style="background: #8B5CF6"></span>
                  <span class="legend-text">软件授权</span>
                  <span class="legend-value">30%</span>
                </div>
                <div class="legend-row">
                  <span class="legend-color" style="background: #10B981"></span>
                  <span class="legend-text">会员充值</span>
                  <span class="legend-value">20%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 实时活动 -->
        <div class="activity-section" :class="{ 'animate-in': statsVisible }" style="--delay: 0.6s">
          <div class="activity-header">
            <h4>
              <span class="live-dot"></span>
              实时动态
            </h4>
          </div>
          <div class="activity-list">
            <div v-for="(activity, i) in recentActivities" :key="i" class="activity-item">
              <div class="activity-icon" :class="activity.type">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path :d="activity.iconPath"/>
                </svg>
              </div>
              <div class="activity-content">
                <span class="activity-text">{{ activity.text }}</span>
                <span class="activity-time">{{ activity.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能区域 -->
    <section class="features-section" id="features" ref="featuresSection">
      <div class="section-container">
        <div class="section-header" :class="{ 'animate-in': featuresVisible }">
          <span class="section-badge">核心功能</span>
          <h2 class="section-title">专业的卡密管理工具</h2>
          <p class="section-desc">集成完整的卡密生命周期管理，一站式解决您的业务需求</p>
        </div>

        <div class="features-grid">
          <div 
            v-for="(feature, i) in coreFeatures" 
            :key="i" 
            class="feature-card"
            :class="{ 'animate-in': featuresVisible }"
            :style="{ '--delay': (i * 0.1) + 's' }"
          >
            <div class="feature-icon">
              <el-icon :size="24"><component :is="feature.icon" /></el-icon>
            </div>
            <span class="feature-badge">{{ feature.badge }}</span>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.description }}</p>
            <div class="feature-tags">
              <span v-for="tag in feature.highlights" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 优势区域 -->
    <section class="advantages-section" id="advantages" ref="advantagesSection">
      <div class="section-container">
        <div class="advantages-grid">
          <div class="advantages-content" :class="{ 'animate-in': advantagesVisible }">
            <span class="section-badge">技术优势</span>
            <h2 class="section-title">为什么选择 CardKey Pro</h2>
            
            <div class="advantage-list">
              <div 
                v-for="(adv, i) in technicalAdvantages" 
                :key="i" 
                class="advantage-item"
                :class="{ 'animate-in': advantagesVisible }"
                :style="{ '--delay': (i * 0.1) + 's' }"
              >
                <div class="adv-icon">
                  <el-icon><component :is="adv.icon" /></el-icon>
                </div>
                <div class="adv-content">
                  <h4>{{ adv.title }}</h4>
                  <p>{{ adv.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="tech-stack-visual" :class="{ 'animate-in': advantagesVisible }" style="--delay: 0.3s">
            <div class="tech-grid">
              <div 
                v-for="(tech, i) in techStack" 
                :key="i" 
                class="tech-item"
                :class="{ 'animate-in': advantagesVisible }"
                :style="{ '--delay': (0.4 + i * 0.08) + 's' }"
              >
                <svg class="tech-icon" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                  <path :d="tech.iconPath" />
                </svg>
                <span class="tech-name">{{ tech.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="main-footer">
      <div class="footer-container">
        <div class="footer-top">
          <div class="footer-brand">
            <div class="brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <path d="M8 10h8M8 14h5"/>
              </svg>
            </div>
            <span class="brand-text">CardKey<span class="brand-accent">Pro</span></span>
          </div>
          <p class="footer-desc">企业级数字卡密管理系统，为您的业务提供安全可靠的解决方案。</p>
          <div class="footer-stats">
            <span>服务企业 500+</span>
            <span>•</span>
            <span>管理卡密 100万+</span>
          </div>
        </div>

        <div class="footer-links">
          <div class="link-group">
            <h4>产品功能</h4>
            <a href="#">卡密生成</a>
            <a href="#">批量管理</a>
            <a href="#">销售统计</a>
            <a href="#">API接口</a>
          </div>
          <div class="link-group">
            <h4>技术支持</h4>
            <a href="#">开发文档</a>
            <a href="#">API文档</a>
            <a href="#">常见问题</a>
            <a href="#">技术博客</a>
          </div>
          <div class="link-group">
            <h4>关于我们</h4>
            <a href="#">公司介绍</a>
            <a href="#">联系我们</a>
            <a href="#">隐私政策</a>
            <a href="#">服务条款</a>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; {{ new Date().getFullYear() }} CardKey Pro. All rights reserved.</p>
          <span class="footer-version">v2.1.0</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, markRaw, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { 
  ArrowDown, ArrowRight, User, Monitor, Tools, SwitchButton,
  Key, Lock, TrendCharts, Lightning, ShoppingCart, Bell, 
  ChatDotRound, Ticket, Service, Star, Phone
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const isAdmin = computed(() => userStore.isAdmin)
const user = computed(() => userStore.user)

// 动画相关
const featuresSection = ref(null)
const advantagesSection = ref(null)
const statsSection = ref(null)
const featuresVisible = ref(false)
const advantagesVisible = ref(false)
const statsVisible = ref(false)

// 数字动画
const animatedCards = ref(0)
const animatedUsers = ref(0)

const animateNumber = (target, current, setter) => {
  const duration = 1500
  const steps = 60
  const increment = target / steps
  let step = 0
  
  const timer = setInterval(() => {
    step++
    if (step >= steps) {
      setter(formatNumber(target))
      clearInterval(timer)
    } else {
      setter(formatNumber(Math.floor(increment * step)))
    }
  }, duration / steps)
}

// Intersection Observer 滚动动画
let observer = null

const setupObserver = () => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target === featuresSection.value) {
          featuresVisible.value = true
        } else if (entry.target === advantagesSection.value) {
          advantagesVisible.value = true
        } else if (entry.target === statsSection.value) {
          statsVisible.value = true
        }
      }
    })
  }, { threshold: 0.2 })
  
  if (featuresSection.value) observer.observe(featuresSection.value)
  if (advantagesSection.value) observer.observe(advantagesSection.value)
  if (statsSection.value) observer.observe(statsSection.value)
}

const showAiOption = computed(() => {
  if (!user.value) return false
  const userLevel = user.value.level
  if (userLevel !== 'VIP' && userLevel !== 'SVIP') return false
  const expireTime = user.value.vipExpireTime ? new Date(user.value.vipExpireTime) : null
  if (!expireTime || expireTime <= new Date()) return false
  try {
    const vipOrders = JSON.parse(localStorage.getItem('vip_orders') || '[]')
    return vipOrders.some(o => String(o.userId) === String(user.value.id) && o.status === 'completed' && o.packageType === 'yearly')
  } catch { return false }
})

const hasNewAnnouncements = computed(() => {
  try {
    const announcements = JSON.parse(localStorage.getItem('all_announcements') || '[]')
    const now = new Date()
    return announcements.some(a => {
      const diff = (now - new Date(a.createTime)) / (1000 * 60 * 60)
      return diff <= 24 && a.showOnHome
    })
  } catch { return false }
})

const stats = ref({ totalCards: 0, totalUsers: 0 })

// KPI 数据
const kpiData = computed(() => [
  {
    value: formatNumber(stats.value.totalCards) || '0',
    label: '累计卡密',
    trend: 12.5,
    bgColor: 'linear-gradient(135deg, #2563EB, #3B82F6)',
    iconPath: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z'
  },
  {
    value: formatNumber(stats.value.totalUsers) || '0',
    label: '活跃用户',
    trend: 8.3,
    bgColor: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
    iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
  },
  {
    value: '99.9%',
    label: '系统可用性',
    trend: 0.2,
    bgColor: 'linear-gradient(135deg, #10B981, #34D399)',
    iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    value: '24/7',
    label: '技术支持',
    trend: 0,
    bgColor: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
    iconPath: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z'
  }
])

// 实时活动数据
const recentActivities = ref([
  { type: 'purchase', text: '用户 张** 购买了 10 张游戏卡密', time: '刚刚', iconPath: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
  { type: 'register', text: '新用户 李** 完成注册', time: '2分钟前', iconPath: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
  { type: 'generate', text: '商家 王** 生成了 100 张卡密', time: '5分钟前', iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { type: 'vip', text: '用户 赵** 升级为 VIP 会员', time: '10分钟前', iconPath: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' }
])

// 安全统计数据
const securityStats = ref({
  threatsBlocked: '2.4K',
  encryptedData: '100%',
  uptime: '99.99%'
})

// 安全日志
const securityLogs = ref([
  { type: 'success', text: 'SSL证书验证通过', time: '刚刚', iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { type: 'info', text: '数据备份完成', time: '5分钟前', iconPath: 'M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z' },
  { type: 'warning', text: '异常登录已拦截', time: '12分钟前', iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  { type: 'success', text: 'DDoS防护已启用', time: '30分钟前', iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' }
])

// 实时更新安全日志
let securityLogInterval = null
const updateSecurityLogs = () => {
  const logTemplates = [
    { type: 'success', text: 'API请求验证通过', iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { type: 'info', text: '用户会话已刷新', iconPath: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
    { type: 'success', text: '数据完整性校验通过', iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { type: 'info', text: '防火墙规则已更新', iconPath: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    { type: 'success', text: '恶意请求已拦截', iconPath: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' }
  ]
  
  const randomLog = logTemplates[Math.floor(Math.random() * logTemplates.length)]
  securityLogs.value.unshift({ ...randomLog, time: '刚刚' })
  if (securityLogs.value.length > 4) {
    securityLogs.value.pop()
  }
  
  // 更新时间显示
  securityLogs.value.forEach((log, i) => {
    if (i === 0) return
    if (i === 1) log.time = '1分钟前'
    else if (i === 2) log.time = `${i * 3}分钟前`
    else log.time = `${i * 5}分钟前`
  })
}

// 实时更新活动数据
let activityInterval = null
const updateActivities = () => {
  const activityTemplates = [
    { type: 'purchase', text: '用户 陈** 购买了 5 张软件授权', iconPath: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
    { type: 'register', text: '新用户 周** 完成注册', iconPath: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
    { type: 'generate', text: '商家 吴** 生成了 50 张卡密', iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { type: 'vip', text: '用户 郑** 升级为 SVIP 会员', iconPath: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' }
  ]
  
  const randomActivity = activityTemplates[Math.floor(Math.random() * activityTemplates.length)]
  recentActivities.value.unshift({ ...randomActivity, time: '刚刚' })
  if (recentActivities.value.length > 4) {
    recentActivities.value.pop()
  }
  
  recentActivities.value.forEach((act, i) => {
    if (i === 0) return
    if (i === 1) act.time = '2分钟前'
    else if (i === 2) act.time = '5分钟前'
    else act.time = '10分钟前'
  })
}

const coreFeatures = ref([
  {
    icon: markRaw(Key),
    badge: '核心',
    title: '智能卡密生成',
    description: '支持多种算法的卡密批量生成，可自定义格式、长度和有效期。',
    highlights: ['批量生成', '自定义格式', '有效期管理']
  },
  {
    icon: markRaw(Lock),
    badge: '安全',
    title: '数据安全保障',
    description: '企业级安全架构，数据加密传输和存储，完整的权限控制。',
    highlights: ['数据加密', '权限控制', '操作审计']
  },
  {
    icon: markRaw(TrendCharts),
    badge: '分析',
    title: '业务数据分析',
    description: '实时统计分析，多维度数据报表，帮助您了解业务趋势。',
    highlights: ['实时统计', '多维分析', '趋势预测']
  },
  {
    icon: markRaw(ShoppingCart),
    badge: '商城',
    title: '在线卡密商城',
    description: '完善的在线购买系统，支持VIP会员折扣和优惠券。',
    highlights: ['在线购买', 'VIP折扣', '优惠券']
  }
])

const technicalAdvantages = ref([
  { icon: markRaw(Lightning), title: '高性能架构', description: '现代化前端技术栈，响应速度快，支持大规模并发' },
  { icon: markRaw(Lock), title: '银行级安全', description: '多层安全防护机制，数据加密传输，确保系统安全' },
  { icon: markRaw(Star), title: '灵活扩展', description: '模块化设计，支持业务定制和功能扩展' },
  { icon: markRaw(Phone), title: '专业服务', description: '完整的技术文档、API接口和专业技术支持' }
])

// 技术栈 - 使用 SVG 图标替代 emoji（遵循 UI/UX Pro Max 规范）
const techStack = ref([
  { 
    name: 'Vue 3',
    iconPath: 'M12 2L2 19h4l6-10.5L18 19h4L12 2z'
  },
  { 
    name: 'Vite',
    iconPath: 'M12 2l8.5 5v10L12 22l-8.5-5V7L12 2zm0 2.5L5.5 8v8l6.5 3.5 6.5-3.5V8L12 4.5z'
  },
  { 
    name: 'Element Plus',
    iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
  },
  { 
    name: 'JWT Auth',
    iconPath: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z'
  },
  { 
    name: 'Charts',
    iconPath: 'M3 13h2v8H3v-8zm4-6h2v14H7V7zm4-4h2v18h-2V3zm4 8h2v10h-2V11zm4-3h2v13h-2V8z'
  },
  { 
    name: 'Security',
    iconPath: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z'
  }
])

const formatNumber = (num) => num >= 10000 ? Math.floor(num / 1000) + 'K+' : num.toString()

const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

const handleCommand = (cmd) => {
  const routes = {
    dashboard: '/dashboard', cards: '/cards', coupon: '/coupon-claim',
    profile: '/profile', ai: '/ai-assistant', contact: '/contact', admin: '/admin'
  }
  if (cmd === 'logout') { userStore.logout(); router.push('/') }
  else if (routes[cmd]) router.push(routes[cmd])
}

const loadStats = () => {
  try {
    const cards = JSON.parse(localStorage.getItem('all_cards') || '[]')
    const users = JSON.parse(localStorage.getItem('all_users') || '[]')
    stats.value = { totalCards: cards.length, totalUsers: users.length }
    
    // 触发数字动画
    animateNumber(cards.length, 0, (v) => animatedCards.value = v)
    animateNumber(users.length, 0, (v) => animatedUsers.value = v)
  } catch {}
}

let interval
onMounted(() => {
  loadStats()
  interval = setInterval(loadStats, 30000)
  if (isLoggedIn.value) userStore.refreshCurrentUser()
  
  // 设置滚动动画观察器
  setTimeout(setupObserver, 100)
  
  // 启动实时更新
  securityLogInterval = setInterval(updateSecurityLogs, 8000)
  activityInterval = setInterval(updateActivities, 12000)
})

onUnmounted(() => {
  clearInterval(interval)
  clearInterval(securityLogInterval)
  clearInterval(activityInterval)
  if (observer) observer.disconnect()
})
</script>

<style lang="scss" scoped>
// 设计系统
$primary: #2563EB;
$primary-light: #3B82F6;
$secondary: #8B5CF6;
$text: #1E293B;
$text-muted: #64748B;
$border: #E2E8F0;
$bg: #F8FAFC;
$card-bg: rgba(255, 255, 255, 0.9);

// 动画关键帧
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes drawLine {
  from { stroke-dashoffset: 300; }
  to { stroke-dashoffset: 0; }
}

@keyframes barGrow {
  from { width: 0; }
  to { width: var(--w); }
}

// 动画类
.animate-fade-in {
  opacity: 0;
  animation: fadeInUp 0.8s ease-out forwards;
  animation-delay: var(--delay, 0s);
}

.animate-float {
  animation: float 4s ease-in-out infinite;
  animation-delay: 1s;
}

.animate-in {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.6s ease-out forwards;
  animation-delay: var(--delay, 0s);
}

.home-page {
  min-height: 100vh;
  background: linear-gradient(180deg, $bg 0%, #EEF2FF 100%);
  position: relative;
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
  opacity: 0.4;
  animation: pulse 8s ease-in-out infinite;
  
  &.orb-1 {
    width: 600px;
    height: 600px;
    background: linear-gradient(135deg, rgba($primary, 0.2), rgba($secondary, 0.15));
    top: -200px;
    right: -200px;
    animation-delay: 0s;
  }
  
  &.orb-2 {
    width: 500px;
    height: 500px;
    background: linear-gradient(135deg, rgba($secondary, 0.15), rgba($primary, 0.1));
    bottom: 0;
    left: -200px;
    animation-delay: 2s;
  }
  
  &.orb-3 {
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, rgba(#10B981, 0.1), rgba($primary, 0.08));
    top: 50%;
    left: 30%;
    animation-delay: 4s;
  }
}

// 导航栏 - 浮动设计
.main-header {
  position: sticky;
  top: 16px;
  z-index: 100;
  margin: 16px 24px 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba($border, 0.6);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover { transform: scale(1.02); }
  
  .brand-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, $primary, $secondary);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    
    svg { width: 20px; height: 20px; }
  }
  
  .brand-text {
    font-size: 22px;
    font-weight: 700;
    color: $text;
    
    .brand-accent { color: $primary; }
  }
}

.nav-links {
  display: flex;
  gap: 32px;
  
  a {
    color: $text-muted;
    text-decoration: none;
    font-weight: 500;
    font-size: 15px;
    transition: color 0.2s ease;
    position: relative;
    padding: 4px 0;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background: $primary;
      border-radius: 1px;
      transition: width 0.25s ease;
    }
    
    &:hover {
      color: $primary;
      
      &::after {
        width: 100%;
      }
    }
  }
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover { background: rgba($primary, 0.05); }
  
  .user-name {
    font-weight: 500;
    color: $text;
    font-size: 14px;
  }
}

// Hero 区域
.hero-section {
  position: relative;
  z-index: 1;
  padding: 60px 0 100px;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.hero-content {
  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba($primary, 0.1);
    color: $primary;
    border-radius: 24px;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 24px;
  }
  
  .hero-title {
    font-size: clamp(36px, 5vw, 52px);
    font-weight: 800;
    color: $text;
    line-height: 1.15;
    margin: 0 0 20px;
  }
  
  .gradient-text {
    background: linear-gradient(135deg, $primary, $secondary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .hero-desc {
    font-size: 18px;
    color: $text-muted;
    line-height: 1.7;
    margin: 0 0 32px;
    max-width: 480px;
  }
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
  padding: 20px 24px;
  background: $card-bg;
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba($border, 0.8);
}

.stat-item {
  text-align: center;
  
  .stat-value {
    display: block;
    font-size: 28px;
    font-weight: 700;
    color: $text;
  }
  
  .stat-label {
    font-size: 13px;
    color: $text-muted;
  }
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: $border;
}

.hero-actions {
  display: flex;
  gap: 12px;
  
  .el-button {
    padding: 12px 28px;
    font-weight: 600;
    border-radius: 12px;
    transition: all 0.25s ease;
    
    &:not(.el-button--primary) {
      border: 1px solid $border;
      
      &:hover {
        border-color: $primary;
        color: $primary;
        background: rgba($primary, 0.04);
      }
    }
  }
  
  .cta-btn {
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba($primary, 0.3);
    
    &:hover {
      box-shadow: 0 8px 24px rgba($primary, 0.4);
      transform: translateY(-2px);
    }
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width 0.5s ease, height 0.5s ease;
    }
    
    &:hover::after {
      width: 300px;
      height: 300px;
    }
  }
}

// 预览卡片
.hero-visual {
  display: flex;
  justify-content: center;
}

// 安全监控面板
.security-panel {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  border: 1px solid rgba($border, 0.5);
  
  .panel-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: linear-gradient(135deg, #10B981, #059669);
    color: white;
    
    .status-indicator {
      position: relative;
      width: 12px;
      height: 12px;
      
      .pulse-ring {
        position: absolute;
        inset: -4px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-radius: 50%;
        animation: pulseRing 2s ease-out infinite;
      }
      
      .status-dot {
        position: absolute;
        inset: 0;
        background: white;
        border-radius: 50%;
      }
    }
    
    .panel-title {
      flex: 1;
      font-size: 14px;
      font-weight: 600;
    }
    
    .status-text {
      font-size: 12px;
      padding: 4px 10px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
    }
  }
  
  .realtime-metrics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: $border;
    
    .metric-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 20px 12px;
      background: white;
      
      .metric-icon {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &.shield {
          background: rgba(#10B981, 0.1);
          color: #10B981;
        }
        
        &.lock {
          background: rgba($primary, 0.1);
          color: $primary;
        }
        
        &.server {
          background: rgba($secondary, 0.1);
          color: $secondary;
        }
      }
      
      .metric-info {
        text-align: center;
        
        .metric-value {
          display: block;
          font-size: 20px;
          font-weight: 700;
          color: $text;
        }
        
        .metric-label {
          font-size: 11px;
          color: $text-muted;
        }
      }
    }
  }
  
  .activity-stream {
    padding: 16px 20px;
    border-top: 1px solid $border;
    
    .stream-header {
      margin-bottom: 12px;
      
      .live-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 600;
        color: $text;
        
        .live-dot {
          width: 6px;
          height: 6px;
          background: #10B981;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }
      }
    }
    
    .stream-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .stream-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: $bg;
      border-radius: 10px;
      font-size: 12px;
      animation: slideIn 0.3s ease-out;
      
      &.success .stream-icon { color: #10B981; }
      &.info .stream-icon { color: $primary; }
      &.warning .stream-icon { color: #F59E0B; }
      
      .stream-icon {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      
      .stream-text {
        flex: 1;
        color: $text;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .stream-time {
        color: $text-muted;
        font-size: 10px;
        flex-shrink: 0;
      }
    }
  }
  
  .security-badges {
    display: flex;
    justify-content: center;
    gap: 12px;
    padding: 16px 20px;
    background: $bg;
    border-top: 1px solid $border;
    
    .badge-item {
      width: 36px;
      height: 36px;
      background: white;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: $primary;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        color: $secondary;
      }
    }
  }
}

@keyframes pulseRing {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// 数据统计展示区域
.stats-showcase-section {
  position: relative;
  z-index: 1;
  padding: 80px 0;
  background: white;
}

// KPI 卡片网格
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.kpi-card {
  background: $card-bg;
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba($border, 0.8);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.25s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.1);
    border-color: rgba($primary, 0.2);
    
    .kpi-icon {
      transform: scale(1.05);
    }
  }
  
  .kpi-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
    transition: transform 0.25s ease;
  }
  
  .kpi-content {
    flex: 1;
    min-width: 0;
    
    .kpi-value {
      display: block;
      font-size: 26px;
      font-weight: 700;
      color: $text;
      line-height: 1.2;
    }
    
    .kpi-label {
      font-size: 13px;
      color: $text-muted;
    }
  }
  
  .kpi-trend {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    
    &.up {
      background: rgba(#10B981, 0.1);
      color: #10B981;
    }
    
    &.down {
      background: rgba(#EF4444, 0.1);
      color: #EF4444;
    }
  }
}

// 图表网格
.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 40px;
}

.chart-card {
  background: $card-bg;
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba($border, 0.8);
  padding: 24px;
  
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: $text;
    }
    
    .chart-legend {
      display: flex;
      gap: 16px;
      
      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: $text-muted;
        
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          
          &.primary { background: $primary; }
          &.secondary { background: #CBD5E1; }
        }
      }
    }
  }
  
  .chart-body {
    .trend-chart {
      width: 100%;
      height: auto;
      
      .chart-line-primary {
        stroke-dasharray: 1000;
        stroke-dashoffset: 1000;
        animation: drawChart 2s ease-out forwards;
        animation-delay: 0.5s;
      }
      
      .chart-area {
        opacity: 0;
        animation: fadeIn 1s ease-out forwards;
        animation-delay: 1.5s;
      }
      
      .data-points circle {
        opacity: 0;
        animation: fadeIn 0.3s ease-out forwards;
        
        @for $i from 1 through 7 {
          &:nth-child(#{$i}) {
            animation-delay: #{0.5 + $i * 0.15}s;
          }
        }
      }
    }
  }
}

@keyframes drawChart {
  to { stroke-dashoffset: 0; }
}

@keyframes fadeIn {
  to { opacity: 1; }
}

// 环形图
.donut-chart-container {
  display: flex;
  align-items: center;
  gap: 24px;
  
  .donut-chart {
    width: 160px;
    height: 160px;
    flex-shrink: 0;
    
    .donut-segment {
      transform-origin: center;
      transform: rotate(-90deg);
      transition: stroke-dasharray 1s ease-out;
    }
  }
  
  .donut-legend {
    flex: 1;
    
    .legend-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px solid rgba($border, 0.5);
      
      &:last-child { border-bottom: none; }
      
      .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 4px;
        flex-shrink: 0;
      }
      
      .legend-text {
        flex: 1;
        font-size: 14px;
        color: $text;
      }
      
      .legend-value {
        font-size: 14px;
        font-weight: 600;
        color: $text;
      }
    }
  }
}

// 实时活动
.activity-section {
  background: $card-bg;
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba($border, 0.8);
  padding: 24px;
  
  .activity-header {
    margin-bottom: 20px;
    
    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: $text;
      display: flex;
      align-items: center;
      gap: 10px;
      
      .live-dot {
        width: 8px;
        height: 8px;
        background: #10B981;
        border-radius: 50%;
        animation: pulse 2s ease-in-out infinite;
      }
    }
  }
  
  .activity-list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  
  .activity-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: rgba($bg, 0.6);
    border-radius: 12px;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba($primary, 0.05);
    }
    
    .activity-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      
      &.purchase {
        background: rgba(#10B981, 0.1);
        color: #10B981;
      }
      
      &.register {
        background: rgba($primary, 0.1);
        color: $primary;
      }
      
      &.generate {
        background: rgba(#8B5CF6, 0.1);
        color: #8B5CF6;
      }
      
      &.vip {
        background: rgba(#F59E0B, 0.1);
        color: #F59E0B;
      }
    }
    
    .activity-content {
      flex: 1;
      min-width: 0;
      
      .activity-text {
        display: block;
        font-size: 13px;
        color: $text;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .activity-time {
        font-size: 11px;
        color: $text-muted;
      }
    }
  }
}

// 功能区域
.features-section {
  position: relative;
  z-index: 1;
  padding: 100px 0;
  background: $bg;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-badge {
  display: inline-block;
  padding: 6px 14px;
  background: rgba($primary, 0.1);
  color: $primary;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
}

.section-title {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
  color: $text;
  margin: 0 0 16px;
}

.section-desc {
  font-size: 17px;
  color: $text-muted;
  max-width: 560px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.feature-card {
  background: $card-bg;
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba($border, 0.8);
  padding: 28px;
  transition: all 0.25s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.12);
    border-color: rgba($primary, 0.2);
    
    .feature-icon {
      background: linear-gradient(135deg, $primary, $secondary);
    }
  }
  
  .feature-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, $primary, $primary-light);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-bottom: 16px;
    transition: background 0.25s ease;
  }
  
  .feature-badge {
    display: inline-block;
    padding: 4px 10px;
    background: rgba($primary, 0.1);
    color: $primary;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 12px;
  }
  
  .feature-title {
    font-size: 18px;
    font-weight: 700;
    color: $text;
    margin: 0 0 10px;
  }
  
  .feature-desc {
    font-size: 14px;
    color: $text-muted;
    line-height: 1.6;
    margin: 0 0 16px;
  }
  
  .feature-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    
    .tag {
      padding: 4px 10px;
      background: #F1F5F9;
      color: $text-muted;
      border-radius: 8px;
      font-size: 12px;
      transition: all 0.2s ease;
    }
  }
  
  &:hover .feature-tags .tag {
    background: rgba($primary, 0.08);
    color: $primary;
  }
}

// 优势区域
.advantages-section {
  position: relative;
  z-index: 1;
  padding: 100px 0;
  background: white;
}

.advantages-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.advantages-content {
  .section-badge { margin-bottom: 16px; }
  .section-title { text-align: left; margin-bottom: 32px; }
}

.advantage-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.advantage-item {
  display: flex;
  gap: 16px;
  
  .adv-icon {
    width: 44px;
    height: 44px;
    background: rgba($primary, 0.1);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $primary;
    flex-shrink: 0;
  }
  
  .adv-content {
    h4 {
      margin: 0 0 6px;
      font-size: 16px;
      font-weight: 600;
      color: $text;
    }
    
    p {
      margin: 0;
      font-size: 14px;
      color: $text-muted;
      line-height: 1.5;
    }
  }
}

.tech-stack-visual {
  display: flex;
  justify-content: center;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.tech-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 24px;
  background: $bg;
  border-radius: 16px;
  border: 1px solid $border;
  transition: all 0.25s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
    border-color: rgba($primary, 0.3);
    
    .tech-icon {
      color: $primary;
      transform: scale(1.1);
    }
  }
  
  .tech-icon {
    width: 36px;
    height: 36px;
    color: $text-muted;
    transition: all 0.25s ease;
  }
  
  .tech-name {
    font-size: 13px;
    font-weight: 600;
    color: $text;
  }
}

// 页脚
.main-footer {
  position: relative;
  z-index: 1;
  background: $text;
  color: white;
  padding: 60px 0 24px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-top {
  margin-bottom: 48px;
  
  .brand-icon {
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-bottom: 16px;
    
    svg { width: 20px; height: 20px; }
  }
  
  .brand-text {
    font-size: 22px;
    font-weight: 700;
    color: white;
    display: block;
    margin-bottom: 12px;
    
    .brand-accent { color: $primary-light; }
  }
  
  .footer-desc {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    max-width: 320px;
    margin: 0 0 16px;
  }
  
  .footer-stats {
    display: flex;
    gap: 12px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
  }
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  padding-bottom: 48px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 24px;
}

.link-group {
  h4 {
    font-size: 14px;
    font-weight: 600;
    color: white;
    margin: 0 0 16px;
  }
  
  a {
    display: block;
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    font-size: 14px;
    margin-bottom: 10px;
    transition: color 0.2s;
    
    &:hover { color: white; }
  }
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  p {
    margin: 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
  }
  
  .footer-version {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
  }
}

// 响应式
@media (max-width: 1024px) {
  .main-header { margin: 12px 16px 0; }
  .hero-container { grid-template-columns: 1fr; gap: 40px; }
  .hero-visual { order: -1; }
  .security-panel { max-width: 100%; }
  .advantages-grid { grid-template-columns: 1fr; }
  .tech-stack-visual { margin-top: 40px; }
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .charts-grid { grid-template-columns: 1fr; }
  .activity-list { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .main-header { 
    margin: 8px 12px 0;
    border-radius: 12px;
  }
  .nav-links { display: none; }
  .hero-section { padding: 40px 0 60px; }
  .hero-stats { flex-direction: column; gap: 16px; padding: 16px; }
  .stat-divider { width: 60px; height: 1px; }
  .features-section { padding: 60px 0; }
  .features-grid { grid-template-columns: 1fr; }
  .footer-links { grid-template-columns: 1fr; gap: 24px; }
  .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
  .kpi-grid { grid-template-columns: 1fr; }
  .kpi-card { padding: 20px; }
  .donut-chart-container { flex-direction: column; }
  .activity-list { grid-template-columns: 1fr; }
  .security-panel .realtime-metrics { grid-template-columns: 1fr; }
  .section-header { margin-bottom: 40px; }
  .advantages-section { padding: 60px 0; }
}

@media (prefers-reduced-motion: reduce) {
  .gradient-orb, .feature-card, .tech-item,
  .chart-line-primary, .chart-area, .data-points circle, .live-dot,
  .pulse-ring, .stream-item {
    animation: none !important;
    transition: none !important;
  }
}
</style>
