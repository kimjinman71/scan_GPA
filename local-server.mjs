import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authHandler from './api/auth.js';
import geminiHandler from './api/gemini.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

const readJsonBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
};

const createRes = (res) => ({
  setHeader: (...args) => res.setHeader(...args),
  status(code) {
    res.statusCode = code;
    return this;
  },
  json(payload) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(payload));
  },
  send(payload) {
    res.end(payload);
  },
});

const runApi = async (handler, req, res) => {
  try {
    req.body = await readJsonBody(req);
    await handler(req, createRes(res));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: { message: error.message || 'Internal server error' } }));
  }
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  if (url.pathname === '/api/auth') return runApi(authHandler, req, res);
  if (url.pathname === '/api/gemini') return runApi(geminiHandler, req, res);

  const requestedPath = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
  const filePath = path.normalize(path.join(distDir, requestedPath));
  const safePath = filePath.startsWith(distDir) && existsSync(filePath) ? filePath : path.join(distDir, 'index.html');
  const ext = path.extname(safePath);

  try {
    const file = await readFile(safePath);
    res.statusCode = 200;
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.end(file);
  } catch {
    res.statusCode = 404;
    res.end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Local app server running at http://127.0.0.1:${port}`);
});
