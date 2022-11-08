import { createRouter, createWebHistory } from "vue-router";
import TodoListAll from "./todo-list/TodoListAll.vue";
import TodoListSingle from "./todo-list/TodoListSingle.vue";
import TodoListSingleSettings from "./todo-list/TodoListSingleSettings.vue";
import LoginView from "./user/UserLogin.vue";
import CreateAccount from "./user/UserCreateAccount.vue";
import userSessionApi from "./user/user-session-api";
import UserSettingsVue from "./user/UserSettings.vue";

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
      path: "/user-settings",
      name: "user-settings",
      component: UserSettingsVue,
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
  const result = await userSessionApi.get();

  if (result.type === "Ok") {
    return true;
  }

  const isAuthenticated = false;

  if (isAuthenticated) {
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
