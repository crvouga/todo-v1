<template>
  <div class="flex flex-col items-center justify-center max-w-xl mx-auto p-4">
    <div class="flex items-center justify-center gap-2 w-full">
      <input
        v-model="text"
        class="input input-md input-bordered flex-1"
        :class="{
          'input-error': status.type === 'ValidationError',
        }"
        placeholder="What is there todo?"
        @input="inputText"
      />
      <button
        @click="submit"
        class="btn btn-primary"
        :class="{ loading: status.type === 'Loading' }"
      >
        Submit
      </button>
    </div>

    <p class="pt-1 text-red-500">
      {{
        status.type === "ValidationError" || status.type === "ServerError"
          ? status.message
          : ""
      }}
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { v4 } from "uuid";
import { TodoItem, endpoints } from "./shared";
import { apiFetch } from "./backend-api";

type Data = {
  text: string;
  status:
    | { type: "NotAsked" }
    | { type: "Loading" }
    | { type: "Success" }
    | { type: "ValidationError"; message: string }
    | { type: "ServerError"; message: string };
};

export default defineComponent({
  data(): Data {
    return {
      status: { type: "NotAsked" },
      text: "",
    };
  },

  methods: {
    inputText() {
      if (this.status.type === "ValidationError") {
        this.status = { type: "NotAsked" };
      }
    },

    async submit() {
      if (this.status.type === "Loading") {
        return;
      }

      this.status = { type: "Loading" };

      const parseResult = TodoItem.safeParse({
        id: v4(),
        text: this.text,
      });

      if (!parseResult.success) {
        const message = parseResult.error.issues
          .map((issue) => issue.message)
          .join(", ");

        this.status = {
          type: "ValidationError",
          message: message,
        };
        return;
      }

      const apiResult = await apiFetch({
        method: "POST",
        endpoint: endpoints.postTodoItem,
        json: parseResult.data,
      });

      if (apiResult.type === "Err") {
        this.status = {
          type: "ServerError",
          message: String(apiResult.error),
        };

        return;
      }

      this.status = { type: "Success" };
      this.text = "";
    },
  },
});
</script>
