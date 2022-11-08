import { z } from "zod";

//
//
//

export const endpoints = {
  "/todo-item": "/api/todo-item",
  "/todo-list": "/api/todo-list",
  // todo this should be "/todo-list/:listId" but whatever
  "/todo-list-one": "/api/todo-list-one",

  // this isn't very restful :|
  "/todo-list-seed": "/api/todo-list-seed",
} as const;

export type Endpoints = typeof endpoints;

//
//
//

const DateSchema = z.preprocess((arg) => {
  if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
}, z.date());

export const TodoItem = z.object({
  listId: z.string().uuid(),
  id: z.string().uuid(),
  text: z.string().min(4).max(100),
  isCompleted: z.boolean(),
  createdAt: DateSchema,
});
export type TodoItem = z.infer<typeof TodoItem>;

//
//
//

export const TodoItemFilter = z.union([
  z.literal("All"),
  z.literal("Active"),
  z.literal("Completed"),
]);
export type TodoItemFilter = z.infer<typeof TodoItemFilter>;

export const allFilters: TodoItemFilter[] = ["All", "Active", "Completed"];

export const filterer =
  ({ filter }: { filter: TodoItemFilter }) =>
  (item: TodoItem) => {
    switch (filter) {
      case "All": {
        return true;
      }
      case "Completed": {
        return item.isCompleted;
      }
      case "Active": {
        return !item.isCompleted;
      }
    }
  };

//
//
//

export const TodoItemSort = z.union([
  z.literal("OldestFirst"),
  z.literal("NewestFirst"),
]);
export type TodoItemSort = z.infer<typeof TodoItemSort>;

export const sorter =
  ({ sort }: { sort: TodoItemSort }) =>
  (a: TodoItem, b: TodoItem) => {
    switch (sort) {
      case "NewestFirst": {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }

      case "OldestFirst": {
        return a.createdAt.getTime() - b.createdAt.getTime();
      }
    }
  };

export const allSorts: TodoItemSort[] = ["NewestFirst", "OldestFirst"];

export const formatSort = (sort: TodoItemSort): string => {
  switch (sort) {
    case "NewestFirst": {
      return "Newest First";
    }

    case "OldestFirst": {
      return "Oldest First";
    }
  }
};

//
//
//

export const TodoItemGetParams = z.object({
  listId: z.string().uuid(),
  sort: TodoItemSort,
  filter: TodoItemFilter,
});
export type TodoItemGetParams = z.infer<typeof TodoItemGetParams>;

export const TodoItemGot = z.object({
  items: z.array(TodoItem),
});
export type TodoItemGot = z.infer<typeof TodoItemGot>;

//
//
//

export const TodoItemDeleteParams = z.object({
  itemId: z.string(),
});
export type TodoItemDeleteParams = z.infer<typeof TodoItemDeleteParams>;

//
//
//

export const TodoItemPatchParams = z.object({
  itemId: z.string(),
});
export type TodoItemPatchParams = z.infer<typeof TodoItemPatchParams>;
export const TodoItemPatch = TodoItem.partial();
export type TodoItemPatch = z.infer<typeof TodoItemPatch>;

export const applyPatch = (item: TodoItem, patch: TodoItemPatch): TodoItem => {
  return {
    listId: item.listId,
    id: item.id,
    createdAt: patch.createdAt === undefined ? item.createdAt : patch.createdAt,
    isCompleted:
      patch.isCompleted === undefined ? item.isCompleted : patch.isCompleted,
    text: patch.text === undefined ? item.text : patch.text,
  };
};

//
//
//

export const TodoList = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(4).max(100),
  createdAt: DateSchema,
});
export type TodoList = z.infer<typeof TodoList>;

//
//
//

export const TodoListGetOneParams = z.object({
  listId: z.string().uuid(),
});

export const TodoListStats = z.object({
  activeCount: z.number(),
  completedCount: z.number(),
});
export type TodoListStats = z.infer<typeof TodoListStats>;

export const TodoListGotItem = z.intersection(TodoList, TodoListStats);
export type TodoListGotItem = z.infer<typeof TodoListGotItem>;

export const TodoListGetParams = z.object({
  userId: z.string().uuid(),
});
export type TodoListGetParams = z.infer<typeof TodoListGetParams>;

export const TodoListGot = z.object({
  items: z.array(TodoListGotItem),
});
export type TodoListGot = z.infer<typeof TodoListGot>;

export const TodoListDeleteParams = z.object({
  listId: z.string(),
});
export type TodoListDeleteParams = z.infer<typeof TodoListDeleteParams>;

export const TodoListPatchParams = z.object({
  listId: z.string(),
});
export type TodoListPatchParams = z.infer<typeof TodoListPatchParams>;
export const TodoListPatchBody = TodoList.partial();
export type TodoListPatchBody = z.infer<typeof TodoListPatchBody>;

export const applyPatchTodoList = (
  list: TodoList,
  patch: TodoListPatchBody
): TodoList => {
  return {
    userId: list.userId,
    id: list.id,
    createdAt: list.createdAt,
    title: patch.title === undefined ? list.title : patch.title,
  };
};

export const TodoSeedPostBody = z.object({
  userId: z.string().uuid(),
});
export type TodoSeedPostBody = z.infer<typeof TodoSeedPostBody>;
