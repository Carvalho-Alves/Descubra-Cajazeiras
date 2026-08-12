import { API_ORIGIN } from '../config/api';

/** Converte caminho relativo (/uploads/...) em URL absoluta */
export function resolveAssetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_ORIGIN}${normalized}`;
}

export function firstImage(
  imagem?: string | string[] | null,
): string | undefined {
  if (!imagem) return undefined;
  if (Array.isArray(imagem)) return resolveAssetUrl(imagem[0]);
  return resolveAssetUrl(imagem);
}

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;

/** Detecta se a URL/caminho aponta para um arquivo de vídeo */
export function isVideoUrl(path?: string | null): boolean {
  if (!path) return false;
  return VIDEO_EXTENSIONS.test(path);
}
