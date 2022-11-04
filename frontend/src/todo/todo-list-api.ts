import Api from "@/api";
import { formatError, TodoList } from "@/shared";
import { Err, Ok, type Result } from "@/utils";
import { v4 } from "uuid";

export const post = async ({
  title,
}: {
  title: string;
}): Promise<Result<string, undefined>> => {
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

  return Ok(undefined);
};

export const get = async (): Promise<Result<string, undefined>> => {
  const result = await Api.get({
    endpoint: "/todo-list",
    params: {},
  });

  if (result.type === "Err") {
    return Err(result.error);
  }

  return Ok(undefined);
};

export default { get, post };
