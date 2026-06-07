const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const MAX_RETRY_DELAY_MS = 20000;
const RETRIES_PER_MODEL = 4;
const RATE_LIMIT_RETRY_DELAY_MS = 65000;

const parseModelList = () => {
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const fallbackModels = String(process.env.GEMINI_FALLBACK_MODELS || 'gemini-2.5-flash-lite,gemini-2.0-flash')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);

  return [...new Set([primaryModel, ...fallbackModels])];
};

const parseRetryAfter = (headerValue) => {
  if (!headerValue) return null;
  const seconds = Number.parseInt(headerValue, 10);
  if (!Number.isNaN(seconds)) return Math.min(seconds * 1000, MAX_RETRY_DELAY_MS);

  const dateMs = Date.parse(headerValue);
  if (Number.isNaN(dateMs)) return null;
  return Math.min(Math.max(dateMs - Date.now(), 0), MAX_RETRY_DELAY_MS);
};

const getRetryDelay = (upstream) => upstream.retryAfter ?? RATE_LIMIT_RETRY_DELAY_MS;

const getErrorMessage = (text) => {
  try {
    return JSON.parse(text)?.error?.message || text;
  } catch {
    return text;
  }
};

const shouldRetry = (status) => [429, 500, 502, 503, 504].includes(status);

const getExhaustedMessage = (errors) => {
  const hasQuotaError = errors.some((error) => error.includes(': 429 '));
  if (hasQuotaError) {
    return 'Gemini API 사용량 제한에 도달했습니다. 잠시 후 다시 시도하거나 Google AI Studio에서 API quota/billing 상태를 확인해 주세요.';
  }

  return 'Gemini 모델이 일시적으로 과부하 상태입니다. 요청 속도를 낮춰 재시도했지만 모든 모델이 실패했습니다. 잠시 후 다시 시도해 주세요.';
};

const getExhaustedStatus = (errors) => (errors.some((error) => error.includes(': 429 ')) ? 429 : 503);

const callGemini = async ({ apiKey, model, body }) => {
  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    },
  );

  const text = await upstream.text();
  return {
    ok: upstream.ok,
    status: upstream.status,
    contentType: upstream.headers.get('content-type') || 'application/json',
    retryAfter: parseRetryAfter(upstream.headers.get('retry-after')),
    text,
  };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const models = parseModelList();

  if (!apiKey) {
    return res.status(500).json({ error: { message: 'GEMINI_API_KEY environment variable is not set.' } });
  }

  const body = JSON.stringify(req.body);
  const errors = [];

  try {
    for (const model of models) {
      for (let attempt = 0; attempt < RETRIES_PER_MODEL; attempt += 1) {
        const upstream = await callGemini({ apiKey, model, body });

        if (upstream.ok) {
          res.status(upstream.status);
          res.setHeader('Content-Type', upstream.contentType);
          res.setHeader('X-Gemini-Model-Used', model);
          return res.send(upstream.text);
        }

        const message = getErrorMessage(upstream.text);
        errors.push(`${model} attempt ${attempt + 1}: ${upstream.status} ${message}`);

        if (upstream.status === 429) {
          return res.status(429).json({
            error: {
              message:
                'Gemini API 사용량 제한에 도달했습니다. 잠시 대기 후 자동으로 다시 시도합니다. 계속 반복되면 현재 Vercel 환경변수의 API 키가 유료 결제 프로젝트에 연결된 키인지 확인해 주세요.',
              retryDelayMs: getRetryDelay(upstream),
              attempts: errors.slice(-3),
            },
          });
        }

        if (!shouldRetry(upstream.status)) {
          res.status(upstream.status);
          res.setHeader('Content-Type', upstream.contentType);
          return res.send(upstream.text);
        }

        const delay = upstream.retryAfter ?? Math.min(1500 * 2 ** attempt, MAX_RETRY_DELAY_MS);
        await sleep(delay);
      }
    }

    return res.status(getExhaustedStatus(errors)).json({
      error: {
        message: getExhaustedMessage(errors),
        attempts: errors.slice(-10),
      },
    });
  } catch (error) {
    return res.status(502).json({ error: { message: error.message || 'Gemini API request failed.' } });
  }
}
