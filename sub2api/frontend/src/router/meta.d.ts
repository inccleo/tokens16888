/**
 * Type definitions for Vue Router meta fields
 * Extends the RouteMeta interface with custom properties
 */

import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /**
     * Whether this route requires authentication
     * @default true
     */
    requiresAuth?: boolean

    /**
     * Whether this route requires admin role
     * @default false
     */
    requiresAdmin?: boolean

    /**
     * 该路由使用的外壳布局。由 App.vue 的布局解析器读取：
     * - 'public'：公共站点顶部导航外壳（PublicLayout）
     * - 'user'：用户控制台外壳（UserLayout）
     * - 'admin'：管理员控制台外壳（AdminLayout）
     * 未设置时保持现状：页面自行渲染布局（如自带 AppLayout 的旧页面），App.vue 不再包裹。
     * 阶段 1 迁移期两种方式并存，页面逐个从「自带 AppLayout」切换到「meta.layout + 路由级外壳」。
     */
    layout?: 'public' | 'user' | 'admin'

    /**
     * 标记该路由为管理员登录入口（/admin/login）。LoginView 据此把登录后的默认
     * 落点设为管理员端（/admin/dashboard），而用户入口（/login）默认进用户端。
     */
    adminEntry?: boolean

    /**
     * Page title for this route
     */
    title?: string

    /**
     * Optional breadcrumb items for navigation
     */
    breadcrumbs?: Array<{
      label: string
      to?: string
    }>

    /**
     * Icon name for this route (for sidebar navigation)
     */
    icon?: string

    /**
     * Whether to hide this route from navigation menu
     * @default false
     */
    hideInMenu?: boolean

    /**
     * Whether this route requires internal payment system to be enabled
     * @default false
     */
    requiresPayment?: boolean

    /**
     * 是否要求风控中心功能开关已启用
     * @default false
     */
    requiresRiskControl?: boolean

    /**
     * 是否要求订阅功能开关（subscription_enabled，opt-out）未被显式关闭
     * @default false
     */
    requiresSubscription?: boolean

    /**
     * i18n key for the page title
     */
    titleKey?: string

    /**
     * i18n key for the page description
     */
    descriptionKey?: string
  }
}
