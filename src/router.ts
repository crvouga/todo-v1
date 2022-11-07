import { createRouter, createWebHistory } from "vue-router";
import TodoListAll from "./todo-list/TodoListAll.vue";
import TodoListSingle from "./todo-list/TodoListSingle.vue";
import TodoListSingleSettings from "./todo-list/TodoListSingleSettings.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
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

export default router;
