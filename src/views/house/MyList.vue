<template>
  <div class="my-houses-container p-6 bg-gray-50 min-h-screen">
    <!-- 头部操作区 -->
    <div class="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
      <div>
        <h2 class="text-xl font-bold text-gray-800">我的房源管理</h2>
        <p class="text-sm text-gray-500 mt-1">在这里您可以发布、编辑或下架您的房源</p>
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
              v-if="scope.row.images && scope.row.images.length > 0"
              :src="scope.row.images[0].image_url"
              fit="cover"
              class="w-16 h-16 rounded-md border border-gray-200"
              :preview-src-list="[scope.row.images[0].image_url]"
            >
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
            <el-tag :type="getStatusType(scope.row.sale_status)" size="small">
              {{ getStatusText(scope.row.sale_status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="审核状态" width="100">
          <template #default="scope">
            <el-tag :type="getAuditType(scope.row.audit_status)" size="small" effect="plain">
              {{ getAuditText(scope.row.audit_status) }}
            </el-tag>
            <div v-if="scope.row.audit_status === 2" class="text-xs text-red-500 mt-1" title="驳回原因">
              原因: {{ scope.row.reject_reason || '未填写' }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="create_time" label="发布时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.create_time) }}
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleEdit(scope.row)">
              编辑
            </el-button>

            <el-button
              v-if="scope.row.sale_status === 1"
              link
              type="warning"
              size="small"
              @click="handleToggleStatus(scope.row, 3)"
            >
              下架
            </el-button>
            <el-button
              v-else-if="scope.row.sale_status === 3"
              link
              type="success"
              size="small"
              @click="handleToggleStatus(scope.row, 1)"
            >
              上架
            </el-button>

            <el-popconfirm
              title="确定要删除该房源吗？删除后不可恢复"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="handleDelete(scope.row.house_id)"
            >
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
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
import axios from 'axios'; // 假设已配置好 axios 实例
// import { useUserStore } from '@/stores/user'; // 假设使用 Pinia 管理用户状态

const router = useRouter();
// const userStore = useUserStore();

// 状态定义
const loading = ref(false);
const houseList = ref([]);
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
});

// 模拟后端接口调用 (实际项目中请替换为真实的 API 路径)
// 根据方案：GET /api/v1/houses (可能需要传用户ID或通过Token自动识别)
const fetchHouseList = async () => {
  loading.value = true;
  try {
    // 模拟请求：实际应携带 Token，后端解析当前登录用户
    // const response = await axios.get('/api/v1/houses', {
    //   params: {
    //     page: pagination.value.page,
    //     page_size: pagination.value.pageSize,
    //     user_id: userStore.userId // 或者后端从 token 解析
    //   }
    // });

    // --- Mock Data Start (演示用) ---
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟延迟
    const mockData = {
      code: 200,
      data: {
        list: [
          {
            house_id: 101,
            title: '阳光花园 精装三居室 采光好',
            price: 230.5,
            area: 98.5,
            district: '朝阳区',
            community: '阳光花园',
            sale_status: 1, // 1-在售
            audit_status: 1, // 1-通过
            create_time: '2023-10-01 10:00:00',
            images: [{ image_url: 'https://via.placeholder.com/150' }]
          },
          {
            house_id: 102,
            title: '老城区 学区房 两室一厅',
            price: 150.0,
            area: 65.0,
            district: '海淀区',
            community: '学府里',
            sale_status: 1,
            audit_status: 2, // 2-驳回
            reject_reason: '图片模糊，请重新上传',
            create_time: '2023-10-05 14:20:00',
            images: []
          },
          {
            house_id: 103,
            title: '急售 地铁口 大平层',
            price: 450.0,
            area: 140.0,
            district: '西城区',
            community: '地铁家园',
            sale_status: 3, // 3-已下架
            audit_status: 1,
            create_time: '2023-09-20 09:15:00',
            images: [{ image_url: 'https://via.placeholder.com/150' }]
          }
        ],
        total: 3
      }
    };
    // --- Mock Data End ---

    if (mockData.code === 200) {
      houseList.value = mockData.data.list;
      pagination.value.total = mockData.data.total;
    } else {
      ElMessage.error(mockData.msg || '获取房源列表失败');
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
  router.push('/publish/create'); // 假设发布路由
};

// 跳转编辑页面
const handleEdit = (row) => {
  if (row.audit_status === 0) {
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
    fetchHouseList(); // 刷新列表
  } catch (e) {
    ElMessage.error('操作失败');
  }
};

// 删除房源
const handleDelete = async (id) => {
  try {
    // await axios.delete(`/api/v1/houses/${id}`);
    ElMessage.success('删除成功');
    fetchHouseList();
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

<style scoped>
/* 这里可以使用 Tailwind 类，也可以补充自定义 CSS */
.my-houses-container {
  /* 如果需要覆盖某些全局样式 */
}
:deep(.el-table th) {
  font-weight: 600;
}
</style>
