import { z } from "zod";

export const endpoints = {
  "/user": "/api/user",
} as const;

export const User = z.object({
  id: z.string().uuid(),
  emailAddress: z.string().email(),
});
export type User = z.infer<typeof User>;

export const Password = z.string().min(2).max(100);

export const UserPostBody = z.object({
  emailAddress: z.string().email(),
  password: Password,
});
export type UserPostBody = z.infer<typeof UserPostBody>;

export const UserPostError = z.discriminatedUnion("type", [
  z.object({ type: z.literal("InvalidEmailAddress"), message: z.string() }),
  z.object({ type: z.literal("InvalidPassword"), message: z.string() }),
  z.object({ type: z.literal("EmailAddressTaken") }),
]);
export type UserPostError = z.infer<typeof UserPostError>;
