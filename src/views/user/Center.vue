<template>
  <div class="user-center-container max-w-4xl mx-auto p-6">
    <!-- 标题 -->
    <h2 class="text-2xl font-bold mb-6 text-gray-800">个人中心</h2>

    <el-row :gutter="20">
      <!-- 左侧：个人信息卡片 -->
      <el-col :span="8">
        <el-card class="profile-card">
          <template #header>
            <div class="card-header">
              <span>个人资料</span>
            </div>
          </template>

          <div class="text-center mb-4">
            <el-avatar :size="100" :src="userInfo.avatar || defaultAvatar" class="mb-2" />
            <el-upload
              action="/api/v1/upload/avatar"
              :headers="{ Authorization: `Bearer ${token}` }"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              class="avatar-uploader"
            >
              <el-button type="primary" link>更换头像</el-button>
            </el-upload>
          </div>

          <el-form :model="userInfo" label-position="top">
            <el-form-item label="用户名">
              <el-input v-model="userInfo.username" disabled />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="userInfo.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="角色">
              <el-tag :type="userInfo.role === 2 ? 'success' : 'primary'">
                {{ userInfo.role === 2 ? '房东' : '购房者' }}
              </el-tag>
            </el-form-item>

            <el-button type="primary" class="w-full" @click="updateProfile" :loading="loading">
              保存修改
            </el-button>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧：功能菜单 -->
      <el-col :span="16">
        <el-card class="menu-card">
          <template #header>
            <div class="card-header">
              <span>我的业务</span>
            </div>
          </template>

          <div class="grid grid-cols-2 gap-4">
            <!-- 所有用户可见 -->
            <div class="p-4 border rounded hover:bg-gray-50 cursor-pointer flex items-center" @click="$router.push('/user/favorites')">
              <el-icon class="mr-2 text-blue-500"><Star /></el-icon>
              <div>
                <div class="font-bold">我的收藏</div>
                <div class="text-xs text-gray-500">查看已收藏的房源</div>
              </div>
            </div>

            <!-- 仅房东可见 (根据 role === 2 判断) -->
            <div v-if="userInfo.role === 2" class="p-4 border rounded hover:bg-gray-50 cursor-pointer flex items-center" @click="$router.push('/user/my-houses')">
              <el-icon class="mr-2 text-green-500"><House /></el-icon>
              <div>
                <div class="font-bold">我的房源</div>
                <div class="text-xs text-gray-500">发布、编辑或下架房源</div>
              </div>
            </div>

            <div class="p-4 border rounded hover:bg-gray-50 cursor-pointer flex items-center" @click="handleLogout">
              <el-icon class="mr-2 text-red-500"><SwitchButton /></el-icon>
              <div>
                <div class="font-bold">退出登录</div>
                <div class="text-xs text-gray-500">安全退出当前账号</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Star, House, SwitchButton } from '@element-plus/icons-vue';
import axios from 'axios';
import useUserStore from '@/stores/user.js'

const userStore = useUserStore();
const token = localStorage.getItem('token'); // 或从 pinia 获取
const loading = ref(false);
const defaultAvatar = '/images/default-avatar.png';

// 用户信息响应式对象
const userInfo = ref({
  user_id: '',
  username: '',
  phone: '',
  role: 1,
  avatar: ''
});

// 获取用户详情
const fetchUserInfo = async () => {
  try {
    // 调用后端接口 /api/v1/user/profile
    const res = await axios.get('/api/v1/user/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.data.code === 200) {
      userInfo.value = res.data.data;
      // 同步更新 Pinia 中的用户信息
      userStore.setUserInfo(res.data.data);
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败');
  }
};

// 更新头像成功回调
const handleAvatarSuccess = (response) => {
  if (response.code === 200) {
    userInfo.value.avatar = response.data.url;
    ElMessage.success('头像更新成功');
  } else {
    ElMessage.error(response.msg);
  }
};

// 保存个人资料
const updateProfile = async () => {
  loading.value = true;
  try {
    const res = await axios.put('/api/v1/user/profile', {
      phone: userInfo.value.phone,
      avatar: userInfo.value.avatar
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.data.code === 200) {
      ElMessage.success('资料保存成功');
      userStore.setUserInfo(userInfo.value); // 更新本地状态
    } else {
      ElMessage.error(res.data.msg);
    }
  } catch (error) {
    ElMessage.error('保存失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 退出登录
const handleLogout = () => {
  userStore.logout();
  // 清除本地存储并跳转登录页
  localStorage.removeItem('token');
  window.location.href = '/login';
};

onMounted(() => {
  fetchUserInfo();
});
</script>

<style scoped>
/* 利用 TailwindCss 进行大部分布局，此处仅需少量自定义样式 */
.avatar-uploader :deep(.el-upload) {
  display: inline-block;
}
</style>
