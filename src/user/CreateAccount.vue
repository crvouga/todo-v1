<script lang="ts">
import { defineComponent } from "vue";

type Data = {
  emailAddress: string;
  password: string;
  passwordVisibility: "Hidden" | "Showing";
  status:
    | { type: "NotAsked" }
    | { type: "Loading" }
    | { type: "Err"; error: string }
    | { type: "Ok"; value: string };
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
  mounted() {
    console.log("login vue");
  },
  methods: {
    togglePasswordVisibility() {
      this.passwordVisibility =
        this.passwordVisibility === "Showing" ? "Hidden" : "Showing";
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
      <label class="font-bold mb-1" for="emailAddressInput">
        Email Address
      </label>
      <input
        type="email"
        id="emailAddressInput"
        class="input input-primary w-full mb-4"
      />

      <label class="font-bold mb-1" for="passwordInput"> Password </label>
      <input
        :type="passwordVisibility === 'Showing' ? 'text' : 'password'"
        id="passwordInput"
        class="input input-primary w-full mb-2"
      />
      <button
        class="btn btn-primary ml-auto btn-xs btn-outline mb-6"
        @click="togglePasswordVisibility"
      >
        {{
          passwordVisibility === "Showing" ? "Hide Password" : "Show Password"
        }}
      </button>

      <button class="btn btn-primary w-full">Create New Account</button>

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
