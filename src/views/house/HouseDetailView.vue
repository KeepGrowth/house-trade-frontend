<template>
  <PageContainer title="房源详情" show-back>
    <div v-if="loading" class="flex justify-center items-center py-20">
      <el-skeleton :rows="15" animated />
    </div>

    <div v-else-if="house" class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <!-- 左侧主要内容区 (占 2/3) -->
      <div class="lg:col-span-2 space-y-6">

        <!-- 1. 房源图片轮播 -->
        <section class="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <div class="relative aspect-video bg-gray-100 group">
            <img
              :src="currentImage || house.cover_image"
              :alt="house.title"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <!-- 图片指示器 -->
            <div v-if="house.images && house.images.length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <span
                v-for="(img, idx) in house.images"
                :key="idx"
                @click="currentImage = img"
                :class="['w-2 h-2 rounded-full cursor-pointer transition-all', currentImage === img ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80']"
              />
            </div>
            <!-- 状态标签 -->
            <div class="absolute top-4 left-4 flex gap-2">
              <EStatusTag :status="house.sale_status" type="sale" />
              <EStatusTag :status="house.audit_status" type="audit" />
            </div>
          </div>
          <!-- 缩略图列表 -->
          <div v-if="house.images && house.images.length > 1" class="p-4 flex gap-2 overflow-x-auto bg-gray-50">
            <img
              v-for="(img, idx) in house.images"
              :key="idx"
              :src="img"
              class="w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-colors hover:border-blue-500"
              :class="currentImage === img ? 'border-blue-500' : 'border-transparent'"
              @click="currentImage = img"
            />
          </div>
        </section>

        <!-- 2. 核心信息区 -->
        <section class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ house.title }}</h1>
              <div class="flex items-center text-gray-500 text-sm space-x-4">
                <span class="flex items-center"><i class="ri-map-pin-line mr-1"></i> {{ house.district }} - {{ house.community }}</span>
                <span class="flex items-center"><i class="ri-time-line mr-1"></i> 发布于 {{ formatDate(house.create_time) }}</span>
              </div>
            </div>
            <div class="text-right">
              <EPriceDisplay :price="house.price" size="large" color="text-red-600" />
              <p class="text-xs text-gray-400 mt-1">参考单价 {{ (house.price * 10000 / house.area).toFixed(0) }}元/㎡</p>
            </div>
          </div>

          <div class="grid grid-cols-4 gap-4 py-6 border-t border-b border-gray-100">
            <div class="text-center">
              <p class="text-gray-400 text-xs mb-1">户型</p>
              <p class="font-medium text-gray-800">{{ house.house_type }}</p>
            </div>
            <div class="text-center border-l border-gray-100">
              <p class="text-gray-400 text-xs mb-1">面积</p>
              <p class="font-medium text-gray-800">{{ house.area }}㎡</p>
            </div>
            <div class="text-center border-l border-gray-100">
              <p class="text-gray-400 text-xs mb-1">楼层</p>
              <p class="font-medium text-gray-800">{{ house.floor_info || '中层' }}</p>
            </div>
            <div class="text-center border-l border-gray-100">
              <p class="text-gray-400 text-xs mb-1">朝向</p>
              <p class="font-medium text-gray-800">{{ house.orientation || '南北' }}</p>
            </div>
          </div>

          <div class="mt-6">
            <h3 class="font-bold text-gray-800 mb-2">房源描述</h3>
            <p class="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{{ house.description || '暂无详细描述，请联系房东咨询。' }}</p>
          </div>
        </section>

        <!-- 3. 评论区 -->
        <section class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-gray-800 text-lg">用户评价 ({{ reviews.length }})</h3>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500">综合评分</span>
              <EStarScore :score="averageScore" readonly size="small" />
              <span class="text-sm font-bold text-orange-500">{{ averageScore.toFixed(1) }}</span>
            </div>
          </div>

          <div v-if="reviews.length > 0" class="space-y-4">
            <ReviewItem
              v-for="review in reviews"
              :key="review.review_id"
              :data="review"
            />
          </div>
          <EEmpty v-else description="暂无评价，快来成为第一个评价的人吧" />

          <div class="mt-6 flex justify-center">
            <el-button text type="primary" @click="loadMoreReviews">加载更多评价</el-button>
          </div>
        </section>
      </div>

      <!-- 右侧侧边栏 (占 1/3) -->
      <div class="lg:col-span-1 space-y-6">

        <!-- 房东信息卡片 -->
        <section class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-6">
          <h3 class="font-bold text-gray-800 mb-4">房东信息</h3>
          <UserInfoItem :data="landlordInfo" :editable="false" />

          <div class="mt-6 grid grid-cols-2 gap-3">
            <el-button type="primary" class="w-full" @click="handleContact">
              <i class="ri-phone-line mr-1"></i> 联系房东
            </el-button>
            <el-button
              :type="isFavorited ? 'success' : 'default'"
              class="w-full"
              :plain="!isFavorited"
              @click="toggleFavorite"
            >
              <i :class="isFavorited ? 'ri-heart-fill' : 'ri-heart-line'" class="mr-1"></i>
              {{ isFavorited ? '已收藏' : '收藏' }}
            </el-button>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-100">
            <p class="text-xs text-gray-400 text-center">
              <i class="ri-shield-check-line mr-1"></i> 房源已实名认证 · 交易有保障
            </p>
          </div>
        </section>

        <!-- 周边/推荐 (模拟) -->
        <section class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 class="font-bold text-gray-800 mb-4">同小区在售</h3>
          <div class="space-y-4">
            <div v-for="i in 3" :key="i" class="flex gap-3 group cursor-pointer">
              <div class="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <img src="https://via.placeholder.com/150" class="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="">
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600">相似房源标题示例 {{ i }}</p>
                <div class="flex justify-between items-center mt-1">
                  <span class="text-xs text-gray-500">{{ 80 + i * 5 }}㎡</span>
                  <span class="text-xs font-bold text-red-600">{{ (house.price * 0.9).toFixed(1) }}万</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <div v-else-if="!loading && !house" class="flex flex-col items-center justify-center py-20">
      <EEmpty description="未找到该房源信息" />
      <el-button type="primary" class="mt-4" @click="$router.push('/house/list')">返回房源列表</el-button>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';

