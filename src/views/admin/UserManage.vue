<template>
  <div class="user-manage-container">
    <!-- 顶部操作栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="queryParams.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="queryParams.role" placeholder="全部角色" clearable style="width: 150px">
            <el-option label="购房者" :value="1" />
            <el-option label="房东" :value="2" />
            <el-option label="管理员" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户列表表格 -->
    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="userList"
        border
        style="width: 100%"
        header-cell-class-name="table-header-gray"
      >
        <el-table-column prop="user_id" label="ID" width="80" align="center" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="phone" label="联系电话" width="120" />

        <!-- 角色列 -->
        <el-table-column label="角色" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 状态列 -->
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '已冻结' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="create_time" label="注册时间" width="180" align="center" />

        <!-- 操作列 -->
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              :type="row.status === 1 ? 'warning' : 'success'"
              @click="handleStatusChange(row)"
            >
              {{ row.status === 1 ? '冻结' : '解封' }}
            </el-button>
            <!-- 可根据需求添加删除按钮，需二次确认 -->
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchUserList"
          @current-change="fetchUserList"
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

// --- 状态定义 ---
const loading = ref(false)
const userList = ref([])
const total = ref(0)

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  username: '',
  role: null
})

// --- 方法定义 ---

// 获取角色标签文本
const getRoleLabel = (role) => {
  const map = { 1: '购房者', 2: '房东', 3: '管理员' }
  return map[role] || '未知'
}

// 获取角色标签颜色
const getRoleType = (role) => {
  const map = { 1: '', 2: 'warning', 3: 'danger' }
  return map[role] || 'info'
}

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    // 对应后端接口：GET /api/v1/admin/users/list (需在 backend 实现)
    // 这里模拟请求结构，实际请替换为真实接口路径
    const { data } = await request.get('/admin/users/list', { params: queryParams })

    // 假设后端返回格式：{ code: 200, data: { list: [...], total: 100 } }
    userList.value = data.list || []
    total.value = data.total || 0
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.page = 1
  fetchUserList()
}

// 重置
const resetQuery = () => {
  queryParams.username = ''
  queryParams.role = null
  handleSearch()
}

// 切换用户状态 (冻结/解封)
const handleStatusChange = (row) => {
  const actionText = row.status === 1 ? '冻结' : '解封'
  const newStatus = row.status === 1 ? 0 : 1

  ElMessageBox.confirm(
    `确定要${actionText}用户 "${row.username}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      // 对应后端接口：PUT /api/v1/admin/users/status
      await request.put(`/admin/users/${row.user_id}/status`, { status: newStatus })

      ElMessage.success(`${actionText}成功`)
      fetchUserList() // 刷新列表
    } catch (error) {
      ElMessage.error(`${actionText}失败`)
    }
  }).catch(() => {})
}

// 初始化加载
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped lang="scss">
.user-manage-container {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;
    .search-form {
      display: flex;
      flex-wrap: wrap;
    }
  }

  .table-card {
    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}

// 表头背景色微调 (可选)
:deep(.table-header-gray) {
  background-color: #f5f7fa !important;
  color: #606266;
  font-weight: 600;
}
</style>
