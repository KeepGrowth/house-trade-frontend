<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

// 引入方案中定义的公共组件
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
import PageContainer from '@/components/Pagecontainer.vue'
import useUserStore from '@/stores/user'
import HouseListGrid from '@/App.vue'

const route = useRoute()
const userStore = useUserStore()

// 根据路由元信息或路径判断是否需要内边距容器
// 方案中提到 PageContainer 用于统一页边距、标题、返回按钮
const hasContainer = computed(() => {
  // 某些全屏页面（如首页的大轮播部分）可能不需要标准容器，这里默认开启
  return route.meta?.hasContainer !== false
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!--
      公共组件：全局导航栏
      功能：区分前台/后台，展示 logo、菜单、用户头像/登录入口
      依赖：Vue Router, Pinia (用户状态)
    -->
    <header class="sticky top-0 z-50 w-full shadow-sm bg-white/80 backdrop-blur-md dark:bg-gray-800/80">
      <NavBar />
    </header>

    <!--
      主内容区域
      使用 flex-1 确保内容不足一屏时，footer 依然保持在底部
    -->
    <main class="flex-1 w-full">
      <transition name="fade" mode="out-in">
        <router-view>
          <house-list-grid/>
        </router-view>
      </transition>
    </main>

    <!--
      公共组件：全局页脚
      功能：展示版权、联系方式、协议链接
    -->
    <footer class="w-full bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <Footer />
    </footer>
  </div>
</template>

<style scoped>
/* TailwindCss4 通常不需要额外写 CSS，但为了过渡动画更平滑，可保留少量自定义样式 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
