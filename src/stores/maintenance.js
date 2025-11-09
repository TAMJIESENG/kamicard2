import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useMaintenanceStore = defineStore('maintenance', () => {
  const maintenanceStatus = reactive({
    isActive: false,
    title: '',
    reason: '',
    description: '',
    contact: '',
    startTime: null,
    estimatedDuration: 0
  })

  const checkMaintenanceMode = () => {
    try {
      const savedStatus = localStorage.getItem('maintenance_status')
      console.log('🔍 检查维护状态:', savedStatus)
      
      if (savedStatus) {
        const status = JSON.parse(savedStatus)
        console.log('📊 维护状态详情:', status)
        Object.assign(maintenanceStatus, status)
        return status.isActive === true
      }
      return false
    } catch (error) {
      console.error('❌ 检查维护状态失败:', error)
      return false
    }
  }

  const getMaintenanceInfo = () => {
    return { ...maintenanceStatus }
  }

  const isMaintenanceActive = () => {
    return maintenanceStatus.isActive
  }

  const startMaintenance = (config) => {
    console.log('🚀 启动维护模式:', config)
    
    maintenanceStatus.isActive = true
    maintenanceStatus.title = config.title || '系统维护中'
    maintenanceStatus.reason = config.reason || 'upgrade'
    maintenanceStatus.description = config.description || '系统正在进行维护升级'
    maintenanceStatus.contact = config.contact || ''
    maintenanceStatus.startTime = new Date().toISOString()
    maintenanceStatus.estimatedDuration = config.estimatedDuration || 60

    // 保存到localStorage
    const statusToSave = JSON.stringify(maintenanceStatus)
    localStorage.setItem('maintenance_status', statusToSave)
    
    console.log('💾 维护状态已保存:', statusToSave)
    return true
  }

  const stopMaintenance = () => {
    console.log('🛑 停止维护模式')
    
    Object.assign(maintenanceStatus, {
      isActive: false,
      title: '',
      reason: '',
      description: '',
      contact: '',
      startTime: null,
      estimatedDuration: 0
    })

    // 清除localStorage
    localStorage.removeItem('maintenance_status')
    console.log('🗑️ 维护状态已清除')
    return true
  }

  return {
    maintenanceStatus,
    checkMaintenanceMode,
    getMaintenanceInfo,
    isMaintenanceActive,
    startMaintenance,
    stopMaintenance
  }
})