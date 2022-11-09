import api from "../api";
import { Err, formatError, Ok, type Result } from "../utils";
import { z } from "zod";
import {
  endpoints,
  SessionDeleteParams,
  SessionGetBody,
  SessionGetParams,
  sessionIdKey,
  UserGetParams,
  UserGotBody,
  UserPatchBody,
  UserPatchParams,
} from "./user-shared";

export default {
  user: {
    get: async (dirty: UserGetParams): Promise<Result<string, UserGotBody>> => {
      const got = await api.get({
        endpoint: endpoints["/user"],
        params: dirty,
      });

      if (got.type === "Err") {
        return Err(got.error);
      }

      const parsed = UserGotBody.safeParse(got.json);

      if (!parsed.success) {
        return Err(formatError(parsed));
      }

      return Ok(parsed.data);
    },
    patch: async ({
      params,
      body,
    }: {
      params: UserPatchParams;
      body: UserPatchBody;
    }): Promise<Result<string, null>> => {
      const patched = await api.patch({
        endpoint: endpoints["/user"],
        body: body,
        params: params,
      });

      if (patched.type === "Err") {
        return Err(patched.error);
      }

      return Ok(null);
    },
  },
  session: {
    get: async (): Promise<Result<string, SessionGetBody>> => {
      const got = z
        .string()
        .uuid()
        .safeParse(localStorage.getItem(sessionIdKey));

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
    },
    delete_: async (): Promise<Result<string, null>> => {
      const got = z
        .string()
        .uuid()
        .safeParse(localStorage.getItem(sessionIdKey));

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
    },
  },
};
