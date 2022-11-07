export type RemoteData<TError, TData> =
  | { type: "NotAsked" }
  | { type: "Loading" }
  | { type: "Success"; data: TData }
  | { type: "Error"; error: TError };
