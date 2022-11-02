/* 


keeping frontend/src/shared.ts and frontend/src/shared.ts


*/

import { z, type SafeParseError } from "zod";

export const endpoints = {
  "/todo-item": "/api/todo-item",
} as const;

export type Endpoints = typeof endpoints;

export const TodoItemStatus = z.discriminatedUnion("type", [
  z.object({ type: z.literal("Active") }),
  z.object({ type: z.literal("Completed") }),
]);

export type TodoItemStatus = z.infer<typeof TodoItemStatus>;

export const TodoItem = z.object({
  id: z.string().uuid(),
  text: z.string().min(4).max(100),
  status: TodoItemStatus,
});

export type TodoItem = z.infer<typeof TodoItem>;

export const GetTodoItemsRes = z.object({
  items: z.array(TodoItem),
});

export type GetTodoItemsRes = z.infer<typeof GetTodoItemsRes>;

export const formatError = <Input>(error: SafeParseError<Input>): string => {
  return error.error.issues.map((i) => i.message).join(",");
};
