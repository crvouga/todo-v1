<script lang="ts">
import Api from "@/api";
import Spinner from "@/components/Spinner.vue";
import {
  filterer,
  formatError,
  formatSort,
  sorter,
  TodoItem,
  TodoItemDeleteParams,
  TodoItemFilter,
  TodoItemGetParams,
  TodoItemGot,
  TodoItemPatch,
  TodoItemPatchParams,
  TodoItemSort,
} from "@/shared";
import { formatFromNow } from "@/utils";
import type { RemoteData } from "@/utils";
import { v4 } from "uuid";
import { defineComponent } from "vue";

type Data = {
  text: string;
  statusSubmit: RemoteData<string, undefined>;
  statusLoad: RemoteData<string, undefined>;
  statusDeleteItem: RemoteData<string, undefined> & { itemId: string };
  statusToggleItem: RemoteData<string, undefined> & { itemId: string };
  allItems: TodoItem[];
  filter: TodoItemFilter;
  allFilters: TodoItemFilter[];
  sort: TodoItemSort;
  allSorts: TodoItemSort[];
};

type TodoItemFormatted = TodoItem & {
  createdAtFormatted: string;
};

const formatTodoItem = (item: TodoItem): TodoItemFormatted => {
  return {
    ...item,
    createdAtFormatted: formatFromNow(item.createdAt),
  };
};

