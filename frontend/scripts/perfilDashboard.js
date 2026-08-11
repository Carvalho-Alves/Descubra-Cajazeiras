import { verificarAutenticacao } from './auth.js';

// Inicializar página
document.addEventListener('DOMContentLoaded', async () => {
  const usuarioData = verificarAutenticacao();
  carregarPerfilUsuario(usuarioData);
  carregarDadosDashboard();
  inicializarEventos();
});

function inicializarEventos() {
  // Editar Perfil
  document.getElementById('btnEditarPerfil').addEventListener('click', () => {
    alert('Funcionalidade de editar perfil em desenvolvimento');
  });

  // Atualizar Senha
  document.getElementById('btnAtualizarSenha').addEventListener('click', () => {
    const senhaAtual = document.getElementById('senhaAtual').value;
    const senhaNova = document.getElementById('senhaNova').value;
    const senhaConfirm = document.getElementById('senhaConfirm').value;

    if (!senhaAtual || !senhaNova || !senhaConfirm) {
      alert('Preencha todos os campos de senha');
      return;
    }

    if (senhaNova !== senhaConfirm) {
      alert('As senhas não conferem');
      return;
    }

    // Simular atualização
    alert('Senha atualizada com sucesso!');
    document.getElementById('senhaAtual').value = '';
    document.getElementById('senhaNova').value = '';
    document.getElementById('senhaConfirm').value = '';
  });

  // Logout
  document.getElementById('btnLogout').addEventListener('click', () => {
    if (confirm('Tem certeza que deseja sair?')) {
      localStorage.removeItem('usuario');
      window.location.href = 'telaLogin.html';
    }
  });
}

function carregarPerfilUsuario(usuarioData) {
  const usuario = usuarioData || JSON.parse(localStorage.getItem('usuario') || '{}');

  document.getElementById('perfilNome').textContent = usuario.nome || 'Usuário';
  document.getElementById('perfilEmail').innerHTML = `<i class="fas fa-envelope me-2"></i>${usuario.email || 'email@example.com'}`;
  document.getElementById('perfilRole').innerHTML = `<span class="badge bg-light text-primary">${usuario.role === 'admin' ? 'Administrador' : 'Turista'}</span>`;

  // Foto
  if (usuario.foto) {
    document.getElementById('perfilFoto').src = usuario.foto;
  }
}

async function carregarDadosDashboard() {
  try {
    // Simular dados - substituir pela API real
    const dados = gerarDadosExemplo();

    // Aba Resumo
    document.getElementById('totalAvaliacoesFez').textContent = dados.avaliacoesFez;
    document.getElementById('totalFavoritos').textContent = dados.favoritos;
    document.getElementById('totalVisitas').textContent = dados.visitas;
    document.getElementById('contribScore').textContent = dados.contribuicao;

    // Estatísticas
    document.getElementById('suaMediaNotas').textContent = dados.mediaNotas.toFixed(1);
    document.getElementById('suas-estrelas').innerHTML = gerarEstrelas(dados.mediaNotas);
    document.getElementById('tipoFavorito').innerHTML = `<span class="badge bg-success">${dados.tipoFavorito}</span>`;
    document.getElementById('dataCadastro').textContent = new Date(dados.dataCadastro).toLocaleDateString('pt-BR');

    // Distintivos
    renderizarDistintivos(dados.distintivos);

    // Atividades
    renderizarAtividades(dados.atividades);

    // Favoritos
    renderizarFavoritos(dados.favoritos, dados.localFavorito);
  } catch (erro) {
    console.error('Erro ao carregar dados do dashboard:', erro);
  }
}

