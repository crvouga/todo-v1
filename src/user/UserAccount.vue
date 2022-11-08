<script lang="ts">
import api from "@/api";
import BackButton from "@/components/BackButton.vue";
import Spinner from "@/components/Spinner.vue";
import { getCurrentUserId } from "@/store-session";
import { showToast } from "@/store-toast";
import { formatError } from "@/utils";
import { defineComponent } from "vue";
import userSessionApi from "./user-session-api";
import {
  UserEverythingDeleteParams,
  UserDeleteParams,
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

  statusDeleteAccount:
    | { type: "NotAsked" }
    | { type: "Loading" }
    | { type: "Err"; error: string }
    | { type: "Ok" };

  statusDeleteEverything:
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
      statusDeleteAccount: { type: "NotAsked" },
      statusDeleteEverything: { type: "NotAsked" },
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

    async closeDeleteEverything() {
      // todo change this method because its feels like a hack
      const element = document.getElementById("delete-everything");

      if (!element) {
        return;
      }

      // @ts-ignore
      element.checked = false;
    },
    async deleteEverything() {
      if (this.statusDeleteEverything.type === "Loading") {
        return;
      }
      this.statusDeleteEverything = { type: "Loading" };
      const currentUserId = getCurrentUserId();
      if (!currentUserId) {
        this.statusDeleteAccount = { type: "Err", error: "Must be logged in" };
        return;
      }
      const dirty: UserEverythingDeleteParams = { userId: currentUserId };
      const deleted = await api.delete({
        endpoint: endpoints["/user/everything"],
        params: dirty,
      });
      if (deleted.type === "Err") {
        this.statusDeleteEverything = { type: "Err", error: deleted.error };
        return;
      }
      this.statusDeleteEverything = { type: "Ok" };
      showToast({ type: "Info", title: "Everything was deleted forever" });
      this.closeDeleteEverything();
    },

    async closeDeleteAccount() {
      // todo change this method because its feels like a hack
      const element = document.getElementById("delete-account");

      if (!element) {
        return;
      }

      // @ts-ignore
      element.checked = false;
    },
    async deleteAccount() {
      if (this.statusDeleteAccount.type === "Loading") {
        return;
      }
      this.statusDeleteAccount = { type: "Loading" };
      const currentUserId = getCurrentUserId();
      if (!currentUserId) {
        this.statusDeleteAccount = { type: "Err", error: "Must be logged in" };
        return;
      }
      const dirty: UserDeleteParams = { userId: currentUserId };
      const deleted = await api.delete({
        endpoint: endpoints["/user"],
        params: dirty,
      });
      if (deleted.type === "Err") {
        this.statusDeleteAccount = { type: "Err", error: deleted.error };
        return;
      }
      this.statusDeleteAccount = { type: "Ok" };
      this.closeDeleteAccount();
      showToast({ type: "Info", title: "Your account was deleted forever" });
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
    <button class="btn btn-error btn-outline w-full font-bold" @click="logout">
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

    <p class="font-bold text-2xl text-red-500 mt-6">Danger Zone</p>

    <!-- 


      Delete Account

     -->

    <label
      for="delete-account"
      class="mt-4 btn modal-button btn-error w-full font-bold"
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
          d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
        />
      </svg>

      Delete Account Forever
    </label>

    <input type="checkbox" id="delete-account" class="modal-toggle" />
    <label for="delete-account" class="modal cursor-pointer">
      <label class="modal-box relative" for="">
        <h3 class="text-3xl font-bold">Delete your account forever?</h3>
        <div
          v-if="statusDeleteAccount.type === 'Err'"
          class="alert alert-error mt-2"
        >
          {{ statusDeleteAccount.error }}
        </div>
        <div class="modal-action">
          <button class="btn" @click="closeDeleteAccount">Cancel</button>
          <button
            class="btn btn-error"
            @click="deleteAccount()"
            :class="{
              'loading btn-disabled': statusDeleteAccount.type === 'Loading',
            }"
          >
            Delete Forever
          </button>
        </div>
      </label>
    </label>

    <!-- 


      Delete Everything


     -->

    <label
      for="delete-everything"
      class="mt-4 btn modal-button btn-error w-full font-bold"
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
          d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
        />
      </svg>

      Delete Everything Forever
    </label>

    <input type="checkbox" id="delete-everything" class="modal-toggle" />
    <label for="delete-everything" class="modal cursor-pointer">
      <label class="modal-box relative" for="">
        <h3 class="text-3xl font-bold">Delete everything forever?</h3>
        <div
          v-if="statusDeleteEverything.type === 'Err'"
          class="alert alert-error"
        >
          {{ statusDeleteEverything.error }}
        </div>
        <div class="modal-action">
          <button class="btn" @click="closeDeleteEverything">Cancel</button>
          <button
            class="btn btn-error"
            @click="deleteEverything()"
            :class="{
              'loading btn-disabled': statusDeleteEverything.type === 'Loading',
            }"
          >
            Delete Forever
          </button>
        </div>
      </label>
    </label>
  </div>
</template>
