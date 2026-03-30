# Claude Code 단계별 프롬프트 — Todo Manager

PRD(`PRD.md`) 기반으로 작성된 5단계 구현 프롬프트입니다.
각 단계는 독립적으로 실행하며, 이전 단계가 완료된 후 다음 단계를 진행하세요.

---

## STEP 1. HTML 골격 + CSS 스타일

```
`index.html` 파일을 새로 만들어 줘.
이 파일 하나에 HTML, CSS, JavaScript를 모두 작성할 거야.
지금은 HTML 구조와 CSS 스타일만 작성해 줘.

[HTML 구조 요구사항]
- <head>에 UTF-8 charset, viewport 메타태그, 타이틀("Todo Manager") 포함
- <body> 안에 아래 요소들을 순서대로 배치:
  1. 앱 제목 헤더 (h1)
  2. 진행률 영역: 텍스트("X / Y 완료 (Z%)") + 프로그레스 바
  3. 카테고리 필터 탭 4개: 전체 / 업무 / 개인 / 공부
  4. 할 일 입력 폼: 텍스트 입력 + 카테고리 드롭다운(업무/개인/공부) + 추가 버튼
  5. 할 일 목록 (빈 <ul>)
  6. "완료 항목 전체 삭제" 버튼
- 각 요소에 id 또는 class를 부여해서 JavaScript에서 선택할 수 있게 해 줘

[CSS 요구사항]
- 외부 라이브러리 없이 순수 CSS만 사용
- 최대 너비 600px, 화면 가운데 정렬 (데스크탑 + 모바일 대응)
- 카테고리별 배지 색상:
    업무 → 파란색 계열
    개인 → 초록색 계열
    공부 → 보라색 계열
- 활성 필터 탭은 강조 표시 (배경색 또는 밑줄)
- 완료된 항목은 텍스트에 취소선, 전체 행은 흐린 색으로 표시
- 프로그레스 바는 CSS transition으로 부드럽게 변화

JavaScript는 아직 작성하지 마. 구조와 스타일만 완성해 줘.
```

---

## STEP 2. 데이터 모델 + LocalStorage 연동

```
`index.html`의 <script> 태그 안에 데이터 관련 코드를 작성해 줘.

[데이터 구조]
각 할 일 항목은 아래 형태의 객체야:
{
  id: Date.now(),             // 고유 ID (숫자)
  text: "할 일 내용",
  category: "업무",           // "업무" | "개인" | "공부"
  completed: false,           // 완료 여부 (boolean)
  createdAt: new Date().toISOString()
}

[구현할 함수 4개]
1. loadTodos()
   - LocalStorage의 "todos" 키에서 JSON을 파싱해서 배열로 반환
   - 데이터가 없으면 빈 배열 [] 반환

2. saveTodos(todos)
   - todos 배열을 JSON.stringify해서 LocalStorage "todos" 키에 저장

3. generateId()
   - Date.now()를 반환 (고유 ID 생성용)

4. 전역 변수 2개 선언:
   - let todos = loadTodos()       // 현재 할 일 목록
   - let currentFilter = "전체"    // 현재 선택된 필터

함수 구현 후 콘솔에서 동작 확인용 테스트 코드를 주석으로 작성해 줘.
예: // 테스트: saveTodos([{id:1, text:"테스트", ...}])
```

---

## STEP 3. 할 일 추가 + 목록 렌더링

```
`index.html`의 <script>에 아래 기능을 추가해 줘.

[renderTodos() 함수]
- todos 배열을 받아 <ul> 목록을 다시 그리는 함수
- currentFilter가 "전체"가 아니면 해당 카테고리만 필터링해서 표시
- 미완료 항목을 먼저, 완료 항목을 나중에 표시 (정렬)
- 각 <li> 항목의 구성:
    체크박스 | 카테고리 배지 | 할 일 텍스트 | 수정 버튼 | 삭제 버튼
- todos가 비어있거나 필터 결과가 없으면 "할 일이 없습니다" 메시지 표시
- 렌더링 후 updateProgress() 호출

[updateProgress() 함수]
- 현재 필터 기준으로 전체 개수와 완료 개수를 계산
- 진행률 텍스트 업데이트: "3 / 10 완료 (30%)"
- 프로그레스 바 width 업데이트 (0~100%)
- 전체 항목이 0개면 진행률 0%로 표시

[addTodo() 함수]
- 입력창에서 텍스트와 카테고리 값을 읽어옴
- 텍스트가 공백이면 입력창에 포커스 후 함수 종료 (alert 사용 안 함)
- 새 todo 객체 생성 후 todos 배열에 추가
- saveTodos(todos) 호출
- renderTodos() 호출
- 입력창 초기화, 포커스 이동

[이벤트 연결]
- 추가 버튼 클릭 → addTodo()
- 입력창 Enter 키 → addTodo()
- 카테고리 필터 탭 클릭 → currentFilter 변경 후 renderTodos()
- 페이지 로드 시 renderTodos() 실행

구현 후 브라우저에서 항목 추가, 필터 전환, 새로고침 후 데이터 유지를
직접 테스트해 볼 수 있게 해 줘.
```

