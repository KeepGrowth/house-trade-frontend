import { defineStore } from 'pinia'
import api from '@/utils/request.js'
import { ref } from 'vue'
// import { useRouter } from 'vue-router'
// import { ElNotification } from 'element-plus'

export const useReviewStore = defineStore('review', () => {

  // 删除评价
  const delReview = async (reviewId) => {
    try {
      return await api.delete(`/reviews/${reviewId}`)
    } catch (error) {
      console.error('评论操作失败', error)
      throw error
    }
  }

  // 切换显示状态
  const changeStatus = async (reviewId) => {
    try {
      return await api.post(`/reviews/switch_status`,
        reviewId)
    } catch (error) {
      console.error('评论操作失败', error)
      throw error
    }
  }


  return {
    delReview,

    changeStatus
  }
}, {
  // 持久化配置
  persist: {
    enabled: true
  }
})

export default useReviewStore
