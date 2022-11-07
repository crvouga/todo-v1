import type { Endpoints } from "./todo-list/todo-list-shared";
import { endpoints } from "./todo-list/todo-list-shared";

const devBackendUrl = "http://localhost:5000";

const backendUrl = devBackendUrl;

type Params = string | URLSearchParams | Record<string, string> | string[][];

const get = async ({
  endpoint,
  params,
}: {
  endpoint: keyof Endpoints;
  params: Params;
}) => {
  try {
    const searchParams = new URLSearchParams(params);

    const response = await fetch(
      `${backendUrl}${endpoints[endpoint]}?${searchParams.toString()}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { type: "Err", error: "Resource not found" } as const;
      }

      return { type: "Err", error: "Response was not ok" } as const;
    }

    const json: unknown = await response.json();

    return { type: "Ok", json } as const;
  } catch (error) {
    return { type: "Err", error: String(error) } as const;
  }
};

const post = async <T>({
  endpoint,
  json,
}: {
  endpoint: keyof Endpoints;
  json: T;
}) => {
  try {
    const response = await fetch(`${backendUrl}${endpoints[endpoint]}`, {
      method: "POST",
      body: JSON.stringify(json),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return { type: "Err", error: "Response was not ok" } as const;
    }

    return { type: "Ok", response } as const;
  } catch (error) {
    return { type: "Err", error: String(error) } as const;
  }
};

const patch = async ({
  endpoint,
  params,
  body,
}: {
  endpoint: keyof Endpoints;
  params: Params;
  body: unknown;
}) => {
  try {
    const searchParams = new URLSearchParams(params);
    const response = await fetch(
      `${backendUrl}${endpoints[endpoint]}?${searchParams.toString()}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return { type: "Err", error: "Response was not ok" } as const;
    }

    return { type: "Ok", response } as const;
  } catch (error) {
    return { type: "Err", error: String(error) } as const;
  }
};

const delete_ = async ({
  endpoint,
  params,
}: {
  endpoint: keyof Endpoints;
  params: Params;
}) => {
  try {
    const searchParams = new URLSearchParams(params);
    const response = await fetch(
      `${backendUrl}${endpoints[endpoint]}?${searchParams.toString()}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return { type: "Err", error: "Response was not ok" } as const;
    }

    return { type: "Ok", response } as const;
  } catch (error) {
    return { type: "Err", error: String(error) } as const;
  }
};

export default {
  get,
  post,
  delete: delete_,
  patch,
};
