<script lang="ts">
import Spinner from "@/components/Spinner.vue";
import {
  applyPatch,
  filterer,
  formatError,
  formatSort,
  sorter,
  TodoItem,
  TodoItemDeleteParams,
  TodoItemFilter,
  TodoItemGetParams,
  TodoItemPatch,
  TodoItemPatchParams,
  TodoItemSort,
  TodoList,
} from "@/shared";
import Api from "./todo-item-api";

import { formatFromNow, toValues } from "@/utils";
import { defineComponent } from "vue";
import TodoListApi from "./todo-list-api";

export type Status<TParams, TError, TData> =
  | { type: "NotAsked" }
  | { type: "Loading"; params: TParams }
  | { type: "Success"; params: TParams; data: TData }
  | { type: "Failure"; params: TParams; error: TError };

export const notAsked: { type: "NotAsked" } = { type: "NotAsked" };

type Data = {
  listId: string;
  statusGetList: Status<{ listId: string }, string, TodoList>;
  //
  text: string;
  filter: TodoItemFilter;
  sort: TodoItemSort;
  //
  itemById: { [id: string]: TodoItem };
  //
  statusPost: Status<{}, string, undefined>;
  statusGet: Status<TodoItemGetParams, string, undefined>;
  statusDelete: Status<{ itemId: string }, string, undefined>;
  statusPatch: Status<{ itemId: string }, string, undefined>;
  //
  allFilters: TodoItemFilter[];
  allSorts: TodoItemSort[];
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
    // todo validate this
    const listId = String(this.$route.params["listId"]);
    return {
      listId,
      statusGetList: { type: "NotAsked" },
      //
      text: "",
      itemById: {},
      //
      statusPost: { type: "NotAsked" },
      statusGet: { type: "NotAsked" },
      statusDelete: { type: "NotAsked" },
      statusPatch: { type: "NotAsked" },
      //
      filter: "All",
      allFilters: ["All", "Active", "Completed"],
      //
      sort: "NewestFirst",
      allSorts: ["NewestFirst", "OldestFirst"],
    };
  },

  watch: {
    filter() {
      this.get({
        listId: this.listId,
        filter: this.filter,
        sort: this.sort,
      });
    },
    text() {
      if (this.statusPost.type === "Failure") {
        this.statusPost = { type: "NotAsked" };
      }
    },

    statusSubmit(statusNew: Data["statusPost"], statusOld: Data["statusPost"]) {
      if (statusOld.type !== statusNew.type && statusNew.type === "Failure") {
        const textElement = this.$refs.text as HTMLInputElement;
        textElement.focus();
      }
    },
  },

  computed: {
    items(): TodoItem[] {
      return toValues(this.itemById)
        .filter(filterer({ filter: this.filter }))
        .sort(sorter({ sort: this.sort }))
        .filter((item) => item.listId === this.listId);
    },

    allSortsFormatted() {
      return this.allSorts.map((sort) => [sort, formatSort(sort)] as const);
    },
  },

  mounted() {
    // todo this should be one api call
    this.get({
      listId: this.listId,
      filter: this.filter,
      sort: this.sort,
    });
    this.getList({
      listId: this.listId,
    });
  },

  methods: {
    inputFilter(filter: Data["filter"]) {
      this.filter = filter;
    },

    inputSort(sort: Data["sort"]) {
      this.sort = sort;
    },

    async getList(params: { listId: string }) {
      if (this.statusGetList.type === "Loading") {
        return;
      }
      this.statusGetList = { type: "Loading", params };
      const got = await TodoListApi.getOne(params);

      if (got.type === "Err") {
        this.statusGetList = { type: "Failure", params, error: got.error };
        return;
      }
      this.statusGetList = { type: "Success", params, data: got.data };
    },

    async patch(params: TodoItemPatchParams, body: TodoItemPatch) {
      if (this.statusPatch.type === "Loading") {
        return;
      }
      this.statusPatch = { type: "Loading", params };

      const patched = await Api.patch({ params, body });

      if (patched.type === "Err") {
        this.statusPatch = { type: "Failure", params, error: patched.error };
        return;
      }
      this.statusPatch = { type: "Success", params, data: undefined };

      const itemOld = this.itemById[params.itemId];
      const parsed = TodoItemPatch.safeParse(body);
      const itemNew =
        itemOld && parsed.success ? applyPatch(itemOld, parsed.data) : itemOld;

      if (itemNew) {
        this.itemById = {
          ...this.itemById,
          [itemNew.id]: itemNew,
        };
      }
    },

    async delete_(params: TodoItemDeleteParams) {
      if (this.statusDelete.type === "Loading") {
        return;
      }

      this.statusDelete = { type: "Loading", params };

      const parsed = TodoItemDeleteParams.safeParse(params);

      if (!parsed.success) {
        this.statusDelete = {
          type: "Failure",
          error: formatError(parsed),
          params,
        };
        return;
      }

      const deleted = await Api.delete_(params);

      if (deleted.type === "Err") {
        this.statusDelete = { type: "Failure", params, error: deleted.error };
        return;
      }

      this.statusDelete = { type: "Success", params, data: undefined };

      const { [params.itemId]: _, ...removed } = this.itemById;
      this.itemById = removed;

      //
      this.get({
        listId: this.listId,
        filter: this.filter,
        sort: this.sort,
      });
    },

    async get(params: TodoItemGetParams) {
      if (this.statusGet.type === "Loading") {
        return;
      }

      this.statusGet = { type: "Loading", params };

      const got = await Api.get(params);

      if (got.type === "Err") {
        this.statusGet = { type: "Failure", params, error: got.error };
        return;
      }

      this.statusGet = { type: "Success", data: undefined, params };

      const byId = got.data.items.reduce<Data["itemById"]>(
        (byId, item) => ({ ...byId, [item.id]: item }),
        {}
      );
      this.itemById = { ...this.itemById, ...byId };
    },

    async post({ text, listId }: { text: string; listId: string }) {
      if (this.statusPost.type === "Loading") {
        return;
      }

      this.statusPost = { type: "Loading", params: {} };

      const posted = await Api.post({ listId, text });

      if (posted.type === "Err") {
        this.statusPost = { type: "Failure", params: {}, error: posted.error };

        return;
      }

      this.statusPost = { type: "Success", params: {}, data: undefined };
      this.text = "";
      this.itemById = {
        ...this.itemById,
        [posted.data.id]: posted.data,
      };
      this.get({
        listId: this.listId,
        filter: this.filter,
        sort: this.sort,
      });
    },
  },
});
</script>

