import { createRouter, createWebHistory } from 'vue-router'

// 布局组件导入
import DefaultLayout from '@/layouts/DefaultLayout.vue' // 前台默认布局 (包含 NavBar, Footer)
import AdminLayout from '@/layouts/AdminLayout.vue'
import useUserStore from '@/stores/user.js'     // 后台管理布局

// 视图组件导入 (懒加载优化性能)
// 1. 公共模块
const Home = () => import('@/views/home/HomeView.vue')
const HouseList = () => import('@/views/house/HouseListView.vue')
const HouseDetail = () => import('@/views/house/HouseDetailView.vue')
const Login = () => import('@/views/auth/LoginView.vue')
const Register = () => import('@/views/auth/RegisterView.vue')

// 2. 用户/房东模块
const UserCenter = () => import('@/views/user/UserCenterView.vue')
const MyFavorites = () => import('@/views/user/MyFavoritesView.vue')
const PublishHouse = () => import('@/views/house/PublishHouseView.vue') // 发布房源
const MyHouses = () => import('@/views/user/MyHousesView.vue')          // 我的房源管理

// 3. 管理员后台模块
const AdminDashboard = () => import('@/views/admin/DashboardView.vue')   // 数据看板 (Echarts)
const AdminUserManage = () => import('@/views/admin/UserManageView.vue') // 用户管理
const AdminAudit = () => import('@/views/admin/AuditListView.vue')       // 房源审核
const AdminReviews = () => import('@/views/admin/ReviewManageView.vue')  // 评价管理

// 路由配置
const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: Home,
        meta: { title: '首页', requiresAuth: false }
      },
      {
        path: 'houses',
        name: 'HouseList',
        component: HouseList,
        meta: { title: '房源列表', requiresAuth: false }
      },
      {
        path: 'houses/:id',
        name: 'HouseDetail',
        component: HouseDetail,
        meta: { title: '房源详情', requiresAuth: false }
      },
      {
        path: 'login',
        name: 'Login',
        component: Login,
        meta: { title: '登录', requiresAuth: false, hideInNav: true }
      },
      {
        path: 'register',
        name: 'Register',
        component: Register,
        meta: { title: '注册', requiresAuth: false, hideInNav: true }
      },

      // --- 需要登录的用户模块 ---
      {
        path: 'user/center',
        name: 'UserCenter',
        component: UserCenter,
        meta: { title: '个人中心', requiresAuth: true }
      },
      {
        path: 'user/favorites',
        name: 'MyFavorites',
        component: MyFavorites,
        meta: { title: '我的收藏', requiresAuth: true }
      },
      {
        path: 'user/my-houses',
        name: 'MyHouses',
        component: MyHouses,
        meta: { title: '我的房源', requiresAuth: true, roles: [2] } // 2: 房东
      },
      {
        path: 'publish/house',
        name: 'PublishHouse',
        component: PublishHouse,
        meta: { title: '发布房源', requiresAuth: true, roles: [2] } // 2: 房东
      },
      {
        path: 'publish/house/:id', // 编辑房源复用发布页或独立页
        name: 'EditHouse',
        component: PublishHouse,
        meta: { title: '编辑房源', requiresAuth: true, roles: [2] }
      }
    ]
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: [3] }, // 3: 管理员，整个 /admin 路径下都需要管理员权限
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { title: '数据看板', icon: 'DataLine' }
      },
      {
        path: 'users',
        name: 'AdminUserManage',
        component: AdminUserManage,
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'audit',
        name: 'AdminAudit',
        component: AdminAudit,
        meta: { title: '房源审核', icon: 'DocumentChecked' }
      },
      {
        path: 'reviews',
        name: 'AdminReviews',
        component: AdminReviews,
        meta: { title: '评价管理', icon: 'ChatDotRound' }
      }
    ]
  },
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFound.vue'),
    meta: { title: '页面未找到' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

/**
 * 全局前置守卫：实现文档 5.3 节的路由权限控制
 * 逻辑：
 * 1. 公开路由：直接放行
 * 2. 需登录路由：检查 Token (Pinia userStore.token)
 * 3. 需角色路由：检查用户角色 (Pinia userStore.role)
 */
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token
  const role = userStore.role // 1:购房者, 2:房东, 3:管理员

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 二手房交易平台` : '二手房交易平台'

  // 1. 检查是否需要登录
  if (to.meta.requiresAuth) {
    if (!token) {
      // 未登录，重定向到登录页，并记录原目标路径以便登录后跳回
      return next({ name: 'Login', query: { redirect: to.fullPath } })
    }

    // 2. 检查是否需要特定角色
    if (to.meta.roles && Array.isArray(to.meta.roles)) {
      if (!to.meta.roles.includes(role)) {
        // 角色不匹配
        if (role === 3) {
          // 如果是管理员访问了非管理员页面，可能只是路径错，但如果访问了需要房东权限的，提示无权限
          // 这里简单处理：如果角色完全不在允许列表中，重定向到首页或无权限页
          alert('您没有权限访问该页面')
          return next({ name: 'Home' })
        } else if (role === 2) {
          // 房东尝试访问管理员页面或其他
          alert('您没有权限访问该页面')
          return next({ name: 'Home' })
        } else {
          // 普通用户尝试访问房东或管理员页面
          alert('您没有权限访问该页面')
          return next({ name: 'Home' })
        }
      }
    }
  }

  // 3. 如果已登录用户访问登录/注册页，重定向到首页或用户中心
  if (token && (to.name === 'Login' || to.name === 'Register')) {
    return next({ name: 'Home' })
  }

  next()
})

export default router
