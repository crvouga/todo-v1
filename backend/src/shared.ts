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

export const TodoItemFilter = z.union([
  z.literal("All"),
  z.literal("Active"),
  z.literal("Completed"),
]);
export type TodoItemFilter = z.infer<typeof TodoItemFilter>;

export const TodoItemSort = z.union([
  z.literal("OldestFirst"),
  z.literal("NewestFirst"),
]);
export type TodoItemSort = z.infer<typeof TodoItemSort>;

//
//
//

export const TodoItemsGetParams = z.object({
  sort: TodoItemSort,
});
export type TodoItemsGetParams = z.infer<typeof TodoItemsGetParams>;
export const TodoItemsGot = z.object({
  items: z.array(TodoItem),
});
export type TodoItemsGot = z.infer<typeof TodoItemsGot>;

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
