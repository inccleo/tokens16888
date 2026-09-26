<template>
  <SidebarShell :sections="sections" home-path="/console" />
</template>

<script setup lang="ts">
/**
 * UserSidebar —— 用户控制台侧边栏。
 * 阶段 1 导航拆分：只提供用户导航数据，渲染交给 SidebarShell。
 */
import { computed, onMounted } from 'vue'
import SidebarShell from './SidebarShell.vue'
import type { NavSection } from './nav/types'
import { useUserNav } from './nav/useUserNav'

const { userNavItems, refreshBatchImageAccess } = useUserNav()

const sections = computed<NavSection[]>(() => [{ items: userNavItems.value }])

onMounted(() => {
  void refreshBatchImageAccess()
})
</script>
