<script lang="ts">
import api from "../api";
import PasswordVisibilityButton from "../components/PasswordVisibilityButton.vue";
import { showToast } from "../store-toast";
import { formatError } from "../utils";
import { defineComponent } from "vue";
import {
  SessionPostedBody,
  endpoints,
  SessionPostBody,
  SessionPostError,
  sessionIdKey,
} from "./user-shared";

type Data = {
  emailAddress: string;
  password: string;
  passwordVisibility: "Hidden" | "Showing";
  status:
    | { type: "NotAsked" }
    | { type: "Loading" }
    | {
        type: "Err";
        error: SessionPostError | { type: "ParsingFailed"; message: string };
      }
    | { type: "Ok"; data: SessionPostedBody };
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
    PasswordVisibilityButton,
  },

  watch: {
    emailAddress() {
      if (
        this.status.type === "Err" &&
        this.status.error.type === "InvalidEmailAddress"
      ) {
        this.status = { type: "NotAsked" };
      }
    },

    password() {
      if (
        this.status.type === "Err" &&
        this.status.error.type === "WrongPassword"
      ) {
        this.status = { type: "NotAsked" };
      }
    },
  },

  methods: {
    togglePasswordVisibility() {
      this.passwordVisibility =
        this.passwordVisibility === "Showing" ? "Hidden" : "Showing";
    },
    async login() {
      if (this.status.type === "Loading") {
        return;
      }
      this.status = { type: "Loading" };
      const emailAddress = this.emailAddress;
      const dirty: SessionPostBody = {
        emailAddress,
        password: this.password,
      };
      const posted = await api.post({
        endpoint: endpoints["/session"],
        json: dirty,
      });

      if (posted.type === "Err") {
        const parsed = SessionPostError.safeParse(posted.body);

        if (!parsed.success) {
          console.error(parsed.error);
          this.status = {
            type: "Err",
            error: { type: "ParsingFailed", message: formatError(parsed) },
          };
          return;
        }

        this.status = { type: "Err", error: parsed.data };
        return;
      }

      const parsedBody = SessionPostedBody.safeParse(posted.body);

      if (!parsedBody.success) {
        console.error({ error: parsedBody.error, body: posted });
        this.status = {
          type: "Err",
          error: {
            type: "ParsingFailed",
            message: `Parsing Error!`,
          },
        };
        return;
      }
      this.status = { type: "Ok", data: parsedBody.data };
      localStorage.setItem(sessionIdKey, parsedBody.data.sessionId);
      const pushed = await this.$router.push({ name: "todo-list-all" });
      console.log(pushed);
      showToast({
        type: "Info",
        title: `Logged in with ${emailAddress}`,
      });
    },
  },
});
</script>
<template>
  <div class="w-full flex flex-col justify-center items-center mt-12">
    <h1
      class="font-black text-transparent text-8xl bg-clip-text bg-gradient-to-b from-purple-500 to-purple-900 mb-16"
    >
      todo
    </h1>

    <div class="flex flex-col justify-center items-start w-full px-4">
      <label class="font-bold mb-1 flex items-center" for="emailAddressInput">
        Email Address
        <span class="font-light ml-2 text-xs">(e.g. example@email.com)</span>
      </label>
      <input
        v-model="emailAddress"
        type="email"
        id="emailAddressInput"
        class="input input-primary w-full"
        :class="{
          'input-error':
            status.type === 'Err' &&
            (status.error.type === 'InvalidEmailAddress' ||
              status.error.type === 'AccountNotFound'),
        }"
      />
      <p
        v-if="
          status.type === 'Err' &&
          (status.error.type === 'InvalidEmailAddress' ||
            status.error.type === 'AccountNotFound')
        "
        class="text-red-500 w-full text-left mt-2"
      >
        {{
          status.error.type === "InvalidEmailAddress"
            ? status.error.message
            : "An account with this email does not exists. Try creating a new account"
        }}
      </p>

      <label class="font-bold mt-4 mb-1" for="passwordInput">
        Password
        <span class="font-light ml-2 text-xs">(e.g. 123)</span>
      </label>
      <input
        v-model="password"
        :type="passwordVisibility === 'Showing' ? 'text' : 'password'"
        id="passwordInput"
        class="input input-primary w-full"
        :class="{
          'input-error':
            status.type === 'Err' && status.error.type === 'WrongPassword',
        }"
      />
      <p
        v-if="status.type === 'Err' && status.error.type === 'WrongPassword'"
        class="text-red-500 w-full text-left mt-2"
      >
        Wrong password
      </p>

      <PasswordVisibilityButton
        :is-showing="passwordVisibility === 'Showing'"
        @click="togglePasswordVisibility"
        class="mt-2"
      />

      <div
        v-if="
          status.type === 'Err' &&
          (status.error.type === 'ServerError' ||
            status.error.type === 'ParsingFailed')
        "
        class="w-full mt-4"
      >
        <div class="alert alert-error w-full">
          {{ status.error.message }}
        </div>
      </div>

      <button
        class="mt-6 btn btn-primary w-full"
        :class="{ loading: status.type === 'Loading' }"
        @click="login"
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
            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
          />
        </svg>

        Login
      </button>

      <div class="text-center w-full mt-12">
        <p class="w-full text-center text-primary text-sm mb-2">
          Don't have an account?
        </p>
        <RouterLink
          class="btn btn-primary btn-outline"
          :to="{ name: 'create-account' }"
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

          Create an Account
        </RouterLink>
      </div>
    </div>
  </div>
</template>
