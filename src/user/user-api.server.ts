import type { Application } from "express";
import { v4 } from "uuid";
import type { PubSub } from "../pubsub/pubsub";
import { StatusCode } from "../utils";
import Hash from "./hash";
import type { Repo } from "./user-repo/user-repo";
import {
  applyUserPatch,
  endpoints,
  PasswordCred,
  Session,
  SessionDeleteParams,
  SessionGetBody,
  SessionGetParams,
  SessionPostBody,
  SessionPostedBody,
  SessionPostError,
  User,
  UserDeleteParams,
  UserEverythingDeleteParams,
  UserGetParams,
  UserGotBody,
  UserPatchBody,
  UserPatchParams,
  UserPostBody,
  UserPostError,
} from "./user-shared";

export const useUserApi = (config: {
  pubSub: PubSub;
  repo: Repo;
  app: Application;
}) => {
  useSessionApi(config);
  useCurrentUserApi(config);
  useUserCrudApi(config);
};

const useSessionApi = ({ app, repo }: { app: Application; repo: Repo }) => {
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

    const doesMatch = await Hash.isEqual({
      password: parsed.data.password,
      passwordHash: foundPassword.data.passwordHash,
    });

    if (!doesMatch) {
      const err: SessionPostError = {
        type: "WrongPassword",
      };
      res.status(StatusCode.Unauthorized).json(err);
      return;
    }

    const sessionNew: Session = {
      id: v4(),
      userId: found.data.id,
    };
    const inserted = await repo.session.insertOne({
      session: sessionNew,
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
      sessionId: sessionNew.id,
    };

    res.status(StatusCode.Created).json(posted).end();
  });
};

const useCurrentUserApi = ({ app, repo }: { app: Application; repo: Repo }) => {
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
      id: parsed.data.sessionId,
    });
    if (deleted.type === "Err") {
      res.status(StatusCode.ServerError).json({ message: deleted.error });
      return;
    }
    res.status(StatusCode.Ok).end();
  });
};

const useUserCrudApi = ({
  app,
  repo,
  pubSub,
}: {
  app: Application;
  repo: Repo;
  pubSub: PubSub;
}) => {
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
      avatarSeed: parsed.data.avatarSeed,
      emailAddress: parsed.data.emailAddress,
      id: v4(),
    };

    const hashResult = await Hash.hash({
      password: parsed.data.password,
    });

    if (hashResult.type === "Err") {
      res.status(StatusCode.ServerError).json({ message: hashResult.error });
      return;
    }

    const passwordCredNew: PasswordCred = {
      userId: userNew.id,
      passwordHash: hashResult.data.passwordHash,
    };

    const passwordInsertedResult = await repo.password.insertOne({
      passwordCred: passwordCredNew,
    });
    if (passwordInsertedResult.type === "Err") {
      res.status(StatusCode.ServerError).json({
        message: `Failed to save password: ${passwordInsertedResult.error}`,
      });
      return;
    }

    const userInsertedResult = await repo.user.insertOne({ user: userNew });
    if (userInsertedResult.type === "Err") {
      res
        .status(StatusCode.ServerError)
        .json({ message: `Failed to save user: ${userInsertedResult.error}` });
      return;
    }

    pubSub.pub({ type: "UserCreated", userId: userNew.id });

    const sessionNew: Session = {
      id: v4(),
      userId: userNew.id,
    };

    const insertedSessionResult = await repo.session.insertOne({
      session: sessionNew,
    });

    if (insertedSessionResult.type === "Err") {
      console.error(
        `User ${userNew.id} created, but failed to create session: ${insertedSessionResult.error}`
      );
      res
        .status(StatusCode.ServerError)
        .json({
          message:
            "User account created, but failed to automatically sign in. Please try logging in manually.",
          details: insertedSessionResult.error,
        })
        .end();
      return;
    }

    const responseBody: SessionPostedBody = {
      sessionId: sessionNew.id,
    };
    res.status(StatusCode.Created).json(responseBody).end();
  });

  app.patch(endpoints["/user"], async (req, res) => {
    const parsedParams = UserPatchParams.safeParse(req.query);
    if (!parsedParams.success) {
      res.status(StatusCode.BadRequest).json(parsedParams.error);
      return;
    }
    const parsedBody = UserPatchBody.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(StatusCode.BadRequest).json(parsedBody.error);
      return;
    }
    const found = await repo.user.findOneById({ id: parsedParams.data.userId });
    if (found.type === "Err") {
      res.status(StatusCode.ServerError).json({ message: found.error });
      return;
    }
    if (!found.data) {
      res.status(StatusCode.NotFound).end();
      return;
    }
    const patched = applyUserPatch(found.data, parsedBody.data);
    const updated = await repo.user.updateOne({ updated: patched });
    if (updated.type === "Err") {
      res.status(StatusCode.ServerError).json({ message: updated.error });
      return;
    }
    res.status(StatusCode.Ok).end();
  });

  app.delete(endpoints["/user/everything"], (req, res) => {
    const parsed = UserEverythingDeleteParams.safeParse(req.query);

    if (!parsed.success) {
      res.status(StatusCode.BadRequest).json(parsed.error);
      return;
    }

    pubSub.pub({
      type: "UserDeleteEverything",
      userId: parsed.data.userId,
    });

    res.status(StatusCode.Ok).end();
  });
};
