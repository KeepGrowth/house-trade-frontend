<template>
  <div class="w-full flex justify-center items-center py-6 px-4 bg-white">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      class="custom-pagination"
      background
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

// 定义 Props
interface PaginationProps {
  total?: number;          // 总条数
  currentPage?: number;    // 当前页码
  pageSize?: number;       // 每页条数
}

const props = withDefaults(defineProps<PaginationProps>(), {
  total: 0,
  currentPage: 1,
  pageSize: 10,
});

// 定义 Emits
const emit = defineEmits<{
  (e: 'update:currentPage', value: number): void;
  (e: 'update:pageSize', value: number): void;
  (e: 'change', params: { currentPage: number; pageSize: number }): void;
}>();

// 本地状态，用于处理双向绑定
const currentPage = ref(props.currentPage);
const pageSize = ref(props.pageSize);

// 监听外部传入的 props 变化，同步到本地状态
watch(
  () => props.currentPage,
  (newVal) => {
    if (newVal !== currentPage.value) {
      currentPage.value = newVal;
    }
  }
);

watch(
  () => props.pageSize,
  (newVal) => {
    if (newVal !== pageSize.value) {
      pageSize.value = newVal;
    }
  }
);

// 处理每页条数变化
const handleSizeChange = (val: number) => {
  emit('update:pageSize', val);
  // 切换每页条数时，通常重置回第一页，符合用户习惯
  emit('update:currentPage', 1);
  emit('change', { currentPage: 1, pageSize: val });
};

// 处理页码变化
const handleCurrentChange = (val: number) => {
  emit('update:currentPage', val);
  emit('change', { currentPage: val, pageSize: pageSize.value });
};
</script>
