import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import DocsView from '../DocsView.vue'

const { appStore, copyMock } = vi.hoisted(() => ({
  appStore: {
    apiBaseUrl: 'https://api.example.test',
    docUrl: 'https://docs.example.test/guide',
  },
  copyMock: vi.fn(),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => ({
      'docsHub.apiKeyPlaceholder': 'YOUR_API_KEY',
      'docsHub.modelPlaceholder': 'MODEL_ID',
    }[key] ?? key),
  }),
}))

vi.mock('@/stores/app', () => ({
  useAppStore: () => appStore,
}))

vi.mock('@/composables/useClipboard', () => ({
  useClipboard: () => ({ copyToClipboard: copyMock }),
}))

describe('DocsView', () => {
  beforeEach(() => copyMock.mockReset())

  it('renders the quick-start journey, safe placeholders, and configured docs link', async () => {
    const wrapper = mount(DocsView, {
      global: { stubs: { Icon: true, RouterLink: { template: '<a><slot /></a>' } } },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('docsHub.quickStart')
    expect(wrapper.text()).toContain('https://api.example.test/v1/chat/completions')
    expect(wrapper.text()).toContain('YOUR_API_KEY')
    expect(wrapper.text()).toContain('MODEL_ID')
    expect(wrapper.find('a[href="https://docs.example.test/guide"]').attributes('rel')).toBe('noopener noreferrer')
    expect(wrapper.html()).not.toContain('sk-')
  })

  it('copies the complete OpenAI-compatible request example', async () => {
    const wrapper = mount(DocsView, {
      global: { stubs: { Icon: true, RouterLink: true } },
    })
    await wrapper.find('button').trigger('click')

    expect(copyMock).toHaveBeenCalledWith(
      expect.stringContaining("'https://api.example.test/v1/chat/completions'"),
      'docsHub.copied',
    )
    expect(copyMock.mock.calls[0][0]).toContain('YOUR_API_KEY')
  })
})
