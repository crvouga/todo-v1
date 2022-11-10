import { Err, Ok } from "../../utils";
import {
  filterer,
  listSorter,
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
      const items = Array.from(itemMap.values()).filter(
        (item) => item.listId === params.id
      );
      for (const item of items) {
        itemMap.delete(item.id);
      }
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

    findManyWithStats: async (params) => {
      const filtered = Array.from(listMap.values()).filter(
        (list) => list.userId === params.userId
      );
      const lists = filtered
        .sort(listSorter({ sort: params.sort }))
        .map((list) => {
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

      return Ok({ items: lists, totalCount: filtered.length });
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

  deleteByUserId: async (params) => {
    const lists = Array.from(listMap.values()).filter(
      (list) => list.userId === params.userId
    );

    for (const list of lists) {
      listMap.delete(list.id);
    }

    const items = Array.from(itemMap.values()).filter((item) =>
      lists.some((list) => item.listId === list.id)
    );

    for (const item of items) {
      itemMap.delete(item.id);
    }

    return Ok(null);
  },
};

export default repo;
