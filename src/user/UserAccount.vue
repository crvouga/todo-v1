<script lang="ts">
import api from "@/api";
import BackButton from "@/components/BackButton.vue";
import Spinner from "@/components/Spinner.vue";
import { getCurrentUserId } from "@/store-session";
import { formatError } from "@/utils";
import { defineComponent } from "vue";
import userSessionApi from "./user-session-api";
import {
  UserGotBody,
  UserGetParams,
  endpoints,
  type User,
} from "./user-shared";

type Data = {
  statusGet:
    | { type: "Loading" }
    | { type: "Error"; error: string }
    | { type: "Ok"; data: User };
  statusLogout:
    | { type: "NotAsked" }
    | { type: "Loading" }
    | { type: "Err"; error: string }
    | { type: "Ok" };
};

export default defineComponent({
  components: {
    BackButton,
    Spinner,
  },
  data(): Data {
    return {
      statusLogout: { type: "NotAsked" },
      statusGet: { type: "Loading" },
    };
  },
  mounted() {
    this.get();
  },
  methods: {
    async get() {
      this.statusGet = { type: "Loading" };

      const currentUsrId = getCurrentUserId();

      if (!currentUsrId) {
        this.statusGet = { type: "Error", error: "Must be logged in" };
        return;
      }

      const dirty: UserGetParams = {
        userId: currentUsrId,
      };

      const got = await api.get({
        endpoint: endpoints["/user"],
        params: dirty,
      });

      if (got.type === "Err") {
        this.statusGet = { type: "Error", error: got.error };
        return;
      }

      const parsed = UserGotBody.safeParse(got.json);

      if (!parsed.success) {
        this.statusGet = { type: "Error", error: formatError(parsed) };
        return;
      }

      this.statusGet = { type: "Ok", data: parsed.data };
    },
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

  <h1 class="font-bold text-4xl px-4 w-full text-left pt-4">Account</h1>

  <div
    v-if="statusGet.type === 'Loading'"
    class="w-full px-4 flex items-center justify-center mt-4"
  >
    <Spinner />
  </div>

  <div
    v-if="statusGet.type === 'Error'"
    class="w-full px-4 flex items-center justify-center mt-4"
  >
    <div class="alert alert-error w-full">
      {{ statusGet.error }}
    </div>
  </div>

  <div v-if="statusGet.type === 'Ok'" class="w-full mt-4 px-4">
    <p class="text-md font-bold opacity-75">Email Address</p>
    <p class="text-xl font-bold">
      {{ statusGet.data.emailAddress }}
    </p>
    <p class="text-md font-bold opacity-75 mt-4">ID</p>
    <p class="text-sm font-bold">
      {{ statusGet.data.id }}
    </p>
  </div>

  <div class="mt-8 w-full px-4">
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
