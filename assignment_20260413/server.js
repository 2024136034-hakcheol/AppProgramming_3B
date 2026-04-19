import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config.js";
import { makeKey, get as cacheGet, set as cacheSet } from "./cache.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

// MIME 타입 맵
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

// ─── API 호출 (Rate Limit 폴백 포함) ─────────────────────────────────────────
async function callWithFallback(models, messages, maxTokens = 2048, onRetry = null) {
  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch(config.baseURL, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
      });
      if (res.status === 429) {
        const wait = 15 * (attempt + 1);
        console.log(`  rate limit [${model}], ${wait}초 후 재시도...`);
        if (onRetry) onRetry({ model, attempt, wait });
        await new Promise((r) => setTimeout(r, wait * 1000));
        continue;
      }
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.log(`  오류 [${model}]: ${res.status} ${body.slice(0, 80)}`);
        break;
      }
      const data = await res.json();
      return data.choices[0].message.content;
    }
  }
  throw new Error("모든 모델 시도 실패");
}

// ─── 재료 인식 (Vision) ────────────────────────────────────────────────────
async function recognizeIngredients(base64Image, mimeType) {
  const models = [config.models.image, ...config.models.imageFallbacks];
  return callWithFallback(
    models,
    [
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } },
          {
            type: "text",
            text: "이 냉장고 사진에서 보이는 식재료를 모두 찾아서 한국어로 목록으로 알려줘. 형식: 재료1, 재료2, 재료3 (쉼표로 구분, 다른 설명 없이 재료 목록만)",
          },
        ],
      },
    ],
    512
  );
}

// ─── 레시피 추천 (LLM) ─────────────────────────────────────────────────────
function buildRecipePrompt(ingredients, options = {}) {
  const { cuisine = "", maxTime = "", difficulty = "", language = "ko" } = options;

  const langMap = { ko: "한국어", en: "English", ja: "日本語" };
  const outputLang = langMap[language] || "한국어";

  let filters = "";
  if (cuisine) filters += `\n- 요리 종류: ${cuisine}`;
  if (maxTime) filters += `\n- 조리 시간: ${maxTime}분 이내`;
  if (difficulty) filters += `\n- 난이도: ${difficulty}`;

  return `다음 재료들로 만들 수 있는 레시피 3개를 ${outputLang}로 추천해줘.

재료: ${ingredients}${filters ? "\n\n조건:" + filters : ""}

각 레시피는 반드시 다음 형식으로 작성해줘:
## 레시피명
**필요 재료:** ...
**예상 조리 시간:** N분
**난이도:** 쉬움/보통/어려움
**예상 칼로리:** 약 N kcal
**영양 정보:** 탄수화물 Ng, 단백질 Ng, 지방 Ng (1인분 기준)
**조리 순서:**
1. ...
2. ...
3. ...
**없는 재료 (쇼핑 필요):** ...`;
}

async function recommendRecipes(ingredients, options = {}) {
  // 캐시 확인
  const key = makeKey(ingredients, options);
  const cached = cacheGet(key);
  if (cached) {
    console.log("  캐시 히트:", key.slice(0, 8));
    return { recipes: cached, cached: true };
  }

  const models = [config.models.text, ...config.models.textFallbacks];
  const recipes = await callWithFallback(
    models,
    [{ role: "user", content: buildRecipePrompt(ingredients, options) }],
    2048
  );

  cacheSet(key, recipes);
  return { recipes, cached: false };
}

// ─── multipart/form-data 파싱 ─────────────────────────────────────────────
function parseMultipart(body, boundary) {
  const boundaryBuf = Buffer.from("--" + boundary);
  const parts = [];
  let start = body.indexOf(boundaryBuf) + boundaryBuf.length + 2;

  while (start < body.length) {
    const end = body.indexOf(boundaryBuf, start);
    if (end === -1) break;
    const part = body.slice(start, end - 2);
    const headerEnd = part.indexOf(Buffer.from("\r\n\r\n"));
    if (headerEnd === -1) {
      start = end + boundaryBuf.length + 2;
      continue;
    }
    const headers = part.slice(0, headerEnd).toString();
    const data = part.slice(headerEnd + 4);
    const nameMatch = headers.match(/name="([^"]+)"/);
    const filenameMatch = headers.match(/filename="([^"]+)"/);
    const ctMatch = headers.match(/Content-Type:\s*(\S+)/i);
    parts.push({
      name: nameMatch?.[1],
      filename: filenameMatch?.[1],
      contentType: ctMatch?.[1],
      data,
    });
    start = end + boundaryBuf.length + 2;
  }
  return parts;
}

// ─── JSON body 파싱 ───────────────────────────────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// ─── HTTP 서버 ─────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // 정적 파일 서빙
  if (req.method === "GET") {
    const filePath =
      url.pathname === "/"
        ? path.join(__dirname, "public", "index.html")
        : path.join(__dirname, "public", url.pathname);

    const ext = path.extname(filePath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      return res.end(fs.readFileSync(filePath));
    }
  }

  // ── POST /analyze : 이미지 → 재료 인식 + 레시피 추천 ────────────────────
  if (req.method === "POST" && url.pathname === "/analyze") {
    try {
      const body = await readBody(req);
      const contentType = req.headers["content-type"] || "";
      const boundaryMatch = contentType.match(/boundary=(.+)/);
      if (!boundaryMatch) throw new Error("boundary 없음");

      const parts = parseMultipart(body, boundaryMatch[1]);
      const filePart = parts.find((p) => p.name === "image");
      if (!filePart) throw new Error("이미지 없음");

      // 옵션 파싱
      const optionsPart = parts.find((p) => p.name === "options");
      let options = {};
      if (optionsPart) {
        try { options = JSON.parse(optionsPart.data.toString()); } catch {}
      }

      const base64 = filePart.data.toString("base64");
      const mimeType = filePart.contentType || "image/jpeg";

      console.log("재료 인식 중...");
      const ingredients = await recognizeIngredients(base64, mimeType);
      console.log("인식된 재료:", ingredients);

      console.log("레시피 추천 중...");
      const { recipes, cached } = await recommendRecipes(ingredients, options);
      console.log(`레시피 추천 완료 (캐시: ${cached})`);

      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ingredients, recipes, cached }));
    } catch (e) {
      console.error("오류:", e.message);
      res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ── POST /reanalyze : 재료 직접 입력 → 레시피 추천 ─────────────────────
  if (req.method === "POST" && url.pathname === "/reanalyze") {
    try {
      const body = await readBody(req);
      const { ingredients, cuisine, maxTime, difficulty, language } = JSON.parse(body.toString());
      if (!ingredients) throw new Error("재료 없음");

      console.log("재레시피 추천 중... 재료:", ingredients);
      const options = { cuisine, maxTime, difficulty, language };
      const { recipes, cached } = await recommendRecipes(ingredients, options);
      console.log(`레시피 추천 완료 (캐시: ${cached})`);

      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ingredients, recipes, cached }));
    } catch (e) {
      console.error("오류:", e.message);
      res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`FridgeChef 서버 실행 중: http://localhost:${PORT}`);
});
