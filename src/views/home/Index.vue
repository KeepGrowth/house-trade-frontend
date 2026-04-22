<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 1. 顶部轮播图区域 (Hero Section) -->
    <section class="container mx-auto px-4 py-6">
      <el-carousel height="360px" indicator-position="outside" class="rounded-xl shadow-lg overflow-hidden">
        <el-carousel-item v-for="(banner, index) in banners" :key="index">
          <div class="relative w-full h-full">
            <img :src="banner.image" :alt="banner.title" class="w-full h-full object-cover" />
            <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-8 text-white">
              <h2 class="text-3xl font-bold mb-2">{{ banner.title }}</h2>
              <p class="text-gray-200">{{ banner.description }}</p>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>


    <!-- 3. 推荐房源网格 (Recommended Houses) -->
    <section class="container mx-auto px-4 pb-12">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-2xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3">精选好房</h3>
        <div class="flex gap-2">
          <el-button :type="currentSort === 'default' ? 'primary' : ''" @click="currentSort = 'default'">默认排序
          </el-button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center py-20">
      </div>

      <!-- 房源列表网格 -->
      <div v-else-if="recommendedHouses.length > 0"
           class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <HouseCard
          v-for="house in recommendedHouses"
          :key="house.houseId"
          :data="house"
          @click="goToDetail(house.houseId)"
          class="hover:shadow-xl transition-shadow duration-300 cursor-pointer"
        />
      </div>

      <!-- 空状态 -->
      <el-empty v-else description="暂无推荐房源" />

      <!-- 分页 (如果首页需要分页加载) -->
      <div class="mt-8 flex justify-center" v-if="total > 1">
        <el-pagination
          v-model:current-page="queryParams.page"
          :page-size="queryParams.pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="fetchRecommendedHouses"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import HouseCard from '@/components/HouseCard.vue'
import useHouseStore from '@/stores/house.js'

const router = useRouter()
const houseStore = useHouseStore()


// --- 状态定义 ---
const loading = ref(false)
const total = ref(0)
const currentSort = ref('default')

// 数据模型
const banners = ref([])

const recommendedHouses = ref([])

// --- 方法定义 ---
const queryParams = ref({
  page: 1,
  pageSize: 10,
  auditStatus: 1,
  saleStatus: 1
})

// 轮播图
const fetchBanners = async () => {
  try {
    // 模拟数据
    banners.value = [
      {
        image: 'https://placehold.co/800x600/d4edda/155724?text=Cozy+Bedroom',
        title: '安心购房，从这里开始',
        description: '海量真实房源，专业顾问服务'
      },
      {
        image: 'https://placehold.co/800x600/fff3cd/856404?text=Open+Kitchen',
        title: '新上好房',
        description: '精选优质小区，限时优惠'
      }
    ]
  } catch (error) {
    console.error('Failed to fetch banners', error)
  }
}


// 获取推荐房源
const fetchRecommendedHouses = async () => {
  loading.value = true
  try {
    // 模拟 API 调用
    const res = await houseStore.fetchRecommendHouses(queryParams.value)
    // 展示在售以及审核通过的房源
    recommendedHouses.value = res.data.data.houses.filter(item => item.auditStatus === 1 && item.saleStatus === 1)
    total.value = res.data.data.total
  } catch (error) {
    ElMessage.error('加载房源失败')
  } finally {
    loading.value = false
  }
}

// 事件处理
const handleAreaClick = (areaName) => {
  router.push({ path: '/house/list', query: { district: areaName } })
}

const goToDetail = (id) => {
  router.push(`/house/${id}`)
}

// --- 生命周期 ---
onMounted(async () => {
  await fetchBanners()
  await fetchRecommendedHouses()
})
</script>

<style scoped>
/*
  大部分样式已通过 TailwindCss 类名实现
  此处仅保留必要的自定义样式或覆盖
*/
:deep(.el-carousel__item:nth-child(2n)) {
  background-color: #99a9bf;
}

:deep(.el-carousel__item:nth-child(2n+1)) {
  background-color: #d3dce6;
}
</style>
