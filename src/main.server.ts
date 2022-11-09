import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";
import { productionDb } from "./mongodb-client";
import pubSubInMemory from "./pubsub/pubsub.in-memory";
import { useTodoListApi } from "./todo-list/todo-list-api.server";
import todoListRepoInMemory from "./todo-list/todo-list-repo/todo-list-repo.in-memory";
import { useUserApi } from "./user/user-api.server";
import makeUserRepoMongodb from "./user/user-repo/user-repo.mongodb";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(cookieParser());

pubSubInMemory.sub((event) => {
  console.log("App Event", event);
});

//
//
// api
//
//

const userRepoMongoDb = makeUserRepoMongodb({ db: productionDb });

useTodoListApi({
  pubSub: pubSubInMemory,
  repo: todoListRepoInMemory,
  app,
});
useUserApi({
  pubSub: pubSubInMemory,
  // repo: userRepoInMemory,
  repo: userRepoMongoDb,
  app,
});

//
//
// frontend app
//
//

app.use(express.static(path.resolve(__dirname, "..", "..", "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "..", "dist", "index.html"));
});

//
//
// run
//
//

const port = Number(process.env.PORT) || Number(process.env.port) || 5000;

app.listen(port, () => {
  console.clear();
  console.log(`Server started. http://localhost:${port}`);
});
