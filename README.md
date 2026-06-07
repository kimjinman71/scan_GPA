# 내신 정밀 분석 리포트

React + Vite 기반 내신 성적표 분석 앱입니다. Gemini API 키와 접속 비밀번호는 Vercel 환경변수로 관리합니다.

## Vercel 환경변수

Vercel 프로젝트의 Settings > Environment Variables에 아래 값을 등록하세요.

```env
APP_PASSWORDS=0000,8405
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_FALLBACK_MODELS=gemini-2.5-flash-lite,gemini-2.0-flash
```

`GEMINI_MODEL`이 일시적 과부하로 실패하면 서버 함수가 자동 재시도 후 `GEMINI_FALLBACK_MODELS`의 모델을 순서대로 시도합니다.

## 실행

```bash
npm install
npm run build
```

로컬에서 API 라우트까지 함께 확인하려면:

```bash
npm run serve
```
