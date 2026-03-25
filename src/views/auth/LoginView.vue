<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
    <!-- 背景装饰元素 (可选，增加美观度) -->
    <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

    <!-- 登录卡片容器 -->
    <div class="relative z-10 w-full max-w-md p-8 mx-4 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">

      <!-- 头部：Logo 和 标题 -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 tracking-tight">二手房交易平台</h2>
        <p class="text-sm text-gray-500 mt-2">欢迎回来，请登录您的账号</p>
      </div>

      <!-- 登录表单 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        class="space-y-6"
        size="large"
        @keyup.enter="handleLogin"
      >
        <!-- 账号输入 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名/手机号"
            prefix-icon="User"
            class="w-full"
            clearable
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 密码输入 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            class="w-full"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 角色选择 (根据方案中的角色设计) -->
        <el-form-item prop="role">
          <el-select
            v-model="loginForm.role"
            placeholder="选择登录角色"
            class="w-full"
            style="width: 100%"
          >
            <el-option label="购房者 (普通用户)" :value="1" />
            <el-option label="房东 (发布者)" :value="2" />
            <el-option label="管理员 (后台)" :value="3" />
          </el-select>
        </el-form-item>

        <!-- 记住我 & 忘记密码 -->
        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center space-x-2 cursor-pointer select-none">
            <el-checkbox v-model="loginForm.rememberMe" size="small" />
            <span class="text-gray-600 hover:text-blue-600 transition-colors">记住我</span>
          </label>
          <a href="#" class="text-blue-600 hover:text-blue-700 font-medium hover:underline">忘记密码？</a>
        </div>

        <!-- 登录按钮 -->
        <el-button
          type="primary"
          class="w-full py-6 text-base font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300"
          :loading="loading"
          @click="handleLogin"
        >
          {{ loading ? '登录中...' : '立即登录' }}
        </el-button>
      </el-form>

      <!-- 底部注册引导 -->
      <div class="mt-8 text-center text-sm text-gray-600">
        还没有账号？
        <router-link to="/auth/register" class="text-blue-600 font-semibold hover:text-blue-700 hover:underline ml-1">
          立即注册
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { User, Lock } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
// 假设已创建 userStore，用于处理登录逻辑和状态持久化
// import { useUserStore } from '@/stores/user';

const router = useRouter();
// const userStore = useUserStore();

// 表单引用
const loginFormRef = ref(null);

// 加载状态
const loading = ref(false);

// 表单数据模型
const loginForm = reactive({
  username: '',
  password: '',
  role: 1, // 默认购房者，对应方案数据库 design 中的 role: 1-购房者, 2-房东, 3-管理员
  rememberMe: false
});

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名或手机号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择登录角色', trigger: 'change' }
  ]
};

/**
 * 处理登录逻辑
 */
const handleLogin = async () => {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;

      try {
        // 模拟 API 请求延迟
        await new Promise(resolve => setTimeout(resolve, 1500));

        // TODO: 实际项目中取消注释以下代码调用真实接口
        /*
        const res = await apiAuth.login({
          username: loginForm.username,
          password: loginForm.password,
          role: loginForm.role
        });

        if (res.code === 200) {
          userStore.setToken(res.data.token);
          userStore.setUserInfo(res.data.user);
          ElMessage.success('登录成功');
          redirectBasedOnRole(loginForm.role);
        }
        */

        // 模拟成功逻辑
        ElMessage.success('登录成功，欢迎回来！');

        // 根据角色跳转 (方案路由权限控制)
        redirectBasedOnRole(loginForm.role);

      } catch (error) {
        ElMessage.error('登录失败，请检查账号密码或网络');
        console.error(error);
      } finally {
        loading.value = false;
      }
    } else {
      ElMessage.warning('请填写完整的登录信息');
      return false;
    }
  });
};

/**
 * 根据角色路由跳转逻辑
 * 对应方案 5.3 路由权限控制
 */
const redirectBasedOnRole = (role) => {
  let path = '/home'; // 默认首页

  switch (role) {
    case 1: // 购房者
      path = '/home';
      break;
    case 2: // 房东
      path = '/user/center/my-house'; // 房东个人中心/我的房源
      break;
    case 3: // 管理员
      path = '/admin/stats'; // 管理员数据看板
      break;
    default:
      path = '/home';
  }

  // 延迟一点跳转以展示成功消息
  setTimeout(() => {
    router.push(path);
  }, 500);
};
</script>

<style scoped>
/* Tailwind CSS 4 通常不需要额外的 style 标签，除非有自定义动画 */
/* 这里添加一个简单的 blob 动画来增强背景效果 */
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}
</style>
