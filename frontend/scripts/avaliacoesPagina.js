import { verificarAutenticacao } from './auth.js';

// Inicializar página
document.addEventListener('DOMContentLoaded', async () => {
  verificarAutenticacao();
  carregarAvaliacoes();
  inicializarEventos();
});

let todasAvaliacoes = [];

function inicializarEventos() {
  // Abas
  document.querySelectorAll('#abas-filtro button').forEach(btn => {
    btn.addEventListener('click', () => {
      filtrarAvaliacoes();
    });
  });

  // Busca
  document.getElementById('btnBuscaAvaliacao').addEventListener('click', () => {
    filtrarAvaliacoes();
  });

  document.getElementById('inputBuscaAval').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      filtrarAvaliacoes();
    }
  });
}

async function carregarAvaliacoes() {
  const loadingDiv = document.getElementById('loadingAval');
  loadingDiv.style.display = 'block';

  try {
    // Simulando dados - substituir pela API real
    todasAvaliacoes = await buscarAvaliacoes();

    atualizarEstatisticas();
    filtrarAvaliacoes();
  } catch (erro) {
    console.error('Erro ao carregar avaliações:', erro);
  } finally {
    loadingDiv.style.display = 'none';
  }
}

async function buscarAvaliacoes() {
  try {
    const response = await fetch('http://localhost:3001/api/avaliacoes');
    if (response.ok) {
      return await response.json();
    }
  } catch (erro) {
    console.warn('Usando dados de exemplo');
  }

  // Dados de exemplo
  return [
    {
      id: 1,
      usuario: 'João Silva',
      tipo: 'Servico',
      nomeLugar: 'Pousada Casa Colonial',
      nota: 5,
      comentario: 'Excelente hospedagem! Muito confortável e o atendimento foi perfeito.',
      data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      uteis: 15
    },
    {
      id: 2,
      usuario: 'Maria Santos',
      tipo: 'Servico',
      nomeLugar: 'Restaurante Sabor Sertanejo',
      nota: 4,
      comentario: 'Comida deliciosa, ambiente agradável.',
      data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      uteis: 8
    },
    {
      id: 3,
      usuario: 'Pedro Costa',
      tipo: 'Evento',
      nomeLugar: 'Festa da Cidade 2026',
      nota: 5,
      comentario: 'Evento incrível! Muita música, dança e diversão.',
      data: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      uteis: 22
    },
    {
      id: 4,
      usuario: 'Ana Oliveira',
      tipo: 'Servico',
      nomeLugar: 'Catedral Metropolitana',
      nota: 5,
      comentario: 'Lugar histórico e bonito. Imprescindível visitar.',
      data: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      uteis: 30
    },
    {
      id: 5,
      usuario: 'Carlos Mendes',
      tipo: 'Servico',
      nomeLugar: 'Pousada Casa Colonial',
      nota: 4,
      comentario: 'Boa hospedagem, preço justo.',
      data: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      uteis: 5
    },
    {
      id: 6,
      usuario: 'Juliana Rocha',
      tipo: 'Evento',
      nomeLugar: 'Apresentação Cultural',
      nota: 4,
      comentario: 'Apresentação linda, mas poderia ter mais divulgação.',
      data: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      uteis: 12
    }
  ];
}

function filtrarAvaliacoes() {
  const abaSelecionada = document.querySelector('#abas-filtro .nav-link.active')?.id;
  const busca = document.getElementById('inputBuscaAval').value.toLowerCase();

  let filtradas = todasAvaliacoes;

  // Filtro por tipo de aba
  if (abaSelecionada === 'tab-servicos') {
    filtradas = filtradas.filter(a => a.tipo === 'Servico');
  } else if (abaSelecionada === 'tab-eventos') {
    filtradas = filtradas.filter(a => a.tipo === 'Evento');
  }

  // Filtro por busca
  if (busca) {
    filtradas = filtradas.filter(a =>
      a.nomeLugar.toLowerCase().includes(busca) ||
      a.comentario.toLowerCase().includes(busca) ||
      a.usuario.toLowerCase().includes(busca)
    );
  }

  // Renderizar listagens
  renderizarAvaliacoes(filtradas, 'todas', 'listaAvaliacoes', 'nenhumaAvaliacao');
  renderizarAvaliacoes(filtradas.filter(a => a.tipo === 'Servico'), 'servicos', 'listaAvaliacoesServicos', 'nenhumaAvaliacaoServico');
  renderizarAvaliacoes(filtradas.filter(a => a.tipo === 'Evento'), 'eventos', 'listaAvaliacoesEventos', 'nenhumaAvaliacaoEvento');
}

