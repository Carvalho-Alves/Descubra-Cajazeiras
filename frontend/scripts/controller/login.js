// scripts/login.js

import pontoService from '../service/pontoService.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;

        try {
            const resultado = await pontoService.loginUsuario(email, senha);
            
            // Salva os dados do usuário e token no localStorage
            localStorage.setItem('usuarioAutenticado', JSON.stringify(resultado));
            
            // Salva o token separadamente para uso em requisições
            if (resultado.token) {
                localStorage.setItem('authToken', resultado.token);
            }

            console.log('Login realizado com sucesso:', resultado);
            alert('Login realizado com sucesso! Redirecionando...');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            alert('Erro ao fazer login: ' + error.message);
        }
    });
});