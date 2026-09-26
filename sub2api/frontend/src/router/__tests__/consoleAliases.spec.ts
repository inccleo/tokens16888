import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'
import router from '../index'

// 阶段 1-④：为现有用户路由新增 /console/* 别名（旧路径保持不变、双 URL 可用）。
// 用源码断言锁定这些别名，防止后续重构误删导致外链/新前缀失效。
const routerSource = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), '../index.ts'),
  'utf8'
)

describe('console 路由别名', () => {
  it.each([
    "alias: '/console'", // /dashboard
    "alias: '/console/keys'",
    "alias: '/console/usage'",
    "alias: '/console/redeem'",
    "alias: '/console/affiliate'",
    "alias: '/console/profile'",
    "alias: '/console/subscriptions'",
    "alias: '/console/billing'", // /purchase
    "alias: '/console/orders'",
  ])('包含别名 %s', (alias) => {
    expect(routerSource).toContain(alias)
  })

  it('公开模型广场与登录后的控制台目录使用不同路由边界', () => {
    const publicRoute = router.resolve('/model-plaza')
    const consoleRoute = router.resolve('/console/models')

    expect(publicRoute.name).toBe('ModelPlaza')
    expect(publicRoute.meta.requiresAuth).toBe(false)
    expect(publicRoute.meta.layout).toBeUndefined()
    expect(consoleRoute.name).toBe('ConsoleModels')
    expect(consoleRoute.meta.requiresAuth).toBe(true)
    expect(consoleRoute.meta.layout).toBe('user')
  })

  it('/console/docs 是开发者文档页，批量图片指南保留旧链接', () => {
    expect(router.resolve('/console/docs').name).toBe('ConsoleDocs')
    expect(routerSource).toContain("alias: '/docs/batch-image'")
  })
})
