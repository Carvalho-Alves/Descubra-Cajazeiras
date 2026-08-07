import crypto from 'node:crypto';
import fs from 'node:fs';
import multer from 'multer';
import { resolve, extname, basename } from 'node:path';

/** Garante que a pasta de destino exista antes do Multer gravar. */
function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

export default {
  upload(folder: string) {
    const destination = resolve(process.cwd(), folder);
    ensureDir(destination);

    return {
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
