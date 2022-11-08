import type { Application } from "express";
import { StatusCode } from "../utils";
import { getSeedData } from "./todo-list-repo/seed";
import type { Repo } from "./todo-list-repo/todo-list-repo";
import {
  applyPatch,
  applyPatchTodoList,
  endpoints,
  TodoItem,
  TodoItemDeleteParams,
  TodoItemGetParams,
  TodoItemGot,
  TodoItemPatch,
  TodoItemPatchParams,
  TodoList,
  TodoListDeleteParams,
  TodoListGetOneParams,
  TodoListGetParams,
  TodoListGot,
  TodoListPatchBody,
  TodoListPatchParams,
  TodoSeedPostBody,
} from "./todo-list-shared";

const duration = 500;

export const useTodoListApi = ({
  repo,
  app,
}: {
  repo: Repo;
  app: Application;
}) => {
  //
  //
  // Todo Items
  //
  //

  app.post(endpoints["/todo-item"], async (req, res) => {
    const parsed = TodoItem.safeParse(req.body);

    if (!parsed.success) {
      res.status(StatusCode.BadRequest).json(parsed.error).end();
      return;
    }

    const todoItemNew = parsed.data;

    const inserted = await repo.item.insertOne({ item: todoItemNew });

    if (inserted.type === "Err") {
      res
        .status(StatusCode.ServerError)
        .json({ message: inserted.error })
        .end();
      return;
    }

    res.status(StatusCode.Created).end();
  });

  app.delete(endpoints["/todo-item"], async (req, res) => {
    const result = TodoItemDeleteParams.safeParse(req.query);

    if (!result.success) {
      res.status(StatusCode.BadRequest).json(result.error).end();
      return;
    }

    const itemId = result.data.itemId;

    const deleted = await repo.item.deleteById({ id: itemId });

    if (deleted.type === "Err") {
      res.status(StatusCode.ServerError).json({ message: deleted.error }).end();
      return;
    }

    res.status(StatusCode.Ok).end();
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

    const found = await repo.item.findOneById({ id: params.data.itemId });

    if (found.type === "Err") {
      res.status(StatusCode.ServerError).json({ message: found.error }).end();
      return;
    }

    if (!found.data) {
      res.status(StatusCode.NotFound).end();
      return;
    }

    const patched = applyPatch(found.data, patch.data);

    const updated = await repo.item.updateOne({
      updated: patched,
    });

    if (updated.type === "Err") {
      res.status(StatusCode.ServerError).json({ message: updated.error }).end();
      return;
    }
    res.status(StatusCode.NoContent).end();
  });

  app.get(endpoints["/todo-item"], async (req, res) => {
    const parsed = TodoItemGetParams.safeParse(req.query);

    if (!parsed.success) {
      res.status(StatusCode.BadRequest).json(parsed.error).end();
      return;
    }

    const params = parsed.data;

    const found = await repo.item.findManyWhere({
      listId: parsed.data.listId,
      filter: params.filter,
      sort: params.sort,
    });

    if (found.type === "Err") {
      res.status(StatusCode.ServerError).json({ message: found.error }).end();
      return;
    }

    const json: TodoItemGot = {
      items: found.data,
    };

    res.json(json);
  });

  //
  //
  //
  // Todo List
  //
  //
  //

  app.get(endpoints["/todo-list-one"], async (req, res) => {
    const parsed = TodoListGetOneParams.safeParse(req.query);

    if (!parsed.success) {
      res.status(StatusCode.BadRequest).json(parsed.error).end();
      return;
    }

    const found = await repo.list.findOneById({ id: parsed.data.listId });

    if (found.type === "Err") {
      res.status(StatusCode.ServerError).json({ message: found.error }).end();
      return;
    }

    if (!found.data) {
      res.status(StatusCode.NotFound).end();
      return;
    }

    res.json(found.data);
  });

  app.get(endpoints["/todo-list"], async (req, res) => {
    const parsed = TodoListGetParams.safeParse(req.query);

    if (!parsed.success) {
      res.status(StatusCode.BadRequest).json(parsed.error);
      return;
    }

    const found = await repo.list.findManyWithStats(parsed.data);

    if (found.type === "Err") {
      res.status(StatusCode.ServerError).json({ message: found.error });
      return;
    }

    const json: TodoListGot = {
      items: found.data,
    };

    res.json(json);
  });

  app.delete(endpoints["/todo-list"], async (req, res) => {
    const parsed = TodoListDeleteParams.safeParse(req.query);

    if (!parsed.success) {
      res.status(StatusCode.BadRequest).json(parsed.error).end();
      return;
    }

    const deleted = await repo.list.deleteById({ id: parsed.data.listId });

    if (deleted.type === "Err") {
      res.status(StatusCode.ServerError).json({ message: deleted.error });
      return;
    }

    res.status(StatusCode.Ok).end();
  });

  app.post(endpoints["/todo-list"], async (req, res) => {
    const parsed = TodoList.safeParse(req.body);

    if (!parsed.success) {
      res.status(StatusCode.BadRequest).json(parsed.error).end();
      return;
    }

    const inserted = await repo.list.insertOne({ list: parsed.data });

    if (inserted.type === "Err") {
      res.status(StatusCode.ServerError).json({ message: inserted.error });
      return;
    }

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

    const existing = await repo.list.findOneById({
      id: parsedParams.data.listId,
    });

    if (existing.type === "Err") {
      res.status(StatusCode.NotFound).end();
      return;
    }

    if (!existing.data) {
      res.status(StatusCode.NotFound).end();
      return;
    }

    const patched = applyPatchTodoList(existing.data, parsedBody.data);

    repo.list.updateOne({ updated: patched });

    res.status(StatusCode.Ok).end();
  });

  app.post(endpoints["/todo-list-seed"], async (req, res) => {
    const parsed = TodoSeedPostBody.safeParse(req.body);

    if (!parsed.success) {
      res.status(StatusCode.BadRequest).json(parsed.error);
      return;
    }

    const seedData = getSeedData({ userId: parsed.data.userId });

    // todo move the following into repo layer
    for (const list of seedData.lists) {
      const inserted = await repo.list.insertOne({ list });
      if (inserted.type === "Err") {
        console.error(inserted.error);
      }
    }
    for (const item of seedData.items) {
      const inserted = await repo.item.insertOne({ item });
      if (inserted.type === "Err") {
        console.error(inserted.error);
      }
    }

    res.status(StatusCode.Created).end();
  });
};
