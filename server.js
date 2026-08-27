const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8080;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
};

// ── Start Backend API Server ──
const serverDir = path.join(__dirname, 'server');
if (fs.existsSync(path.join(serverDir, 'index.js'))) {
  console.log('[V3] Starting backend API server...');
  const backend = spawn('node', ['index.js'], {
    cwd: serverDir,
    stdio: 'inherit',
  });

  backend.on('error', (err) => {
    console.error('[V3] Failed to start backend:', err.message);
  });

  backend.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(`[V3] Backend exited with code ${code}`);
    }
  });

  // Cleanup on exit
  process.on('SIGINT', () => {
    backend.kill();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    backend.kill();
    process.exit(0);
  });
}

// ── Start Static Frontend Server ──
http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = '.' + urlPath;
  if (filePath === './') filePath = './index.html';
  if (urlPath === '/admin' || urlPath === '/admin/') filePath = './admin/index.html';
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(err.code === 'ENOENT' ? 404 : 500);
      res.end(err.code === 'ENOENT' ? 'Not found' : 'Server error');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
}).listen(PORT, () => {
  console.log(`[V3] Frontend running at http://localhost:${PORT}`);
});
