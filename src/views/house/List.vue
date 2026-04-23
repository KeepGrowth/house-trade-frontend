<template>
  <div class="min-h-screen bg-gray-50 pb-10">
    <!-- 顶部筛选栏 -->
    <div class="bg-white shadow-sm top-0 z-10">
      <div class="container mx-auto px-4 py-4">
        <el-form :inline="true" :model="queryParams" class="demo-form-inline">
          <el-form-item label="区域" style="width: 200px;">
            <el-select v-model="queryParams.district" placeholder="全部区域" clearable class="w-32">
              <el-option label="海淀区" value="海淀区" />
              <el-option label="锦江区" value="锦江区" />
              <el-option label="徐汇区" value="徐汇区" />
              <el-option label="福田区" value="福田区" />
            </el-select>
          </el-form-item>

          <el-form-item label="户型" style="width: 200px;">
            <el-select v-model="queryParams.houseType" placeholder="全部户型" clearable class="w-32">
              <el-option label="1室1厅" value="1室1厅" />
              <el-option label="2室1厅" value="2室1厅" />
              <el-option label="2室2厅" value="2室2厅" />
              <el-option label="4室及以上" value="4室及以上" />
            </el-select>
          </el-form-item>

          <el-form-item label="价格">
            <div class="flex items-center gap-2">
              <el-input-number v-model="queryParams.minPrice" :min="0" placeholder="最低" class="w-24"
                               controls-position="right" />
              <span>-</span>
              <el-input-number v-model="queryParams.maxPrice" :min="0" placeholder="最高" class="w-24"
                               controls-position="right" />
              <span class="text-gray-500 text-sm">万</span>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSearch" :loading="loading">搜索</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 房源列表内容 -->
    <div class="container mx-auto px-4 mt-6">
      <div v-if="loading" class="flex justify-center py-20">
      </div>

      <div v-else-if="houseList.length === 0" class="text-center py-20 text-gray-400">
        <el-empty description="暂无符合条件的房源" />
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="house in houseList"
          :key="house.houseId"
          class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group"
          @click="goToDetail(house.houseId)"
        >
          <!-- 房源图片 -->
          <div class="relative h-48 bg-gray-200 overflow-hidden">
            <img
              :src="house.imageUrls[0]?.imageUrl || 'https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Image'"
              :alt="house.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div class="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {{ house.area }}㎡
            </div>
          </div>

          <!-- 房源信息 -->
          <div class="p-4">
            <h3 class="font-bold text-lg text-gray-800 truncate mb-1">{{ house.title }}</h3>
            <div class="text-sm text-gray-500 mb-2 flex items-center gap-2">
              <span>{{ house.district }}</span>
              <span>·</span>
              <span>{{ house.community }}</span>
            </div>

            <div class="flex items-end justify-between mt-3">
              <div>
                <span class="text-red-600 font-bold text-xl">{{ house.price }}</span>
                <span class="text-red-600 text-sm">万</span>
              </div>
              <el-tag :type="getStatusType(house.saleStatus)" size="small">
                {{ getStatusText(house.saleStatus) }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total > 0" class="mt-10 flex justify-center">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10,20,30,40]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="fetchHouseList"
          @current-change="fetchHouseList"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import useHouseStore from '@/stores/house.js'

const router = useRouter()
const houseStore = useHouseStore()

// 状态定义
const loading = ref(false)
const houseList = ref([])
const total = ref(0)

// 查询参数
const queryParams = ref({
  page: 1,
  pageSize: 10,
  auditStatus: 1,
  saleStatus: 1,
  houseType: '',
  minPrice: null,
  maxPrice: null
})

// 获取房源列表
const fetchHouseList = async () => {
  loading.value = true
  try {
    // 调用 API
    const response = await houseStore.queryHouseList(queryParams.value)

    if (response.data.code === 200) {
      houseList.value = response.data?.data.houses || []
      total.value = houseList.value.length || 0
    }
  } catch (error) {
    console.error('获取房源列表失败:', error)
    // 这里可以添加 ElementPlus 的 Message 提示
  } finally {
    loading.value = false
  }
}
// 辅助函数：状态文本映射 (对应数据库设计)
const getStatusText = (status) => {
  const map = { 1: '在售', 2: '已售', 3: '已下架' }
  return map[status] || '未知'
}
const getStatusType = (status) => {
  const map = { 1: 'success', 2: 'info', 3: 'warning' }
  return map[status] || 'info'
}
// 搜索处理
const handleSearch = async () => {
  queryParams.page = 1 // 重置页码
  await fetchHouseList()
}

// 重置筛选
const resetFilters = () => {
  queryParams.district = ''
  queryParams.houseType = ''
  queryParams.minPrice = null
  queryParams.maxPrice = null
  handleSearch()
}


// 跳转详情
const goToDetail = (id) => {
  router.push(`/house/${id}`)
}

// 初始化加载
onMounted(() => {
  fetchHouseList()
})
</script>
