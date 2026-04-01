<template>
  <div class="min-h-screen bg-gray-50 pb-10">

    <main class="max-w-7xl mx-auto mt-6 px-4 sm:px-6 lg:px-8">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center h-96">
        <span class="ml-2 text-gray-500">加载中...</span>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="text-center py-20">
        <el-icon class="text-red-500 text-4xl mb-4">
          <Warning />
        </el-icon>
        <p class="text-gray-600">{{ error }}</p>
        <el-button type="primary" @click="$router.go(-1)" class="mt-4">返回上一页</el-button>
      </div>

      <!-- 主要内容 -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- 左侧：主要信息 (占2列) -->
        <div class="lg:col-span-2 space-y-6">

          <!-- 1. 图片轮播 -->
          <el-card class="mb-6 overflow-hidden" shadow="hover">
            <el-carousel :interval="4000" height="400px" v-if="house.imageUrls && house.imageUrls.length > 0">
              <el-carousel-item v-for="(img, index) in house.imageUrls" :key="index">
                <img :src="img.imageUrl || 'https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Image' "
                     class="w-full h-full object-cover" alt="" />
              </el-carousel-item>
            </el-carousel>
            <div v-else class="h-64 bg-gray-200 flex items-center justify-center text-gray-400">
              暂无图片
            </div>
          </el-card>

          <!-- 2. 核心信息 -->
          <el-card shadow="hover">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ house.title }}</h1>
                <div class="mt-2 flex items-center text-sm text-gray-500">
                  <el-tag size="small" class="mr-2">{{ house.district }}</el-tag>
                  <span>{{ house.community }}</span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-3xl font-bold text-red-600">{{ house.price }}<span
                  class="text-sm text-gray-500 font-normal">万元</span></div>
                <div class="text-xs text-gray-400 mt-1">单价约 {{ (house.price * 10000 / house.area).toFixed(0) }}元/㎡
                </div>
              </div>
            </div>

            <el-divider />

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div class="p-2 bg-gray-50 rounded">
                <div class="text-gray-500 text-xs">户型</div>
                <div class="font-semibold text-lg">{{ house.houseTypeLabel }}</div>
              </div>
              <div class="p-2 bg-gray-50 rounded">
                <div class="text-gray-500 text-xs">面积</div>
                <div class="font-semibold text-lg">{{ house.area }}㎡</div>
              </div>
              <div class="p-2 bg-gray-50 rounded">
                <div class="text-gray-500 text-xs">状态</div>
                <div class="font-semibold text-lg">
                  <el-tag :type="house.saleStatus === 1 ? 'success' : 'info'" size="small">
                    {{ house.saleStatus === 1 ? '在售' : '已售' }}
                  </el-tag>
                </div>
              </div>
              <div class="p-2 bg-gray-50 rounded">
                <div class="text-gray-500 text-xs">发布时间</div>
                <div class="font-semibold text-sm mt-1">{{ formatTime(house.createTime) }}</div>
              </div>
            </div>

            <div class="mt-6">
              <h3 class="font-bold text-gray-800 mb-2">房源描述</h3>
              <p class="text-gray-600 leading-relaxed">
                {{ house.community || '暂无详细描述，请联系房东咨询。' }}
              </p>
            </div>
          </el-card>

          <!-- 3. 评论区 -->
          <el-card shadow="hover">
            <template #header>
              <div class="flex justify-between items-center">
                <span class="font-bold">用户评价</span>
                <span class="text-sm text-gray-500">共 {{ reviews.length }} 条</span>
              </div>
            </template>

            <div v-if="reviews.length === 0" class="text-center py-8 text-gray-400">
              暂无评价，快来抢沙发吧！
            </div>

            <div v-else class="space-y-4">
              <div v-for="review in reviews" :key="review.reviewId" class="border-b pb-4 last:border-0">
                <div class="flex items-center mb-2">
                  <span class="font-medium text-sm">{{ review.userId }}</span>
                  <div class="ml-auto flex text-yellow-400 text-xs">
                    <el-icon v-for="n in 5" :key="n">
                      <Star v-if="n <= review.score" />
                    </el-icon>
                  </div>
                </div>
                <p class="text-gray-600 text-sm">{{ review.content }}</p>
                <div class="text-xs text-gray-400 mt-1">{{ formatTime(review.createTime) }}</div>
              </div>
            </div>

            <!-- 发表评论 (需登录) -->
            <div class="mt-6 pt-4 border-t">
              <el-input
                v-model="newReviewContent"
                type="textarea"
                placeholder="分享您的看房体验..."
                :rows="3"
                class="mb-2"
              />
              <div class="flex justify-end">
                <el-button type="primary" @click="submitReview" :loading="submitting">发表评论</el-button>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 右侧：侧边栏 (占1列) -->
        <div class="lg:col-span-1 space-y-6">

          <!-- 房东信息卡片 -->
          <el-card shadow="hover">
            <template #header>
              <span class="font-bold">房东信息</span>
            </template>
            <div class="flex items-center mb-4">
              <el-avatar :size="50" src="https://ui-avatars.com/api/?name=John+Doe&background=random&color=fff"
                         class="mr-3" />
              <div>
                <div class="font-bold text-lg">{{ landlord.username }}</div>
                <div class="text-xs text-gray-500">认证房东</div>
              </div>
            </div>
            <el-button type="primary" class="w-full mb-2" @click="contactLandlord">
              <el-icon class="mr-1">
                <Phone />
              </el-icon>
              联系房东
            </el-button>
            <el-button class="w-full" :type="isFavorited ? 'danger' : 'default'" @click="toggleFavorite">
              {{ isFavorited ? '已收藏' : '收藏房源' }}
            </el-button>
          </el-card>

        </div>
      </div>
    </main>
  </div>
