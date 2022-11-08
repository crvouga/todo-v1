<script lang="ts">
import { defineComponent } from "vue";
import BackButton from "@/components/BackButton.vue";
import api from "@/api";
import userSessionApi from "./user-session-api";

type Data = {
  statusLogout:
    | { type: "NotAsked" }
    | { type: "Loading" }
    | { type: "Err"; error: string }
    | { type: "Ok" };
};

export default defineComponent({
  components: {
    BackButton,
  },
  data(): Data {
    return {
      statusLogout: { type: "NotAsked" },
    };
  },
  methods: {
    async logout() {
      this.statusLogout = { type: "Loading" };
      const result = await userSessionApi.delete_();
      if (result.type === "Err") {
        this.statusLogout = { type: "Err", error: result.error };
        return;
      }
      this.statusLogout = { type: "Ok" };

      this.$router.push({ name: "login" });
    },
  },
});
</script>
<template>
  <div class="w-full items-left px-4 pt-4">
    <BackButton :to="{ name: 'home' }" />
  </div>

  <h1 class="text-3xl px-4 w-full text-left pt-4">Settings</h1>

  <!-- <p class="text-lg opacity-75">Email Address</p>
  <p class="text-4xl font-bold">
    
  </p> -->

  <div class="mt-4 w-full px-4">
    <button class="btn btn-error btn-outline w-full" @click="logout">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-6 h-6 mr-2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
        />
      </svg>

      Logout
    </button>
  </div>
</template>
