<script lang="ts">
import api from "../api";
import BackButton from "../components/BackButton.vue";
import Spinner from "../components/Spinner.vue";
import { showToast } from "../store-toast";
import { defineComponent } from "vue";
import userApi from "./user-api";
import { toAvatarUrl, getRandomAvatarSeed } from "./avatar";
import {
  endpoints,
  UserPatchBody,
  UserPatchParams,
  UserDeleteParams,
  UserEverythingDeleteParams,
} from "./user-shared";
import {
  patchCurrentUser,
  fetchCurrentUser,
  getCurrentUserId,
  userStore,
  type CurrentUserStatus,
} from "./user-store";

type Data = {
  avatarSeed: string;
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

  statusPatch:
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
  setup() {
    return {
      toAvatarUrl,
    };
  },
  data(): Data {
    return {
      avatarSeed: "",
      statusLogout: { type: "NotAsked" },
      statusPatch: { type: "NotAsked" },
      statusDeleteAccount: { type: "NotAsked" },
      statusDeleteEverything: { type: "NotAsked" },
    };
  },
  computed: {
    currentUser: (): CurrentUserStatus => {
      if (userStore.currentUser.type !== "LoggedIn") {
        return { type: "Loading" };
      }
      return userStore.currentUser.status;
    },
  },
  watch: {
    currentUser(prev: CurrentUserStatus, next: CurrentUserStatus) {
      if (prev.type !== "Ok" && next.type === "Ok") {
        this.avatarSeed = next.user.avatarSeed;
      }
    },
  },
  mounted() {
    fetchCurrentUser();
  },
  methods: {
    randomAvatarSeed() {
      this.avatarSeed = getRandomAvatarSeed();
    },
    clearAvatarSeed() {
      this.avatarSeed = "";
    },
    async logout() {
      this.statusLogout = { type: "Loading" };
      const result = await userApi.session.delete_();
      if (result.type === "Err") {
        this.statusLogout = { type: "Err", error: result.error };
        return;
      }
      this.statusLogout = { type: "Ok" };
      showToast({ type: "Info", title: "You're now logged out" });
      this.$router.push({ name: "login" });
    },

    async patch(body: UserPatchBody) {
      if (this.statusPatch.type === "Loading") {
        return;
      }
      if (this.currentUser.type !== "Ok") {
        return;
      }

      const dirty: UserPatchParams = {
        userId: this.currentUser.user.id,
      };

      this.statusPatch = { type: "Loading" };

      const result = await userApi.user.patch({ params: dirty, body });

      if (result.type === "Err") {
        this.statusPatch = { type: "Err", error: result.error };
        return;
      }

      this.statusPatch = { type: "Ok" };
      showToast({ type: "Success", title: "Account successfully updated" });
      patchCurrentUser(body);
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
    v-if="currentUser.type === 'Loading'"
    class="w-full px-4 flex items-center justify-center mt-4"
  >
    <Spinner />
  </div>

  <div
    v-if="currentUser.type === 'Err'"
    class="w-full px-4 flex items-center justify-center mt-4"
  >
    <div class="alert alert-error w-full">
      {{ currentUser.error }}
    </div>
  </div>

  <div v-if="currentUser.type === 'Ok'" class="w-full mt-4 px-4">
    <p class="text-md font-bold opacity-75">Email Address</p>
    <p class="text-xl font-bold">
      {{ currentUser.user.emailAddress }}
    </p>
    <p class="text-md font-bold opacity-75 mt-4">ID</p>
    <p class="text-xl font-bold overflow-hidden text-ellipsis">
      {{ currentUser.user.id }}
    </p>

    <!-- 

        
      Avatar Seed Input


       -->
    <div class="w-full avatar flex items-center justify-center mt-8">
      <div class="w-24 rounded">
        <img :src="toAvatarUrl({ avatarSeed })" />
      </div>
    </div>
    <label class="font-bold mt-1 w-full text-left" for="avatarSeedInput">
      Avatar Seed
    </label>
    <div class="w-full flex items-center gap-2">
      <input
        v-model="avatarSeed"
        id="avatarSeedInput"
        class="input input-primary w-full mt-1"
      />
      <button class="btn btn-outline btn-primary" @click="randomAvatarSeed">
        Random
      </button>
      <button class="btn btn-outline btn-primary" @click="clearAvatarSeed">
        Clear
      </button>
    </div>

    <div class="w-full mt-2">
      <button
        class="btn btn-primary w-full btn-md"
        @click="patch({ avatarSeed })"
        :class="{
          'btn-disabled':
            currentUser.type === 'Ok' &&
            currentUser.user.avatarSeed === avatarSeed,
          loading: statusPatch.type === 'Loading',
        }"
      >
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
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
          />
        </svg>

        Update
      </button>
    </div>

    <div v-if="statusPatch.type === 'Err'" class="mt-2 w-full">
      <div class="alert alert-error w-full">
        {{ statusPatch.error }}
      </div>
    </div>

    <!-- 

      Logout


   -->

    <div class="mt-12 w-full">
      <button
        class="btn btn-error btn-outline w-full font-bold"
        @click="logout"
      >
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
                'loading btn-disabled':
                  statusDeleteEverything.type === 'Loading',
              }"
            >
              Delete Forever
            </button>
          </div>
        </label>
      </label>
    </div>
  </div>
</template>
