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
  applyPatch,
  TodoList,
  TodoListGot,
  TodoListDeleteParams,
  TodoListPatchParams,
  TodoListPatchBody,
  applyPatchTodoList,
} from "./shared";
import { v4 } from "uuid";
import morgan from "morgan";

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
app.use(morgan("tiny"));

app.get("/", (req, res) => {
  res.json({
    todoItems: Object.fromEntries(todoItemMap.entries()),
    todoLists: Object.fromEntries(todoListMap.entries()),
  });
});

//
//
//
// Data
//
//
//

const todoItemMap = new Map<string, TodoItem>();
const todoListMap = new Map<string, TodoList>();

//
// init
//

const titles = ["List A", "List B", "List C"];
const texts = [
  "Learn Vue.js",
  "Learn Vue.js composition API",
  "Go to the gym",
  "Hook up dynamodb",
  "Go to the store",
  "Add user auth",
];

titles.forEach((title) => {
  const list: TodoList = {
    createdAt: new Date(),
    id: v4(),
    title,
  };

  todoListMap.set(list.id, list);

  texts.forEach((text, i) => {
    const offset = i * 1000 * 60;
    const item: TodoItem = {
      listId: list.id,
      createdAt: new Date(Date.now() - offset),
      id: v4(),
      isCompleted: false,
      text: text,
    };
    todoItemMap.set(item.id, item);
  });
});

//
//
//
//
//

const StatusCode = {
  Ok: 200,
  Created: 201,
  BadRequest: 400,
  NotFound: 404,
};

//
//
//
// Todo Items
//
//
//

const duration = 500;

app.post(endpoints["/todo-item"], async (req, res) => {
  const result = TodoItem.safeParse(req.body);

  if (!result.success) {
    res.status(StatusCode.BadRequest).json(result.error).end();
    return;
  }

  const todoItemNew = result.data;

  todoItemMap.set(todoItemNew.id, todoItemNew);

  await timeout(duration);

  res.status(StatusCode.Created).end();
});

app.delete(endpoints["/todo-item"], async (req, res) => {
  const result = TodoItemDeleteParams.safeParse(req.query);

  if (!result.success) {
    res.status(StatusCode.BadRequest).json(result.error).end();
    return;
  }

  const itemId = result.data.itemId;

  todoItemMap.delete(itemId);

  await timeout(duration);

  res.status(StatusCode.Created).end();
});

app.patch(endpoints["/todo-item"], async (req, res) => {
  const params = TodoItemPatchParams.safeParse(req.query);
  if (!params.success) {
    res.status(StatusCode.BadRequest).json(params.error).end();
    return;
  }

  const patch = TodoItemPatch.safeParse(req.body);

  if (!patch.success) {
    res.status(StatusCode.BadRequest).json(patch.error).end();
    return;
  }

  const item = todoItemMap.get(params.data.itemId);

  if (!item) {
    res.status(StatusCode.NotFound).end();
    return;
  }

  const patched = applyPatch(item, patch.data);

  todoItemMap.set(patched.id, patched);

  await timeout(1000 / 3);

  res.status(204).end();
});

app.get(endpoints["/todo-item"], async (req, res) => {
  const parsed = TodoItemGetParams.safeParse(req.query);

  if (!parsed.success) {
    res.status(StatusCode.BadRequest).json(parsed.error).end();
    return;
  }

  const params = parsed.data;

  const items = Array.from(todoItemMap.values())
    .filter(filterer({ filter: params.filter }))
    .filter((item) => item.listId === parsed.data.listId)
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
// Todo List
//
//
//

app.get(endpoints["/todo-list"], async (req, res) => {
  const lists = Array.from(todoListMap.values());
  const json: TodoListGot = {
    items: lists.map((list) => {
      const items = Array.from(todoItemMap.values()).filter(
        (item) => item.listId === list.id
      );
      const activeCount = items.filter((item) => !item.isCompleted).length;
      const completedCount = items.filter((item) => item.isCompleted).length;
      return {
        ...list,
        activeCount,
        completedCount,
      };
    }),
  };
  await timeout(duration);
  res.json(json);
});

app.delete(endpoints["/todo-list"], async (req, res) => {
  const parsed = TodoListDeleteParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(StatusCode.BadRequest).json(parsed.error).end();
    return;
  }
  todoListMap.delete(parsed.data.listId);
  await timeout(duration);
  res.status(StatusCode.Ok).end();
});

app.post(endpoints["/todo-list"], async (req, res) => {
  const parsed = TodoList.safeParse(req.body);
  if (!parsed.success) {
    res.status(StatusCode.BadRequest).json(parsed.error).end();
    return;
  }
  todoListMap.set(parsed.data.id, parsed.data);
  await timeout(duration);
  res.status(StatusCode.Created).end();
});

app.patch(endpoints["/todo-list"], async (req, res) => {
  const parsedParams = TodoListPatchParams.safeParse(req.query);
  if (!parsedParams.success) {
    res.status(StatusCode.BadRequest).json(parsedParams.error).end();
    return;
  }
  const parsedBody = TodoListPatchBody.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(StatusCode.BadRequest).json(parsedBody.error).end();
    return;
  }
  const existing = todoListMap.get(parsedParams.data.itemId);
  if (!existing) {
    res.status(StatusCode.NotFound).end();
    return;
  }
  const patched = applyPatchTodoList(existing, parsedBody.data);
  todoListMap.set(patched.id, patched);
  await timeout(duration);
  res.status(StatusCode.Ok).end();
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
