<template>
  <div class="w-full h-full flex flex-col items-center justify-center min-h-[300px] bg-white rounded-lg p-6">
    <el-empty
        :description="description"
        :image="image"
        :image-size="imageSize"
        v-bind="$attrs"
        class="w-full"
    >
      <!-- 默认插槽：用于放置操作按钮，如“去逛逛”、“刷新” -->
      <template #default>
        <slot name="action">
          <!-- 如果没有传入动作插槽，且提供了默认建议文案，可在此处预留空间或保持留白 -->
        </slot>
      </template>

      <!-- 自定义图片插槽（如果需要完全自定义图片结构） -->
      <template #image>
        <slot name="image">
          <!-- 如果使用了自定义 image 属性，el-empty 会自动处理，此处可留空或做特殊处理 -->
        </slot>
      </template>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ElEmpty } from 'element-plus';

/**
 * EEmpty 通用空状态组件
 *
 * @property {string} description - 空状态描述文案
 * @property {string | VNode} image - 图片地址或渲染函数，默认为 ElementPlus 默认图
 * @property {number | string} imageSize - 图片大小
 * @property {boolean} showAction - 是否显示默认的操作按钮（预留逻辑，实际通过 slot 控制）
 */

interface Props {
  description?: string;
  image?: string;
  imageSize?: number | string;
  type?: 'default' | 'search' | 'network' | 'house'; // 扩展类型，用于内部映射默认文案
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  image: '',
  imageSize: 160,
  type: 'default'
});

// 根据类型自动匹配默认文案，贴合二手房业务场景
const defaultDescriptions: Record<string, string> = {
  default: '暂无数据',
  search: '未找到相关房源',
  network: '网络连接失败，请检查网络',
  house: '暂无在售房源',
  favorite: '暂无收藏房源',
  review: '暂无评价',
};

const computedDescription = computed(() => {
  if (props.description) return props.description;
  return defaultDescriptions[props.type] || defaultDescriptions['default'];
});

// 处理图片逻辑：如果有自定义图片则使用，否则根据类型选择（此处简化为直接使用 el-empty 默认或自定义传入）
const computedImage = computed(() => {
  if (props.image) return props.image;
  // 未来可扩展：根据 type 返回不同的内置图片 URL
  return undefined;
});
</script>

<style scoped>
/*
  TailwindCss4 已处理大部分样式
  此处仅处理特定需要覆盖的深层样式或过渡效果
*/
:deep(.el-empty__description) {
  color: #9ca3af; /* tailwind gray-400 */
  font-size: 0.875rem;
}

:deep(.el-empty__image) {
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

:deep(.el-empty__image:hover) {
  opacity: 1;
}
</style>
