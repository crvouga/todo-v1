import express from "express";
import cors from "cors";
import {
  endpoints,
  TodoItemDeleteParams,
  TodoItemsGot,
  TodoItem,
} from "./shared";

//
//
//
// Server
//
//
//

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ todoItems: Object.fromEntries(todoItemMap.entries()) });
});

//
//
//
// Todo Items
//
//
//

const todoItemMap = new Map<string, TodoItem>();

app.post(endpoints["/todo-item"], async (req, res) => {
  const result = TodoItem.safeParse(req.body);

  if (!result.success) {
    res.status(400).json(result.error).end();
    return;
  }

  const todoItemNew = result.data;

  todoItemMap.set(todoItemNew.id, todoItemNew);

  await timeout(2000);

  res.status(201).end();
});

app.delete(endpoints["/todo-item"], async (req, res) => {
  const result = TodoItemDeleteParams.safeParse(req.query);

  if (!result.success) {
    res.status(400).json(result.error).end();
    return;
  }

  const itemId = result.data.itemId;

  todoItemMap.delete(itemId);

  await timeout(2000);

  res.status(201).end();
});

app.get(endpoints["/todo-item"], async (_req, res) => {
  const json: TodoItemsGot = {
    items: Array.from(todoItemMap.values()),
  };

  await timeout(2000);

  res.json(json);
});

//
//
//
// Run
//
//
//

const port = Number(process.env.PORT) || Number(process.env.port) || 5000;

app.listen(port, () => {
  console.clear();
  console.log(`Server started. http://localhost:${port}`);
});

//
//
//
// Helpers
//
//
//

const timeout = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
