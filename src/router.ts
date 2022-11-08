import { createRouter, createWebHistory } from "vue-router";
import TodoListAll from "./todo-list/TodoListAll.vue";
import TodoListSingle from "./todo-list/TodoListSingle.vue";
import TodoListSingleSettings from "./todo-list/TodoListSingleSettings.vue";
import CreateAccount from "./user/UserCreateAccount.vue";
import LoginView from "./user/UserLogin.vue";
import { fetchCurrentUser } from "./user/user-store";
import UserAccount from "./user/UserAccount.vue";

const router = createRouter({
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
  const got = await fetchCurrentUser();

  if (got.type === "Ok") {
    return true;
  }

  if (to.name === "create-account") {
    return true;
  }

  if (to.name !== "login") {
    return { name: "login" };
  }

  return true;
});

export default router;
