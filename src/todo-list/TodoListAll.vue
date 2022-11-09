<script lang="ts">
import NavBar from "@/components/NavBar.vue";
import Spinner from "@/components/Spinner.vue";
import {
  allListsSorts,
  TodoListGotItem,
  TodoListSort,
  formatListSort,
  listSorter,
} from "./todo-list-shared";
import { formatFromNow, toValues } from "../utils";
import { defineComponent } from "vue";
import TodoListApi from "./todo-list-api";
import { getCurrentUserId } from "../user/user-store";

export type Status<TParams, TError, TData> =
  | { type: "NotAsked" }
  | { type: "Loading"; params: TParams }
  | { type: "Ok"; params: TParams; data: TData }
  | { type: "Err"; params: TParams; error: TError };

export const notAsked: { type: "NotAsked" } = { type: "NotAsked" };

type Data = {
  title: string;
  sort: TodoListSort;
  //
  listById: { [listId: string]: TodoListGotItem };
  //
  statusGet: Status<{}, string, {}>;
  statusPost: Status<{}, string, {}>;
  statusPostSeed: Status<{}, string, {}>;
};

export default defineComponent({
  components: {
    Spinner: Spinner,
    NavBar,
  },
  props: {
    currentUserId: String,
  },
  setup() {
    return {
      formatFromNow,
      allListsSorts,
      formatListSort,
    };
  },
  data(): Data {
    return {
      title: "",
      sort: "NewestFirst",
      listById: {},
      statusGet: notAsked,
      statusPost: notAsked,
      statusPostSeed: notAsked,
    };
  },
  computed: {
    lists() {
      return toValues(this.listById).sort(listSorter({ sort: this.sort }));
    },
  },
  mounted() {
    this.get();
  },
  watch: {
    title() {
      if (this.statusPost.type === "Err") {
        this.statusPost = { type: "NotAsked" };
      }
    },
    sort() {
      this.get();
    },
  },
  methods: {
    inputSort(sortNew: TodoListSort) {
      this.sort = sortNew;
    },
    async get() {
      this.statusGet = { type: "Loading", params: {} };

      const currentUserId = getCurrentUserId();

      if (!currentUserId) {
        this.statusGet = {
          type: "Err",
          params: {},
          error: "Must be logged in",
        };
        return;
      }
      const result = await TodoListApi.getAll({
        sort: this.sort,
        userId: currentUserId,
      });
      if (result.type === "Err") {
        this.statusGet = { type: "Err", params: {}, error: result.error };
        return;
      }
      this.statusGet = { type: "Ok", data: {}, params: {} };
      const byId = result.data.items.reduce<Data["listById"]>(
        (byId, item) => ({
          ...byId,
          [item.id]: item,
        }),
        {}
      );
      this.listById = { ...this.listById, ...byId };
    },
    focusTitleInput() {
      // todo make typescript happy
      // @ts-ignore
      this.$refs.titleInput.focus();
    },

    async postSeed() {
      this.statusPostSeed = { type: "Loading", params: {} };
      const currentUserId = getCurrentUserId();

      if (!currentUserId) {
        this.statusPost = {
          type: "Err",
          error: "Must be logged in",
          params: {},
        };
        return;
      }

      const posted = await TodoListApi.postSeed({ userId: currentUserId });

      if (posted.type === "Err") {
        this.statusPostSeed = { type: "Err", error: posted.error, params: {} };
        return;
      }

      this.statusPostSeed = { type: "Ok", data: {}, params: {} };
      this.get();
    },

    async post({ title }: { title: string }) {
      this.statusPost = { type: "Loading", params: {} };

      const currentUserId = getCurrentUserId();

      if (!currentUserId) {
        this.statusPost = {
          type: "Err",
          error: "Must be logged in",
          params: {},
        };
        return;
      }

      const result = await TodoListApi.post({ userId: currentUserId, title });

      if (result.type === "Err") {
        this.statusPost = { type: "Err", params: {}, error: result.error };
        this.focusTitleInput();
        return;
      }
      this.statusPost = { type: "Ok", params: {}, data: {} };
      this.listById = {
        ...this.listById,
        [result.data.id]: {
          ...result.data,
          activeCount: 0,
          completedCount: 0,
        },
      };
      // this.get();
      this.$router.push({
        name: "todo-list-single",
        params: { listId: result.data.id },
      });
    },
  },
});
</script>

<template>
  <NavBar />
  <!-- 


    Input


   -->
  <div class="w-full input-group px-4 py-1">
    <input
      ref="titleInput"
      v-model="title"
      class="input input-primary flex-1"
      :class="{ 'input-error': statusPost.type === 'Err' }"
      placeholder="Name of list"
      @keyup.enter="post({ title })"
    />
    <button
      class="btn btn-primary"
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
    class="px-4 text-red-500 mt-2 text-left w-full"
    v-if="statusPost.type === 'Err'"
  >
    {{ statusPost.error }}
  </p>

  <!-- 


    Sort Input


   -->

  <div class="w-full px-4">
    <div class="btn-group mt-2">
      <button
        v-for="sortItem in allListsSorts"
        v-bind:key="sortItem"
        :class="{ 'btn-active': sortItem === sort }"
        class="btn btn-sm"
        @click="inputSort(sortItem)"
      >
        {{ formatListSort(sortItem) }}
      </button>
    </div>
  </div>

  <!-- 


    Empty State


   -->

  <div
    v-if="Object.keys(listById).length === 0 && statusGet.type !== 'Loading'"
    class="w-full flex items-center justify-center p-12 flex-col"
  >
    <p
      class="mb-4 opacity-75 text-2xl font-bold flex justify-center flex-col items-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-24 h-24 mb-2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
        />
      </svg>
      You don't have any lists.
    </p>
    <button
      class="btn btn-primary"
      :class="{ loading: statusPostSeed.type === 'Loading' }"
      @click="postSeed"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-6 h-6 mr-2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
        />
      </svg>

      Seed Data
    </button>
    <div
      v-if="statusPostSeed.type === 'Err'"
      class="alert alert-error w-full mt-2"
    >
      {{ statusPostSeed.error }}
    </div>
  </div>

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
            class="badge font-bold"
            :class="{
              'badge-primary': list.activeCount > 0,
              'badge-ghost': list.activeCount === 0,
            }"
            >{{ `${list.activeCount} Active` }}</span
          >
          <span
            class="badge font-bold"
            :class="{
              'badge-secondary': list.completedCount > 0,
              'badge-ghost': list.completedCount === 0,
            }"
            >{{ `${list.completedCount} Completed` }}</span
          >
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
