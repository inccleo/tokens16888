<template>
  <div class="relative min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950" data-layout="admin">
    <!-- Background Decoration：与登录页统一的青绿光斑 + 网格 -->
    <div class="pointer-events-none fixed inset-0 overflow-hidden">
      <div class="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary-400/15 blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl"></div>
      <div class="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.025)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
    </div>

    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content Area -->
    <div
      class="relative min-h-screen transition-all duration-300"
      :class="[sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64']"
    >
      <!-- Header -->
      <AppHeader />

      <!-- Main Content -->
      <main class="p-4 md:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * AdminLayout —— 管理员控制台外壳。
 *
 * 阶段 1 基础 Shell：结构等价于原 AppLayout，但角色固定为管理员
 * （onboarding storageKey = 'admin_guide'）。导航仍复用 AppSidebar
 * （其内部按 isAdmin 呈现管理员导航），组件级导航拆分放在后续提交。
 */
import '@/styles/onboarding.css'
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/stores'
import { useOnboardingTour } from '@/composables/useOnboardingTour'
import { useOnboardingStore } from '@/stores/onboarding'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'

const appStore = useAppStore()
const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)

const { replayTour } = useOnboardingTour({
  storageKey: 'admin_guide',
  autoStart: true
})

const onboardingStore = useOnboardingStore()

onMounted(() => {
  onboardingStore.setReplayCallback(replayTour)
})

defineExpose({ replayTour })
</script>
