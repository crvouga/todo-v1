<script lang="ts">
import BackButton from "../components/BackButton.vue";
import NavBar from "../components/NavBar.vue";
import Spinner from "../components/Spinner.vue";
import {
  applyPatch,
  filterer,
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
} from "../todo-list/todo-list-shared";
import { formatError, formatFromNow, toValues, type Status } from "../utils";
import { defineComponent } from "vue";
import TodoListApi from "./todo-list-api";
import Api from "./todo-list-item-api";

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
    Spinner,
    BackButton,
    NavBar,
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
    sort() {
      this.get({
        listId: this.listId,
        filter: this.filter,
        sort: this.sort,
      });
    },
    text() {
      if (this.statusPost.type === "Err") {
        this.statusPost = { type: "NotAsked" };
      }
    },

    statusSubmit(statusNew: Data["statusPost"], statusOld: Data["statusPost"]) {
      if (statusOld.type !== statusNew.type && statusNew.type === "Err") {
        const textElement = this.$refs.text as HTMLInputElement;
        textElement.focus();
      }
    },
  },

  computed: {
    items(): TodoItem[] {
      return toValues(this.itemById)
        .filter(filterer({ filter: this.filter }))
        .sort(sorter({ sort: this.sort }));
    },

    allItems(): TodoItem[] {
      return toValues(this.itemById);
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
        this.statusGetList = { type: "Err", params, error: got.error };
        return;
      }
      this.statusGetList = { type: "Ok", params, data: got.data };
    },

    async patch(params: TodoItemPatchParams, body: TodoItemPatch) {
      if (this.statusPatch.type === "Loading") {
        return;
      }
      this.statusPatch = { type: "Loading", params };

      const patched = await Api.patch({ params, body });

      if (patched.type === "Err") {
        this.statusPatch = { type: "Err", params, error: patched.error };
        return;
      }
      this.statusPatch = { type: "Ok", params, data: undefined };

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
          type: "Err",
          error: formatError(parsed),
          params,
        };
        return;
      }

      const deleted = await Api.delete_(params);

      if (deleted.type === "Err") {
        this.statusDelete = { type: "Err", params, error: deleted.error };
        return;
      }

      this.statusDelete = { type: "Ok", params, data: undefined };

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
        this.statusGet = { type: "Err", params, error: got.error };
        return;
      }

      this.statusGet = { type: "Ok", data: undefined, params };

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
        this.statusPost = { type: "Err", params: {}, error: posted.error };

        return;
      }

      this.statusPost = { type: "Ok", params: {}, data: undefined };
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
  <NavBar />

  <nav class="px-4 flex w-full items-left">
    <BackButton :to="{ name: 'todo-list-all' }" />
    <div class="flex-1" />
    <RouterLink
      :to="{ name: 'todo-list-single-settings', params: { listId } }"
      class="btn btn-primary btn-sm"
    >
      <!-- cog icon -->
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
          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>

      Settings
    </RouterLink>
  </nav>

  <div class="flex flex-col items-center justify-center w-full h-full pt-4">
    <div class="px-4 pb-4 w-full">
      <div
        class="w-full justify-center flex items-center py-12"
        v-if="statusGetList.type === 'Loading'"
      >
        <Spinner />
      </div>

      <div v-if="statusGetList.type === 'Err'" class="alert alert-error w-full">
        {{ statusGetList.error }}
      </div>

      <div class="w-full flex items-center" v-if="statusGetList.type === 'Ok'">
        <p class="text-4xl text-left flex-1 font-black">
          {{ statusGetList.data.title }}
        </p>
        <p class="text-md opacity-75 font-bold">
          {{ formatFromNow(statusGetList.data.createdAt) }}
        </p>
      </div>
    </div>

    <div v-if="statusGetList.type === 'Ok'" class="w-full">
      <!-- 


    Text Input


   -->
      <div class="w-full bg-inherit top-0 px-4">
        <div class="input-group w-full">
          <input
            ref="text"
            v-model="text"
            class="input input-bordered flex-1 input-primary"
            :class="{
              'input-error': statusPost.type === 'Err',
            }"
            placeholder="What todo?"
            @keyup.enter="post({ text, listId })"
          />
          <!-- <p class="pt-1 flex">
          <kbd class="kbd kbd-sm mr-1">⌘</kbd>
          <kbd class="kbd kbd-sm">K</kbd>
        </p> -->

          <button
            @click="post({ text, listId })"
            class="btn btn-primary"
            :class="{ loading: statusPost.type === 'Loading' }"
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

        <p class="py-2 text-sm text-red-500">
          {{ statusPost.type === "Err" ? statusPost.error : "" }}
        </p>

        <div class="flex gap-4 overflow-x-scroll w-full scroll-px-4">
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
      </div>
      <!-- 


    List


   -->

      <div class="flex flex-col items-center justify-center flex-1 w-full">
        <div class="px-4 w-full">
          <div
            v-if="statusGet.type === 'Err'"
            class="alert alert-error shadow-lg w-full"
          >
            {{ statusGet.type === "Err" ? statusGet.error : "" }}
          </div>
        </div>

        <!-- 


          Empty State


         -->

        <div
          v-if="statusGet.type === 'Ok' && items.length === 0"
          class="opacity-75 h-64 text-xl font-bold flex items-center justify-center"
        >
          <div
            v-if="allItems.length === 0"
            class="flex flex-col justify-center items-center"
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
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>

            No todo items
          </div>

          <div
            v-else-if="filter === 'Active'"
            class="flex flex-col justify-center items-center"
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
                d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12"
              />
            </svg>

            Everything is completed
          </div>

          <div
            v-else-if="filter === 'Completed'"
            class="flex flex-col justify-center items-center"
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
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            Nothing is completed
          </div>

          <div v-else class="flex flex-col justify-center items-center">
            There is nothing todo
          </div>
        </div>

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
                  class="opacity-75 text-xs font-bold"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>

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
