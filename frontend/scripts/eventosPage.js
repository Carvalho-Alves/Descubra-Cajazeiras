// scripts/eventosPage.js
// Página dedicada para gerenciar eventos, espelhando servicosPage.js

class EventosPageManager {
  constructor() {
    this.map = null;
    this.cluster = new L.MarkerClusterGroup();
    this.mini = null;
    this.miniMarker = null;
    this.eventos = [];
    this.filtroAtivo = '';
    this.eventoAtualId = null;

    this.initializeElements();
  // Define ícone padrão global do Leaflet como o ícone HTML de evento
  try { L.Marker.prototype.options.icon = this.criarIcone(); } catch {}
    this.setupMap();
    this.setupEventListeners();
    this.checkAuthentication();
    this.carregarEventos();
  }

  initializeElements() {
    this.usuarioArea = document.getElementById('usuario-area');

    // Lista/controles
    this.lista = document.getElementById('listaEventosPagina');
    this.loading = document.getElementById('loadingEventosPagina');
    this.nenhum = document.getElementById('nenhumEventoPagina');
    this.total = document.getElementById('totalEventosContagem');
    this.ativos = document.getElementById('totalEventosAtivos');
    this.encerrados = document.getElementById('totalEventosEncerrados');
    this.inputBusca = document.getElementById('inputBuscaEventos');
    this.btnBuscar = document.getElementById('btnBuscarEventos');
    this.btnAtualizar = document.getElementById('btnAtualizarEventos');
    this.btnNovo = document.getElementById('btnNovoEvento');
    this.btnNovoMapa = document.getElementById('btnNovoEventoMapa');
    this.btnPrimeiro = document.getElementById('btnPrimeiroEvento');
    this.btnCentralizar = document.getElementById('btnCentralizarMapaEventos');
    this.filtros = document.querySelectorAll('input[name="filtroEvento"]');

    // Modal/form
    this.modal = new bootstrap.Modal(document.getElementById('modalEvento'));
    this.form = document.getElementById('formEvento');
    this.tituloModal = document.getElementById('tituloModalEvento');
    this.btnTexto = document.getElementById('btnTextoEvento');
    this.alert = document.getElementById('alertContainerEvento');
    this.inputNome = document.getElementById('inputNomeEvento');
    this.inputDescricao = document.getElementById('inputDescricaoEvento');
    this.inputData = document.getElementById('inputDataEvento');
    this.inputHorario = document.getElementById('inputHorarioEvento');
    this.inputStatus = document.getElementById('inputStatusEvento');
    this.inputLat = document.getElementById('inputLatitudeEvento');
    this.inputLng = document.getElementById('inputLongitudeEvento');
    this.inputEndereco = document.getElementById('inputEnderecoEvento');
    this.dropdownEnd = document.getElementById('resultadosBuscaEvento');
    this.btnBuscarEndereco = document.getElementById('btnBuscarEnderecoEvento');
  }

  setupMap() {
    this.map = L.map('mapaEventos').setView([-6.8897, -38.5583], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    this.map.on('click', (e) => {
      if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
        this.abrirModalCriacao({ latitude: e.latlng.lat, longitude: e.latlng.lng });
      }
    });
  }

  setupEventListeners() {
    // Mapa: centralizar
    if (this.btnCentralizar) {
      this.btnCentralizar.addEventListener('click', () => this.centralizarNaMinhaLocalizacao());
    }

    // Ações
    this.btnNovo?.addEventListener('click', () => this.abrirModalCriacao());
    this.btnNovoMapa?.addEventListener('click', () => this.abrirModalCriacao());
    this.btnPrimeiro?.addEventListener('click', () => this.abrirModalCriacao());
    this.btnAtualizar?.addEventListener('click', () => this.carregarEventos());
    this.btnBuscar?.addEventListener('click', () => this.aplicarBuscaEFiltro());
  this.inputBusca?.addEventListener('input', () => this.aplicarBuscaEFiltro());
  this.inputBusca?.addEventListener('keydown', (e)=>{ if (e.key==='Enter'){ e.preventDefault(); this.aplicarBuscaEFiltro(); }});

    // Filtros
    this.filtros.forEach(r => r.addEventListener('change', (e) => {
      this.filtroAtivo = e.target.value;
      this.aplicarBuscaEFiltro();
    }));

    // Form
    this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
  document.getElementById('modalEvento').addEventListener('shown.bs.modal', () => this.setupMini());
  document.getElementById('modalEvento').addEventListener('hidden.bs.modal', () => this.limparFormulario());
    this.inputLat.addEventListener('change', () => this.refreshMini());
    this.inputLng.addEventListener('change', () => this.refreshMini());

    // Busca de endereço
    this.btnBuscarEndereco?.addEventListener('click', () => this.buscarEndereco());
    this.inputEndereco?.addEventListener('keydown', (e) => { if (e.key === 'Enter'){ e.preventDefault(); this.buscarEndereco(); } });
  }

