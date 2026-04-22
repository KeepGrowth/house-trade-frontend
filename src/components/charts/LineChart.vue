<template>
  <!-- 容器：使用 Tailwind 控制外边距和内部布局 -->
  <div class="w-full h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">

    <!-- 头部：标题与日期选择 -->
    <div class="flex justify-between items-center p-4 border-b border-gray-100">
      <h3 class="text-gray-800 font-semibold text-lg tracking-wide">{{ props.title }}</h3>

      <!-- 日期选择器 -->
      <div class="flex bg-gray-50 rounded-md p-1">
        <button
          v-for="range in dateRanges"
          :key="range.value"
          @click="currentRange = range.value"
          :class="[
            'px-3 py-1 text-xs font-medium rounded transition-all duration-200',
            currentRange === range.value
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          {{ range.label }}
        </button>
      </div>
    </div>

    <!-- 图表容器：宽高 100% -->
    <div ref="chartRef" class="w-full flex-1 min-h-[300px]"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  title:'曲线图组件'
})

// --- 1. 配置与状态 ---
const chartRef = ref(null);
let chartInstance = null;
const currentRange = ref('7d'); // 默认选中 7天

const dateRanges = [
  { label: '近7天', value: '7d' },
  { label: '近30天', value: '30d' },
  { label: '近3月', value: '3m' },
];

// --- 2. 模拟数据生成器 ---
const generateData = (days) => {
  const data = [];
  const baseValue = Math.floor(Math.random() * 5000) + 2000;

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

    // 模拟波动
    const randomChange = Math.floor(Math.random() * 1000) - 400;
    const value = Math.max(0, (data[i-1]?.value || baseValue) + randomChange);

    data.push({
      name: dateStr,
      value: value
    });
  }
  return data;
};

// --- 3. ECharts 配置 (极简商务风) ---
const updateChart = () => {
  if (!chartInstance) return;

  // 根据选择生成数据
  const days = currentRange.value === '7d' ? 7 : currentRange.value === '30d' ? 30 : 90;
  const mockData = generateData(days);
  const dates = mockData.map(item => item.name);
  const values = mockData.map(item => item.value);

  const option = {
    // 提示框
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)', // 白色背景
      borderColor: '#e5e7eb', // 浅灰边框
      textStyle: { color: '#374151' }, // 深灰文字
      padding: [10, 14],
      borderRadius: 6,
      extraCssText: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);', // 阴影
      formatter: (params) => {
        return `<div class="font-medium text-gray-800">${params[0].name}</div>
                <div class="text-blue-600 font-bold mt-1">${params[0].value.toLocaleString()}</div>`;
      }
    },
    // 网格布局
    grid: {
      top: '15%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    // X轴
    xAxis: {
      type: 'category',
      boundaryGap: false, // 曲线顶格
      data: dates,
      axisLine: { show: false }, // 隐藏轴线
      axisTick: { show: false }, // 隐藏刻度
      axisLabel: {
        color: '#9ca3af', // 浅灰文字
        fontSize: 12,
        margin: 16
      }
    },
    // Y轴
    yAxis: {
      type: 'value',
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed', color: '#f3f4f6' } // 虚线网格，极淡
      },
      axisLabel: {
        color: '#9ca3af',
        formatter: (value) => (value >= 1000 ? (value / 1000) + 'k' : value)
      }
    },
    // 系列配置
    series: [
      {
        name: '营收',
        type: 'line',
        smooth: true, // 平滑曲线
        symbol: 'none', // 隐藏数据点圆圈
        sampling: 'average',
        itemStyle: {
          color: '#2563eb' // 商务蓝
        },
        // 区域填充渐变
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(37, 99, 235, 0.2)' }, // 顶部颜色
            { offset: 1, color: 'rgba(37, 99, 235, 0.02)' }  // 底部颜色
          ])
        },
        data: values,
        // 动画效果
        animationDuration: 1000,
        animationEasing: 'cubicOut'
      }
    ]
  };

  chartInstance.setOption(option);
};

// --- 4. 生命周期与监听 ---

// 监听窗口大小变化 (响应式)
let resizeObserver = null;

onMounted(() => {
  // 初始化 ECharts
  chartInstance = echarts.init(chartRef.value);

  // 初始渲染
  updateChart();

  // 监听 DOM 容器大小变化 (比 window.resize 更精准)
  resizeObserver = new ResizeObserver(() => {
    chartInstance.resize();
  });
  resizeObserver.observe(chartRef.value);
});

// 监听日期范围变化
watch(currentRange, () => {
  updateChart();
});

// 组件卸载
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>
