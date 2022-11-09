<script lang="ts">
import BackButton from "../components/BackButton.vue";
import Spinner from "../components/Spinner.vue";
import NavBar from "../components/NavBar.vue";
import { showToast } from "../store-toast";
import type { TodoList } from "../todo-list/todo-list-shared";
import { defineComponent } from "vue";
import TodoListApi from "./todo-list-api";

type Data = {
  listId: string;
  statusPatch:
    | { type: "NotAsked" }
    | { type: "Loading" }
    | { type: "Err"; error: string }
    | { type: "Ok" };
  statusDelete:
    | { type: "NotAsked" }
    | { type: "Loading" }
    | { type: "Err"; error: string }
    | { type: "Ok" };
  status:
    | { type: "Loading" }
    | { type: "Err"; error: string }
    | { type: "Ok"; list: TodoList; title: string };
};

export default defineComponent({
  components: {
    BackButton,
    Spinner,
    NavBar,
  },
  data(): Data {
    // todo validate this
    const listId = String(this.$route.params["listId"]);
    return {
      listId,
      statusDelete: { type: "NotAsked" },
      statusPatch: { type: "NotAsked" },
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
    undo() {
      if (this.status.type !== "Ok") {
        return;
      }
      this.status.title = this.status.list.title;
    },
    closeDeleteModal() {
      // todo change this method because its feels like a hack
      const element = document.getElementById("delete-modal");

      if (!element) {
        return;
      }

      // @ts-ignore
      element.checked = false;
    },
    async deleteForever() {
      if (this.statusDelete.type === "Loading") {
        return;
      }
      this.statusDelete = { type: "Loading" };
      const result = await TodoListApi.delete_({ listId: this.listId });
      if (result.type === "Err") {
        this.statusDelete = { type: "Err", error: result.error };
        return;
      }
      this.closeDeleteModal();
      this.statusDelete = { type: "Ok" };
      this.$router.push({ name: "todo-list-all" });
      showToast({ type: "Info", title: "List was deleted forever" });
    },
    async patch() {
      if (this.statusPatch.type === "Loading") {
        return;
      }
      if (this.status.type !== "Ok") {
        return;
      }
      this.statusPatch = { type: "Loading" };
      const result = await TodoListApi.patch(
        { listId: this.listId },
        { title: this.status.title }
      );
      if (result.type === "Err") {
        this.statusPatch = { type: "Err", error: result.error };
        return;
      }

      this.statusPatch = { type: "Ok" };
      this.get();
    },
  },
});
</script>
<template>
  <NavBar />
  <nav class="px-4 pt-0 w-full flex align-start">
    <BackButton :to="{ name: 'todo-list-single', params: { listId } }" />
  </nav>
  <h1 class="font-bold text-4xl w-full text-left p-4">Settings</h1>

  <div v-if="status.type === 'Loading'">
    <Spinner />
  </div>

  <div v-if="status.type === 'Err'" class="px-4 w-full">
    <div class="alert alert-error w-full">
      {{ status.error }}
    </div>
  </div>

  <div class="w-full px-4" v-if="status.type === 'Ok'">
    <p class="font-bold pb-1">Title</p>
    <div class="w-full flex gap-2">
      <input v-model="status.title" class="input input-primary w-full mb-2" />
      <button
        class="btn btn-primary"
        :class="{
          'btn-disabled': status.title === status.list.title,
          'btn-outline': status.title !== status.list.title,
        }"
        @click="undo"
      >
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
            d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
          />
        </svg>

        Undo
      </button>
    </div>
    <div class="mb-4">
      <button
        class="btn btn-primary w-32"
        :class="{
          'btn-disabled': status.list.title === status.title,
          loading: statusPatch.type === 'Loading',
        }"
        @click="patch"
      >
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
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
          />
        </svg>

        Update
      </button>
    </div>

    <p class="font-bold text-2xl text-red-500 pb-1">Danger Zone</p>

    <!-- The button to open modal -->
    <label for="delete-modal" class="btn modal-button btn-error">
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
          d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
        />
      </svg>

      Delete List Forever
    </label>

    <!-- Put this part before </body> tag -->
    <input type="checkbox" id="delete-modal" class="modal-toggle" />
    <label for="delete-modal" class="modal cursor-pointer">
      <label class="modal-box relative" for="">
        <h3 class="text-3xl font-bold">Delete list forever?</h3>
        <div v-if="statusDelete.type === 'Err'" class="alert alert-error">
          {{ statusDelete.error }}
        </div>
        <div class="modal-action">
          <button class="btn" @click="closeDeleteModal">Cancel</button>
          <button
            class="btn btn-error"
            @click="deleteForever()"
            :class="{ 'loading btn-disabled': statusDelete.type === 'Loading' }"
          >
            Delete Forever
          </button>
        </div>
      </label>
    </label>
  </div>
</template>
