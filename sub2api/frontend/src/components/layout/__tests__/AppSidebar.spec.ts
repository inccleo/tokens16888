import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

// 阶段 1 导航拆分后，原 AppSidebar 的实现被分解到：
// - SidebarShell.vue：渲染 + 滚动持久化 + 分组展开 + 自定义 SVG 图标样式
// - nav/useUserNav.ts：用户导航数据（含订阅 flag、购买文案）
// - nav/useAdminNav.ts：管理员导航数据（含管理端订阅入口 flag）
// 这些守卫断言随之指向新的归属文件。
const dir = dirname(fileURLToPath(import.meta.url))
const shellSource = readFileSync(resolve(dir, '../SidebarShell.vue'), 'utf8')
const adminSidebarSource = readFileSync(resolve(dir, '../AdminSidebar.vue'), 'utf8')
const userSidebarSource = readFileSync(resolve(dir, '../UserSidebar.vue'), 'utf8')
const userNavSource = readFileSync(resolve(dir, '../nav/useUserNav.ts'), 'utf8')
const adminNavSource = readFileSync(resolve(dir, '../nav/useAdminNav.ts'), 'utf8')
const styleSource = readFileSync(resolve(dir, '../../../style.css'), 'utf8')

describe('SidebarShell custom SVG styles', () => {
  it('does not override uploaded SVG fill or stroke colors', () => {
    expect(shellSource).toContain('.sidebar-svg-icon {')
    expect(shellSource).toContain('color: currentColor;')
    expect(shellSource).toContain('display: block;')
    expect(shellSource).not.toContain('stroke: currentColor;')
    expect(shellSource).not.toContain('fill: none;')
  })
})

describe('SidebarShell scroll position persistence', () => {
  it('binds a template ref to the sidebar nav element', () => {
    expect(shellSource).toContain('ref="sidebarNavRef"')
    expect(shellSource).toContain('sidebar-nav')
  })

  it('declares sidebarNavRef in script setup', () => {
    expect(shellSource).toContain("const sidebarNavRef = ref<HTMLElement | null>(null)")
  })

  it('saves scroll position on beforeUnmount', () => {
    expect(shellSource).toContain('onBeforeUnmount')
    expect(shellSource).toContain('appStore.sidebarScrollTop')
    expect(shellSource).toContain('sidebarNavRef.value.scrollTop')
  })

  it('restores scroll position on mount', () => {
    expect(shellSource).toContain('onMounted')
    expect(shellSource).toContain('appStore.sidebarScrollTop')
    expect(shellSource).toContain('nextTick')
  })
})

describe('SidebarShell collapsible groups', () => {
  it('lets the user collapse a group even while a child route is active', () => {
    // The expand state must come from the user's override first, falling back
    // to the active-route heuristic only when the user has not clicked yet.
    expect(shellSource).toContain('const groupExpandOverrides = ref<Map<string, boolean>>(new Map())')
    expect(shellSource).not.toContain('expandedGroups.value.has(item.path) || isGroupActive(item)')
  })
})

describe('用户与管理员 Shell 导航边界', () => {
  it('管理员导航始终提供进入用户控制台的显式入口', () => {
    expect(adminSidebarSource).toContain("path: '/console'")
    expect(adminSidebarSource).toContain("t('nav.userConsole')")
    expect(adminSidebarSource).toContain('home-path="/admin/dashboard"')
  })

  it('用户控制台使用自己的根路径，公共 SidebarShell 不按角色切换首页', () => {
    expect(userSidebarSource).toContain('home-path="/console"')
    expect(shellSource).not.toContain('useAuthStore')
    expect(shellSource).not.toContain('authStore.isAdmin')
  })
})

describe('SidebarShell header styles', () => {
  it('does not clip the version badge dropdown', () => {
    const sidebarHeaderBlockMatch = styleSource.match(/\.sidebar-header\s*\{[\s\S]*?\n {2}\}/)
    const sidebarBrandBlockMatch = shellSource.match(/\.sidebar-brand\s*\{[\s\S]*?\n\}/)

    expect(sidebarHeaderBlockMatch).not.toBeNull()
    expect(sidebarBrandBlockMatch).not.toBeNull()
    expect(sidebarHeaderBlockMatch?.[0]).not.toContain('@apply overflow-hidden;')
    expect(sidebarBrandBlockMatch?.[0]).not.toContain('overflow: hidden;')
  })
})

describe('sidebar subscription feature flag', () => {
  it('gates the My Subscriptions entry behind the subscription public-settings flag', () => {
    expect(userNavSource).toContain('const flagSubscription = makeSidebarFlag(FeatureFlags.subscription)')
    expect(userNavSource).toMatch(/path: '\/subscriptions'[^\n]*featureFlag: flagSubscription/)
  })

  it('also hides the admin Subscription Management entry on recharge-only sites', () => {
    expect(adminNavSource).toMatch(/path: '\/admin\/subscriptions'[^\n]*featureFlag: flagSubscription/)
  })

  it('derives the purchase entry label from the site billing mode', () => {
    expect(userNavSource).toContain("import { resolveSiteBillingMode } from '@/utils/siteBillingMode'")
    expect(userNavSource).toMatch(/case 'recharge_only':\s*return t\('nav\.recharge'\)/)
    expect(userNavSource).toMatch(/case 'subscription_only':\s*return t\('nav\.subscribe'\)/)
    expect(userNavSource).toMatch(/path: '\/purchase'[^\n]*label: purchaseNavLabel\.value/)
  })
})
