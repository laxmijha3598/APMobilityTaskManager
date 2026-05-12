import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import { connectDb } from "./utils/connectDb.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { tasksRouter } from "./routes/tasks.routes.js";
import { authRouter } from "./routes/auth.routes.js";

const app = express();

app.use(cors({
  origin: "*"
}));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/tasks", tasksRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;


await connectDb(process.env.MONGODB_URI);


app.listen(PORT, () => {
  // eslint-disable-next-line no-console
   
  console.log(`API listening on http://localhost:${PORT}`);
});