<template>
  <!-- <div class="toast">
    <div class="alert alert-error w-full w-max-xs">
      <div>
        <span>New message arrived.</span>
      </div>
    </div>
  </div> -->

  <div class="flex flex-col items-center justify-center w-full h-full pt-4">
    <div class="px-4 pb-4">
      <div v-if="statusGetList.type === 'Loading'"><Spinner /></div>

      <div v-if="statusGetList.type === 'Failure'">
        <div class="alert alert-error">
          {{ statusGetList.error }}
        </div>
      </div>

      <div v-if="statusGetList.type === 'Success'">
        <p class="text-4xl font-black">
          {{ statusGetList.data.title }}
        </p>
      </div>
    </div>

    <!-- 


    Text Input


   -->
    <div class="w-full bg-inherit top-0 px-4">
      <div class="flex items-center justify-center gap-2 w-full">
        <input
          ref="text"
          v-model="text"
          class="input input-md input-bordered flex-1 input-primary"
          :class="{
            'input-error': statusPost.type === 'Failure',
          }"
          placeholder="What todo?"
        />
        <!-- <p class="pt-1 flex">
          <kbd class="kbd kbd-sm mr-1">⌘</kbd>
          <kbd class="kbd kbd-sm">K</kbd>
        </p> -->

        <button
          @click="post({ text, listId })"
          class="btn btn-primary w-32"
          :class="{ loading: statusPost.type === 'Loading' }"
        >
          Submit
        </button>
      </div>

      <p class="py-2 text-sm text-red-500">
        {{ statusPost.type === "Failure" ? statusPost.error : "" }}
      </p>

      <!-- 


        Filter Input


       -->

      <div class="btn-group mb-4">
        <button
          v-for="filterItem in allFilters"
          v-bind:key="filterItem"
          :class="{ 'btn-active': filterItem === filter }"
          class="btn btn-sm"
          @click="inputFilter(filterItem)"
        >
          {{ filterItem }}
        </button>
      </div>

      <!-- 


        Sort Input


       -->

      <div class="btn-group">
        <button
          v-for="sortItem in allSortsFormatted"
          v-bind:key="sortItem[0]"
          :class="{ 'btn-active': sortItem[0] === sort }"
          class="btn btn-sm"
          @click="inputSort(sortItem[0])"
        >
          {{ sortItem[1] }}
        </button>
      </div>
    </div>

    <!-- 


    List


   -->

    <div class="flex flex-col items-center justify-center flex-1 w-full pb-16">
      <div class="px-4 w-full">
        <div
          v-if="statusGet.type === 'Failure'"
          class="alert alert-error shadow-lg"
        >
          {{ statusGet.type === "Failure" ? statusGet.error : "" }}
        </div>
      </div>

      <p
        v-if="statusGet.type === 'Success' && items.length === 0"
        class="opacity-75 h-64 text-xl font-bold flex items-center justify-center"
      >
        {{
          items.length === 0
            ? "There is nothing todo"
            : filter === "Active"
            ? "All items are completed"
            : filter === "Completed"
            ? "No items are completed"
            : "There is nothing todo."
        }}
      </p>

      <!-- <TransitionGroup
        name="list"
        tag="ol"
        class="flex flex-col items-center justify-center w-full relative"
      > -->
      <ol class="flex flex-col items-center justify-center w-full relative">
        <li
          v-for="item in items"
          v-bind:key="item.id"
          class="inner w-full flex items-center pr-6"
        >
          <div
            class="flex-1 flex items-center p-4 pl-6"
            :class="{
              'cursor-wait': statusPatch.type === 'Loading',
              'cursor-pointer active:bg-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 dark:active:bg-gray-700':
                statusPatch.type !== 'Loading',
              'opacity-50':
                statusPatch.type === 'Loading' &&
                statusPatch.params.itemId === item.id,
            }"
            @click="
              patch({ itemId: item.id }, { isCompleted: !item.isCompleted })
            "
          >
            <input
              type="checkbox"
              :checked="item.isCompleted"
              class="checkbox checkbox-sm checkbox-primary mr-2"
              @click.prevent=""
            />

            <div class="flex-1">
              <p
                class="text-lg font-semibold"
                :class="{
                  'line-through opacity-50': item.isCompleted,
                }"
              >
                {{ item.text }}
              </p>
              <p
                class="text-xs opacity-75"
                :class="{
                  'line-through opacity-50': item.isCompleted,
                }"
              >
                {{ formatFromNow(item.createdAt) }}
              </p>
            </div>
          </div>
          <button
            class="btn btn-outline btn-error btn-xs"
            :class="{
              'loading cursor-wait':
                statusDelete.type === 'Loading' &&
                statusDelete.params.itemId === item.id,
            }"
            @click="delete_({ itemId: item.id })"
          >
            Delete
          </button>
        </li>
      </ol>
      <!-- </TransitionGroup> -->

      <Spinner class="p-4" v-if="statusGet.type === 'Loading'" />
    </div>

    <!-- 




     -->
  </div>
</template>

<style>
/* 


source: https://github.com/ui-code-tv/vue-friendlist-app/blob/master/src/App.vue
List animation 


*/
.list-enter-active,
.list-leave-active,
.list-move {
  transition: 500ms cubic-bezier(0.64, 0.26, 0.08, 1.03);
  transition-property: opacity, transform;
}
.list-enter {
  opacity: 0;
  transform: translateY(50px) scaleY(0.5);
}
.list-enter-to {
  opacity: 1;
  transform: translateX(0) scaleY(1);
}
.list-leave-active {
  position: absolute;
  opacity: 0;
  transform: scaleY(0);
}
.list-enter-active {
  animation: scale-in 0.5s;
}
.list-leave-active {
  animation: scale-in 0.5s reverse;
}
@keyframes scale-in {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
.list-enter-active > .inner {
  transition-delay: 0.25s;
}
</style>
