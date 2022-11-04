<script setup lang="ts">
import { useMutation, useQuery } from "@tanstack/vue-query";
import TodoListApi from "@/todo/todo-list-api";
import { ref } from "vue";

const title = ref("");

const postMutation = useMutation({
  mutationFn: TodoListApi.post,
});

const query = useQuery({
  queryFn: () => TodoListApi.get(),
});
</script>

<template>
  <div class="w-full mb-2">
    <input
      v-model="title"
      class="block input input-md input-bordered input-primary w-full"
      placeholder="Name of list"
    />
  </div>

  <button
    class="btn btn-primary w-full"
    :class="{ loading: postMutation.isLoading }"
    @click="postMutation.mutate({ title })"
  >
    Create New List
  </button>

  <div v-if="query.isLoading" class="py-8">
    <Spinner />
  </div>
</template>
