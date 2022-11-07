export type Status<TParams, TError, TData> =
  | { type: "NotAsked" }
  | { type: "Loading"; params: TParams }
  | { type: "Success"; params: TParams; data: TData }
  | { type: "Failure"; params: TParams; error: TError };

export const notAsked: { type: "NotAsked" } = { type: "NotAsked" };
