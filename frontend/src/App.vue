<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <RouterLink to="/"> Home </RouterLink>
  <RouterLink to="/todo-list">Todo List </RouterLink>
  <div class="flex items-center justify-center max-w-md w-full h-full mx-auto">
    <RouterView />
  </div>
</template>
