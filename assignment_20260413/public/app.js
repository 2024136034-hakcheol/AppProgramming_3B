// ═══════════════════════════════════════════════════════════════════════════
// FridgeChef — app.js  (Step 2 + Step 3)
// ═══════════════════════════════════════════════════════════════════════════

// ─── DOM refs ───────────────────────────────────────────────────────────────
const fileInput       = document.getElementById("fileInput");
const uploadArea      = document.getElementById("uploadArea");
const preview         = document.getElementById("preview");
const previewImg      = document.getElementById("previewImg");
const analyzeBtn      = document.getElementById("analyzeBtn");
const statusEl        = document.getElementById("status");
const ingredientsCard = document.getElementById("ingredientsCard");
const ingredientList  = document.getElementById("ingredientList");
const recipesCard     = document.getElementById("recipesCard");
const recipeList      = document.getElementById("recipeList");
const reanalyzeBtn    = document.getElementById("reanalyzeBtn");
const addIngInput     = document.getElementById("addIngInput");
const addIngBtn       = document.getElementById("addIngBtn");

// ─── State ───────────────────────────────────────────────────────────────────
let currentIngredients = [];   // 현재 편집 중인 재료 배열
let currentFile = null;        // 업로드된 파일

// ─── LocalStorage helpers ────────────────────────────────────────────────────
const LS = {
  get: (k, def = []) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } },
  set: (k, v)        => localStorage.setItem(k, JSON.stringify(v)),
};

// ─── 이미지 압축 (Step 3: 업로드 전 리사이즈) ──────────────────────────────
function compressImage(file, maxPx = 1280, quality = 0.85) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => resolve(new File([blob], file.name, { type: "image/jpeg" })),
        "image/jpeg", quality);
    };
    img.src = url;
  });
}

// ─── 업로드 UI ────────────────────────────────────────────────────────────
uploadArea.addEventListener("click", () => fileInput.click());
uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.classList.add("drag-over");
});
uploadArea.addEventListener("dragleave", () => uploadArea.classList.remove("drag-over"));
uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("drag-over");
  const f = e.dataTransfer.files[0];
  if (f && f.type.startsWith("image/")) handleFile(f);
});
fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

function handleFile(file) {
  currentFile = file;
  previewImg.src = URL.createObjectURL(file);
  preview.style.display = "block";
  analyzeBtn.disabled = false;
  ingredientsCard.classList.add("hidden");
  recipesCard.classList.add("hidden");
  statusEl.textContent = "";
}

// ─── 상태 메시지 ─────────────────────────────────────────────────────────
function setStatus(msg) {
  statusEl.innerHTML = `<span class="spinner"></span>${msg}`;
}
function clearStatus(msg = "") {
  statusEl.textContent = msg;
}

// ─── 재료 태그 렌더링 ─────────────────────────────────────────────────────
function renderIngredients() {
  ingredientList.innerHTML = currentIngredients.map((name, i) => `
    <span class="ingredient-tag">
      ${name}
      <button class="remove-btn" onclick="removeIngredient(${i})" title="삭제">✕</button>
    </span>
  `).join("");
}

window.removeIngredient = function(idx) {
  currentIngredients.splice(idx, 1);
  renderIngredients();
};

addIngBtn.addEventListener("click", () => {
  const val = addIngInput.value.trim();
  if (!val) return;
  val.split(",").map(s => s.trim()).filter(Boolean).forEach(s => currentIngredients.push(s));
  addIngInput.value = "";
  renderIngredients();
});
addIngInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addIngBtn.click();
});

// ─── 필터 값 읽기 ────────────────────────────────────────────────────────
function getFilters() {
  return {
    cuisine:    document.getElementById("filterCuisine").value,
    maxTime:    document.getElementById("filterTime").value,
    difficulty: document.getElementById("filterDifficulty").value,
    language:   document.getElementById("filterLanguage").value,
  };
}

// ─── 분석 시작 (이미지 → 재료 → 레시피) ──────────────────────────────────
analyzeBtn.addEventListener("click", async () => {
  if (!currentFile) return;
  analyzeBtn.disabled = true;
  ingredientsCard.classList.add("hidden");
  recipesCard.classList.add("hidden");

  try {
    setStatus("이미지 압축 중...");
    const compressed = await compressImage(currentFile);

    setStatus("냉장고 재료 인식 중...");
    const formData = new FormData();
    formData.append("image", compressed);
    formData.append("options", JSON.stringify(getFilters()));

    const res  = await fetch("/analyze", { method: "POST", body: formData });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    // 재료 표시
    currentIngredients = data.ingredients.split(",").map(s => s.trim()).filter(Boolean);
    renderIngredients();
    ingredientsCard.classList.remove("hidden");

    // 레시피 표시
    showRecipes(data.recipes, data.cached);

    // 히스토리 저장
    saveHistory({ ingredients: data.ingredients, recipes: data.recipes });

    clearStatus(data.cached ? "캐시에서 불러왔습니다 ⚡" : "분석 완료!");
  } catch (e) {
    clearStatus("오류: " + e.message);
  } finally {
    analyzeBtn.disabled = false;
  }
});

