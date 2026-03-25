<template>
  <div class="register-container">
    <div class="register-card">
      <h2 class="title">用户注册</h2>

      <el-form
        ref="registerFormRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
        size="large"
      >
        <!-- 用户名 -->
        <el-form-item label="账号" prop="username">
          <el-input v-model="formData.username" placeholder="请输入登录账号" clearable />
        </el-form-item>

        <!-- 手机号 -->
        <el-form-item label="手机" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" maxlength="11" clearable />
        </el-form-item>

        <!-- 角色选择 (根据方案：1-购房者, 2-房东) -->
        <el-form-item label="身份" prop="role">
          <el-radio-group v-model="formData.role">
            <el-radio :label="1">购房者</el-radio>
            <el-radio :label="2">房东</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>

        <!-- 确认密码 -->
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="formData.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleRegister"
            class="w-full"
          >
            立即注册
          </el-button>
        </el-form-item>

        <!-- 跳转登录 -->
        <div class="login-link">
          已有账号？<router-link to="/login" class="link-text">去登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import axios from 'axios' // 假设已配置好 axios 实例

const router = useRouter()
const registerFormRef = ref<FormInstance>()
const loading = ref(false)

// 表单数据
const formData = reactive({
  username: '',
  phone: '',
  role: 1, // 默认购房者
  password: '',
  confirmPassword: ''
})

// 自定义验证器：确认密码
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== formData.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

// 表单验证规则
const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择用户身份', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
})

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 调用后端接口 (对应方案中的 /api/v1/auth/register)
        const response = await axios.post('/api/v1/auth/register', {
          username: formData.username,
          password: formData.password,
          phone: formData.phone,
          role: formData.role
        })

        // 假设后端返回格式 { code: 200, msg: 'success', data: ... }
        if (response.data.code === 200 || response.data.code === 0) {
          ElMessage.success('注册成功，即将跳转登录')
          setTimeout(() => {
            router.push('/login')
          }, 1500)
        } else {
          ElMessage.error(response.data.msg || '注册失败')
        }
      } catch (error: any) {
        ElMessage.error(error.response?.data?.msg || '网络请求失败')
      } finally {
        loading.value = false
      }
    } else {
      return false
    }
  })
}
</script>

<style scoped lang="scss">
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa; // 浅灰背景
}

.register-card {
  width: 420px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  .title {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
    font-size: 24px;
    font-weight: 600;
  }

  .login-link {
    text-align: center;
    margin-top: 10px;
    font-size: 14px;
    color: #666;

    .link-text {
      color: #409eff;
      text-decoration: none;
      margin-left: 5px;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .w-full {
    width: 100%;
  }
}
</style>
