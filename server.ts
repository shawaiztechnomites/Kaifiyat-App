import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON body parser
  app.use(express.json());

  // Proxy for Aladhan API
  app.get('/api/proxy/aladhan/*', async (req, res) => {
    try {
      const targetPath = req.params[0];
      const query = new URLSearchParams(req.query as any).toString();
      const url = `https://api.aladhan.com/v1/${targetPath}?${query}`;
      
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Aladhan Proxy Error:', error);
      res.status(500).json({ error: 'Failed to fetch from Aladhan API' });
    }
  });

  // Proxy for Quran Cloud API
  app.get('/api/proxy/qurancloud/*', async (req, res) => {
    try {
      const targetPath = req.params[0];
      const query = new URLSearchParams(req.query as any).toString();
      const url = `https://api.alquran.cloud/v1/${targetPath}${query ? '?' + query : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Quran Cloud Proxy Error:', error);
      res.status(500).json({ error: 'Failed to fetch from Quran Cloud API' });
    }
  });

  // Contact Form Endpoint -> sends queries to abc02121999@gmail.com
  app.post('/api/contact', async (req, res) => {
    const CONTACT_EMAIL = 'abc02121999@gmail.com';
    try {
      const { name, email, subject, message } = req.body || {};

      if (!name || !email || !message) {
        return res.status(400).json({
          ok: false,
          error: 'Name, email, and message are required.',
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(email).trim())) {
        return res.status(400).json({
          ok: false,
          error: 'Please provide a valid email address.',
        });
      }

      const origin = req.headers.origin || `http://localhost:${PORT}`;
      const response = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': origin,
          'Referer': `${origin}/`,
        },
        body: JSON.stringify({
          name: String(name).trim(),
          email: String(email).trim(),
          _replyto: String(email).trim(),
          _subject: `[Kaifiyat Contact] ${subject ? String(subject).trim() : 'New App Query'}`,
          subject: subject ? String(subject).trim() : 'General Query',
          message: String(message).trim(),
          _template: 'table',
        }),
      });

      const data = await response.json().catch(() => ({}));
      const isSuccess = response.ok && (data.success === 'true' || data.success === true);

      if (isSuccess) {
        return res.json({
          ok: true,
          message: 'Your query has been sent successfully.',
        });
      }

      return res.status(502).json({
        ok: false,
        error: data.message || 'Unable to send your query right now. Please try again later.',
      });
    } catch (error) {
      console.error('Contact Form Error:', error);
      return res.status(500).json({
        ok: false,
        error: 'Unable to send your query right now. Please try again later.',
      });
    }
  });

  // APK info & download endpoints for built Android APK
  app.get('/api/apk-info', (_req, res) => {
    const apkPath = path.join(process.cwd(), 'apk', 'Kaifiyat-debug.apk');
    if (fs.existsSync(apkPath)) {
      const stats = fs.statSync(apkPath);
      return res.json({
        available: true,
        filename: 'Kaifiyat-debug.apk',
        sizeBytes: stats.size,
      });
    }
    return res.json({ available: false, filename: 'Kaifiyat-debug.apk' });
  });

  app.get('/api/download-apk', (_req, res) => {
    const apkPath = path.join(process.cwd(), 'apk', 'Kaifiyat-debug.apk');
    if (!fs.existsSync(apkPath)) {
      return res.status(404).json({ error: 'APK file has not been generated yet.' });
    }
    return res.download(apkPath, 'Kaifiyat-debug.apk');
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
