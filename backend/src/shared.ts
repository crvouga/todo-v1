/* 



Notice! 
Keep this in sync between frontend and backend



*/

import { z } from "zod";

export const endpoints = {
  postTodoItem: "/api/todo",
};

export const TodoItem = z.object({
  id: z.string().uuid(),
  text: z.string().min(1).max(100),
});

export type TodoItem = z.infer<typeof TodoItem>;
