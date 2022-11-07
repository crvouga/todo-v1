<script lang="ts">
import Spinner from "@/components/Spinner.vue";
import type { TodoList } from "@/shared";
import TodoListApi from "@/todo-list/todo-list-api";
import { formatFromNow, toValues } from "@/utils";
import { defineComponent } from "vue";

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
      class="btn btn-primary"
      :class="{ loading: statusPost.type === 'Loading' }"
      @click="post({ title })"
    >
      Create New List
    </button>
  </div>

  <ol class="w-full">
    <li
      v-for="list in lists"
      v-bind:key="list.id"
      class="w-full flex p-4 cursor-pointer active:bg-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 dark:active:bg-gray-700"
    >
      <div>
        <p class="w-full font-black text-4xl">
          {{ list.title }}
        </p>
        <p>
          {{ formatFromNow(list.createdAt) }}
        </p>
      </div>
    </li>
  </ol>

  <div v-if="statusGet.type === 'Loading'" class="py-8">
    <Spinner />
  </div>
</template>
