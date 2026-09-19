<template>
  <div class="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-dark-950 dark:text-white" data-layout="public">
    <!-- Top Navigation -->
    <header class="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-dark-800 dark:bg-dark-950/80">
      <nav class="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <RouterLink to="/home" class="flex min-w-0 items-center gap-2">
          <img :src="siteLogo || '/logo.svg'" alt="Logo" class="h-8 w-8 shrink-0 rounded-lg object-contain" />
          <span class="min-w-0 truncate text-base font-semibold">{{ siteName }}</span>
        </RouterLink>

        <div class="flex shrink-0 items-center gap-1 sm:gap-2">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:inline-flex dark:text-dark-300 dark:hover:bg-dark-800 dark:hover:text-white"
          >
            {{ link.label }}
          </RouterLink>

          <LocaleSwitcher />

          <template v-if="isAuthenticated">
            <RouterLink
              :to="consolePath"
              class="inline-flex items-center rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              {{ t('nav.dashboard') }}
            </RouterLink>
          </template>
          <template v-else>
            <RouterLink
              to="/login"
              class="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-dark-300 dark:hover:bg-dark-800 dark:hover:text-white"
            >
              {{ t('home.login') }}
            </RouterLink>
            <RouterLink
              to="/register"
              class="inline-flex items-center rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              {{ t('auth.createAccount') }}
            </RouterLink>
          </template>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-200 py-6 text-center text-xs text-gray-400 dark:border-dark-800 dark:text-dark-500">
      &copy; {{ currentYear }} {{ siteName }}. All rights reserved.
    </footer>
  </div>
</template>

<script setup lang="ts">
/**
 * PublicLayout —— 公共站点外壳（顶部导航）。
 *
 * 阶段 1 基础 Shell：供落地页、模型市场公开页、法律页等公共路由使用。
 * 现有页面（如自渲染整页的 HomeView、使用 AuthLayout 的登录页）暂不迁移，
 * 待公共站点重做时按 meta.layout='public' 逐个接入。
 */
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore, useAuthStore } from '@/stores'
import { sanitizeUrl } from '@/utils/url'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'

const { t } = useI18n()
const appStore = useAppStore()
const authStore = useAuthStore()

const siteName = computed(() => appStore.siteName || 'Sub2API')
const siteLogo = computed(() =>
  sanitizeUrl(appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true })
)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const consolePath = computed(() => (authStore.isAdmin ? '/admin/dashboard' : '/dashboard'))
const currentYear = computed(() => new Date().getFullYear())

const navLinks = computed(() => [
  { to: '/home', label: t('nav.home') },
  { to: '/model-plaza', label: t('nav.modelPlaza') }
])

onMounted(() => {
  if (!appStore.publicSettingsLoaded) {
    appStore.fetchPublicSettings().catch(() => {})
  }
})
</script>
