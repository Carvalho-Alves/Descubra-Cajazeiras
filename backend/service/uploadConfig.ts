import crypto from 'node:crypto';
import fs from 'node:fs';
import multer from 'multer';
import type { Request } from 'express';
import { resolve, extname, basename } from 'node:path';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.mp4',
  '.webm',
  '.mov',
]);

/** Garante que a pasta de destino exista antes do Multer gravar. */
function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

export default {
  upload(folder: string) {
    const destination = resolve(process.cwd(), folder);
    ensureDir(destination);

    return {
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      fileFilter: (
        _req: Request,
        file: Express.Multer.File,
        callback: multer.FileFilterCallback,
      ) => {
        const ext = (extname(file.originalname || '') || '').toLowerCase();
        const mime = (file.mimetype || '').toLowerCase();

        if (!ALLOWED_MIME_TYPES.has(mime) && !ALLOWED_EXTENSIONS.has(ext)) {
          return callback(
            new Error('Tipo de arquivo não permitido. Use imagem (JPEG, PNG, WebP, GIF) ou vídeo (MP4, WebM, MOV).'),
          );
        }

        return callback(null, true);
      },
      storage: multer.diskStorage({
        destination: (_req, _file, callback) => {
          ensureDir(destination);
          callback(null, destination);
        },
        filename: (_req, file, callback) => {
          const fileHash = crypto.randomBytes(16).toString('hex');
          const original = basename(file.originalname || 'arquivo');
          const ext = (extname(original) || '').toLowerCase();
          const nameOnly = original.replace(new RegExp(`${ext}$`, 'i'), '');
          const sanitized = nameOnly
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .replace(/[^a-zA-Z0-9-_]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/(^-|-$)/g, '')
            .toLowerCase()
            .slice(0, 50) || 'arquivo';
          const filename = `${fileHash}-${sanitized}${ext || ''}`;
          return callback(null, filename);
        },
      }),
    };
  },
};
