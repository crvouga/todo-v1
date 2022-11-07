import { StatusCode } from "../utils";
import type { Application } from "express";
import { v4 } from "uuid";
import { z } from "zod";
import { endpoints, User, UserPostBody, UserPostError } from "./user-shared";

//
//
//
//

const userMap = new Map<string, User>();

const PasswordCred = z.object({
  userId: z.string().uuid(),
  passwordHash: z.string(),
});
type PasswordCred = z.infer<typeof PasswordCred>;

const passwordMap = new Map<string, PasswordCred>();

//
//
//
//

export const useUserApi = (app: Application) => {
  app.post(endpoints["/user"], async (req, res) => {
    const parsed = UserPostBody.safeParse(req.body);

    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!parsed.success) {
      const emailAddressErr = parsed.error.formErrors.fieldErrors.emailAddress;

      if (emailAddressErr) {
        const err: UserPostError = {
          type: "InvalidEmailAddress",
          message: emailAddressErr.join(", "),
        };
        res.status(StatusCode.BadRequest).json(err);
        return;
      }

      const passwordErr = parsed.error.formErrors.fieldErrors.password;

      if (passwordErr) {
        const err: UserPostError = {
          type: "InvalidPassword",
          message: passwordErr.join(", "),
        };
        res.status(StatusCode.BadRequest).json(err);
        return;
      }

      res.status(StatusCode.BadRequest).json(parsed.error);
      return;
    }

    const found = Array.from(userMap.values()).filter(
      (user) => user.emailAddress === parsed.data.emailAddress
    )[0];

    if (found) {
      const errorBody: UserPostError = {
        type: "EmailAddressTaken",
      };
      res.status(StatusCode.Conflict).json(errorBody);
      return;
    }

    const userNew: User = {
      emailAddress: parsed.data.emailAddress,
      id: v4(),
    };

    // todo add hashing
    const passwordHash = parsed.data.password;

    const passwordCred: PasswordCred = {
      userId: userNew.id,
      passwordHash,
    };

    passwordMap.set(passwordCred.userId, passwordCred);
    userMap.set(userNew.id, userNew);

    res.status(StatusCode.Created).end();
  });
};
