export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  const passwords = String(process.env.APP_PASSWORDS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const password = String(req.body?.password || '').trim().toLowerCase();

  if (passwords.length === 0) {
    return res.status(500).json({ ok: false, message: 'APP_PASSWORDS 환경변수가 설정되지 않았습니다.' });
  }

  return res.status(200).json({ ok: passwords.includes(password) });
}
