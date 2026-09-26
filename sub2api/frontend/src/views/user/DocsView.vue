<template>
  <div class="mx-auto max-w-6xl space-y-8" data-testid="docs-hub">
    <header class="max-w-3xl">
      <p class="text-sm font-medium text-primary-700 dark:text-primary-300">{{ t('nav.docs') }}</p>
      <h1 class="mt-2 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-3xl">
        {{ t('docsHub.title') }}
      </h1>
      <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-dark-300">{{ t('docsHub.subtitle') }}</p>
    </header>

    <section aria-labelledby="quick-start-title">
      <h2 id="quick-start-title" class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('docsHub.quickStart') }}
      </h2>
      <div class="grid gap-4 md:grid-cols-3">
        <article class="card p-5">
          <p class="font-mono text-xs text-primary-700 dark:text-primary-300">01</p>
          <h3 class="mt-3 font-semibold text-gray-900 dark:text-white">{{ t('docsHub.stepOneTitle') }}</h3>
          <p class="mt-2 min-h-12 text-sm leading-5 text-gray-600 dark:text-dark-300">{{ t('docsHub.stepOneDescription') }}</p>
          <RouterLink to="/console/keys" class="mt-4 inline-flex text-sm font-medium text-primary-700 hover:text-primary-800 dark:text-primary-300">
            {{ t('nav.apiKeys') }} <span aria-hidden="true" class="ml-1">→</span>
          </RouterLink>
        </article>
        <article class="card p-5">
          <p class="font-mono text-xs text-primary-700 dark:text-primary-300">02</p>
          <h3 class="mt-3 font-semibold text-gray-900 dark:text-white">{{ t('docsHub.stepTwoTitle') }}</h3>
          <p class="mt-2 min-h-12 text-sm leading-5 text-gray-600 dark:text-dark-300">{{ t('docsHub.stepTwoDescription') }}</p>
          <RouterLink to="/console/models" class="mt-4 inline-flex text-sm font-medium text-primary-700 hover:text-primary-800 dark:text-primary-300">
            {{ t('nav.modelPlaza') }} <span aria-hidden="true" class="ml-1">→</span>
          </RouterLink>
        </article>
        <article class="card p-5">
          <p class="font-mono text-xs text-primary-700 dark:text-primary-300">03</p>
          <h3 class="mt-3 font-semibold text-gray-900 dark:text-white">{{ t('docsHub.stepThreeTitle') }}</h3>
          <p class="mt-2 min-h-12 text-sm leading-5 text-gray-600 dark:text-dark-300">{{ t('docsHub.stepThreeDescription') }}</p>
          <RouterLink to="/console/usage" class="mt-4 inline-flex text-sm font-medium text-primary-700 hover:text-primary-800 dark:text-primary-300">
            {{ t('nav.usage') }} <span aria-hidden="true" class="ml-1">→</span>
          </RouterLink>
        </article>
      </div>
    </section>

    <section class="card overflow-hidden" aria-labelledby="request-example-title">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-dark-700">
        <div>
          <h2 id="request-example-title" class="font-semibold text-gray-900 dark:text-white">{{ t('docsHub.openAIExample') }}</h2>
          <p class="mt-1 text-xs text-gray-500 dark:text-dark-400">
            {{ t('docsHub.endpoint') }}: <code class="font-mono">{{ apiBaseUrl }}</code>
          </p>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" @click="copyExample">
          <Icon name="clipboard" size="sm" class="mr-1.5" />
          {{ t('docsHub.copyExample') }}
        </button>
      </div>
      <pre class="overflow-x-auto bg-gray-950 px-5 py-4 text-xs leading-6 text-gray-100 dark:bg-black/40 sm:text-sm"><code>{{ requestExample }}</code></pre>
      <p class="px-5 py-3 text-xs leading-5 text-gray-500 dark:text-dark-400">
        {{ t('docsHub.stepThreeDescription') }}
      </p>
    </section>

    <section class="flex flex-col gap-3 border-t border-gray-200 pt-5 dark:border-dark-700 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="font-semibold text-gray-900 dark:text-white">{{ t('docsHub.relatedGuides') }}</h2>
        <p class="mt-1 text-sm text-gray-600 dark:text-dark-300">
          {{ t('docsHub.stepOneDescription') }}
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <RouterLink to="/batch-image" class="btn btn-secondary btn-sm">{{ t('docsHub.batchImageGuide') }}</RouterLink>
        <a v-if="configuredDocsUrl" :href="configuredDocsUrl" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
          {{ t('docsHub.configuredDocs') }}
          <Icon name="externalLink" size="xs" class="ml-1.5" />
        </a>
        <span v-else class="self-center text-xs text-gray-500 dark:text-dark-400">{{ t('docsHub.docsNotConfigured') }}</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import { useClipboard } from '@/composables/useClipboard'
import { useAppStore } from '@/stores/app'
import { sanitizeUrl } from '@/utils/url'

const { t } = useI18n()
const appStore = useAppStore()
const { copyToClipboard } = useClipboard()

const apiBaseUrl = computed(() => {
  const configured = appStore.apiBaseUrl?.trim()
  const root = (configured || (typeof window !== 'undefined' ? window.location.origin : ''))
    .replace(/\/v1\/?$/, '')
    .replace(/\/+$/, '')
  return `${root}/v1`
})

const requestExample = computed(() => `curl --request POST '${apiBaseUrl.value}/chat/completions' \\
  --header 'Authorization: Bearer ${t('docsHub.apiKeyPlaceholder')}' \\
  --header 'Content-Type: application/json' \\
  --data '{
    "model": "${t('docsHub.modelPlaceholder')}",
    "messages": [{ "role": "user", "content": "Hello" }]
  }'`)

const configuredDocsUrl = computed(() => sanitizeUrl(appStore.docUrl))

function copyExample() {
  void copyToClipboard(requestExample.value, t('docsHub.copied'))
}
</script>
