<template>
  <header class="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">

        <!-- 左侧：Logo & 主菜单 -->
        <div class="flex items-center gap-8">
          <!-- Logo -->
          <router-link to="/" class="flex-shrink-0 flex items-center gap-2 group">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-blue-200 shadow-lg group-hover:scale-105 transition-transform">
              H
            </div>
            <span class="text-xl font-bold text-gray-800 tracking-tight group-hover:text-blue-600 transition-colors">
              易居二手房
            </span>
          </router-link>

          <!-- 桌面端主菜单 -->
          <nav class="hidden md:flex space-x-1">
            <router-link
              v-for="item in visibleMenuItems"
              :key="item.path"
              :to="item.path"
              class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              :class="isActive(item.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
            >
              {{ item.title }}
            </router-link>
          </nav>
        </div>

        <!-- 右侧：用户操作区 -->
        <div class="flex items-center gap-4">
          <!-- 未登录状态 -->
          <template v-if="!userStore.isLoggedIn">
            <router-link to="/login">
              <el-button type="primary" plain class="!rounded-full !px-6 !border-blue-200 hover:!bg-blue-50 hover:!border-blue-300">
                登录
              </el-button>
            </router-link>
            <router-link to="/register">
              <el-button type="primary" class="!rounded-full !px-6 shadow-md shadow-blue-100 hover:shadow-lg hover:shadow-blue-200">
                注册
              </el-button>
            </router-link>
          </template>

          <!-- 已登录状态 -->
          <template v-else>
            <!-- 发布房源按钮 (仅房东) -->
            <router-link v-if="userStore.role === 2" to="/publish">
              <el-button
                type="warning"
                class="!rounded-full !px-5 font-medium shadow-md shadow-orange-100 hover:shadow-orange-200"
                :icon="Plus"
              >
                发布房源
              </el-button>
            </router-link>

            <!-- 用户下拉菜单 -->
            <el-dropdown trigger="click" class="ml-2">
              <div class="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <el-avatar :size="36" :src="userStore.avatar || defaultAvatar" class="ring-2 ring-white shadow-sm">
                  <img src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" alt="avatar" />
                </el-avatar>
                <div class="hidden md:flex flex-col items-start leading-none">
                  <span class="text-sm font-semibold text-gray-700">{{ userStore.username }}</span>
                  <span class="text-xs text-gray-400 mt-1">{{ roleNameMap[userStore.role] }}</span>
                </div>
                <el-icon class="text-gray-400"><arrow-down /></el-icon>
              </div>

              <template #dropdown>
                <el-dropdown-menu class="!p-2 !rounded-xl !shadow-xl !border-gray-100">
                  <el-dropdown-item :icon="User" @click="$router.push('/user/center')">
                    个人中心
                  </el-dropdown-item>

                  <!-- 动态菜单项 -->
                  <el-dropdown-item
                    v-if="userStore.role === 2"
                    :icon="HomeFilled"
                    @click="$router.push('/user/center/my-house')"
                  >
                    我的房源
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="userStore.role === 1"
                    :icon="Star"
                    @click="$router.push('/user/center/favorites')"
                  >
                    我的收藏
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="userStore.role === 3"
                    divided
                    :icon="Monitor"
                    @click="$router.push('/admin/stats')"
                  >
                    管理后台
                  </el-dropdown-item>

                  <el-dropdown-item divided class="!text-red-500" :icon="SwitchButton" @click="handleLogout">
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowDown,
  User,
  SwitchButton,
  HomeFilled,
  Star,
  Monitor,
  Plus
} from '@element-plus/icons-vue';

// 默认头像占位图
const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';

// 引入 Store (实际项目中请确保路径正确)
// 此处为模拟演示，若未创建 store 需先运行：npx pinia init 或手动创建
// 为了代码可直接运行，这里做一个简单的 mock 逻辑，实际请替换为真实的 useUserStore()
// const userStore = useUserStore();
// --- Mock Start (演示用，实际请删除此块并使用真实 store) ---
import { ref } from 'vue';
const mockUser = ref({
  isLoggedIn: true, // 切换 false 测试未登录态
  username: '张三',
  role: 2, // 1:购房者, 2:房东, 3:管理员
  avatar: ''
});
const userStore = {
  get isLoggedIn() { return mockUser.value.isLoggedIn; },
  get username() { return mockUser.value.username; },
  get role() { return mockUser.value.role; },
  get avatar() { return mockUser.value.avatar; },
  logout: () => { mockUser.value.isLoggedIn = false; alert('已退出登录'); }
};
// --- Mock End ---

const route = useRoute();
const router = useRouter();

// 角色映射
const roleNameMap = {
  1: '购房者',
  2: '房东',
  3: '管理员'
};

// 基础菜单配置
const allMenuItems = [
  { title: '首页', path: '/', roles: [1, 2, 3] },
  { title: '房源列表', path: '/house/list', roles: [1, 2, 3] },
  { title: '发布房源', path: '/publish', roles: [2] }, // 仅房东
  { title: '房源审核', path: '/admin/audit', roles: [3] }, // 仅管理员
  { title: '数据看板', path: '/admin/stats', roles: [3] }, // 仅管理员
];

// 根据当前用户角色过滤菜单
const visibleMenuItems = computed(() => {
  if (!userStore.isLoggedIn) {
    return allMenuItems.filter(item => item.roles.includes(1)); // 未登录只看公共
  }
  return allMenuItems.filter(item => item.roles.includes(userStore.role));
});

// 判断路由是否激活
const isActive = (path) => {
  return route.path === path || (path !== '/' && route.path.startsWith(path));
};

// 退出登录处理
const handleLogout = () => {
  // 实际逻辑：清除 token, reset store
  userStore.logout();
  router.push('/login');
};
</script>
