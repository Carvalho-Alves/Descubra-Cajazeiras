// scripts/index.js

import PontoController from './controller/pontoModel.js';
import pontoService from './service/pontoService.js'; // Importa o serviço para verificar o login

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o controlador da aplicação.
    const pontoController = new PontoController();
    
    // Torna o controlador acessível globalmente.
    window.pontoController = pontoController;

    // --- Lógica de Autenticação e Renderização da UI ---
    const usuarioArea = document.getElementById('usuario-area');
    const btnNovoPonto = document.getElementById('btnNovoPonto');

    /**
     * Renderiza a área do usuário com base no estado de autenticação.
     */
    function renderizarAreaUsuario() {
        const usuario = pontoService.getUsuarioAutenticado();
        
        if (usuario) {
            // Se o usuário está logado
            usuarioArea.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user-circle me-2"></i> ${usuario.nome}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item text-danger" href="#" id="btnDesconectar">Sair</a></li>
                    </ul>
                </div>
            `;
            
            // Exibe o botão de criar novo ponto
            if (btnNovoPonto) {
                btnNovoPonto.style.display = 'inline-block';
            }

            // Adiciona o evento de desconectar
            document.getElementById('btnDesconectar').addEventListener('click', () => {
                pontoService.logoutUsuario();
            });

        } else {
            // Se o usuário não está logado
            usuarioArea.innerHTML = `
                <button class="btn btn-outline-light me-2" id="btnLogin">Login</button>
                <button class="btn btn-primary" id="btnCadastro">Cadastro</button>
            `;
            
            // Esconde o botão de criar novo ponto
            if (btnNovoPonto) {
                btnNovoPonto.style.display = 'none';
            }

            // Adiciona os eventos de navegação para login e cadastro
            document.getElementById('btnLogin').addEventListener('click', () => {
                window.location.href = 'telaLogin.html';
            });
            document.getElementById('btnCadastro').addEventListener('click', () => {
                window.location.href = 'telaCadastro.html';
            });
        }
    }

    // A chamada para renderizarAreaUsuario() agora é a primeira coisa a ser executada
    // para garantir que a interface seja montada corretamente.
    renderizarAreaUsuario();

    // Lógica para o modal de eventos.
    const modalEventos = new bootstrap.Modal(document.getElementById('modalEventos'));
    document.getElementById('btnVerEventos').addEventListener('click', () => {
        modalEventos.show();
    });
});