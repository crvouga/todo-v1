import { v4 } from "uuid";
import { Ok } from "../../utils";
import hash from "../hash";
import type { Session, PasswordCred, User } from "../user-shared";
import type { Repo } from "./user-repo";

const userById = new Map<string, User>();
const passwordByUserId = new Map<string, PasswordCred>();
const sessionById = new Map<string, Session>();

const repo: Repo = {
  deleteByUserId: async (params) => {
    userById.delete(params.userId);
    passwordByUserId.delete(params.userId);
    const foundSession = Array.from(sessionById.values()).filter(
      (session) => session.userId === params.userId
    )[0];
    if (foundSession) {
      sessionById.delete(foundSession.id);
    }
    return Ok(null);
  },

  user: {
    insertOne: async (params) => {
      userById.set(params.user.id, params.user);
      return Ok(null);
    },

    findOneByEmailAddress: async (params) => {
      const found = Array.from(userById.values()).filter(
        (user) => user.emailAddress === params.emailAddress
      )[0];

      if (!found) {
        return Ok(null);
      }

      return Ok(found);
    },

    findOneById: async (params) => {
      const found = userById.get(params.id);

      if (!found) {
        return Ok(null);
      }

      return Ok(found);
    },
  },
  password: {
    insertOne: async (params) => {
      passwordByUserId.set(params.passwordCred.userId, params.passwordCred);
      return Ok(null);
    },
    findByUserId: async (params) => {
      const found = passwordByUserId.get(params.userId);

      if (!found) {
        return Ok(null);
      }

      return Ok(found);
    },
  },

  session: {
    findOneById: async (params) => {
      const found = sessionById.get(params.id);

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
      sessionById.set(sessionNew.id, sessionNew);
      return Ok(sessionNew);
    },

    deleteById: async (params) => {
      sessionById.delete(params.sessionId);
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
