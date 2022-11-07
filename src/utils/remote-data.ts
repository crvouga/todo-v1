export type RemoteData<TError, TData> =
  | { type: "NotAsked" }
  | { type: "Loading" }
  | { type: "Ok"; data: TData }
  | { type: "Error"; error: TError };
