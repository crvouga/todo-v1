<template>
  <!-- <div class="toast">
    <div class="alert alert-error w-full w-max-xs">
      <div>
        <span>New message arrived.</span>
      </div>
    </div>
  </div> -->

  <div
    class="flex flex-col items-center justify-center max-w-md w-full h-full mx-auto"
  >
    <!-- 


    Text Input


   -->
    <div class="w-full bg-inherit sticky top-0 p-4">
      <div class="flex items-center justify-center gap-2 w-full">
        <input
          ref="text"
          v-model="text"
          class="input input-md input-bordered flex-1 input-primary"
          :class="{
            'input-error': statusSubmit.type === 'Error',
          }"
          placeholder="What todo?"
          @input="inputText"
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

      <div class="btn-group">
        <button
          v-for="filter in allFilters"
          v-bind:key="filter"
          :class="{ 'btn-active': currentFilter === filter }"
          class="btn btn-sm"
          @click="inputFilter(filter)"
        >
          {{ filter }}
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
        class="opacity-75 py-4"
      >
        No items found.
      </p>

      <ol class="flex flex-col items-center justify-center w-full">
        <li
          v-for="item in items"
          v-bind:key="item.id"
          class="w-full flex items-center pr-6"
        >
          <div
            class="flex-1 flex items-center p-4 pl-6"
            :class="{
              'cursor-wait': statusToggleItem.type === 'Loading',
              'cursor-pointer active:bg-gray-200 hover:bg-gray-100':
                statusToggleItem.type !== 'Loading',
            }"
            @click="toggleItem({ itemId: item.id })"
          >
            <input
              v-if="
                !(
                  statusToggleItem.type === 'Loading' &&
                  statusToggleItem.itemId === item.id
                )
              "
              type="checkbox"
              :checked="item.status.type === 'Completed'"
              class="checkbox checkbox-sm checkbox-primary mr-2"
              @click.prevent=""
            />

            <Spinner
              childClass="w-4 h-4"
              v-if="
                statusToggleItem.type === 'Loading' &&
                statusToggleItem.itemId === item.id
              "
            />

            <span
              class="flex-1 text-xl font-semibold"
              :class="{
                'line-through opacity-50': item.status.type === 'Completed',
              }"
            >
              {{ item.text }}
            </span>
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

      <Spinner class="p-4" v-if="statusLoad.type === 'Loading'" />
    </div>

    <!-- 




     -->
  </div>
</template>

<script lang="ts">
import { v4 } from "uuid";
import { defineComponent } from "vue";
import Api from "./api";
import {
  formatError,
  TodoItemsGot,
  TodoItemDeleteParams,
  TodoItem,
  toggleStatus,
  TodoItemPatchParams,
  TodoItemPatch,
} from "./shared";
import Spinner from "./Spinner.vue";

type Data = {
  text: string;
  statusSubmit: RemoteData<string, undefined>;
  statusLoad: RemoteData<string, undefined>;
  statusDeleteItem: RemoteData<string, undefined> & { itemId: string };
  statusToggleItem: RemoteData<string, undefined> & { itemId: string };
  items: TodoItem[];
  currentFilter: Filter;
  allFilters: Filter[];
};

type Filter = "All" | "Active" | "Completed";

export default defineComponent({
  components: {
    Spinner: Spinner,
  },

  data(): Data {
    return {
      text: "",
      items: [],
      statusSubmit: { type: "NotAsked" },
      statusLoad: { type: "NotAsked" },
      statusDeleteItem: { type: "NotAsked", itemId: "None" },
      statusToggleItem: { type: "NotAsked", itemId: "None" },
      currentFilter: "All",
      allFilters: ["All", "Active", "Completed"],
    };
  },

  async mounted() {
    await this.getItems();
  },

  methods: {
    inputFilter(filter: Data["currentFilter"]) {
      this.currentFilter = filter;
    },

    inputText() {
      if (this.statusSubmit.type === "Error") {
        this.statusSubmit = { type: "NotAsked" };
      }
    },

    focusTextInput() {
      const textElement = this.$refs.text as HTMLInputElement;
      textElement.focus();
    },

    async toggleItem({ itemId }: { itemId: string }) {
      if (this.statusToggleItem.type === "Loading") {
        return;
      }

      const item = this.items.find((item) => item.id === itemId);

      if (!item) {
        return;
      }

      const params: TodoItemPatchParams = {
        itemId: item.id,
      };

      const parsedParams = TodoItemPatchParams.safeParse(params);

      if (!parsedParams.success) {
        return;
      }

      const statusPatch = toggleStatus(item.status);

      const patch: TodoItemPatch = {
        status: statusPatch,
      };

      const parsedPayload = TodoItemPatch.safeParse(patch);

      if (!parsedPayload.success) {
        return;
      }

      this.statusToggleItem = { type: "Loading", itemId };

      const patched = await Api.patch({
        endpoint: "/todo-item",
        json: parsedPayload.data,
        params: parsedParams.data,
      });

      if (patched.type === "Err") {
        this.statusToggleItem = { type: "Error", error: patched.error, itemId };
        return;
      }

      this.statusToggleItem = { type: "Success", data: undefined, itemId };
      this.items = this.items.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            status: statusPatch,
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
      this.items = this.items.filter((item) => item.id !== itemId);
      this.getItems();
    },

    async getItems() {
      this.statusLoad = { type: "Loading" };

      const got = await Api.get({ endpoint: "/todo-item" });

      if (got.type === "Err") {
        this.statusLoad = { type: "Error", error: got.error };
        return;
      }

      const parsed = TodoItemsGot.safeParse(got.json);

      if (!parsed.success) {
        this.statusLoad = {
          type: "Error",
          error: formatError(parsed),
        };
        return;
      }

      this.statusLoad = { type: "Success", data: undefined };
      this.items = parsed.data.items;
    },

    async postItem() {
      if (this.statusSubmit.type === "Loading") {
        return;
      }

      this.statusSubmit = { type: "Loading" };

      const dirty: TodoItem = {
        id: v4(),
        text: this.text,
        status: { type: "Active" },
        createdAt: new Date(),
      };

      const parsed = TodoItem.safeParse(dirty);

      if (!parsed.success) {
        this.focusTextInput();

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
      this.items.push(parsed.data);
      this.getItems();
    },
  },
});

type RemoteData<TError, TData> =
  | { type: "NotAsked" }
  | { type: "Loading" }
  | { type: "Success"; data: TData }
  | { type: "Error"; error: TError };
</script>
