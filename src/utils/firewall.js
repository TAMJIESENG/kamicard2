/**
 * 防火墙核心模块
 * 提供IP黑白名单、请求频率限制、恶意请求检测等功能
 */

// 获取客户端IP（前端环境，实际应通过后端获取）
const getClientIP = () => {
  // 前端环境下，使用localStorage存储的IP标识
  // 实际生产环境应通过后端API获取真实IP
  let clientId = localStorage.getItem('client_id')
  if (!clientId) {
    clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('client_id', clientId)
  }
  return clientId
}

// 获取当前用户标识
const getUserId = () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}')
    return currentUser.id || getClientIP()
  } catch {
    return getClientIP()
  }
}

// 初始化防火墙设置
const initFirewallSettings = () => {
  const defaultSettings = {
    enabled: true, // 是否启用防火墙
    ipWhitelist: [], // IP白名单
    ipBlacklist: [], // IP黑名单
    rateLimit: {
      enabled: true, // 是否启用频率限制
      maxRequests: 60, // 每分钟最大请求数
      timeWindow: 60000, // 时间窗口（毫秒）
      banDuration: 600000 // 封禁时长（毫秒），10分钟
    },
    loginProtection: {
      enabled: true, // 是否启用登录保护
      maxAttempts: 5, // 最大尝试次数
      lockoutDuration: 900000, // 锁定时长（毫秒），15分钟
      timeWindow: 300000 // 时间窗口（毫秒），5分钟
    },
    maliciousPatterns: {
      enabled: true, // 是否启用恶意模式检测
      sqlInjection: true, // SQL注入检测
      xss: true, // XSS攻击检测
      pathTraversal: true, // 路径遍历检测
      commandInjection: true // 命令注入检测
    },
    autoBan: {
      enabled: true, // 是否启用自动封禁
      threshold: 10, // 触发封禁的违规次数
      banDuration: 3600000 // 自动封禁时长（毫秒），1小时
    },
    logging: {
      enabled: true, // 是否启用日志记录
      maxLogs: 1000, // 最大日志条数
      saveBlocked: true // 是否记录被拦截的请求
    }
  }

  const existing = localStorage.getItem('firewall_settings')
  if (!existing) {
    localStorage.setItem('firewall_settings', JSON.stringify(defaultSettings))
    return defaultSettings
  }
  
  try {
    const settings = JSON.parse(existing)
    // 合并默认设置，确保新字段存在
    return { ...defaultSettings, ...settings }
  } catch {
    localStorage.setItem('firewall_settings', JSON.stringify(defaultSettings))
    return defaultSettings
  }
}

// 获取防火墙设置
export const getFirewallSettings = () => {
  return initFirewallSettings()
}

// 保存防火墙设置
export const saveFirewallSettings = (settings) => {
  try {
    localStorage.setItem('firewall_settings', JSON.stringify(settings))
    return true
  } catch (error) {
    console.error('保存防火墙设置失败:', error)
    return false
  }
}

