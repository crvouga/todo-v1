<script lang="ts">
import Spinner from "@/components/Spinner.vue";
import type { TodoList } from "@/shared";
import TodoListApi from "@/todo-list/todo-list-api";
import { formatFromNow, toValues } from "@/utils";
import { defineComponent } from "vue";
import { routes } from "@/router";

export type Status<TParams, TError, TData> =
  | { type: "NotAsked" }
  | { type: "Loading"; params: TParams }
  | { type: "Success"; params: TParams; data: TData }
  | { type: "Failure"; params: TParams; error: TError };

export const notAsked: { type: "NotAsked" } = { type: "NotAsked" };

type Data = {
  title: string;
  lists: { [listId: string]: TodoList };
  statusGet: Status<{}, string, {}>;
  statusPost: Status<{}, string, {}>;
};

export default defineComponent({
  components: {
    Spinner: Spinner,
  },
  setup() {
    return {
      formatFromNow,
      routes,
    };
  },
  data(): Data {
    return {
      title: "",
      lists: {},
      statusGet: notAsked,
      statusPost: notAsked,
    };
  },
  computed: {
    visibleLists() {
      return toValues(this.lists);
    },
  },
  mounted() {
    this.get();
  },
  methods: {
    async get() {
      this.statusGet = { type: "Loading", params: {} };
      const result = await TodoListApi.get();
      if (result.type === "Err") {
        this.statusGet = { type: "Failure", params: {}, error: result.error };
        return;
      }
      this.statusGet = { type: "Success", data: {}, params: {} };
      const byId = result.data.items.reduce<Data["lists"]>(
        (byId, item) => ({
          ...byId,
          [item.id]: item,
        }),
        {}
      );
      this.lists = { ...this.lists, ...byId };
    },
    async post({ title }: { title: string }) {
      this.statusPost = { type: "Loading", params: {} };
      const result = await TodoListApi.post({ title });
      if (result.type === "Err") {
        this.statusPost = { type: "Failure", params: {}, error: result.error };
        return;
      }
      this.statusPost = { type: "Success", params: {}, data: {} };
      this.lists = {
        ...this.lists,
        [result.data.id]: result.data,
      };
      this.get();
    },
  },
});
</script>

<template>
  <div class="w-full mb-2 flex gap-2">
    <input
      v-model="title"
      class="block input input-md input-bordered input-primary flex-1"
      placeholder="Name of list"
    />
    <button
      class="btn btn-primary w-36"
      :class="{ loading: statusPost.type === 'Loading' }"
      @click="post({ title })"
    >
      Create New
    </button>
  </div>

  <ol class="w-full">
    <router-link
      :to="{ name: 'todo-list-single', params: { listId: list.id } }"
      v-for="list in lists"
      v-bind:key="list.id"
      class="w-full flex flex-row items-center p-4 cursor-pointer active:bg-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 dark:active:bg-gray-700"
    >
      <div class="flex-1">
        <p class="w-full font-black text-4xl">
          {{ list.title }}
        </p>
        <p>
          {{ formatFromNow(list.createdAt) }}
        </p>
      </div>
      <!-- chevron right -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-6 h-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    </router-link>
  </ol>

  <div v-if="statusGet.type === 'Loading'" class="py-8">
    <Spinner />
  </div>
</template>
