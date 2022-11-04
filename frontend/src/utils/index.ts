export * from "./format-from-now";
export * from "./remote-data";
export * from "./use-query";
export * from "./result";

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
