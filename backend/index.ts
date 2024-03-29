import express, { Request, Response } from "express";

const app = express();

app.get("/api/test", (req: Request, res: Response) => {
  console.log("hi");
  res.status(200).json({
    msg: "Ini dari backend",
  });
});

app.listen(5000, () => {
  console.log("Server listening on port 5000");
});
