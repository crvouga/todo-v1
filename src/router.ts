import { createRouter, createWebHistory } from "vue-router";
import TodoListAll from "./todo-list/TodoListAll.vue";
import TodoListSingle from "./todo-list/TodoListSingle.vue";
import TodoListSingleSettings from "./todo-list/TodoListSingleSettings.vue";
import CreateAccount from "./user/UserCreateAccount.vue";
import LoginView from "./user/UserLogin.vue";
import { fetchCurrentUser } from "./user/user-store";
import UserAccount from "./user/UserAccount.vue";

const router = createRouter({
  // @ts-ignore
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/create-account",
      name: "create-account",
      component: CreateAccount,
    },
    {
      path: "/user-account",
      name: "user-account",
      component: UserAccount,
    },
    {
      path: "/",
      name: "home",
      component: TodoListAll,
    },
    {
      path: "/todo-list-all",
      name: "todo-list-all",
      component: TodoListAll,
    },
    {
      path: "/todo-list/:listId",
      name: "todo-list-single",
      component: TodoListSingle,
    },
    {
      path: "/todo-list/:listId/settings",
      name: "todo-list-single-settings",
      component: TodoListSingleSettings,
    },
  ],
});

//
// Authentication Guard
//

router.beforeEach(async (to) => {
  console.log(`Navigation to: ${to}`, to);

  const got = await fetchCurrentUser();
  console.log("Current user status:", got.type);

  if (got.type === "Ok") {
    console.log("User is authenticated, allowing navigation");
    return true;
  }

  if (to.name === "create-account") {
    console.log("Allowing navigation to create-account page");
    return true;
  }

  if (to.name !== "login") {
    console.log("User not authenticated, redirecting to login page");
    return { name: "login" };
  }

  console.log("Allowing navigation to login page");
  return true;
});

export default router;
