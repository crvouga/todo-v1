export type Result<TError, TData> = Err<TError> | Ok<TData>;

export type Err<T> = { type: "Err"; error: T };

export const Err = <T>(error: T): Err<T> => {
  return { type: "Err", error };
};

export type Ok<T> = { type: "Ok"; data: T };

export const Ok = <T>(data: T): Ok<T> => {
  return { type: "Ok", data };
};
