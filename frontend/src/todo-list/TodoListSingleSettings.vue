<script lang="ts">
import BackButton from "@/components/BackButton.vue";
import Spinner from "@/components/Spinner.vue";
import type { TodoList } from "@/shared";
import { defineComponent } from "vue";
import TodoListApi from "./todo-list-api";

type Data = {
  listId: string;
  status:
    | {
        type: "Loading";
      }
    | {
        type: "Err";
        error: string;
      }
    | {
        type: "Ok";
        list: TodoList;
        title: string;
      };
};

export default defineComponent({
  components: {
    BackButton,
    Spinner,
  },
  data(): Data {
    // todo validate this
    const listId = String(this.$route.params["listId"]);
    return {
      listId,
      status: { type: "Loading" },
    };
  },

  mounted() {
    this.get();
  },

  methods: {
    async get() {
      this.status = { type: "Loading" };
      const result = await TodoListApi.getOne({ listId: this.listId });
      if (result.type === "Err") {
        this.status = { type: "Err", error: result.error };
        return;
      }
      this.status = { type: "Ok", list: result.data, title: result.data.title };
    },
  },
});
</script>
<template>
  <nav class="p-4 w-full flex align-start">
    <BackButton :to="{ name: 'todo-list-single', params: { listId } }" />
  </nav>
  <div v-if="status.type === 'Loading'">
    <Spinner />
  </div>
  <div v-if="status.type === 'Err'">
    <div class="alert alert-error">
      {{ status.error }}
    </div>
  </div>
  <div class="w-full px-4" v-if="status.type === 'Ok'">
    <p class="font-bold pb-1">List Title</p>
    <div class="w-full flex gap-2 pb-4">
      <input v-model="status.title" class="input input-primary flex-1" />
      <button
        class="btn btn-primary w-32"
        :class="{
          'btn-disabled': status.list.title === status.title,
        }"
      >
        Update
      </button>
    </div>

    <p class="font-bold text-red-400 pb-1">Delete List Forever</p>
    <div class="w-full items-end">
      <button class="btn btn-error">Delete Forever</button>
    </div>
  </div>
</template>
