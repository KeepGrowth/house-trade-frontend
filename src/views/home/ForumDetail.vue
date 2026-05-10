<template>
  <div class="min-h-screen bg-gray-50 py-8 font-sans text-gray-600">
    <div class="w-full px-4 sm:px-6 lg:px-8">
      <!-- 面包屑导航 -->
      <nav class="mb-6 text-sm">
        <ol class="list-none p-0 inline-flex">
          <li class="flex items-center">
            <a href="#" class="text-gray-500 hover:text-blue-600 transition-colors">首页</a>
            <svg class="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
              <path
                d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
            </svg>
          </li>
          <li class="flex items-center">
            <a href="#" class="text-gray-500 hover:text-blue-600 transition-colors">房源交易论坛</a>
            <svg class="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
              <path
                d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
            </svg>
          </li>
          <li>
            <span class="text-gray-800 font-medium">帖子详情 #{{ post.postId }}</span>
          </li>
        </ol>
      </nav>

      <!-- 主帖子卡片 -->
      <article class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-8">
        <!-- 帖子头部 -->
        <div class="p-8 border-b border-gray-100">
          <div class="flex justify-between items-start mb-4">
            <h1 class="text-3xl font-bold text-gray-900 leading-tight">{{ post.title }}</h1>
            <span
              @click="goTodoHouseDetail(post.houseId)"
              class="cursor-pointer inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
              房源ID: {{ post.houseId }}
            </span>
          </div>

          <div class="flex items-center text-sm text-gray-500">
            <div class="flex items-center mr-4">
              <div
                class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-2">
                {{ getInitials(post.user.username) }}
              </div>
              <span class="font-medium text-gray-900">{{ post.user.username }}</span>
            </div>
            <span>发布于 {{ formatDate(post.createTime) }}</span>
          </div>
        </div>

        <!-- 帖子内容 -->
        <div class="p-8 prose prose-lg max-w-none text-gray-700 leading-relaxed">
          <p>{{ post.content }}</p>
          <!-- 这里可以渲染更多HTML内容 -->
        </div>
      </article>

      <!-- 回复区域 -->
      <section class="mb-12">
        <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span class="w-1 h-6 bg-blue-600 rounded mr-3"></span>
          用户回复 ({{ post.replies.length }})
        </h3>

        <div class="space-y-6">
          <div
            v-for="reply in post.replies"
            :key="reply.replyId"
            class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition-shadow hover:shadow-md"
          >
            <div class="flex justify-between items-center mb-4">
              <div class="flex items-center">
                <div
                  class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold mr-3 text-sm">
                  {{ getInitials('User') }}
                </div>
                <span class="font-semibold text-gray-900">用户ID:{{ reply.userId }}</span>
              </div>
              <span class="text-xs text-gray-400">{{ formatDate(reply.createTime) }}</span>
            </div>

            <div class="pl-11 text-gray-700 leading-relaxed">
              {{ reply.content }}
            </div>
          </div>
        </div>
      </section>

      <!-- 回复输入框 (模拟) -->
      <section class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h4 class="text-lg font-bold text-gray-900 mb-4">参与讨论</h4>
        <textarea
          v-model="currentReplyForm.content"
          class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-gray-700 bg-gray-50 focus:bg-white transition-colors"
          rows="4"
          placeholder="请输入您的回复（需登录）..."
        ></textarea>
        <div class="mt-4 flex justify-end">
          <button
            @click="submitReply"
            class="cursor-pointer px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all shadow-sm">
            提交回复
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onBeforeMount, onMounted, ref, watch } from 'vue'
import useForumStore from '@/stores/forum.js'
import router from '@/router/index.js'
import useUserStore from '@/stores/user.js'
import { ElNotification } from 'element-plus'
import useRepliestore from '@/stores/replies.js'
import { useRoute } from 'vue-router'

const route = useRoute() // 2. 获取 route 对象
const userStore = useUserStore()
const repliesStore = useRepliestore()
const props = defineProps({
  id: {
    type: Number,
    required: true
  }
})
const currentReplyForm = ref({
  postId: props.id,
  userId: null,
  content: ''
})

// 模拟数据结构，对应数据库字段
const post = ref({
  postId: 1024,
  userId: 88,
  houseId: 'H-20260401', // 对应 posts.houseId
  title: '关于市中心阳光花园三居室房源的产权疑问',
  content: '大家好，我最近看中了阳光花园的一套三居室（房源ID: H-20260401），但是房东提到该房产目前处于抵押状态。我想请教一下各位有经验的朋友，购买此类抵押房产在过户流程上有什么特别需要注意的地方吗？另外，资金监管是否必须走银行？谢谢！',
  createTime: '2026-04-20 14:30:00', // 对应 posts.createTime
  user: {},
  house: {},
  replies: []
})
const forumStore = useForumStore()
const fetchPostsDetail = async () => {
  const res = await forumStore.getForumDetail(props.id)
  if (res.data.code === 200) {
    post.value = res.data.data
  }
}
onMounted(async () => {
  setTimeout(async () => {
    await fetchPostsDetail()
  }, 1000)
})
// 辅助函数：格式化日期
const formatDate = (dateString) => {
  return dateString.replace(/(\d{4}-\d{2}-\d{2}) \d{2}:\d{2}:\d{2}/, '$1')
}

// 辅助函数：获取名字首字母作为头像
const getInitials = (name) => {
  return name ? name.charAt(0) : '?'
}
watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      fetchPostsDetail()
    }
  },{deep:true}
)
// 跳转到房源详情
const goTodoHouseDetail = async (houseId) => {
  if (!userStore.token) {
    ElNotification.error({
      title: '请先登录',
      message: '查看房源详情需要先登录！'
    })
    return
  }
  router.push(`/house/${houseId}`)
}
const submitReply = async () => {
  if (!userStore.token) {
    ElNotification.error({
      title: '未登录',
      message: '请先登录后再回复！'
    })
    return
  }
  const res = await repliesStore.addReplies(currentReplyForm.value)
  if (res.data.code === 200) {
    ElNotification.success({
      title: '成功',
      message: res.data.msg
    })
    await fetchPostsDetail()
  } else {
    ElNotification.error({
      title: '失败',
      message: res.data.msg
    })
    await fetchPostsDetail()
  }
}
</script>

<style scoped>
/* 可以在这里添加一些自定义的微调 */
</style>
