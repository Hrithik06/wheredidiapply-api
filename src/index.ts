// import express from "express";

// const app = express();

// app.get("/health", (_, res) => {
//   res.json({ status: "ok" });
// });

// app.listen(4000, () => {
//   console.log("Server running on http://localhost:4000");
// });

import { app } from "./app.js";

app.listen(4000, () => {
  console.log("Server running on port 4000");
});
