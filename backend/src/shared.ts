/* 


keeping frontend/src/shared.ts and backend/src/shared.ts


*/

import { z, type SafeParseError } from "zod";

//
//
//

export const endpoints = {
  "/todo-item": "/api/todo-item",
} as const;

export type Endpoints = typeof endpoints;

//
//
//

const DateSchema = z.preprocess((arg) => {
  if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
}, z.date());

export const TodoItem = z.object({
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

//
//
//

export const TodoItemPatchParams = z.object({
  itemId: z.string(),
});
export type TodoItemPatchParams = z.infer<typeof TodoItemPatchParams>;
export const TodoItemPatch = TodoItem.partial();
export type TodoItemPatch = z.infer<typeof TodoItemPatch>;

//
//
//
// Helpers
//
//
//

export const formatError = <Input>(error: SafeParseError<Input>): string => {
  return error.error.issues.map((i) => i.message).join(",");
};
