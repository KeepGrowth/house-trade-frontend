<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full max-w-2xl mx-auto transition-all duration-300 hover:shadow-md">
    <!-- 头部标题区 -->
    <div class="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
      <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <span class="w-1 h-6 bg-blue-500 rounded-full"></span>
        个人资料
      </h3>
      <div v-if="!isEditing" class="flex gap-2">
        <el-button type="primary" link @click="startEditing" class="text-blue-600 hover:text-blue-700 font-medium">
          <i class="ri-edit-line mr-1"></i> 编辑资料
        </el-button>
      </div>
      <div v-else class="flex gap-2">
        <el-button size="small" @click="cancelEditing">取消</el-button>
        <el-button type="primary" size="small" :loading="saving" @click="saveProfile">
          保存修改
        </el-button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="space-y-6">
      <!-- 头像上传行 -->
      <div class="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <div class="w-24 h-24 flex-shrink-0">
          <!-- 复用原子组件 EImageUpload -->
          <!-- 假设 EImageUpload 支持 single 模式和 modelValue 双向绑定 -->
          <EImageUpload
            v-model="formData.avatar"
            :limit="1"
            aspect-ratio="1/1"
            class="rounded-full overflow-hidden"
            upload-text="更换头像"
          />
        </div>
        <div class="flex-1">
          <p class="text-sm text-gray-500 mb-1">头像建议</p>
          <p class="text-xs text-gray-400">支持 JPG/PNG 格式，大小不超过 2MB，建议使用清晰正面照。</p>
        </div>
      </div>

      <!-- 表单信息网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 用户名 (只读) -->
        <div class="form-item">
          <label class="block text-sm font-medium text-gray-700 mb-1.5">登录账号</label>
          <div class="relative">
            <el-input
              v-model="formData.username"
              disabled
              class="bg-gray-50 text-gray-500 cursor-not-allowed"
              placeholder="用户名"
            >
              <template #prefix>
                <i class="ri-user-line text-gray-400"></i>
              </template>
            </el-input>
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">不可修改</span>
          </div>
        </div>

        <!-- 角色 (只读标签) -->
        <div class="form-item">
          <label class="block text-sm font-medium text-gray-700 mb-1.5">当前角色</label>
          <div class="h-10 flex items-center">
            <el-tag
              :type="getRoleTagType(formData.role)"
              size="large"
              effect="plain"
              class="px-4 py-1 rounded-md"
            >
              {{ getRoleLabel(formData.role) }}
            </el-tag>
            <span class="ml-3 text-xs text-gray-400" v-if="formData.role === 2">可发布房源</span>
            <span class="ml-3 text-xs text-gray-400" v-if="formData.role === 1">可收藏评价</span>
          </div>
        </div>

        <!-- 昵称 (可编辑) -->
        <div class="form-item">
          <label class="block text-sm font-medium text-gray-700 mb-1.5">
            显示昵称
            <span class="text-red-500 ml-1">*</span>
          </label>
          <el-input
            v-model="formData.nickname"
            placeholder="请输入您的昵称"
            :disabled="!isEditing"
            maxlength="20"
            show-word-limit
          >
            <template #prefix>
              <i class="ri-id-card-line text-gray-400"></i>
            </template>
          </el-input>
        </div>

        <!-- 联系电话 (可编辑) -->
        <div class="form-item">
          <label class="block text-sm font-medium text-gray-700 mb-1.5">
            联系电话
            <span class="text-red-500 ml-1">*</span>
          </label>
          <el-input
            v-model="formData.phone"
            placeholder="请输入手机号码"
            :disabled="!isEditing"
            maxlength="11"
          >
            <template #prefix>
              <i class="ri-phone-line text-gray-400"></i>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 注册时间 (只读展示) -->
      <div class="pt-4 border-t border-gray-50">
        <p class="text-xs text-gray-400 flex items-center gap-1">
          <i class="ri-time-line"></i>
          注册于 {{ formatTime(formData.create_time) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { ElMessage, FormInstance } from 'element-plus';
// 引入方案中定义的原子组件
import EImageUpload from '@/components/atoms/EImageUpload.vue';

// --- 类型定义 ---
interface UserInfo {
  user_id?: number;
  username: string;
  nickname: string; // 方案数据库虽未明确列出nickname字段，但通常前端展示需要，此处假设扩展或复用username展示
  role: number; // 1-购房者, 2-房东, 3-管理员
  phone: string;
  avatar: string;
  create_time: string;
}

// --- Props & Emits ---
const props = defineProps<{
  modelValue: UserInfo;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: UserInfo): void;
  (e: 'save', val: UserInfo): Promise<void>;
}>();

// --- 状态管理 ---
const isEditing = ref(false);
const saving = ref(false);
const formData = reactive<UserInfo>({ ...props.modelValue });

// 深拷贝一份用于编辑，避免直接修改原数据
let originalData: UserInfo | null = null;

// 监听外部数据变化，同步到本地
watch(() => props.modelValue, (newVal) => {
  if (!isEditing.value) {
    Object.assign(formData, newVal);
  }
}, { deep: true });

// --- 方法定义 ---

// 角色映射
const roleMap: Record<number, string> = {
  1: '购房者',
  2: '房东',
  3: '管理员'
};

const getRoleLabel = (role: number) => roleMap[role] || '未知角色';

const getRoleTagType = (role: number) => {
  switch (role) {
    case 1: return 'success'; // 购房者 - 绿
    case 2: return 'warning'; // 房东 - 橙
    case 3: return 'danger';  // 管理员 - 红
    default: return 'info';
  }
};

// 时间格式化 (简单实现，实际可用 dayjs)
const formatTime = (timeStr: string) => {
  if (!timeStr) return '-';
  const date = new Date(timeStr);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
};

// 开始编辑
const startEditing = () => {
  originalData = JSON.parse(JSON.stringify(formData)); // 备份当前数据
  isEditing.value = true;
};

// 取消编辑
const cancelEditing = () => {
  if (originalData) {
    Object.assign(formData, originalData);
  }
  isEditing.value = false;
  originalData = null;
};

// 保存逻辑
const saveProfile = async () => {
  // 简单校验
  if (!formData.phone || !/^1\d{10}$/.test(formData.phone)) {
    ElMessage.warning('请输入有效的手机号码');
    return;
  }
  if (!formData.nickname?.trim()) {
    ElMessage.warning('昵称不能为空');
    return;
  }

  saving.value = true;
  try {
    // 触发父组件保存逻辑
    await emit('save', { ...formData });
    ElMessage.success('资料更新成功');
    isEditing.value = false;
    originalData = null;
    // 更新父组件 v-model
    emit('update:modelValue', { ...formData });
  } catch (error) {
    console.error('Save failed', error);
    // 错误由父组件通过 message 反馈，或在此处统一处理
  } finally {
    saving.value = false;
  }
};
</script>