  showAlert(msg, type='info') {
    this.alert.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show">${msg}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
    setTimeout(()=> this.alert.innerHTML = '', 4000);
  }

  getUsuarioAutenticado() {
    try { const u = localStorage.getItem('usuarioAutenticado'); return u? JSON.parse(u): null; } catch { return null; }
  }

  checkAuthentication() {
    const usuario = this.getUsuarioAutenticado();
    const token = localStorage.getItem('authToken');
    const usuarioLogado = usuario !== null && token !== null;
    if (usuarioLogado) {
      const nomeUsuario = usuario.user?.nome || usuario.nome || 'Usuário';
      this.usuarioArea.innerHTML = `
        <div class="dropdown">
          <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
            <i class="fas fa-user-circle me-2"></i> ${nomeUsuario}
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="index.html"><i class="fas fa-map me-2"></i>Voltar ao Mapa</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="#" id="btnSairEventos"><i class="fas fa-sign-out-alt me-2"></i>Sair</a></li>
          </ul>
        </div>`;
      document.getElementById('btnSairEventos')?.addEventListener('click', (e)=>{ e.preventDefault(); if (confirm('Deseja realmente sair?')) this.logout(); });
    } else {
      this.usuarioArea.innerHTML = `<a href="auth.html" class="btn btn-primary"><i class="fas fa-sign-in-alt me-2"></i>Entrar</a>`;
    }
  }

  logout() {
    localStorage.removeItem('usuarioAutenticado');
    localStorage.removeItem('authToken');
    window.location.href = 'index.html';
  }

  async carregarEventos() {
    this.loading.style.display = 'block';
    try {
      const res = await fetch('/api/eventos');
      if (!res.ok) throw new Error('Falha ao buscar eventos');
      this.eventos = await res.json();
      this.aplicarBuscaEFiltro();
      this.atualizarEstatisticas();
    } catch (e) {
      this.showAlert('Erro ao carregar eventos: ' + e.message, 'danger');
    } finally {
      this.loading.style.display = 'none';
    }
  }

  aplicarBuscaEFiltro() {
    const q = (this.inputBusca?.value || '').toLowerCase();
    let lista = [...this.eventos];
    if (this.filtroAtivo) lista = lista.filter(e => (e.status || 'ativo') === this.filtroAtivo);
    if (q) lista = lista.filter(e => (e.nome||'').toLowerCase().includes(q) || (e.descricao||'').toLowerCase().includes(q));
    this.renderList(lista);
    this.renderMarkers(lista);
  }

