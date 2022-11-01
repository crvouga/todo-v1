<template>
  <div class="flex items-center justify-center gap-2">
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
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { v4 } from "uuid";
import { TodoItem, endpoints } from "./shared";

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

      const result = TodoItem.safeParse({
        id: v4(),
        text: this.text,
      });

      if (!result.success) {
        const message = result.error.issues
          .map((issue) => issue.message)
          .join(", ");

        this.status = {
          type: "ValidationError",
          message: message,
        };
        return;
      }

      const todoItemNew = result.data;

      try {
        const response = await fetch(
          `http://localhost:5000${endpoints.postTodoItem}`,
          {
            method: "POST",
            body: JSON.stringify(todoItemNew),
          }
        );

        if (response.ok) {
          this.status = { type: "Success" };
          return;
        }
        this.status = {
          type: "ServerError",
          message: "The server response was not ok",
        };
        return;
      } catch (error) {
        this.status = { type: "ServerError", message: String(error) };
        return;
      }
    },
  },
});
</script>
