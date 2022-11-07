import cors from "cors";
import express from "express";
import morgan from "morgan";
import { useTodoListApi } from "./todo-list/todo-list-api.server";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

app.get("/", (req, res) => {
  res.json({ message: "Hello from server" });
});

useTodoListApi(app);

const port = Number(process.env.PORT) || Number(process.env.port) || 5000;

app.listen(port, () => {
  console.clear();
  console.log(`Server started. http://localhost:${port}`);
});
