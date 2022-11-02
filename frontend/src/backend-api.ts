const devBackendUrl = "http://localhost:5000";

export const backendUrl = devBackendUrl;

export const apiFetch = async ({
  method,
  endpoint,
  json,
}: {
  method: "GET" | "POST";
  endpoint: string;
  json: unknown;
}) => {
  try {
    const response = await fetch(`${backendUrl}${endpoint}`, {
      method,
      body: JSON.stringify(json),
      headers: {
        "Content-Type": "application/json",
      },
    });

    return { type: "Ok", response } as const;
  } catch (error) {
    return { type: "Err", error } as const;
  }
};
