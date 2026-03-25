<template>
  <div class="w-full">
    <!-- 标题与提示 -->
    <div class="mb-2 flex justify-between items-center" v-if="title">
      <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
        {{ title }}
        <span v-if="required" class="text-red-500 ml-1">*</span>
      </label>
      <span class="text-xs text-gray-400">
        支持 {{ acceptTypes.join('/') }} 格式，单个不超过 {{ maxSize }}MB，最多 {{ limit }} 张
      </span>
    </div>

    <!-- 上传区域 -->
    <el-upload
        ref="uploadRef"
        :action="uploadUrl"
        :headers="headers"
        :data="extraData"
        :file-list="fileList"
        :on-change="handleChange"
        :on-remove="handleRemove"
        :before-upload="beforeUpload"
        :on-success="handleSuccess"
        :on-error="handleError"
        :limit="limit"
        :multiple="true"
        :accept="acceptString"
        :show-file-list="false"
        class="image-uploader-container"
        drag
    >
      <div v-if="fileList.length < limit" class="flex flex-col items-center justify-center p-6 text-center">
        <el-icon class="text-4xl text-blue-500 mb-2"><Plus /></el-icon>
        <div class="text-sm text-gray-500">点击或拖拽图片到此区域上传</div>
        <div class="text-xs text-gray-400 mt-1">建议尺寸 800x600 以上，清晰展示房源细节</div>
      </div>

      <!-- 当达到数量限制时，隐藏上传按钮，只显示已上传图片 -->
      <div v-else class="flex items-center justify-center h-full text-gray-400 text-sm">
        已达到最大上传数量 ({{ limit }})
      </div>
    </el-upload>

    <!-- 图片预览列表 (自定义渲染，替代 el-upload 默认的列表，以便更好地控制样式) -->
    <div v-if="fileList.length > 0" class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <div
          v-for="(file, index) in fileList"
          :key="file.uid"
          class="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <!-- 图片内容 -->
        <img
            :src="file.url || file.rawPreview"
            alt="preview"
            class="w-full h-full object-cover"
            loading="lazy"
        />

        <!-- 遮罩层 (悬停显示操作) -->
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
          <el-button
              type="primary"
              link
              size="small"
              @click="handlePreview(file)"
              class="text-white hover:text-blue-300"
          >
            <el-icon><ZoomIn /></el-icon>
          </el-button>
          <el-button
              type="danger"
              link
              size="small"
              @click="handleRemove(file)"
              class="text-white hover:text-red-300"
              v-if="!disabled"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>

        <!-- 上传状态指示 -->
        <div v-if="file.status === 'uploading'" class="absolute inset-0 flex items-center justify-center bg-black/20">
          <el-progress type="circle" :percentage="file.percentage" :width="40" stroke-width="4" color="#409EFF" />
        </div>

        <!-- 序号标签 -->
        <div class="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
          {{ index + 1 }}
        </div>
      </div>
    </div>

    <!-- 空状态提示 (当无图片且非上传状态时可选) -->
    <div v-if="fileList.length === 0 && !showPlaceholder" class="hidden"></div>
  </div>

  <!-- 全屏预览对话框 -->
  <el-dialog v-model="dialogVisible" title="图片预览" width="80%" :lock-scroll="false" class="bg-transparent backdrop-blur-sm">
    <div class="flex justify-center items-center h-[80vh]">
      <img :src="currentPreviewUrl" alt="full-preview" class="max-w-full max-h-full object-contain rounded shadow-2xl" />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {ElMessage, ElMessageBox, ElUpload} from 'element-plus';
import type { UploadUserFile, UploadFile, UploadProps } from 'element-plus';

// --- Props 定义 ---
interface Props {
  modelValue?: string[]; // 绑定图片 URL 数组
  uploadUrl?: string;    // 上传接口地址
  headers?: Record<string, any>; // 请求头 (如 Token)
  extraData?: Record<string, any>; // 额外表单数据
  limit?: number;        // 最大上传数量
  maxSize?: number;      // 最大文件大小 (MB)
  acceptTypes?: string[];// 允许的文件类型 ['image/jpeg', 'image/png']
  title?: string;        // 组件标题
  required?: boolean;    // 是否必填
  disabled?: boolean;    // 是否禁用
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  uploadUrl: '/api/v1/upload/image', // 默认占位符，实际使用中应由父组件传入或通过 axios 拦截器处理
  headers: () => ({}),
  extraData: () => ({}),
  limit: 9,
  maxSize: 5,
  acceptTypes: () => ['image/jpeg', 'image/png', 'image/webp'],
  title: '房源图片',
  required: false,
  disabled: false
});

// --- Emits 定义 ---
const emit = defineEmits<{
  'update:modelValue': [value: string[]];
  'change': [files: UploadUserFile[]];
}>();

