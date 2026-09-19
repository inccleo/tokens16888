<template>
  <div class="card p-5">
    <div class="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('dashboard.quickStart') }}</h2>
        <p class="mt-0.5 text-xs text-gray-500 dark:text-dark-400">{{ t('dashboard.quickStartDesc') }}</p>
      </div>
      <!-- 首屏唯一主 CTA -->
      <button type="button" class="btn btn-primary shrink-0" @click="router.push('/keys')">
        <Icon name="plus" size="sm" class="mr-1.5" />
        {{ t('dashboard.createKey') }}
      </button>
    </div>

    <!-- 三步清单 -->
    <ol class="mb-4 space-y-2">
      <li v-for="(step, i) in steps" :key="i" class="flex items-center gap-3 text-sm text-gray-700 dark:text-dark-200">
        <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
          {{ i + 1 }}
        </span>
        {{ step }}
      </li>
    </ol>

    <!-- Base URL -->
    <div class="mb-3">
      <p class="mb-1 text-xs font-medium text-gray-500 dark:text-dark-400">{{ t('dashboard.baseUrl') }}</p>
      <div class="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-dark-700 dark:bg-dark-800/50">
        <code class="min-w-0 flex-1 truncate font-mono text-sm text-gray-800 dark:text-dark-100">{{ baseUrl }}</code>
        <button
          type="button"
          class="shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-dark-700 dark:hover:text-dark-200"
          :title="t('dashboard.copyExample')"
          @click="copyToClipboard(baseUrl)"
        >
          <Icon name="copy" size="sm" />
        </button>
      </div>
    </div>

    <!-- 代码示例 -->
    <div>
      <div class="mb-2 flex items-center gap-1">
        <button
          v-for="lang in langs"
          :key="lang.id"
          type="button"
          class="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
          :class="activeLang === lang.id
            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
            : 'text-gray-500 hover:bg-gray-100 dark:text-dark-400 dark:hover:bg-dark-800'"
          @click="activeLang = lang.id"
        >
          {{ lang.label }}
        </button>
        <button
          type="button"
          class="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-dark-400 dark:hover:bg-dark-800"
          @click="copyToClipboard(snippet)"
        >
          <Icon :name="copied ? 'check' : 'copy'" size="sm" />
          {{ copied ? t('common.copied') : t('dashboard.copyExample') }}
        </button>
      </div>
      <pre class="overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs leading-relaxed text-gray-100 dark:bg-black/40"><code>{{ snippet }}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * UserDashboardQuickStart —— 快速开始：Base URL + cURL/Python 调用示例（占位符密钥）+ 三步清单。
 * 承载首屏唯一主 CTA「创建 API Key」。
 */
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import { useAppStore } from '@/stores'
import { useClipboard } from '@/composables/useClipboard'

const { t } = useI18n()
const router = useRouter()
const appStore = useAppStore()
const { copied, copyToClipboard } = useClipboard()

const baseUrl = computed(() => {
  const raw = appStore.cachedPublicSettings?.api_base_url || appStore.apiBaseUrl || ''
  if (raw) return raw.replace(/\/+$/, '')
  return typeof window !== 'undefined' ? window.location.origin : ''
})

const steps = computed(() => [
  t('dashboard.stepCreateKey'),
  t('dashboard.stepCopyExample'),
  t('dashboard.stepSendRequest'),
])

const langs = [
  { id: 'curl' as const, label: 'cURL' },
  { id: 'python' as const, label: 'Python' },
]
const activeLang = ref<'curl' | 'python'>('curl')

const snippet = computed(() => {
  const base = baseUrl.value || 'https://your-domain.com'
  if (activeLang.value === 'python') {
    return `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="${base}/v1",
)

resp = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello"}],
)
print(resp.choices[0].message.content)`
  }
  return `curl ${base}/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}]
  }'`
})
</script>
