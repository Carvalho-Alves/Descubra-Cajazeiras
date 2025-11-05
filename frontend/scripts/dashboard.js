// scripts/dashboard.js
// Responsável por carregar e renderizar o Dashboard na index.html
import pontoService from './service/pontoService.js';

let chartPorTipo = null;
let chartCrescimento = null;
let chartDistribuicaoNotas = null;
let chartStatusEventos = null;
let chartCrescimentoAvaliacoes = null;

function renderizarPontosRecentes(pontosRecentes) {
  const container = document.getElementById('servicosRecentes');
  if (!container) return;
  if (!Array.isArray(pontosRecentes) || pontosRecentes.length === 0) {
    container.innerHTML = '<div class="text-center text-muted p-3">Nenhum ponto cadastrado ainda</div>';
    return;
  }
  container.innerHTML = pontosRecentes.map(p => `
    <div class="list-group-item">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h6 class="mb-1">${p.nome || 'Sem nome'}</h6>
          <span class="badge bg-primary">${p.tipo || p.tipo_servico || 'N/A'}</span>
        </div>
        <small class="text-muted">${p.createdAt ? new Date(p.createdAt).toLocaleDateString('pt-BR') : ''}</small>
      </div>
    </div>
  `).join('');
}

function renderizarTopAvaliados(tipo, dados, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!Array.isArray(dados) || dados.length === 0) {
    container.innerHTML = '<div class="text-center text-muted p-3"><i class="fas fa-star-half-alt fa-2x mb-2"></i><br>Nenhum item avaliado ainda.<br><small>Seja o primeiro a avaliar!</small></div>';
    return;
  }
  container.innerHTML = dados.slice(0, 5).map(item => `
    <div class="list-group-item">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h6 class="mb-1">${item.nome || item.titulo || 'Sem nome'}</h6>
          <small class="text-muted">${tipo}</small>
        </div>
        <div class="text-end">
          <div class="d-flex align-items-center">
            ${renderizarEstrelas(item.mediaAvaliacoes || 0)}
            <span class="ms-2 badge bg-warning">${(item.mediaAvaliacoes || 0).toFixed(1)}</span>
          </div>
          <small class="text-muted">${item.totalAvaliacoes || 0} avaliações</small>
        </div>
      </div>
    </div>
  `).join('');
}

function renderizarAvaliacoesRecentes(avaliacoes) {
  const container = document.getElementById('avaliacoesRecentes');
  if (!container) return;
  if (!Array.isArray(avaliacoes) || avaliacoes.length === 0) {
    container.innerHTML = '<div class="text-center text-muted p-3">Nenhuma avaliação recente</div>';
    return;
  }
  container.innerHTML = avaliacoes.slice(0, 5).map(av => `
    <div class="list-group-item">
      <div class="d-flex justify-content-between align-items-start">
        <div class="flex-grow-1">
          <div class="d-flex align-items-center mb-1">
            <strong class="me-2">${av.usuarioNome || 'Usuário'}</strong>
            ${renderizarEstrelas(av.nota)}
          </div>
          <p class="mb-1">${av.comentario || 'Sem comentário'}</p>
          <small class="text-muted">${av.servicoNome || av.eventoNome || 'Item'} • ${new Date(av.criadoEm).toLocaleDateString('pt-BR')}</small>
        </div>
      </div>
    </div>
  `).join('');
}

function renderizarEventosRecentes(eventos) {
  const container = document.getElementById('eventosRecentes');
  if (!container) return;
  if (!Array.isArray(eventos) || eventos.length === 0) {
    container.innerHTML = '<div class="text-center text-muted p-3">Nenhum evento cadastrado ainda</div>';
    return;
  }
  container.innerHTML = eventos.map(evento => `
    <div class="list-group-item">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h6 class="mb-1">${evento.nome || 'Sem nome'}</h6>
          <small class="text-muted">Criado por ${evento.criadorNome || 'Usuário'}</small>
        </div>
        <div class="text-end">
          <span class="badge bg-${evento.status === 'ativo' ? 'success' : evento.status === 'cancelado' ? 'danger' : 'secondary'}">${evento.status || 'N/A'}</span>
          <br>
          <small class="text-muted">${evento.createdAt ? new Date(evento.createdAt).toLocaleDateString('pt-BR') : ''}</small>
        </div>
      </div>
    </div>
  `).join('');
}

