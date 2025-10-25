// scripts/dashboard.js
// Responsável por carregar e renderizar o Dashboard na index.html
import pontoService from './service/pontoService.js';

let chartPorTipo = null;
let chartCrescimento = null;

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

function renderizarGraficos(pontosPorTipo, pontosPorMes) {
  if (chartPorTipo) chartPorTipo.destroy();
  if (chartCrescimento) chartCrescimento.destroy();

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
}

async function carregarDashboard() {
  try {
    const data = await pontoService.obterEstatisticas();
    const { pontosPorTipo = [], pontosPorMes = [], totalPontos = 0, totalEventos = 0, pontosRecentes = [] } = data || {};

    const totalServicosEl = document.getElementById('totalServicos');
    if (totalServicosEl) totalServicosEl.textContent = totalPontos;
    const totalEventosEl = document.getElementById('totalEventos');
    if (totalEventosEl) totalEventosEl.textContent = totalEventos;

    const mesAtual = new Date();
    const ym = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}`;
    const crescimentoMesAtual = pontosPorMes.find(i => i._id === ym);
    const crescimentoEl = document.getElementById('crescimentoMes');
    if (crescimentoEl) crescimentoEl.textContent = crescimentoMesAtual?.total || 0;

    const tipoMaisComumEl = document.getElementById('tipoMaisComum');
    if (tipoMaisComumEl) tipoMaisComumEl.textContent = pontosPorTipo[0]?.total ? `${pontosPorTipo[0]._id} (${pontosPorTipo[0].total})` : 'N/A';

    renderizarGraficos(pontosPorTipo, pontosPorMes);
    renderizarPontosRecentes(pontosRecentes);
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
