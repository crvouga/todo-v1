import { Ok } from "../../utils";
import type { User } from "../user-shared";
import type { Session, PasswordCred, Repo } from "./user-repo-interface";

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
  },
  password: {
    insertOne: async (params) => {
      passwordMap.set(params.passwordCred.userId, params.passwordCred);
      return Ok(null);
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
  },
};

export default repo;
