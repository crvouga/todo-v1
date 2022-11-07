import Api from "@/api";
import {
  formatError,
  TodoList,
  TodoListDeleteParams,
  TodoListGot,
  TodoListPatchBody,
  TodoListPatchParams,
} from "@/todo-list/todo-list-shared";
import { Err, Ok, type Result } from "@/utils";
import { v4 } from "uuid";

export const post = async ({
  title,
}: {
  title: string;
}): Promise<Result<string, TodoList>> => {
  const dirty: TodoList = {
    createdAt: new Date(),
    id: v4(),
    title,
  };

  const parsed = TodoList.safeParse(dirty);

  if (!parsed.success) {
    return Err(formatError(parsed));
  }

  const result = await Api.post({
    endpoint: "/todo-list",
    json: parsed.data,
  });

  if (result.type === "Err") {
    return Err(result.error);
  }

  return Ok(parsed.data);
};

export const getAll = async (): Promise<Result<string, TodoListGot>> => {
  const result = await Api.get({
    endpoint: "/todo-list",
    params: {},
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
    endpoint: "/todo-list",
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
    endpoint: "/todo-list",
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
    endpoint: "/todo-list-one",
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
