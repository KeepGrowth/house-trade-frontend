<template>
  <div class="min-h-screen bg-gray-50 pb-10">
    <!-- 顶部导航占位 (实际项目中可引入全局 Header 组件) -->
    <header class="bg-white shadow-sm h-16 flex items-center px-10">
      <h1 class="text-xl font-bold text-blue-600 cursor-pointer" @click="$router.push('/')">二手房交易平台</h1>
    </header>

    <main class="max-w-7xl mx-auto mt-6 px-4 sm:px-6 lg:px-8">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center h-96">
        <span class="ml-2 text-gray-500">加载中...</span>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="text-center py-20">
        <el-icon class="text-red-500 text-4xl mb-4"><Warning /></el-icon>
        <p class="text-gray-600">{{ error }}</p>
        <el-button type="primary" @click="$router.go(-1)" class="mt-4">返回上一页</el-button>
      </div>

      <!-- 主要内容 -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- 左侧：主要信息 (占2列) -->
        <div class="lg:col-span-2 space-y-6">

          <!-- 1. 图片轮播 -->
          <el-card class="mb-6 overflow-hidden" shadow="hover">
            <el-carousel :interval="4000" height="400px" v-if="house.images && house.images.length > 0">
              <el-carousel-item v-for="(img, index) in house.images" :key="index">
                <img :src="img.image_url" :alt="house.title" class="w-full h-full object-cover" />
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
                <div class="text-3xl font-bold text-red-600">{{ house.price }}<span class="text-sm text-gray-500 font-normal">万元</span></div>
                <div class="text-xs text-gray-400 mt-1">单价约 {{ (house.price * 10000 / house.area).toFixed(0) }}元/㎡</div>
              </div>
            </div>

            <el-divider />

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div class="p-2 bg-gray-50 rounded">
                <div class="text-gray-500 text-xs">户型</div>
                <div class="font-semibold text-lg">{{ house.house_type }}</div>
              </div>
              <div class="p-2 bg-gray-50 rounded">
                <div class="text-gray-500 text-xs">面积</div>
                <div class="font-semibold text-lg">{{ house.area }}㎡</div>
              </div>
              <div class="p-2 bg-gray-50 rounded">
                <div class="text-gray-500 text-xs">状态</div>
                <div class="font-semibold text-lg">
                  <el-tag :type="house.sale_status === 1 ? 'success' : 'info'" size="small">
                    {{ house.sale_status === 1 ? '在售' : '已售' }}
                  </el-tag>
                </div>
              </div>
              <div class="p-2 bg-gray-50 rounded">
                <div class="text-gray-500 text-xs">发布时间</div>
                <div class="font-semibold text-sm mt-1">2023-10-01</div> <!-- 实际应从后端获取 -->
              </div>
            </div>

            <div class="mt-6">
              <h3 class="font-bold text-gray-800 mb-2">房源描述</h3>
              <p class="text-gray-600 leading-relaxed">
                {{ house.description || '暂无详细描述，请联系房东咨询。' }}
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
              <div v-for="review in reviews" :key="review.review_id" class="border-b pb-4 last:border-0">
                <div class="flex items-center mb-2">
                  <el-avatar :size="32" :src="review.user_avatar" class="mr-2" />
                  <span class="font-medium text-sm">{{ review.username }}</span>
                  <div class="ml-auto flex text-yellow-400 text-xs">
                    <el-icon v-for="n in 5" :key="n"><Star v-if="n <= review.score" /><StarBorder v-else /></el-icon>
                  </div>
                </div>
                <p class="text-gray-600 text-sm">{{ review.content }}</p>
                <div class="text-xs text-gray-400 mt-1">{{ review.create_time }}</div>
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
              <el-avatar :size="50" :src="landlord.avatar" class="mr-3" />
              <div>
                <div class="font-bold text-lg">{{ landlord.nickname }}</div>
                <div class="text-xs text-gray-500">认证房东</div>
              </div>
            </div>
            <el-button type="primary" class="w-full mb-2" @click="contactLandlord">
              <el-icon class="mr-1"><Phone /></el-icon> 联系房东
            </el-button>
            <el-button class="w-full" :type="isFavorited ? 'danger' : 'default'" @click="toggleFavorite">
              <el-icon class="mr-1"><Star v-if="isFavorited" /><StarBorder v-else /></el-icon>
              {{ isFavorited ? '已收藏' : '收藏房源' }}
            </el-button>
          </el-card>

          <!-- 地图位置 (可选/模拟) -->
          <el-card shadow="hover">
            <template #header>
              <span class="font-bold">小区位置</span>
            </template>
            <div class="h-48 bg-gray-200 rounded flex items-center justify-center text-gray-500">
              地图组件占位 (可接入高德/百度地图)
            </div>
            <div class="mt-2 text-sm text-gray-600">
              <p>区域：{{ house.district }}</p>
              <p>小区：{{ house.community }}</p>
            </div>
          </el-card>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Star, StarBorder, Warning, Phone } from '@element-plus/icons-vue';
