'use strict';
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY || '';
const INDEX_FILE = path.join(__dirname, 'index.html');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      const payload = JSON.parse(body);
      const data = Buffer.from(JSON.stringify(payload));
      const options = {
        hostname: 'api.anthropic.com', port: 443,
        path: '/v1/messages', method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01'
        }
      };
      const r = https.request(options, s => {
        let x = '';
        s.on('data', c => x += c);
        s.on('end', () => { res.writeHead(s.statusCode, {'Content-Type':'application/json'}); res.end(x); });
      });
      r.write(data); r.end();
    });
    return;
  }

  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    fs.createReadStream(INDEX_FILE).pipe(res);
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, () => console.log('Meta GSP online na porta ' + PORT));

