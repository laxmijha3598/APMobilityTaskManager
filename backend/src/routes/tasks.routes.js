import { Router } from "express";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from "../controllers/tasks.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const tasksRouter = Router();

tasksRouter.use(requireAuth);
tasksRouter.get("/", listTasks);
tasksRouter.post("/", createTask);
tasksRouter.patch("/:id", updateTask);
tasksRouter.delete("/:id", deleteTask);

