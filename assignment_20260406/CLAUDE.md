# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 과제 개요

5주차 과제: **상식 퀴즈 게임** (Trivia Quiz Game)
- 4지선다 객관식 퀴즈, 카테고리 4개(한국사·과학·지리·일반상식), 문제 40개
- 순수 Vanilla JS + 단일 HTML 파일 (외부 라이브러리 금지)
- 데이터 저장: LocalStorage (순위 기록)

## 실행 방법

빌드 없음. 브라우저에서 `index.html`을 직접 열면 된다.

```
start index.html        # Windows
```

## 기술 스택 제약

- **순수 Vanilla JavaScript만 사용** — React, Vue, jQuery 등 외부 라이브러리 금지
- **단일 파일 원칙** — HTML, CSS, JS를 `index.html` 하나에 모두 작성
- **문제 데이터** — `data/questions.json` 파일로 분리, `fetch()`로 로드
- **순위 저장** — LocalStorage (`"leaderboard"` 키, JSON 배열 형식)

## 파일 구조

```
assignment_20260406/
├── CLAUDE.md
├── index.html           ← 게임 전체 UI + JS 로직
└── data/
    └── questions.json   ← 카테고리별 10문제 × 4 = 40문제
```

## 아키텍처

### 화면 전환 방식

단일 HTML 페이지 내 div show/hide (display: none ↔ block).  
`showScreen(screenId)` 함수 하나로 모든 화면 전환을 처리한다.

```
시작 화면(#screen-start)
  → 카테고리 선택(#screen-category)
    → 퀴즈(#screen-quiz)
      → 피드백(인라인, 동일 화면)
        → 결과(#screen-result)
          → 순위(#screen-leaderboard)
```

### 상태 관리

단일 `gameState` 객체로 전체 게임 상태를 관리한다.

```javascript
const gameState = {
  playerName: "",          // 닉네임
  category: "",            // 선택 카테고리 or "전체"
  questions: [],           // 셔플된 문제 배열
  currentIndex: 0,         // 현재 문제 번호
  score: 0,                // 현재 점수
  wrongAnswers: [],        // 오답 목록 [{question, chosen, correct}]
  timerInterval: null,     // 타이머 ID
  timeLeft: 0,             // 남은 시간(초)
};
```

### 점수 규칙

| 조건 | 점수 |
|------|------|
| 기본 정답 | +10점 |
| 시간 보너스 (10초 이상 남음) | +5점 |
| 시간 보너스 (5~10초 남음) | +3점 |
| 카테고리 만점 (10/10) | +20점 |
| 전체 만점 (40/40) | +50점 |

### 문제 데이터 스키마 (questions.json)

```json
{
  "id": "KH-001",
  "category": "한국사",
  "question": "문제 텍스트",
  "choices": ["①", "②", "③", "④"],
  "answer": 0,
  "explanation": "해설 텍스트",
  "difficulty": "easy"
}
```

카테고리 값: `"한국사"` | `"과학"` | `"지리"` | `"일반상식"`  
difficulty 값: `"easy"` | `"medium"` | `"hard"`

### LocalStorage 구조

```javascript
// 키: "leaderboard"
[
  {
    name: "홍길동",
    category: "한국사",   // 전체 도전이면 "전체"
    score: 85,
    total: 100,
    date: "2026-04-06"
  }
]
```

## 개발 계획 문서

이번 과제 폴더에는 구현 계획 문서가 없지만,  
이 세션에서 대화를 통해 아래 두 문서를 작성했다.

- **PRD** — 화면 5개, 점수 시스템, 제한 시간, 순위 시스템 명세
- **3단계 구현 프롬프트** — 1단계(데이터), 2단계(UI+로직), 3단계(순위+타이머+완성)

## 이전 과제 패턴 참고

| 주차 | 폴더 | 특징 |
|------|------|------|
| 2주차 | `2Week_Assignment.html` | 포트폴리오 사이트, 단일 HTML |
| 3주차 | `assignment_20260323/` | Python/Flask + CNN (손글씨 인식) |
| 4주차 | `assignment_20260330/` | Todo Manager, Vanilla JS 단일 HTML, LocalStorage |

4주차(`assignment_20260330/`)가 이번 과제와 가장 유사한 구조다.  
렌더링·LocalStorage·이벤트 연결 패턴을 참고할 수 있다.

## 퀴즈 문제 교차 검증 가이드라인
### 모든 문제 작성 시 확인 사항
1. 정답이 하나뿐인가?
  	- 다른 해석 가능 시 조건 명시 (예: 면적 기준, 2024년 기준)
2. 최상급 표현에 기준이 있는가?
  	- '가장 큰', '최초의' 등 표현에 측정 기준 명시
3. 시간과 범위가 명확한가?
  	- 변할 수 있는 정보는 시점 명시
  	- 지리적, 분류적 범위 한정
4. 교차 검증했는가?
  	- 의심스러운 정보는 2개 이상 출처 확인
  	- 논란 있는 내용은 주류 학설 기준
