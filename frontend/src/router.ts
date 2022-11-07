import { createRouter, createWebHistory } from "vue-router";
import TodoItemView from "./todo-item/TodoItemView_OptionsAPI.vue";
import TodoListView from "./todo-list/TodoListView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "todo-list-all",
      component: TodoListView,
    },
    {
      path: "/todo-list/:listId",
      name: "todo-list-single",
      component: TodoItemView,
    },
  ],
});

export const routes = {
  home: () => ``,
  todoList: ({ listId }: { listId: string }) => `/todo-list/${listId}`,
};

export default router;
