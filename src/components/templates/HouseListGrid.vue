<template>
  <div class="w-full">
    <!-- 房源列表网格区域 -->
    <div v-if="houseList && houseList.length > 0"
         class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      <div
        v-for="house in houseList"
        :key="house.house_id"
        class="animate-fade-in-up"
      >
        <!--
          根据场景切换卡片类型：
          - 普通列表/首页推荐：使用 HouseCardSimple
          - 个人中心/收藏页：使用 HouseCardFull (含操作按钮)
          此处默认使用完整版以展示交互，可通过 prop 控制
        -->
        <component
          :is="cardType === 'full' ? 'HouseCardFull' : 'HouseCardSimple'"
          :house-data="house"
          @click="$emit('card-click', house)"
          class="cursor-pointer hover:shadow-lg transition-shadow duration-300"
        />
      </div>
    </div>

    <!-- 空状态展示 (原子组件 EEmpty) -->
    <div v-else class="py-20 flex justify-center">
      <EEmpty
        description="暂无符合条件的房源"
        :image-size="200"
      >
        <template #extra>
          <el-button type="primary" @click="$emit('reset-filter')">重置筛选条件</el-button>
        </template>
      </EEmpty>
    </div>

    <!-- 分页区域 (公共组件 Pagination) -->
    <div
      v-if="houseList && houseList.length > 0 && paginationConfig.total > 0"
      class="flex justify-center mt-8 border-t border-gray-100 pt-6"
    >
      <Pagination
        v-model:current-page="paginationConfig.currentPage"
        v-model:page-size="paginationConfig.pageSize"
        :total="paginationConfig.total"
        :page-sizes="[12, 24, 48]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
// 引入方案中定义的分子组件
import HouseCardSimple from '@/components/molecules/HouseCardSimple.vue';
import HouseCardFull from '@/components/molecules/HouseCardFull.vue';
// 引入方案中定义的原子组件和公共组件
import EEmpty from '@/components/atoms/EEmpty.vue';
import Pagination from '@/components/Pagination.vue';

/**
 * Props 定义
 */
interface HouseItem {
  house_id: number;
  title: string;
  price: number;
  area: number;
  house_type: string;
  district: string;
  community: string;
  // 其他字段根据实际数据结构补充
}

interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  total: number;
}

const props = defineProps<{
  houseList: HouseItem[];
  paginationConfig: PaginationConfig;
  cardType?: 'simple' | 'full'; // 控制卡片展示模式
}>();

/**
 * Emits 定义
 */
const emit = defineEmits<{
  'update:paginationConfig': [value: PaginationConfig];
  'card-click': [house: HouseItem];
  'reset-filter': [];
}>();

// 内部计算属性，方便处理分页逻辑
const internalPagination = computed({
  get: () => props.paginationConfig,
  set: (val) => emit('update:paginationConfig', val)
});

/**
 * 事件处理
 */
const handleSizeChange = (val: number) => {
  internalPagination.value.pageSize = val;
  internalPagination.value.currentPage = 1; // 重置页码到第一页
};

const handleCurrentChange = (val: number) => {
  internalPagination.value.currentPage = val;
};
</script>

<style scoped>
/*
  TailwindCss 已处理大部分样式
  此处仅添加必要的自定义动画或覆盖
*/
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 针对不同屏幕的网格间隙微调，已在 template 中使用 grid gap 类 */
</style>
