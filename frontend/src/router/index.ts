import { createRouter, createWebHistory } from "vue-router";
import TodoItemView from "../todo/TodoItemView_OptionsAPI.vue";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/todo-item",
      name: "todo-item",
      component: TodoItemView,
    },
  ],
});

export default router;
