import { createRouter, createWebHistory } from 'vue-router'

// 布局组件
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import useUserStore from '@/stores/user.js'

// 路由配置
const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      // --- 公共模块 (无需登录) ---
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/home/Index.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'houses',
        name: 'HouseList',
        component: () => import('@/views/house/List.vue'),
        meta: { title: '房源列表' }
      },
      {
        path: 'house/:id',
        name: 'HouseDetail',
        component: () => import('@/views/house/Detail.vue'),
        meta: { title: '房源详情' }
      },
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/user/Login.vue'),
        meta: { title: '登录', hideInMenu: true }
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/user/Register.vue'),
        meta: { title: '注册', hideInMenu: true }
      },
      {
        path: 'forum-detail/:id',
        name: 'ForumDetail',
        props: true,
        component: () => import('@/views/home/ForumDetail.vue'),
        meta: { title: '论坛', hideInMenu: true }
      },
      {
        path: 'forum-list',
        name: 'ForumList',
        component: () => import('@/views/home/ForumList.vue'),
        meta: { title: '论坛列表', hideInMenu: true }
      },

      // --- 用户/房东模块 (需登录) ---
      {
        path: 'user/center',
        name: 'UserCenter',
        component: () => import('@/views/user/Center.vue'),
        meta: { title: '个人中心', requiresAuth: true, roles: [1, 2, 3] }
      },
      {
        path: 'user/my-houses',
        name: 'MyHouses',
        component: () => import('@/views/house/MyList.vue'),
        meta: { title: '我的房源', requiresAuth: true, roles: [2] } // 角色2: 房东
      },
      {
        path: 'publish-house',
        name: 'PublishHouse',
        component: () => import('@/views/house/Publish.vue'),
        meta: { title: '发布房源', requiresAuth: true }
      },
      {
        path: 'user/favorites',
        name: 'Favorites',
        component: () => import('@/views/user/Favorites.vue'),
        meta: { title: '我的收藏', requiresAuth: true }
      }
    ]
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: {}, // 角色3: 管理员
    children: [
      // --- 管理员后台模块 ---
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: '数据看板' }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/UserManage.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'audit',
        name: 'AdminAudit',
        component: () => import('@/views/admin/Audit.vue'),
        meta: { title: '房源审核' }
      },
      {
        path: 'reviews',
        name: 'AdminReviews',
        component: () => import('@/views/admin/ReviewManage.vue'),
        meta: { title: '评价管理' }
      },
      {
        path: 'forum',
        name: 'AdminForum',
        component: () => import('@/views/admin/ForumManage.vue'),
        meta: { title: '论坛内容管理' }
      }
    ]
  },
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面未找到', hideInMenu: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫：实现方案中的"路由权限控制"
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token || ''
  const role = userStore.userInfo?.role || ''// 1-购房者, 2-房东, 3-管理员

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 二手房交易平台` : '二手房交易平台'

  // 1. 检查是否需要登录
  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // 2. 检查角色权限 (如果路由配置了特定角色)
  if (to.meta.roles && !to.meta.roles.includes(role)) {
    // 如果没有权限，重定向到首页或无权限页
    next({ name: 'Home' })
    return
  }

  next()
})

export default router
