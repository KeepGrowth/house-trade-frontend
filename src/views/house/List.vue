<template>
  <div class="min-h-screen bg-gray-50 pb-10">
    <!-- 顶部筛选栏 -->
    <div class="bg-white shadow-sm sticky top-0 z-10">
      <div class="container mx-auto px-4 py-4">
        <el-form :inline="true" :model="filters" class="demo-form-inline">
          <el-form-item label="区域">
            <el-select v-model="filters.district" placeholder="全部区域" clearable class="w-32">
              <el-option label="朝阳区" value="朝阳区" />
              <el-option label="海淀区" value="海淀区" />
              <el-option label="东城区" value="东城区" />
              <el-option label="西城区" value="西城区" />
            </el-select>
          </el-form-item>

          <el-form-item label="户型">
            <el-select v-model="filters.house_type" placeholder="全部户型" clearable class="w-32">
              <el-option label="1室" value="1室" />
              <el-option label="2室" value="2室" />
              <el-option label="3室" value="3室" />
              <el-option label="4室+" value="4室+" />
            </el-select>
          </el-form-item>

          <el-form-item label="价格">
            <div class="flex items-center gap-2">
              <el-input-number v-model="filters.min_price" :min="0" placeholder="最低" class="w-24" controls-position="right" />
              <span>-</span>
              <el-input-number v-model="filters.max_price" :min="0" placeholder="最高" class="w-24" controls-position="right" />
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
              :src="house.imageUrls[0].imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'"
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
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[12, 24, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
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

// 筛选条件
const filters = reactive({
  district: '',
  house_type: '',
  min_price: null,
  max_price: null,
})

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 10
})

// 获取房源列表
const fetchHouseList = async () => {
  loading.value = true
  try {
    // 构建查询参数
    const params = {
      page: pagination.page,
      page_size: pagination.pageSize,
      ...filters
    }

    // 移除空值
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null) {
        delete params[key]
      }
    })

    // 调用 API
    const response = await houseStore.queryHouseList(params)
    console.log(response.data.data)

    if (response.data.code === 200) {
      houseList.value = response.data.data.houses
      total.value = response.data.data.total
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
  const map = { 1: '在售', 2: '已售', 3: '已下架' };
  return map[status] || '未知';
};
const getStatusType = (status) => {
  const map = { 1: 'success', 2: 'info', 3: 'warning' };
  return map[status] || 'info';
};
// 搜索处理
const handleSearch = () => {
  pagination.page = 1 // 重置页码
  fetchHouseList()
}

// 重置筛选
const resetFilters = () => {
  filters.district = ''
  filters.house_type = ''
  filters.min_price = null
  filters.max_price = null
  handleSearch()
}

// 分页大小改变
const handleSizeChange = () => {
  pagination.page = 1
  fetchHouseList()
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
