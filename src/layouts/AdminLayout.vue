<template>
  <el-container class="admin-layout h-screen w-full bg-gray-50 dark:bg-gray-900">
    <!-- 侧边栏 -->
    <el-aside
      :width="isCollapse ? '64px' : '240px'"
      class="transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
    >
      <!-- Logo 区域 -->
      <div class="h-16 flex items-center justify-center border-b border-gray-100 dark:border-gray-700">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <span class="text-white font-bold text-lg">H</span>
          </div>
          <span v-show="!isCollapse" class="text-xl font-bold text-gray-800 dark:text-white whitespace-nowrap transition-opacity duration-300">
            二手房管理平台
          </span>
        </div>
      </div>

      <!-- 导航菜单 -->
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="'transparent'"
        :text-color="currentColor"
        :active-text-color="'#fff'"
        class="flex-1 overflow-y-auto border-r-0 !border-none pt-4"
        router
      >
        <template v-for="item in menuItems" :key="item.path">
          <el-menu-item
            :index="item.path"
            class="mx-2 rounded-lg mb-1 hover:bg-blue-50 dark:hover:bg-gray-700 !text-gray-600 dark:!text-gray-300"
            :class="{ '!bg-blue-600 !text-white': activeMenu === item.path }"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <template #title>
              <span class="ml-3">{{ item.title }}</span>
            </template>
          </el-menu-item>
        </template>
      </el-menu>

      <!-- 底部版本信息 -->
      <div class="p-4 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700">
        <span v-show="!isCollapse">v1.0.0 © 2024</span>
      </div>
    </el-aside>

    <!-- 主内容区域 -->
    <el-container class="overflow-hidden">
      <!-- 顶部导航栏 -->
      <el-header class="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shadow-sm z-10">
        <div class="flex items-center gap-4">
          <button
            @click="toggleCollapse"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <IconFold v-if="!isCollapse" class="w-5 h-5" />
            <IconUnfold v-else class="w-5 h-5" />
          </button>
          <!-- 面包屑导航 (可选) -->
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>管理后台</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="flex items-center gap-4">
          <!-- 通知 -->
          <el-badge :value="3" class="cursor-pointer">
            <IconBell class="w-5 h-5 text-gray-600 dark:text-gray-300 hover:text-blue-600" />
          </el-badge>

          <!-- 用户信息下拉 -->
          <el-dropdown placement="bottom-end">
            <div class="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:block">管理员</span>
              <IconDown class="w-4 h-4 text-gray-500" />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item divided class="text-red-500">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容滚动区 -->
      <el-main class="p-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        <!-- 使用 PageContainer 概念包裹内容，保持统一边距和标题风格 -->
        <div class="max-w-[1600px] mx-auto">
          <router-view v-slot="{ Component, route }">
            <transition name="fade-transform" mode="out-in">
              <component :is="Component" :key="route.path" />
            </transition>
          </router-view>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
// 假设图标已全局注册或从图标库引入，此处使用伪代码示意，实际开发请替换为真实图标组件
// 例如: import { User, Document, DataLine, ChatDotRound } from '@element-plus/icons-vue'
import {
  User as IconUser,
  Document as IconDocument,
  DataLine as IconData,
  ChatDotRound as IconChat,
  Fold as IconFold,
  Bell as IconBell,
} from '@element-plus/icons-vue'

const route = useRoute()
const isCollapse = ref(false)

// 动态获取当前激活菜单
const activeMenu = computed(() => route.path)

// 动态调整文字颜色以适配深色模式（简化处理，实际可结合 Pinia store）
const currentColor = '#4b5563'

// 菜单配置 - 对应方案中的管理员后台模块
const menuItems = [
  { title: '数据看板', path: '/admin/dashboard', icon: IconData },
  { title: '房源审核', path: '/admin/house-audit', icon: IconDocument },
  { title: '用户管理', path: '/admin/user-manage', icon: IconUser },
  { title: '评价管理', path: '/admin/review-manage', icon: IconChat },
]

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<style scoped>
/* TailwindCss 处理了大部分样式，这里仅补充 ElementPlus 特定的覆盖和过渡动画 */

/* 菜单项选中态的高亮优化 */
:deep(.el-menu-item.is-active) {
  background-color: var(--el-color-primary) !important;
  color: #fff !important;
}

/* 路由过渡动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* 滚动条美化 (Webkit) */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
.dark ::-webkit-scrollbar-thumb {
  background: #475569;
}
</style>