// ─── 재레시피 (재료 편집 후 다시 추천) ──────────────────────────────────
reanalyzeBtn.addEventListener("click", async () => {
  if (!currentIngredients.length) return;
  reanalyzeBtn.disabled = true;
  recipesCard.classList.add("hidden");

  try {
    setStatus("레시피 재추천 중...");
    const res  = await fetch("/reanalyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients: currentIngredients.join(", "), ...getFilters() }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    showRecipes(data.recipes, data.cached);
    saveHistory({ ingredients: currentIngredients.join(", "), recipes: data.recipes });
    clearStatus(data.cached ? "캐시에서 불러왔습니다 ⚡" : "레시피 추천 완료!");
  } catch (e) {
    clearStatus("오류: " + e.message);
  } finally {
    reanalyzeBtn.disabled = false;
  }
});

// ─── 레시피 렌더링 ────────────────────────────────────────────────────────
function parseRecipes(text) {
  return text.split(/(?=## )/).map(s => s.trim()).filter(Boolean);
}

function recipeToHtml(section) {
  return section
    .replace(/^## (.+)$/m, "")   // 제목은 header로 따로 추출
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .trim();
}

function extractTitle(section) {
  const m = section.match(/^## (.+)$/m);
  return m ? m[1] : "레시피";
}

function showRecipes(text, cached = false) {
  const sections = parseRecipes(text);
  recipeList.innerHTML = sections.map((s, i) => {
    const title   = extractTitle(s);
    const content = recipeToHtml(s);
    const favKey  = `fav_${Date.now()}_${i}`;
    return `
    <div class="recipe-card" data-idx="${i}">
      <div class="recipe-card-header">
        <h2>${title}${cached ? '<span class="cache-badge">⚡ 캐시</span>' : ""}</h2>
        <div class="recipe-card-actions">
          <button class="btn-icon" title="즐겨찾기 추가" onclick="toggleFavorite(this, \`${escHtml(title)}\`, \`${escHtml(text)}\`)">☆</button>
          <button class="btn-icon" title="클립보드 복사" onclick="copyRecipe(this, \`${escHtml(s)}\`)">📋</button>
        </div>
      </div>
      <div class="recipe-content">${content}</div>
    </div>`;
  }).join("");
  recipesCard.classList.remove("hidden");

  // 쇼핑 목록 자동 추출
  extractShoppingItems(text);
}

function escHtml(s) {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

// ─── 클립보드 복사 ────────────────────────────────────────────────────────
window.copyRecipe = function(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = "✅";
    setTimeout(() => { btn.textContent = "📋"; }, 1500);
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// Step 3 기능들
// ═══════════════════════════════════════════════════════════════════════════

// ─── 히스토리 ────────────────────────────────────────────────────────────
function saveHistory(entry) {
  const history = LS.get("fridge_history", []);
  history.unshift({
    id: Date.now(),
    time: new Date().toLocaleString("ko-KR"),
    ingredients: entry.ingredients,
    recipes: entry.recipes,
  });
  if (history.length > 20) history.pop();
  LS.set("fridge_history", history);
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById("historyList");
  const history = LS.get("fridge_history", []);
  if (!history.length) {
    list.innerHTML = '<p class="empty-msg">아직 분석 기록이 없어요</p>';
    return;
  }
  list.innerHTML = history.map(h => `
    <div class="history-item" onclick="loadHistory(${h.id})">
      <div class="history-item-header">
        <span class="history-item-title">🕐 ${h.time}</span>
        <button class="btn btn-danger" onclick="deleteHistory(event, ${h.id})">삭제</button>
      </div>
      <div class="history-item-ingredients">${h.ingredients}</div>
    </div>
  `).join("");
}

window.loadHistory = function(id) {
  const history = LS.get("fridge_history", []);
  const entry = history.find(h => h.id === id);
  if (!entry) return;
  currentIngredients = entry.ingredients.split(",").map(s => s.trim()).filter(Boolean);
  renderIngredients();
  ingredientsCard.classList.remove("hidden");
  showRecipes(entry.recipes, true);
  switchTab("analyze");
  clearStatus("히스토리에서 불러왔습니다");
};

window.deleteHistory = function(e, id) {
  e.stopPropagation();
  const history = LS.get("fridge_history", []).filter(h => h.id !== id);
  LS.set("fridge_history", history);
  renderHistory();
};

window.clearHistory = function() {
  if (!confirm("전체 히스토리를 삭제할까요?")) return;
  LS.set("fridge_history", []);
  renderHistory();
};

// ─── 즐겨찾기 ────────────────────────────────────────────────────────────
window.toggleFavorite = function(btn, title, fullText) {
  const favs = LS.get("fridge_favs", []);
  const exists = favs.find(f => f.title === title);
  if (exists) {
    LS.set("fridge_favs", favs.filter(f => f.title !== title));
    btn.textContent = "☆";
  } else {
    favs.unshift({ id: Date.now(), title, text: fullText, time: new Date().toLocaleString("ko-KR") });
    LS.set("fridge_favs", favs);
    btn.textContent = "★";
  }
  renderFavorites();
};

function renderFavorites() {
  const list = document.getElementById("favList");
  const favs = LS.get("fridge_favs", []);
  if (!favs.length) {
    list.innerHTML = '<p class="empty-msg">즐겨찾기한 레시피가 없어요 ☆</p>';
    return;
  }
  list.innerHTML = favs.map(f => `
    <div class="fav-item" onclick="loadFav(${f.id})">
      <div class="fav-item-header">
        <span class="history-item-title">⭐ ${f.title}</span>
        <button class="btn btn-danger" onclick="deleteFav(event, ${f.id})">삭제</button>
      </div>
      <div class="history-item-ingredients">${f.time}</div>
    </div>
  `).join("");
}

window.loadFav = function(id) {
  const fav = LS.get("fridge_favs", []).find(f => f.id === id);
  if (!fav) return;
  showRecipes(fav.text, true);
  switchTab("analyze");
  clearStatus("즐겨찾기에서 불러왔습니다");
};

window.deleteFav = function(e, id) {
  e.stopPropagation();
  LS.set("fridge_favs", LS.get("fridge_favs", []).filter(f => f.id !== id));
  renderFavorites();
};

// ─── 냉장고 관리 (가상 냉장고) ───────────────────────────────────────────
function renderFridge() {
  const grid = document.getElementById("fridgeGrid");
  const items = LS.get("fridge_items", []);
  if (!items.length) {
    grid.innerHTML = '<p class="empty-msg">냉장고가 비어 있어요 🧊</p>';
    return;
  }
  grid.innerHTML = items.map((item, i) => `
    <div class="fridge-item">
      <button class="fridge-item-remove" onclick="removeFridgeItem(${i})">✕</button>
      <div class="fridge-item-name">${item.name}</div>
      <div class="fridge-item-qty">${item.qty || ""}</div>
    </div>
  `).join("");
}

window.removeFridgeItem = function(idx) {
  const items = LS.get("fridge_items", []);
  items.splice(idx, 1);
  LS.set("fridge_items", items);
  renderFridge();
};

window.addFridgeItem = function() {
  const nameEl = document.getElementById("fridgeName");
  const qtyEl  = document.getElementById("fridgeQty");
  const name   = nameEl.value.trim();
  if (!name) return;
  const items = LS.get("fridge_items", []);
  const qty   = qtyEl.value.trim();
  const existing = items.find(i => i.name === name);
  if (existing) { existing.qty = qty; }
  else { items.push({ name, qty }); }
  LS.set("fridge_items", items);
  nameEl.value = "";
  qtyEl.value  = "";
  renderFridge();
};

window.analyzeFromFridge = function() {
  const items = LS.get("fridge_items", []);
  if (!items.length) { alert("냉장고가 비어 있어요!"); return; }
  currentIngredients = items.map(i => i.name);
  renderIngredients();
  ingredientsCard.classList.remove("hidden");
  recipesCard.classList.add("hidden");
  switchTab("analyze");
  clearStatus("냉장고 재료를 불러왔습니다. 레시피 추천 버튼을 눌러주세요.");
};

// ─── 쇼핑 목록 추출 ───────────────────────────────────────────────────────
function extractShoppingItems(recipesText) {
  const matches = [...recipesText.matchAll(/없는 재료[^:：]*[:：]\s*([^\n]+)/g)];
  const items = [];
  matches.forEach(m => {
    m[1].split(/[,，、]/).map(s => s.trim()).filter(s => s && s !== "없음" && s !== "없음." && s.length < 30)
      .forEach(s => { if (!items.includes(s)) items.push(s); });
  });
  const shoppingCard = document.getElementById("shoppingCard");
  const shoppingList = document.getElementById("shoppingList");
  if (!items.length) { shoppingCard.classList.add("hidden"); return; }
  shoppingList.innerHTML = items.map(item => `
    <label class="shopping-item">
      <input type="checkbox" onchange="this.closest('.shopping-item').classList.toggle('checked', this.checked)">
      <span>${item}</span>
    </label>
  `).join("");
  shoppingCard.classList.remove("hidden");
}

window.clearShopping = function() {
  document.getElementById("shoppingCard").classList.add("hidden");
};

// ─── 탭 전환 ────────────────────────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("hidden", p.dataset.panel !== name));
  if (name === "history")  renderHistory();
  if (name === "favorites") renderFavorites();
  if (name === "fridge")   renderFridge();
}
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

// ─── 초기 렌더 ────────────────────────────────────────────────────────────
switchTab("analyze");
