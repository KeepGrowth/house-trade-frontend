<template>
  <div class="group relative flex gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-100">
    <!-- 用户头像 -->
    <div class="flex-shrink-0">
      <el-avatar
        :size="48"
        :src="review.user?.avatar || defaultAvatar"
        class="ring-2 ring-white shadow-sm"
      >
        {{ getInitials(review.user?.username) }}
      </el-avatar>
    </div>

    <!-- 主要内容区域 -->
    <div class="flex flex-1 flex-col gap-2">
      <!-- 头部：用户名 + 时间 + 操作 -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="font-semibold text-gray-800">{{ review.user?.username || '匿名用户' }}</span>
          <!-- 角色标签 (可选，根据业务扩展) -->
          <el-tag v-if="review.user?.role === 2" size="small" type="warning" effect="plain" class="h-5">房东</el-tag>
        </div>
        <span class="text-xs text-gray-400">{{ formatTime(review.create_time) }}</span>
      </div>

      <!-- 评分 -->
      <div class="flex items-center">
        <EStarScore :model-value="review.score" readonly class="scale-90 origin-left" />
        <span class="ml-2 text-xs font-medium text-orange-500">{{ getScoreText(review.score) }}</span>
      </div>

      <!-- 评论内容 -->
      <div class="relative mt-1">
        <p
          class="text-sm leading-relaxed text-gray-600"
          :class="{ 'line-clamp-3': !isExpanded && review.content.length > 100 }"
        >
          {{ review.content }}
        </p>
        <!-- 展开/收起按钮 (仅当内容过长时显示) -->
        <button
          v-if="review.content.length > 100"
          @click="toggleExpand"
          class="mt-1 text-xs font-medium text-blue-500 hover:text-blue-600 focus:outline-none"
        >
          {{ isExpanded ? '收起' : '展开更多' }}
        </button>
      </div>

      <!-- 底部互动区 (预留扩展，如点赞、回复) -->
      <div class="mt-2 flex items-center gap-4 border-t border-gray-50 pt-2">
        <button class="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors">
          <el-icon><ChatDotRound /></el-icon>
          <span>回复</span>
        </button>
        <!-- 管理员或作者可见的删除/隐藏功能占位 -->
        <button v-if="showActions" class="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors ml-auto">
          <el-icon><Delete /></el-icon>
          <span>隐藏</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ChatDotRound, Delete } from '@element-plus/icons-vue';
import EStarScore from '../atoms/EStarScore.vue'; // 假设原子组件路径

// 默认头像占位图
const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';

// 定义 Props
interface ReviewUser {
  user_id?: number;
  username?: string;
  avatar?: string;
  role?: number; // 1-购房者, 2-房东
}

interface ReviewProps {
  review: {
    review_id: number;
    user?: ReviewUser;
    score: number; // 1-5
    content: string;
    create_time: string; // ISO 字符串
    status?: number; // 是否显示
  };
  showActions?: boolean; // 是否显示管理操作
}

const props = withDefaults(defineProps<ReviewProps>(), {
  showActions: false
});

// 状态：展开/收起
const isExpanded = ref(false);

// 方法：切换展开状态
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

// 方法：获取用户名首字母
const getInitials = (name?: string) => {
  if (!name) return 'U';
  return name.charAt(0).toUpperCase();
};

// 方法：格式化时间 (简单实现，实际可用 dayjs)
const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)}小时前`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}天前`;

  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

// 方法：评分文案
const getScoreText = (score: number) => {
  if (score >= 5) return '非常满意';
  if (score >= 4) return '满意';
  if (score >= 3) return '一般';
  return '不满意';
};
</script>

<style scoped>
/*
  TailwindCss4 通常不需要额外写 CSS，
  如果有特殊动画需求可在此补充，
  例如 line-clamp 需要确保构建工具支持 (现代 Vite/Tailwind 默认支持)
*/
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
