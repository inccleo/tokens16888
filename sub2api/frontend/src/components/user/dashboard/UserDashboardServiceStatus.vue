<template>
  <section class="card flex flex-col justify-between p-5" aria-live="polite" aria-atomic="true">
    <div>
      <h2 class="text-sm font-semibold text-gray-900 dark:text-white">{{ t('dashboard.serviceStatus') }}</h2>
      <div class="mt-3 flex items-center gap-2" role="status" data-testid="service-health-state">
        <span class="h-2.5 w-2.5 shrink-0 rounded-full" :class="statusDotClass"></span>
        <span class="text-sm text-gray-700 dark:text-dark-200">{{ statusLabel }}</span>
      </div>
      <p class="mt-3 text-xs leading-5 text-gray-500 dark:text-dark-400">{{ t('dashboard.serviceStatusHint') }}</p>
    </div>
    <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
      <button
        v-if="state === 'unavailable'"
        type="button"
        class="text-sm font-medium text-primary-700 hover:text-primary-800 disabled:opacity-60 dark:text-primary-300"
        :disabled="checking"
        @click="checkHealth"
      >
        {{ t('dashboard.retryServiceCheck') }}
      </button>
      <span v-else></span>
      <RouterLink to="/monitor" class="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800 dark:text-primary-300">
        {{ t('dashboard.viewServiceStatus') }}
        <Icon name="arrowRight" size="sm" />
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { buildGatewayUrl } from '@/api/url'
import Icon from '@/components/icons/Icon.vue'

type HealthState = 'checking' | 'operational' | 'unavailable'

const { t } = useI18n()
const state = ref<HealthState>('checking')
const checking = ref(false)
let activeController: AbortController | null = null

const statusLabel = computed(() => {
  if (state.value === 'operational') return t('dashboard.serviceOperational')
  if (state.value === 'unavailable') return t('dashboard.serviceUnavailable')
  return t('dashboard.serviceChecking')
})

const statusDotClass = computed(() => {
  if (state.value === 'operational') return 'bg-emerald-500'
  if (state.value === 'unavailable') return 'bg-rose-500'
  return 'animate-pulse bg-gray-400'
})

async function checkHealth() {
  activeController?.abort()
  const controller = new AbortController()
  activeController = controller
  checking.value = true
  state.value = 'checking'

  try {
    const response = await fetch(buildGatewayUrl('/health'), {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`Health check returned ${response.status}`)
    const payload = await response.json() as { status?: string }
    state.value = payload.status === 'ok' ? 'operational' : 'unavailable'
  } catch {
    if (!controller.signal.aborted) state.value = 'unavailable'
  } finally {
    if (activeController === controller) {
      activeController = null
      checking.value = false
    }
  }
}

onMounted(() => void checkHealth())
onBeforeUnmount(() => activeController?.abort())
</script>
