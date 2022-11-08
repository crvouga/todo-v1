<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { RouterLinkProps } from "vue-router";

export default defineComponent({
  props: {
    to: {
      required: true,
      type: Object as PropType<RouterLinkProps["to"]>,
    },
  },
});
</script>
<template>
  <RouterLink :to="to" class="btn btn-sm btn-primary">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="w-4 h-4 mr-1"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M15.75 19.5L8.25 12l7.5-7.5"
      />
    </svg>

    Back
  </RouterLink>
</template>
