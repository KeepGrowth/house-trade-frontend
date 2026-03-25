<template>
  <div
      class="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer flex flex-col h-full"
      @click="handleCardClick"
  >
    <!-- 图片区域 -->
    <div class="relative aspect-[4/3] overflow-hidden bg-gray-100">
      <el-image
          :src="house.coverImage || '/placeholder-house.jpg'"
          fit="cover"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          :preview-src-list="house.images?.length ? house.images : [house.coverImage]"
      >
        <template #error>
          <div class="flex items-center justify-center w-full h-full text-gray-400">
            <el-icon><PictureFilled /></el-icon>
          </div>
        </template>
      </el-image>

      <!-- 顶部标签：审核状态或特色标签 -->
      <div class="absolute top-2 left-2 flex gap-1">
        <el-tag v-if="house.auditStatus === 0" size="small" type="warning" effect="dark">
          审核中
        </el-tag>
        <el-tag v-else-if="house.auditStatus === 2" size="small" type="danger" effect="dark">
          已驳回
        </el-tag>
        <el-tag v-if="house.isNew" size="small" type="success" effect="dark">
          新上
        </el-tag>
      </div>

      <!-- 右上角收藏按钮 -->
      <button
          class="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors z-10"
          @click.stop="toggleFavorite"
      >
        <el-icon :size="20" :color="isFavorited ? '#ef4444' : '#9ca3af'">
          <StarFilled v-if="isFavorited" />
          <Star v-else />
        </el-icon>
      </button>

      <!-- 底部状态遮罩 (如已售) -->
      <div v-if="house.saleStatus !== 1" class="absolute inset-0 bg-black/60 flex items-center justify-center">
        <el-tag size="large" :type="house.saleStatus === 2 ? 'success' : 'info'" effect="dark">
          {{ saleStatusText }}
        </el-tag>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="p-4 flex flex-col flex-grow">
      <!-- 价格行 -->
      <div class="flex items-baseline gap-2 mb-2">
        <span class="text-2xl font-bold text-red-500">
          {{ formatPrice(house.price) }}
        </span>
        <span class="text-sm text-gray-500">万元</span>
        <span v-if="house.pricePerArea" class="text-xs text-gray-400 ml-auto">
          {{ house.pricePerArea }}元/㎡
        </span>
      </div>

      <!-- 标题 -->
      <h3 class="text-lg font-semibold text-gray-800 line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
        {{ house.title }}
      </h3>

      <!-- 核心属性网格 -->
      <div class="grid grid-cols-2 gap-y-2 text-sm text-gray-600 mb-3">
        <div class="flex items-center gap-1">
          <el-icon><HomeFilled /></el-icon>
          <span>{{ house.houseType }}</span>
        </div>
        <div class="flex items-center gap-1">
          <el-icon><ScaleToOriginal /></el-icon>
          <span>{{ house.area }}㎡</span>
        </div>
        <div class="flex items-center gap-1 col-span-2">
          <el-icon><LocationFilled /></el-icon>
          <span class="truncate">{{ house.district }} - {{ house.community }}</span>
        </div>
      </div>

      <!-- 分割线 -->
      <div class="border-t border-gray-100 my-2"></div>

      <!-- 底部信息：房东与时间 -->
      <div class="flex items-center justify-between text-xs text-gray-500 mt-auto">
        <div class="flex items-center gap-1.5">
          <el-avatar :size="24" :src="house.landlordAvatar" class="bg-gray-200">
            {{ house.landlordName?.charAt(0) }}
          </el-avatar>
          <span>{{ house.landlordName }}</span>
        </div>
        <span>{{ formatTime(house.createTime) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  Star,
  StarFilled,
  PictureFilled,
  HomeFilled,
  ScaleToOriginal,
  LocationFilled
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 定义 Props
interface HouseProp {
  house_id: number;
  title: string;
  price: number;
  area: number;
  house_type: string;
  district: string;
  community: string;
  sale_status: number; // 1-在售, 2-已售, 3-已下架
  audit_status?: number; // 0-待审, 1-通过, 2-驳回
  cover_image?: string;
  images?: string[];
  landlord_name?: string;
  landlord_avatar?: string;
  create_time?: string;
  price_per_area?: number;
  is_new?: boolean;
}

const props = defineProps<{
  house: HouseProp;
  isFavorited?: boolean; // 外部传入收藏状态，或由内部管理
}>();

const emit = defineEmits<{
  (e: 'update:favorite', id: number, status: boolean): void;
  (e: 'click', id: number): void;
}>();

const router = useRouter();
const localFavorite = ref(props.isFavorited ?? false);

// 计算属性：是否收藏（优先使用外部传入，否则使用内部状态）
const isFavorited = computed({
  get: () => props.isFavorited ?? localFavorite.value,
  set: (val) => {
    if (props.isFavorited === undefined) {
      localFavorite.value = val;
    }
  }
});

// 销售状态文本映射
const saleStatusText = computed(() => {
  switch (props.house.sale_status) {
    case 2: return '已售';
    case 3: return '已下架';
    default: return '';
  }
});

// 格式化价格 (简单处理，实际可用 EPriceDisplay 原子组件替换)
const formatPrice = (price: number) => {
  return price.toFixed(1);
};

// 格式化时间 (相对时间或日期)
const formatTime = (timeStr?: string) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString();
};

// 交互逻辑：切换收藏
const toggleFavorite = () => {
  // 这里应调用 Pinia store 进行实际的后端请求
  // const userStore = useUserStore();
  // await userStore.toggleFavorite(props.house.house_id);

  const newStatus = !isFavorited.value;
  emit('update:favorite', props.house.house_id, newStatus);

  // 仅做本地反馈演示
  ElMessage.success(newStatus ? '已加入收藏' : '已取消收藏');
};

// 交互逻辑：点击卡片跳转
const handleCardClick = () => {
  emit('click', props.house.house_id);
  router.push(`/house/${props.house.house_id}`);
};
</script>

<style scoped>
/*
  TailwindCSS 4 通常不需要额外的 scoped CSS，
  除非有非常特殊的动画或第三方库覆盖需求。
  此处利用 group-hover 实现图片放大和标题变色效果。
*/
</style>
