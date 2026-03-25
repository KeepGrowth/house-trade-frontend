<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
    <el-form
      :model="filterForm"
      ref="formRef"
      label-position="top"
      class="space-y-4"
    >
      <!-- 第一行：区域与户型 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 所在区域 -->
        <el-form-item label="所在区域" class="mb-0">
          <el-select
            v-model="filterForm.district"
            placeholder="请选择区域"
            clearable
            class="w-full"
            size="default"
          >
            <el-option label="不限" value="" />
            <el-option label="朝阳区" value="朝阳区" />
            <el-option label="海淀区" value="海淀区" />
            <el-option label="丰台区" value="丰台区" />
            <el-option label="西城区" value="西城区" />
            <el-option label="东城区" value="东城区" />
            <el-option label="通州区" value="通州区" />
          </el-select>
        </el-form-item>

        <!-- 户型结构 -->
        <el-form-item label="户型结构" class="mb-0">
          <el-select
            v-model="filterForm.houseType"
            placeholder="请选择户型"
            clearable
            class="w-full"
            size="default"
          >
            <el-option label="不限" value="" />
            <el-option label="1室" value="1室" />
            <el-option label="2室" value="2室" />
            <el-option label="3室" value="3室" />
            <el-option label="4室" value="4室" />
            <el-option label="5室及以上" value="5室及以上" />
          </el-select>
        </el-form-item>

        <!-- 价格区间 (组合输入) -->
        <el-form-item label="价格区间 (万元)" class="mb-0">
          <div class="flex items-center space-x-2">
            <el-input-number
              v-model="filterForm.minPrice"
              :min="0"
              placeholder="最低"
              controls-position="right"
              class="w-full"
              size="default"
            />
            <span class="text-gray-400">-</span>
            <el-input-number
              v-model="filterForm.maxPrice"
              :min="0"
              placeholder="最高"
              controls-position="right"
              class="w-full"
              size="default"
            />
          </div>
        </el-form-item>

        <!-- 排序方式 -->
        <el-form-item label="排序方式" class="mb-0">
          <el-select
            v-model="filterForm.sort"
            class="w-full"
            size="default"
          >
            <el-option label="默认排序" value="default" />
            <el-option label="价格从低到高" value="price_asc" />
            <el-option label="价格从高到低" value="price_desc" />
            <el-option label="面积从大到小" value="area_desc" />
            <el-option label="最新发布" value="create_time_desc" />
          </el-select>
        </el-form-item>
      </div>

      <!-- 第二行：操作按钮 -->
      <div class="flex justify-end pt-2 border-t border-gray-50 mt-2">
        <el-button
          @click="handleReset"
          class="mr-3"
          size="default"
        >
          重置
        </el-button>
        <el-button
          type="primary"
          @click="handleSearch"
          :loading="loading"
          size="default"
          class="px-8"
        >
          查找房源
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, defineEmits } from 'vue';

// 定义发射事件，用于通知父组件执行搜索或重置
const emit = defineEmits(['search', 'reset']);

// 表单引用
const formRef = ref(null);
const loading = ref(false);

// 筛选表单数据模型
const filterForm = reactive({
  district: '',       // 区域
  houseType: '',      // 户型
  minPrice: null,     // 最低价格 (万元)
  maxPrice: null,     // 最高价格 (万元)
  sort: 'default'     // 排序规则
});

/**
 * 处理搜索点击
 * 触发 search 事件，将当前表单数据传递给父组件
 */
const handleSearch = () => {
  loading.value = true;

  // 模拟异步请求前的数据处理，确保空值处理得当
  const queryParams = {
    ...filterForm,
    // 如果价格区间只填了一边，逻辑上可能需要特殊处理，这里直接透传由后端或父组件决定
  };

  // 延迟模拟加载状态，实际项目中由父组件控制加载状态或此处调用 API
  setTimeout(() => {
    loading.value = false;
    emit('search', queryParams);
  }, 300);
};

/**
 * 处理重置点击
 * 清空表单并触发 reset 事件
 */
const handleReset = () => {
  if (!formRef.value) return;

  formRef.value.resetFields();
  // 手动重置响应式对象中的默认值（因为 input-number 可能不会完全重置为 null 取决于配置）
  filterForm.minPrice = null;
  filterForm.maxPrice = null;
  filterForm.sort = 'default';

  emit('reset', {
    district: '',
    houseType: '',
    minPrice: null,
    maxPrice: null,
    sort: 'default'
  });
};
</script>
