<template>
  <!-- 背景遮罩层：使用 v-show 控制显示，配合 transition 实现淡入淡出 -->
  <transition name="fade">
    <div
      v-show="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/60 p-4 backdrop-blur-sm"
      @click.self="handleClose"
    >
      <!-- 模态框容器 -->
      <transition name="slide-up">
        <div
          v-show="modelValue"
          class="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl ring-1 ring-gray-200"
        >
          <!-- 1. 头部区域 -->
          <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ isEdit ? '编辑帖子' : '发布新帖子' }}
            </h3>
            <button
              @click="handleClose"
              class="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- 2. 表单内容区域 -->
          <form @submit.prevent="handleSubmit" class="px-6 py-5">
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <!-- 关联用户 ID (userId) -->
              <div class="col-span-1">
                <label class="mb-1.5 block text-sm font-medium text-gray-700">
                  用户 ID <span class="text-xs font-normal text-gray-500">(关联用户)</span>
                </label>
                <input
                  v-model="formData.userId"
                  type="number"
                  placeholder="请输入用户 ID"
                  class="block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                  :disabled="isEdit"
                />
              </div>

              <!-- 关联房源 ID (houseId) -->
              <div class="col-span-1">
                <label class="mb-1.5 block text-sm font-medium text-gray-700">
                  房源 ID <span class="text-xs font-normal text-gray-500">(关联房源)</span>
                </label>
                <input
                  v-model="formData.houseId"
                  type="number"
                  placeholder="请输入房源 ID"
                  class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <!-- 标题 (title) -->
              <div class="col-span-2">
                <label class="mb-1.5 block text-sm font-medium text-gray-700">
                  帖子标题
                </label>
                <input
                  v-model="formData.title"
                  type="text"
                  maxlength="100"
                  placeholder="在此输入标题（限100字）"
                  class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <!-- 内容 (content) -->
              <div class="col-span-2">
                <label class="mb-1.5 block text-sm font-medium text-gray-700">
                  详细内容
                </label>
                <textarea
                  v-model="formData.content"
                  rows="4"
                  placeholder="请输入帖子的详细内容..."
                  class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                ></textarea>
              </div>

              <!-- 状态 (status) -->
              <div class="col-span-2 md:col-span-1">
                <label class="mb-1.5 block text-sm font-medium text-gray-700">
                  状态设置(启用|禁用）
                </label>
                <el-switch
                  v-model="formData.status"
                  :active-value="1"
                  :inactive-value="0"
                />
              </div>

              <!-- 创建时间展示 -->
              <div
                v-if="isEdit"
                class="col-span-2 md:col-span-1 flex items-end pb-2"
              >
                <div class="text-sm text-gray-500">
                  <span class="block text-xs font-medium uppercase tracking-wide text-gray-400">
                    创建时间
                  </span>
                  {{ formData.createTime || '未知时间' }}
                </div>
              </div>
            </div>
          </form>

          <!-- 3. 底部操作按钮 -->
          <div
            class="flex flex-row-reverse gap-3 rounded-b-xl border-t border-gray-100 bg-gray-50 px-6 py-4"
          >
            <button
              type="button"
              @click="handleSubmit"
              class="cursor-pointer inline-flex justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {{ isEdit ? '保存修改' : '立即发布' }}
            </button>
            <button
              type="button"
              @click="handleClose"
              class="cursor-pointer inline-flex justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              取消
            </button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'

// --- Props & Emits ---
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  // 接收编辑时的初始数据，如果是新增则为 null
  initialData: {
    type: Object,
    default: {
      id: null,
      postId: null,
      userId: null,
      houseId: null,
      title: '',
      content: '',
      createTime: '',
      updateTime: '',
      status: 1 // 默认为发布状态
    }
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

// --- 状态管理 ---
// 表单数据对象
const formData = ref({
  postId: null,
  userId: null,
  houseId: null,
  title: '',
  content: '',
  createTime: '',
  updateTime: '',
  status: 1 // 默认为发布状态
})

// 判断是编辑模式还是新增模式
const isEdit = ref(false)

// 监听 props.initialData 变化来初始化表单
watch(
  () => props.initialData,
  (newVal) => {
    if (newVal.postId) {
      isEdit.value = true
      // 浅拷贝数据，避免直接修改父组件传来的对象
      formData.value = { ...newVal }
    } else {
      isEdit.value = false
      // 重置表单
      formData.value = {
        postId: null,
        userId: null,
        houseId: null,
        title: '',
        content: '',
        createTime: '',
        updateTime: '',
        status: 1
      }
    }
  },
  { immediate: true }
)

// --- 方法 ---
const handleClose = () => {
  emit('update:modelValue', false)
}

const handleSubmit = () => {
  // 这里可以添加简单的表单验证
  if (!formData.value.title) {
    alert('请输入标题')
    return
  }

  // 将表单数据发送给父组件
  emit('submit', formData.value)
}
</script>

<style scoped>
/* 简单的过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.2s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
</style>
