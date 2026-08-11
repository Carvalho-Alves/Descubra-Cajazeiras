import { verificarAutenticacao } from './auth.js';
import { buscarServiços } from './service/pontoService.js';

// Inicializar página
document.addEventListener('DOMContentLoaded', async () => {
  verificarAutenticacao();
  carregarServiços();
  inicializarEventos();
});

let servicosSelecionado = null;
let mapaGerenciador = null;

function inicializarEventos() {
  // Filtros
  document.getElementById('filtrosServicos').addEventListener('change', (e) => {
    if (e.target.type === 'radio') {
      carregarServiços();
    }
  });

  // Busca
  document.getElementById('btnBuscarServico').addEventListener('click', () => {
    const input = document.getElementById('inputBuscaServicos');
    if (input.value.trim()) {
      carregarServiços();
      document.getElementById('btnLimparBuscaServico').style.display = 'inline-block';
    }
  });

  document.getElementById('btnLimparBuscaServico').addEventListener('click', () => {
    document.getElementById('inputBuscaServicos').value = '';
    document.getElementById('btnLimparBuscaServico').style.display = 'none';
    carregarServiços();
  });

  document.getElementById('inputBuscaServicos').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('btnBuscarServico').click();
    }
  });

  // Novo Serviço
  document.getElementById('btnNovoServico').addEventListener('click', () => {
    alert('Abra a página de mapa para adicionar um novo serviço!');
  });

  // Atualizar
  document.getElementById('btnAtualizarServicos').addEventListener('click', () => {
    carregarServiços();
  });

  // Botões de ação
  document.getElementById('btnEditarServico').addEventListener('click', () => {
    if (servicosSelecionado) {
      alert('Funcionalidade de edição será implementada');
    }
  });

  document.getElementById('btnExcluirServico').addEventListener('click', () => {
    if (servicosSelecionado) {
      alert('Funcionalidade de exclusão será implementada');
    }
  });

  document.getElementById('btnVerAvaliacoes').addEventListener('click', () => {
    window.location.href = 'avaliacoes.html';
  });
}

async function carregarServiços() {
  const loadingDiv = document.getElementById('loadingServicos');
  const listaDiv = document.getElementById('listaServicos');
  const nenhumDiv = document.getElementById('nenhumServico');

  loadingDiv.style.display = 'block';
  listaDiv.innerHTML = '';

  try {
    const servicios = await buscarServiços();
    const filtro = document.querySelector('input[name="filtroServico"]:checked').value;
    const busca = document.getElementById('inputBuscaServicos').value.toLowerCase();

    let filtrados = servicios;

    if (filtro) {
      filtrados = filtrados.filter(s => s.tipo === filtro);
    }

    if (busca) {
      filtrados = filtrados.filter(s =>
        s.nome.toLowerCase().includes(busca) ||
        s.descricao?.toLowerCase().includes(busca)
      );
    }

    // Atualizar estatísticas
    atualizarEstatisticas(servicios);

    if (filtrados.length === 0) {
      nenhumDiv.style.display = 'block';
      listaDiv.style.display = 'none';
    } else {
      nenhumDiv.style.display = 'none';
      listaDiv.style.display = 'block';

      filtrados.forEach(servico => {
        const item = criarItemServico(servico);
        listaDiv.appendChild(item);
        item.addEventListener('click', () => selecionarServico(servico));
      });
    }
  } catch (erro) {
    console.error('Erro ao carregar serviços:', erro);
    nenhumDiv.style.display = 'block';
  } finally {
    loadingDiv.style.display = 'none';
  }
}

function criarItemServico(servico) {
  const div = document.createElement('div');
  div.className = 'list-group-item list-group-item-action cursor-pointer';
  div.innerHTML = `
    <div class="d-flex justify-content-between align-items-start">
      <div>
        <h6 class="mb-1">${servico.nome}</h6>
        <p class="mb-1 text-muted" style="font-size: 12px;">
          <i class="fas fa-map-marker-alt me-1"></i>${servico.endereco || 'Endereço não informado'}
        </p>
        <span class="badge ${getBadgeColor(servico.tipo)}">${servico.tipo}</span>
      </div>
      <div class="text-end">
        <div class="text-warning">
          <i class="fas fa-star"></i>
          <span>${servico.mediaAvaliacoes?.toFixed(1) || 'N/A'}</span>
        </div>
        <small class="text-muted">${servico.totalAvaliacoes || 0} avaliações</small>
      </div>
    </div>
  `;
  return div;
}

function selecionarServico(servico) {
  servicosSelecionado = servico;
  document.querySelectorAll('#listaServicos .list-group-item').forEach(item => {
    item.classList.remove('active');
  });
  event.currentTarget.classList.add('active');

  exibirDetalhesServico(servico);
}

function exibirDetalhesServico(servico) {
  const detalhesDiv = document.getElementById('detalhesServico');
  const cardDiv = document.getElementById('cardDetalhesServico');

  detalhesDiv.style.display = 'none';
  cardDiv.style.display = 'block';

  document.getElementById('servicoNome').textContent = servico.nome;
  document.getElementById('servicoDescricao').textContent = servico.descricao || 'Sem descrição';
  document.getElementById('servicoTipo').innerHTML = `${servico.tipo}`;
  document.getElementById('servicoTipo').className = `badge ${getBadgeColor(servico.tipo)}`;
  document.getElementById('servicoTelefone').textContent = servico.telefone || 'Não informado';
  document.getElementById('servicoInstagram').textContent = servico.instagram ? `@${servico.instagram}` : 'Não informado';
  document.getElementById('servicoMedia').textContent = (servico.mediaAvaliacoes || 0).toFixed(1);
  document.getElementById('servicoQtdAval').textContent = `${servico.totalAvaliacoes || 0} avaliações`;

  // Estrelas
  const starsDiv = document.getElementById('servicoEstrelas');
  starsDiv.innerHTML = gerarEstrelas(servico.mediaAvaliacoes || 0);

  // Mini mapa
  if (servico.latitude && servico.longitude) {
    inicializarMiniMapa(servico.latitude, servico.longitude);
  }
}

function gerarEstrelas(nota) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(nota)) {
      html += '<i class="fas fa-star text-warning"></i>';
    } else if (i - nota < 1) {
      html += '<i class="fas fa-star-half-alt text-warning"></i>';
    } else {
      html += '<i class="far fa-star text-warning"></i>';
    }
  }
  return html;
}

function getBadgeColor(tipo) {
  switch(tipo) {
    case 'Hospedagem': return 'bg-success';
    case 'Alimentação/Lazer': return 'bg-warning text-dark';
    case 'Ponto Turístico': return 'bg-info';
    default: return 'bg-secondary';
  }
}

function inicializarMiniMapa(lat, lng) {
  const mapaDiv = document.getElementById('servicoMiniMapa');

  if (mapaGerenciador) {
    mapaGerenciador.remove();
  }

  mapaGerenciador = L.map('servicoMiniMapa').setView([lat, lng], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19
  }).addTo(mapaGerenciador);

  L.marker([lat, lng]).addTo(mapaGerenciador)
    .bindPopup(servicosSelecionado.nome);
}

function atualizarEstatisticas(servicos) {
  const total = servicos.length;
  const hospedagem = servicos.filter(s => s.tipo === 'Hospedagem').length;
  const alimentacao = servicos.filter(s => s.tipo === 'Alimentação/Lazer').length;

  document.getElementById('totalServicosContagem').textContent = total;
  document.getElementById('totalHospedagem').textContent = hospedagem;
  document.getElementById('totalAlimentacao').textContent = alimentacao;
}
