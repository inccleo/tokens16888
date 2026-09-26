<template>
  <!-- 管理员登录入口：复用 LoginView 表单，明确标识管理控制台并默认进入管理员端。 -->
  <LoginView :admin-entry="true" />
</template>

<script setup lang="ts">
import LoginView from './LoginView.vue'
</script>
