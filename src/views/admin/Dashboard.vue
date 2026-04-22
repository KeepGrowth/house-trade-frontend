<template>
  <div class="dashboard-container p-6">
    <!-- 页面标题 -->
    <h2 class="text-2xl font-bold mb-6 text-gray-800">数据看板</h2>
    <el-alert
      type="success"
      :closable="false"
      effect="dark"
      style="margin-bottom: 15px"
    >AI助手提醒：{{ aiText }}
    </el-alert>
    <!-- 核心指标卡片 (可选补充) -->
    <el-row :gutter="20" class="mb-6">
      <el-col :span="6" v-for="(item, index) in summaryData" :key="index">
        <indicator-card title="用户总数" data="23" :is-show="false" />
      </el-col>
    </el-row>

    <!-- 图表1展示区域 -->
    <el-row :gutter="20" class="h-[600px] mb-19">
      <el-col :span="8">
        <!--用户注册趋势图-->
        <line-chart
          :title="'用户注册趋势'"
        />
      </el-col>
      <el-col :span="8">
        <!--房源区域分布-->
        <pie-chart
          :title="'房源区域分布'"
        />
      </el-col>
      <el-col :span="8">
        <!--成交额分布-->
        <bar-chart
          :title="'成交额趋势'"
        />
      </el-col>
    </el-row>
    <!--图表2展示区域-->
    <el-row :gutter="20" class="h-[800px] mt-19">
      <el-col :span="24">
        <line-chart
          :title="'房源变化'"
        />
      </el-col>
    </el-row>

  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import useDashBoardStore from '@/stores/dashboard.js'
import IndicatorCard from '@/components/IndicatorCard.vue'
import LineChart from '@/components/charts/LineChart.vue'
import PieChart from '@/components/charts/PieChart.vue'
import BarChart from '@/components/charts/BarChart.vue'

// 响应式引用
const userTrendChart = ref(null)
const districtChart = ref(null)
const houseStatusChart = ref(null)

// 模拟核心指标数据 (实际应从后端获取)
const summaryData = ref([
  { title: '总用户数', value: '1,204', icon: 'User' },
  { title: '总房源数', value: '856', icon: 'House' },
  { title: '待审核房源', value: '5', icon: 'Warning' }
])

// 初始化图表函数
const initCharts = () => {
  // 1. 注册用户趋势图 (折线图)
  const trendChart = echarts.init(userTrendChart.value)
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    yAxis: { type: 'value' },
    series: [{
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'line',
      smooth: true,
      areaStyle: { opacity: 0.3 },
      itemStyle: { color: '#409EFF' }
    }]
  })

  // 2. 区域房源占比 (饼图)
  const districtChar = echarts.init(districtChart.value)
  districtChar.setOption({
    tooltip: { trigger: 'item' },
    legend: { top: '5%', left: 'center' },
    series: [{
      name: '房源数量',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      data: [
        { value: 1048, name: '朝阳区' },
        { value: 735, name: '海淀区' },
        { value: 580, name: '西城区' },
        { value: 484, name: '东城区' }
      ]
    }]
  })

  // 3. 房源状态统计 (柱状图)
  const statusChart = echarts.init(houseStatusChart.value)
  statusChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {},
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['在售', '已售', '已下架', '待审核'] },
    yAxis: { type: 'value' },
    series: [{
      data: [320, 120, 50, 15],
      type: 'bar',
      barWidth: '40%',
      itemStyle: { color: '#67C23A' }
    }]
  })
}

// 监听窗口大小变化以自适应图表
const handleResize = () => {
  echarts.getInstanceByDom(userTrendChart.value)?.resize()
  echarts.getInstanceByDom(districtChart.value)?.resize()
  echarts.getInstanceByDom(houseStatusChart.value)?.resize()
}
const dashboardStore = useDashBoardStore()

// 得到AI助手的整体分析。
const aiText = ref('')
const getAiText = async () => {
  try {
    const res = await dashboardStore.getAiStats()
    if (res.data.code === 200) {
      console.log(res.data.data.text)
      aiText.value = res.data.data.text
    }
  } catch (error) {
    console.error('获取统计数据失败', error)
  }
}
onMounted(async () => {
  await nextTick()
  initCharts()
  window.addEventListener('resize', handleResize)

  // 调用后端接口 /dashboard 获取真实数据并更新图表 option
  try {
    const res = await dashboardStore.getIndicator()
    if (res.data.code === 200) {
      // 使用 res.data.data 更新上述图表配置
      console.log(res.data.code)
    }
  } catch (error) {
    console.error('获取统计数据失败', error)
  }

  await getAiText()
})
</script>

<style scoped>
.dashboard-container {
  background-color: #f5f7fa; /* 浅灰背景 */
  min-height: 100vh;
}

.stat-card:hover {
  transform: translateY(-5px);
  transition: transform 0.3s;
}
</style>
