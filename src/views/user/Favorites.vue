<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 页面标题 -->
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">我的收藏</h1>
      <span class="text-sm text-gray-500">共收藏 {{ favoritesList.length }} 套房源</span>
    </div>

    <!-- 加载中状态 -->
    <div v-if="loading" class="flex justify-center py-20">
    </div>

    <!-- 收藏列表网格 -->
    <div v-else-if="favoritesList.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <el-card
        v-for="item in favoritesList"
        :key="item.houseId"
        class="hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
        body-class="p-0"
      >
        <!-- 房源图片 -->
        <div class="relative h-48 w-full overflow-hidden cursor-pointer" @click="goToDetail(item.houseId)">
          <img
            :src="item.house?.imageUrls[0]?.imageUrl || 'https://placehold.co/800x600/d4edda/155724?text=Cozy+Bedroom'"
            alt="房源封面"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div class="absolute top-2 right-2">
            <el-tag type="danger" size="small" effect="dark" v-if="item.house?.saleStatus===1">在售</el-tag>
            <el-tag type="success" size="small" effect="dark" v-else-if="item.house?.saleStatus===2">已售</el-tag>
            <el-tag type="warning" size="small" effect="dark" v-else>已下架</el-tag>
          </div>
        </div>

        <!-- 房源信息 -->
        <div class="p-4">
          <h3
            class="text-lg font-semibold text-gray-800 mb-2 truncate cursor-pointer hover:text-blue-600"
            @click="goToDetail(item.houseId)"
          >
            {{ item.title }}
          </h3>

          <div class="flex items-center text-sm text-gray-500 mb-3">
            <span class="mr-4">{{ item.district }} · {{ item.community }}</span>
            <span>{{ item.house_type }}</span>
          </div>

          <div class="flex items-center text-sm text-gray-500 mb-4">
            <span class="mr-4">面积：{{ item.house.area }}㎡</span>
            <span>收藏时间：{{ formatDate(item.createTime) }}</span>
          </div>

          <!-- 底部操作栏 -->
          <div class="flex items-center justify-between border-t pt-3">
            <div class="text-xl font-bold text-red-600">
              ¥{{ item.house.price }}<span class="text-sm font-normal text-gray-500">万</span>
            </div>
            <div class="space-x-2">
              <el-button size="small" @click="goToDetail(item.houseId)">
                查看详情
              </el-button>
              <el-button
                size="small"
                type="danger"
                plain
                @click="handleRemoveFavorite(item.favoriteId)"
              >
                取消收藏
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <el-empty v-else description="您还没有收藏任何房源，快去看看吧！" class="py-20">
      <el-button type="primary" @click="$router.push('/houses')">浏览房源</el-button>
    </el-empty>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import useFavoriteStore from '@/stores/favorite.js'

const router = useRouter()
const loading = ref(false)
const favoritesList = ref([])

const favoriteStore = useFavoriteStore()
// 获取收藏列表
const fetchFavorites = async () => {
  loading.value = true
  try {
    // 后端接口调用：GET user/favorites
    const response = await favoriteStore.getFavoriteHousesList()

    // 假设后端返回结构为 { code: 200, data: [...] }
    if (response.data.code === 200) {
      favoritesList.value = response.data.data.favorites
    } else {
      ElMessage.error(response.data.message || '获取收藏列表失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('网络错误，请稍后重试' + error)
  } finally {
    loading.value = false
  }
}

// 取消收藏
const handleRemoveFavorite = async (favoriteId) => {
  try {
    await ElMessageBox.confirm('确定要取消收藏该房源吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await favoriteStore.removeFavorite(favoriteId)

    if (response.data.code === 200) {
      ElMessage.success('已取消收藏')
      // 从列表中移除
      favoritesList.value = await fetchFavorites()
    } else {
      ElMessage.error(response.data.message || '操作失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
      ElMessage.error('操作失败')
    }
  }
}

// 跳转详情
const goToDetail = (id) => {
  router.push(`/house/${id}`)
}

// 日期格式化简易工具
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

onMounted(() => {
  fetchFavorites()
})
</script>

<style scoped>
/* 如果需要额外的自定义样式，可以在这里添加 */
/* TailwindCss 已经处理了大部分布局样式 */
</style>
