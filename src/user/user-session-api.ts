import api from "@/api";
import { Err, formatError, Ok, type Result } from "@/utils";
import { z } from "zod";
import {
  SessionGetParams,
  endpoints,
  SessionGetBody,
  sessionIdKey,
  SessionDeleteParams,
} from "./user-shared";

const get = async (): Promise<Result<string, SessionGetBody>> => {
  const got = z.string().uuid().safeParse(localStorage.getItem(sessionIdKey));

  if (!got.success) {
    return Err("No valid session id found in local storage");
  }

  const dirty: SessionGetParams = {
    sessionId: got.data,
  };

  const result = await api.get({
    endpoint: endpoints["/session"],
    params: dirty,
  });

  if (result.type === "Err") {
    return Err(result.error);
  }

  const parsed = SessionGetBody.safeParse(result.json);

  if (!parsed.success) {
    return Err(formatError(parsed));
  }

  return Ok(parsed.data);
};

const delete_ = async (): Promise<Result<string, null>> => {
  const got = z.string().uuid().safeParse(localStorage.getItem(sessionIdKey));

  if (!got.success) {
    return Err("No valid session id found in local storage");
  }

  const dirty: SessionDeleteParams = {
    sessionId: got.data,
  };

  const result = await api.delete({
    endpoint: endpoints["/session"],
    params: dirty,
  });

  if (result.type === "Err") {
    return Err(result.error);
  }

  return Ok(null);
};

export default {
  get,
  delete_,
};
