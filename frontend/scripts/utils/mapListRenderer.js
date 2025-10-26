// scripts/utils/mapListRenderer.js
// Funções utilitárias para normalizar itens e renderizar lista ↔ marcadores no Leaflet

export function normalizarCoordenadas(item) {
  const loc = item.localizacao || item.localização || item.location;
  if (!loc) return null;
  if (typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
    return [loc.latitude, loc.longitude];
  }
  if (Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
    const [lng, lat] = loc.coordinates;
    if (typeof lat === 'number' && typeof lng === 'number') return [lat, lng];
  }
  return null;
}

export function normalizarTipo(item) {
  return item.tipo || item.tipo_servico || item.categoria || 'N/A';
}

function iconConfigPorTipo(tipo) {
  const t = (tipo || '').toLowerCase();
  if (t.includes('hosped')) return { fa: 'fa-bed', color: '#28a745' };
  if (t.includes('alimenta') || t.includes('lazer')) return { fa: 'fa-utensils', color: '#fd7e14' };
  if (t.includes('tur') || t.includes('ponto')) return { fa: 'fa-landmark', color: '#6f42c1' };
  return { fa: 'fa-map-marker-alt', color: '#007bff' };
}

export function renderizarLista(servicos, containerEl) {
  containerEl.innerHTML = '';
  servicos.forEach(servico => {
    const a = document.createElement('a');
    a.className = 'list-group-item list-group-item-action';
    a.href = '#';
    a.dataset.id = servico._id || '';
    const tipo = normalizarTipo(servico);
    const { fa, color } = iconConfigPorTipo(tipo);
    const desc = servico.descricao ? String(servico.descricao).substring(0, 80) + '...' : '';
    const nomeSafe = servico.nome || servico.titulo || 'Serviço';
    a.innerHTML = `
      <div class="d-flex justify-content-between align-items-start">
        <div class="flex-grow-1">
          <h6 class="mb-1">
            <i class="fas ${fa} me-2" style="color:${color}"></i>
            ${nomeSafe}
          </h6>
          <small class="text-muted">${tipo}</small>
          <p class="mb-0">${desc}</p>
        </div>
          <div class="ms-2 d-flex align-items-start item-actions">
          ${servico._id ? `
            <button type="button" class="btn btn-outline-secondary btn-sm" onclick='event.stopPropagation();event.preventDefault();avaliacoesUI.abrir("servico", "${String(servico._id)}", ${JSON.stringify(nomeSafe)})'>
              <i class="fas fa-star me-1"></i>Avaliações
            </button>
          ` : ''}
        </div>
      </div>`;
    containerEl.appendChild(a);
  });
}

export function renderizarMarcadores(map, layerGroup, servicos, { onMarkerClick, buildPopup } = {}) {
  layerGroup.clearLayers();
  const markersById = new Map();
  servicos.forEach(s => {
    const latlng = normalizarCoordenadas(s);
    if (!latlng) return;
    const tipo = normalizarTipo(s);
    const { fa, color } = iconConfigPorTipo(tipo);
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div class="marker-icon" style="background-color:${color}"><i class="fas ${fa}"></i></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
    const m = L.marker(latlng, { icon });
    // Pop-up customizável a partir do chamador
    if (typeof buildPopup === 'function') {
      try {
        const html = buildPopup(s);
        m.bindPopup(html || '');
      } catch {
        m.bindPopup(`
          <div>
            <strong>${s.nome || s.titulo || 'Sem nome'}</strong><br/>
            <small>${tipo}</small>
          </div>
        `);
      }
    } else {
      m.bindPopup(`
        <div>
          <strong>${s.nome || s.titulo || 'Sem nome'}</strong><br/>
          <small>${tipo}</small>
        </div>
      `);
    }
    if (typeof onMarkerClick === 'function') {
      m.on('click', () => onMarkerClick(s));
    }
    layerGroup.addLayer(m);
    if (s._id) markersById.set(String(s._id), m);
  });
  return markersById;
}

export function selecionarItemListaPorId(listaContainer, id) {
  // Não aplicar classe 'active' para evitar destaque amarelo persistente
  const el = listaContainer.querySelector(`.list-group-item[data-id="${CSS.escape(String(id))}"]`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
