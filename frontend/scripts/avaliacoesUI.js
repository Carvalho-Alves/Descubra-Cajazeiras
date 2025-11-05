// scripts/avaliacoesUI.js
// UI reutilizável para listar e criar avaliações de serviços e eventos

(function(){
  const state = {
    tipo: null, // 'servico' | 'evento'
    id: null,
    nome: '',
  };

  function el(id){ return document.getElementById(id); }
  function getToken(){ try { return localStorage.getItem('authToken'); } catch { return null; } }
  function getUsuario(){ try { const u = localStorage.getItem('usuarioAutenticado'); return u? JSON.parse(u): null; } catch { return null; } }

  function stars(n){
    const full = '★'.repeat(Math.round(n||0));
    const empty = '☆'.repeat(5 - Math.round(n||0));
    return `<span class="text-warning" aria-label="${n||0} de 5">${full}${empty}</span>`;
  }

  async function carregarLista(){
    const lista = el('avaliacoes-lista');
    const statsBox = el('avaliacoes-stats');
    const vazio = el('avaliacoes-vazio');
    lista.innerHTML = '<div class="text-center py-3"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>';
    vazio.style.display = 'none';
    statsBox.innerHTML = '';
    try {
      const r = await fetch(`/api/avaliacoes/referencia/${encodeURIComponent(state.tipo)}/${encodeURIComponent(state.id)}?limit=50`);
      if (!r.ok) throw new Error('Falha ao carregar avaliações');
      const data = await r.json();
      const { items, stats } = data;
      if (!items || items.length === 0){
        lista.innerHTML = '';
        vazio.style.display = 'block';
      } else {
        lista.innerHTML = items.map(av => `
          <div class="list-group-item">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <div><strong>${escapeHtml(av.usuarioId?.nome || 'Anônimo')}</strong> ${stars(av.nota)} <small class="text-muted">${new Date(av.criadoEm).toLocaleString('pt-BR')}</small></div>
                ${av.comentario ? `<div class="mt-1">${escapeHtml(String(av.comentario))}</div>`: ''}
              </div>
            </div>
          </div>`).join('');
      }
      statsBox.innerHTML = `<div class="alert alert-light border d-flex justify-content-between align-items-center" role="alert">
        <div><strong>Média:</strong> ${stats?.media || 0} / 5 ${stars(stats?.media||0)}</div>
        <div><strong>Total:</strong> ${stats?.total || 0}</div>
      </div>`;
    } catch(e){
      lista.innerHTML = `<div class="alert alert-danger m-2">${e.message}</div>`;
    }
  }

  function escapeHtml(s){
    return s
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  function setStars(n){
    const notaEl = el('avaliacao-nota');
    const stars = document.querySelectorAll('#avaliacao-estrelas .avaliacao-estrela i');
    stars.forEach((icon, idx)=>{
      if (idx < n) {
        icon.classList.remove('far');
        icon.classList.add('fas');
      } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
      }
    });
    if (notaEl) notaEl.value = String(n);
  }

  function bindStarClicks(){
    const container = document.getElementById('avaliacao-estrelas');
    if (!container) return;
    // Evitar múltiplos binds
    if (container.dataset.bound === '1') return;
    container.addEventListener('click', (e)=>{
      const btn = e.target.closest('.avaliacao-estrela');
      if (!btn) return;
      const val = Number(btn.dataset.value || '5');
      setStars(val);
    });
    container.dataset.bound = '1';
  }

  async function enviarAvaliacao(e){
    e.preventDefault();
    const nota = Number((el('avaliacao-nota').value||'').trim());
    const comentario = (el('avaliacao-comentario').value||'').trim();
    const token = getToken();
    if (!token){
      alert('Faça login para avaliar.');
      window.location.href = 'auth.html';
      return;
    }
    el('avaliacao-submit').disabled = true;
    el('avaliacao-submit').innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Enviando...';
    try {
      const r = await fetch('/api/avaliacoes', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ tipo: state.tipo, referenciaId: state.id, nota, comentario })
      });
      const data = await r.json().catch(()=>({}));
      if (!r.ok) throw new Error(data?.message || 'Falha ao enviar avaliação');
      el('avaliacao-comentario').value = '';
      el('avaliacao-nota').value = '5';
      await carregarLista();
    } catch(err){
      alert(err.message);
    } finally {
      el('avaliacao-submit').disabled = false;
      el('avaliacao-submit').innerHTML = '<i class="fas fa-paper-plane me-2"></i>Enviar Avaliação';
    }
  }

  function abrir(tipo, id, nome){
    state.tipo = tipo;
    state.id = id;
    state.nome = nome || '';
    el('avaliacoes-titulo').textContent = `Avaliações • ${state.nome || (tipo==='servico'?'Serviço':'Evento')}`;
    // Mostrar formulário de envio apenas se logado
    const usuario = getUsuario();
    el('avaliacao-form').style.display = usuario ? 'block' : 'none';
    const modalEl = document.getElementById('modalAvaliacoes');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    // Inicializar estrelas (default 5)
    bindStarClicks();
    setStars(5);
    carregarLista();
  }

  function init(){
    const form = el('avaliacao-form');
    if (form && !form.dataset.bound){
      form.addEventListener('submit', enviarAvaliacao);
      form.dataset.bound = '1';
    }
  }

  // Expor globalmente
  window.avaliacoesUI = { abrir };
  document.addEventListener('DOMContentLoaded', init);
})();
