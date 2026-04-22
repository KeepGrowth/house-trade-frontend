<template>
  <!-- 外层容器：使用 Tailwind 进行商务风格排版 -->
  <div class="relative flex flex-col w-full h-full bg-white rounded-lg shadow-sm border border-gray-100 p-4">

    <!-- 标题区域 -->
    <div class="flex justify-between items-center mb-4">
      <div>
        <h3 class="text-lg font-bold text-gray-800">{{ title }}</h3>
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
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

// --- Props 定义 ---
const props = defineProps({
  title: {
    type: String,
    default: '月度销售趋势分析'
  },
  data: {
    categories: [],
    data: []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// --- Refs ---
const chartRef = ref(null)
let chartInstance = null

// --- ECharts 配置与初始化 ---
const initChart = () => {
  if (!chartRef.value) return

  // 1. 初始化实例
  chartInstance = echarts.init(chartRef.value)

  // 2. 获取数据
  const { categories, data } = props.data

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
  }

  chartInstance.setOption(option)
}

// --- 监听与生命周期 ---
watch(props, () => {
  initChart()
})

// 监听窗口大小变化，实现响应式
const handleResize = () => {
  chartInstance && chartInstance.resize()
}

// 监听 dateRange 变化，更新数据
watch(() => props.dateRange, () => {
  // 实际项目中这里应该调用 API
  // 这里为了演示，重新生成数据并 setOption
  const { categories, data } = generateMockData(props.dateRange)
  chartInstance.setOption({
    xAxis: { data: categories },
    series: [{ data: data }]
  })
})

onMounted(() => {
  nextTick(() => {
    initChart()
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
/* 如果需要额外的非 Tailwind 样式可以在这里添加 */
</style>
