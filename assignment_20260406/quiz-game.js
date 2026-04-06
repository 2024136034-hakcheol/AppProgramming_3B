// quiz-game.js — 퀴즈 게임 로직

const TIMER_SECONDS = 15;
const LEADERBOARD_KEY = "leaderboard";

const gameState = {
  playerName: "",
  category: "",
  questions: [],
  currentIndex: 0,
  score: 0,
  wrongAnswers: [],
  timerInterval: null,
  timeLeft: 0,
};

// ── 화면 전환 ──────────────────────────────────────────────
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
}

// ── 시작 ──────────────────────────────────────────────────
function startGame() {
  const name = document.getElementById("input-name").value.trim();
  if (!name) { alert("닉네임을 입력해 주세요."); return; }
  gameState.playerName = name;
  document.getElementById("player-greeting").textContent = `안녕하세요, ${name}님! 카테고리를 선택하세요.`;
  showScreen("screen-category");
}

// ── 카테고리 선택 ──────────────────────────────────────────
function selectCategory(category) {
  gameState.category = category;
  const pool = category === "전체"
    ? [...QUESTIONS]
    : QUESTIONS.filter(q => q.category === category);
  gameState.questions = shuffle(pool);
  gameState.currentIndex = 0;
  gameState.score = 0;
  gameState.wrongAnswers = [];
  showScreen("screen-quiz");
  loadQuestion();
}

// ── 문제 로드 ─────────────────────────────────────────────
function loadQuestion() {
  const q = gameState.questions[gameState.currentIndex];
  const total = gameState.questions.length;

  document.getElementById("quiz-progress").textContent =
    `${gameState.currentIndex + 1} / ${total}`;
  document.getElementById("quiz-category").textContent = q.category;
  document.getElementById("question-text").textContent = q.question;

  const choicesEl = document.getElementById("choices");
  choicesEl.innerHTML = "";
  q.choices.forEach((choice, i) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice;
    btn.onclick = () => selectAnswer(i);
    choicesEl.appendChild(btn);
  });

  document.getElementById("feedback-box").style.display = "none";
  document.getElementById("btn-next").style.display = "none";

  startTimer();
}

// ── 타이머 ────────────────────────────────────────────────
function startTimer() {
  clearInterval(gameState.timerInterval);
  gameState.timeLeft = TIMER_SECONDS;
  updateTimerUI();

  gameState.timerInterval = setInterval(() => {
    gameState.timeLeft--;
    updateTimerUI();
    if (gameState.timeLeft <= 0) {
      clearInterval(gameState.timerInterval);
      handleTimeout();
    }
  }, 1000);
}

function updateTimerUI() {
  const pct = (gameState.timeLeft / TIMER_SECONDS) * 100;
  const bar = document.getElementById("timer-bar");
  bar.style.width = pct + "%";
  bar.style.background = gameState.timeLeft <= 5 ? "#dc3545"
    : gameState.timeLeft <= 10 ? "#ffc107" : "#4f8ef7";
  document.getElementById("timer-display").textContent = gameState.timeLeft;
}

function handleTimeout() {
  disableChoices();
  const q = gameState.questions[gameState.currentIndex];
  highlightAnswer(q.answer, -1);
  showFeedback(`⏰ 시간 초과! 정답은 "${q.choices[q.answer]}"입니다.\n${q.explanation}`);
  gameState.wrongAnswers.push({ question: q.question, chosen: "시간 초과", correct: q.choices[q.answer] });
  document.getElementById("btn-next").style.display = "block";
}

// ── 답안 선택 ─────────────────────────────────────────────
function selectAnswer(chosenIndex) {
  clearInterval(gameState.timerInterval);
  disableChoices();

  const q = gameState.questions[gameState.currentIndex];
  const isCorrect = chosenIndex === q.answer;

  highlightAnswer(q.answer, chosenIndex);

  if (isCorrect) {
    let gained = 10;
    if (gameState.timeLeft >= 10) gained += 5;
    else if (gameState.timeLeft >= 5) gained += 3;
    gameState.score += gained;
    showFeedback(`✅ 정답입니다! (+${gained}점)\n${q.explanation}`);
  } else {
    gameState.wrongAnswers.push({
      question: q.question,
      chosen: q.choices[chosenIndex],
      correct: q.choices[q.answer]
    });
    showFeedback(`❌ 오답! 정답은 "${q.choices[q.answer]}"입니다.\n${q.explanation}`);
  }

  document.getElementById("btn-next").style.display = "block";
}

function highlightAnswer(correctIndex, chosenIndex) {
  const btns = document.querySelectorAll(".choice-btn");
  btns[correctIndex].classList.add("correct");
  if (chosenIndex >= 0 && chosenIndex !== correctIndex) {
    btns[chosenIndex].classList.add("wrong");
  }
}

function disableChoices() {
  document.querySelectorAll(".choice-btn").forEach(btn => { btn.disabled = true; });
}

function showFeedback(text) {
  const box = document.getElementById("feedback-box");
  box.textContent = text;
  box.style.display = "block";
}

// ── 다음 문제 / 결과 ──────────────────────────────────────
function nextQuestion() {
  gameState.currentIndex++;
  if (gameState.currentIndex < gameState.questions.length) {
    loadQuestion();
  } else {
    endGame();
  }
}

// ── 게임 종료 ─────────────────────────────────────────────
function endGame() {
  applyBonusScore();
  saveLeaderboard();
  renderResult();
  showScreen("screen-result");
}

function applyBonusScore() {
  const total = gameState.questions.length;
  const wrong = gameState.wrongAnswers.length;
  const correct = total - wrong;

  if (gameState.category !== "전체" && correct === 10) {
    gameState.score += 20; // 카테고리 만점
  }
  if (gameState.category === "전체" && correct === 40) {
    gameState.score += 50; // 전체 만점
  }
}

function renderResult() {
  document.getElementById("score-display").textContent = gameState.score + "점";
  const total = gameState.questions.length;
  const correct = total - gameState.wrongAnswers.length;
  document.getElementById("result-summary").textContent =
    `${gameState.playerName}님 — ${total}문제 중 ${correct}문제 정답`;

  const list = document.getElementById("wrong-list");
  list.innerHTML = "";
  if (gameState.wrongAnswers.length === 0) {
    list.innerHTML = "<li>오답이 없습니다. 완벽한 점수!</li>";
  } else {
    gameState.wrongAnswers.forEach(w => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>Q.</strong> ${w.question}<br>내 답: ${w.chosen} / 정답: <strong>${w.correct}</strong>`;
      list.appendChild(li);
    });
  }

  renderLeaderboard();
}

// ── LocalStorage 순위 ─────────────────────────────────────
function saveLeaderboard() {
  const board = getLeaderboard();
  board.push({
    name: gameState.playerName,
    category: gameState.category,
    score: gameState.score,
    total: gameState.questions.length * 10,
    date: new Date().toISOString().slice(0, 10)
  });
  board.sort((a, b) => b.score - a.score);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(board.slice(0, 50)));
}

function getLeaderboard() {
  try { return JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || []; }
  catch { return []; }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderLeaderboard() {
  const board = getLeaderboard();
  const tbody = document.getElementById("leaderboard-body");
  tbody.innerHTML = "";
  board.forEach((entry, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i + 1}</td><td>${escapeHtml(entry.name)}</td><td>${escapeHtml(entry.category)}</td><td>${escapeHtml(entry.score)}</td><td>${escapeHtml(entry.date)}</td>`;
    tbody.appendChild(tr);
  });
}

// ── 유틸 ──────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
