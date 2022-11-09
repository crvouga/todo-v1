<script setup lang="ts">
import { RouterView } from "vue-router";
import { store } from "@/store-toast";
</script>

<template>
  <Transition name="slide">
    <div v-if="store.toast.type !== 'None'" class="toast z-40">
      <div
        class="alert"
        :class="{
          'alert-error': store.toast.type === 'Error',
          'alert-info': store.toast.type === 'Info',
          'alert-success': store.toast.type === 'Success',
        }"
      >
        <div>
          <span class="text-xl font-bold">{{ store.toast.title }}</span>
        </div>
      </div>
    </div>
  </Transition>

  <div
    class="flex flex-col items-center justify-center max-w-md w-full h-full mx-auto"
  >
    <RouterView />
  </div>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

/* toast animation */
/*
  Enter and leave animations can use different
  durations and timing functions.
*/
.slide-enter-active {
  transition: all 0.3s ease-out;
}

.slide-leave-active {
  transition: all 0.8s cubic-bezier(0.075, 0.82, 0.165, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(100%);
}
</style>