  renderList(items) {
    this.lista.innerHTML = '';
    this.nenhum.style.display = items.length ? 'none' : 'block';
    items.forEach(ev => {
      const el = document.createElement('div');
      el.className = 'list-group-item list-group-item-action';
      el.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
          <div class="flex-grow-1">
            <h6 class="mb-1">${ev.nome}</h6>
            <small class="text-muted"><i class="fas fa-calendar me-1"></i>${ev.data ? new Date(ev.data).toLocaleDateString('pt-BR') : ''} • ${ev.status || 'ativo'}</small>
            <p class="mb-0">${ev.descricao ? ev.descricao.substring(0,80)+'...' : ''}</p>
          </div>
          <div class="btn-group-vertical btn-group-sm">
            <button class="btn btn-outline-warning btn-sm" data-action="edit"><i class="fas fa-edit"></i></button>
            <button class="btn btn-outline-danger btn-sm" data-action="del"><i class="fas fa-trash"></i></button>
          </div>
        </div>`;
      el.addEventListener('click', (e)=>{
        const btn = e.target.closest('button');
        if (btn?.dataset.action === 'edit') return this.editarEvento(ev._id);
        if (btn?.dataset.action === 'del') return this.excluirEvento(ev._id);
        this.centralizarNoEvento(ev);
      });
      this.lista.appendChild(el);
    });
  }

  criarIcone() {
    return L.divIcon({
      // Inclui classe padrão do Leaflet para evitar problemas de renderização
      className: 'leaflet-div-icon custom-marker',
      html: `<div class="marker-icon" style="background-color:#0d6efd"><i class="fas fa-calendar"></i></div>`,
      iconSize: [32,32], iconAnchor: [16,32], popupAnchor:[0,-32]
    });
  }

  normalizeLatLng(ev) {
    const loc = ev.localizacao || {};

    // 1) latitude/longitude como number ou string
    const latRaw = loc.latitude ?? loc.lat ?? ev.latitude ?? null;
    const lngRaw = loc.longitude ?? loc.lng ?? loc.lon ?? ev.longitude ?? null;
    const latNum = typeof latRaw === 'string' ? parseFloat(latRaw) : (typeof latRaw === 'number' ? latRaw : NaN);
    const lngNum = typeof lngRaw === 'string' ? parseFloat(lngRaw) : (typeof lngRaw === 'number' ? lngRaw : NaN);
    if (!Number.isNaN(latNum) && !Number.isNaN(lngNum)) return [latNum, lngNum];

    // 2) GeoJSON: coordinates [lng, lat] possivelmente como string
    if (loc && Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
      const lng = typeof loc.coordinates[0] === 'string' ? parseFloat(loc.coordinates[0]) : loc.coordinates[0];
      const lat = typeof loc.coordinates[1] === 'string' ? parseFloat(loc.coordinates[1]) : loc.coordinates[1];
      if (typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)) {
        return [lat, lng];
      }
    }

    return null;
  }

  renderMarkers(items) {
    if (this.cluster) this.map.removeLayer(this.cluster);
    this.cluster = new L.MarkerClusterGroup();
    items.forEach(ev => {
      const ll = this.normalizeLatLng(ev);
      if (!ll) return;
      const m = L.marker(ll, { icon: this.criarIcone() });
      m.bindPopup(`
        <div class='popup-servico'>
          <h6>${ev.nome}</h6>
          <small>${ev.status||'ativo'} • ${ev.data ? new Date(ev.data).toLocaleDateString('pt-BR'):''}</small>
          <p>${ev.descricao?ev.descricao.substring(0,100)+'...':''}</p>
          <div class='btn-group btn-group-sm w-100'>
            <button class='btn btn-warning' onclick='eventosPage.editarEvento("${ev._id}")'><i class="fas fa-edit me-1"></i>Editar</button>
            <button class='btn btn-danger' onclick='eventosPage.excluirEvento("${ev._id}")'><i class="fas fa-trash me-1"></i>Excluir</button>
          </div>
        </div>`);
      this.cluster.addLayer(m);
    });
    this.map.addLayer(this.cluster);
  }

  atualizarEstatisticas() {
    const total = this.eventos.length;
    const ativos = this.eventos.filter(e => (e.status||'ativo') === 'ativo').length;
    const encerrados = this.eventos.filter(e => (e.status||'ativo') === 'encerrado').length;
    this.total.textContent = total;
    this.ativos.textContent = ativos;
    if (this.encerrados) this.encerrados.textContent = encerrados;
  }

  centralizarNoEvento(ev) {
    const ll = this.normalizeLatLng(ev);
    if (ll) this.map.setView(ll, 17);
  }

  setupMini() {
    if (!this.mini) {
      this.mini = L.map('miniMapaEvento').setView([-6.8897, -38.5583], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.mini);
      this.mini.on('click', (e)=>{
        this.inputLat.value = e.latlng.lat.toFixed(6);
        this.inputLng.value = e.latlng.lng.toFixed(6);
        this.refreshMini();
      });
    }
    setTimeout(()=>{ this.mini.invalidateSize(); this.refreshMini(); }, 120);
  }

  refreshMini() {
    const lat = parseFloat(this.inputLat.value); const lng = parseFloat(this.inputLng.value);
    if (isNaN(lat)||isNaN(lng)) return;
    if (this.miniMarker) this.mini.removeLayer(this.miniMarker);
  this.miniMarker = L.marker([lat,lng], { icon: this.criarIcone() }).addTo(this.mini);
    this.mini.setView([lat,lng], 16);
  }

  abrirModalCriacao(coords = null) {
    this.eventoAtualId = null;
    this.tituloModal.textContent = 'Novo Evento';
    this.btnTexto.textContent = 'Salvar Evento';
    this.form.reset();
    if (coords) {
      this.inputLat.value = coords.latitude.toFixed(6);
      this.inputLng.value = coords.longitude.toFixed(6);
    } else {
      this.inputLat.value = '-6.8897';
      this.inputLng.value = '-38.5583';
    }
    this.modal.show();
  }

  async editarEvento(id) {
    try {
      const res = await fetch(`/api/eventos/${id}`);
      if (!res.ok) throw new Error('Evento não encontrado');
      const ev = await res.json();
      this.eventoAtualId = ev._id;
      this.tituloModal.textContent = 'Editar Evento';
      this.btnTexto.textContent = 'Atualizar Evento';
      this.inputNome.value = ev.nome || '';
      this.inputDescricao.value = ev.descricao || '';
      this.inputStatus.value = ev.status || 'ativo';
      this.inputData.value = ev.data ? new Date(ev.data).toISOString().substring(0,10) : '';
      this.inputHorario.value = ev.horario || '';
      const ll = this.normalizeLatLng(ev);
      if (ll) { this.inputLat.value = ll[0]; this.inputLng.value = ll[1]; }
      this.modal.show();
      this.setupMini();
    } catch (e) {
      this.showAlert('Erro ao carregar evento: ' + e.message, 'danger');
    }
  }

  async excluirEvento(id) {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/eventos/${id}`, { method: 'DELETE', headers: token? { Authorization: `Bearer ${token}` }: {} });
      if (res.status === 401) {
        this.showAlert('Faça login para excluir eventos.', 'warning');
        setTimeout(()=> window.location.href = 'auth.html', 1200);
        return;
      }
      if (!res.ok) throw new Error('Erro ao excluir evento');
      this.showAlert('Evento excluído com sucesso!', 'success');
      await this.carregarEventos();
    } catch (e) {
      this.showAlert('Erro ao excluir: ' + e.message, 'danger');
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const body = {
        nome: this.inputNome.value.trim(),
        data: this.inputData.value ? new Date(this.inputData.value).toISOString() : new Date().toISOString(),
        horario: this.inputHorario.value.trim(),
        descricao: this.inputDescricao.value.trim(),
        status: this.inputStatus.value,
        localizacao: { latitude: parseFloat(this.inputLat.value), longitude: parseFloat(this.inputLng.value) },
      };
      const url = this.eventoAtualId ? `/api/eventos/${this.eventoAtualId}` : '/api/eventos';
      const method = this.eventoAtualId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...(token? { Authorization: `Bearer ${token}` }: {}) }, body: JSON.stringify(body) });
      if (res.status === 401) {
        this.showAlert('Faça login para salvar eventos.', 'warning');
        setTimeout(()=> window.location.href = 'auth.html', 1200);
        return;
      }
      if (!res.ok) { const err = await res.json().catch(()=>({message:'Erro'})); throw new Error(err.message||'Erro ao salvar evento'); }
      this.showAlert(this.eventoAtualId ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!', 'success');
      this.modal.hide();
      await this.carregarEventos();
    } catch (e) {
      this.showAlert('Erro ao salvar evento: ' + e.message, 'danger');
    }
  }

  limparFormulario() {
    this.form.reset();
    this.eventoAtualId = null;
    if (this.alert) this.alert.innerHTML = '';
    if (this.miniMarker) {
      this.mini.removeLayer(this.miniMarker);
      this.miniMarker = null;
    }
  }

  async buscarEndereco() {
    const q = (this.inputEndereco?.value || '').trim();
    if (!q) return;
    this.dropdownEnd.innerHTML = '<div class="dropdown-item text-center"><i class="fas fa-spinner fa-spin"></i> Buscando...</div>';
    this.dropdownEnd.style.display = 'block';
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1&countrycodes=br`);
      const arr = await res.json();
      if (!arr.length) { this.dropdownEnd.innerHTML = '<div class="dropdown-item text-muted">Nenhum resultado</div>'; return; }
      this.dropdownEnd.innerHTML = arr.map(r => `
        <button type="button" class="dropdown-item endereco-resultado" data-lat="${r.lat}" data-lng="${r.lon}" data-endereco="${r.display_name}">
          <div>
            <strong>${(r.display_name||'').split(',')[0]}</strong><br/>
            <small class="text-muted">${r.display_name}</small>
          </div>
        </button>`).join('');
      this.dropdownEnd.querySelectorAll('.endereco-resultado').forEach(btn => {
        btn.addEventListener('click', () => {
          const lat = parseFloat(btn.dataset.lat); const lng = parseFloat(btn.dataset.lng);
          this.inputLat.value = lat.toFixed(6); this.inputLng.value = lng.toFixed(6);
          this.inputEndereco.value = btn.dataset.endereco;
          this.refreshMini();
          this.dropdownEnd.style.display = 'none';
        });
      });
    } catch (e) {
      this.dropdownEnd.innerHTML = '<div class="dropdown-item text-danger">Erro ao buscar</div>';
    }
  }

  centralizarNaMinhaLocalizacao() {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada por este navegador.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.map.setView([pos.coords.latitude, pos.coords.longitude], 16);
      },
      (err) => alert('Erro ao obter localização: ' + err.message)
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.eventosPage = new EventosPageManager();
});
