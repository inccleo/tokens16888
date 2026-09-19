<template>
  <!-- 向后兼容包装：仍用旧 AppLayout 的页面（阶段 1 迁移期）通过此组件按角色选择侧边栏。
       新的路由级 UserLayout / AdminLayout 直接使用 UserSidebar / AdminSidebar。 -->
  <AdminSidebar v-if="isAdmin" />
  <UserSidebar v-else-if="!appStore.backendModeEnabled" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore, useAuthStore } from '@/stores'
import AdminSidebar from './AdminSidebar.vue'
import UserSidebar from './UserSidebar.vue'

const appStore = useAppStore()
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)
</script>
