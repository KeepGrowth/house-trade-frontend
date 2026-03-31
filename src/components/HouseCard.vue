<script setup>
import { computed } from 'vue';

// 定义组件接收的 props
const props = defineProps({
  data: {
    type: Object,
    required: true,
    // 预期数据结构示例:
    // {
    //   house_id: 101,
    //   title: "阳光花园三居室",
    //   address: "北京市朝阳区朝阳公园南路",
    //   price: 8500000,
    //   image_url: "https://...",
    //   bedrooms: 3,
    //   bathrooms: 2,
    //   area: 120, // 平方米
    //   tags: ["近地铁", "精装", "南北通透"]
    // }
  }
});

// 定义组件事件
const emit = defineEmits(['click']);

// 格式化价格 (例如: 850万)
const formattedPrice = computed(() => {
  const price = props.data.price;
  if (price >= 10000) {
    return `${(price / 10000).toFixed(1)}万`;
  }
  return price.toLocaleString();
});

// 处理点击事件，透传 house_id
const handleCardClick = () => {
  emit('click', props.data.houseId);
};
</script>

<template>
  <div
    class="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer h-full"
    @click="handleCardClick"
  >
    <!-- 图片区域 -->
    <div class="relative aspect-[4/3] overflow-hidden bg-gray-200">
      <img
        :src="data.imageUrls[0].imageUrl || 'https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Image'"
        :alt="data.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <!-- 价格标签 (绝对定位) -->
      <div class="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
        <span class="text-red-600 font-bold text-lg">¥ {{ formattedPrice }}万</span>
      </div>

      <!-- 标签 (右上角) -->
      <div v-if="data.tags && data.tags.length" class="absolute top-3 right-3 flex gap-1">
        <span
          v-for="tag in data.tags.slice(0, 2)"
          :key="tag"
          class="bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-md"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="flex flex-col flex-1 p-4">
      <!-- 标题 -->
      <h3 class="text-gray-900 font-semibold text-lg leading-tight mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
        {{ data.title }}
      </h3>

      <!-- 地址 -->
      <div class="flex items-start text-gray-500 text-sm mb-4">
        <svg class="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span class="line-clamp-1">{{ data.district }}</span>
      </div>

      <!-- 分隔线 -->
      <div class="border-t border-gray-100 my-auto pt-4"></div>

      <!-- 底部指标-->
      <div class="flex justify-between items-center text-gray-600 text-sm mt-2">
        <div class="flex items-center gap-1">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          <span>{{ data.houseTypeLabel }}</span>
        </div>
        <div class="w-px h-4 bg-gray-200"></div>
<!--        出售状态-->
        <div class="flex items-center gap-1">
          <el-tag type="success"  v-if="data.saleStatus===1">在售</el-tag>
          <el-tag type="warning" v-else-if="data.saleStatus===2">已售</el-tag>
          <el-tag type="danger" v-else>已下架</el-tag>
        </div>
        <div class="w-px h-4 bg-gray-200"></div>
        <div class="flex items-center gap-1">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
          <span>{{ data.area }}㎡</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tailwind CSS v4 通常不需要额外的自定义 CSS，
   如果需要覆盖特定行为，可以在这里写原生 CSS */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
