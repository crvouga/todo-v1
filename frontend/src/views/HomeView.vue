<script lang="ts">
import Api from "@/api";
import { formatError, TodoList } from "@/shared";
import type { RemoteData } from "@/utils";
import { v4 } from "uuid";
import { defineComponent } from "vue";

type Data = {
  listTitle: string;
  lists: TodoList[];
  statusPostList: RemoteData<string, undefined>;
  statusGetLists: RemoteData<string, undefined>;
};

export default defineComponent({
  data(): Data {
    return {
      listTitle: "",
      lists: [],
      statusPostList: { type: "NotAsked" },
      statusGetLists: { type: "NotAsked" },
    };
  },
  methods: {
    async getLists() {
      this.statusGetLists = { type: "Loading" };
    },

    async postList() {
      this.statusPostList = { type: "Loading" };

      const dirty: TodoList = {
        createdAt: new Date(),
        id: v4(),
        title: this.listTitle,
      };

      const parsed = TodoList.safeParse(dirty);

      if (!parsed.success) {
        this.statusPostList = {
          type: "Error",
          error: formatError(parsed),
        };
        return;
      }

      const result = await Api.post({
        endpoint: "/todo-list",
        json: parsed.data,
      });

      if (result.type === "Err") {
        this.statusPostList = { type: "Error", error: result.error };
        return;
      }

      this.statusPostList = { type: "Success", data: undefined };
      this.getLists();
    },
  },
});
</script>

<template>
  <div class="w-full mb-2">
    <input
      v-model="listTitle"
      class="block input input-md input-bordered input-primary w-full"
      placeholder="Name of list"
    />
  </div>

  <button class="btn btn-primary w-full" @click="postList">
    Create New List
  </button>
</template>
