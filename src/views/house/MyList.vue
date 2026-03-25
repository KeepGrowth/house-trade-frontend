<template>
  <div class="my-houses-container p-6 bg-gray-50 min-h-screen">
    <!-- 头部操作区 -->
    <div class="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
      <div>
        <h2 class="text-xl font-bold text-gray-800">我的房源管理</h2>
        <p class="text-sm text-gray-500 mt-1">在这里您可以发布或下架您的房源</p>
      </div>
      <el-button type="primary" @click="handlePublish" class="shadow-md">
        <i class="el-icon-plus mr-1"></i> 发布新房源
      </el-button>
    </div>

    <!-- 房源列表表格 -->
    <div class="bg-white rounded-lg shadow-sm p-4">
      <el-table
        :data="houseList"
        v-loading="loading"
        style="width: 100%"
        header-cell-class-name="bg-gray-100 text-gray-700"
      >
        <!-- 房源图片 -->
        <el-table-column prop="image_url" label="封面" width="100">
          <template #default="scope">
            <el-image
              v-if="scope.row.imageUrls && scope.row.imageUrls.length > 0"
              :src="scope.row.imageUrls[0].imageUrl"
              fit="cover"
              class="w-16 h-16 rounded-md border border-gray-200"
              :preview-src-list="[scope.row.imageUrls[0].imageUrl]">

              <template #error>
                <div class="w-16 h-16 bg-gray-100 flex items-center justify-center text-gray-400">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </template>
            </el-image>
            <div v-else class="w-16 h-16 bg-gray-100 flex items-center justify-center text-gray-400 rounded-md">
              无图
            </div>
          </template>
        </el-table-column>

        <!-- 基本信息 -->
        <el-table-column prop="title" label="房源标题" min-width="180" show-overflow-tooltip></el-table-column>

        <el-table-column label="价格/面积" width="150">
          <template #default="scope">
            <div class="text-orange-600 font-bold">{{ scope.row.price }} 万</div>
            <div class="text-gray-500 text-xs">{{ scope.row.area }} m²</div>
          </template>
        </el-table-column>

        <el-table-column prop="district" label="区域" width="120"></el-table-column>
        <el-table-column prop="community" label="小区" width="150" show-overflow-tooltip></el-table-column>

        <!-- 状态列 -->
        <el-table-column label="销售状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.saleStatus)" size="small">
              {{ getStatusText(scope.row.saleStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="审核状态" width="100">
          <template #default="scope">
            <el-tag :type="getAuditType(scope.row.auditStatus)" size="small" effect="plain">
              {{ getAuditText(scope.row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="create_time" label="发布时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">

            <el-popconfirm
              title="确定要删除该房源吗？删除后不可恢复"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="handleDelete(scope.row.houseId)"
            >
              <template #reference>
                <el-button link type="danger" size="small">下架并删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, prev, pager, next"
          @current-change="fetchHouseList"
          background
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';
import useUserStore from '@/stores/user.js'
import useHouseStore from '@/stores/house.js' // 假设已配置好 axios 实例

const router = useRouter();
const userStore = useUserStore();
const houseStore = useHouseStore()

// 状态定义
const loading = ref(false);
const houseList = ref([]);
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
});

const fetchHouseList = async () => {
  loading.value = true;
  try {
    // 模拟请求：实际应携带 Token，后端解析当前登录用户
    const response = await userStore.fetchMyHouses();

    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟延迟
    if (response.data.code === 200) {
      houseList.value = response.data.data.houses;
      console.log(houseList.value)
      pagination.value.total = response.data.data.total;
    } else {
      ElMessage.error(response.data.message || '获取房源列表失败');
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('网络请求异常');
  } finally {
    loading.value = false;
  }
};

// 跳转发布页面
const handlePublish = () => {
  router.push('/publish-house');
};

// 跳转编辑页面
const handleEdit = (row) => {
  if (row.auditStatus === 0) {
    ElMessage.warning('房源审核中，暂不可编辑');
    return;
  }
  router.push(`/publish/edit/${row.house_id}`);
};

// 上下架切换
const handleToggleStatus = async (row, newStatus) => {
  try {
    // await axios.put(`/api/v1/houses/${row.house_id}`, { sale_status: newStatus });
    ElMessage.success(newStatus === 1 ? '房源已上架' : '房源已下架');
    await fetchHouseList(); // 刷新列表
  } catch (e) {
    ElMessage.error('操作失败');
  }
};

// 删除房源
const handleDelete = async (id) => {
  try {
    const res = await houseStore.deleteHouse(id)
    ElMessage.success('删除成功');
    await fetchHouseList();
  } catch (e) {
    ElMessage.error('删除失败');
  }
};

// 辅助函数：状态文本映射 (对应数据库设计)
const getStatusText = (status) => {
  const map = { 1: '在售', 2: '已售', 3: '已下架' };
  return map[status] || '未知';
};
const getStatusType = (status) => {
  const map = { 1: 'success', 2: 'info', 3: 'warning' };
  return map[status] || 'info';
};

const getAuditText = (status) => {
  const map = { 0: '待审核', 1: '已通过', 2: '已驳回' };
  return map[status] || '未知';
};
const getAuditType = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' };
  return map[status] || 'info';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.split(' ')[0]; // 简单截取日期部分
};

onMounted(() => {
  fetchHouseList();
});
</script>

