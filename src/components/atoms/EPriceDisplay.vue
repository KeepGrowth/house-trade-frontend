<template>
  <span
      :class="containerClasses"
      :style="customStyle"
      class="inline-flex items-baseline font-bold transition-colors duration-200"
  >
    <!-- 货币符号 (可选，根据需求开启) -->
    <span v-if="showSymbol" class="mr-0.5 text-current">¥</span>

    <!-- 整数部分 -->
    <span class="tabular-nums tracking-tight">
      {{ formattedInteger }}
    </span>

    <!-- 小数部分 -->
    <span v-if="hasDecimal" class="text-current tabular-nums">
      .{{ formattedDecimal }}
    </span>

    <!-- 单位 -->
    <span :class="unitClasses" class="ml-1 font-normal opacity-90">
      {{ unitText }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

/**
 * EPriceDisplay 组件
 * 用于统一展示房源价格，支持自动千分位格式化、单位转换及多尺寸适配
 */
interface Props {
  /** 价格数值 (单位：万元)，支持字符串或数字 */
  value: number | string;
  /** 显示尺寸：sm(小), md(中), lg(大) */
  size?: 'sm' | 'md' | 'lg';
  /** 是否显示 ¥ 符号 */
  showSymbol?: boolean;
  /** 小数点后保留位数 */
  decimals?: number;
  /** 自定义单位文本，默认为 '万' */
  unit?: string;
  /** 自定义颜色类名 (Tailwind class)，默认为红色系 */
  colorClass?: string;
  /** 额外内联样式 */
  style?: Record<string, string>;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showSymbol: false,
  decimals: 2,
  unit: '万',
  colorClass: 'text-red-600', // 默认房产价格常用红
  style: () => ({})
});

const customStyle = computed(() => props.style);

// 处理输入值，确保为数字
const numericValue = computed(() => {
  const num = typeof props.value === 'string' ? parseFloat(props.value) : props.value;
  return isNaN(num) ? 0 : num;
});

// 格式化逻辑：分离整数和小数，并添加千分位
const formattedParts = computed(() => {
  const fixedValue = numericValue.value.toFixed(props.decimals);
  const [integerPart, decimalPart] = fixedValue.split('.');

  // 添加千分位逗号 (正则替换)
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return {
    integer: formattedInteger,
    decimal: decimalPart,
    hasDecimal: props.decimals > 0 && parseFloat(decimalPart) > 0
  };
});

const formattedInteger = computed(() => formattedParts.value.integer);
const formattedDecimal = computed(() => formattedParts.value.decimal);
const hasDecimal = computed(() => formattedParts.value.hasDecimal);
const unitText = computed(() => props.unit);

// 根据 Size 映射 Tailwind 类名
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-sm';
    case 'lg':
      return 'text-2xl';
    case 'md':
    default:
      return 'text-base';
  }
});

// 单位字号通常比数字略小
const unitClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-xs';
    case 'lg':
      return 'text-lg';
    case 'md':
    default:
      return 'text-sm';
  }
});

// 组合最终类名
const containerClasses = computed(() => {
  return [
    sizeClasses.value,
    props.colorClass
  ];
});
</script>

<style scoped>
/*
  TailwindCss 4 通常不需要额外的 scoped css，
  除非有非常特殊的动画或伪元素需求。
  此处利用 tabular-nums 确保数字等宽，防止价格变动时布局抖动。
*/
</style>
