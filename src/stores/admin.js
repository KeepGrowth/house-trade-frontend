import { defineStore } from 'pinia'
import api from '@/utils/request.js'
import { ref } from 'vue'
// import { useRouter } from 'vue-router'
// import { ElNotification } from 'element-plus'

export const useAdminStore = defineStore('admin', () => {
  // --- 1. 定义状态 (State) ---
  // 使用 ref 定义响应式数据
  const statistics = ref(null)
  const trends = ref(null)
  const districtDist = ref(null)
  const pendingHouses = ref([])
  const users = ref([])
  const reviews = ref([])
  const adminInfo = ref(null)

  // --- 2. 定义方法 (Actions) ---
  // 使用 const 定义异步函数

  /**
   * 1. 获取核心统计概览数据
   */
  const getStatistics = async () => {
    try {
      const res = await api.get('/admin/stats/overview')
      statistics.value = res.data
      return res.data
    } catch (error) {
      console.error('获取统计概览失败', error)
      throw error
    }
  }

  /**
   * 2. 获取趋势数据
   */
  const getTrends = async () => {
    try {
      const res = await api.get('/admin/stats/trends')
      trends.value = res.data
      return res.data
    } catch (error) {
      console.error('获取趋势数据失败', error)
      throw error
    }
  }

  /**
   * 3. 获取区域分布数据
   */
  const getDistrictDist = async () => {
    try {
      const res = await api.get('/admin/stats/district-dist')
      districtDist.value = res.data
      return res.data
    } catch (error) {
      console.error('获取区域分布失败', error)
      throw error
    }
  }

  /**
   * 4. 获取待审核房源列表
   */
  const getPendingHouses = async (params) => {
    console.log(params)
    try {
      const res = await api.post('/admin/audit/list', params)
      pendingHouses.value = res.data
      return res
    } catch (error) {
      console.error('获取待审核房源失败', error)
      throw error
    }
  }

  /**
   * 5. 提交审核结果
   */
  const verifyHouse = async (houseId, auditStatus, rejectReason) => {
    try {
      const res = await api.post('/admin/audit/verify', {
        houseId: houseId,
        auditStatus: auditStatus,
        rejectReason: rejectReason
      })
      return res.data
    } catch (error) {
      console.error('审核提交失败', error)
      throw error
    }
  }

  /**
   * 6. 获取用户列表
   */
  const getUsers = async (queryParams) => {
    try {
      console.log(queryParams)
      const res = await api.post('/admin/users', queryParams)
      return res
    } catch (error) {
      console.error('获取用户列表失败', error)
      throw error
    }
  }

  /**
   * 7. 冻结/解封用户
   */
  const freezeUser = async (userId, userStatus) => {
    try {
      const res = await api.post('/admin/users/freeze', {
        user_id: userId,
        status: userStatus
      })
      return res.data
    } catch (error) {
      console.error('用户状态更新失败', error)
      throw error
    }
  }

  /**
   * 8. 获取全站评价列表
   */
  const getReviews = async (params) => {
    try {
      return await api.post('/reviews/query', params)
    } catch (error) {
      console.error('获取评价列表失败', error)
      throw error
    }
  }

  /**
   * 9. 隐藏/显示违规评论
   */
  const hideReview = async (reviewId, hideStatus) => {
    try {
      const res = await api.post(`/admin/reviews/${reviewId}/hide`, {
        status: hideStatus
      })
      return res.data
    } catch (error) {
      console.error('评论操作失败', error)
      throw error
    }
  }

  // 删除用户
  const delUser = async (userId) => {
    console.log(`/admin/users/${userId}`)
    try {
      return await api.delete(`/admin/users/${userId}`)
    } catch (error) {
      console.error('评论操作失败', error)
      throw error
    }
  }

  // --- 3. 返回暴露给组件的内容 ---
  return {
    // State
    statistics,
    trends,
    districtDist,
    pendingHouses,
    users,
    reviews,
    adminInfo,

    // Actions (现在都是 const 定义的函数)
    getStatistics,
    getTrends,
    getDistrictDist,
    getPendingHouses,
    verifyHouse,
    getUsers,
    freezeUser,
    getReviews,
    hideReview,
    delUser
  }
}, {
  // 持久化配置
  persist: {
    enabled: true
    // 建议只持久化必要的状态，如用户信息或 token，避免持久化大型列表
    // paths: ['adminInfo']
  }
})

export default useAdminStore
