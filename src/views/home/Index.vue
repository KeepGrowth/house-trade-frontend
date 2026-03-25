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

    <!-- 2. 热门区域筛选标签 (Filter Tags) -->
    <section class="container mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-gray-800">热门区域</h3>
        <el-button link type="primary" @click="router.push('/house/list')">查看全部 ></el-button>
      </div>
      <div class="flex flex-wrap gap-3">
        <el-tag
          v-for="area in hotAreas"
          :key="area.id"
          size="large"
          effect="plain"
          class="cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition-colors py-2 px-4 rounded-full"
          @click="handleAreaClick(area.name)"
        >
          {{ area.name }}
        </el-tag>
      </div>
    </section>

    <!-- 3. 推荐房源网格 (Recommended Houses) -->
    <section class="container mx-auto px-4 pb-12">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-2xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3">精选好房</h3>
        <div class="flex gap-2">
          <el-button :type="currentSort === 'default' ? 'primary' : ''" @click="currentSort = 'default'">默认排序</el-button>
          <el-button :type="currentSort === 'price' ? 'primary' : ''" @click="currentSort = 'price'">价格优先</el-button>
          <el-button :type="currentSort === 'area' ? 'primary' : ''" @click="currentSort = 'area'">面积优先</el-button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center py-20">
        <el-spinner :size="40" />
      </div>

      <!-- 房源列表网格 -->
      <div v-else-if="recommendedHouses.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <HouseCard
          v-for="house in recommendedHouses"
          :key="house.house_id"
          :data="house"
          @click="goToDetail(house.house_id)"
          class="hover:shadow-xl transition-shadow duration-300 cursor-pointer"
        />
      </div>

      <!-- 空状态 -->
      <el-empty v-else description="暂无推荐房源" />

      <!-- 分页 (如果首页需要分页加载) -->
      <div class="mt-8 flex justify-center" v-if="totalPages > 1">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
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
// 假设已封装 API 请求

const router = useRouter()

// --- 状态定义 ---
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(8)
const total = ref(0)
const currentSort = ref('default')

// 数据模型
const banners = ref([])
const hotAreas = ref([])
const recommendedHouses = ref([])

// --- 方法定义 ---

// 获取轮播图
const fetchBanners = async () => {
  try {
    // 模拟数据结构，实际应调用 api
    // const res = await getBannerList()
    // banners.value = res.data
    banners.value = [
      { image: 'https://via.placeholder.com/1200x360/3b82f6/ffffff?text=Welcome+Home', title: '安心购房，从这里开始', description: '海量真实房源，专业顾问服务' },
      { image: 'https://via.placeholder.com/1200x360/10b981/ffffff?text=New+Arrivals', title: '本周新上好房', description: '精选优质小区，限时优惠' }
    ]
  } catch (error) {
    console.error('Failed to fetch banners', error)
  }
}

// 获取热门区域
const fetchHotAreas = async () => {
  try {
    // const res = await getHotAreas()
    // hotAreas.value = res.data
    hotAreas.value = [
      { id: 1, name: '朝阳区' }, { id: 2, name: '海淀区' },
      { id: 3, name: '西城区' }, { id: 4, name: '东城区' },
      { id: 5, name: '丰台区' }, { id: 6, name: '通州区' }
    ]
  } catch (error) {
    console.error('Failed to fetch areas', error)
  }
}

// 获取推荐房源
const fetchRecommendedHouses = async () => {
  loading.value = true
  try {
    // 构造查询参数
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      sort: currentSort.value
    }

    // 模拟 API 调用
    // const res = await getRecommendedHouses(params)
    // recommendedHouses.value = res.data.list
    // total.value = res.data.total

    // 模拟数据延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    // 生成模拟数据以展示效果
    const mockData = Array.from({ length: 8 }).map((_, i) => ({
      house_id: i + 1,
      title: `温馨三居室 - ${hotAreas.value[i % hotAreas.value.length]?.name || '市中心'}核心地段`,
      price: (200 + i * 15).toFixed(2),
      area: (80 + i * 5).toFixed(2),
      house_type: '3室2厅',
      district: hotAreas.value[i % hotAreas.value.length]?.name || '其他',
      community: `幸福小区${i + 1}期`,
      image_url: 'https://via.placeholder.com/400x300/e2e8f0/64748b?text=House+Image' // 实际应从 house_images 表取第一张
    }))

    recommendedHouses.value = mockData
    total.value = 50 // 模拟总数
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
onMounted(() => {
  fetchBanners()
  fetchHotAreas()
  fetchRecommendedHouses()
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
