import L from 'leaflet';

export function ensureLeafletDefaultIcon() {
  // Corrige ícones padrão do Leaflet em builds bundler.
  // Mantém comportamento padrão sem adicionar UX extra.
  // Fonte do padrão: Leaflet docs/issues comuns.
  // @ts-expect-error - compat: L.Icon.Default usa _getIconUrl internamente
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString(),
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString(),
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString()
  });
}