function renderizarEstrelas(nota) {
  const estrelasCheias = Math.floor(nota);
  const meiaEstrela = nota % 1 >= 0.5;
  const estrelasVazias = 5 - estrelasCheias - (meiaEstrela ? 1 : 0);

  let html = '';
  for (let i = 0; i < estrelasCheias; i++) {
    html += '<i class="fas fa-star text-warning"></i>';
  }
  if (meiaEstrela) {
    html += '<i class="fas fa-star-half-alt text-warning"></i>';
  }
  for (let i = 0; i < estrelasVazias; i++) {
    html += '<i class="far fa-star text-warning"></i>';
  }
  return html;
}

function renderizarGraficos(pontosPorTipo, pontosPorMes, distribuicaoNotas, eventosPorStatus, avaliacoesPorMes) {
  // Destruir gráficos existentes
  if (chartPorTipo) chartPorTipo.destroy();
  if (chartCrescimento) chartCrescimento.destroy();
  if (chartDistribuicaoNotas) chartDistribuicaoNotas.destroy();
  if (chartStatusEventos) chartStatusEventos.destroy();
  if (chartCrescimentoAvaliacoes) chartCrescimentoAvaliacoes.destroy();

  // Gráfico de Serviços por Tipo
  const elTipo = document.getElementById('graficoServicosPorTipo');
  if (elTipo) {
    const ctxTipo = elTipo.getContext('2d');
    chartPorTipo = new Chart(ctxTipo, {
      type: 'doughnut',
      data: {
        labels: pontosPorTipo.map(i => i._id),
        datasets: [{
          data: pontosPorTipo.map(i => i.total),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#C9CBCF'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  // Gráfico de Crescimento de Cadastros
  const elCresc = document.getElementById('graficoCrescimento');
  if (elCresc) {
    const ctxCres = elCresc.getContext('2d');
    const mesesOrdenados = [...pontosPorMes].sort((a, b) => a._id.localeCompare(b._id));
    chartCrescimento = new Chart(ctxCres, {
      type: 'line',
      data: {
        labels: mesesOrdenados.map(i => i._id),
        datasets: [{
          label: 'Pontos Cadastrados',
          data: mesesOrdenados.map(i => i.total),
          borderColor: '#4BC0C0',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // Gráfico de Distribuição de Notas
  const elDistribuicao = document.getElementById('graficoDistribuicaoNotas');
  if (elDistribuicao) {
    const ctxDist = elDistribuicao.getContext('2d');
    const labels = ['1 estrela', '2 estrelas', '3 estrelas', '4 estrelas', '5 estrelas'];
    const data = [0, 0, 0, 0, 0];
    distribuicaoNotas.forEach(item => {
      if (item._id >= 1 && item._id <= 5) {
        data[item._id - 1] = item.total;
      }
    });
    chartDistribuicaoNotas = new Chart(ctxDist, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Número de Avaliações',
          data: data,
          backgroundColor: 'rgba(255, 193, 7, 0.8)',
          borderColor: '#FFC107',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // Gráfico de Status dos Eventos
  const elStatus = document.getElementById('graficoStatusEventos');
  if (elStatus) {
    const ctxStatus = elStatus.getContext('2d');

    // Se não há dados de status, mostrar mensagem
    if (!eventosPorStatus || eventosPorStatus.length === 0) {
      ctxStatus.clearRect(0, 0, elStatus.width, elStatus.height);
      ctxStatus.font = '16px Arial';
      ctxStatus.fillStyle = '#666';
      ctxStatus.textAlign = 'center';
      ctxStatus.fillText('Nenhum evento encontrado', elStatus.width / 2, elStatus.height / 2);
      return;
    }

    const statusMap = {
      'ativo': 'Ativo',
      'cancelado': 'Cancelado',
      'encerrado': 'Encerrado',
      null: 'Sem Status',
      undefined: 'Sem Status'
    };
    const labels = eventosPorStatus.map(i => statusMap[i._id] || i._id);
    const data = eventosPorStatus.map(i => i.total);
    chartStatusEventos = new Chart(ctxStatus, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#28a745', '#dc3545', '#6c757d', '#ffc107']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  // Gráfico de Crescimento de Avaliações
  const elCrescAval = document.getElementById('graficoCrescimentoAvaliacoes');
  if (elCrescAval) {
    const ctxCrescAval = elCrescAval.getContext('2d');

    // Se não há dados de avaliações, mostrar mensagem
    if (!avaliacoesPorMes || avaliacoesPorMes.length === 0) {
      // Limpar canvas e mostrar mensagem
      ctxCrescAval.clearRect(0, 0, elCrescAval.width, elCrescAval.height);
      ctxCrescAval.font = '16px Arial';
      ctxCrescAval.fillStyle = '#666';
      ctxCrescAval.textAlign = 'center';
      ctxCrescAval.fillText('Nenhuma avaliação encontrada', elCrescAval.width / 2, elCrescAval.height / 2);
      return;
    }

    // Se há dados, criar o gráfico
    const mesesOrdenados = [...avaliacoesPorMes].sort((a, b) => a._id.localeCompare(b._id));
    chartCrescimentoAvaliacoes = new Chart(ctxCrescAval, {
      type: 'line',
      data: {
        labels: mesesOrdenados.map(i => i._id),
        datasets: [{
          label: 'Avaliações',
          data: mesesOrdenados.map(i => i.total),
          borderColor: '#FF6384',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } }
      }
    });
  }
}

async function carregarDashboard() {
  try {
    const data = await pontoService.obterEstatisticas();
    const {
      pontosPorTipo = [],
      pontosPorMes = [],
      totalPontos = 0,
      totalEventos = 0,
      totalAvaliacoes = 0,
      mediaGeral = 0,
      pontosRecentes = [],
      distribuicaoNotas = [],
      eventosPorStatus = [], // Corrigido: era statusEventos
      avaliacoesPorMes = [],
      topServicosAvaliados = [],
      topEventosAvaliados = [],
      avaliacoesRecentes = [],
      eventosRecentes = []
    } = data || {};

    // Atualizar contadores principais
    const totalServicosEl = document.getElementById('totalServicos');
    if (totalServicosEl) totalServicosEl.textContent = totalPontos;
    const totalEventosEl = document.getElementById('totalEventos');
    if (totalEventosEl) totalEventosEl.textContent = totalEventos;
    const totalAvaliacoesEl = document.getElementById('totalAvaliacoes');
    if (totalAvaliacoesEl) totalAvaliacoesEl.textContent = totalAvaliacoes;
    const mediaGeralEl = document.getElementById('mediaGeralAvaliacoes');
    if (mediaGeralEl) mediaGeralEl.textContent = mediaGeral.toFixed(1);

    // Renderizar gráficos
    renderizarGraficos(pontosPorTipo, pontosPorMes, distribuicaoNotas, eventosPorStatus, avaliacoesPorMes);

    // Renderizar listas
    renderizarPontosRecentes(pontosRecentes);
    renderizarEventosRecentes(eventosRecentes);
    renderizarTopAvaliados('Serviço', topServicosAvaliados, 'topServicosAvaliados');
    renderizarTopAvaliados('Evento', topEventosAvaliados, 'topEventosAvaliados');
    renderizarAvaliacoesRecentes(avaliacoesRecentes);

  } catch (err) {
    console.error('Erro ao carregar dashboard:', err);
  }
}

// Carrega dados quando o modal é aberto
document.addEventListener('DOMContentLoaded', () => {
  const modalEl = document.getElementById('modalDashboard');
  if (!modalEl) return;
  modalEl.addEventListener('shown.bs.modal', carregarDashboard);
  // também expõe um botão manual
  const btnAtualizar = document.getElementById('btnAtualizarDashboard');
  if (btnAtualizar) btnAtualizar.addEventListener('click', carregarDashboard);
});
