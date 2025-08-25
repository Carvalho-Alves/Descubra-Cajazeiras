// scripts/cadastro.js

import pontoService from '../service/pontoService.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cadastro-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = document.getElementById('cadastro-nome').value;
        const email = document.getElementById('cadastro-email').value;
        const senha = document.getElementById('cadastro-senha').value;
        const foto = document.getElementById('cadastro-foto').files[0];

        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('email', email);
        formData.append('senha', senha);
        
        // A foto só é adicionada ao FormData se ela existir
        if (foto) {
            formData.append('foto', foto);
        }

        try {
            // A chamada de registro usa o PontoService, resolvendo o aviso
            const resultado = await pontoService.registrarUsuario(formData);

            alert('Cadastro realizado com sucesso! Redirecionando para o login...');
            window.location.href = 'telaLogin.html';
            
        } catch (error) {
            console.error('Falha na requisição de cadastro:', error);
            alert('Erro ao cadastrar: ' + error.message);
        }
    });
});