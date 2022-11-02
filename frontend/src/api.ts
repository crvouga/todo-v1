import type { Endpoints } from "./shared";
import { endpoints } from "./shared";

const devBackendUrl = "http://localhost:5000";

const backendUrl = devBackendUrl;

const get = async ({ endpoint }: { endpoint: keyof Endpoints }) => {
  try {
    const response = await fetch(`${backendUrl}${endpoints[endpoint]}`);

    if (!response.ok) {
      return { type: "Err", error: "Response was not ok" } as const;
    }

    const json: unknown = await response.json();

    return { type: "Ok", json } as const;
  } catch (error) {
    return { type: "Err", error: String(error) } as const;
  }
};

const post = async ({
  endpoint,
  json,
}: {
  endpoint: keyof Endpoints;
  json: unknown;
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
  json,
}: {
  endpoint: keyof Endpoints;
  params: string | URLSearchParams | Record<string, string> | string[][];
  json: unknown;
}) => {
  try {
    const searchParams = new URLSearchParams(params);
    const response = await fetch(
      `${backendUrl}${endpoints[endpoint]}?${searchParams.toString()}`,
      {
        method: "PATCH",
        body: JSON.stringify(json),
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
  params: string | URLSearchParams | Record<string, string> | string[][];
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
  ["delete"]: delete_,
  patch,
};
