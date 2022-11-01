<template>
  <div class="flex items-center justify-center">
    <input
      class="input input-md input-bordered flex-1"
      placeholder="What is there todo?"
    />
    <button class="btn btn-primary">Save</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

console.log("script");

export default defineComponent({
  beforeCreate() {
    console.log("beforeCreate");
  },
  beforeMount() {
    console.log("beforeMount");
  },
  beforeUnmount() {
    console.log("beforeUnmount");
  },
});
</script>
