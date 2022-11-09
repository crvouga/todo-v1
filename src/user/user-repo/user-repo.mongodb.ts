import type { Db } from "mongodb";
import { Err, formatError, Ok } from "../../utils";
import { PasswordCred, Session, User } from "../user-shared";
import type { Repo } from "./user-repo";

const makeRepo = ({ db }: { db: Db }): Repo => {
  const userCol = db.collection<User>("users");
  const passwordCol = db.collection<PasswordCred>("passwords");
  const sessionCol = db.collection<Session>("sessions");
  return {
    deleteByUserId: async (params) => {
      await userCol.deleteMany({ id: params.userId });
      await passwordCol.deleteMany({ userId: params.userId });
      await sessionCol.deleteMany({ userId: params.userId });
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

        const parsed = User.safeParse(found);

        if (!parsed.success) {
          return Err(formatError(parsed));
        }

        return Ok(parsed.data);
      },

      findOneById: async (params) => {
        const found = await userCol.findOne({
          id: params.id,
        });

        const parsed = User.safeParse(found);

        if (!parsed.success) {
          return Err(formatError(parsed));
        }

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

        const parsed = PasswordCred.safeParse(found);

        if (!parsed.success) {
          return Err(formatError(parsed));
        }

        return Ok(found);
      },
    },

    session: {
      findOneById: async (params) => {
        const found = await sessionCol.findOne({
          id: params.id,
        });
        const parsed = Session.safeParse(found);
        if (!parsed.success) {
          return Err(formatError(parsed));
        }
        return Ok(found);
      },

      insertOne: async (params) => {
        await sessionCol.insertOne({
          id: params.session.id,
          userId: params.session.userId,
        });
        return Ok(null);
      },

      deleteById: async (params) => {
        await sessionCol.deleteOne({
          id: params.id,
        });
        return Ok(null);
      },
    },
  };
};

export default makeRepo;
