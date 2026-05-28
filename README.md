# 내신 정밀 분석 리포트

React + Vite 기반 내신 성적표 분석 앱입니다. Gemini API 키와 접속 비밀번호는 Vercel 환경변수로 관리합니다.

## Vercel 환경변수

Vercel 프로젝트의 Settings > Environment Variables에 아래 값을 등록하세요.

```env
APP_PASSWORDS=0000,8405
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

`APP_PASSWORDS`는 쉼표로 여러 개를 등록할 수 있습니다.

## 실행

```bash
npm install
npm run build
```

로컬에서 Vercel 서버리스 함수까지 함께 확인하려면 Vercel CLI의 `vercel dev` 사용을 권장합니다.
