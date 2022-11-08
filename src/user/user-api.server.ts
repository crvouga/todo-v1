import type { PubSub } from "../pubsub/pubsub";
import type { Application } from "express";
import { v4 } from "uuid";
import { StatusCode } from "../utils";
import Hash from "./hash";
import type { Repo } from "./user-repo/user-repo";
import {
  endpoints,
  PasswordCred,
  SessionDeleteParams,
  SessionGetBody,
  SessionGetParams,
  SessionPostBody,
  SessionPostedBody,
  SessionPostError,
  User,
  UserDeleteParams,
  UserGetParams,
  UserGotBody,
  UserPostBody,
  UserPostError,
} from "./user-shared";

export const useUserApi = ({
  app,
  repo,
  pubSub,
}: {
  pubSub: PubSub;
  repo: Repo;
  app: Application;
}) => {
  //
  //
  //
  // Session
  //
  //
  //

  app.post(endpoints["/session"], async (req, res) => {
    const parsed = SessionPostBody.safeParse(req.body);

    if (!parsed.success) {
      const err: SessionPostError = {
        type: "InvalidEmailAddress",
        message:
          parsed.error.formErrors.fieldErrors.emailAddress?.join(", ") ?? "",
      };
      res.status(StatusCode.BadRequest).json(err).end();
      return;
    }

    const found = await repo.user.findOneByEmailAddress(parsed.data);

    if (found.type === "Err") {
      const err: SessionPostError = {
        type: "ServerError",
        message: found.error,
      };
      res.status(StatusCode.ServerError).json(err).end();
      return;
    }

    if (!found.data) {
      const err: SessionPostError = { type: "AccountNotFound" };
      res.status(StatusCode.NotFound).json(err).end();
      return;
    }

    const foundPassword = await repo.password.findByUserId({
      userId: found.data.id,
    });

    if (foundPassword.type === "Err") {
      const err: SessionPostError = {
        type: "ServerError",
        message: foundPassword.error,
      };
      res.status(StatusCode.ServerError).json(err);
      return;
    }

    if (!foundPassword.data) {
      const err: SessionPostError = {
        type: "ServerError",
        message:
          "User account exists but with not password cred. This should be impossible.",
      };
      res.status(StatusCode.ServerError).json(err);
      return;
    }

    if (
      !Hash.isEqual({
        password: parsed.data.password,
        passwordHash: foundPassword.data.passwordHash,
      })
    ) {
      const err: SessionPostError = {
        type: "WrongPassword",
      };
      res.status(StatusCode.Unauthorized).json(err);
      return;
    }
    const inserted = await repo.session.insertOne({
      userId: found.data.id,
    });

    if (inserted.type === "Err") {
      const err: SessionPostError = {
        type: "ServerError",
        message: inserted.error,
      };
      res.status(StatusCode.ServerError).json(err).end();
      return;
    }

    const posted: SessionPostedBody = {
      sessionId: inserted.data.id,
    };

    res.status(StatusCode.Created).json(posted).end();
  });

  //
  //
  //

  app.get(endpoints["/session"], async (req, res) => {
    const params = SessionGetParams.safeParse(req.query);

    if (!params.success) {
      res.status(StatusCode.BadRequest).json(params.error).end();
      return;
    }

    const findResult = await repo.session.findOneById({
      id: params.data.sessionId,
    });

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

  app.delete(endpoints["/session"], async (req, res) => {
    const parsed = SessionDeleteParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(StatusCode.BadRequest).json(parsed.error);
      return;
    }
    const deleted = await repo.session.deleteById({
      sessionId: parsed.data.sessionId,
    });
    if (deleted.type === "Err") {
      res.status(StatusCode.ServerError).json({ message: deleted.error });
      return;
    }
    res.status(StatusCode.Ok).end();
  });

  //
  //
  //
  // User
  //
  //
  //

  app.get(endpoints["/user"], async (req, res) => {
    const parsed = UserGetParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(StatusCode.BadRequest).end();
      return;
    }
    const found = await repo.user.findOneById({ id: parsed.data.userId });
    if (found.type === "Err") {
      res.status(StatusCode.ServerError).json(found.error);
      return;
    }
    if (!found.data) {
      res.status(StatusCode.NotFound).end();
      return;
    }
    const body: UserGotBody = found.data;
    res.json(body);
  });

  app.delete(endpoints["/user"], async (req, res) => {
    const parsed = UserDeleteParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(StatusCode.BadRequest).json(parsed.error);
      return;
    }
    const deleted = await repo.deleteByUserId({
      userId: parsed.data.userId,
    });

    if (deleted.type === "Err") {
      res.status(StatusCode.ServerError).json({ message: deleted.error });
      return;
    }

    pubSub.pub({ type: "UserDeleted", userId: parsed.data.userId });
    res.status(StatusCode.Ok).end();
  });

  app.post(endpoints["/user"], async (req, res) => {
    const parsed = UserPostBody.safeParse(req.body);

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

    const { passwordHash } = Hash.hash({
      password: parsed.data.password,
    });

    const passwordCredNew: PasswordCred = {
      userId: userNew.id,
      passwordHash,
    };

    await repo.password.insertOne({ passwordCred: passwordCredNew });
    await repo.user.insertOne({ user: userNew });

    pubSub.pub({ type: "UserCreated", userId: userNew.id });

    res.status(StatusCode.Created).end();
  });
};
