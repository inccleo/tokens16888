<template>
  <SidebarShell :sections="sections" />
</template>

<script setup lang="ts">
/**
 * AdminSidebar —— 管理员控制台侧边栏。
 * 阶段 1 导航拆分：提供「管理菜单」+「我的账户」两个分组，渲染交给 SidebarShell。
 * 简易模式下隐藏「我的账户」分组（与原 AppSidebar 行为一致）。
 */
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores'
import SidebarShell from './SidebarShell.vue'
import type { NavSection } from './nav/types'
import { useAdminNav } from './nav/useAdminNav'
import { useUserNav } from './nav/useUserNav'

const { t } = useI18n()
const authStore = useAuthStore()
const { adminNavItems, fetchAdminSettings } = useAdminNav()
const { personalNavItems, refreshBatchImageAccess } = useUserNav()

const sections = computed<NavSection[]>(() => {
  const list: NavSection[] = [{ items: adminNavItems.value }]
  if (!authStore.isSimpleMode) {
    list.push({ title: t('nav.myAccount'), items: personalNavItems.value })
  }
  return list
})

onMounted(() => {
  // Fetch admin settings for feature-gated nav items (e.g. Ops, payment).
  fetchAdminSettings()
  void refreshBatchImageAccess()
})
</script>
