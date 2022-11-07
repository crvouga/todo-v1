import { createRouter, createWebHistory } from "vue-router";
import TodoItemView from "./todo-item/TodoItemView_OptionsAPI.vue";
import TodoListView from "./todo-list/TodoListView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "todo-list",
      component: TodoListView,
    },
    {
      path: "/todo-item",
      name: "todo-item",
      component: TodoItemView,
    },
  ],
});

export default router;
