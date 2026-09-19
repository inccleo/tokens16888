import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// t() 回显 key，便于断言
vi.mock('vue-i18n', async () => {
  const actual = await vi.importActual<typeof import('vue-i18n')>('vue-i18n')
  return {
    ...actual,
    useI18n: () => ({ t: (key: string) => key }),
  }
})

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

import UserDashboardOverview from '../UserDashboardOverview.vue'
import type { UserDashboardStats as UserStatsType } from '@/api/usage'

function makeStats(over: Partial<UserStatsType> = {}): UserStatsType {
  return {
    total_api_keys: 2,
    active_api_keys: 1,
    total_requests: 0,
    total_input_tokens: 0,
    total_output_tokens: 0,
    total_cache_creation_tokens: 0,
    total_cache_read_tokens: 0,
    total_tokens: 0,
    total_cost: 0,
    total_actual_cost: 0,
    today_requests: 5,
    today_input_tokens: 0,
    today_output_tokens: 0,
    today_cache_creation_tokens: 0,
    today_cache_read_tokens: 0,
    today_tokens: 0,
    today_cost: 0,
    today_actual_cost: 0,
    average_duration_ms: 0,
    rpm: 0,
    tpm: 0,
    by_platform: [],
    ...over,
  }
}

function mountOverview(props: Partial<InstanceType<typeof UserDashboardOverview>['$props']> = {}) {
  return mount(UserDashboardOverview, {
    props: {
      stats: makeStats(),
      balance: 100,
      isSimple: false,
      ...props,
    } as never,
    global: { stubs: { Icon: true, RouterLink: true } },
  })
}

describe('UserDashboardOverview', () => {
  it('余额为 0 时显示无余额说明', () => {
    const w = mountOverview({ balance: 0 })
    expect(w.text()).toContain('dashboard.noBalanceDesc')
    expect(w.text()).not.toContain('dashboard.lowBalanceWarning')
  })

  it('余额低于阈值时显示低余额预警', () => {
    const w = mountOverview({ balance: 5, notifyThreshold: 10 })
    expect(w.text()).toContain('dashboard.lowBalanceWarning')
  })

  it('余额充足时不显示任何预警', () => {
    const w = mountOverview({ balance: 100, notifyThreshold: 10 })
    expect(w.text()).not.toContain('dashboard.lowBalanceWarning')
    expect(w.text()).not.toContain('dashboard.noBalanceDesc')
  })

  it('存在冻结余额时展示冻结金额', () => {
    const w = mountOverview({ balance: 100, frozenBalance: 3 })
    expect(w.text()).toContain('dashboard.frozen')
  })

  it('简易模式隐藏余额卡与充值入口', () => {
    const w = mountOverview({ isSimple: true, balance: 0 })
    expect(w.text()).not.toContain('dashboard.balance')
    expect(w.text()).not.toContain('nav.recharge')
    // 但仍显示 Key 与今日卡
    expect(w.text()).toContain('dashboard.apiKeys')
  })
})
