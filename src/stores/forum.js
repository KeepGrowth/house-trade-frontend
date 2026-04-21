import { defineStore } from 'pinia'
import api from '@/utils/request.js'
import { ref } from 'vue'
import utils from '@/utils/common.js'

export const useForumStore = defineStore('forum', () => {

  // 获取帖子列表
  const getForumList = async (queryParams) => {
    try {
      const cleanParams = utils.cleanObject(queryParams)
      return await api.get('/posts/list', { params: cleanParams })
    } catch (error) {
      console.error('操作失败', error)
      throw error
    }
  }

  // 请求单条帖子详情
  const getForumDetail = async (forumId) => {
    try {
      return await api.get(`/posts/detail/${forumId}`)
    } catch (error) {
      console.error('操作失败', error)
      throw error
    }
  }

  // 删除帖子
  const delForum = async (forumId) => {
    try {
      return await api.delete(`/posts/delete/${forumId}`)
    } catch (error) {
      console.error('操作失败', error)
      throw error
    }
  }

  // 更新帖子
  const updateForum = async (forumForm) => {
    try {
      const cleanParams = utils.cleanObject(forumForm)
      return await api.put(`/posts/update`, cleanParams)
    } catch (error) {
      console.error('操作失败', error)
      throw error
    }
  }

  // 发布帖子
  const addForum = async (forumForm) => {

    const cleanParams = utils.cleanObject(forumForm)
    const res = await api.post(`/posts/add`, cleanParams)
    return res

  }


  return {
    getForumList,
    getForumDetail,
    delForum,
    updateForum,
    addForum
  }
}, {
  // 持久化配置
  persist: {
    enabled: true
  }
})

export default useForumStore
