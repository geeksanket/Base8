/**
 * AstroLearn // Zero-Dependency Node.js Backend Server
 * Saves user onboarding responses to local JSON/CSV & syncs directly to Google Sheets
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

// Google Sheet Webhook URL
// Paste your Google Apps Script Web App URL below (see google-apps-script.js):
const GOOGLE_SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL || '';

// Local storage paths
const DATA_DIR = path.join(__dirname, 'data');
const JSON_FILE = path.join(DATA_DIR, 'submissions.json');
const CSV_FILE = path.join(DATA_DIR, 'submissions.csv');

// MIME types for static file serving
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Ensure data folder and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(JSON_FILE)) {
  fs.writeFileSync(JSON_FILE, JSON.stringify([], null, 2), 'utf8');
}

if (!fs.existsSync(CSV_FILE)) {
  const csvHeaders = 'Timestamp,Interest,Age Group,Learning Goal,Selected Topic,User ID\n';
  fs.writeFileSync(CSV_FILE, csvHeaders, 'utf8');
}

/**
 * Forward submission to Google Sheets Webhook
 */
function sendToGoogleSheet(data) {
  return new Promise((resolve) => {
    if (!GOOGLE_SHEET_WEBHOOK_URL) {
      return resolve({ skipped: true, message: 'Google Sheet Webhook not configured yet (saved locally).' });
    }

    try {
      const parsedUrl = new URL(GOOGLE_SHEET_WEBHOOK_URL);
      const postData = JSON.stringify(data);

      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const client = parsedUrl.protocol === 'https:' ? https : http;
      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          resolve({ success: true, statusCode: res.statusCode, body });
        });
      });

      req.on('error', (err) => {
        console.error('[Google Sheet Forwarding Error]:', err.message);
        resolve({ success: false, error: err.message });
      });

      req.write(postData);
      req.end();
    } catch (err) {
      console.error('[URL Error]:', err.message);
      resolve({ success: false, error: err.message });
    }
  });
}

function escapeCsv(val) {
  if (!val) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// Create HTTP Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --------------------------------------------------------------------------
  // API: POST /api/submit
  // --------------------------------------------------------------------------
  if (req.method === 'POST' && pathname === '/api/submit') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');

        const submission = {
          id: 'sub_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4),
          timestamp: new Date().toISOString(),
          formattedDate: new Date().toLocaleString(),
          interest: payload.interest || 'Not specified',
          ageGroup: payload.ageGroup || 'Not specified',
          learningGoal: payload.learningGoal || 'Not specified',
          selectedTopic: payload.selectedTopic || 'None',
          userId: payload.userId || 'anon_' + Math.random().toString(36).substr(2, 6)
        };

        // 1. Save to JSON
        let list = [];
        try {
          list = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
        } catch (e) {
          list = [];
        }
        list.push(submission);
        fs.writeFileSync(JSON_FILE, JSON.stringify(list, null, 2), 'utf8');

        // 2. Append to CSV
        const csvLine = `${escapeCsv(submission.formattedDate)},${escapeCsv(submission.interest)},${escapeCsv(submission.ageGroup)},${escapeCsv(submission.learningGoal)},${escapeCsv(submission.selectedTopic)},${escapeCsv(submission.userId)}\n`;
        fs.appendFileSync(CSV_FILE, csvLine, 'utf8');

        // 3. Forward to Google Sheets Webhook
        const googleRes = await sendToGoogleSheet({
          timestamp: submission.formattedDate,
          interest: submission.interest,
          ageGroup: submission.ageGroup,
          learningGoal: submission.learningGoal,
          selectedTopic: submission.selectedTopic,
          userId: submission.userId
        });

        console.log(`[SUBMISSION] Recorded ID: ${submission.id} | Topic: "${submission.selectedTopic}" | Google Sheet: ${googleRes.skipped ? 'Saved Locally (Webhook URL pending)' : 'Synced'}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'success',
          message: 'Response recorded successfully',
          submissionId: submission.id,
          googleSheetSync: googleRes
        }));

      } catch (err) {
        console.error('API Error:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: err.message }));
      }
    });
    return;
  }

  // --------------------------------------------------------------------------
  // API: GET /api/submissions
  // --------------------------------------------------------------------------
  if (req.method === 'GET' && pathname === '/api/submissions') {
    try {
      const data = fs.readFileSync(JSON_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // --------------------------------------------------------------------------
  // API: GET /api/status
  // --------------------------------------------------------------------------
  if (req.method === 'GET' && pathname === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      googleSheetConfigured: Boolean(GOOGLE_SHEET_WEBHOOK_URL),
      storage: 'JSON + CSV in ./data/'
    }));
    return;
  }

  // --------------------------------------------------------------------------
  // Static File Serving
  // --------------------------------------------------------------------------
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  // Prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`
  ======================================================
  🚀 AstroLearn Server running at: http://localhost:${PORT}
  📁 Submissions saved locally to: ${DATA_DIR}
  📊 Google Sheet Webhook: ${GOOGLE_SHEET_WEBHOOK_URL ? 'Connected' : 'Pending configuration'}
  ======================================================
  `);
});
