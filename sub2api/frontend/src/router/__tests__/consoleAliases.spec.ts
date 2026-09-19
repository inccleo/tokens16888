import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

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
    "alias: '/console/models'", // /model-plaza
  ])('包含别名 %s', (alias) => {
    expect(routerSource).toContain(alias)
  })

  it('/batch-image 同时保留旧文档别名与 /console/docs', () => {
    expect(routerSource).toContain("alias: ['/docs/batch-image', '/console/docs']")
  })
})
