import type { Db } from "mongodb";
import { v4 } from "uuid";
import { Err, Ok } from "../../utils";
import type { PasswordCred, Session, User } from "../user-shared";
import type { Repo } from "./user-repo";

const makeRepo = ({ db }: { db: Db }): Repo => {
  const userCol = db.collection<User>("users");
  const passwordCol = db.collection<PasswordCred>("passwords");
  const sessionCol = db.collection<Session>("sessions");
  return {
    deleteByUserId: async (params) => {
      await userCol.deleteOne({ id: params.userId });
      await passwordCol.deleteOne({ userId: params.userId });
      await sessionCol.deleteOne({ userId: params.userId });
      return Ok(null);
    },

    user: {
      updateOne: async (params) => {
        await userCol.updateOne(
          {
            id: params.updated.id,
          },
          {
            $set: {
              emailAddress: params.updated.emailAddress,
              avatarSeed: params.updated.avatarSeed,
            },
          }
        );

        return Ok(null);
      },
      insertOne: async (params) => {
        const res = await userCol.insertOne({
          id: params.user.id,
          emailAddress: params.user.emailAddress,
          avatarSeed: params.user.avatarSeed,
        });
        if (!res.acknowledged) {
          return Err("Failed to insert doc");
        }

        return Ok(null);
      },

      findOneByEmailAddress: async (params) => {
        const found = await userCol.findOne({
          emailAddress: params.emailAddress,
        });

        return Ok(found);
      },

      findOneById: async (params) => {
        const found = await userCol.findOne({
          id: params.id,
        });

        return Ok(found);
      },
    },
    password: {
      insertOne: async (params) => {
        await passwordCol.insertOne({
          userId: params.passwordCred.userId,
          passwordHash: params.passwordCred.passwordHash,
        });
        return Ok(null);
      },
      findByUserId: async (params) => {
        const found = await passwordCol.findOne({
          userId: params.userId,
        });
        return Ok(found);
      },
    },

    session: {
      findOneById: async (params) => {
        const found = await sessionCol.findOne({
          id: params.id,
        });
        return Ok(found);
      },

      insertOne: async (params) => {
        const sessionNew: Session = {
          id: v4(),
          userId: params.userId,
        };
        await sessionCol.insertOne({
          id: sessionNew.id,
          userId: sessionNew.userId,
        });
        return Ok(sessionNew);
      },

      deleteById: async (params) => {
        await sessionCol.deleteOne({
          id: params.sessionId,
        });
        return Ok(null);
      },
    },
  };
};

export default makeRepo;
