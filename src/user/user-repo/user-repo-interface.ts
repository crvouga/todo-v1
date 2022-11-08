import type { Result } from "../../utils";
import type { PasswordCred, Session, User } from "../user-shared";

export type Repo = {
  user: {
    insertOne: (params: { user: User }) => Promise<Result<string, null>>;
    findOneByEmailAddress: (params: {
      emailAddress: string;
    }) => Promise<Result<string, User | null>>;
  };
  password: {
    insertOne: (params: {
      passwordCred: PasswordCred;
    }) => Promise<Result<string, null>>;
    findByUserId: (params: {
      userId: string;
    }) => Promise<Result<string, null | PasswordCred>>;
  };
  session: {
    findOneById: (params: {
      id: string;
    }) => Promise<Result<string, Session | null>>;
    insertOne: (params: { userId: string }) => Promise<Result<string, Session>>;
    deleteWhere: (params: {
      sessionId: string;
    }) => Promise<Result<string, null>>;
  };
};
