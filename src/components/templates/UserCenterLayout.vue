<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 (复用公共组件 NavBar，此处为示意结构，实际应直接引入组件) -->
    <!-- <NavBar /> -->
    <header class="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl font-bold text-blue-600">二手房交易平台</span>
          <span class="text-gray-400">|</span>
          <span class="text-gray-600 font-medium">用户中心</span>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-500 hidden sm:block">欢迎回来，{{ userStore.username }}</span>
          <el-button size="small" @click="handleLogout" type="info" plain>退出登录</el-button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col md:flex-row gap-6">

        <!-- 左侧边栏：用户信息与导航菜单 -->
        <aside class="w-full md:w-64 flex-shrink-0">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            <!-- 用户信息概览 (使用方案中的分子组件 UserInfoItem) -->
            <!-- 假设 UserInfoItem 已实现并支持简化模式 -->
            <div class="p-6 border-b border-gray-50 bg-gradient-to-br from-blue-50 to-white">
              <div class="flex flex-col items-center text-center">
                <el-avatar :size="64" :src="userStore.avatar" class="mb-3 ring-2 ring-white shadow-md">
                  <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
                </el-avatar>
                <h3 class="font-bold text-gray-800 text-lg">{{ userStore.username }}</h3>
                <el-tag :type="roleTagType" size="small" class="mt-2">{{ roleLabel }}</el-tag>
              </div>
            </div>

            <!-- 导航菜单 -->
            <el-menu
              :default-active="activeMenu"
              class="border-none"
              router
              background-color="#ffffff"
              text-color="#4b5563"
              active-text-color="#2563eb"
            >
              <!-- 通用菜单项 (所有登录用户可见) -->
              <el-menu-item index="/user/center/profile">
                <el-icon><User /></el-icon>
                <span>个人资料</span>
              </el-menu-item>

              <el-menu-item index="/user/center/favorites">
                <el-icon><Star /></el-icon>
                <span>我的收藏</span>
              </el-menu-item>

              <!-- 房东专属菜单项 -->
              <template v-if="userStore.role === 2">
                <el-divider class="my-2 !mx-4 !my-2" />
                <div class="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">房东管理</div>

                <el-menu-item index="/user/center/my-house">
                  <el-icon><HomeFilled /></el-icon>
                  <span>我的房源</span>
                </el-menu-item>

                <el-menu-item index="/user/center/publish">
                  <el-icon><Plus /></el-icon>
                  <span>发布房源</span>
                </el-menu-item>
              </template>

              <!-- 购房者特有提示 (可选) -->
              <template v-if="userStore.role === 1">
                <el-divider class="my-2 !mx-4 !my-2" />
                <div class="px-4 py-2 text-xs text-gray-400">
                  想出售房屋？<br/>
                  <el-link type="primary" :underline="false" @click="upgradeToLandlord" class="text-xs mt-1 block">申请成为房东</el-link>
                </div>
              </template>
            </el-menu>
          </div>
        </aside>

        <!-- 右侧内容区 -->
        <main class="flex-1 min-w-0">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[600px]">
            <!-- 页面标题栏 (可选，增强视觉层次) -->
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 class="text-lg font-bold text-gray-800">{{ pageTitle }}</h2>
              <!-- 可在此处添加面包屑或其他操作按钮 -->
            </div>

            <!-- 路由视图出口 -->
            <div class="p-6">
              <router-view v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                  <component :is="Component" />
                </transition>
              </router-view>
            </div>
          </div>
        </main>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
// 引入 ElementPlus 图标
import { User, Star, HomeFilled, Plus } from '@element-plus/icons-vue'
// 假设 Pinia store 已定义
// import { useUserStore } from '@/stores/user'

// --- 模拟数据与状态 (实际开发请替换为 Pinia Store) ---
const route = useRoute()
// const userStore = useUserStore()

// 模拟用户状态
const userStore = ref({
  username: '张三',
  avatar: '', // 空则显示默认
  role: 2, // 1: 购房者, 2: 房东, 3: 管理员
})

// --- 计算属性 ---
const activeMenu = computed(() => route.path)

const roleLabel = computed(() => {
  const map = { 1: '购房者', 2: '房东', 3: '管理员' }
  return map[userStore.value.role] || '用户'
})

const roleTagType = computed(() => {
  const map = { 1: '', 2: 'warning', 3: 'danger' }
  return map[userStore.value.role] || 'info'
})

const pageTitle = computed(() => {
  // 简单映射路径到标题，实际可根据路由元信息 meta.title 获取
  const map = {
    '/user/center/profile': '个人资料',
    '/user/center/favorites': '我的收藏',
    '/user/center/my-house': '房源管理',
    '/user/center/publish': '发布新房源',
  }
  return map[route.path] || '用户中心'
})

// --- 方法 ---
const handleLogout = () => {
  // 调用 Pinia action 清除 token 和用户信息
  // userStore.logout()
  console.log('执行退出登录逻辑')
  // router.push('/login')
}

const upgradeToLandlord = () => {
  ElMessage.info('请联系客服或前往实名认证页面申请成为房东')
}

// 生命周期
onMounted(() => {
  // 初始化加载用户信息
  // await userStore.fetchUserInfo()
})
</script>

<style scoped>
/* 简单的过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 自定义菜单样式微调，确保与 Tailwind 融合 */
:deep(.el-menu-item) {
  border-radius: 0.5rem;
  margin: 0.25rem 1rem;
  height: auto;
  padding: 0.75rem 1rem;
}

:deep(.el-menu-item.is-active) {
  background-color: #eff6ff; /* blue-50 */
  color: #2563eb; /* blue-600 */
  font-weight: 600;
}

:deep(.el-menu-item:hover:not(.is-active)) {
  background-color: #f9fafb; /* gray-50 */
  color: #1f2937; /* gray-800 */
}

:deep(.el-divider) {
  margin: 0.5rem 1rem;
}
</style>
