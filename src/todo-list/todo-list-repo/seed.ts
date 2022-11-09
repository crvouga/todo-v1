import { v4 } from "uuid";
import type { TodoItem, TodoList } from "../todo-list-shared";

const titles = ["List A", "List B", "List C", "List D", "List E"];
const texts = [
  "Learn Vue.js",
  "Learn Vue.js composition API",
  "Go to the gym",
  "Hook up dynamodb",
  "Go to the store",
  "Add user auth",
];

export const getSeedData = ({ userId }: { userId: string }) => {
  const lists: TodoList[] = [];
  const items: TodoItem[] = [];

  titles.forEach((title, listIndex) => {
    const offset = listIndex * 1000 * 60;

    const list: TodoList = {
      userId,
      createdAt: new Date(Date.now() - offset),
      id: v4(),
      title,
    };

    lists.push(list);

    texts.forEach((text, i) => {
      const offset = i * 1000 * 60;
      const item: TodoItem = {
        listId: list.id,
        createdAt: new Date(Date.now() - offset),
        id: v4(),
        isCompleted: false,
        text: text,
      };
      items.push(item);
    });
  });

  return { lists, items };
};
