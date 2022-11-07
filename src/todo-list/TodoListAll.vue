<script lang="ts">
import Spinner from "@/components/Spinner.vue";
import type { TodoListGotItem } from "@/todo-list/todo-list-shared";
import { formatFromNow, toValues } from "@/utils";
import { defineComponent } from "vue";
import TodoListApi from "./todo-list-api";

export type Status<TParams, TError, TData> =
  | { type: "NotAsked" }
  | { type: "Loading"; params: TParams }
  | { type: "Ok"; params: TParams; data: TData }
  | { type: "Err"; params: TParams; error: TError };

export const notAsked: { type: "NotAsked" } = { type: "NotAsked" };

type Data = {
  title: string;
  lists: { [listId: string]: TodoListGotItem };
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
      const result = await TodoListApi.getAll();
      if (result.type === "Err") {
        this.statusGet = { type: "Err", params: {}, error: result.error };
        return;
      }
      this.statusGet = { type: "Ok", data: {}, params: {} };
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
        this.statusPost = { type: "Err", params: {}, error: result.error };
        return;
      }
      this.statusPost = { type: "Ok", params: {}, data: {} };
      this.lists = {
        ...this.lists,
        [result.data.id]: {
          ...result.data,
          activeCount: 0,
          completedCount: 0,
        },
      };
      this.get();
    },
  },
});
</script>

<template>
  <!-- 


    Input


   -->
  <div class="w-full flex gap-2 px-4 pt-4">
    <input
      v-model="title"
      class="block input input-md input-bordered input-primary flex-1"
      :class="{ 'input-error': statusPost.type === 'Err' }"
      placeholder="Name of list"
    />
    <button
      class="btn btn-primary w-32"
      :class="{ loading: statusPost.type === 'Loading' }"
      @click="post({ title })"
    >
      <!-- plus icon -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-6 h-6 mr-1"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>

      Add
    </button>
  </div>

  <p
    class="px-4 pb-4 text-red-500 mt-2 text-left w-full"
    v-if="statusPost.type === 'Err'"
  >
    {{ statusPost.error }}
  </p>

  <!-- 


  List


 -->

  <ol class="w-full">
    <router-link
      :to="{ name: 'todo-list-single', params: { listId: list.id } }"
      v-for="list in lists"
      v-bind:key="list.id"
      class="w-full flex flex-row items-center px-6 p-4 cursor-pointer active:bg-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 dark:active:bg-gray-700"
    >
      <div class="flex-1">
        <p class="w-full font-bold text-3xl mb-1">
          {{ list.title }}
        </p>
        <div class="flex items-center gap-2 flex-wrap">
          <span
            class="badge badge-outline"
            :class="{
              'badge-primary': list.activeCount > 0,
              'badge-ghost': list.activeCount === 0,
            }"
            >{{ `${list.activeCount} Active` }}</span
          >
          <span class="badge badge-secondary badge-outline">{{
            `${list.completedCount} Completed`
          }}</span>
          <p class="opacity-75 text-xs font-bold">
            {{ formatFromNow(list.createdAt) }}
          </p>
        </div>
      </div>
      <!-- chevron right -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="ml-2 w-6 h-6"
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
