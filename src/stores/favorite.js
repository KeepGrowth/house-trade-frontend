import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/utils/request.js' // 确保你的 request.js 导出的是配置好的 axios 实例
import { ElMessage } from 'element-plus'

export const useFavoriteStore = defineStore('favorite', () => {

  // 获取我的收藏列表
  const getFavoriteHousesList = async () => {
    try {
      return await api.get(`/favorite/`)
    } catch (error) {
      console.error('收藏操作失败', error)
      throw error
    }
  }

  // 添加收藏
  const addFavorite = async (houseId) => {
    try {
      return await api.post(`/favorite`, houseId)
    } catch (error) {
      console.error('收藏操作失败', error)
      throw error
    }
  }

  // 取消收藏
  const removeFavorite = async (favoriteId) => {
    try {
      return await api.delete(`/favorite/${favoriteId}/`)
    } catch (error) {
      console.error('收藏操作失败', error)
      throw error
    }
  }
  // 返回所有需要的状态和方法
  return {
    getFavoriteHousesList,
    addFavorite,
    removeFavorite
  }
}, {
  persist: true
})

export default useFavoriteStore
