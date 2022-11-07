import { createRouter, createWebHistory } from "vue-router";
import TodoListAll from "./todo-list/TodoListAll.vue";
import TodoListSingle from "./todo-list/TodoListSingle_OptionsAPI.vue";

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
  ],
});

export const routes = {
  home: () => ``,
  todoList: ({ listId }: { listId: string }) => `/todo-list/${listId}`,
};

export default router;
