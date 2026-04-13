import { config } from "./config.js";

async function chatWithFallback(primaryModel, fallbacks, messages) {
  const models = [primaryModel, ...fallbacks];
  for (const model of models) {
    if (model !== primaryModel) console.log(`  → 폴백 모델 시도: ${model}`);
    for (let i = 0; i < 2; i++) {
      const res = await fetch(config.baseURL, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({ model, messages, max_tokens: 512 }),
      });
      if (res.status === 429) {
        const wait = 15 * (i + 1);
        console.log(`  rate limit, ${wait}초 후 재시도... (${i + 1}/2)`);
        await new Promise((r) => setTimeout(r, wait * 1000));
        continue;
      }
      if (!res.ok) { console.log(`  오류 (${model}): ${res.status}`); break; }
      const data = await res.json();
      return `[${model}]\n` + data.choices[0].message.content;
    }
  }
  throw new Error("모든 모델 시도 실패 (rate limit)");
}

async function testText() {
  return chatWithFallback(
    config.models.text,
    config.models.textFallbacks,
    [{ role: "user", content: "인공지능이란 무엇인지 한국어로 두 문장으로 설명해줘." }]
  );
}

async function testImage(imageUrl, question) {
  return chatWithFallback(
    config.models.image,
    config.models.imageFallbacks,
    [{ role: "user", content: [
      { type: "image_url", image_url: { url: imageUrl } },
      { type: "text", text: question },
    ]}]
  );
}

// 테스트 실행
console.log("=".repeat(60));
console.log(`[텍스트 생성] 모델: ${config.models.text}`);
console.log("=".repeat(60));
try {
  console.log(await testText());
} catch (e) {
  console.error("오류:", e.message);
}

console.log();
console.log("=".repeat(60));
console.log(`[이미지 인식] 모델: ${config.models.image}`);
console.log("=".repeat(60));
try {
  console.log(
    await testImage(
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/320px-Cat03.jpg",
      "이 이미지에서 무엇이 보이나요? 한국어로 답해줘."
    )
  );
} catch (e) {
  console.error("오류:", e.message);
}
