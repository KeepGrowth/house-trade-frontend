<template>
  <div class="relative w-full h-full min-h-[300px] bg-white rounded-lg shadow-sm p-4">
    <!-- 顶部控制栏：日期选择 -->
    <div class="flex justify-between items-center mb-4 px-2">
      <h3 class="text-gray-700 font-medium text-lg tracking-wide">{{ props.title }}</h3>
      <div class="flex items-center gap-2">
        <input
          type="date"
          v-model="dateRange.start"
          class="text-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 px-2 py-1 text-gray-600 outline-none border"
        />
        <span class="text-gray-400 text-xs">至</span>
        <input
          type="date"
          v-model="dateRange.end"
          class="text-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 px-2 py-1 text-gray-600 outline-none border"
        />
        <button
          @click="updateData"
          class="ml-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors duration-200"
        >
          查询
        </button>
      </div>
    </div>

    <!-- 图表容器 -->
    <div ref="chartRef" class="flex-1 w-full h-full"></div>

    <!-- 加载状态 -->
    <div v-if="loading" class="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  title: ''
})

// --- 状态定义 ---
const chartRef = ref(null)
let chartInstance = null
const loading = ref(false)

// 日期范围默认值
const dateRange = ref({
  start: '2023-10-01',
  end: '2023-10-31'
})

// --- 极简商务配色方案 ---
// 这种配色去除了高饱和度颜色，显得更专业、冷静
const colorPalette = [
  '#4F46E5', // 靛蓝 (主色)
  '#10B981', // 翠绿
  '#F59E0B', // 琥珀
  '#EF4444', // 柔和红
  '#6366F1', // 浅紫
  '#8B5CF6'  // 紫色
]

// --- 模拟数据生成器 ---
const generateMockData = () => {
  const categories = ['电子产品', '家居生活', '服饰鞋包', '美妆护肤', '食品饮料', '其他']
  return categories.map((name, index) => ({
    name,
    value: Math.floor(Math.random() * 5000) + 1000, // 随机数值
    itemStyle: {
      color: colorPalette[index % colorPalette.length],
      borderRadius: 4 // 圆角让饼图看起来更现代
    }
  }))
}

// --- ECharts 配置 ---
const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const option = {
    color: colorPalette,
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff', // 白色背景更商务
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' },
      padding: [10, 15],
      formatter: '{b}: {c} ({d}%)' // 显示：类别: 数值 (百分比)
    },
    // 关闭图例，保持极简，或者放在底部
    legend: {
      bottom: '0%',
      left: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#6B7280', fontSize: 12 }
    },
    series: [
      {
        name: '营收',
        type: 'pie',
        radius: ['40%', '70%'], // 环形图，中间镂空
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{d}%', // 显示类别和百分比
          color: '#4B5563',
          fontSize: 12,
          lineHeight: 16
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 15,
          smooth: true,
          lineStyle: { color: '#9CA3AF', width: 1 }
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#111827'
          },
          scale: true, // 悬停放大
          scaleSize: 5
        },
        data: generateMockData()
      }
    ]
  }

  chartInstance.setOption(option)
}

// --- 模拟数据更新逻辑 ---
const updateData = () => {
  loading.value = true
  // 模拟网络请求延迟
  setTimeout(() => {
    if (chartInstance) {
      const newData = generateMockData()
      chartInstance.setOption({ series: [{ data: newData }] })
    }
    loading.value = false
  }, 600)
}

// --- 响应式处理 ---
const handleResize = () => {
  chartInstance?.resize()
}

// --- 生命周期 ---
onMounted(() => {
  nextTick(() => {
    initChart()
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})

// 监听窗口大小变化（Tailwind 断点切换时可能需要微调，但 ECharts resize 通常足够）
watch(() => dateRange.value, () => {
  // 日期改变时也可以触发更新，这里为了演示保留按钮点击
  // updateData();
}, { deep: true })

</script>

<style scoped>
/* 如果需要覆盖一些默认样式，可以在这里添加 */
</style>
