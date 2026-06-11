const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseModelList = (requestedModel) => {
  if (requestedModel) return [requestedModel];

  const primaryModel = requestedModel || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const fallbackModels = String(process.env.GEMINI_FALLBACK_MODELS || 'gemini-2.5-flash-lite,gemini-2.0-flash')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);

  return [...new Set([primaryModel, ...fallbackModels])];
};

const parseRetryAfter = (headerValue) => {
  if (!headerValue) return null;
  const seconds = Number.parseInt(headerValue, 10);
  if (!Number.isNaN(seconds)) return Math.min(seconds * 1000, 8000);

  const dateMs = Date.parse(headerValue);
  if (Number.isNaN(dateMs)) return null;
  return Math.min(Math.max(dateMs - Date.now(), 0), 8000);
};

const getErrorMessage = (text) => {
  try {
    return JSON.parse(text)?.error?.message || text;
  } catch {
    return text;
  }
};

const shouldRetry = (status) => [429, 500, 502, 503, 504].includes(status);

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
  const models = parseModelList(req.body?.model);

  if (!apiKey) {
    return res.status(500).json({ error: { message: 'GEMINI_API_KEY environment variable is not set.' } });
  }

  const body = JSON.stringify(req.body);
  const errors = [];

  try {
    for (const model of models) {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const upstream = await callGemini({ apiKey, model, body });

        if (upstream.ok) {
          res.status(upstream.status);
          res.setHeader('Content-Type', upstream.contentType);
          res.setHeader('X-Gemini-Model-Used', model);
          return res.send(upstream.text);
        }

        const message = getErrorMessage(upstream.text);
        errors.push(`${model} attempt ${attempt + 1}: ${upstream.status} ${message}`);

        if (!shouldRetry(upstream.status)) {
          res.status(upstream.status);
          res.setHeader('Content-Type', upstream.contentType);
          return res.send(upstream.text);
        }

        const delay = upstream.retryAfter ?? Math.min(1000 * 2 ** attempt, 4000);
        await sleep(delay);
      }
    }

    return res.status(503).json({
      error: {
        message:
          'Gemini model is temporarily overloaded. The app retried and tried fallback models, but all attempts failed. Please try again in a moment.',
        attempts: errors.slice(-6),
      },
    });
  } catch (error) {
    return res.status(502).json({ error: { message: error.message || 'Gemini API request failed.' } });
  }
}