function gerarDadosExemplo() {
  return {
    avaliacoesFez: 12,
    favoritos: 8,
    visitas: 15,
    contribuicao: 450,
    mediaNotas: 4.3,
    tipoFavorito: 'Gastronomia',
    dataCadastro: new Date('2024-06-15'),
    distintivos: [
      { nome: 'Explorador', icone: 'fa-compass', descricao: 'Visitou 10 locais' },
      { nome: 'Crítico', icone: 'fa-star', descricao: 'Fez 5 avaliações' },
      { nome: 'Mochileiro', icone: 'fa-backpack', descricao: 'Visitou 3 tipos diferentes de locais' }
    ],
    atividades: [
      { tipo: 'avaliacao', descricao: 'Avaliou Pousada Casa Colonial com 5 estrelas', data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { tipo: 'favorito', descricao: 'Salvou Restaurante Sabor Sertanejo como favorito', data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { tipo: 'visita', descricao: 'Visitou Catedral Metropolitana', data: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { tipo: 'evento', descricao: 'Participou do evento Festa da Cidade', data: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }
    ],
    localFavorito: [
      { nome: 'Pousada Casa Colonial', tipo: 'Hospedagem', nota: 5 },
      { nome: 'Restaurante Sabor Sertanejo', tipo: 'Alimentação', nota: 4.5 },
      { nome: 'Catedral Metropolitana', tipo: 'Turístico', nota: 5 }
    ]
  };
}

function renderizarDistintivos(distintivos) {
  const container = document.getElementById('distintivos-container');
  container.innerHTML = '';

  if (distintivos.length === 0) {
    container.innerHTML = '<p class="text-muted">Continue explorando para conquistar distintivos!</p>';
    return;
  }

  const row = document.createElement('div');
  row.className = 'row g-2';

  distintivos.forEach(distintivo => {
    const col = document.createElement('div');
    col.className = 'col-4 text-center';
    col.innerHTML = `
      <div class="badge bg-warning text-dark p-3 w-100">
        <i class="fas ${distintivo.icone} fa-2x d-block mb-2"></i>
        <strong>${distintivo.nome}</strong>
        <div style="font-size: 11px; margin-top: 5px;">${distintivo.descricao}</div>
      </div>
    `;
    row.appendChild(col);
  });

  container.appendChild(row);
}

function renderizarAtividades(atividades) {
  const container = document.getElementById('lista-atividades');
  container.innerHTML = '';

  if (atividades.length === 0) {
    container.innerHTML = '<div class="text-center text-muted py-5"><i class="fas fa-inbox fa-3x mb-3"></i><p>Nenhuma atividade</p></div>';
    return;
  }

  atividades.forEach(atividade => {
    const item = document.createElement('div');
    item.className = 'list-group-item border-start border-4';

    const icone = getIconeAtividade(atividade.tipo);
    const dataFormatada = new Date(atividade.data).toLocaleDateString('pt-BR');

    item.style.borderColor = getCorAtividade(atividade.tipo);
    item.innerHTML = `
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <h6 class="mb-1">
            <i class="fas ${icone} me-2" style="color: ${getCorAtividade(atividade.tipo)}"></i>
            ${atividade.descricao}
          </h6>
          <small class="text-muted">${dataFormatada}</small>
        </div>
      </div>
    `;
    container.appendChild(item);
  });
}

function renderizarFavoritos(qtdFavoritos, locais) {
  const container = document.getElementById('lista-favoritos');
  container.innerHTML = '';

  if (!locais || locais.length === 0) {
    container.innerHTML = '<div class="col-12 text-center text-muted py-5"><i class="fas fa-heart-broken fa-3x mb-3"></i><p>Você ainda não tem favoritos</p></div>';
    return;
  }

  locais.forEach(local => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-4';
    col.innerHTML = `
      <div class="card h-100 border-0 shadow-sm">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h6 class="mb-0">${local.nome}</h6>
            <button class="btn btn-sm btn-link p-0 text-danger">
              <i class="fas fa-heart"></i>
            </button>
          </div>
          <p class="text-muted mb-2" style="font-size: 13px;">
            <span class="badge bg-light text-dark">${local.tipo}</span>
          </p>
          <div class="text-warning">
            ${gerarEstrelas(local.nota)}
            <small class="text-muted">${local.nota}</small>
          </div>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
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

function getIconeAtividade(tipo) {
  switch(tipo) {
    case 'avaliacao': return 'fa-star';
    case 'favorito': return 'fa-heart';
    case 'visita': return 'fa-map-marker-alt';
    case 'evento': return 'fa-calendar-alt';
    default: return 'fa-circle';
  }
}

function getCorAtividade(tipo) {
  switch(tipo) {
    case 'avaliacao': return '#ffc107';
    case 'favorito': return '#dc3545';
    case 'visita': return '#0dcaf0';
    case 'evento': return '#198754';
    default: return '#6c757d';
  }
}
