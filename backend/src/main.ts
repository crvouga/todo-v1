import express from "express";
import cors from "cors";
import {
  endpoints,
  TodoItemDeleteParams,
  TodoItemGot,
  TodoItem,
  TodoItemPatchParams,
  TodoItemPatch,
  TodoItemGetParams,
  sorter,
  filterer,
} from "./shared";
import { v4 } from "uuid";

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

const initial: TodoItem[] = [];

for (let i = 1; i <= 10; i++) {
  const offset = i * 1000 * 60;
  initial.push({
    createdAt: new Date(Date.now() - offset),
    id: v4(),
    isCompleted: Math.random() < 0.2,
    text: `Item ${i}`,
  });
}

const todoItemMap = new Map<string, TodoItem>(
  initial.map((item) => [item.id, item])
);

const duration = 500;

app.post(endpoints["/todo-item"], async (req, res) => {
  const result = TodoItem.safeParse(req.body);

  if (!result.success) {
    res.status(400).json(result.error).end();
    return;
  }

  const todoItemNew = result.data;

  todoItemMap.set(todoItemNew.id, todoItemNew);

  await timeout(duration);

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

  await timeout(duration);

  res.status(201).end();
});

app.patch(endpoints["/todo-item"], async (req, res) => {
  const params = TodoItemPatchParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json(params.error).end();
    return;
  }

  const patch = TodoItemPatch.safeParse(req.body);

  if (!patch.success) {
    res.status(400).json(patch.error).end();
    return;
  }

  const item = todoItemMap.get(params.data.itemId);

  if (!item) {
    res.status(404).end();
    return;
  }

  const itemNew: TodoItem = {
    ...item,
    ...patch.data,
  };

  todoItemMap.set(itemNew.id, itemNew);

  await timeout(1000 / 3);

  res.status(204).end();
});

app.get(endpoints["/todo-item"], async (req, res) => {
  const parsed = TodoItemGetParams.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json(parsed.error).end();
    return;
  }

  const params = parsed.data;

  const items = Array.from(todoItemMap.values())
    .filter(filterer({ filter: params.filter }))
    .sort(sorter({ sort: params.sort }));

  const json: TodoItemGot = {
    items,
  };

  await timeout(duration);

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
