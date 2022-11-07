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
    <h1 class="text-7xl font-bold mb-8 w-full text-center text-primary mt-12">
      todo
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

      <button class="btn btn-primary w-full">Login</button>

      <div class="text-center w-full mt-12">
        <p class="w-full text-center text-primary text-sm mb-2">
          Don't have an account?
        </p>
        <RouterLink
          class="btn btn-primary btn-outline"
          :to="{ name: 'create-account' }"
        >
          Create an Account
        </RouterLink>
      </div>
    </div>
  </div>
</template>
