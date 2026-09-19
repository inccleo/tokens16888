<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <!-- Balance -->
    <div v-if="!isSimple" class="card flex flex-col p-5">
      <div class="flex items-start justify-between">
        <div class="min-w-0">
          <p class="text-xs font-medium text-gray-500 dark:text-dark-400">{{ t('dashboard.balance') }}</p>
          <p class="mt-1 font-mono text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            ${{ formatBalance(balance) }}
          </p>
          <p class="mt-0.5 text-xs text-gray-500 dark:text-dark-400">
            {{ t('common.available') }}
            <span v-if="frozenBalance > 0" class="ml-2">
              · {{ t('dashboard.frozen') }} <span class="font-mono tabular-nums">${{ formatBalance(frozenBalance) }}</span>
            </span>
          </p>
        </div>
        <div class="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
          <Icon name="dollar" size="md" class="text-emerald-600 dark:text-emerald-400" :stroke-width="2" />
        </div>
      </div>

      <!-- 余额预警 -->
      <p v-if="noBalance" class="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
        {{ t('dashboard.noBalanceDesc') }}
      </p>
      <p v-else-if="lowBalance" class="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
        {{ t('dashboard.lowBalanceWarning') }}
      </p>

      <button
        type="button"
        class="btn btn-secondary mt-4 w-full"
        @click="router.push('/purchase')"
      >
        <Icon name="creditCard" size="sm" class="mr-1.5" />
        {{ t('nav.recharge') }}
      </button>
    </div>

    <!-- API Keys -->
    <div class="card flex flex-col p-5">
      <div class="flex items-start justify-between">
        <div class="min-w-0">
          <p class="text-xs font-medium text-gray-500 dark:text-dark-400">{{ t('dashboard.apiKeys') }}</p>
          <p class="mt-1 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
            {{ stats?.total_api_keys || 0 }}
          </p>
          <p class="mt-0.5 text-xs text-gray-500 dark:text-dark-400">
            {{ stats?.active_api_keys || 0 }} {{ t('common.active') }}
          </p>
        </div>
        <div class="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
          <Icon name="key" size="md" class="text-blue-600 dark:text-blue-400" :stroke-width="2" />
        </div>
      </div>
      <button
        type="button"
        class="btn btn-secondary mt-auto w-full"
        :class="{ 'mt-4': true }"
        @click="router.push('/keys')"
      >
        <Icon name="plus" size="sm" class="mr-1.5" />
        {{ t('dashboard.createKey') }}
      </button>
    </div>

    <!-- Today -->
    <div class="card flex flex-col p-5 sm:col-span-2 lg:col-span-1">
      <div class="flex items-start justify-between">
        <div class="min-w-0">
          <p class="text-xs font-medium text-gray-500 dark:text-dark-400">{{ t('dashboard.todayRequests') }}</p>
          <p class="mt-1 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
            {{ formatNumber(stats?.today_requests || 0) }}
          </p>
          <p class="mt-0.5 text-xs text-gray-500 dark:text-dark-400">
            {{ t('dashboard.todayCost') }}:
            <span class="font-mono tabular-nums text-purple-600 dark:text-purple-400">${{ formatCost(stats?.today_actual_cost || 0) }}</span>
          </p>
        </div>
        <div class="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
          <Icon name="chart" size="md" class="text-green-600 dark:text-green-400" :stroke-width="2" />
        </div>
      </div>
      <RouterLink
        to="/usage"
        class="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
      >
        {{ t('dashboard.viewUsage') }}
        <Icon name="arrowRight" size="sm" />
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * UserDashboardOverview —— 用户总览第一屏核心卡：余额 / API Key / 今日。
 * 承载 CTA 层级：充值、创建 Key 为次要 CTA；主 CTA（快速开始）在 QuickStart 区。
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import type { UserDashboardStats as UserStatsType } from '@/api/usage'

const props = defineProps<{
  stats: UserStatsType | null
  balance: number
  frozenBalance?: number
  isSimple: boolean
  /** 余额预警阈值（来自 user.balance_notify_threshold），为空则不做低余额提示。 */
  notifyThreshold?: number | null
}>()

const { t } = useI18n()
const router = useRouter()

const frozenBalance = computed(() => props.frozenBalance ?? 0)
const noBalance = computed(() => !props.isSimple && props.balance <= 0)
const lowBalance = computed(
  () =>
    !props.isSimple &&
    props.balance > 0 &&
    props.notifyThreshold != null &&
    props.balance < props.notifyThreshold
)

const formatBalance = (b: number) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(b)
const formatNumber = (n: number) => n.toLocaleString()
const formatCost = (c: number) => c.toFixed(4)
</script>
