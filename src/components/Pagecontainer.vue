<template>
  <div class="page-container-wrapper bg-gray-50 min-h-screen flex flex-col">
    <!-- 顶部导航栏区域 -->
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- 左侧：返回按钮与标题 -->
          <div class="flex items-center gap-3">
            <button
              v-if="showBack"
              @click="handleBack"
              class="text-gray-500 hover:text-blue-600 transition-colors duration-200 focus:outline-none"
              aria-label="返回上一页"
            >
              <el-icon :size="20"><ArrowLeft /></el-icon>
            </button>

            <h1 class="text-xl font-bold text-gray-800 tracking-tight">
              {{ title }}
            </h1>

            <!-- 标题后的标签或副标题插槽 -->
            <slot name="subtitle"></slot>
          </div>

          <!-- 右侧：操作区域 -->
          <div class="flex items-center gap-2">
            <slot name="header-action">
              <!-- 默认无内容，由父组件传入 -->
            </slot>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 min-h-[calc(100vh-140px)]">
        <slot></slot>
      </div>
    </main>

    <!-- 底部版权信息 (可选，根据方案Footer组件决定是否需要在此处预留) -->
    <footer v-if="showFooter" class="mt-auto py-6 text-center text-gray-400 text-sm">
      <slot name="footer">
        &copy; {{ currentYear }} 二手房交易平台。All rights reserved.
      </slot>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue'; // 引入 ElementPlus 图标

// 定义 Props
interface Props {
  title: string; // 页面标题
  showBack?: boolean; // 是否显示返回按钮
  backPath?: string; // 指定返回路径，不传则默认 router.back()
  showFooter?: boolean; // 是否显示简单页脚
}

const props = withDefaults(defineProps<Props>(), {
  showBack: false,
  backPath: '',
  showFooter: false
});

const router = useRouter();
const currentYear = new Date().getFullYear();

// 处理返回逻辑
const handleBack = () => {
  if (props.backPath) {
    router.push(props.backPath);
  } else {
    router.back();
  }
};
</script>

<style scoped>
/*
  这里主要依赖 TailwindCss 类名。
  如果需要覆盖 ElementPlus 组件的特定样式，可在此添加。
*/
.page-container-wrapper {
  /* 确保全屏高度，防止内容过少时页脚上浮问题 */
  display: flex;
  flex-direction: column;
}
</style>
