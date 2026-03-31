<template>
  <div class="review-manage-container">
    <!-- 顶部筛选栏 (可选) -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="房源标题">
          <el-input v-model="queryParams.houseTitle" placeholder="搜索房源" />
        </el-form-item>
        <el-form-item label="评价状态" style="width: 200px">
          <el-select v-model="queryParams.status" placeholder="全部">
            <el-option label="显示中" :value="1" />
            <el-option label="已隐藏" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchReviews">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 评价列表表格 -->
    <el-card class="table-card">
      <el-table :data="reviewList" style="width: 100%" v-loading="loading">
        <el-table-column prop="reviewId" label="ID" width="80" />
        <el-table-column label="房源Id">
          <template #default="scope">
            <div class="house-info">
              <span class="title">{{ scope.row.houseId }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 用户信息 -->
        <el-table-column prop="userId" label="评价用户ID" width="120" />

        <!-- 评分 -->
        <el-table-column label="评分" width="100">
          <template #default="scope">
            <el-rate v-model="scope.row.score" disabled show-text text-color="#ff9900" />
          </template>
        </el-table-column>

        <!-- 评价内容 (可折叠或省略显示) -->
        <el-table-column prop="content" label="评价内容" min-width="100" show-overflow-tooltip />

        <!-- 状态 -->
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '显示中' : '已隐藏' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              :type="scope.row.status === 1 ? 'warning' : 'success'"
              @click="toggleStatus(scope.row)"
            >
              {{ scope.row.status === 1 ? '隐藏评论' : '恢复显示' }}
            </el-button>
            <el-button size="small" type="danger" @click="deleteReview(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="fetchReviews"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// 假设已封装好 axios 实例
import request from '@/utils/request'
import useAdminStore from '@/stores/admin.js'
import useReviewStore from '@/stores/reviews.js'

// 状态定义
const loading = ref(false)
const reviewList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const queryParams = reactive({
  houseTitle: '',
  status: null
})

const adminStore = useAdminStore()
const reviewStore = useReviewStore()
// 获取评价列表
const fetchReviews = async () => {
  loading.value = true
  try {
    const res = await adminStore.getReviews({

      page: currentPage.value,
      pageSize: pageSize.value,
      ...queryParams

    })
    // 假设后端返回格式 { code: 200, data: { list: [], total: 100 } }
    reviewList.value = res.data.data.reviews
    total.value = res.data.data.total
  } catch (error) {
    ElMessage.error('加载评价列表失败')
  } finally {
    loading.value = false
  }
}

// 切换显示/隐藏状态
const toggleStatus = async (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 0 ? '隐藏' : '恢复'

  try {
    await reviewStore.changeStatus(row.reviewId)
    ElMessage.success(`${actionText}成功`)
    row.status = newStatus // 本地更新
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 删除评价
const deleteReview = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评价吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await reviewStore.delReview(row.reviewId)
    ElMessage.success('删除成功')
    await fetchReviews() // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  fetchReviews()
})
</script>

<style scoped>
.review-manage-container {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.house-info {
  display: flex;
  flex-direction: column;
}

.house-info .title {
  font-weight: bold;
  color: #333;
}

.house-info .price {
  font-size: 12px;
  color: #f56c6c;
  margin-top: 4px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
