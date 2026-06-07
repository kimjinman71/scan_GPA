# 내신 정밀 분석 리포트

React + Vite 기반 내신 성적표 분석 앱입니다. Gemini API 키와 접속 비밀번호는 Vercel 환경변수로 관리합니다.

PDF는 브라우저나 Vercel 함수에서 텍스트 추출하지 않습니다. 업로드된 원본 PDF를 `application/pdf` inline data로 Gemini API에 직접 전달하고, 스캔본/이미지는 인식용으로 선명하게 보정한 뒤 Gemini에 전달합니다. 여러 파일은 Vercel 요청 한도 안에서 가능한 한 하나의 Gemini 요청으로 묶어 분석하고, Gemini 응답은 JSON으로 받아 성적표를 구성합니다.

## Vercel 환경변수

Vercel 프로젝트의 Settings > Environment Variables에 아래 값을 등록하세요.

```env
APP_PASSWORDS=0000,8405
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_FALLBACK_MODELS=gemini-2.5-flash-lite,gemini-2.0-flash
```

`GEMINI_MODEL`이 일시적 과부하로 실패하면 서버 함수가 자동 재시도 후 `GEMINI_FALLBACK_MODELS`의 모델을 순서대로 시도합니다.

유료 Gemini API를 쓰는 경우에도 Vercel에 등록된 `GEMINI_API_KEY`가 실제 결제 프로젝트에서 발급된 키인지 확인해야 합니다. 환경변수 변경 후에는 Vercel에서 재배포해야 반영됩니다.

## 실행

```bash
npm install
npm run build
```

로컬에서 API 라우트까지 함께 확인하려면:

```bash
npm run serve
```

브라우저에서 `http://127.0.0.1:4173`에 접속한 뒤 3MB 이하 학생부 PDF 1개로 먼저 테스트하세요. 스캔본/이미지는 여러 장을 함께 올릴 수 있으며, 앱이 가능한 범위에서 한 요청으로 묶어 분석합니다.

## Vercel 배포 주의사항

- `vercel.json`에서 `api/gemini.js`의 `maxDuration`을 60초로 설정합니다.
- 이 프로젝트는 Next.js App Router가 아니므로 `export const runtime = "nodejs"` 설정을 사용하지 않습니다. Vercel의 Node.js Function으로 실행됩니다.
- Vercel 요청 본문 안정성을 위해 PDF는 3MB 이하를 권장합니다. 더 큰 PDF는 압축하거나 학년별로 나누어 업로드하세요.
- 스캔본은 글자가 작거나 흐리면 인식률이 떨어집니다. 가능하면 200dpi 이상, 그림자/기울어짐이 적은 파일을 사용하세요.
- Gemini `429 TooManyRequests`가 반복되면 Google AI Studio / Google Cloud에서 해당 API 키의 quota, billing, rate limit을 확인하세요.
- 로컬 Node는 `20.19.0` 이상을 권장합니다.