---

## STEP 4. 완료 체크 + 수정 + 삭제

```
`index.html`의 <script>에 아래 3가지 기능을 추가해 줘.

[toggleTodo(id) 함수 — 완료 체크]
- id에 해당하는 항목의 completed 값을 반전 (true↔false)
- saveTodos(todos) → renderTodos() 순서로 호출

[deleteTodo(id) 함수 — 단건 삭제]
- id에 해당하는 항목을 todos 배열에서 제거
- saveTodos(todos) → renderTodos() 순서로 호출

[deleteCompleted() 함수 — 완료 항목 일괄 삭제]
- completed가 true인 항목을 모두 제거
- 삭제할 항목이 없으면 아무 동작도 하지 않음
- saveTodos(todos) → renderTodos() 순서로 호출

[editTodo(id) 함수 — 인라인 수정]
- 해당 <li> 항목의 텍스트 영역을 <input>으로 교체
- 카테고리도 <select>로 교체
- 저장 버튼(Enter 키 포함)과 취소 버튼(Esc 키 포함)을 표시
- 저장 시: 빈 값이면 취소 처리, 정상이면 todos 업데이트 후 save+render
- 취소 시: 원래 텍스트로 복원 (todos 변경 없이 renderTodos만 호출)

[renderTodos()에 이벤트 연결 추가]
- 체크박스 change → toggleTodo(id)
- 삭제 버튼 click → deleteTodo(id)
- 수정 버튼 click → editTodo(id)
- "완료 항목 전체 삭제" 버튼 click → deleteCompleted()

각 함수의 id는 숫자형이므로 Number()로 변환해서 사용해 줘.
```

---

## STEP 5. 마무리 — UX 개선 + 전체 점검

```
`index.html` 전체를 검토하고 아래 항목들을 보완해 줘.

[UX 개선]
1. 페이지 최초 로드 시 입력창에 자동 포커스
2. 완료 항목 전체 삭제 버튼은 완료 항목이 1개 이상일 때만 표시
   (0개면 버튼을 숨김 처리 — display:none)
3. 프로그레스 바가 100%가 되면 색상을 초록으로 변경
   (0~99%는 기본 파란색 계열)

[코드 점검 체크리스트]
아래 항목을 하나씩 확인하고 문제가 있으면 수정해 줘:
- [ ] 새로고침 후 todos 데이터가 그대로 유지되는가?
- [ ] 빈 텍스트로 할 일 추가 시 등록되지 않는가?
- [ ] 수정 중 Esc 키로 취소하면 원래 값이 보존되는가?
- [ ] 카테고리 필터 전환 시 진행률도 해당 카테고리 기준으로 바뀌는가?
- [ ] 완료 항목이 미완료 항목보다 항상 아래에 표시되는가?
- [ ] 모바일 화면(너비 375px 기준)에서 UI가 깨지지 않는가?

[최종 확인]
- 외부 CDN, 라이브러리, 프레임워크가 포함되지 않았는지 확인
- <script> 코드가 DOMContentLoaded 또는 파일 하단에 위치해서
  HTML 파싱 완료 후 실행되는지 확인
- 완성된 index.html 파일 경로와 브라우저에서 여는 방법을 알려줘
```

---

## 단계별 진행 요령

| 단계 | 핵심 산출물 | 완료 확인 방법 |
|------|------------|--------------|
| STEP 1 | HTML 구조 + CSS | 브라우저에서 레이아웃 확인 |
| STEP 2 | 데이터 모델 + LocalStorage | 콘솔에서 loadTodos() 실행 |
| STEP 3 | 추가 + 렌더링 | 항목 추가 후 새로고침 |
| STEP 4 | 체크/수정/삭제 | 전체 CRUD 동작 확인 |
| STEP 5 | UX 개선 + 점검 | 체크리스트 항목 전부 통과 |
