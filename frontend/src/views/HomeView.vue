<script lang="ts">
import Api from "@/api";
import Spinner from "@/components/Spinner.vue";
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
  components: {
    Spinner: Spinner,
  },
  data(): Data {
    return {
      listTitle: "",
      lists: [],
      statusPostList: { type: "NotAsked" },
      statusGetLists: { type: "NotAsked" },
    };
  },

  mounted() {
    this.getLists();
  },

  methods: {
    async getLists() {
      this.statusGetLists = { type: "Loading" };

      const result = await Api.get({
        endpoint: "/todo-list",
        params: {},
      });

      if (result.type === "Err") {
        this.statusGetLists = { type: "Error", error: result.error };
        return;
      }

      this.statusGetLists = { type: "Success", data: undefined };
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
  <!-- 





 -->

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

  <!-- 




 -->

  <div v-if="statusGetLists.type === 'Loading'" class="py-8">
    <Spinner />
  </div>
</template>
