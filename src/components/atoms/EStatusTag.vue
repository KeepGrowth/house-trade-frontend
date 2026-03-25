<script setup lang="ts">
import {computed, type PropType} from 'vue';
import {ElTag, ElTooltip} from 'element-plus';
import type {TagProps} from 'element-plus';

// 定义状态类型映射
export type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'processing' | 'offline';

interface StatusConfig {
  label: string;
  type: TagProps['type'];
  effect: 'light' | 'dark' | 'plain';
  icon?: string; // 可选图标类名
  colorClass: string; // Tailwind 自定义背景/文字类
}

const props = defineProps({
  // 业务状态值
  status: {
    type: String as PropType<StatusType>,
    required: true,
    validator: (val: string) => ['success', 'warning', 'danger', 'info', 'processing', 'offline'].includes(val)
  },
  // 自定义显示文本，若不传则使用默认映射
  text: {
    type: String,
    default: ''
  },
  // 是否显示为小圆点模式
  isDot: {
    type: Boolean,
    default: false
  },
  // 是否可点击
  clickable: {
    type: Boolean,
    default: false
  },
  // 额外提示内容
  tooltip: {
    type: String,
    default: ''
  },
  // 尺寸
  size: {
    type: String as PropType<'large' | 'default' | 'small'>,
    default: 'default'
  }
});

const emit = defineEmits<{
  (e: 'click', status: StatusType): void;
}>();

// 状态配置映射表
const statusMap: Record<StatusType, StatusConfig> = {
  success: {
    label: '正常',
    type: 'success',
    effect: 'light',
    colorClass: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
  },
  processing: {
    label: '运行中',
    type: 'warning', // ElementPlus 中 warning 常用作处理中，或者自定义
    effect: 'light',
    colorClass: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
  },
  warning: {
    label: '警告',
    type: 'warning',
    effect: 'light',
    colorClass: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
  },
  danger: {
    label: '异常',
    type: 'danger',
    effect: 'light',
    colorClass: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'
  },
  offline: {
    label: '离线',
    type: 'info',
    effect: 'plain',
    colorClass: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10'
  },
  info: {
    label: '未知',
    type: 'info',
    effect: 'plain',
    colorClass: 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10'
  }
};

const currentConfig = computed(() => statusMap[props.status]);
const displayText = computed(() => props.text || currentConfig.value.label);

const handleClick = () => {
  if (props.clickable) {
    emit('click', props.status);
  }
};

// 动态类名计算
const wrapperClasses = computed(() => [
  'inline-flex items-center transition-all duration-200',
  props.clickable ? 'cursor-pointer hover:opacity-80 active:scale-95' : 'cursor-default',
  props.isDot ? 'gap-1.5' : 'gap-1.5'
]);

const dotClasses = computed(() => [
  'rounded-full animate-pulse',
  props.status === 'success' ? 'bg-emerald-500' :
      props.status === 'processing' ? 'bg-blue-500' :
          props.status === 'warning' ? 'bg-amber-500' :
              props.status === 'danger' ? 'bg-rose-500' :
                  'bg-slate-400'
]);
</script>

<template>
  <ElTooltip :content="tooltip" :disabled="!tooltip" placement="top">
    <div
        :class="wrapperClasses"
        @click="handleClick"
        role="button"
        :tabindex="clickable ? 0 : -1"
        @keydown.enter="handleClick"
        @keydown.space="handleClick"
    >
      <!-- 小圆点模式 -->
      <span v-if="isDot" :class="['w-2 h-2 shrink-0', dotClasses]"/>

      <!-- 标签主体 -->
      <!-- 注意：这里我们主要利用 Tailwind 进行样式覆盖，以获得比 Element Plus 默认更精致的效果 -->
      <ElTag
          :type="currentConfig.type"
          :effect="currentConfig.effect"
          :size="size"
          :class="[
          'font-medium rounded-md px-2.5 py-0.5 border-none shadow-sm',
          currentConfig.colorClass,
          isDot ? '!px-1.5 !py-0.5' : ''
        ]"
      >
        <span class="flex items-center gap-1.5">
          <!-- 如果需要图标，可以在这里扩展 -->
          <slot name="icon"></slot>
          <span v-if="!isDot">{{ displayText }}</span>
        </span>
      </ElTag>
    </div>
  </ElTooltip>
</template>

<style scoped>
/* Tailwind CSS v4 通常不需要额外的 style 标签，除非有非常特殊的动画需求 */
/* 如果项目未完全配置 Tailwind v4，确保 postcss 配置正确 */
</style>
