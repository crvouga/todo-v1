<script lang="ts">
import BackButton from "@/components/BackButton.vue";
import { defineComponent } from "vue";

type Data = {
  listId: string;
};

export default defineComponent({
  components: {
    BackButton: BackButton,
  },
  data(): Data {
    // todo validate this
    const listId = String(this.$route.params["listId"]);
    return {
      listId,
    };
  },
});
</script>
<template>
  <nav class="p-4">
    <BackButton :to="{ name: 'todo-list-single', params: { listId } }" />
  </nav>
</template>
