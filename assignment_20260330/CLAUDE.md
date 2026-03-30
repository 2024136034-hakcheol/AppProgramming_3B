# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

개인용 할 일 관리 웹 앱 (Todo Manager). 단일 HTML 파일(`index.html`)로 완성되며, 외부 라이브러리 없이 순수 HTML + CSS + Vanilla JavaScript로 구현한다.

## 실행 방법

별도 빌드 없음. `index.html`을 브라우저에서 직접 열면 된다.

```
# 파일 탐색기에서 더블클릭 또는:
start index.html        # Windows
```

## 기술 스택 제약

- **순수 Vanilla JavaScript만 사용** — React, Vue, jQuery 등 외부 라이브러리 금지
- **단일 파일 원칙** — HTML, CSS, JS를 `index.html` 하나에 모두 작성
- **데이터 저장** — 브라우저 LocalStorage (`"todos"` 키, JSON 배열 형식)

## 아키텍처

### 데이터 흐름

```
사용자 액션
    ↓
이벤트 핸들러 (addTodo / toggleTodo / editTodo / deleteTodo)
    ↓
todos 배열 변경
    ↓
saveTodos()  →  LocalStorage 저장
    ↓
renderTodos()  →  DOM 전체 재렌더링
    ↓
updateProgress()  →  진행률 바 갱신
```

### 핵심 전역 상태

| 변수 | 역할 |
|------|------|
| `todos` | 할 일 배열 (loadTodos()로 초기화) |
| `currentFilter` | 현재 카테고리 필터 (`"전체"` \| `"업무"` \| `"개인"` \| `"공부"`) |

### 데이터 구조

```javascript
// LocalStorage key: "todos"
{
  id: Number,          // Date.now()
  text: String,
  category: String,    // "업무" | "개인" | "공부"
  completed: Boolean,
  createdAt: String    // ISO 8601
}
```

### 렌더링 규칙

- `renderTodos()`는 DOM을 항상 전체 재렌더링 (diffing 없음)
- 미완료 항목 → 완료 항목 순으로 정렬 후 표시
- `currentFilter` 기준으로 필터링 후 렌더링
- 렌더링 후 반드시 `updateProgress()` 호출

## 개발 계획 문서

- `PRD.md` — 기능 요구사항 전체 명세
- `PROMPTS.md` — 5단계 구현 프롬프트 (STEP 1~5 순서로 진행)
