import Api from "@/api";
import {
  endpoints,
  TodoList,
  TodoListDeleteParams,
  TodoListGetParams,
  TodoListGot,
  TodoListPatchBody,
  TodoListPatchParams,
} from "@/todo-list/todo-list-shared";
import { Err, formatError, Ok, type Result } from "@/utils";
import { v4 } from "uuid";

export const post = async ({
  userId,
  title,
}: {
  userId: string;
  title: string;
}): Promise<Result<string, TodoList>> => {
  const dirty: TodoList = {
    userId,
    createdAt: new Date(),
    id: v4(),
    title,
  };

  const parsed = TodoList.safeParse(dirty);

  if (!parsed.success) {
    return Err(formatError(parsed));
  }

  const result = await Api.post({
    endpoint: endpoints["/todo-list"],
    json: parsed.data,
  });

  if (result.type === "Err") {
    return Err(result.error);
  }

  return Ok(parsed.data);
};

export const getAll = async (
  dirty: TodoListGetParams
): Promise<Result<string, TodoListGot>> => {
  const result = await Api.get({
    endpoint: endpoints["/todo-list"],
    params: dirty,
  });

  if (result.type === "Err") {
    return Err(result.error);
  }

  const parsed = TodoListGot.safeParse(result.json);

  if (!parsed.success) {
    return Err(formatError(parsed));
  }

  return Ok(parsed.data);
};

export const delete_ = async (
  params: TodoListDeleteParams
): Promise<Result<string, undefined>> => {
  const parsed = TodoListDeleteParams.safeParse(params);

  if (!parsed.success) {
    return Err(formatError(parsed));
  }

  const result = await Api.delete({
    endpoint: endpoints["/todo-list"],
    params: parsed.data,
  });

  if (result.type === "Err") {
    return Err(result.error);
  }

  return Ok(undefined);
};

export const patch = async (
  params: TodoListPatchParams,
  body: TodoListPatchBody
): Promise<Result<string, undefined>> => {
  const result = await Api.patch({
    endpoint: endpoints["/todo-list"],
    params: params,
    body: body,
  });

  if (result.type === "Err") {
    return Err(result.error);
  }

  return Ok(undefined);
};

export const getOne = async (params: {
  listId: string;
}): Promise<Result<string, TodoList>> => {
  const result = await Api.get({
    endpoint: endpoints["/todo-list-one"],
    params,
  });

  if (result.type === "Err") {
    return Err(result.error);
  }

  const parsed = TodoList.safeParse(result.json);

  if (!parsed.success) {
    return Err(formatError(parsed));
  }

  return Ok(parsed.data);
};

export default { getAll, post, delete_, patch, getOne };
