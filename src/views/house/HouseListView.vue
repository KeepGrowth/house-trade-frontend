<template>
  <!-- 使用公共页面容器组件，统一页边距和标题 -->
  <PageContainer title="房源列表" show-back>
    <div class="flex flex-col gap-6">

      <!-- 分子组件：房源筛选表单 -->
      <!-- 当筛选条件变化时，触发 handleFilterChange -->
      <HouseFilterForm @search="handleFilterChange" @reset="handleReset" />

      <!-- 模版组件：房源列表网格 -->
      <!-- 集成卡片展示、分页和空状态 -->
      <HouseListGrid
        :data="houseList"
        :loading="loading"
        :pagination="pagination"
        card-type="full"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
        @favorite-toggle="handleFavoriteToggle"
      />

    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

// 引入方案中定义的组件
// 假设这些组件已按照方案在对应路径实现
import PageContainer from '@/components/PageContainer.vue';
import HouseFilterForm from '@/components/molecules/HouseFilterForm.vue';
import HouseListGrid from '@/components/templates/HouseListGrid.vue';

// 引入 Pinia Store (假设已创建 houseStore)
// import { useHouseStore } from '@/stores/houseStore';
// const houseStore = useHouseStore();

// --- 状态定义 ---
const loading = ref<boolean>(false);
const houseList = ref<any[]>([]);

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 12, // 每页显示12个，适合网格布局
  total: 0
});

// 当前筛选条件
const filterParams = reactive({
  district: '',
  priceRange: [],
  houseType: '',
  sortBy: 'default'
});

// --- 方法定义 ---

/**
 * 获取房源列表数据
 * 实际项目中这里会调用 houseStore.getHouseList(filterParams)
 */
const fetchHouseList = async () => {
  loading.value = true;
  try {
    // 模拟异步请求延迟
    await new Promise(resolve => setTimeout(resolve, 600));

    // TODO: 替换为真实的 API 调用
    // const res = await api.getHouses({ ...filterParams, page: pagination.currentPage, limit: pagination.pageSize });
    // houseList.value = res.data.list;
    // pagination.total = res.data.total;

    // 模拟数据返回 (仅用于演示效果)
    houseList.value = Array.from({ length: pagination.pageSize }).map((_, index) => ({
      id: index + 1,
      title: `阳光花园 ${3 + index}室${2 + (index % 2)}厅 精装好房`,
      price: 200 + index * 10,
      area: 80 + index * 5,
      houseType: `${3 + index}室${2 + (index % 2)}厅`,
      district: ['朝阳区', '海淀区', '丰台区'][index % 3],
      community: `阳光花园${String.fromCharCode(65 + index % 3)}区`,
      imageUrl: 'https://via.placeholder.com/300x200?text=House+Image',
      status: 1, // 在售
      auditStatus: 1, // 通过
      favorite: false,
      createTime: '2023-10-01'
    }));
    pagination.total = 50; // 模拟总数

  } catch (error) {
    ElMessage.error('获取房源列表失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 处理筛选表单提交
 */
const handleFilterChange = (params: any) => {
  Object.assign(filterParams, params);
  pagination.currentPage = 1; // 重置页码到第一页
  fetchHouseList();
};

/**
 * 处理重置
 */
const handleReset = (params: any) => {
  Object.assign(filterParams, params);
  pagination.currentPage = 1;
  fetchHouseList();
};

/**
 * 处理页码切换
 */
const handlePageChange = (page: number) => {
  pagination.currentPage = page;
  fetchHouseList();
  // 滚动到顶部体验更好
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * 处理每页条数切换
 */
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.currentPage = 1;
  fetchHouseList();
};

/**
 * 处理收藏切换 (由子组件冒泡上来)
 */
const handleFavoriteToggle = (houseId: number, isFavorite: boolean) => {
  // 这里调用收藏接口
  console.log(`房子 ${houseId} 收藏状态变为: ${isFavorite}`);
  ElMessage.success(isFavorite ? '收藏成功' : '已取消收藏');

  // 更新本地列表状态以即时响应
  const house = houseList.value.find(h => h.id === houseId);
  if (house) {
    house.favorite = isFavorite;
  }
};

// --- 生命周期 ---
onMounted(() => {
  fetchHouseList();
});
</script>

<style scoped>
/*
  Tailwind CSS 4 通常不需要额外的 scoped 样式，
  如果需要微调，可以使用 :deep() 或者直接在 template 中使用 class
*/
</style>
