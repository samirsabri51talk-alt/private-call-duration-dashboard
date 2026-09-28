const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8787);
const DIST = path.join(ROOT, 'dist', 'index.html');

function loadDotEnv() {
  const file = path.join(ROOT, '.env');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}
loadDotEnv();

function json(res, status, body) {
  res.writeHead(status, {'Content-Type': 'application/json; charset=utf-8'});
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 1_000_000) reject(new Error('Request too large'));
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function sendToDingTalk({title, markdown}) {
  const webhook = process.env.DINGTALK_WEBHOOK_URL;
  if (!webhook) throw new Error('DINGTALK_WEBHOOK_URL is missing in private-call-dashboard/.env');
  const url = new URL(webhook);
  const secret = process.env.DINGTALK_SECRET;
  if (secret) {
    const timestamp = Date.now().toString();
    const sign = crypto.createHmac('sha256', secret).update(`${timestamp}\n${secret}`).digest('base64');
    url.searchParams.set('timestamp', timestamp);
    url.searchParams.set('sign', sign);
  }
  const response = await fetch(url, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({msgtype: 'markdown', markdown: {title, text: markdown}})
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.errcode) throw new Error(result.errmsg || `DingTalk HTTP ${response.status}`);
  return result;
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/health') return json(res, 200, {ok: true, bot: 'B.S Team'});
    if (req.method === 'POST' && req.url === '/api/dingtalk/report') {
      const body = JSON.parse(await readBody(req) || '{}');
      if (!body.title || !body.markdown) return json(res, 400, {error: 'title and markdown are required'});
      await sendToDingTalk(body);
      return json(res, 200, {ok: true, destination: 'B.S Team'});
    }
    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      return res.end(fs.readFileSync(DIST));
    }
    json(res, 404, {error: 'Not found'});
  } catch (error) {
    json(res, 500, {error: error.message});
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Call Duration Dashboard: http://127.0.0.1:${PORT}`);
});
