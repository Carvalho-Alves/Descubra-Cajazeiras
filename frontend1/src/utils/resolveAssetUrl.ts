export function resolveApiAssetUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return pathOrUrl;
  const trimmed = String(pathOrUrl).trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // Normaliza separadores (Windows) para URL
  let normalized = trimmed.replace(/\\/g, '/');

  // Se veio um caminho completo local (ex.: C:/.../uploads/x.png), recorta a partir de /uploads/
  const uploadsIdx = normalized.lastIndexOf('/uploads/');
  if (uploadsIdx >= 0) normalized = normalized.substring(uploadsIdx);

  // Remove prefixo /api apenas quando a rota for de uploads
  if (normalized.startsWith('/api/uploads/')) normalized = normalized.replace(/^\/api/, '');

  if (!normalized.startsWith('/')) normalized = `/${normalized}`;

  const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const fallbackOrigin =
    typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'http://localhost:3333';
  const origin = apiBase && /^https?:\/\//i.test(apiBase) ? new URL(apiBase).origin : fallbackOrigin;

  return `${origin}${normalized}`;
}
