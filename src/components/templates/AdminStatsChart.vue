<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full h-full flex flex-col">
    <!-- 头部控制区 -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h3 class="text-lg font-bold text-gray-800">{{ title }}</h3>
        <p class="text-sm text-gray-500 mt-1">{{ description }}</p>
      </div>

      <!-- 图表类型切换 (仅当支持多种图表时显示) -->
      <el-radio-group
        v-if="showTypeSwitch"
        v-model="chartType"
        size="small"
        class="bg-gray-50 p-1 rounded-lg"
        @change="handleChartTypeChange"
      >
        <el-radio-button label="line">
          <el-icon><TrendCharts /></el-icon> 趋势
        </el-radio-button>
        <el-radio-button label="bar">
          <el-icon><Histogram /></el-icon> 统计
        </el-radio-button>
        <el-radio-button label="pie" v-if="supportPie">
          <el-icon><PieChart /></el-icon> 占比
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 图表容器 -->
    <div class="relative flex-1 w-full min-h-[300px]">
      <div
        ref="chartRef"
        class="w-full h-full"
        v-loading="loading"
        :element-loading-text="'数据加载中...'"
      ></div>

      <!-- 空状态处理 -->
      <div v-if="!loading && (!chartData || chartData.length === 0)" class="absolute inset-0 flex items-center justify-center">
        <el-empty description="暂无统计数据" :image-size="80" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import { TrendCharts, Histogram, PieChart } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// --- Props 定义 ---
const props = defineProps({
  title: {
    type: String,
    default: '数据统计看板'
  },
  description: {
    type: String,
    default: '实时展示平台核心业务数据'
  },
  // 原始数据，格式可根据实际需求调整，此处假设为 { categories: [], values: [] } 或 pie 需要的格式
  chartData: {
    type: Object,
    default: () => ({ categories: [], values: [] })
  },
  // 初始图表类型: 'line', 'bar', 'pie'
  type: {
    type: String,
    default: 'line',
    validator: (val) => ['line', 'bar', 'pie'].includes(val)
  },
  showTypeSwitch: {
    type: Boolean,
    default: true
  },
  supportPie: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// --- Emits 定义 ---
const emit = defineEmits(['type-change']);

// --- 响应式状态 ---
const chartRef = ref(null);
const chartInstance = ref(null);
const chartType = ref(props.type);

// --- 核心方法 ---

/**
 * 初始化 ECharts 实例
 */
const initChart = () => {
  if (!chartRef.value) return;

  // 销毁旧实例防止内存泄漏
  if (chartInstance.value) {
    chartInstance.value.dispose();
  }

  chartInstance.value = echarts.init(chartRef.value);
  updateChartOption();
};

/**
 * 根据数据类型和当前选择的图表类型生成 ECharts Option
 */
const getChartOption = () => {
  const { categories, values, pieData } = props.chartData;
  const isPie = chartType.value === 'pie';

  // 颜色配置 (贴合系统清新风格)
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'];

  if (isPie) {
    // 饼图数据处理 (假设传入的是 pieData: [{name, value}])
    const data = pieData || [];
    return {
      tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
      legend: { top: 'bottom', type: 'scroll' },
      color: colors,
      series: [
        {
          name: props.title,
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: { show: false, position: 'center' },
          emphasis: {
            label: { show: true, fontSize: 16, fontWeight: 'bold' }
          },
          data: data
        }
      ]
    };
  } else {
    // 折线图/柱状图数据处理
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories || [],
        axisLine: { lineStyle: { color: '#ddd' } },
        axisLabel: { color: '#666' }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
      },
      series: [
        {
          name: '数值',
          type: chartType.value,
          data: values || [],
          smooth: chartType.value === 'line', // 折线图平滑曲线
          itemStyle: { color: colors[0] },
          areaStyle: chartType.value === 'line' ? {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.01)' }
            ])
          } : undefined,
          barWidth: '40%',
          showBackground: true,
          backgroundStyle: { color: 'rgba(180, 180, 180, 0.1)' }
        }
      ]
    };
  }
};

/**
 * 更新图表配置
 */
const updateChartOption = () => {
  if (!chartInstance.value) return;

  const option = getChartOption();
  chartInstance.value.setOption(option, true); // true 表示不合并，完全重绘
};

/**
 * 处理图表类型切换
 */
const handleChartTypeChange = (val) => {
  emit('type-change', val);
  nextTick(() => {
    updateChartOption();
  });
};

/**
 * 窗口大小改变时重绘图表
 */
const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize();
  }
};

// --- 生命周期与监听 ---

onMounted(() => {
  // 延迟初始化确保 DOM 已渲染
  nextTick(() => {
    initChart();
  });
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if (chartInstance.value) {
    chartInstance.value.dispose();
    chartInstance.value = null;
  }
});

// 监听数据变化或类型变化，自动更新图表
watch(() => props.chartData, () => {
  if (chartInstance.value) {
    updateChartOption();
  }
}, { deep: true });

watch(() => props.loading, (newVal) => {
  // 如果需要手动控制加载状态的逻辑扩展
});

</script>

<style scoped>
/* TailwindCss 已处理大部分样式，此处仅需少量补充 */
:deep(.el-radio-group) {
  font-size: 13px;
}
:deep(.el-radio-button__inner) {
  padding: 6px 12px;
  border-radius: 6px;
}
:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 6px 0 0 6px;
}
:deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 6px 6px 0;
}
</style>
