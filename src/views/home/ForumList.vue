<template>
  <div class="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
    <div class="w-full mx-auto">
      <!-- 页面头部 -->
      <div class="mb-8 flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 tracking-tight">房源交易交流区</h1>
          <p class="mt-2 text-slate-500">讨论二手房源买卖流程、经验分享及问题反馈</p>
        </div>
        <button
          @click="openModal({})"
          class="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors shadow-sm">
          发布新帖
        </button>
      </div>

      <!-- 帖子列表容器 -->
      <div class="bg-white shadow-sm ring-1 ring-slate-900/5 rounded-lg overflow-hidden">
        <ul class="divide-y divide-gray-100">
          <!-- 循环渲染帖子列表 -->
          <li v-for="post in postList" :key="post.postId"
              @click="goToDetail(post.postId)"
              class="cursor-pointer group hover:bg-slate-50 transition-colors duration-200 p-6">
            <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <!-- 左侧内容区 -->
              <div class="flex-1 min-w-0">
                <!-- 标题与房源ID -->
                <div class="flex flex-wrap items-center gap-3 mb-2">
                  <h2
                    class="text-lg font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors cursor-pointer">
                    {{ post.title }}
                  </h2>
                  <!-- 状态标签 (映射自 status 字段) -->
                  <span
                    v-if="post.house.saleStatus === 1"
                    class="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
                  >
                    讨论房源处于在售状态
                  </span>
                  <span
                    v-else-if="post.house.saleStatus===2"
                    class="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                  >
                    房源已售
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                  >
                    房源下架
                  </span>

                  <!-- 房源ID (关联 houseId) -->
                  <span
                    class="inline-flex items-center text-xs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">
                    房源: {{ post.house.title }}
                  </span>
                </div>

                <!-- 内容摘要 (映射自 content 字段) -->
                <p class="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">
                  {{ post.content }}
                </p>

                <!-- 底部元数据 (用户、时间、回复数) -->
                <div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                  <div class="flex items-center gap-1.5">
                    <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                         stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round"
                            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <span class="font-medium text-slate-700">用户# {{ post.user.username }}</span>
                  </div>

                  <div class="flex items-center gap-1.5">
                    <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                         stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{{ formatDate(post.createTime) }}</span>
                  </div>

                </div>
              </div>

              <!-- 右侧：最后回复时间（可选，增加商务感） -->
              <div class="hidden md:block flex-shrink-0 w-32 text-right">
                <p class="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">发布时间</p>
                <p class="text-sm text-slate-600">{{ formatRelativeTime(post.createTime) }}</p>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- 分页占位 -->
      <div class="mt-6 flex justify-center">
        <el-pagination
          class="mt-8 flex justify-center"
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[5, 10, 15, 20]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="fetchForumData"
          @current-change="fetchForumData"
        />
      </div>
    </div>
  </div>
  <!--  新增|编辑帖子模态框-->
  <post-card
    v-model="showModal"
    :initialData="currentPost"
    @submit="handleSavePost"
  />
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import useForumStore from '@/stores/forum.js'
import router from '@/router/index.js'
import { ElMessage, ElNotification } from 'element-plus'
import PostCard from '@/components/post/PostCard.vue'
import useUserStore from '@/stores/user.js'

// 分页查询
const queryParams = ref({
  page: 1,
  pageSize: 10
})
const postList = ref()
const forumStore = useForumStore()
const total = ref(0)
const fetchForumData = async () => {
  const res = await forumStore.getForumList(queryParams.value)
  if (res.data.code === 200) {
    postList.value = res.data.data.postList
    total.value = res.data.data.total
  } else {
    ElNotification.error({
      title: '失败',
      message: res.data.message
    })
  }
}

watch(queryParams, async (newVal, old) => {
  await fetchForumData()
}, { deep: true })

onMounted(async () => {
  await fetchForumData()
})
// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 简单的相对时间格式化 (例如：2小时前)
const formatRelativeTime = (dateString) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return '刚刚'
  if (diffInSeconds < 3600) return Math.floor(diffInSeconds / 60) + '分钟前'
  if (diffInSeconds < 86400) return Math.floor(diffInSeconds / 3600) + '小时前'
  return formatDate(dateString)
}

const userStore = useUserStore()
// 跳转详情页
const goToDetail = (postId) => {
  router.push({ name: 'ForumDetail', params: { id: postId } })
}
// 新增|编辑帖子模态框
const showModal = ref(false)
const currentPost = ref()
const openModal = (postForm) => {
  if (!userStore.token) {
    ElNotification.error({
      title: '未登录',
      message: '登录后发布新交流贴'
    })
  }
  currentPost.value = postForm
  currentPost.value.userId = userStore.userInfo.id
  showModal.value = true
}
const handleSavePost = async (postForm) => {
  if (postForm.id) {
    // 更新
    const res = forumStore.updateForum(postForm)
    if (res.code === 200) {
      ElMessage.success({
        title: '成功',
        message: res.data.message
      })
      await fetchForumData()
      showModal.value = false
    } else {
      ElMessage.error({
        title: '失败',
        message: res.data.message
      })
      await fetchForumData()
      showModal.value = false
    }
  } else {
    // 新增
    const res = forumStore.addForum(postForm)
    console.log(res)
    if (res.code === 200) {
      ElMessage.success({
        title: '成功',
        message: res.message
      })
      await fetchForumData()
      showModal.value = false
    } else {
      ElMessage.success({
        title: '成功',
        message: res.message
      })
      await fetchForumData()
      showModal.value = false
    }
  }
}
</script>
