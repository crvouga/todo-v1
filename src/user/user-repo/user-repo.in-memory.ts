import { v4 } from "uuid";
import { Ok } from "../../utils";
import hash from "../hash";
import type { Session, PasswordCred, User } from "../user-shared";
import type { Repo } from "./user-repo-interface";

const userMap = new Map<string, User>();
const passwordMap = new Map<string, PasswordCred>();
const sessionMap = new Map<string, Session>();

const repo: Repo = {
  user: {
    insertOne: async (params) => {
      userMap.set(params.user.id, params.user);
      return Ok(null);
    },

    findOneByEmailAddress: async (params) => {
      const found = Array.from(userMap.values()).filter(
        (user) => user.emailAddress === params.emailAddress
      )[0];

      if (!found) {
        return Ok(null);
      }

      return Ok(found);
    },

    findOneById: async (params) => {
      const found = userMap.get(params.id);

      if (!found) {
        return Ok(null);
      }

      return Ok(found);
    },
  },
  password: {
    insertOne: async (params) => {
      passwordMap.set(params.passwordCred.userId, params.passwordCred);
      return Ok(null);
    },
    findByUserId: async (params) => {
      const found = Array.from(passwordMap.values()).filter(
        (cred) => cred.userId === params.userId
      )[0];
      if (!found) {
        return Ok(null);
      }

      return Ok(found);
    },
  },

  session: {
    findOneById: async (params) => {
      const found = sessionMap.get(params.id);

      if (!found) {
        return Ok(null);
      }

      return Ok(found);
    },

    insertOne: async (params) => {
      const sessionNew: Session = {
        id: v4(),
        userId: params.userId,
      };
      sessionMap.set(sessionNew.id, sessionNew);
      return Ok(sessionNew);
    },

    deleteWhere: async (params) => {
      sessionMap.delete(params.sessionId);
      return Ok(null);
    },
  },
};

//
// init
//

const emailAddress = "example@email.com";
const password = "123";
const userId = v4();
repo.user.insertOne({ user: { id: userId, emailAddress } });
repo.password.insertOne({
  passwordCred: {
    passwordHash: hash.hash({ password }).passwordHash,
    userId: userId,
  },
});

export default repo;
