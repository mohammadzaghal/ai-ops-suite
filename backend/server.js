import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { getState, setState } from "./storage.js";

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json({ limit: "200kb" }));

app.use(
  cors({
    origin: FRONTEND_ORIGIN === "*" ? true : FRONTEND_ORIGIN,
    credentials: false
  })
);

app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);

const Status = z.enum(["todo", "in_progress", "done"]);
const Priority = z.enum(["low", "medium", "high"]);

const TaskCreate = z.object({
  title: z.string().trim().min(3).max(120),
  priority: Priority.default("medium"),
  assignee: z.string().trim().min(2).max(60).default("Unassigned"),
  dueDate: z.string().date().nullable().optional()
});

const TaskUpdate = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  status: Status.optional(),
  priority: Priority.optional(),
  assignee: z.string().trim().min(2).max(60).optional(),
  dueDate: z.string().date().nullable().optional()
});

function nowIso() {
  return new Date().toISOString();
}

function normalizeQuery(q) {
  return (q ?? "").toString().trim().toLowerCase();
}

function compare(a, b, dir) {
  if (a === b) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return dir === "asc" ? (a > b ? 1 : -1) : (a < b ? 1 : -1);
}

app.get("/health", async (req, res) => {
  res.json({ ok: true, service: "hyginix-ai-ops-suite-api" });
});

app.get("/api/tasks", async (req, res) => {
  const state = await getState();
  const q = normalizeQuery(req.query.q);
  const status = req.query.status?.toString();
  const priority = req.query.priority?.toString();
  const sort = (req.query.sort ?? "updatedAt").toString();
  const dir = (req.query.dir ?? "desc").toString() === "asc" ? "asc" : "desc";
  const page = Math.max(1, Number(req.query.page ?? 1) || 1);
  const pageSize = Math.min(50, Math.max(5, Number(req.query.pageSize ?? 10) || 10));

  let items = state.tasks;

  if (q) {
    items = items.filter(t =>
      `${t.title} ${t.assignee ?? ""}`.toLowerCase().includes(q)
    );
  }
  if (status && ["todo", "in_progress", "done"].includes(status)) {
    items = items.filter(t => t.status === status);
  }
  if (priority && ["low", "medium", "high"].includes(priority)) {
    items = items.filter(t => t.priority === priority);
  }

  items = [...items].sort((a, b) => compare(a[sort], b[sort], dir));

  const total = items.length;
  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);

  res.json({
    meta: { total, page, pageSize, sort, dir, q, status: status ?? null, priority: priority ?? null },
    items: paged
  });
});

app.post("/api/tasks", async (req, res) => {
  const parsed = TaskCreate.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
  }

  const payload = parsed.data;
  const createdAt = nowIso();

  const next = await setState(state => {
    const task = {
      id: state.nextId++,
      title: payload.title,
      status: "todo",
      priority: payload.priority,
      assignee: payload.assignee,
      dueDate: payload.dueDate ?? null,
      createdAt,
      updatedAt: createdAt
    };
    state.tasks.unshift(task);
    return state;
  });

  const created = next.tasks[0];
  res.status(201).json(created);
});

app.patch("/api/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

  const parsed = TaskUpdate.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
  }

  const payload = parsed.data;

  let updated = null;

  await setState(state => {
    const idx = state.tasks.findIndex(t => t.id === id);
    if (idx === -1) return state;

    const cur = state.tasks[idx];
    const next = {
      ...cur,
      ...payload,
      updatedAt: nowIso()
    };

    state.tasks[idx] = next;
    updated = next;
    return state;
  });

  if (!updated) return res.status(404).json({ error: "Task not found" });
  res.json(updated);
});

app.delete("/api/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

  let removed = false;

  await setState(state => {
    const before = state.tasks.length;
    state.tasks = state.tasks.filter(t => t.id !== id);
    removed = state.tasks.length !== before;
    return state;
  });

  if (!removed) return res.status(404).json({ error: "Task not found" });
  res.status(204).send();
});

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
