import express from "express";

//
//
//
//
//
//

const app = express();

//
//
//
//
//
//

app.get("/", (req, res) => {
  res.json({ message: "Hello from the backend" });
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
