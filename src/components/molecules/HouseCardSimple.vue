<template>
  <div
    class="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col h-full"
    @click="handleClick"
  >
    <!-- 图片区域 -->
    <div class="relative aspect-[4/3] overflow-hidden bg-gray-100">
      <img
        :src="coverImage"
        :alt="house.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <!-- 左上角状态标签 (审核状态) -->
      <div class="absolute top-2 left-2 z-10">
        <EStatusTag
          v-if="house.audit_status === 0"
          status="pending"
          text="审核中"
          size="small"
        />
        <EStatusTag
          v-else-if="house.audit_status === 2"
          status="danger"
          text="已驳回"
          size="small"
        />
      </div>

      <!-- 右上角出售状态标签 -->
      <div class="absolute top-2 right-2 z-10">
        <EStatusTag
          :status="saleStatusMap[house.sale_status]?.type || 'info'"
          :text="saleStatusMap[house.sale_status]?.label || '未知'"
          size="small"
          effect="dark"
        />
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="p-4 flex flex-col flex-grow">
      <!-- 标题 -->
      <h3 class="text-lg font-bold text-gray-800 line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
        {{ house.title }}
      </h3>

      <!-- 小区与区域 -->
      <div class="flex items-center text-gray-500 text-sm mb-3">
        <el-icon class="mr-1"><Location /></el-icon>
        <span class="truncate">{{ house.district }} · {{ house.community }}</span>
      </div>

      <!-- 核心参数：户型 | 面积 -->
      <div class="flex items-center gap-3 text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded-md mb-4 w-fit">
        <span class="font-medium">{{ house.house_type }}</span>
        <span class="w-px h-3 bg-gray-300"></span>
        <span>{{ house.area }}㎡</span>
      </div>

      <!-- 底部价格区 -->
      <div class="mt-auto flex items-end justify-between">
        <div class="flex flex-col">
          <span class="text-xs text-gray-400 mb-0.5">总价</span>
          <!-- 使用原子组件展示价格 -->
          <EPriceDisplay :value="house.price" unit="万" class="text-orange-500 font-bold text-xl" />
        </div>

        <!-- 查看详情箭头 (交互提示) -->
        <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-500">
          <el-icon :size="20"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Location, ArrowRight } from '@element-plus/icons-vue';
// 实际项目中请取消以下注释并从原子组件目录引入
// import EPriceDisplay from '@/components/atoms/EPriceDisplay.vue';
// import EStatusTag from '@/components/atoms/EStatusTag.vue';

// --- 临时引入原子组件逻辑 (为了演示代码完整性，实际请移除这段并使用真实导入) ---
import EPriceDisplay from '../atoms/EPriceDisplay.vue';
import EStatusTag from '../atoms/EStatusTag.vue';
// --------------------------------------------------------------------------------

const props = defineProps({
  house: {
    type: Object,
    required: true,
    // 校验字段是否符合数据库设计
    validator: (value) => {
      return 'house_id' in value && 'title' in value && 'price' in value;
    }
  },
  coverImage: {
    type: String,
    default: '/images/default-house.png' // 默认占位图
  }
});

const emit = defineEmits(['click']);
const router = useRouter();

// 销售状态映射配置
const saleStatusMap = {
  1: { label: '在售', type: 'success' },
  2: { label: '已售', type: 'info' },
  3: { label: '下架', type: 'danger' }
};

// 点击处理
const handleClick = () => {
  // 如果审核未通过或已下架，可选限制点击
  if (props.house.audit_status !== 1 && props.house.sale_status !== 1) {
    // 可选：提示用户该房源不可见
    return;
  }

  emit('click', props.house);
  // 路由跳转至详情页
  router.push(`/house/${props.house.house_id}`);
};
</script>

<style scoped>
/*
  TailwindCss 已处理大部分样式。
  此处仅保留必要的深度样式或特殊动画微调。
*/
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
