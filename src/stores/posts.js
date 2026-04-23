import { defineStore } from 'pinia'
import api from '@/utils/request.js'
import utils from '@/utils/common.js'
import { ref } from 'vue'
// import { useRouter } from 'vue-router'
// import { ElNotification } from 'element-plus'

export const usePostStore = defineStore('post', () => {

  // 删除帖子
  const delPost = async (postId) => {

    return await api.delete(`/posts/delete/${postId}`)

  }

  // 切换显示状态
  const changeStatus = async (postId) => {

    return await api.post(`/posts/switch_status`,
      postId)

  }

  // 获取帖子
  const queryPosts = async (queryParams) => {
    const cleanPrams = utils.cleanObject(queryParams)
    return await api.get('/posts/list', {
      params: cleanPrams
    })
  }


  return {
    delPost,
    changeStatus,
    queryPosts
  }
}, {
  // 持久化配置
  persist: {
    enabled: true
  }
})

export default usePostStore
