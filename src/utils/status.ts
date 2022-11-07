export type Status<TParams, TError, TData> =
  | { type: "NotAsked" }
  | { type: "Loading"; params: TParams }
  | { type: "Ok"; params: TParams; data: TData }
  | { type: "Err"; params: TParams; error: TError };

export const notAsked: { type: "NotAsked" } = { type: "NotAsked" };
