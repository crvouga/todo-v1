import {
  endpoints,
  TodoItem,
  TodoItemDeleteParams,
  TodoItemGetParams,
  TodoItemGot,
  type TodoItemPatch,
  type TodoItemPatchParams,
} from "@/todo-list/todo-list-shared";
import Api from "@/api";
import { formatError, Err, Ok, type Result } from "@/utils";
import { v4 } from "uuid";

export const patch = async ({
  params,
  body,
}: {
  params: TodoItemPatchParams;
  body: TodoItemPatch;
}): Promise<Result<string, null>> => {
  const patched = await Api.patch({
    endpoint: endpoints["/todo-item"],
    params,
    body: body,
  });

  if (patched.type === "Err") {
    return Err(patched.error);
  }

  return Ok(null);
};

export const delete_ = async (
  params: TodoItemDeleteParams
): Promise<Result<string, null>> => {
  const parsed = TodoItemDeleteParams.safeParse(params);

  if (!parsed.success) {
    return Err(formatError(parsed));
  }

  const deleted = await Api.delete({
    endpoint: endpoints["/todo-item"],
    params: parsed.data,
  });

  if (deleted.type === "Err") {
    return Err(deleted.error);
  }

  return Ok(null);
};

export const get = async (
  dirty: TodoItemGetParams
): Promise<Result<string, TodoItemGot>> => {
  const parsedParams = TodoItemGetParams.safeParse(dirty);

  if (!parsedParams.success) {
    return Err(formatError(parsedParams));
  }

  const got = await Api.get({
    endpoint: endpoints["/todo-item"],
    params: parsedParams.data,
  });

  if (got.type === "Err") {
    return Err(got.error);
  }

  const parsed = TodoItemGot.safeParse(got.json);

  if (!parsed.success) {
    return Err(formatError(parsed));
  }

  return Ok(parsed.data);
};

export const post = async ({
  listId,
  text,
}: {
  listId: string;
  text: string;
}): Promise<Result<string, TodoItem>> => {
  const dirty: TodoItem = {
    listId,
    createdAt: new Date(),
    id: v4(),
    isCompleted: false,
    text,
  };

  const parsed = TodoItem.safeParse(dirty);

  if (!parsed.success) {
    return Err(formatError(parsed));
  }

  const posted = await Api.post({
    endpoint: endpoints["/todo-item"],
    json: parsed.data,
  });

  if (posted.type === "Err") {
    return Err(posted.error);
  }

  return Ok(parsed.data);
};

export default {
  patch,
  delete_,
  post,
  get,
};
