import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";

const __dir = dirname(fileURLToPath(import.meta.url));
const CACHE_FILE = resolve(__dir, ".cache.json");
const TTL_MS = 24 * 60 * 60 * 1000; // 24시간

let cache = {};
if (existsSync(CACHE_FILE)) {
  try {
    cache = JSON.parse(readFileSync(CACHE_FILE, "utf-8"));
  } catch {}
}

function save() {
  try {
    writeFileSync(CACHE_FILE, JSON.stringify(cache));
  } catch {}
}

// 재료 + 옵션 조합으로 캐시 키 생성
export function makeKey(ingredients, options = {}) {
  const normalized = ingredients
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .sort()
    .join(",");
  const str = JSON.stringify({ i: normalized, ...options });
  return createHash("md5").update(str).digest("hex");
}

export function get(key) {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL_MS) {
    delete cache[key];
    save();
    return null;
  }
  return entry.value;
}

export function set(key, value) {
  cache[key] = { value, ts: Date.now() };
  save();
}

export function size() {
  return Object.keys(cache).length;
}
