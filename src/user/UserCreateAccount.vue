<script lang="ts">
import api from "@/api";
import BackButton from "@/components/BackButton.vue";
import PasswordVisibilityButton from "../components/PasswordVisibilityButton.vue";
import { showToast } from "@/store-toast";
import { defineComponent } from "vue";
import { endpoints, UserPostBody, UserPostError } from "./user-shared";

type Data = {
  emailAddress: string;
  password: string;
  passwordVisibility: "Hidden" | "Showing";
  status:
    | { type: "NotAsked" }
    | { type: "Loading" }
    | {
        type: "Err";
        error: UserPostError | { type: "UnknownError"; message: string };
      }
    | { type: "Ok" };
};

export default defineComponent({
  data(): Data {
    return {
      emailAddress: "",
      password: "",
      passwordVisibility: "Hidden",
      status: { type: "NotAsked" },
    };
  },
  components: {
    BackButton,
    PasswordVisibilityButton,
  },
  methods: {
    togglePasswordVisibility() {
      this.passwordVisibility =
        this.passwordVisibility === "Showing" ? "Hidden" : "Showing";
    },
    async post() {
      if (this.status.type === "Loading") {
        return;
      }
      this.status = { type: "Loading" };
      const dirty: UserPostBody = {
        emailAddress: this.emailAddress,
        password: this.password,
      };
      const result = await api.post({
        endpoint: endpoints["/user"],
        json: dirty,
      });
      if (result.type === "Err") {
        const parsed = UserPostError.safeParse(result.body);
        if (!parsed.success) {
          this.status = {
            type: "Err",
            error: { type: "UnknownError", message: result.error },
          };
          return;
        }
        this.status = { type: "Err", error: parsed.data };
        return;
      }
      this.status = { type: "Ok" };
      showToast({ type: "Success", title: "New account created" });
      this.$router.push({ name: "login" });
    },
  },
});
</script>
<template>
  <div class="w-full flex flex-col justify-center items-center">
    <nav class="px-4 pt-4 w-full flex items-start">
      <BackButton :to="{ name: 'login' }" />
    </nav>
    <h1 class="px-4 font-bold text-3xl text-left w-full mt-4 mb-6">
      Create New Account
    </h1>
    <div class="flex flex-col justify-center items-start w-full px-4">
      <!-- 

        Email Address Input

       -->
      <label class="font-bold mb-1" for="emailAddressInput">
        Email Address
      </label>
      <input
        type="email"
        v-model="emailAddress"
        id="emailAddressInput"
        class="input input-primary w-full"
        :class="{
          'input-error':
            status.type === 'Err' &&
            (status.error.type === 'InvalidEmailAddress' ||
              status.error.type === 'EmailAddressTaken'),
        }"
      />
      <p
        class="text-red-500 text-sm mt-1"
        v-if="
          status.type === 'Err' && status.error.type === 'EmailAddressTaken'
        "
      >
        Email address is taken! Try logging in.
      </p>

      <p
        class="text-red-500 text-sm mt-2"
        v-if="
          status.type === 'Err' && status.error.type === 'InvalidEmailAddress'
        "
      >
        {{ status.error.message }}
      </p>

      <!-- 

        Password Input

       -->

      <label class="font-bold mt-4" for="passwordInput"> Password </label>
      <input
        v-model="password"
        :type="passwordVisibility === 'Showing' ? 'text' : 'password'"
        id="passwordInput"
        class="input input-primary w-full mt-1"
        :class="{
          'input-error':
            status.type === 'Err' && status.error.type === 'InvalidPassword',
        }"
      />
      <p
        class="text-red-500 text-sm mt-1"
        v-if="status.type === 'Err' && status.error.type === 'InvalidPassword'"
      >
        {{ status.error.message }}
      </p>

      <PasswordVisibilityButton
        :is-showing="passwordVisibility === 'Showing'"
        @click="togglePasswordVisibility"
        class="mt-2"
      />

      <div
        v-if="status.type === 'Err' && status.error.type === 'UnknownError'"
        class="alert alert-error mt-4"
      >
        {{ status.error.message }}
      </div>

      <!-- 


        Submit


       -->

      <button
        class="btn btn-primary w-full mt-6"
        :class="{ loading: status.type === 'Loading' }"
        @click="post"
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
            d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
          />
        </svg>
        Create New Account
      </button>

      <div class="text-center w-full mt-12">
        <p class="w-full text-center text-primary text-sm mb-2">
          Already have an account?
        </p>
        <RouterLink class="btn btn-primary btn-outline" :to="{ name: 'login' }">
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
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
          Login
        </RouterLink>
      </div>
    </div>
  </div>
</template>