// 恶意模式检测正则表达式（更严格的攻击模式，减少误报）
const maliciousPatterns = {
  sqlInjection: [
    // 只检测明显的SQL注入攻击模式
    /\b(union\s+select|insert\s+into|delete\s+from|drop\s+table|exec\s*\(|execute\s*\()/gi,
    /(\%27|')(\s*or\s*|\s*and\s*)('[^']*'|"[^"]*")\s*=\s*\2/gi, // 'or'1'='1 这种模式
    /(\%27|')\s*(or|and)\s*\d+\s*=\s*\d+/gi, // 'or 1=1
    /--\s*$/gm, // SQL注释
    /\/\*[\s\S]*?\*\//g, // SQL块注释
    /;\s*(drop|delete|truncate|alter|create)\s+/gi // 分号后跟危险操作
  ],
  xss: [
    // 只检测明显的XSS攻击模式
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /javascript\s*:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi, // onclick="xxx" 这种模式
    /<iframe[^>]*src\s*=\s*["']?[^"'>]*["']?[^>]*>/gi,
    /<img[^>]*onerror\s*=/gi,
    /<svg[^>]*onload\s*=/gi,
    /data\s*:\s*text\/html/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi
  ],
  pathTraversal: [
    // 检测路径遍历攻击
    /\.\.\/\.\.\/\.\.\//g, // 多个 ../ 组合
    /\.\.\\\.\.\\\.\.\\/g, // 多个 ..\ 组合（Windows）
    /%2e%2e%2f%2e%2e%2f/gi, // URL编码的路径遍历
    /\.\.\/\.\.%2f/gi,
    /\/(etc|windows|system32|proc|dev)\//gi // 系统敏感目录
  ],
  commandInjection: [
    // 只检测明显的命令注入
    /;\s*(rm\s+-|del\s+|cat\s+\/|ls\s+\/|pwd|whoami|id|uname)/gi, // 分号后跟系统命令
    /\|\s*(rm|del|cat|ls|pwd|whoami)/gi, // 管道符后跟命令
    /\$\{[\w]+\s*\([^}]*\)\}/g, // ${function()} 命令执行
    /`[\s\S]*?(rm|del|cat|ls|pwd|whoami|id|uname)[\s\S]*?`/gi // 反引号执行命令
  ]
}

// 检测恶意请求（优化版，减少误报）
export const detectMaliciousRequest = (url, method, data) => {
  const settings = getFirewallSettings()
  if (!settings.enabled || !settings.maliciousPatterns.enabled) {
    return { isMalicious: false }
  }

  const checkPatterns = {
    sqlInjection: settings.maliciousPatterns.sqlInjection,
    xss: settings.maliciousPatterns.xss,
    pathTraversal: settings.maliciousPatterns.pathTraversal,
    commandInjection: settings.maliciousPatterns.commandInjection
  }

  // 构建检测文本，避免误报正常数据
  let searchText = `${url} ${method}`
  
  // 对于数据，只检查值的部分，避免检查键名（键名可能是正常的业务字段）
  if (data) {
    try {
      // 只提取数据中的值进行检测，避免键名误报
      const dataStr = JSON.stringify(data)
      // 移除键名，只保留值部分进行检测
      const valuesOnly = dataStr.replace(/"[^"]+"\s*:/g, '').replace(/[,{}[\]]/g, ' ')
      searchText += ' ' + valuesOnly
    } catch {
      // 如果JSON序列化失败，使用字符串化
      searchText += ' ' + String(data)
    }
  }

  const detectedPatterns = []
  
  // 白名单：常见的正常操作关键词，不应被误判
  const whitelist = [
    /\/api\/login/i,
    /\/api\/register/i,
    /\/api\/logout/i,
    /username/i,
    /password/i,
    /email/i,
    /phone/i,
    /name/i,
    /title/i,
    /content/i,
    /description/i,
    /message/i,
    /code/i,
    /status/i
  ]
  
  // 检查是否在白名单中（白名单中的内容不进行检测）
  const isWhitelisted = whitelist.some(pattern => pattern.test(searchText))
  if (isWhitelisted && searchText.length < 500) {
    // 白名单且文本较短，可能是正常请求，降低检测严格度
    // 只检测最明显的攻击模式
  }

  // 检查SQL注入（需要至少2个特征同时存在才算攻击）
  if (checkPatterns.sqlInjection) {
    let sqlInjectionScore = 0
    for (const pattern of maliciousPatterns.sqlInjection) {
      if (pattern.test(searchText)) {
        sqlInjectionScore++
        // 如果检测到明显的SQL注入模式（如 union select），直接判定
        if (pattern.toString().includes('union') || pattern.toString().includes('exec')) {
          detectedPatterns.push('SQL注入')
          break
        }
      }
    }
    // 多个SQL注入特征同时出现才判定为攻击
    if (sqlInjectionScore >= 2 && !detectedPatterns.includes('SQL注入')) {
      detectedPatterns.push('SQL注入')
    }
  }

  // 检查XSS（只检测明显的XSS模式）
  if (checkPatterns.xss) {
    for (const pattern of maliciousPatterns.xss) {
      if (pattern.test(searchText)) {
        // XSS检测相对严格，一旦匹配就判定
        detectedPatterns.push('XSS攻击')
        break
      }
    }
  }

  // 检查路径遍历（需要多个 ../ 才判定）
  if (checkPatterns.pathTraversal) {
    let pathTraversalScore = 0
    for (const pattern of maliciousPatterns.pathTraversal) {
      if (pattern.test(searchText)) {
        pathTraversalScore++
      }
    }
    // 路径遍历需要明确的多级跳转才判定
    if (pathTraversalScore >= 1) {
      detectedPatterns.push('路径遍历')
    }
  }

  // 检查命令注入（只检测明显的命令执行模式）
  if (checkPatterns.commandInjection) {
    for (const pattern of maliciousPatterns.commandInjection) {
      if (pattern.test(searchText)) {
        // 命令注入检测严格，一旦匹配就判定
        detectedPatterns.push('命令注入')
        break
      }
    }
  }

  // 排除误报：如果只是单个关键词，不判定为攻击
  if (detectedPatterns.length > 0) {
    // 检查是否只是误报（比如正常的业务关键词）
    const falsePositives = [
      /^.*(select|insert|update|delete|create|alter).*$/i,
      /^.*(script|javascript).*$/i
    ]
    
    const mightBeFalsePositive = falsePositives.some(fp => {
      // 如果只有单个关键词且没有其他攻击特征，可能是误报
      return fp.test(searchText) && searchText.length < 50 && detectedPatterns.length === 1
    })
    
    if (mightBeFalsePositive) {
      // 可能是误报，不拦截，只记录日志
      return { 
        isMalicious: false,
        warning: true // 标记为警告但不拦截
      }
    }
    
    return {
      isMalicious: true,
      patterns: detectedPatterns,
      severity: detectedPatterns.includes('SQL注入') || detectedPatterns.includes('命令注入') ? 'high' : 'medium'
    }
  }

  return { isMalicious: false }
}

// 检查IP黑白名单
export const checkIPAccess = (clientId = null) => {
  const settings = getFirewallSettings()
  if (!settings.enabled) {
    return { allowed: true }
  }

  const ip = clientId || getClientIP()

  // 检查黑名单
  if (settings.ipBlacklist && settings.ipBlacklist.length > 0) {
    if (settings.ipBlacklist.includes(ip)) {
      return {
        allowed: false,
        reason: 'IP已被加入黑名单',
        ip
      }
    }
  }

  // 如果白名单不为空，只允许白名单中的IP
  if (settings.ipWhitelist && settings.ipWhitelist.length > 0) {
    if (!settings.ipWhitelist.includes(ip)) {
      return {
        allowed: false,
        reason: 'IP不在白名单中',
        ip
      }
    }
  }

  return { allowed: true, ip }
}

// 记录请求日志
const logRequest = (type, details) => {
  const settings = getFirewallSettings()
  if (!settings.logging.enabled) {
    return
  }

  try {
    const logs = JSON.parse(localStorage.getItem('firewall_logs') || '[]')
    const logEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type, // 'blocked', 'allowed', 'warning'
      timestamp: new Date().toISOString(),
      ...details
    }

    logs.unshift(logEntry)

    // 限制日志数量
    if (logs.length > settings.logging.maxLogs) {
      logs.splice(settings.logging.maxLogs)
    }

    localStorage.setItem('firewall_logs', JSON.stringify(logs))
  } catch (error) {
    console.error('记录防火墙日志失败:', error)
  }
}

// 获取请求频率记录
const getRateLimitRecords = () => {
  try {
    return JSON.parse(localStorage.getItem('firewall_rate_limit') || '{}')
  } catch {
    return {}
  }
}

// 保存请求频率记录
const saveRateLimitRecords = (records) => {
  try {
    localStorage.setItem('firewall_rate_limit', JSON.stringify(records))
  } catch (error) {
    console.error('保存频率限制记录失败:', error)
  }
}

// 检查请求频率限制
export const checkRateLimit = (clientId = null) => {
  const settings = getFirewallSettings()
  if (!settings.enabled || !settings.rateLimit.enabled) {
    return { allowed: true }
  }

  const ip = clientId || getClientIP()
  const now = Date.now()
  const records = getRateLimitRecords()

  if (!records[ip]) {
    records[ip] = {
      requests: [],
      bannedUntil: null
    }
  }

  const record = records[ip]

  // 检查是否被封禁
  if (record.bannedUntil && now < record.bannedUntil) {
    const remainingTime = Math.ceil((record.bannedUntil - now) / 1000 / 60)
    logRequest('blocked', {
      ip,
      reason: '频率限制：IP已被封禁',
      remainingMinutes: remainingTime
    })
    return {
      allowed: false,
      reason: `请求过于频繁，IP已被封禁，剩余 ${remainingTime} 分钟`,
      ip,
      bannedUntil: record.bannedUntil
    }
  }

  // 清除过期记录
  record.requests = record.requests.filter(
    timestamp => now - timestamp < settings.rateLimit.timeWindow
  )

  // 检查是否超过限制
  if (record.requests.length >= settings.rateLimit.maxRequests) {
    // 封禁IP
    record.bannedUntil = now + settings.rateLimit.banDuration
    saveRateLimitRecords(records)

    logRequest('blocked', {
      ip,
      reason: '频率限制：请求次数超过限制',
      requests: record.requests.length,
      maxRequests: settings.rateLimit.maxRequests
    })

    return {
      allowed: false,
      reason: '请求过于频繁，IP已被临时封禁',
      ip,
      bannedUntil: record.bannedUntil
    }
  }

  // 记录本次请求
  record.requests.push(now)
  saveRateLimitRecords(records)

  return { allowed: true, ip, requestCount: record.requests.length }
}

// 检查登录保护
export const checkLoginProtection = (username) => {
  const settings = getFirewallSettings()
  if (!settings.enabled || !settings.loginProtection.enabled) {
    return { allowed: true }
  }

  try {
    const loginAttempts = JSON.parse(localStorage.getItem('firewall_login_attempts') || '{}')
    const now = Date.now()
    const key = username || getClientIP()

    if (!loginAttempts[key]) {
      loginAttempts[key] = {
        attempts: [],
        lockedUntil: null
      }
    }

    const record = loginAttempts[key]

    // 检查是否被锁定
    if (record.lockedUntil && now < record.lockedUntil) {
      const remainingTime = Math.ceil((record.lockedUntil - now) / 1000 / 60)
      return {
        allowed: false,
        reason: `登录尝试次数过多，账户已锁定，剩余 ${remainingTime} 分钟`,
        lockedUntil: record.lockedUntil,
        remainingMinutes: remainingTime
      }
    }

    // 清除过期记录
    record.attempts = record.attempts.filter(
      timestamp => now - timestamp < settings.loginProtection.timeWindow
    )

    // 检查是否超过限制
    if (record.attempts.length >= settings.loginProtection.maxAttempts) {
      record.lockedUntil = now + settings.loginProtection.lockoutDuration
      localStorage.setItem('firewall_login_attempts', JSON.stringify(loginAttempts))

      logRequest('blocked', {
        type: 'login_protection',
        username: key,
        reason: '登录保护：尝试次数超过限制',
        attempts: record.attempts.length,
        maxAttempts: settings.loginProtection.maxAttempts
      })

      return {
        allowed: false,
        reason: '登录尝试次数过多，账户已锁定',
        lockedUntil: record.lockedUntil
      }
    }

    return {
      allowed: true,
      remainingAttempts: settings.loginProtection.maxAttempts - record.attempts.length
    }
  } catch (error) {
    console.error('检查登录保护失败:', error)
    return { allowed: true }
  }
}

// 记录登录失败
export const recordLoginFailure = (username) => {
  const settings = getFirewallSettings()
  if (!settings.enabled || !settings.loginProtection.enabled) {
    return
  }

  try {
    const loginAttempts = JSON.parse(localStorage.getItem('firewall_login_attempts') || '{}')
    const key = username || getClientIP()
    const now = Date.now()

    if (!loginAttempts[key]) {
      loginAttempts[key] = {
        attempts: [],
        lockedUntil: null
      }
    }

    loginAttempts[key].attempts.push(now)
    localStorage.setItem('firewall_login_attempts', JSON.stringify(loginAttempts))
  } catch (error) {
    console.error('记录登录失败失败:', error)
  }
}

// 清除登录失败记录
export const clearLoginAttempts = (username) => {
  try {
    const loginAttempts = JSON.parse(localStorage.getItem('firewall_login_attempts') || '{}')
    const key = username || getClientIP()
    if (loginAttempts[key]) {
      delete loginAttempts[key]
      localStorage.setItem('firewall_login_attempts', JSON.stringify(loginAttempts))
    }
  } catch (error) {
    console.error('清除登录失败记录失败:', error)
  }
}

// 记录违规行为（用于自动封禁）
const recordViolation = (ip, violationType) => {
  const settings = getFirewallSettings()
  if (!settings.enabled || !settings.autoBan.enabled) {
    return
  }

  try {
    const violations = JSON.parse(localStorage.getItem('firewall_violations') || '{}')
    const now = Date.now()

    if (!violations[ip]) {
      violations[ip] = []
    }

    violations[ip].push({
      type: violationType,
      timestamp: now
    })

    // 清除24小时前的违规记录
    violations[ip] = violations[ip].filter(
      v => now - v.timestamp < 86400000 // 24小时
    )

    // 检查是否达到自动封禁阈值
    if (violations[ip].length >= settings.autoBan.threshold) {
      const blacklist = JSON.parse(localStorage.getItem('firewall_blacklist_auto') || '[]')
      if (!blacklist.includes(ip)) {
        blacklist.push({
          ip,
          reason: `自动封禁：${violations[ip].length}次违规行为`,
          bannedAt: now,
          bannedUntil: now + settings.autoBan.banDuration
        })

        // 同时添加到手动黑名单
        const settings = getFirewallSettings()
        if (!settings.ipBlacklist.includes(ip)) {
          settings.ipBlacklist.push(ip)
          saveFirewallSettings(settings)
        }

        localStorage.setItem('firewall_blacklist_auto', JSON.stringify(blacklist))
        logRequest('blocked', {
          ip,
          reason: `自动封禁：达到违规阈值（${violations[ip].length}次）`,
          violationType
        })
      }
    }

    localStorage.setItem('firewall_violations', JSON.stringify(violations))
  } catch (error) {
    console.error('记录违规行为失败:', error)
  }
}

// 主检查函数：综合所有安全检查
export const firewallCheck = (url, method = 'GET', data = null) => {
  const settings = getFirewallSettings()
  if (!settings.enabled) {
    return { allowed: true }
  }

  const clientId = getClientIP()

  // 1. 检查IP黑白名单
  const ipCheck = checkIPAccess(clientId)
  if (!ipCheck.allowed) {
    logRequest('blocked', {
      ip: clientId,
      reason: ipCheck.reason,
      url,
      method
    })
    recordViolation(clientId, 'ip_blocked')
    return {
      allowed: false,
      reason: ipCheck.reason,
      type: 'ip_check'
    }
  }

  // 2. 检查频率限制
  const rateCheck = checkRateLimit(clientId)
  if (!rateCheck.allowed) {
    recordViolation(clientId, 'rate_limit')
    return {
      allowed: false,
      reason: rateCheck.reason,
      type: 'rate_limit'
    }
  }

  // 3. 检测恶意请求（优化：警告模式不直接拦截）
  const maliciousCheck = detectMaliciousRequest(url, method, data)
  if (maliciousCheck.isMalicious) {
    // 如果是警告模式（可能是误报），只记录日志不拦截
    if (maliciousCheck.warning) {
      logRequest('warning', {
        ip: clientId,
        reason: `疑似恶意请求（已放行）：${maliciousCheck.patterns?.join(', ') || '未知'}`,
        url,
        method
      })
      return { allowed: true, warning: true }
    }
    
    // 确认的恶意请求才拦截
    logRequest('blocked', {
      ip: clientId,
      reason: `检测到恶意请求：${maliciousCheck.patterns.join(', ')}`,
      url,
      method,
      patterns: maliciousCheck.patterns,
      severity: maliciousCheck.severity
    })
    recordViolation(clientId, `malicious_${maliciousCheck.patterns[0]}`)
    return {
      allowed: false,
      reason: `检测到恶意请求：${maliciousCheck.patterns.join(', ')}`,
      type: 'malicious',
      patterns: maliciousCheck.patterns,
      severity: maliciousCheck.severity
    }
  }

  // 所有检查通过
  if (settings.logging.enabled && settings.logging.saveBlocked) {
    logRequest('allowed', {
      ip: clientId,
      url,
      method
    })
  }

  return { allowed: true }
}

// 获取防火墙日志
export const getFirewallLogs = (limit = 100, type = null) => {
  try {
    let logs = JSON.parse(localStorage.getItem('firewall_logs') || '[]')
    
    if (type) {
      logs = logs.filter(log => log.type === type)
    }
    
    return logs.slice(0, limit)
  } catch (error) {
    console.error('获取防火墙日志失败:', error)
    return []
  }
}

// 清除防火墙日志
export const clearFirewallLogs = () => {
  try {
    localStorage.setItem('firewall_logs', '[]')
    return true
  } catch (error) {
    console.error('清除防火墙日志失败:', error)
    return false
  }
}

// 获取被封禁的IP列表
export const getBannedIPs = () => {
  try {
    const autoBanned = JSON.parse(localStorage.getItem('firewall_blacklist_auto') || '[]')
    const settings = getFirewallSettings()
    
    return {
      manual: settings.ipBlacklist || [],
      auto: autoBanned.filter(item => {
        // 只返回尚未过期的自动封禁
        return Date.now() < item.bannedUntil
      })
    }
  } catch (error) {
    console.error('获取封禁IP列表失败:', error)
    return { manual: [], auto: [] }
  }
}

// 解除IP封禁
export const unbanIP = (ip) => {
  try {
    const settings = getFirewallSettings()
    settings.ipBlacklist = settings.ipBlacklist.filter(i => i !== ip)
    saveFirewallSettings(settings)

    // 清除自动封禁记录
    const autoBanned = JSON.parse(localStorage.getItem('firewall_blacklist_auto') || '[]')
    const filtered = autoBanned.filter(item => item.ip !== ip)
    localStorage.setItem('firewall_blacklist_auto', JSON.stringify(filtered))

    // 清除违规记录
    const violations = JSON.parse(localStorage.getItem('firewall_violations') || '{}')
    if (violations[ip]) {
      delete violations[ip]
      localStorage.setItem('firewall_violations', JSON.stringify(violations))
    }

    // 清除频率限制记录
    const rateRecords = getRateLimitRecords()
    if (rateRecords[ip]) {
      delete rateRecords[ip]
      saveRateLimitRecords(rateRecords)
    }

    return true
  } catch (error) {
    console.error('解除封禁失败:', error)
    return false
  }
}

