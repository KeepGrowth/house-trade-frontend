<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
    <!-- 顶部控制区：筛选、操作按钮 -->
    <div class="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
      <!-- 左侧：筛选表单插槽 -->
      <div class="w-full md:w-auto flex-1">
        <slot name="filter-form">
          <!-- 默认占位，实际使用中会插入 HouseFilterForm 或其他筛选组件 -->
        </slot>
      </div>

      <!-- 右侧：功能按钮组 -->
      <div class="flex items-center gap-3 shrink-0">
        <slot name="batch-actions" :selected-rows="selectedRows">
          <!-- 默认批量操作按钮，当有选中行时显示 -->
          <el-button
            v-if="selectedRows.length > 0"
            type="danger"
            plain
            size="small"
            @click="$emit('batch-delete', selectedRows)"
            class="shadow-sm"
          >
            <i class="ri-delete-bin-line mr-1"></i> 批量删除 ({{ selectedRows.length }})
          </el-button>
        </slot>

        <el-button
          type="primary"
          size="small"
          @click="$emit('refresh')"
          :loading="loading"
          class="shadow-sm"
        >
          <i class="ri-refresh-line mr-1"></i> 刷新
        </el-button>

        <el-button
          plain
          size="small"
          @click="$emit('export')"
          class="shadow-sm"
        >
          <i class="ri-download-line mr-1"></i> 导出
        </el-button>
      </div>
    </div>

    <!-- 表格主体区 -->
    <div class="flex-1 overflow-auto custom-scrollbar">
      <el-table
        :data="tableData"
        :columns="columns"
        v-loading="loading"
        element-loading-text="加载中..."
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        class="border-none"
        header-cell-class-name="bg-gray-50 text-gray-700 font-semibold text-sm"
        cell-class-name="text-gray-600 text-sm py-3"
      >
        <!-- 多选列 -->
        <el-table-column type="selection" width="55" align="center" fixed="left" />

        <!-- 序号列 -->
        <el-table-column type="index" label="序号" width="60" align="center" />

        <!-- 动态列渲染 -->
        <el-table-column
          v-for="col in columns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
          :sortable="col.sortable"
          :align="col.align || 'left'"
          :fixed="col.fixed"
        >
          <template #default="scope">
            <!-- 支持自定义作用域插槽，否则使用默认文本 -->
            <slot :name="`column-${col.prop}`" :row="scope.row" :value="scope.row[col.prop]">
              {{ scope.row[col.prop] }}
            </slot>
          </template>
        </el-table-column>

        <!-- 操作列 (固定右侧) -->
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="scope">
            <slot name="operation" :row="scope.row">
              <el-button link type="primary" size="small" @click="$emit('edit', scope.row)">编辑</el-button>
              <el-button link type="danger" size="small" @click="$emit('delete', scope.row)">删除</el-button>
            </slot>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态处理 -->
      <div v-if="!loading && tableData.length === 0" class="py-20">
        <slot name="empty">
          <EEmpty description="暂无数据" />
        </slot>
      </div>
    </div>

    <!-- 底部 Pagination -->
    <div class="p-4 border-t border-gray-100 bg-gray-50/30 flex justify-end">
      <slot name="pagination">
        <Pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          @change="handlePageChange"
        />
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ElTable } from 'element-plus';
// 假设原子组件和公共组件已按方案实现并注册
import EEmpty from '@/components/atoms/EEmpty.vue';
import Pagination from '@/components/Pagination.vue';

// Props 定义
const props = defineProps({
  // 表格数据
  tableData: {
    type: Array,
    default: () => []
  },
  // 列配置数组 [{ prop: 'name', label: '姓名', width: 100, sortable: true }]
  columns: {
    type: Array,
    required: true
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 分页总数
  total: {
    type: Number,
    default: 0
  },
  // 当前页码
  currentPage: {
    type: Number,
    default: 1
  },
  // 每页条数
  pageSize: {
    type: Number,
    default: 10
  }
});

// Emits 定义
const emit = defineEmits([
  'update:currentPage',
  'update:pageSize',
  'change', // 分页变化
  'selection-change', // 选中行变化
  'sort-change', // 排序变化
  'refresh', // 刷新
  'export', // 导出
  'batch-delete', // 批量删除
  'edit', // 编辑单行
  'delete' // 删除单行
]);

// 内部状态
const selectedRows = ref([]);
const internalCurrentPage = ref(props.currentPage);
const internalPageSize = ref(props.pageSize);

// 监听外部页码变化
watch(() => props.currentPage, (val) => {
  internalCurrentPage.value = val;
});

watch(() => props.pageSize, (val) => {
  internalPageSize.value = val;
});

// 事件处理
const handleSelectionChange = (val) => {
  selectedRows.value = val;
  emit('selection-change', val);
};

const handleSortChange = ({ prop, order }) => {
  emit('sort-change', { prop, order });
};

const handlePageChange = () => {
  // 同步更新 v-model
  emit('update:currentPage', internalCurrentPage.value);
  emit('update:pageSize', internalPageSize.value);
  // 触发数据加载
  emit('change', {
    page: internalCurrentPage.value,
    pageSize: internalPageSize.value
  });
};
</script>

<style scoped>
/* TailwindCss 类名优先，此处仅处理少量自定义滚动条或覆盖 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background-color: #f9fafb;
}

/* 修复 ElementPlus 表格在 Tailwind 下的一些默认样式冲突 */
:deep(.el-table) {
  --el-table-border-color: #f3f4f6;
  --el-table-header-bg-color: #f9fafb;
  --el-table-text-color: #4b5563;
  --el-table-header-text-color: #374151;
  --el-table-row-hover-bg-color: #f9fafb;
}

:deep(.el-table__inner-wrapper::before) {
  /* 移除底部的横线 */
  display: none;
}
</style>
