<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            房
          </div>
          <span class="text-xl font-bold text-gray-800 hidden sm:block">易居二手房</span>
        </router-link>

        <!-- 中间导航菜单 (桌面端) -->
        <nav class="hidden md:flex space-x-8">
          <router-link
            to="/"
            class="text-gray-600 hover:text-blue-600 font-medium transition"
            active-class="text-blue-600"
          >
            首页
          </router-link>
          <router-link
            to="/houses"
            class="text-gray-600 hover:text-blue-600 font-medium transition"
            active-class="text-blue-600"
          >
            房源列表
          </router-link>
          <router-link
            to="/forum-list"
            class="text-gray-600 hover:text-blue-600 font-medium transition"
            active-class="text-blue-600"
          >
            论坛
          </router-link>
        </nav>

        <!-- 右侧用户操作区 -->
        <div class="flex items-center space-x-4">
          <!-- 未登录状态 -->
          <template v-if="!userStore.isLoggedIn">
            <router-link to="/login" class="text-gray-600 hover:text-blue-600 font-medium">
              登录
            </router-link>
            <router-link
              to="/register"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium"
            >
              注册
            </router-link>
          </template>

          <!-- 已登录状态 -->
          <template v-else>
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-md transition">
                <span class="text-gray-700 font-medium hidden sm:block">{{ userStore.userInfo.username }}</span>
                <el-icon class="text-gray-400"><arrow-down /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="center">
                    <el-icon><user /></el-icon> 个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="favorites" v-if="userStore.role !== 2">
                    <el-icon><star /></el-icon> 我的收藏
                  </el-dropdown-item>
                  <el-dropdown-item command="publish" v-if="userStore.role === 2">
                    <el-icon><edit /></el-icon> 发布房源
                  </el-dropdown-item>
                  <el-dropdown-item command="my-houses" v-if="userStore.role === 2">
                    <el-icon><list /></el-icon> 我的房源
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout" class="text-red-500">
                    <el-icon><switch-button /></el-icon> 退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="flex-grow container mx-auto px-4 py-6">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 底部版权栏 -->
    <footer class="bg-white border-t mt-auto">
      <div class="container mx-auto px-4 py-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-500">
          <div>
            <h4 class="font-bold text-gray-700 mb-2">关于易居</h4>
            <p>专业的二手房交易平台，为您提供真实、高效的房源信息。</p>
          </div>
          <div>
            <h4 class="font-bold text-gray-700 mb-2">联系方式</h4>
            <p>客服电话：12345678</p>
            <p>邮箱：support@yiju.com</p>
          </div>
        </div>
        <div class="border-t mt-6 pt-6 text-center text-xs text-gray-400">
          &copy; {{ new Date().getFullYear() }} 易居二手房交易平台。All rights reserved.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowDown, User, Star, Edit, List, SwitchButton
} from '@element-plus/icons-vue'
import useUserStore from '@/stores/user.js'

const router = useRouter()
const userStore = useUserStore()

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

// 处理下拉菜单命令
const handleCommand = async (command) => {
  switch (command) {
    case 'center':
      router.push('/user/center')
      break
    case 'favorites':
      router.push('/user/favorites')
      break
    case 'publish':
      router.push('/publish-house')
      break
    case 'my-houses':
      router.push('/user/my-houses')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        userStore.logout() // 调用 store 的 logout 动作
        ElMessage.success('退出成功')
        router.push('/')
      } catch {
        // 取消退出
      }
      break
  }
}
</script>

<style scoped>
/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
