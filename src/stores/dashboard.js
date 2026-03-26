import { defineStore } from 'pinia'
import api from '@/utils/request.js'
import { ref } from 'vue'

export const useDashBoardStore = defineStore('dashboard', () => {

  // 获取数据指标
  const getIndicator = async () => {
    try {
      return await api.get(`/dashboard/indicator`)
    } catch (error) {
      console.error('评论操作失败', error)
      throw error
    }
  }
  return {
    getIndicator
  }
}, {
  // 持久化配置
  persist: {
    enabled: true
  }
})

export default useDashBoardStore
