<template>
  <!-- 外壳由路由级 UserLayout 提供（router meta.layout='user'），页面只渲染内容。 -->
  <div class="space-y-6">
    <!-- Loading -->
    <div v-if="loading && !stats" class="flex items-center justify-center py-20">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Error -->
    <div v-else-if="error && !stats" class="card p-10 text-center">
      <p class="text-sm text-gray-600 dark:text-dark-300">{{ t('dashboard.loadError') }}</p>
      <button type="button" class="btn btn-secondary mt-4" @click="refreshAll">
        <Icon name="refresh" size="sm" class="mr-1.5" />
        {{ t('dashboard.retry') }}
      </button>
    </div>

    <!-- Content -->
    <template v-else-if="stats">
      <!-- ===== 第一屏：高价值信息 ===== -->
      <UserDashboardOverview
        :stats="stats"
        :balance="user?.balance || 0"
        :frozen-balance="user?.frozen_balance || 0"
        :is-simple="authStore.isSimpleMode"
        :notify-threshold="notifyThreshold"
      />

      <!-- 服务状态 + 公告 -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- 公告 -->
        <div class="card p-5 lg:col-span-2">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-900 dark:text-white">{{ t('dashboard.announcementsTitle') }}</h2>
            <RouterLink
              v-if="announcements.length"
              to="/profile"
              class="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              {{ t('dashboard.viewAll') }}
            </RouterLink>
          </div>
          <div v-if="announcements.length === 0" class="py-4 text-sm text-gray-400 dark:text-dark-500">
            {{ t('dashboard.noAnnouncements') }}
          </div>
          <ul v-else class="space-y-2">
            <li
              v-for="a in topAnnouncements"
              :key="a.id"
              class="flex items-center gap-2 text-sm text-gray-700 dark:text-dark-200"
            >
              <span v-if="!a.read_at" class="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500"></span>
              <span v-else class="h-1.5 w-1.5 shrink-0 rounded-full bg-transparent"></span>
              <span class="min-w-0 truncate">{{ a.title }}</span>
            </li>
          </ul>
        </div>

        <UserDashboardServiceStatus />
      </div>

      <!-- 快速开始 + 最近调用 -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UserDashboardQuickStart />
        <UserDashboardRecentUsage :data="recentUsage" :loading="loadingUsage" />
      </div>

      <!-- ===== 第二屏：用量洞察 ===== -->
      <div class="space-y-6 pt-2">
        <h2 class="text-base font-semibold text-gray-900 dark:text-white">{{ t('dashboard.usageInsights') }}</h2>
        <UserDashboardCharts
          v-model:startDate="startDate"
          v-model:endDate="endDate"
          v-model:granularity="granularity"
          :loading="loadingCharts"
          :trend="trendData"
          :models="modelStats"
          @dateRangeChange="loadCharts"
          @granularityChange="loadCharts"
          @refresh="refreshAll"
        />
        <!-- 更多指标 + 平台配额（第一行核心卡由上方总览承载，这里隐藏） -->
        <UserDashboardStats
          hide-core-row
          :stats="stats"
          :balance="user?.balance || 0"
          :is-simple="authStore.isSimpleMode"
          :platform-quotas="platformQuotas"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useAnnouncementStore } from '@/stores'
import { usageAPI, type UserDashboardStats as UserStatsType } from '@/api/usage'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Icon from '@/components/icons/Icon.vue'
import UserDashboardOverview from '@/components/user/dashboard/UserDashboardOverview.vue'
import UserDashboardStats from '@/components/user/dashboard/UserDashboardStats.vue'
import UserDashboardCharts from '@/components/user/dashboard/UserDashboardCharts.vue'
import UserDashboardRecentUsage from '@/components/user/dashboard/UserDashboardRecentUsage.vue'
import UserDashboardQuickStart from '@/components/user/dashboard/UserDashboardQuickStart.vue'
import UserDashboardServiceStatus from '@/components/user/dashboard/UserDashboardServiceStatus.vue'
import type { UsageLog, TrendDataPoint, ModelStat, PlatformQuotaItem } from '@/types'
import { getMyPlatformQuotas } from '@/api/user'
import { formatDateLocalInput } from '@/utils/format'

const { t } = useI18n()
const authStore = useAuthStore()
const announcementStore = useAnnouncementStore()
const user = computed(() => authStore.user)

const notifyThreshold = computed(() =>
  user.value?.balance_notify_enabled ? user.value?.balance_notify_threshold ?? null : null
)
const announcements = computed(() => announcementStore.announcements)
const topAnnouncements = computed(() => announcements.value.slice(0, 4))

const stats = ref<UserStatsType | null>(null)
const loading = ref(false)
const error = ref(false)
const loadingUsage = ref(false)
const loadingCharts = ref(false)
const trendData = ref<TrendDataPoint[]>([])
const modelStats = ref<ModelStat[]>([])
const recentUsage = ref<UsageLog[]>([])
const platformQuotas = ref<PlatformQuotaItem[] | null>(null)

const startDate = ref(formatDateLocalInput(new Date(Date.now() - 6 * 86400000)))
const endDate = ref(formatDateLocalInput(new Date()))
const granularity = ref('day')

const loadStats = async () => {
  loading.value = true
  error.value = false
  try {
    await authStore.refreshUser()
    stats.value = await usageAPI.getDashboardStats()
  } catch (err) {
    console.error('Failed to load dashboard stats:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}
const loadCharts = async () => {
  loadingCharts.value = true
  try {
    const res = await Promise.all([
      usageAPI.getDashboardTrend({ start_date: startDate.value, end_date: endDate.value, granularity: granularity.value as any }),
      usageAPI.getDashboardModels({ start_date: startDate.value, end_date: endDate.value }),
    ])
    trendData.value = res[0].trend || []
    modelStats.value = res[1].models || []
  } catch (err) {
    console.error('Failed to load charts:', err)
  } finally {
    loadingCharts.value = false
  }
}
const loadRecent = async () => {
  loadingUsage.value = true
  try {
    const res = await usageAPI.getByDateRange(startDate.value, endDate.value)
    recentUsage.value = res.items.slice(0, 5)
  } catch (err) {
    console.error('Failed to load recent usage:', err)
  } finally {
    loadingUsage.value = false
  }
}
const loadPlatformQuotas = async () => {
  try {
    const data = await getMyPlatformQuotas()
    platformQuotas.value = data.platform_quotas ?? []
  } catch (err) {
    console.warn('Failed to load platform quotas:', err)
    platformQuotas.value = []
  }
}
const refreshAll = () => {
  loadStats()
  loadCharts()
  loadRecent()
  loadPlatformQuotas()
}

onMounted(() => {
  refreshAll()
  announcementStore.fetchAnnouncements()
})
</script>
