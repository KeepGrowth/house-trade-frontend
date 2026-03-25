<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 bg-[url('@/assets/login-bg.jpg')] bg-cover bg-center">
    <!-- 登录卡片 -->
    <el-card class="w-full max-w-md shadow-xl backdrop-blur-sm bg-white/90">
      <template #header>
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-800">易居二手房交易平台</h2>
          <p class="text-sm text-gray-500 mt-2">基于Fastapi+Vue3实现。</p>
        </div>
      </template>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        class="space-y-6"
        size="large"
      >
        <!-- 账号输入 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入账号/手机号"
            prefix-icon="User"
            clearable
          />
        </el-form-item>

        <!-- 密码输入 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>


        <!-- 登录按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            class="w-full py-6 text-lg font-semibold"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '立即登录' }}
          </el-button>
        </el-form-item>

        <!-- 注册引导 -->
        <div class="text-center text-sm text-gray-600">
          还没有账号？
          <el-link type="primary" @click="$router.push('/register')">立即注册</el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

// 假设已封装 axios 实例
import request from '@/utils/request';
import useUserStore from '@/stores/user.js'

const router = useRouter();
const userStore = useUserStore();
const loginFormRef = ref(null);
const loading = ref(false);

// 表单数据
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
});

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ]
};

// 登录处理函数
const handleLogin = async () => {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // 调用后端接口设计方案中的 /login
        const  data  = await userStore.login({
          username: loginForm.username,
          password: loginForm.password
        });
        console.log(data)
        if (data.data.code === 200) {
          ElMessage.success('登录成功');
          // 根据角色跳转或回到上一页
          // 方案中提到角色有：1-购房者, 2-房东, 3-管理员
          const role = userStore.userInfo.role
          if (role === 3) {
            router.replace('/admin'); // 管理员跳转后台
          } else {
            router.replace('/'); // 普通用户/房东跳转首页
          }
        } else {
          ElMessage.error(data.msg || '登录失败');
        }
      } catch (error) {
        console.error(error);
        ElMessage.error('网络异常，请稍后重试');
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style scoped>
/*
  这里主要依赖 TailwindCss 进行布局。
  如果需要覆盖 ElementPlus 的特定样式，可以在这里添加。
*/
:deep(.el-card__header) {
  padding: 20px 0;
  border-bottom: none;
}

:deep(.el-form-item__content) {
  width: 100%;
}
</style>
