import { Err, Ok } from "../../utils";
import { v4 } from "uuid";
import {
  filterer,
  sorter,
  TodoListStats,
  type TodoItem,
  type TodoList,
} from "../todo-list-shared";
import type { Repo } from "./todo-list-repo";

const itemMap = new Map<string, TodoItem>();
const listMap = new Map<string, TodoList>();

const repo: Repo = {
  item: {
    insertOne: async (params) => {
      itemMap.set(params.item.id, params.item);
      return Ok(null);
    },
    deleteById: async (params) => {
      itemMap.delete(params.id);
      return Ok(null);
    },
    findOneById: async (params) => {
      const found = itemMap.get(params.id);
      if (!found) {
        return Ok(null);
      }
      return Ok(found);
    },
    updateOne: async (params) => {
      const found = itemMap.get(params.updated.id);
      if (!found) {
        return Err("item does not exists");
      }
      itemMap.set(params.updated.id, params.updated);
      return Ok(null);
    },
    findManyWhere: async (params) => {
      const found = Array.from(itemMap.values())
        .filter(filterer({ filter: params.filter }))
        .filter((item) => item.listId === params.listId)
        .sort(sorter({ sort: params.sort }));

      return Ok(found);
    },
  },
  list: {
    deleteById: async (params) => {
      listMap.delete(params.id);
      return Ok(null);
    },
    findOneById: async (params) => {
      const found = listMap.get(params.id);

      if (!found) {
        return Ok(null);
      }

      return Ok(found);
    },

    findManyWithStats: async () => {
      const lists = Array.from(listMap.values()).map((list) => {
        const stats = Array.from(itemMap.values()).reduce<TodoListStats>(
          (stats, item) => {
            if (item.listId !== list.id) {
              return stats;
            }

            if (item.isCompleted) {
              return { ...stats, completedCount: stats.completedCount + 1 };
            }

            return { ...stats, activeCount: stats.activeCount + 1 };
          },
          {
            activeCount: 0,
            completedCount: 0,
          }
        );

        return { ...list, ...stats };
      });

      return Ok(lists);
    },

    insertOne: async (params) => {
      listMap.set(params.list.id, params.list);
      return Ok(null);
    },
    updateOne: async ({ updated }) => {
      const found = listMap.get(updated.id);

      if (!found) {
        return Err("item does not exists");
      }

      listMap.set(updated.id, updated);

      return Ok(null);
    },
  },
};

//
// initialize data
//
const titles = ["List A", "List B", "List C", "List D", "List E"];
const texts = [
  "Learn Vue.js",
  "Learn Vue.js composition API",
  "Go to the gym",
  "Hook up dynamodb",
  "Go to the store",
  "Add user auth",
];

export const seed = ({ userId }: { userId: string }) => {
  titles.forEach((title) => {
    const list: TodoList = {
      userId,
      createdAt: new Date(),
      id: v4(),
      title,
    };

    listMap.set(list.id, list);

    texts.forEach((text, i) => {
      const offset = i * 1000 * 60;
      const item: TodoItem = {
        listId: list.id,
        createdAt: new Date(Date.now() - offset),
        id: v4(),
        isCompleted: false,
        text: text,
      };
      itemMap.set(item.id, item);
    });
  });
};

export default repo;
