<template>
  <div class="admin-layout-container">
    <el-container class="layout-wrapper">
      <!-- 侧边栏导航 -->
      <el-aside :width="isCollapse ? '64px' : '220px'" class="admin-aside">
        <div class="logo-box">
          <span v-if="!isCollapse" class="system-title">二手房管理平台</span>
        </div>

        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          router
          class="admin-menu"
        >
          <el-menu-item index="/admin">
            <el-icon>
              <DataAnalysis />
            </el-icon>
            <template #title>数据看板</template>
          </el-menu-item>

          <el-menu-item index="/admin/users">
            <el-icon>
              <User />
            </el-icon>
            <template #title>用户管理</template>
          </el-menu-item>

          <el-menu-item index="/admin/audit">
            <el-icon>
              <DocumentChecked />
            </el-icon>
            <template #title>房源审核</template>
          </el-menu-item>

          <el-menu-item index="/admin/reviews">
            <el-icon>
              <ChatDotRound />
            </el-icon>
            <template #title>房源评价评价管理</template>
          </el-menu-item>
          <el-menu-item index="/admin/forum">
            <el-icon>
              <ChatDotRound />
            </el-icon>
            <template #title>论坛管理</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <!-- 顶部通栏 -->
        <el-header class="admin-header">
          <div class="header-left">
            <el-icon class="collapse-btn" @click="toggleCollapse">
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>

          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="user-info">

                <span class="username is-align-center">{{ userStore.userInfo.username }}</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 主内容区域 -->
        <el-main class="admin-main">
          <router-view v-slot="{ Component }">
            <transition name="fade-transform" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  DataAnalysis, User, DocumentChecked, ChatDotRound,
  Fold, Expand
} from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import useUserStore from '@/stores/user.js'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 侧边栏折叠状态
const isCollapse = ref(false)

// 当前激活菜单
const activeMenu = computed(() => route.path)

// 当前页面标题（用于面包屑）
const currentTitle = computed(() => {
  const matched = route.matched.find(item => item.path === route.path)
  return matched?.meta?.title || '管理后台'
})

// 切换折叠
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 处理下拉命令
const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      // 清除本地状态和 Token
      userStore.logout()
      ElMessage.success('退出成功')
      router.push('/login')
    } catch {
      // 取消操作
    }
  } else if (command === 'profile') {
    router.push('/user/center')
  }
}
</script>

<style scoped lang="scss">
.admin-layout-container {
  height: 100vh;
  width: 100%;
  background-color: #f0f2f5;

  .layout-wrapper {
    height: 100%;
  }

  .admin-aside {
    background-color: #304156;
    transition: width 0.3s;
    overflow-x: hidden;

    .logo-box {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #2b3a4b;

      .logo-img, .logo-icon {
        height: 32px;
        width: auto;
      }

      .system-title {
        color: #fff;
        font-size: 18px;
        font-weight: bold;
        margin-left: 10px;
        white-space: nowrap;
      }
    }

    .admin-menu {
      border-right: none;

      &:not(.el-menu--collapse) {
        width: 220px;
      }
    }
  }

  .admin-header {
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, .08);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    z-index: 10;

    .header-left {
      display: flex;
      align-items: center;

      .collapse-btn {
        font-size: 20px;
        cursor: pointer;
        margin-right: 20px;
        transition: color 0.3s;

        &:hover {
          color: #409EFF;
        }
      }
    }

    .header-right {
      .user-info {
        display: flex;
        align-items: center;
        cursor: pointer;

        .username {
          margin-left: 8px;
          font-size: 14px;
          color: #606266;
        }
      }
    }
  }

  .admin-main {
    padding: 20px;
    overflow-y: auto;
  }
}

// 路由过渡动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
