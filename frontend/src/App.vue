<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <div
    class="flex flex-col items-center justify-center max-w-md w-full h-full mx-auto"
  >
    <RouterLink to="/"> Home </RouterLink>
    <RouterLink to="/todo-list">Todo List </RouterLink>
    <RouterView />
  </div>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>
