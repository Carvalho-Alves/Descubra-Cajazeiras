// scripts/leafletSetup.js
// Garante que os ícones padrão do Leaflet carreguem corretamente a partir do CDN

if (typeof L !== 'undefined' && L.Icon && L.Icon.Default) {
  // Define URLs absolutas dos ícones padrão e evita definir imagePath para não duplicar prefixos
  const base = 'https://unpkg.com/leaflet@1.9.4/dist/images/';
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: base + 'marker-icon-2x.png',
    iconUrl: base + 'marker-icon.png',
    shadowUrl: base + 'marker-shadow.png',
    crossOrigin: 'anonymous'
  });
}
