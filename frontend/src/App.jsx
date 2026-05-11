import React, { useEffect, useMemo, useState } from "react";
import { createTask, deleteTask, fetchTasks, updateTask } from "./api/tasks";
import { login, me, register } from "./api/auth";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "";
  }
}

function Button({ variant = "primary", ...props }) {
  return <button className={`btn btn-${variant}`} {...props} />;
}

function TextInput(props) {
  return <input className="input" {...props} />;
}

function TextArea(props) {
  return <textarea className="textarea" {...props} />;
}

function Modal({ title, children, onClose }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modalCard">
        <div className="modalHeader">
          <div className="modalTitle">{title}</div>
          <button className="iconBtn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  );
}

function AuthCard({ mode, setMode, onAuthed }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isRegister = mode === "register";
  const canSubmit =
    email.trim().length > 0 && password.length >= 6 && (isRegister ? true : true);

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const data = isRegister
        ? await register({ name, email, password })
        : await login({ email, password });
      localStorage.setItem("access_token", data.token);
      onAuthed(data.user);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Auth failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card authCard">
      <div className="authHeader">
        <div>
          <div className="authTitle">Welcome</div>
          <div className="authSubtitle">Login or create an account to manage your tasks.</div>
        </div>
        <div className="segmented">
          <button
            className={`segBtn ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setError("");
            }}
            type="button"
          >
            Login
          </button>
          <button
            className={`segBtn ${mode === "register" ? "active" : ""}`}
            onClick={() => {
              setMode("register");
              setError("");
            }}
            type="button"
          >
            Register
          </button>
        </div>
      </div>

      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit || busy) return;
          submit();
        }}
      >
        {isRegister ? (
          <label className="label">
            <div className="labelText">Name (optional)</div>
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={80}
              autoFocus
            />
          </label>
        ) : null}

        <label className="label">
          <div className="labelText">Email</div>
          <TextInput
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoFocus={!isRegister}
          />
        </label>

        <label className="label">
          <div className="labelText">Password (min 6 chars)</div>
          <TextInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
          />
        </label>

        {error ? <div className="inlineError">{error}</div> : null}

        <div className="row">
          <Button type="submit" disabled={busy || !canSubmit}>
            {busy ? "Please wait…" : isRegister ? "Create account" : "Login"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function TaskForm({ initial, onCancel, onSubmit, submitting }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  const canSubmit = title.trim().length > 0 && !submitting;

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit({ title: title.trim(), description: description.trim() });
      }}
    >
      <label className="label">
        <div className="labelText">Title</div>
        <TextInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Finish assignment"
          maxLength={120}
          autoFocus
        />
      </label>

      <label className="label">
        <div className="labelText">Description (optional)</div>
        <TextArea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details…"
          rows={4}
          maxLength={1000}
        />
      </label>

      <div className="row">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {submitting ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState("");
  const [authMode, setAuthMode] = useState("login");

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completed).length;
    return { total, done, left: total - done };
  }, [tasks]);

  async function load() {
    setStatus({ loading: true, error: "" });
    try {
      const list = await fetchTasks();
      setTasks(list);
      setStatus({ loading: false, error: "" });
    } catch (e) {
      const message = e?.response?.data?.error?.message || e.message || "Failed to load";
      if (e?.response?.status === 401) {
        localStorage.removeItem("access_token");
        setUser(null);
        setTasks([]);
        setStatus({ loading: false, error: "Session expired. Please login again." });
        return;
      }
      setStatus({
        loading: false,
        error: message,
      });
    }
  }

  useEffect(() => {
    async function boot() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setStatus({ loading: false, error: "" });
        return;
      }
      try {
        const u = await me();
        setUser(u);
        await load();
      } catch (_e) {
        localStorage.removeItem("access_token");
        setUser(null);
        setTasks([]);
        setStatus({ loading: false, error: "" });
      }
    }

    boot();
  }, []);

  async function onCreate(payload) {
    setBusyId("create");
    try {
      const created = await createTask(payload);
      setTasks((prev) => [created, ...prev]);
      setCreating(false);
    } catch (e) {
      alert(e?.response?.data?.error?.message || e.message || "Create failed");
    } finally {
      setBusyId("");
    }
  }

  async function onEditSubmit(payload) {
    if (!editing?._id) return;
    setBusyId(editing._id);
    try {
      const updated = await updateTask(editing._id, payload);
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      setEditing(null);
    } catch (e) {
      alert(e?.response?.data?.error?.message || e.message || "Update failed");
    } finally {
      setBusyId("");
    }
  }

  async function toggleCompleted(task) {
    setBusyId(task._id);
    try {
      const updated = await updateTask(task._id, { completed: !task.completed });
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    } catch (e) {
      alert(e?.response?.data?.error?.message || e.message || "Update failed");
    } finally {
      setBusyId("");
    }
  }

  async function remove(task) {
    const ok = confirm(`Delete "${task.title}"?`);
    if (!ok) return;
    setBusyId(task._id);
    try {
      await deleteTask(task._id);
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
    } catch (e) {
      alert(e?.response?.data?.error?.message || e.message || "Delete failed");
    } finally {
      setBusyId("");
    }
  }

  function logout() {
    localStorage.removeItem("access_token");
    setUser(null);
    setTasks([]);
    setCreating(false);
    setEditing(null);
    setStatus({ loading: false, error: "" });
  }

  if (!user) {
    return (
      <div className="page">
        <header className="header">
          <div>
            <div className="title">Task Manager</div>
            <div className="subtitle">Sign in to manage your personal task list.</div>
          </div>
        </header>

        <main className="main">
          <AuthCard
            mode={authMode}
            setMode={setAuthMode}
            onAuthed={(u) => {
              setUser(u);
              setStatus({ loading: true, error: "" });
              load();
            }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <div className="title">Task Manager</div>
          <div className="subtitle">
            {stats.total} total • {stats.done} completed • {stats.left} left
          </div>
        </div>
        <div className="headerActions">
          <Button onClick={() => setCreating(true)}>+ Add Task</Button>
          <div className="userPill" title={user.email}>
            {user.name ? user.name : user.email}
          </div>
          <Button variant="ghost" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="main">
        {status.loading ? (
          <div className="card">Loading…</div>
        ) : status.error ? (
          <div className="card error">
            <div className="errorTitle">Couldn’t load tasks</div>
            <div className="errorText">{status.error}</div>
            <div className="row">
              <Button variant="ghost" onClick={load}>
                Retry
              </Button>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="card empty">
            <div className="emptyTitle">No tasks yet</div>
            <div className="emptyText">Create your first task to get started.</div>
            <div className="row">
              <Button onClick={() => setCreating(true)}>Add Task</Button>
            </div>
          </div>
        ) : (
          <div className="grid">
            {tasks.map((t) => {
              const isBusy = busyId === t._id;
              return (
                <div className="taskCard" key={t._id}>
                  <div className="taskTop">
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={!!t.completed}
                        onChange={() => toggleCompleted(t)}
                        disabled={isBusy}
                      />
                      <span className="checkLabel">Completed</span>
                    </label>
                    <div className="taskActions">
                      <button
                        className="linkBtn"
                        onClick={() => setEditing(t)}
                        disabled={isBusy}
                      >
                        Edit
                      </button>
                      <button
                        className="linkBtn danger"
                        onClick={() => remove(t)}
                        disabled={isBusy}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className={`taskTitle ${t.completed ? "done" : ""}`}>
                    {t.title}
                  </div>

                  {t.description ? (
                    <div className="taskDesc">{t.description}</div>
                  ) : (
                    <div className="taskDesc muted">No description</div>
                  )}

                  <div className="taskMeta">Created: {formatDate(t.createdAt)}</div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {creating ? (
        <Modal title="Add Task" onClose={() => setCreating(false)}>
          <TaskForm
            submitting={busyId === "create"}
            onCancel={() => setCreating(false)}
            onSubmit={onCreate}
          />
        </Modal>
      ) : null}

      {editing ? (
        <Modal title="Edit Task" onClose={() => setEditing(null)}>
          <TaskForm
            initial={editing}
            submitting={busyId === editing._id}
            onCancel={() => setEditing(null)}
            onSubmit={onEditSubmit}
          />
        </Modal>
      ) : null}
    </div>
  );
}