// --- 状态管理 ---
const uploadRef = ref<InstanceType<typeof ElUpload>>();
const fileList = ref<UploadUserFile[]>([]);
const dialogVisible = ref(false);
const currentPreviewUrl = ref('');
const showPlaceholder = ref(true);

// 将 acceptTypes 转换为字符串格式供 el-upload 使用
const acceptString = computed(() => props.acceptTypes.join(','));

// --- 初始化 ---
// 监听 modelValue 变化，同步到内部 fileList (用于回显)
watch(
    () => props.modelValue,
    (newUrls) => {
      if (!newUrls || newUrls.length === 0) {
        fileList.value = [];
        return;
      }

      // 过滤掉已经存在的，避免重复添加 (简单处理)
      const existingUids = new Set(fileList.value.map(f => f.name)); // 这里用 name 或 url 做简单标识

      const newFiles: UploadUserFile[] = newUrls
          .filter(url => !fileList.value.some(f => f.url === url))
          .map((url, index) => ({
            name: `image-${Date.now()}-${index}`,
            url: url,
            status: 'success' as const,
            uid: Date.now() + index
          }));

      if (newFiles.length > 0) {
        fileList.value = [...fileList.value, ...newFiles];
      }
    },
    { immediate: true }
);

// --- 核心逻辑 ---

/**
 * 上传前校验
 */
const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  // 1. 类型校验
  const isValidType = props.acceptTypes.includes(rawFile.type);
  if (!isValidType) {
    ElMessage.error(`只支持 ${props.acceptTypes.join('/')} 格式的图片`);
    return false;
  }

  // 2. 大小校验
  const isLimitSize = rawFile.size / 1024 / 1024 < props.maxSize;
  if (!isLimitSize) {
    ElMessage.error(`图片大小不能超过 ${props.maxSize}MB`);
    return false;
  }

  // 3. 数量校验 (防止并发上传超出限制)
  if (fileList.value.length >= props.limit) {
    ElMessage.warning(`最多只能上传 ${props.limit} 张图片`);
    return false;
  }

  // 生成临时预览地址
  (rawFile as any).rawPreview = URL.createObjectURL(rawFile);

  return true;
};

/**
 * 文件列表变化 (添加文件时触发)
 */
const handleChange = (uploadFile: UploadFile, uploadFiles: UploadFile[]) => {
  // 更新内部列表
  fileList.value = uploadFiles as unknown as UploadUserFile[];

  // 如果是自动上传模式 (action 存在)，el-upload 会自动触发上传
  // 如果是手动模式 (action 为空)，需要在父组件调用 submit 方法，或者在这里手动触发
  // 本方案采用默认自动上传，但实际项目中通常配合 Axios 拦截器在 action 中处理

  emit('change', uploadFiles);
};

/**
 * 上传成功回调
 * 假设后端返回格式: { code: 200, data: { url: '...' } }
 */
const handleSuccess = (response: any, uploadFile: UploadFile) => {
  if (response.code === 200 || response.code === 0 || response.success) {
    const imageUrl = response.data?.url || response.data; // 兼容不同后端返回结构

    // 更新当前文件的 url
    const index = fileList.value.findIndex(f => f.uid === uploadFile.uid);
    if (index !== -1) {
      fileList.value[index].url = imageUrl;
      fileList.value[index].status = 'success';

      // 同步给父组件
      syncToParent();
      ElMessage.success('图片上传成功');
    }
  } else {
    handleError(new Error(response.msg || '上传失败'), uploadFile);
  }
};

/**
 * 上传失败回调
 */
const handleError = (err: Error, uploadFile: UploadFile) => {
  console.error(err);
  ElMessage.error(`图片 "${uploadFile.name}" 上传失败`);

  // 从列表中移除失败的文件
  const index = fileList.value.findIndex(f => f.uid === uploadFile.uid);
  if (index !== -1) {
    fileList.value.splice(index, 1);
  }
};

/**
 * 删除文件
 */
const handleRemove = (file: UploadFile) => {
  if (props.disabled) return;

  ElMessageBox.confirm('确定要删除这张图片吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    const index = fileList.value.findIndex(f => f.uid === file.uid);
    if (index !== -1) {
      fileList.value.splice(index, 1);
      syncToParent();
      ElMessage.success('删除成功');
    }
  }).catch(() => {});
};

/**
 * 预览图片
 */
const handlePreview = (file: UploadFile) => {
  currentPreviewUrl.value = file.url || (file.raw as any)?.rawPreview;
  dialogVisible.value = true;
};

/**
 * 同步数据到父组件 (提取所有成功上传的 URL)
 */
const syncToParent = () => {
  const urls = fileList.value
      .filter(f => f.status === 'success' && f.url)
      .map(f => f.url!) as string[];

  emit('update:modelValue', urls);
};

// 暴露方法供父组件调用 (如手动提交)
defineExpose({
  submit: () => uploadRef.value?.submit(),
  clearFiles: () => {
    fileList.value = [];
    syncToParent();
  }
});
</script>
