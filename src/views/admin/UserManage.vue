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
        :key="userList.length"
        :data="userList"
        border
        style="width: 100%"
        header-cell-class-name="table-header-gray"
      >
        <el-table-column prop="userId" label="ID" width="80" align="center" />
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

        <el-table-column prop="createTime" label="注册时间" width="180" align="center" />

        <!-- 操作列 -->
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="warning"
              @click="deleteUser(row.userId)"
            >
              删除
            </el-button>
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
import useAdminStore from '@/stores/admin.js'
import useUserStore from '@/stores/user.js'

// --- 状态定义 ---
const loading = ref(false)
const userList = ref([])
const total = ref(0)
const userStore = useUserStore()
const queryParams = ref({
  page: 1,
  pageSize: 10,
  username: '',
  role: userStore.userInfo.role
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

const adminStore = useAdminStore()
// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const res = await adminStore.getUsers(queryParams.value)
    userList.value = [...(res.data.data?.users || [])]
    console.log('userList updated:', userList.value)
    total.value = res.data.data?.total || 0
  } catch (error) {
    ElMessage.error('获取用户列表失败' + error)
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

// 初始化加载
onMounted(() => {
  fetchUserList()
})

// 删除用户
const deleteUser = async (userId)=>{
  loading.value = true
  console.log(userId)
  try {
    const res = await adminStore.delUser(userId)
    ElMessage.success(res.data.message)
  } catch (error) {
    ElMessage.error('删除用户失败,请联系管理员进行级联删除')
  } finally {
    loading.value = false
  }
}
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
