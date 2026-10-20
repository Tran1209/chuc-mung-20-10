import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { defineConfig, Plugin } from 'vite';

function syncToGithubPlugin(): Plugin {
  return {
    name: 'sync-to-github-plugin',
    configureServer(server) {
      server.middlewares.use('/api/sync-to-github', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const payload = JSON.parse(body);
            const { memories, nickname, senderName, letterBody, herName, anniversaryDate, customSongData } = payload;

            const publicDir = path.resolve(import.meta.dirname, 'public');
            if (!fs.existsSync(publicDir)) {
              fs.mkdirSync(publicDir, { recursive: true });
            }

            // 1. Save any custom photos to public/ and map them
            if (Array.isArray(memories)) {
              const updatedMemories = memories.map((card: any) => {
                if (card.customImageData && card.customImageData.startsWith('data:image')) {
                  const match = card.customImageData.match(/^data:image\/(\w+);base64,(.+)$/);
                  if (match) {
                    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
                    const filename = `synced_${card.id}.${ext}`;
                    const filePath = path.join(publicDir, filename);
                    fs.writeFileSync(filePath, Buffer.from(match[2], 'base64'));
                    return {
                      ...card,
                      imageUrl: `./${filename}`,
                      customImageData: undefined,
                    };
                  }
                }
                return {
                  ...card,
                  imageUrl: card.imageUrl || `./${card.originalFileName}`,
                  customImageData: undefined,
                };
              });

              // Write updated memories into src/data/memories.ts
              const memoriesTsPath = path.resolve(import.meta.dirname, 'src/data/memories.ts');
              let memoriesTs = fs.readFileSync(memoriesTsPath, 'utf-8');
              const memoriesJson = JSON.stringify(updatedMemories, null, 2);
              memoriesTs = memoriesTs.replace(
                /export const INITIAL_MEMORIES: MemoryCard\[\] = \[[\s\S]*?\];/,
                `export const INITIAL_MEMORIES: MemoryCard[] = ${memoriesJson};`
              );
              fs.writeFileSync(memoriesTsPath, memoriesTs, 'utf-8');
            }

            // 2. Save custom audio if present
            if (customSongData && customSongData.startsWith('data:audio')) {
              const match = customSongData.match(/^data:audio\/\w+;base64,(.+)$/);
              if (match) {
                const audioPath = path.join(publicDir, 'music.m4a');
                fs.writeFileSync(audioPath, Buffer.from(match[1], 'base64'));
              }
            }

            // 3. Update LoveLetter.tsx defaults
            if (nickname || senderName || letterBody) {
              const letterPath = path.resolve(import.meta.dirname, 'src/components/LoveLetter.tsx');
              let letterContent = fs.readFileSync(letterPath, 'utf-8');
              if (nickname) {
                letterContent = letterContent.replace(
                  /const DEFAULT_NICKNAME = '.*?';/,
                  `const DEFAULT_NICKNAME = ${JSON.stringify(nickname)};`
                );
              }
              if (senderName) {
                letterContent = letterContent.replace(
                  /const DEFAULT_SENDER_NAME = '.*?';/,
                  `const DEFAULT_SENDER_NAME = ${JSON.stringify(senderName)};`
                );
              }
              if (letterBody) {
                letterContent = letterContent.replace(
                  /const DEFAULT_LETTER_BODY = `[\s\S]*?`;/,
                  `const DEFAULT_LETTER_BODY = ${JSON.stringify(letterBody)};`
                );
              }
              fs.writeFileSync(letterPath, letterContent, 'utf-8');
            }

            // 3.5 Update HeroSection.tsx if herName or anniversaryDate provided
            if (herName || anniversaryDate) {
              const heroPath = path.resolve(import.meta.dirname, 'src/components/HeroSection.tsx');
              let heroContent = fs.readFileSync(heroPath, 'utf-8');
              if (herName) {
                heroContent = heroContent.replace(/'Em Bé Của Anh'/g, JSON.stringify(herName));
              }
              if (anniversaryDate) {
                heroContent = heroContent.replace(/'2026-07-01'/g, JSON.stringify(anniversaryDate));
              }
              fs.writeFileSync(heroPath, heroContent, 'utf-8');
            }

            // 4. Run build and deploy in background
            exec('git add . && git commit -m "sync: update love page from editor" && git push origin main && npm run build && npx gh-pages -d dist', (err) => {
              if (err) {
                console.error('Failed in git/gh-pages deploy sequence:', err);
                // Fallback direct build & deploy if git commit had nothing to commit
                exec('npm run build && npx gh-pages -d dist', (err2) => {
                  if (err2) console.error('Fallback deploy also failed:', err2);
                  else console.log('Successfully deployed to GitHub Pages via fallback!');
                });
              } else {
                console.log('Successfully committed to main and deployed to GitHub Pages!');
              }
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Đã lưu và đang đẩy lên GitHub!' }));
          } catch (err: any) {
            console.error('Error syncing:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), syncToGithubPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
