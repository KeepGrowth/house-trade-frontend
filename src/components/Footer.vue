<template>
  <footer class="bg-slate-50 border-t border-slate-200 pt-12 pb-8 mt-auto">
    <div class="container mx-auto px-4 md:px-6">
      <!-- 主要内容区域：三列布局 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

        <!-- 第一列：平台简介 -->
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <!-- 模拟Logo，实际项目中可替换为图片组件 -->
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              房
            </div>
            <span class="text-xl font-bold text-slate-800">易居二手房</span>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed">
            专注于为您提供真实、透明、高效的二手房交易服务。连接购房者与房东，让安家更简单。
          </p>
          <div class="flex space-x-3 pt-2">
            <!-- 社交图标占位，可使用 ElementPlus Icon -->
            <el-icon class="text-slate-400 hover:text-blue-600 cursor-pointer transition-colors"><ChatDotRound /></el-icon>
            <el-icon class="text-slate-400 hover:text-blue-600 cursor-pointer transition-colors"><Share /></el-icon>
            <el-icon class="text-slate-400 hover:text-blue-600 cursor-pointer transition-colors"><Service /></el-icon>
          </div>
        </div>

        <!-- 第二列：快速链接 -->
        <div class="space-y-4">
          <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wider">快速导航</h3>
          <ul class="space-y-2 text-sm">
            <li v-for="link in navLinks" :key="link.path">
              <router-link
                :to="link.path"
                class="text-slate-500 hover:text-blue-600 transition-colors flex items-center group"
              >
                <span class="w-1.5 h-1.5 bg-slate-300 rounded-full mr-2 group-hover:bg-blue-600 transition-colors"></span>
                {{ link.name }}
              </router-link>
            </li>
          </ul>
        </div>

        <!-- 第三列：联系方式 -->
        <div class="space-y-4">
          <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wider">联系我们</h3>
          <ul class="space-y-3 text-sm text-slate-500">
            <li class="flex items-start">
              <el-icon class="mr-2 mt-0.5 text-blue-600"><Location /></el-icon>
              <span>北京市朝阳区科技园区创新大厦A座</span>
            </li>
            <li class="flex items-center">
              <el-icon class="mr-2 text-blue-600"><Phone /></el-icon>
              <span>400-123-4567</span>
            </li>
            <li class="flex items-center">
              <el-icon class="mr-2 text-blue-600"><Message /></el-icon>
              <span>support@yiju-house.com</span>
            </li>
          </ul>
          <el-button type="primary" link class="!text-blue-600 !font-medium hover:!underline px-0">
            成为房东入驻 &rarr;
          </el-button>
        </div>
      </div>

      <!-- 分割线 -->
      <div class="border-t border-slate-200 my-8"></div>

      <!-- 底部版权与协议 -->
      <div class="flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 space-y-2 md:space-y-0">
        <div class="flex flex-wrap justify-center md:justify-start gap-4">
          <router-link to="/agreement/user" class="hover:text-slate-600 transition-colors">用户协议</router-link>
          <router-link to="/agreement/privacy" class="hover:text-slate-600 transition-colors">隐私政策</router-link>
          <router-link to="/agreement/rules" class="hover:text-slate-600 transition-colors">交易规则</router-link>
          <span>&copy; {{ currentYear }} 易居二手房交易平台 版权所有</span>
        </div>
        <div class="flex items-center space-x-2">
          <span>京ICP备12345678号</span>
          <el-tooltip content="本网站已接入公安联网备案" placement="top">
            <el-icon class="cursor-help hover:text-slate-600"><Shield /></el-icon>
          </el-tooltip>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  ChatDotRound,
  Share,
  Service,
  Location,
  Phone,
  Message,
} from '@element-plus/icons-vue'

// 动态获取当前年份
const currentYear = computed(() => new Date().getFullYear())

// 导航链接配置，根据系统设计方案中的路由规划
const navLinks = [
  { name: '首页', path: '/' },
  { name: '房源列表', path: '/houses' },
  { name: '发布房源', path: '/publish' }, // 房东核心功能
  { name: '个人中心', path: '/user/center' },
  { name: '管理后台', path: '/admin' }, // 仅管理员可见，实际项目中可加权限指令
  { name: '帮助中心', path: '/help' }
]
</script>
