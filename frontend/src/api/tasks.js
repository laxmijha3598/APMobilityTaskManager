import { api } from "./client";

export async function fetchTasks() {
  const res = await api.get("/tasks");
  return res.data.data;
}

export async function createTask({ title, description }) {
  const res = await api.post("/tasks", { title, description });
  return res.data.data;
}

export async function updateTask(id, patch) {
  const res = await api.patch(`/tasks/${id}`, patch);
  return res.data.data;
}

export async function deleteTask(id) {
  const res = await api.delete(`/tasks/${id}`);
  return res.data.data;
}

