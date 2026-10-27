const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const STATIC_DIR = path.join(__dirname, 'out');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
};

function getMime(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function tryFile(filePath) {
  try {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return filePath;
    }
  } catch {}
  return null;
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  // Try exact file
  let filePath = tryFile(path.join(STATIC_DIR, urlPath));

  // Try with index.html (for directories with trailing slash)
  if (!filePath && urlPath.endsWith('/')) {
    filePath = tryFile(path.join(STATIC_DIR, urlPath, 'index.html'));
  }

  // Try adding trailing slash + index.html
  if (!filePath) {
    filePath = tryFile(path.join(STATIC_DIR, urlPath + '/index.html'));
  }

  // Try adding .html
  if (!filePath) {
    filePath = tryFile(path.join(STATIC_DIR, urlPath + '.html'));
  }

  // Root redirect to /tr/
  if (!filePath && (urlPath === '/' || urlPath === '')) {
    res.writeHead(302, { Location: '/tr/' });
    res.end();
    return;
  }

  if (filePath) {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': getMime(filePath) });
    res.end(content);
  } else {
    // 404 - try to serve a custom 404 page
    const notFoundPage = tryFile(path.join(STATIC_DIR, '404.html'));
    if (notFoundPage) {
      const content = fs.readFileSync(notFoundPage);
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }
});

server.listen(PORT, () => {
  console.log(`Static server running on port ${PORT}`);
});
