import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Instagram API Proxy
  app.get('/api/instagram', async (req, res) => {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    
    if (!token) {
      return res.status(200).json({ 
        data: [],
        archiveMode: true,
        message: 'INSTAGRAM_ACCESS_TOKEN not configured. Showing archive mode.'
      });
    }

    try {
      const response = await fetch(
        `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count&access_token=${token}`
      );
      
      if (!response.ok) {
        // Return 200 with fallback indicator so client smoothly displays archive posts
        return res.status(200).json({
          data: [],
          archiveMode: true,
          message: 'Instagram token expired or invalid. Archive mode active.'
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(200).json({ data: [], archiveMode: true, message: 'Archive mode active' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
      },
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
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
