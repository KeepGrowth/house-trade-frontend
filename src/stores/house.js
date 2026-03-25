import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/utils/request.js'
import { ElMessage, ElNotification } from 'element-plus'

const useHouseStore = defineStore('house', () => {



  // 暴露给外部
  return {

  }

}, {
  persist: true
})

export default useHouseStore
