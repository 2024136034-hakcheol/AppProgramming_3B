import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

// 폴백 포함 OpenRouter API 호출
async function callWithFallback(models, messages) {
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await fetch(config.baseURL, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({ model, messages, max_tokens: 1024 }),
      });
      if (res.status === 429) {
        const wait = 15 * (attempt + 1);
        console.log(`  rate limit [${model}], ${wait}초 후 재시도...`);
        await new Promise((r) => setTimeout(r, wait * 1000));
        continue;
      }
      if (!res.ok) {
        console.log(`  오류 [${model}]: ${res.status}`);
        break;
      }
      const data = await res.json();
      return data.choices[0].message.content;
    }
  }
  throw new Error("모든 모델 시도 실패");
}

// 냉장고 이미지에서 재료 인식
async function recognizeIngredients(base64Image, mimeType) {
  const models = [config.models.image, ...config.models.imageFallbacks];
  return callWithFallback(models, [
    {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: { url: `data:${mimeType};base64,${base64Image}` },
        },
        {
          type: "text",
          text: "이 냉장고 사진에서 보이는 식재료를 모두 찾아서 한국어로 목록으로 알려줘. 형식: 재료1, 재료2, 재료3 (쉼표로 구분, 다른 설명 없이 재료 목록만)",
        },
      ],
    },
  ]);
}

// 재료 기반 레시피 추천
async function recommendRecipes(ingredients) {
  const models = [config.models.text, ...config.models.textFallbacks];
  return callWithFallback(models, [
    {
      role: "user",
      content: `다음 재료들로 만들 수 있는 레시피 3개를 한국어로 추천해줘.\n\n재료: ${ingredients}\n\n각 레시피는 다음 형식으로:\n## 레시피명\n**필요 재료:** ...\n**조리 순서:**\n1. ...\n2. ...\n3. ...`,
    },
  ]);
}

// multipart/form-data 파싱
function parseMultipart(body, boundary) {
  const boundaryBuf = Buffer.from("--" + boundary);
  const parts = [];
  let start = body.indexOf(boundaryBuf) + boundaryBuf.length + 2;

  while (start < body.length) {
    const end = body.indexOf(boundaryBuf, start);
    if (end === -1) break;
    const part = body.slice(start, end - 2);
    const headerEnd = part.indexOf(Buffer.from("\r\n\r\n"));
    if (headerEnd === -1) { start = end + boundaryBuf.length + 2; continue; }
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

const server = http.createServer(async (req, res) => {
  // 정적 파일 서빙
  if (req.method === "GET" && req.url === "/") {
    const html = fs.readFileSync(path.join(__dirname, "public", "index.html"));
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(html);
  }

  // 분석 API
  if (req.method === "POST" && req.url === "/analyze") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", async () => {
      try {
        const body = Buffer.concat(chunks);
        const contentType = req.headers["content-type"] || "";
        const boundaryMatch = contentType.match(/boundary=(.+)/);
        if (!boundaryMatch) throw new Error("boundary 없음");

        const parts = parseMultipart(body, boundaryMatch[1]);
        const filePart = parts.find((p) => p.name === "image");
        if (!filePart) throw new Error("이미지 없음");

        const base64 = filePart.data.toString("base64");
        const mimeType = filePart.contentType || "image/jpeg";

        console.log("재료 인식 중...");
        const ingredients = await recognizeIngredients(base64, mimeType);
        console.log("인식된 재료:", ingredients);

        console.log("레시피 추천 중...");
        const recipes = await recommendRecipes(ingredients);
        console.log("레시피 추천 완료");

        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ingredients, recipes }));
      } catch (e) {
        console.error("오류:", e.message);
        res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`FridgeChef 서버 실행 중: http://localhost:${PORT}`);
});
