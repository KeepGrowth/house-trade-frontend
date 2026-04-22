import { defineStore } from 'pinia'
import api from '@/utils/request.js'
import { ref } from 'vue'
import utils from '@/utils/common.js'

export const useDashBoardStore = defineStore('dashboard', () => {

  // 获取数据指标
  const getIndicator = async (queryParams) => {
    const cleanParams = utils.cleanObject(queryParams)
    return await api.get(`/dashboard/indicator`, {
      params: cleanParams
    })
  }

  // 获取AI统计信息
  const getAiStats = async () => {
    return await api.get(`/dashboard/ai-stats`)
  }

  // 获取用户注册趋势图表数据
  const getUserTrendChartData = async (queryParams) => {
    const cleanParams = utils.cleanObject(queryParams)
    return await api.get(`/dashboard/users`, {
      params: cleanParams
    })
  }

  // 获取房源区域分布饼图数据
  const getHousePieChartData = async (queryParams) => {
    const cleanParams = utils.cleanObject(queryParams)
    return await api.get(`/dashboard/house-areas`, {
      params: cleanParams
    })
  }

  // 获取成交额趋势图表数据
  const getOrderChartData = async (queryParams) => {
    const cleanParams = utils.cleanObject(queryParams)
    return await api.get(`/dashboard/orders-sale`, {
      params: cleanParams
    })
  }


  // 获取新增房源趋势图表数据
  const fetchHouseAddTrendData = async (queryParams) => {
    const cleanParams = utils.cleanObject(queryParams)
    return await api.get(`/dashboard/house-add`, {
      params: cleanParams
    })
  }
  return {
    getIndicator,
    getAiStats,
    getUserTrendChartData,
    getHousePieChartData,
    getOrderChartData,
    fetchHouseAddTrendData
  }
}, {
  // 持久化配置
  persist: {
    enabled: true
  }
})

export default useDashBoardStore
