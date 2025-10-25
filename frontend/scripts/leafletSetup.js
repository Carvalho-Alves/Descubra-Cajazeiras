// scripts/leafletSetup.js
// Garante que os ícones padrão do Leaflet carreguem corretamente a partir do CDN

if (typeof L !== 'undefined' && L.Icon && L.Icon.Default) {
  // Corrige caminhos dos ícones padrão evitando prefixos duplicados
  const base = 'https://unpkg.com/leaflet@1.9.4/dist/images/';
  L.Icon.Default.imagePath = base;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: base + 'marker-icon-2x.png',
    iconUrl: base + 'marker-icon.png',
    shadowUrl: base + 'marker-shadow.png',
    crossOrigin: 'anonymous'
  });
}
