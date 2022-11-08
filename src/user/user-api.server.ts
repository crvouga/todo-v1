import type { Application } from "express";
import { v4 } from "uuid";
import { StatusCode } from "../utils";
import type { PasswordCred, Repo } from "./user-repo/user-repo-interface";
import {
  endpoints,
  SessionGetBody,
  SessionPostBody,
  User,
  UserPostBody,
  UserPostError,
} from "./user-shared";

//
//
//
//

const sessionIdCookieName = "todo-app-session-id";

export const useUserApi = ({ app, repo }: { repo: Repo; app: Application }) => {
  app.post(endpoints["/session"], async (req, res) => {
    const parsed = SessionPostBody.safeParse(req.body);

    if (!parsed.success) {
      res.status(StatusCode.BadRequest).json(parsed).end();
      return;
    }

    const found = await repo;
  });

  app.get(endpoints["/session"], async (req, res) => {
    const sessionId = req.cookies?.[sessionIdCookieName];

    if (!sessionId) {
      res.status(StatusCode.Unauthorized).end();
      return;
    }

    const findResult = await repo.session.findOneById({ id: sessionId });

    if (findResult.type === "Err") {
      res.status(StatusCode.ServerError).end();
      return;
    }

    if (!findResult.data) {
      res.status(StatusCode.Unauthorized).end();
      return;
    }

    const sessionGetBody: SessionGetBody = {
      userId: findResult.data.userId,
    };

    res.status(StatusCode.Ok).json(sessionGetBody).end();
  });

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

    const findResult = await repo.user.findOneByEmailAddress({
      emailAddress: parsed.data.emailAddress,
    });

    if (findResult.type === "Err") {
      res
        .status(StatusCode.ServerError)
        .json({ message: findResult.error })
        .end();
      return;
    }

    const found = findResult.data;

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

    const passwordCredNew: PasswordCred = {
      userId: userNew.id,
      passwordHash,
    };

    await repo.password.insertOne({ passwordCred: passwordCredNew });
    await repo.user.insertOne({ user: userNew });

    res.status(StatusCode.Created).end();
  });
};
