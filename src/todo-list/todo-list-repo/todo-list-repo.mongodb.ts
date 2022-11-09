import type { Db } from "mongodb";
import { Err, Ok } from "../../utils";
import type { TodoItem, TodoList, TodoListStats } from "../todo-list-shared";
import type { Repo } from "./todo-list-repo";

export const makeRepo = ({ db }: { db: Db }): Repo => {
  const itemCol = db.collection<TodoItem>("todo-items");
  const listCol = db.collection<TodoList>("todo-lists");
  return {
    item: {
      insertOne: async (params) => {
        await itemCol.insertOne({
          createdAt: params.item.createdAt,
          id: params.item.id,
          isCompleted: params.item.isCompleted,
          listId: params.item.listId,
          text: params.item.text,
        });
        return Ok(null);
      },
      deleteById: async (params) => {
        await itemCol.deleteOne({
          id: params.id,
        });
        return Ok(null);
      },
      findOneById: async (params) => {
        const found = await itemCol.findOne({ id: params.id });
        return Ok(found);
      },
      updateOne: async (params) => {
        try {
          await itemCol.updateOne(
            {
              id: params.updated.id,
            },
            {
              $set: {
                isCompleted: params.updated.isCompleted,
                text: params.updated.text,
              },
            }
          );
          return Ok(null);
        } catch (error) {
          return Err("database failed");
        }
      },
      findManyWhere: async (params) => {
        //  todo add sorting, filtering, pagination

        const found = await itemCol.find({
          listId: params.listId,
        });

        const foundArray = await found.toArray();

        return Ok(foundArray);
      },
    },
    list: {
      deleteById: async (params) => {
        await listCol.deleteOne({
          id: params.id,
        });

        await itemCol.deleteMany({
          listId: params.id,
        });

        return Ok(null);
      },
      findOneById: async (params) => {
        const found = await listCol.findOne({ id: params.id });
        return Ok(found);
      },

      findManyWithStats: async (params) => {
        // todo add sorting and make one trip to db
        const listCursor = listCol.find({ userId: params.userId });

        const foundArray = await listCursor.toArray();

        const ret: (TodoList & TodoListStats)[] = [];

        for (const list of foundArray) {
          const itemCursor = itemCol.find({ listId: list.id });
          const foundItemArray = await itemCursor.toArray();
          const stats = foundItemArray.reduce<TodoListStats>(
            (stats, item) => {
              if (item.listId !== list.id) {
                return stats;
              }

              if (item.isCompleted) {
                return { ...stats, completedCount: stats.completedCount + 1 };
              }

              return { ...stats, activeCount: stats.activeCount + 1 };
            },
            {
              activeCount: 0,
              completedCount: 0,
            }
          );

          ret.push({ ...list, ...stats });
        }

        return Ok(ret);
      },

      insertOne: async (params) => {
        await listCol.insertOne({
          createdAt: params.list.createdAt,
          id: params.list.id,
          title: params.list.title,
          userId: params.list.userId,
        });
        return Ok(null);
      },
      updateOne: async ({ updated }) => {
        await listCol.updateOne(
          {
            id: updated.id,
          },
          {
            $set: {
              title: updated.title,
            },
          }
        );

        return Ok(null);
      },
    },

    deleteByUserId: async (params) => {
      // todo do one trip to db
      const listCursor = listCol.find({
        userId: params.userId,
      });

      const lists = await listCursor.toArray();

      for (const list of lists) {
        await itemCol.deleteMany({ listId: list.id });
      }

      await listCol.deleteMany({ userId: params.userId });

      return Ok(null);
    },
  };
};

export default makeRepo;
