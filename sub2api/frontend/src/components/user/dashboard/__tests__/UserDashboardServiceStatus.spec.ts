import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import UserDashboardServiceStatus from '../UserDashboardServiceStatus.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

const fetchMock = vi.fn()

function healthResponse(status: string, ok = true) {
  return { ok, status: ok ? 200 : 503, json: async () => ({ status }) } as Response
}

function mountStatus() {
  return mount(UserDashboardServiceStatus, {
    global: { stubs: { Icon: true, RouterLink: true } },
  })
}

describe('UserDashboardServiceStatus', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('only shows operational when the platform health endpoint returns status=ok', async () => {
    fetchMock.mockResolvedValue(healthResponse('ok'))
    const wrapper = mountStatus()
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/health$/), expect.objectContaining({ cache: 'no-store' }))
    expect(wrapper.text()).toContain('dashboard.serviceOperational')
    expect(wrapper.text()).toContain('dashboard.serviceStatusHint')
  })

  it('shows unavailable for non-2xx or non-ok health responses', async () => {
    fetchMock.mockResolvedValueOnce(healthResponse('ok', false))
    const wrapper = mountStatus()
    await flushPromises()

    expect(wrapper.text()).toContain('dashboard.serviceUnavailable')
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('can retry after a network error', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('network unavailable'))
      .mockResolvedValueOnce(healthResponse('ok'))
    const wrapper = mountStatus()
    await flushPromises()
    expect(wrapper.text()).toContain('dashboard.serviceUnavailable')

    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('dashboard.serviceOperational')
  })
})
