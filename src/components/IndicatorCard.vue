<template>
  <div class="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md border border-gray-100">
    <!-- 背景装饰：左上角的淡色图标背景 -->
    <div class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-50 opacity-50 blur-2xl"></div>

    <!-- 标题部分 -->
    <div class="relative flex items-center justify-between">
      <h3 class="text-sm font-medium text-gray-500">
        {{ title }}
      </h3>
      <!-- 可选的图标插槽，增加视觉丰富度 -->
      <div v-if="$slots.icon" class="text-gray-400">
        <slot name="icon"></slot>
      </div>
    </div>

    <!-- 核心数据 -->
    <div class="relative mt-2 flex items-baseline">
      <span class="text-3xl font-bold tracking-tight text-gray-900">
        {{ formattedData }}
      </span>
      <span v-if="unit" class="ml-1 text-sm text-gray-500">
        {{ unit }}
      </span>
    </div>

    <!-- 环比/同比数据区域 (可选显示) -->
    <div v-if="isShow" class="relative mt-4 flex items-center text-sm">
      <!-- 趋势图标 -->
      <span :class="trendColorClass">
        <!-- 上升箭头 -->
        <svg v-if="trend === 'up'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <!-- 下降箭头 -->
        <svg v-else-if="trend === 'down'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
        <!-- 持平图标 -->
        <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" />
        </svg>
      </span>

      <!-- 变化数值 -->
      <span :class="trendColorClass" class="ml-1.5 font-medium">
        {{ changeValue }}%
      </span>

      <!-- 变化描述文本 -->
      <span class="ml-2 text-gray-400">
        {{ trendText }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// 定义 Props 接口
interface Props {
  title: string;          // 标题，如：今日新增房源
  data: number | string;  // 核心数据
  isShow?: boolean;       // 是否显示环比数据 (默认 true)
  changeValue?: number;   // 环比/同比数值 (百分比前的数字)
  unit?: string;          // 单位，如：套、㎡
}

// 设置默认 Props
const props = withDefaults(defineProps<Props>(), {
  isShow: true,
  changeValue: 0,
  unit: '',
});

// 格式化核心数据 (处理千分位)
const formattedData = computed(() => {
  if (typeof props.data === 'number') {
    return props.data.toLocaleString();
  }
  return props.data;
});

// 计算趋势方向 (正数为涨，负数为跌，0为平)
const trend = computed(() => {
  if (props.changeValue > 0) return 'up';
  if (props.changeValue < 0) return 'down';
  return 'flat';
});

// 计算趋势文本
const trendText = computed(() => {
  if (props.changeValue > 0) return '较昨日'; // 或者 '环比上月'
  if (props.changeValue < 0) return '较昨日';
  return '较昨日无变化';
});

// 动态颜色类 (Tailwind)
// 注意：在房产交易中，通常红色代表涨(好)，绿色代表跌(坏)，或者根据具体业务定义
// 这里采用通用的金融/数据风格：红涨绿跌 (可根据需求改为 text-green-500)
const trendColorClass = computed(() => {
  if (props.changeValue > 0) return 'text-red-500';
  if (props.changeValue < 0) return 'text-green-500';
  return 'text-gray-400';
});
</script>
