import express from "express";
import cors from "cors";
import { endpoints } from "./shared";

//
//
//
//
//
//

const app = express();

app.use(cors());
app.use(express.json());

//
//
//
//
//
//

app.get("/", (req, res) => {
  res.json({ message: "Hello from the backend" });
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Hello from backend. /api/test" });
});

app.post(endpoints.postTodoItem, (req, res) => {
  console.log("POST TODO", req.body.text, req.body.id);

  setTimeout(() => {
    res.status(201).end();
  }, 2000);
});

//
//
//
//
//
//

const port = Number(process.env.PORT) || Number(process.env.port) || 5000;

app.listen(port, () => {
  console.log(`Server listening.\n http://localhost:${port}`);
});
