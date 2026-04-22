<template>
  <!-- 外层容器：使用 Tailwind 进行商务风格排版 -->
  <div class="relative flex flex-col w-full h-full bg-white rounded-lg shadow-sm border border-gray-100 p-4">

    <!-- 标题区域 -->
    <div class="flex justify-between items-center mb-4">
      <div>
        <h3 class="text-lg font-bold text-gray-800">{{ title }}</h3>
        <p class="text-xs text-gray-400 mt-1">数据来源：模拟业务系统</p>
      </div>
      <!-- 可选：日期范围展示 -->
      <div v-if="dateRange" class="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">
        {{ dateRange }}
      </div>
    </div>

    <!-- 图表容器：宽高100% -->
    <div ref="chartRef" class="flex-1 w-full min-h-0"></div>

    <!-- 加载状态 -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
      <span class="text-gray-500 text-sm">加载中...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

// --- Props 定义 ---
const props = defineProps({
  title: {
    type: String,
    default: '月度销售趋势分析'
  },
  dateRange: {
    type: String,
    default: '最近 7 天'
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// --- Refs ---
const chartRef = ref(null);
let chartInstance = null;

// --- 模拟数据生成器 ---
// 根据传入的日期范围字符串，生成不同的模拟数据
const generateMockData = (rangeStr) => {
  const days = rangeStr.includes('30') ? 30 : 7; // 简单逻辑判断
  const categories = [];
  const data = [];

  for (let i = 0; i < days; i++) {
    // 生成日期标签 (例如: 10-01)
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    categories.push(`${date.getMonth() + 1}/${date.getDate()}`);

    // 生成随机数值 (500 - 5000)
    data.push(Math.floor(Math.random() * 4500) + 500);
  }
  return { categories, data };
};

// --- ECharts 配置与初始化 ---
const initChart = () => {
  if (!chartRef.value) return;

  // 1. 初始化实例
  chartInstance = echarts.init(chartRef.value);

  // 2. 获取数据
  const { categories, data } = generateMockData(props.dateRange);

  // 3. 配置项 (商务风格)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#e5e7eb',
      textStyle: { color: '#374151' },
      formatter: '{b}: <b style="color:#2563eb">{c}</b>'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%', // 留出标题空间
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#6b7280',
        fontSize: 12,
        interval: 0, // 强制显示所有标签，如果太多可能会重叠，移动端可考虑 rotate
        rotate: categories.length > 10 ? 45 : 0
      },
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed', color: '#f3f4f6' }
      }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed', color: '#f3f4f6' }
      },
      axisLabel: { color: '#6b7280' }
    },
    series: [
      {
        name: '销售额',
        type: 'bar',
        data: data,
        barWidth: '60%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0], // 顶部圆角
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#3b82f6' },   // 顶部颜色 (蓝色)
            { offset: 1, color: '#60a5fa' }    // 底部颜色 (浅蓝)
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#2563eb' },
              { offset: 1, color: '#3b82f6' }
            ])
          }
        }
      }
    ]
  };

  chartInstance.setOption(option);
};

// --- 监听与生命周期 ---

// 监听窗口大小变化，实现响应式
const handleResize = () => {
  chartInstance && chartInstance.resize();
};

// 监听 dateRange 变化，更新数据
watch(() => props.dateRange, () => {
  // 实际项目中这里应该调用 API
  // 这里为了演示，重新生成数据并 setOption
  const { categories, data } = generateMockData(props.dateRange);
  chartInstance.setOption({
    xAxis: { data: categories },
    series: [{ data: data }]
  });
});

onMounted(() => {
  nextTick(() => {
    initChart();
    window.addEventListener('resize', handleResize);
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>

<style scoped>
/* 如果需要额外的非 Tailwind 样式可以在这里添加 */
</style>
