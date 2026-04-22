import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/utils/request.js' // 确保你的 request.js 导出的是配置好的 axios 实例
import { ElMessage } from 'element-plus'

export const useHouseStore = defineStore('house', () => {
  // --- State (使用 ref 定义) ---
  const currentHouse = ref(null)       // 当前选中的房源详情
  const houseList = ref([])            // 房源列表缓存
  const total = ref(0)                 // 总数
  const hotDistricts = ref([])         // 热门区域
  const recommendList = ref([])        // 推荐房源

  // --- Actions (直接定义函数) ---

  /**
   * 1. 获取房源列表
   * GET /houses/
   */
  const fetchHouseList = async () => {
    try {
      const res = await api.get('/houses/')
      houseList.value = res.houses || []
      total.value = res.total || 0
      return res
    } catch (error) {
      console.error('获取房源列表失败', error)
      ElMessage.error(error.response?.data?.message || '获取房源列表失败')
      throw error
    }
  }

  // 条件筛选房源列表
  const queryHouseList = async (params = {}) => {
    try {
      return await api.post('/houses/query', params)
    } catch (error) {
      console.error('条件查询房源列表失败', error)
      ElMessage.error(error.response?.data?.message || '获取房源列表失败')
      throw error
    }
  }

  /**
   * 2. 获取房源详情
   * GET /houses/{house_id}
   */
  const fetchHouseDetail = async (houseId) => {
    try {
      const res = await api.get(`/houses/${houseId}`)
      currentHouse.value = res
      return res
    } catch (error) {
      console.error('获取房源详情失败', error)
      ElMessage.error(error.response?.data?.detail || '获取房源详情失败')
      throw error
    }
  }

  /**
   * 3. 获取热门区域标签
   * GET /houses/hot-districts
   */
  const fetchHotDistricts = async () => {
    try {
      const res = await api.get('/houses/hot-districts')
      // 假设后端直接返回数组
      hotDistricts.value = res
      return res
    } catch (error) {
      console.error('获取热门区域失败', error)
      ElMessage.error('获取热门区域失败')
      throw error
    }
  }

  /**
   * 4. 获取推荐房源
   * GET /houses/recommend
   */
  const fetchRecommendHouses = async () => {
    try {
      const res = await api.get('/houses/recommend')
      recommendList.value = res.houses || []
      return res
    } catch (error) {
      console.error('获取推荐房源失败', error)
      ElMessage.error('获取推荐房源失败')
      throw error
    }
  }

  /**
   * 5. 发布新房源
   * POST /houses/
   */
  const createHouse = async (houseData) => {
    try {
      const res = await api.post('/houses/', houseData)
      ElMessage.success('房源发布成功')
      return res
    } catch (error) {
      console.error('发布房源失败', error)
      const msg = error.response?.data?.detail || '发布房源失败'
      ElMessage.error(msg)
      throw error
    }
  }

  /**
   * 6. 上传房源图片
   * POST /houses/upload-house-images?house_id={id}
   */
  const uploadHouseImages = async (houseId, files) => {
    const formData = new FormData()
    // FastAPI List[UploadFile] 需要多次 append 同一个 key
    files.forEach((file) => {
      formData.append('files', file)
    })

    try {
      const res = await api.post(`/houses/upload-house-images?house_id=${houseId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      ElMessage.success('图片上传成功')
      return res // 返回 URL 列表
    } catch (error) {
      console.error('上传图片失败', error)
      ElMessage.error(error.response?.data?.detail || '图片上传失败')
      throw error
    }
  }

  /**
   * 7. 编辑房源信息
   * PUT /houses/{house_id}
   */
  const updateHouse = async (houseId, houseData) => {
    try {
      const res = await api.put(`/houses/${houseId}`, houseData)
      // 更新本地缓存
      if (currentHouse.value && currentHouse.value.id === houseId) {
        currentHouse.value = res
      }
      ElMessage.success('房源信息更新成功')
      return res
    } catch (error) {
      console.error('编辑房源失败', error)
      ElMessage.error(error.response?.data?.detail || '编辑房源失败')
      throw error
    }
  }

  /**
   * 8. 下架/删除房源
   * DELETE /houses/{house_id}
   */
  const deleteHouse = async (houseId) => {
    try {
      await api.delete(`/houses/${houseId}`)
      // 更新本地列表
      houseList.value = houseList.value.filter(h => h.id !== houseId)
      if (currentHouse.value && currentHouse.value.id === houseId) {
        currentHouse.value = null
      }
      ElMessage.success('房源已删除')
      return true
    } catch (error) {
      console.error('删除房源失败', error)
      ElMessage.error(error.response?.data?.detail || '删除房源失败')
      throw error
    }
  }

  /**
   * 9. 查询房源审核状态
   * GET /houses/{house_id}/audit-status
   */
  const getHouseAuditStatus = async (houseId) => {
    try {
      const res = await api.get(`/houses/${houseId}/audit-status`)
      return res
    } catch (error) {
      console.error('查询审核状态失败', error)
      ElMessage.error('查询审核状态失败')
      throw error
    }
  }

  /**
   * 10. 收藏/取消收藏房源
   * POST /houses/{house_id}/favorite
   */
  const toggleFavorite = async (houseId) => {
    try {
      const res = await api.post(`/houses/${houseId}/favorite`)

      // 乐观更新 UI
      const target = houseList.value.find(h => h.id === houseId)
      if (target) {
        // 注意：确保后端返回的模型中有 is_favorite 字段，或者根据实际字段名修改
        target.is_favorite = !target.is_favorite
      }
      if (currentHouse.value && currentHouse.value.id === houseId) {
        currentHouse.value.is_favorite = !currentHouse.value.is_favorite
      }

      // 不弹出成功消息，避免频繁打扰，或者可以改为轻提示
      // ElMessage.success('操作成功')
      return res
    } catch (error) {
      console.error('收藏操作失败', error)
      ElMessage.error(error.response?.data?.detail || '操作失败')
      throw error
    }
  }

  /**
   * 11. 获取某房源的评价列表
   * GET /houses/{house_id}/reviews
   */
  const fetchHouseReviews = async (houseId) => {
    try {
      const res = await api.get(`/houses/${houseId}/reviews`)
      return res
    } catch (error) {
      console.error('获取评价列表失败', error)
      ElMessage.error('获取评价列表失败')
      throw error
    }
  }

  /**
   * 12. 提交房源评价
   * POST /houses/{house_id}/reviews
   */
  const createHouseReview = async (houseId, reviewData) => {
    try {
      const res = await api.post(`/houses/${houseId}/reviews`, reviewData)
      ElMessage.success('评价提交成功')
      return res
    } catch (error) {
      console.error('提交评价失败', error)
      ElMessage.error(error.response?.data?.detail || '评价提交失败')
      throw error
    }
  }

  // 购买房源
  const buyHouse = async (houseId) => {
    try {
      const res = await api.post(`/houses/buy`,
        Number(houseId)
      )
      return res
    } catch (error) {
      console.error('提交评价失败', error)
      throw error
    }
  }

  // 返回所有需要的状态和方法
  return {
    fetchHouseList,
    fetchHouseDetail,
    fetchHotDistricts,
    fetchRecommendHouses,
    createHouse,
    uploadHouseImages,
    updateHouse,
    deleteHouse,
    getHouseAuditStatus,
    toggleFavorite,
    fetchHouseReviews,
    createHouseReview,
    queryHouseList,
    buyHouse
  }
}, {
  persist: {
    key: 'house_store',
    paths: ['hotDistricts'], // 仅持久化不太变化的数据，如热门区域，列表数据通常不持久化
    storage: localStorage
  }
})

export default useHouseStore
