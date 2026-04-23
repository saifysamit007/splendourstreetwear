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
      return res.status(404).json({ 
        error: 'INSTAGRAM_ACCESS_TOKEN not configured',
        message: 'Please provide a valid Instagram Basic Display API Access Token in environment variables.'
      });
    }

    try {
      const response = await fetch(
        `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count&access_token=${token}`
      );
      
      if (!response.ok) {
        throw new Error(`Instagram API responded with ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Instagram Fetch Error:', error);
      res.status(500).json({ error: 'Failed to fetch Instagram feed' });
    }
  });

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
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
