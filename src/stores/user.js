import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/utils/request.js'
import { ElMessage, ElNotification } from 'element-plus'

const useUserStore = defineStore('user', () => {
  // 用户认证token
  const token = ref('')
  // 用户信息
  const userInfo = ref({})

  // 用户登录方法
  const login = async (loginForm) => {
    try {
      const res = await api.post('/user/login', loginForm)

      // 1. 获取原始数据
      const responseData = res.data.data
      const rawUser = responseData.user
      const rawToken = responseData.token

      // 2. 定义映射关系 (集中管理，方便后续维护)
      const ROLE_MAP = {
        1: ['owner'],
        2: ['property'],
        3: ['admin']
      }

      // 制添加/覆盖 'role' 字段为字符串，不再依赖外部转换
      userInfo.value = {
        ...rawUser, // 保留后端返回的所有其他字段 (id, name, avatar 等)
        role: ROLE_MAP[rawUser.user_type] || 'unknown', // 标准化角色
        user_type: rawUser.user_type // 保留原始类型 ID 以备不时之需
      }

      // 4. 保存 Token
      token.value = rawToken

      return res
    } catch (error) {
      // 出错时清空状态，防止脏数据
      token.value = ''
      userInfo.value = null
      throw error // 抛出错误让组件层处理 (如显示提示框)
    }
  }


  // 用户注册方法
  const register = async (registerForm) => {
    const res = await api.post('/user/register', registerForm)
    token.value = res.data.data.token
    ElNotification.success({
      title: '成功',
      message: res.data.message
    })
    return res
  }

  // 修改用户方法
  const updateUser = async (updateForm) => {
    const res = await api.post('/user/update', updateForm)
    if (res.data.code === 200) {
      ElNotification.success({
        title: '成功',
        message: res.data.message
      })
    } else {
      ElNotification.error({
        title: '失败',
        message: res.data.message
      })
    }
    return res
  }

  // 删除用户方法
  const deleteUser = async (userId) => {
    const res = await api.delete('/user/delete', {
      params: { userId }
    })
  }

  // 获取用户列表
  const getUserList = async () => {
    const res = await api.get('/user/list')
    return res.data.data.userList
  }


  // 暴露给外部
  return {
    token,
    userInfo,
    login,
    register,
    updateUser,
    deleteUser,
    getUserList
  }

}, {
  persist: true
})

export default useUserStore
