# PRD Step 1 — MVP

## 목표
사진 업로드부터 레시피 추천까지 동작하는 최소 기능 구현

## 기능 요구사항

| 기능 | 설명 |
|------|------|
| 이미지 업로드 | 사용자가 냉장고 사진을 파일로 업로드 |
| 재료 인식 | Vision 모델(`google/gemma-3-27b-it:free`)로 이미지에서 재료 목록 추출 |
| 레시피 추천 | LLM(`qwen/qwen3-next-80b-a3b-instruct:free`)으로 인식된 재료 기반 레시피 1~3개 제안 |
| 결과 표시 | 인식된 재료 목록 + 레시피(재료, 조리 순서)를 화면에 출력 |

## 화면 구성

```
[사진 업로드 버튼]
      ↓
[미리보기 + 분석 시작 버튼]
      ↓
[인식된 재료 목록]
[추천 레시피 카드 1~3개]
```

## 비기능 요구사항
- 단일 HTML + Node.js `http` 모듈 서버
- `.env`로 API 키 관리
- 이미지는 Base64로 인코딩하여 OpenRouter API 전송
- Rate Limit 발생 시 폴백 모델 자동 재시도

## 파일 구조
```
Study-04/
├── server.js       # Node.js HTTP 서버 + API 라우팅
├── public/
│   └── index.html  # 단일 페이지 UI
├── config.js       # 모델 설정 및 API 헤더
└── .env            # OPENROUTER_API_KEY
```

## API 흐름
1. 사용자가 이미지 업로드
2. 서버에서 이미지를 Base64 인코딩
3. Vision 모델로 재료 목록 추출
4. LLM 모델로 레시피 추천 텍스트 생성
5. 결과를 JSON으로 클라이언트에 반환
