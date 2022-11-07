import type { SafeParseError } from "zod";

export const formatError = <Input>(error: SafeParseError<Input>): string => {
  return error.error.issues.map((i) => i.message).join(",");
};
