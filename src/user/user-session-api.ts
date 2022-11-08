import api from "@/api";
import { Err, formatError, Ok, type Result } from "@/utils";
import { endpoints, SessionGetBody } from "./user-shared";

const get = async (): Promise<Result<string, SessionGetBody>> => {
  // we're doing cookie based auth
  const result = await api.get({
    endpoint: endpoints["/session"],
    params: {},
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

export default {
  get,
};
