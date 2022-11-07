export * from "./format-from-now";
export * from "./remote-data";
export * from "./result";
export * from "./status";
export * from "./use-query";

export const toValues = <TKey extends string, TValue>(obj: {
  [key in TKey]: TValue;
}): TValue[] => {
  const values: TValue[] = [];

  for (const key in obj) {
    const value = obj[key];
    values.push(value);
  }
  return values;
};