// 引入方案中定义的组件
import PageContainer from '@/components/PageContainer.vue';
import EPriceDisplay from '@/components/atoms/EPriceDisplay.vue';
import EStatusTag from '@/components/atoms/EStatusTag.vue';
import EStarScore from '@/components/atoms/EStarScore.vue';
import EEmpty from '@/components/atoms/EEmpty.vue';
import ReviewItem from '@/components/molecules/ReviewItem.vue';
import UserInfoItem from '@/components/molecules/UserInfoItem.vue';

// 模拟 API 请求 (实际开发中请替换为 @/api/house 中的方法)
// import { getHouseDetail, getHouseReviews, toggleFavorite as apiToggleFavorite } from '@/api/house';

const route = useRoute();
const loading = ref(true);
const house = ref(null);
const reviews = ref([]);
const currentImage = ref('');
const isFavorited = ref(false);

// 模拟房东数据 (实际应从 house 对象或关联接口获取)
const landlordInfo = ref({
  user_id: 101,
  username: '诚信房东张先生',
  role: 2, // 房东
  phone: '138****8888',
  avatar: 'https://via.placeholder.com/100',
  verified: true
});

// 计算属性：平均评分
const averageScore = computed(() => {
  if (!reviews.value.length) return 0;
  const sum = reviews.value.reduce((acc, cur) => acc + (cur.score || 0), 0);
  return sum / reviews.value.length;
});

// 初始化加载
onMounted(async () => {
  const houseId = route.params.id;
  if (!houseId) {
    loading.value = false;
    return;
  }

  await fetchHouseDetail(houseId);
  await fetchReviews(houseId);
  checkFavoriteStatus(houseId);
  loading.value = false;
});

// 模拟获取详情
const fetchHouseDetail = async (id) => {
  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 600));

  // 模拟数据
  house.value = {
    house_id: id,
    title: '阳光花园 精装三房 南北通透 拎包入住',
    price: 285.5, // 万元
    area: 120.5,
    house_type: '3室2厅2卫',
    district: '朝阳区',
    community: '阳光花园',
    sale_status: 1, // 在售
    audit_status: 1, // 通过
    cover_image: 'https://via.placeholder.com/800x450',
    images: [
      'https://via.placeholder.com/800x450/3b82f6/ffffff?text=Living+Room',
      'https://via.placeholder.com/800x450/10b981/ffffff?text=Bedroom',
      'https://via.placeholder.com/800x450/f59e0b/ffffff?text=Kitchen',
      'https://via.placeholder.com/800x450/ef4444/ffffff?text=Bathroom'
    ],
    description: '此房源位于小区中心位置，采光极佳。业主自住装修，保养非常好，品牌家电家具全部赠送。周边配套成熟，靠近地铁站和学校，非常适合家庭居住。',
    floor_info: '中层/共18层',
    orientation: '南北',
    create_time: '2023-10-15 10:30:00'
  };
  currentImage.value = house.value.cover_image;
};

// 模拟获取评论
const fetchReviews = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  reviews.value = [
    { review_id: 1, user_id: 201, nickname: '购房者小李', avatar: 'https://via.placeholder.com/50', score: 5, content: '房子很不错，房东也很热情，带看很及时。', create_time: '2023-10-20' },
    { review_id: 2, user_id: 202, nickname: '匿名用户', avatar: '', score: 4, content: '位置很好，就是价格稍微有点高，希望能商量。', create_time: '2023-10-18' }
  ];
};

// 检查收藏状态
const checkFavoriteStatus = (id) => {
  // 模拟：假设已登录且已收藏
  isFavorited.value = true;
};

// 交互方法
const toggleFavorite = async () => {
  // 调用 API
  isFavorited.value = !isFavorited.value;
  ElMessage.success(isFavorited.value ? '收藏成功' : '已取消收藏');
};

const handleContact = () => {
  ElMessage.info('正在拨打房东电话：138****8888 (模拟功能)');
  // 实际逻辑：显示电话号码或发起在线聊天
};

const loadMoreReviews = () => {
  ElMessage.warning('暂无更多评价');
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.split(' ')[0];
};
</script>

<style scoped>
/* 简单的淡入动画 */
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 自定义滚动条样式 (可选) */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}
</style>
