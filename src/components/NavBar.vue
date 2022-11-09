<script lang="ts">
import { defineComponent } from "vue";
import { toAvatarUrl } from "../user/avatar";
import { userStore } from "../user/user-store";
import Spinner from "./Spinner.vue";

export default defineComponent({
  setup() {
    return {
      toAvatarUrl,
    };
  },
  computed: {
    currentUser() {
      if (userStore.currentUser.type !== "LoggedIn") {
        return { type: "Loading" } as const;
      }
      return userStore.currentUser.status;
    },
  },
  components: { Spinner },
});
</script>
<template>
  <nav class="w-full flex items-center px-4 py-2">
    <div class="flex-1">
      <RouterLink
        :to="{ name: 'home' }"
        class="font-black text-transparent text-4xl bg-clip-text bg-gradient-to-b from-purple-500 to-purple-800 cursor-pointer hover:opacity-75 active:opacity-50"
      >
        todo
      </RouterLink>
    </div>

    <Spinner child-class="w-12" v-if="currentUser.type === 'Loading'" />

    <p class="font-bold text-red-500" v-if="currentUser.type === 'Err'">
      Error
    </p>

    <RouterLink v-if="currentUser.type === 'Ok'" :to="{ name: 'user-account' }">
      <div class="avatar">
        <div class="rounded w-12">
          <img
            :src="toAvatarUrl({ avatarSeed: currentUser.user.avatarSeed })"
          />
        </div>
      </div>
    </RouterLink>
  </nav>
</template>
