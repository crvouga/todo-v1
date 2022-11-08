import { z } from "zod";

export const endpoints = {
  "/user": "/api/user",
  "/session": "/api/session",
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

export const SessionGetBody = z.object({
  userId: z.string(),
});
export type SessionGetBody = z.infer<typeof SessionGetBody>;

export const SessionPostBody = z.object({
  emailAddress: z.string().email(),
  password: z.string(),
});
export type SessionPostBody = z.infer<typeof SessionPostBody>;

//
//
//
//
//

export const PasswordCred = z.object({
  userId: z.string().uuid(),
  passwordHash: z.string(),
});
export type PasswordCred = z.infer<typeof PasswordCred>;

export const Session = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
});
export type Session = z.infer<typeof Session>;
