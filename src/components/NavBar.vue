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
    <RouterLink class="btn btn-primary btn-xs" :to="{ name: 'user-settings' }">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-4 h-4 mr-2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      Account
    </RouterLink>
  </nav>
</template>
