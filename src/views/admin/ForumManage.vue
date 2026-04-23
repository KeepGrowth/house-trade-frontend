<template>
  <div class="post-manage-container">
    <!-- 顶部筛选栏 (可选) -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="帖子状态" style="width: 200px">
          <el-select v-model="queryParams.status" placeholder="全部">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchPosts">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 评价列表表格 -->
    <el-card class="table-card">
      <el-table :data="postList" style="width: 100%" v-loading="loading">
        <el-table-column prop="postId" label="ID" />
        <el-table-column label="房源Id">
          <template #default="scope">
            <div class="house-info">
              <span class="title">{{ scope.row.houseId }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 用户信息 -->
        <el-table-column prop="userId" label="评价用户ID" />

        <!-- 评价内容 (可折叠或省略显示) -->
        <el-table-column prop="content" label="标题" show-overflow-tooltip />

        <!-- 状态 -->
        <el-table-column label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              :type="scope.row.status === 1 ? 'warning' : 'success'"
              @click="toggleStatus(scope.row)"
            >
              {{ scope.row.status === 1 ? '禁用' : '恢复显示' }}
            </el-button>
            <el-button size="small" type="danger" @click="deletePost(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="fetchPosts"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import useAdminStore from '@/stores/admin.js'
import usePostStore from '@/stores/posts.js'

// 状态定义
const loading = ref(false)
const postList = ref([])
const total = ref(0)

const queryParams = ref({
  title: '',
  status: 0,
  page: 1,
  pageSize: 10
})

const postStore = usePostStore()
// 获取评价列表
const fetchPosts = async () => {
  loading.value = true
  try {
    const res = await postStore.queryPosts(queryParams.value)
    postList.value = res.data.data.postList
    total.value = res.data.data.total
  } catch (error) {
    ElMessage.error('加载失败' + error)
  } finally {
    loading.value = false
  }
}

// 切换显示/隐藏状态
const toggleStatus = async (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 0 ? '隐藏' : '恢复'
  try {
    await postStore.changeStatus(row.postId)
    ElMessage.success(`${actionText}成功`)
    row.status = newStatus // 本地更新
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 删除评价
const deletePost = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评价吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await postStore.delPost(row.postId)
    ElMessage.success('删除成功')
    await fetchPosts() // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(async () => {
  await fetchPosts()
})
</script>

<style scoped>
.post-manage-container {
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
