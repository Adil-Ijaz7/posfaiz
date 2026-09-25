import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Serve static build assets if available
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// API health endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'BizLedger POS',
    nodeVersion: process.version,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// SPA fallback for all client routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(` BizLedger POS — Running natively on Node.js`);
  console.log(` Local:   http://localhost:${PORT}`);
  console.log(` Network: http://0.0.0.0:${PORT}`);
  console.log(` Node.js: ${process.version} (No Docker required)`);
  console.log(`======================================================\n`);
});