</template>

<script setup>

import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Star, Warning, Phone } from '@element-plus/icons-vue'
import useHouseStore from '@/stores/house.js'
import useUserStore from '@/stores/user.js'
import formatTime from '@/utils/date.js'
import useFavoriteStore from '@/stores/favorite.js'

const route = useRoute()
const router = useRouter()
const houseStore = useHouseStore()

const userStore = useUserStore()
// 状态定义
const loading = ref(true)
const error = ref(null)
const house = ref({
  images: [],
  district: '',
  community: '',
  saleStatus: 1,
  sellerInfo: {}
})
const landlord = ref({ nickname: '未知', avatar: '' })
const reviews = ref([])
const newReviewContent = ref('')
const submitting = ref(false)
const isFavorited = ref(false)

// 模拟获取数据 (实际应替换为 API 调用)
const fetchHouseDetail = async () => {
  loading.value = true
  error.value = null
  try {
    // 对应方案中接口：GET /api/v1/houses/{id}
    const response = await houseStore.fetchHouseDetail(route.params.id)
    house.value = response.data.data


    console.log(response.data.data)
    landlord.value = response.data.data.sellerInfo
    reviews.value = response.data.data.reviewInfo
    // 检查是否已收藏 (需登录)
    // if (userStore.isLoggedIn) { checkFavoriteStatus(); }

  } catch (err) {
    error.value = '房源信息加载失败，请稍后重试'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const favoriteStore = useFavoriteStore()
const toggleFavorite = async () => {
  try {
    // 对应方案中互动功能：收藏房源
    await favoriteStore.addFavorite(house.value.houseId)
    isFavorited.value = !isFavorited.value
    ElMessage.success(isFavorited.value ? '收藏成功' : '取消收藏')
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const contactLandlord = () => {
  ElMessage.success('您可拨打房东电话进行联系:' + house.value.sellerInfo.phone)
}

const submitReview = async () => {
  if (!newReviewContent.value.trim()) {
    ElMessage.warning('请输入评价内容')
    return
  }

  submitting.value = true
  try {

    const newReview = await houseStore.createHouseReview(
      route.params.id,
      {
        userId: userStore.userInfo.id,
        houseId: route.params.id,
        score: 5,
        content: newReviewContent.value,
        status: 1
      }
    )

    reviews.value.unshift(newReview)
    newReviewContent.value = ''
    ElMessage.success('评论发表成功')
  } catch (e) {
    ElMessage.error('评论失败，请先登录' + e)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchHouseDetail()
})
</script>

<style scoped>
/* 如果需要覆盖 ElementPlus 默认样式，可在此添加 */
:deep(.el-carousel__item:nth-child(2n)) {
  background-color: #f5f7fa;
}
</style>
