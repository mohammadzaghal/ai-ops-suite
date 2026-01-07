const $ = (id) => document.getElementById(id);

const apiUrl = $("apiUrl");
const saveApi = $("saveApi");

const createForm = $("createForm");
const title = $("title");
const assignee = $("assignee");
const priority = $("priority");
const dueDate = $("dueDate");
const clearForm = $("clearForm");

const q = $("q");
const status = $("status");
const priorityFilter = $("priorityFilter");
const sort = $("sort");
const dir = $("dir");
const pageSize = $("pageSize");

const refresh = $("refresh");
const meta = $("meta");
const list = $("list");
const prev = $("prev");
const next = $("next");
const pageInfo = $("pageInfo");
const toast = $("toast");

const KEY = "hyginix_ops_api";
let page = 1;
let total = 0;

function base() {
  return localStorage.getItem(KEY) || apiUrl.value.trim();
}

function toastMsg(text, ok = true) {
  toast.textContent = text;
  toast.className = `toast show ${ok ? "ok" : "err"}`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (toast.className = "toast"), 2200);
}

function qs() {
  const p = new URLSearchParams();
  if (q.value.trim()) p.set("q", q.value.trim());
  if (status.value) p.set("status", status.value);
  if (priorityFilter.value) p.set("priority", priorityFilter.value);
  p.set("sort", sort.value);
  p.set("dir", dir.value);
  p.set("page", String(page));
  p.set("pageSize", pageSize.value);
  return p.toString();
}

async function req(path, options = {}) {
  const res = await fetch(`${base()}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || `Request failed (${res.status})`;
    throw new Error(typeof msg === "string" ? msg : "Request failed");
  }
  return data;
}

function pill(cls, text) {
  const s = document.createElement("span");
  s.className = `pill ${cls}`;
  s.textContent = text;
  return s;
}

function row(task) {
  const el = document.createElement("div");
  el.className = "cardRow";

  const top = document.createElement("div");
  top.className = "rowTop";

  const main = document.createElement("div");
  main.className = "mainLine";

  const id = document.createElement("span");
  id.className = "id";
  id.textContent = `#${task.id}`;

  const t = document.createElement("span");
  t.className = "taskTitle";
  t.textContent = task.title;

  const pills = document.createElement("div");
  pills.className = "pills";
  pills.appendChild(pill(task.status, task.status.replace("_", " ")));
  pills.appendChild(pill(task.priority, task.priority));

  main.appendChild(id);
  main.appendChild(t);

  top.appendChild(main);
  top.appendChild(pills);

  const sub = document.createElement("div");
  sub.className = "subLine";
  const left = document.createElement("div");
  left.textContent = `Assignee: ${task.assignee || "Unassigned"}`;
  const right = document.createElement("div");
  right.textContent = `Due: ${task.dueDate || "—"}  •  Updated: ${new Date(task.updatedAt).toLocaleString()}`;
  sub.appendChild(left);
  sub.appendChild(right);

  const actions = document.createElement("div");
  actions.className = "rowActions";

  const b1 = document.createElement("button");
  b1.className = "smallBtn";
  b1.type = "button";
  b1.textContent = "To do";
  b1.onclick = () => setStatus(task.id, "todo");

  const b2 = document.createElement("button");
  b2.className = "smallBtn";
  b2.type = "button";
  b2.textContent = "In progress";
  b2.onclick = () => setStatus(task.id, "in_progress");

  const b3 = document.createElement("button");
  b3.className = "smallBtn";
  b3.type = "button";
  b3.textContent = "Done";
  b3.onclick = () => setStatus(task.id, "done");

  const del = document.createElement("button");
  del.className = "smallBtn danger";
  del.type = "button";
  del.textContent = "Delete";
  del.onclick = () => remove(task.id);

  actions.append(b1, b2, b3, del);

  el.append(top, sub, actions);
  return el;
}

function skeleton(n = 6) {
  list.innerHTML = "";
  for (let i = 0; i < n; i++) {
    const s = document.createElement("div");
    s.className = "skel";
    list.appendChild(s);
  }
}

async function load() {
  skeleton();
  try {
    const data = await req(`/api/tasks?${qs()}`);
    total = data.meta.total;

    meta.textContent = `${data.meta.total} task(s) • page ${data.meta.page} • page size ${data.meta.pageSize}`;
    pageInfo.textContent = `Page ${data.meta.page} / ${Math.max(1, Math.ceil(total / data.meta.pageSize))}`;

    list.innerHTML = "";
    if (!data.items.length) {
      const empty = document.createElement("div");
      empty.className = "muted";
      empty.style.padding = "8px 2px";
      empty.textContent = "No tasks match your filters.";
      list.appendChild(empty);
      return;
    }

    data.items.forEach(t => list.appendChild(row(t)));
  } catch (e) {
    list.innerHTML = "";
    meta.textContent = "";
    pageInfo.textContent = "";
    toastMsg(e.message || "Failed to load. Check API URL.", false);
  }
}

async function setStatus(id, status) {
  try {
    await req(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
    toastMsg(`Updated #${id} → ${status.replace("_", " ")}`, true);
    await load();
  } catch (e) {
    toastMsg(e.message || "Update failed", false);
  }
}

async function remove(id) {
  try {
    await req(`/api/tasks/${id}`, { method: "DELETE" });
    toastMsg(`Deleted #${id}`, true);
    const maxPage = Math.max(1, Math.ceil((total - 1) / Number(pageSize.value)));
    page = Math.min(page, maxPage);
    await load();
  } catch (e) {
    toastMsg(e.message || "Delete failed", false);
  }
}

saveApi.onclick = async () => {
  const v = apiUrl.value.trim();
  if (!v.startsWith("http")) return toastMsg("API URL must start with http/https", false);
  localStorage.setItem(KEY, v);
  toastMsg("Saved API URL", true);
  page = 1;
  await load();
};

createForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const payload = {
      title: title.value.trim(),
      assignee: assignee.value.trim(),
      priority: priority.value,
      dueDate: dueDate.value ? dueDate.value : null
    };

    const created = await req("/api/tasks", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    toastMsg(`Created task #${created.id}`, true);
    title.value = "";
    dueDate.value = "";
    page = 1;
    await load();
  } catch (err) {
    toastMsg(err.message || "Create failed", false);
  }
});

clearForm.onclick = () => {
  title.value = "";
  assignee.value = "Unassigned";
  priority.value = "medium";
  dueDate.value = "";
};

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") clearForm.click();
});

[q, status, priorityFilter, sort, dir, pageSize].forEach(el => {
  el.addEventListener("input", () => {
    page = 1;
    load();
  });
  el.addEventListener("change", () => {
    page = 1;
    load();
  });
});

refresh.onclick = () => load();

prev.onclick = () => {
  page = Math.max(1, page - 1);
  load();
};

next.onclick = () => {
  const maxPage = Math.max(1, Math.ceil(total / Number(pageSize.value)));
  page = Math.min(maxPage, page + 1);
  load();
};

const saved = localStorage.getItem(KEY);
if (saved) apiUrl.value = saved;

load();
