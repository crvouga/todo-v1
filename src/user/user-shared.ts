import { z } from "zod";

export const endpoints = {
  "/user": "/api/user",
  "/session": "/api/session",
  // not very restful :|
  "/user/everything": "/api/user/everything",
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

export const UserGetParams = z.object({
  userId: z.string().uuid(),
});
export type UserGetParams = z.infer<typeof UserGetParams>;

export const UserGotBody = User;
export type UserGotBody = z.infer<typeof UserGotBody>;

export const UserDeleteParams = z.object({ userId: z.string().uuid() });
export type UserDeleteParams = z.infer<typeof UserDeleteParams>;

export const UserEverythingDeleteParams = z.object({
  userId: z.string().uuid(),
});
export type UserEverythingDeleteParams = z.infer<
  typeof UserEverythingDeleteParams
>;

//
//
//
//
//
//
//

export const SessionGetParams = z.object({
  sessionId: z.string(),
});
export type SessionGetParams = z.infer<typeof SessionGetParams>;

export const SessionDeleteParams = z.object({
  sessionId: z.string(),
});
export type SessionDeleteParams = z.infer<typeof SessionDeleteParams>;

export const SessionGetBody = z.object({
  userId: z.string(),
});
export type SessionGetBody = z.infer<typeof SessionGetBody>;

export const SessionPostBody = z.object({
  emailAddress: z.string().email(),
  password: z.string(),
});
export type SessionPostBody = z.infer<typeof SessionPostBody>;
export const SessionPostedBody = z.object({
  sessionId: z.string(),
});
export type SessionPostedBody = z.infer<typeof SessionPostedBody>;

export const SessionPostError = z.discriminatedUnion("type", [
  z.object({ type: z.literal("AccountNotFound") }),
  z.object({ type: z.literal("ServerError"), message: z.string() }),
  z.object({ type: z.literal("InvalidEmailAddress"), message: z.string() }),
  z.object({ type: z.literal("WrongPassword") }),
]);
export type SessionPostError = z.infer<typeof SessionPostError>;

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
  id: z.string().uuid(),
  userId: z.string().uuid(),
});
export type Session = z.infer<typeof Session>;

export const sessionIdKey = "todo-app-session-id";
