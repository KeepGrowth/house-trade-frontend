import { defineStore } from 'pinia'
import api from '@/utils/request.js'
import { ref } from 'vue'
import utils from '@/utils/common.js'

export const useRepliestore = defineStore('replies', () => {

  // 获取回复列表
  const getRepliesList = async (queryParams) => {
    try {
      const cleanParams = utils.cleanObject(queryParams)
      return await api.get('/replies/list', { params: cleanParams })
    } catch (error) {
      console.error('操作失败', error)
      throw error
    }
  }

  // 请求单条回复详情
  const getRepliesDetail = async (repliesId) => {
    try {
      return await api.get(`/replies/detail/${repliesId}`)
    } catch (error) {
      console.error('操作失败', error)
      throw error
    }
  }

  // 删除回复
  const delReplies = async (repliesId) => {
    try {
      return await api.delete(`/replies/delete/${repliesId}`)
    } catch (error) {
      console.error('操作失败', error)
      throw error
    }
  }

  // 更新回复
  const updateReplies = async (repliesForm) => {
    try {
      const cleanParams = utils.cleanObject(repliesForm)
      return await api.put(`/replies/update`, cleanParams)
    } catch (error) {
      console.error('操作失败', error)
      throw error
    }
  }

  // 新增回复
  const addReplies = async (repliesForm) => {
    try {
      const cleanParams = utils.cleanObject(repliesForm)
      return await api.post(`/replies/add`, cleanParams)
    } catch (error) {
      console.error('操作失败', error)
      throw error
    }
  }


  return {
    getRepliesList,
    getRepliesDetail,
    delReplies,
    updateReplies,
    addReplies
  }
}, {
  // 持久化配置
  persist: {
    enabled: true
  }
})

export default useRepliestore
