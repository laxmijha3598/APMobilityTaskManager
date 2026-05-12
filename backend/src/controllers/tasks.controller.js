import mongoose from "mongoose";
import { Task } from "../models/Task.js";

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function listTasks(_req, res) {
  const tasks = await Task.find().sort({ createdAt: -1 }).lean();
  res.json({ data: tasks });
}

export async function createTask(req, res) {
  const { title, description } = req.body ?? {};

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: { message: "Title is required" } });
  }

  const task = await Task.create({
    title: title.trim(),
    description: typeof description === "string" ? description.trim() : "",
  });

  res.status(201).json({ data: task });
}

export async function updateTask(req, res) {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: { message: "Invalid task id" } });
  }

  const { title, description, completed } = req.body ?? {};

  const update = {};
  if (typeof title === "string") update.title = title.trim();
  if (typeof description === "string") update.description = description.trim();
  if (typeof completed === "boolean") update.completed = completed;

  if (Object.keys(update).length === 0) {
    return res.status(400).json({
      error: { message: "Provide at least one field to update" },
    });
  }

  if ("title" in update && !update.title) {
    return res.status(400).json({ error: { message: "Title cannot be empty" } });
  }

  const task = await Task.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });

  if (!task) {
    return res.status(404).json({ error: { message: "Task not found" } });
  }

  res.json({ data: task });
}

export async function deleteTask(req, res) {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: { message: "Invalid task id" } });
  }

  const task = await Task.findByIdAndDelete(id);
  if (!task) {
    return res.status(404).json({ error: { message: "Task not found" } });
  }

  res.json({ data: { deleted: true } });
}

