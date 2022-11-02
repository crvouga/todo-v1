<template>
  <div class="toast">
    <div class="alert alert-error w-full w-max-xs">
      <div>
        <span>New message arrived.</span>
      </div>
    </div>
  </div>

  <div
    class="flex flex-col items-center justify-center max-w-xl w-full h-full mx-auto"
  >
    <!-- 


    Input


   -->
    <div class="w-full bg-inherit sticky top-0 p-4">
      <div class="flex items-center justify-center gap-2 w-full">
        <input
          ref="text"
          v-model="text"
          class="input input-md input-bordered flex-1"
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
          @click="submit"
          class="btn btn-primary"
          :class="{ loading: statusSubmit.type === 'Loading' }"
        >
          Submit
        </button>
      </div>

      <p class="pt-2 w-full text-red-500">
        {{ statusSubmit.type === "Error" ? statusSubmit.error : "" }}
      </p>
    </div>
    <!-- 


    List


   -->

    <div class="flex flex-col items-center justify-center flex-1 w-full pb-16">
      <div
        v-if="statusLoad.type === 'Error'"
        class="alert alert-error shadow-lg"
      >
        {{ statusLoad.type === "Error" ? statusLoad.error : "" }}
      </div>

      <spinner class="p-8" v-if="statusLoad.type === 'Loading'" />

      <ol class="flex flex-col items-center justify-center w-full">
        <li
          v-for="item in items"
          v-bind:key="item.id"
          class="w-full p-4 flex items-center text-left"
        >
          <span class="flex-1">
            {{ item.text }}
          </span>
          <button
            class="btn btn-outline btn-error btn-xs"
            :class="{
              loading:
                statusDeleteItem.type === 'Loading' &&
                statusDeleteItem.itemId === item.id,
            }"
            @click="deleteItem({ itemId: item.id })"
          >
            Delete
          </button>
        </li>
      </ol>
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
} from "./shared";
import Spinner from "./Spinner.vue";

type Data = {
  text: string;
  statusSubmit: RemoteData<string, undefined>;
  statusLoad: RemoteData<string, undefined>;
  statusDeleteItem: RemoteData<string, undefined> & { itemId: string };

  items: TodoItem[];
};

export default defineComponent({
  components: {
    spinner: Spinner,
  },

  data(): Data {
    return {
      text: "",
      items: [],
      statusSubmit: { type: "NotAsked" },
      statusLoad: { type: "NotAsked" },
      statusDeleteItem: { type: "NotAsked", itemId: "None" },
    };
  },

  async mounted() {
    await this.load();
  },

  methods: {
    inputText() {
      if (this.statusSubmit.type === "Error") {
        this.statusSubmit = { type: "NotAsked" };
      }
    },

    focusTextInput() {
      const textElement = this.$refs.text as HTMLInputElement;
      textElement.focus();
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
    },

    async load() {
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

    async submit() {
      if (this.statusSubmit.type === "Loading") {
        return;
      }

      this.statusSubmit = { type: "Loading" };

      const parsed = TodoItem.safeParse({
        id: v4(),
        text: this.text,
        status: { type: "Active" },
      });

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
      this.load();
    },
  },
});

type RemoteData<TError, TData> =
  | { type: "NotAsked" }
  | { type: "Loading" }
  | { type: "Success"; data: TData }
  | { type: "Error"; error: TError };
</script>
