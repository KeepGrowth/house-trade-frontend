<template>
  <div class="flex items-center gap-2" :class="containerClass">
    <!-- Element Plus Rate 组件 -->
    <el-rate
        v-model="internalScore"
        :readonly="readonly"
        :allow-half="allowHalf"
        :disabled-void-color="'#e5e7eb'"
        :void-color="'#e5e7eb'"
        :colors="customColors"
        :size="sizeMap[size]"
        class="e-star-score__rate"
        @change="handleScoreChange"
    />

    <!-- 可选：显示具体分数文本 -->
    <span
        v-if="showScoreText"
        class="text-gray-500 font-medium text-sm ml-1"
        :class="textSizeClass"
    >
      {{ displayText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElRate } from 'element-plus';

// --- Props 定义 ---
interface Props {
  modelValue?: number; // 双向绑定的分数
  readonly?: boolean;  // 是否只读（用于展示评价）
  allowHalf?: boolean; // 是否允许半星
  showScoreText?: boolean; // 是否显示分数文字
  size?: 'small' | 'default' | 'large'; // 尺寸控制
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  readonly: false,
  allowHalf: false,
  showScoreText: false,
  size: 'default'
});

// --- Emits 定义 ---
const emit = defineEmits<{
  'update:modelValue': [value: number];
  'change': [value: number];
}>();

// --- 内部状态管理 ---
// 使用 internalScore 处理双向绑定，避免直接修改 prop
const internalScore = ref(props.modelValue);

// 监听外部 modelValue 变化，同步到内部
watch(() => props.modelValue, (newVal) => {
  if (newVal !== internalScore.value) {
    internalScore.value = newVal;
  }
});

// --- 样式与配置 ---

// 尺寸映射 (Element Plus rate size: small, default, large 对应具体像素由组件库决定，这里做逻辑映射)
const sizeMap: Record<string, string> = {
  small: 'small',
  default: '', // el-rate 默认不传 size 即为 default
  large: 'large'
};

// 动态文本大小类名 (Tailwind)
const textSizeClass = computed(() => {
  switch (props.size) {
    case 'small': return 'text-xs';
    case 'large': return 'text-base';
    default: return 'text-sm';
  }
});

// 容器类名
const containerClass = computed(() => ({
  'opacity-60 cursor-not-allowed': props.readonly,
  'cursor-pointer': !props.readonly
}));

// 自定义颜色配置 (金色渐变效果)
// void-color: 未选中颜色, colors: 选中颜色数组 (可针对不同分数段设置不同颜色)
const customColors = ['#fbbf24', '#f59e0b', '#d97706'];

// 显示的文本内容
const displayText = computed(() => {
  const score = internalScore.value;
  if (score >= 5) return '非常满意';
  if (score >= 4) return '满意';
  if (score >= 3) return '一般';
  if (score >= 2) return '不满意';
  return '非常差';
});

// --- 事件处理 ---
const handleScoreChange = (val: number) => {
  // 更新父组件数据
  emit('update:modelValue', val);
  // 触发改变事件
  emit('change', val);
};
</script>

<style scoped>
/*
  如果需要覆盖 Element Plus 的某些深层样式，可以使用 :deep()
  例如：调整星星之间的间距
*/
:deep(.el-rate) {
  /* 确保在只读模式下鼠标指针样式正确，虽然外层容器控制了，但内部图标也可以微调 */
  vertical-align: middle;
}

/* 可选：增加一点过渡动画让交互更丝滑 */
:deep(.el-rate__item) {
  transition: transform 0.2s;
}
:deep(.el-rate__item:hover) {
  transform: scale(1.1);
}
</style>
