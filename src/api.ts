import { Err, Ok, StatusCode, type Result } from "./utils";

const devBackendUrl = "http://localhost:5000";

const backendUrl =
  // @ts-ignore
  import.meta.env.DEV ? devBackendUrl : "";

type Params =
  | string
  | URLSearchParams
  | Record<string, string>
  | Record<string, number>
  | string[][];

const stringifyParams = (params: unknown): Result<string, string> => {
  try {
    // @ts-ignore
    const searchParams = new URLSearchParams(params);
    return Ok(searchParams.toString());
  } catch (error) {
    return Err("Failed to serialize params");
  }
};

const get = async ({
  endpoint,
  params,
}: {
  endpoint: string;
  params: unknown;
}) => {
  try {
    const stringed = stringifyParams(params);
    if (stringed.type === "Err") {
      return stringed;
    }

    const response = await fetch(`${backendUrl}${endpoint}?${stringed.data}`);

    if (!response.ok) {
      if (response.status === StatusCode.NotFound) {
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

const post = async <T>({ endpoint, json }: { endpoint: string; json: T }) => {
  try {
    const response = await fetch(`${backendUrl}${endpoint}`, {
      method: "POST",
      body: JSON.stringify(json),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      try {
        const responseJson: unknown = await response.json();
        return {
          type: "Err",
          body: responseJson,
          error: "Response was not ok",
        } as const;
      } catch (error) {
        return {
          type: "Err",
          body: {} as unknown,
          error: "Response was not ok",
        } as const;
      }
    }

    try {
      const responseJson: unknown = await response.json();

      return { type: "Ok", response, body: responseJson } as const;
    } catch (error) {
      return {
        type: "Ok",
        response,
        body: {} as unknown,
      } as const;
    }
  } catch (error) {
    return { type: "Err", body: {} as unknown, error: String(error) } as const;
  }
};

const patch = async ({
  endpoint,
  params,
  body,
}: {
  endpoint: string;
  params: Params;
  body: unknown;
}) => {
  try {
    const stringed = stringifyParams(params);
    if (stringed.type === "Err") {
      return stringed;
    }

    const response = await fetch(`${backendUrl}${endpoint}?${stringed.data}`, {
      method: "PATCH",
      body: JSON.stringify(body),
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

const delete_ = async ({
  endpoint,
  params,
}: {
  endpoint: string;
  params: Params;
}) => {
  try {
    const stringed = stringifyParams(params);
    if (stringed.type === "Err") {
      return stringed;
    }
    const response = await fetch(`${backendUrl}${endpoint}?${stringed.data}`, {
      method: "DELETE",
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

export default {
  get,
  post,
  delete: delete_,
  patch,
};
