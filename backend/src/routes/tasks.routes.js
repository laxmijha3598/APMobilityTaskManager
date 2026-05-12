import { Router } from "express";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from "../controllers/tasks.controller.js";

export const tasksRouter = Router();

tasksRouter.get("/", listTasks);
tasksRouter.post("/", createTask);
tasksRouter.patch("/:id", updateTask);
tasksRouter.delete("/:id", deleteTask);

