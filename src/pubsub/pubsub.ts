import { z } from "zod";

export const UserDeleted = z.object({
  type: z.literal("UserDeleted"),
  userId: z.string().uuid(),
});
export type UserDeleted = z.infer<typeof UserDeleted>;

export const UserCreated = z.object({
  type: z.literal("UserCreated"),
  userId: z.string().uuid(),
});
export type UserCreated = z.infer<typeof UserCreated>;

export const AppEvent = z.discriminatedUnion("type", [
  UserDeleted,
  UserCreated,
]);
export type AppEvent = z.infer<typeof AppEvent>;

export type PubSub = {
  pub: (event: AppEvent) => void;
  sub: (subscriber: (event: AppEvent) => void) => () => void;
};
