import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import cookieParser from "cookie-parser";
const app = express();
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
// ✅ allow all origins (dev-safe)
app.use(express.json());
app.use("/api", routes);

export default app;