function renderizarAvaliacoes(avaliacoes, tipo, containerId, emptyId) {
  const container = document.getElementById(containerId);
  const emptyDiv = document.getElementById(emptyId);

  container.innerHTML = '';

  if (avaliacoes.length === 0) {
    emptyDiv.style.display = 'block';
  } else {
    emptyDiv.style.display = 'none';
    avaliacoes.forEach(aval => {
      const card = criarCardAvaliacao(aval);
      container.appendChild(card);
    });
  }
}

function criarCardAvaliacao(aval) {
  const card = document.createElement('div');
  card.className = 'card border-0 shadow-sm mb-3';

  const estrelas = gerarEstrelas(aval.nota);
  const dataFormatada = new Date(aval.data).toLocaleDateString('pt-BR');

  card.innerHTML = `
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h6 class="mb-1">${aval.nomeLugar}</h6>
          <small class="text-muted">por <strong>${aval.usuario}</strong></small>
        </div>
        <div class="text-end">
          <div class="text-warning mb-1">${estrelas}</div>
          <small class="text-muted">${dataFormatada}</small>
        </div>
      </div>
      <p class="mb-3">${aval.comentario}</p>
      <div class="d-flex justify-content-between align-items-center">
        <small class="text-muted">
          <i class="fas fa-thumbs-up me-1"></i>${aval.uteis} pessoas acham útil
        </small>
        <button class="btn btn-sm btn-outline-primary">
          <i class="fas fa-thumbs-up me-1"></i>Útil
        </button>
      </div>
    </div>
  `;

  return card;
}

function gerarEstrelas(nota) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= nota) {
      html += '<i class="fas fa-star text-warning"></i>';
    } else {
      html += '<i class="far fa-star text-warning"></i>';
    }
  }
  return html;
}

function atualizarEstatisticas() {
  const total = todasAvaliacoes.length;
  const servicos = todasAvaliacoes.filter(a => a.tipo === 'Servico').length;
  const eventos = todasAvaliacoes.filter(a => a.tipo === 'Evento').length;

  document.getElementById('count-todas').textContent = total;
  document.getElementById('count-servicos').textContent = servicos;
  document.getElementById('count-eventos').textContent = eventos;

  // Calcular média
  const mediaGeral = (todasAvaliacoes.reduce((acc, a) => acc + a.nota, 0) / total || 0).toFixed(1);
  document.getElementById('mediaGeralNotas').textContent = mediaGeral;
  document.getElementById('totalAvaliacoesContagem').textContent = `${total} avaliações`;

  // Distribuição de notas
  const distribuicao = {};
  for (let i = 1; i <= 5; i++) {
    distribuicao[i] = todasAvaliacoes.filter(a => a.nota === i).length;
  }

  for (let i = 5; i >= 1; i--) {
    const pct = total > 0 ? (distribuicao[i] / total * 100) : 0;
    document.getElementById(`bar-${i}`).style.width = `${pct}%`;
    document.getElementById(`count-${i}`).textContent = distribuicao[i];
  }

  // Top avaliados
  renderizarTopAvaliados();

  // Renderizar estrelas da média geral
  const mediaStarsDiv = document.getElementById('estrelasmediaGeral');
  mediaStarsDiv.innerHTML = gerarEstrelas(Math.round(mediaGeral));
}

function renderizarTopAvaliados() {
  const container = document.getElementById('topAvaliados');
  container.innerHTML = '';

  // Agrupar por lugar e calcular média
  const lugaresMap = {};
  todasAvaliacoes.forEach(aval => {
    if (!lugaresMap[aval.nomeLugar]) {
      lugaresMap[aval.nomeLugar] = {
        nome: aval.nomeLugar,
        notas: [],
        tipo: aval.tipo
      };
    }
    lugaresMap[aval.nomeLugar].notas.push(aval.nota);
  });

  // Calcular média de cada lugar e ordenar
  const topLugares = Object.values(lugaresMap)
    .map(l => ({
      ...l,
      media: l.notas.reduce((a, b) => a + b, 0) / l.notas.length,
      total: l.notas.length
    }))
    .sort((a, b) => b.media - a.media)
    .slice(0, 5);

  topLugares.forEach(lugar => {
    const item = document.createElement('div');
    item.className = 'list-group-item';
    item.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h6 class="mb-1">${lugar.nome}</h6>
          <small class="text-muted">${lugar.total} avaliações</small>
        </div>
        <div class="text-end">
          <div class="text-warning">${gerarEstrelas(Math.round(lugar.media))}</div>
          <small>${lugar.media.toFixed(1)}</small>
        </div>
      </div>
    `;
    container.appendChild(item);
  });
}