import axios from 'axios';
// 假设使用了 Pinia 存储用户信息
// import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
// const userStore = useUserStore();

// 状态定义
const loading = ref(true);
const error = ref(null);
const house = ref({
  images: [],
  district: '',
  community: '',
  sale_status: 1,
  description: ''
});
const landlord = ref({ nickname: '未知', avatar: '' });
const reviews = ref([]);
const newReviewContent = ref('');
const submitting = ref(false);
const isFavorited = ref(false);

// 模拟获取数据 (实际应替换为 API 调用)
const fetchHouseDetail = async () => {
  loading.value = true;
  error.value = null;
  try {
    // 对应方案中接口：GET /api/v1/houses/{id}
    // const response = await axios.get(`/api/v1/houses/${route.params.id}`);
    // house.value = response.data.data;

    // --- Mock Data Start (演示用) ---
    await new Promise(resolve => setTimeout(resolve, 800)); // 模拟网络延迟
    house.value = {
      house_id: route.params.id,
      title: '阳光花园 精装三居室 南北通透 采光极佳',
      price: 280.5,
      area: 98.5,
      house_type: '3室2厅1卫',
      district: '朝阳区',
      community: '阳光花园',
      sale_status: 1,
      description: '此房源位于小区中心位置，楼层好，采光无遮挡。业主自住装修，保养非常好，拎包入住。周边配套齐全，交通便利，临近地铁站。',
      images: [
        { image_url: 'https://via.placeholder.com/800x400?text=Living+Room' },
        { image_url: 'https://via.placeholder.com/800x400?text=Bedroom' },
        { image_url: 'https://via.placeholder.com/800x400?text=Kitchen' }
      ]
    };
    landlord.value = {
      nickname: '张先生',
      avatar: 'https://via.placeholder.com/50'
    };
    reviews.value = [
      { review_id: 1, username: '李女士', user_avatar: '', score: 5, content: '房子很不错，房东很热情。', create_time: '2023-09-15' }
    ];
    // --- Mock Data End ---

    // 检查是否已收藏 (需登录)
    // if (userStore.isLoggedIn) { checkFavoriteStatus(); }

  } catch (err) {
    error.value = '房源信息加载失败，请稍后重试';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const toggleFavorite = async () => {
  // 这里需要集成登录校验逻辑
  // if (!userStore.isLoggedIn) { ElMessage.warning('请先登录'); router.push('/login'); return; }

  try {
    // 对应方案中互动功能：收藏房源
    // await axios.post('/api/v1/favorites', { house_id: house.value.house_id });
    isFavorited.value = !isFavorited.value;
    ElMessage.success(isFavorited.value ? '收藏成功' : '取消收藏');
  } catch (e) {
    ElMessage.error('操作失败');
  }
};

const contactLandlord = () => {
  ElMessage.info('模拟拨打房东电话：138****8888');
  // 实际逻辑可以是弹出模态框显示电话，或发起在线聊天
};

const submitReview = async () => {
  if (!newReviewContent.value.trim()) {
    ElMessage.warning('请输入评价内容');
    return;
  }

  submitting.value = true;
  try {
    // 对应方案中互动功能：发表评论
    // await axios.post('/api/v1/reviews', { house_id: house.value.house_id, content: newReviewContent.value, score: 5 });

    // Mock
    await new Promise(r => setTimeout(r, 500));
    reviews.value.unshift({
      review_id: Date.now(),
      username: '当前用户',
      user_avatar: '',
      score: 5,
      content: newReviewContent.value,
      create_time: new Date().toISOString().split('T')[0]
    });

    newReviewContent.value = '';
    ElMessage.success('评论发表成功');
  } catch (e) {
    ElMessage.error('评论失败');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchHouseDetail();
});
</script>

<style scoped>
/* 如果需要覆盖 ElementPlus 默认样式，可在此添加 */
:deep(.el-carousel__item:nth-child(2n)) {
  background-color: #f5f7fa;
}
</style>
