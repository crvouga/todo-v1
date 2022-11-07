<script lang="ts">
import api from "@/api";
import { showToast } from "@/store";
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
      showToast({ type: "Success", title: "Created a new account." });
    },
  },
});
</script>
<template>
  <div class="w-full flex flex-col justify-center items-center">
    <h1 class="mt-12 text-primary px-4 font-bold text-4xl mb-6">
      Create New Account
    </h1>
    <div class="flex flex-col justify-center items-start w-full max-w-xs">
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
      <button
        class="btn btn-primary ml-auto btn-xs btn-outline mt-2"
        @click="togglePasswordVisibility"
      >
        {{
          passwordVisibility === "Showing" ? "Hide Password" : "Show Password"
        }}
      </button>

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
        class="btn btn-primary w-full mt-4"
        :class="{ loading: status.type === 'Loading' }"
        @click="post"
      >
        Create New Account
      </button>

      <div class="text-center w-full mt-12">
        <p class="w-full text-center text-primary text-sm mb-2">
          Already have an account?
        </p>
        <RouterLink class="btn btn-primary btn-outline" :to="{ name: 'login' }">
          Login
        </RouterLink>
      </div>
    </div>
  </div>
</template>
