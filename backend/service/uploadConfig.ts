import crypto from 'node:crypto';
import multer from 'multer';
import { resolve, extname, basename } from 'node:path';

export default {
  upload(folder: string) {
    return {
      storage: multer.diskStorage({
        destination: resolve(process.cwd(), folder),
        filename: (_req, file, callback) => {
          const fileHash = crypto.randomBytes(16).toString('hex');
          const original = basename(file.originalname || 'arquivo');
          const ext = (extname(original) || '').toLowerCase();
          const nameOnly = original.replace(new RegExp(`${ext}$`, 'i'), '');
          // Remove acentos, caracteres especiais e espaços; limita tamanho
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
}
