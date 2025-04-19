import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";
import { getMongoDbClient } from "./db/mongodb-client";
import pubSubInMemory from "./pubsub/pubsub.in-memory";
import { useTodoListApi } from "./todo-list/todo-list-api.server";
import makeTodoListRepoMongoDb from "./todo-list/todo-list-repo/todo-list-repo.mongodb";
import { useUserApi } from "./user/user-api.server";
import makeUserRepoMongoDb from "./user/user-repo/user-repo.mongodb";
import { queryParser } from "express-query-parser";
import userRepoInMemory from "./user/user-repo/user-repo.in-memory";
import todoListRepoInMemory from "./todo-list/todo-list-repo/todo-list-repo.in-memory";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(cookieParser());
app.use(
  queryParser({
    parseNull: true,
    parseUndefined: true,
    parseBoolean: true,
    parseNumber: true,
  })
);
pubSubInMemory.sub((event) => {
  console.log("App Event", event);
});

//
//
// api
//
//

const buildRepo = async (impl: "in-memory" | "durable") => {
  switch (impl) {
    case "in-memory": {
      return {
        user: userRepoInMemory,
        todoList: todoListRepoInMemory,
      };
    }
    case "durable": {
      const db = await getMongoDbClient("durable");
      const userRepoMongoDb = makeUserRepoMongoDb({ db });
      const todoListRepoMongoDb = makeTodoListRepoMongoDb({ db });
      return {
        user: userRepoMongoDb,
        todoList: todoListRepoMongoDb,
      };
    }
  }
};

const startServer = async () => {
  const { user, todoList } = await buildRepo("in-memory");
  useTodoListApi({
    pubSub: pubSubInMemory,
    repo: todoList,
    app,
  });
  useUserApi({
    pubSub: pubSubInMemory,
    repo: user,
    app,
  });

  //
  //
  // frontend app
  //
  //

  app.use(express.static(path.resolve(__dirname, "..", "..", "dist")));
  app.get("*", (req, res) => {
    // Skip API routes
    if (req.path.startsWith("/api")) {
      return;
    }
    res.sendFile(path.resolve(__dirname, "..", "..", "dist", "index.html"));
  });

  const port = Number(process.env.PORT) || Number(process.env.port) || 5555;

  app.listen(port, () => {
    console.log(`Server started. http://localhost:${port}`);
  });
};

startServer().catch(console.error);
