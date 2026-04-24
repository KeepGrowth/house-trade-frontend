<template>
  <div class="dashboard-container p-6">
    <!-- 页面标题 -->
    <h2 class="text-2xl font-bold mb-6 text-gray-800">数据看板
      <!-- 日期范围输入 -->
      <el-date-picker
        prefix-icon="none"
        v-model="dateRange"
        type="daterange"
        unlink-panels
        start-placeholder="开始"
        end-placeholder="结束"
        :shortcuts="shortcuts"
      />
    </h2>

    <el-alert
      type="success"
      :closable="false"
      effect="dark"
      style="margin-bottom: 15px"
    >AI助手提醒：{{ aiText }}
    </el-alert>
    <!-- 核心指标卡片 (可选补充) -->
    <el-row :gutter="20" class="mb-6">
      <el-col :span="3">
        <indicator-card title="用户总数" :data="summaryData.total_users" unit="位" :is-show="false" />
      </el-col>
      <el-col :span="3">
        <indicator-card title="房源总数" :data="summaryData.total_houses" unit="座" :is-show="false" />
      </el-col>
      <el-col :span="3">
        <indicator-card title="待审核房源数" :data="summaryData.total_houses_audit" :unit="'条'" :is-show="false" />
      </el-col>
      <el-col :span="3">
        <indicator-card title="累计订单数" :data="summaryData.total_orders_count" unit="项" :is-show="false" />
      </el-col>
      <el-col :span="3">
        <indicator-card title="累计成交额" :data="summaryData.total_orders_amount" :unit="'万'" :is-show="false" />
      </el-col>
    </el-row>

    <!-- 图表1展示区域 -->
    <el-row :gutter="20" class="h-[600px] mb-19">
      <el-col :span="8">
        <!--用户注册趋势图-->
        <line-chart
          :title="'用户注册趋势'"
          :x-axis="userTrendChartData?.x_axis"
          :y-axis="userTrendChartData?.y_axis"
        />
      </el-col>
      <el-col :span="8">
        <!--房源区域分布-->
        <pie-chart
          :title="'房源区域分布'"
          :data="housePieData"
        />
      </el-col>

    </el-row>


  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import * as echarts from 'echarts'
import useDashBoardStore from '@/stores/dashboard.js'
import LineChart from '@/components/charts/LineChart.vue'
import PieChart from '@/components/charts/PieChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import IndicatorCard from '@/components/IndicatorCard.vue'
import house from '@/stores/house.js'


// 查询参数
const dateRange = ref(['2025-03-10', '2025-04-21'])
const queryParams = computed(() => ({
  startDate: dateRange.value[0],
  endDate: dateRange.value[1]
}))

// 监听数据变化
watch(queryParams, async () => {
  await fetchData()
}, { deep: true })
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

// 获取指标卡数据
const summaryData = ref([
  { title: '总用户数', value: '1,204', icon: 'User' },
  { title: '总房源数', value: '856', icon: 'House' },
  { title: '待审核房源', value: '5', icon: 'Warning' }
])
const fetchCardData = async () => {
  const res = await dashboardStore.getIndicator(queryParams.value)
  if (res.data.code === 200) {
    summaryData.value = res.data.data
  }
}

// 获取用户注册趋势图表数据
const userTrendChartData = ref()
const fetchUserTrendChartData = async () => {
  const res = await dashboardStore.getUserTrendChartData(queryParams.value)
  if (res.data.code === 200) {
    userTrendChartData.value = res.data.data
  }
}


// 获取房源区域分布饼图数据
const housePieData = ref()
const fetchHousePieData = async () => {
  const res = await dashboardStore.getHousePieChartData(queryParams.value)
  if (res.data.code === 200) {
    housePieData.value = res.data.data
  }
}

// 获取成交额趋势数据
const orderLineChartData = ref()
const fetchOrderChartData = async () => {
  const res = await dashboardStore.getOrderChartData(queryParams.value)
  if (res.data.code === 200) {
    orderLineChartData.value = res.data.data
  }
}

// 获取房源新增趋势数据
const houseAddTrendData = ref()
const fetchHouseAddTrendData = async () => {
  const res = await dashboardStore.fetchHouseAddTrendData(queryParams.value)
  if (res.data.code === 200) {
    houseAddTrendData.value = res.data.data
  }
}

const fetchData = async () => {
  await nextTick()
  await fetchCardData()
  await fetchHousePieData()
  await fetchOrderChartData()
  await fetchUserTrendChartData()
  await getAiText()
  await fetchHouseAddTrendData()
}
onMounted(async () => {
  await fetchData()
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
