import axios from 'axios'
import { ElMessage } from 'element-plus'
import Cookies from 'js-cookie'
import { firewallCheck } from './firewall'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.request.use(
  (config) => {
    // 防火墙检查
    const firewallResult = firewallCheck(config.url, config.method?.toUpperCase() || 'GET', config.data)
    
    if (!firewallResult.allowed) {
      ElMessage.error(firewallResult.reason || '请求被防火墙拦截')
      return Promise.reject(new Error(firewallResult.reason || '请求被防火墙拦截'))
    }

    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          Cookies.remove('token')
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('权限不足')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(data.message || '请求失败')
      }
    } else {
      ElMessage.error('网络错误')
    }
    
    return Promise.reject(error)
  }
)

export default api