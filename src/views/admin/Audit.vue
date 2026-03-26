<template>
  <div class="audit-container p-4">
    <!-- 顶部标题与统计 -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">房源审核管理</h2>
      <el-tag type="warning" effect="dark">待审核数量：{{ pendingCount }}</el-tag>
    </div>

    <!-- 筛选栏 (可选) -->
    <el-card class="mb-4" shadow="hover">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="房源标题">
          <el-input v-model="queryParams.title" placeholder="输入标题搜索" clearable />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="queryParams.auditStatus" placeholder="全部" clearable style="width: 150px">
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已驳回" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchAuditList">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 房源列表表格 -->
    <el-card shadow="never">
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        style="width: 100%"
        header-cell-class-name="bg-gray-50"
      >
        <el-table-column prop="houseId" label="ID" width="80" />
        <el-table-column prop="title" label="房源标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="price" label="价格(万)" width="100">
          <template #default="{ row }">
            <span class="text-red-500 font-semibold">{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="houseType" label="户型" width="100" />
        <el-table-column prop="area" label="面积(㎡)" width="100" />
        <el-table-column prop="district" label="区域" width="120" />

        <el-table-column label="审核状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.auditStatus)">
              {{ getStatusText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.auditStatus === 0"
              type="success"
              size="small"
              @click="handleAudit(row, 1)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.auditStatus === 0"
              type="danger"
              size="small"
              @click="openRejectDialog(row)"
            >
              驳回
            </el-button>
            <el-button
              v-if="row.auditStatus !== 0"
              type="info"
              size="small"
              plain
              disabled
            >
              已处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchAuditList"
          @current-change="fetchAuditList"
        />
      </div>
    </el-card>

    <!-- 驳回原因对话框 -->
    <el-dialog v-model="rejectDialog.visible" title="驳回房源" width="400px">
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="驳回原因" required>
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入具体的驳回原因，以便房东修改"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialog.visible = false">取消</el-button>
          <el-button type="danger" @click="confirmReject(row)" :loading="submitting">确认驳回</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import useAdminStore from '@/stores/admin.js'
import useHouseStore from '@/stores/house.js' // 假设已配置好拦截器

// --- 状态定义 ---
const loading = ref(false)
const pendingCount = ref(0)
const tableData = ref([])
const submitting = ref(false)

// 查询参数
const queryParams = reactive({
  title: '',
  auditStatus: null
})

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 驳回对话框状态
const rejectDialog = ref({
  visible: false,
  currentHouseId: null
})
const rejectForm = reactive({
  reason: ''
})

// --- 方法定义 ---

// 获取状态标签颜色
const getStatusType = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const map = { 0: '待审核', 1: '已通过', 2: '已驳回' }
  return map[status] || '未知'
}
const adminStore = useAdminStore()
// 获取审核列表 (对应接口: GET /admin/audit/list)
const fetchAuditList = async () => {
  loading.value = true
  try {
    const res = await adminStore.getPendingHouses({ ...queryParams, ...pagination })
    console.log(res.data)
    tableData.value = res.data.data?.houses
    pagination.total = res.data.data?.total // 模拟总数
    pendingCount.value = res.data.data.houses.filter(item => item.auditStatus === 0).length

  } catch (error) {
    ElMessage.error('获取房源列表失败' + error)
  } finally {
    loading.value = false
  }
}

// 打开驳回弹窗
const openRejectDialog = (row) => {
  rejectForm.reason = ''
  rejectDialog.value.currentHouseId = row.houseId
  rejectDialog.value.visible = true
}


const confirmReject = async () => {
  if (!rejectForm.reason.trim()) {
    ElMessage.warning('请填写驳回原因')
    return
  }

  submitting.value = true
  try {
    await adminStore.verifyHouse(rejectDialog.value.currentHouseId, 2)

    ElMessage.success('房源已驳回')
    rejectDialog.value.visible = false
    await fetchAuditList() // 刷新列表
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const houseStore = useHouseStore()
// 直接通过 (对应接口: POST /admin/audit/verify)
const handleAudit = async (row, status) => {
  try {
    await ElMessageBox.confirm(`确认通过房源 "${row.title}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await adminStore.verifyHouse(row.houseId, 1)

    ElMessage.success('审核通过')
    await fetchAuditList()
  } catch (err) {
    if (err !== 'cancel') ElMessage.error('操作失败')
  }
}

const resetQuery = () => {
  queryParams.title = ''
  queryParams.auditStatus = null
  fetchAuditList()
}

onMounted(() => {
  fetchAuditList()
})
</script>

<style scoped>
/* 利用 TailwindCss 进行主要布局，此处仅补充少量自定义样式 */
.audit-container {
  background-color: #f5f7fa;
  min-height: 100%;
}

:deep(.el-table th) {
  font-weight: 600;
  color: #333;
}
</style>
