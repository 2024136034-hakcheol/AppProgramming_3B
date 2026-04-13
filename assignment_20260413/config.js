import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// .env 파일 직접 파싱 (외부 라이브러리 없이)
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, ".env");
const envVars = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split("\n")
    .filter((line) => line.includes("="))
    .map((line) => line.split("=").map((s) => s.trim()))
);

export const config = {
  apiKey: envVars["OPENROUTER_API_KEY"],
  baseURL: "https://openrouter.ai/api/v1/chat/completions",
  models: {
    text: "qwen/qwen3-next-80b-a3b-instruct:free",
    textFallbacks: ["qwen/qwen3-coder:free", "google/gemma-3-4b-it:free"],
    image: "qwen/qwen2.5-vl-72b-instruct:free",
    imageFallbacks: ["meta-llama/llama-3.2-11b-vision-instruct:free", "google/gemma-3-27b-it:free"],
  },
  headers: {
    "Content-Type": "application/json",
    "HTTP-Referer": "https://localhost",
    "X-Title": "VibeCoding Study-04",
  },
};

config.headers["Authorization"] = `Bearer ${config.apiKey}`;