export default defineComponent({
  components: {
    Spinner: Spinner,
  },

  data(): Data {
    return {
      text: "",
      allItems: [],
      //
      statusSubmit: { type: "NotAsked" },
      statusLoad: { type: "NotAsked" },
      statusDeleteItem: { type: "NotAsked", itemId: "None" },
      statusToggleItem: { type: "NotAsked", itemId: "None" },
      //
      filter: "All",
      allFilters: ["All", "Active", "Completed"],
      //
      sort: "NewestFirst",
      allSorts: ["NewestFirst", "OldestFirst"],
    };
  },

  watch: {
    currentFilter() {
      this.getItems();
    },
    text() {
      if (this.statusSubmit.type === "Error") {
        this.statusSubmit = { type: "NotAsked" };
      }
    },

    statusSubmit(
      statusNew: Data["statusSubmit"],
      statusOld: Data["statusSubmit"]
    ) {
      if (statusOld.type !== statusNew.type && statusNew.type === "Error") {
        const textElement = this.$refs.text as HTMLInputElement;
        textElement.focus();
      }
    },
  },

  computed: {
    items(): TodoItemFormatted[] {
      return this.allItems
        .filter(filterer({ filter: this.filter }))
        .sort(sorter({ sort: this.sort }))
        .map(formatTodoItem);
    },

    allSortsFormatted() {
      return this.allSorts.map((sort) => [sort, formatSort(sort)] as const);
    },
  },

  async mounted() {
    await this.getItems();
  },

  methods: {
    inputFilter(filter: Data["filter"]) {
      this.filter = filter;
    },

    inputSort(sort: Data["sort"]) {
      this.sort = sort;
    },

    async patchItem({ itemId }: { itemId: string }) {
      if (this.statusToggleItem.type === "Loading") {
        return;
      }

      const item = this.allItems.find((item) => item.id === itemId);

      if (!item) {
        return;
      }

      const params: TodoItemPatchParams = {
        itemId: item.id,
      };

      const patchedIsCompleted = !item.isCompleted;

      const patch: TodoItemPatch = {
        isCompleted: patchedIsCompleted,
      };

      this.statusToggleItem = { type: "Loading", itemId };

      const patched = await Api.patch({
        endpoint: "/todo-item",
        json: patch,
        params,
      });

      if (patched.type === "Err") {
        this.statusToggleItem = { type: "Error", error: patched.error, itemId };
        return;
      }

      this.statusToggleItem = { type: "Success", data: undefined, itemId };
      this.allItems = this.allItems.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            isCompleted: patchedIsCompleted,
          };
        }
        return item;
      });
    },

    async deleteItem({ itemId }: { itemId: string }) {
      this.statusDeleteItem = { type: "Loading", itemId };

      const parsed = TodoItemDeleteParams.safeParse({
        itemId,
      });

      if (!parsed.success) {
        this.statusDeleteItem = {
          type: "Error",
          error: formatError(parsed),
          itemId,
        };
        return;
      }

      const deleted = await Api.delete({
        endpoint: "/todo-item",
        params: parsed.data,
      });

      if (deleted.type === "Err") {
        this.statusDeleteItem = { type: "Error", itemId, error: deleted.error };
        return;
      }

      this.statusDeleteItem = { type: "Success", itemId, data: undefined };
      this.allItems = this.allItems.filter((item) => item.id !== itemId);
      this.getItems();
    },

    async getItems() {
      this.statusLoad = { type: "Loading" };

      const params: TodoItemGetParams = {
        filter: this.filter,
        sort: this.sort,
      };

      const got = await Api.get({ endpoint: "/todo-item", params });

      if (got.type === "Err") {
        this.statusLoad = { type: "Error", error: got.error };
        return;
      }

      const parsed = TodoItemGot.safeParse(got.json);

      if (!parsed.success) {
        this.statusLoad = {
          type: "Error",
          error: formatError(parsed),
        };
        return;
      }

      this.statusLoad = { type: "Success", data: undefined };
      this.allItems = parsed.data.items;
    },

    async postItem() {
      if (this.statusSubmit.type === "Loading") {
        return;
      }

      this.statusSubmit = { type: "Loading" };

      const dirty: TodoItem = {
        id: v4(),
        text: this.text,
        isCompleted: false,
        createdAt: new Date(),
      };

      const parsed = TodoItem.safeParse(dirty);

      if (!parsed.success) {
        this.statusSubmit = {
          type: "Error",
          error: parsed.error.issues.map((i) => i.message).join(","),
        };

        return;
      }

      const posted = await Api.post({
        endpoint: "/todo-item",
        json: parsed.data,
      });

      if (posted.type === "Err") {
        this.statusSubmit = { type: "Error", error: posted.error };

        return;
      }

      this.statusSubmit = { type: "Success", data: undefined };
      this.text = "";
      this.allItems.push(parsed.data);
      this.getItems();
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

  <div class="flex flex-col items-center justify-center w-full h-full">
    <!-- 


    Text Input


   -->
    <div class="w-full bg-inherit top-0 p-4">
      <div class="flex items-center justify-center gap-2 w-full">
        <input
          ref="text"
          v-model="text"
          class="input input-md input-bordered flex-1 input-primary"
          :class="{
            'input-error': statusSubmit.type === 'Error',
          }"
          placeholder="What todo?"
        />
        <!-- <p class="pt-1 flex">
          <kbd class="kbd kbd-sm mr-1">⌘</kbd>
          <kbd class="kbd kbd-sm">K</kbd>
        </p> -->

        <button
          @click="postItem"
          class="btn btn-primary w-32"
          :class="{ loading: statusSubmit.type === 'Loading' }"
        >
          Submit
        </button>
      </div>

      <p class="py-2 text-sm text-red-500">
        {{ statusSubmit.type === "Error" ? statusSubmit.error : "" }}
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
          v-if="statusLoad.type === 'Error'"
          class="alert alert-error shadow-lg"
        >
          {{ statusLoad.type === "Error" ? statusLoad.error : "" }}
        </div>
      </div>

      <p
        v-if="statusLoad.type === 'Success' && items.length === 0"
        class="opacity-75 h-64 text-xl font-bold flex items-center justify-center"
      >
        {{
          allItems.length === 0
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
              'cursor-wait': statusToggleItem.type === 'Loading',
              'cursor-pointer active:bg-gray-200 hover:bg-gray-100':
                statusToggleItem.type !== 'Loading',
              'opacity-50':
                statusToggleItem.type === 'Loading' &&
                statusToggleItem.itemId === item.id,
            }"
            @click="patchItem({ itemId: item.id })"
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
                {{ item.createdAtFormatted }}
              </p>
            </div>
          </div>
          <button
            class="btn btn-outline btn-error btn-xs"
            :class="{
              'loading cursor-wait':
                statusDeleteItem.type === 'Loading' &&
                statusDeleteItem.itemId === item.id,
            }"
            @click="deleteItem({ itemId: item.id })"
          >
            Delete
          </button>
        </li>
      </ol>
      <!-- </TransitionGroup> -->

      <Spinner class="p-4" v-if="statusLoad.type === 'Loading'" />
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
