import { promises as fs } from "fs";
import path from "path";

const writeQueue = new Map<string, Promise<void>>();

function resolveFile(relativePath: string) {
  return path.join(process.cwd(), relativePath);
}

async function ensureParentDir(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export async function readJsonFile<T>(relativePath: string): Promise<T> {
  const filePath = resolveFile(relativePath);
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export async function writeJsonFile<T>(relativePath: string, value: T) {
  const filePath = resolveFile(relativePath);
  await ensureParentDir(filePath);
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

export async function updateJsonFile<T>(
  relativePath: string,
  updater: (current: T) => Promise<T> | T
) {
  const filePath = resolveFile(relativePath);
  const previous = writeQueue.get(filePath) ?? Promise.resolve();

  const next = previous.then(async () => {
    const current = await readJsonFile<T>(relativePath);
    const updated = await updater(current);
    await writeJsonFile(relativePath, updated);
  });

  writeQueue.set(filePath, next.catch(() => undefined));
  await next;
}
