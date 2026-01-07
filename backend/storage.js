import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data.json");
let cache = null;
let writing = Promise.resolve();

async function load() {
  if (cache) return cache;
  const raw = await fs.readFile(filePath, "utf8");
  cache = JSON.parse(raw);
  return cache;
}

async function save(next) {
  cache = next;
  writing = writing.then(() => fs.writeFile(filePath, JSON.stringify(next, null, 2), "utf8"));
  await writing;
}

export async function getState() {
  const state = await load();
  return state;
}

export async function setState(updater) {
  const state = await load();
  const next = updater(structuredClone(state));
  await save(next);
  return next;
}
