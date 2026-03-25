<template>
  <!-- 加载状态：防止闪烁，提升体验 -->
  <div v-if="isLoading" class="flex items-center justify-center min-h-[400px] w-full">
    <el-skeleton :rows="5" animated />
  </div>

  <!-- 鉴权通过：渲染插槽内容 -->
  <slot v-else-if="isAuthorized" />

  <!-- 鉴权失败：未登录 -->
  <div v-else-if="!isLoggedIn && !isLoading" class="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg border border-dashed border-gray-300">
    <el-result icon="warning" title="需要登录" sub-title="请先登录以访问此页面">
      <template #extra>
        <el-button type="primary" @click="handleLogin">去登录</el-button>
      </template>
    </el-result>
  </div>

  <!-- 鉴权失败：无权限 -->
  <div v-else-if="!hasRequiredRole && !isLoading" class="flex flex-col items-center justify-center min-h-[400px] bg-red-50 rounded-lg border border-dashed border-red-200">
    <el-result icon="error" title="权限不足" :sub-title="noPermissionMessage">
      <template #extra>
        <el-button type="primary" @click="router.push('/')">返回首页</el-button>
        <el-button v-if="isLoggedIn" text type="danger" @click="handleLogout">退出登录</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

// 定义组件属性
interface Props {
  /**
   * 是否需要登录 (默认 true)
   * 如果为 false，则仅做角色校验（适用于某些公开但限制角色的页面，虽少见但保留扩展性）
   */
  requireLogin?: boolean;
  /**
   * 允许访问的角色列表
   * 对应数据库 role 字段: 1-购房者, 2-房东, 3-管理员
   * 例如: [2] 表示仅房东, [2, 3] 表示房东和管理员
   */
  roles?: number[];
}

const props = withDefaults(defineProps<Props>(), {
  requireLogin: true,
  roles: () => [] // 默认为空数组，表示只要登录即可，不限制具体角色
});

const router = useRouter();
const userStore = useUserStore();

// 本地状态
const isLoading = ref(true);

// 计算属性：获取用户信息
const isLoggedIn = computed(() => !!userStore.token);
const currentRole = computed(() => userStore.userInfo?.role);

// 计算属性：是否拥有所需角色
const hasRequiredRole = computed(() => {
  // 如果没有指定角色要求，则只要登录就算通过（前提是 requireLogin 为真）
  if (!props.roles || props.roles.length === 0) {
    return true;
  }
  return currentRole.value ? props.roles.includes(currentRole.value) : false;
});

// 计算属性：最终授权状态
const isAuthorized = computed(() => {
  if (props.requireLogin && !isLoggedIn.value) return false;
  if (props.roles.length > 0 && !hasRequiredRole.value) return false;
  return true;
});

// 计算属性：无权限提示文案
const noPermissionMessage = computed(() => {
  const roleMap: Record<number, string> = {
    1: '普通用户',
    2: '房东',
    3: '管理员'
  };

  if (!currentRole.value) return '用户角色信息缺失';

  const requiredRolesText = props.roles.map(r => roleMap[r] || `角色${r}`).join('或');
  const currentRoleText = roleMap[currentRole.value] || `角色${currentRole.value}`;

  return `当前账号是【${currentRoleText}】，无权访问此页面。仅限 ${requiredRolesText} 访问。`;
});

// 方法：处理登录跳转
const handleLogin = () => {
  // 记录当前路径，登录后跳回
  router.push({
    name: 'Login',
    query: { redirect: router.currentRoute.value.fullPath }
  });
};

// 方法：处理登出
const handleLogout = () => {
  userStore.logout();
  ElMessage.success('已退出登录');
  router.push('/');
};

// 生命周期：挂载时执行校验
onMounted(async () => {
  // 模拟网络请求延迟或等待 Pinia 初始化完成
  // 在实际项目中，如果 token 存在但 userInfo 为空，可能需要在此处调用 getUserInfo()

  try {
    if (userStore.token && !userStore.userInfo) {
      // 如果只有 token 没有用户信息，尝试获取（根据你的 store 实现调整）
      // await userStore.fetchUserInfo();
      // 此处为了演示，假设 store 初始化时已同步或异步完成
    }

    // 简单的延迟模拟加载，避免瞬间切换导致的视觉抖动
    await new Promise(resolve => setTimeout(resolve, 300));

    // 路由守卫逻辑判断
    if (props.requireLogin && !isLoggedIn.value) {
      // 未登录，不立即跳转，让模板显示“去登录”按钮，用户体验更好
      // 或者你可以选择直接跳转: router.replace(...)
    } else if (props.roles.length > 0 && !hasRequiredRole.value) {
      // 无权限，显示提示
    }
  } catch (error) {
    console.error('Auth check failed', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
/*
  TailwindCss 已处理大部分样式
  此处仅需补充少量自定义过渡效果（可选）
*/
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
