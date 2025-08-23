// VARIÁVEIS GLOBAIS
const usuarioAreaDiv = document.getElementById('usuario-area');
const crudForm = document.getElementById("crud-form");
const lista = document.getElementById("lista");
const loginForm = document.getElementById('login-form');
const cadastroForm = document.getElementById('cadastro-form');
let endpointAtual = "servicos-turisticos"; // Endpoint padrão

// FUNÇÕES GLOBAIS DE NAVEGAÇÃO
function login() {
    console.log("Navegando para a página de login...");
    window.location.href = 'telaLogin.html';
}

function cadastro() {
    console.log("Navegando para a página de cadastro...");
    window.location.href = 'telaCadastro.html';
}

function logout() {
    localStorage.removeItem('user');
    exibirUsuarioLogado(null);
}

// FUNÇÃO PARA ATUALIZAR A INTERFACE DE USUÁRIO
function exibirUsuarioLogado(usuario) {
    if (usuarioAreaDiv) {
        if (usuario && usuario.nome) {
            // Se o usuário está logado, injeta a saudação e o botão de logout
            usuarioAreaDiv.innerHTML = `
                <span class="user-name">Olá, ${usuario.nome}!</span>
                <button id="logout-btn" class="btn btn-outline-light me-2">Sair</button>
            `;
            // Adiciona o evento de clique ao botão de logout
            document.getElementById('logout-btn').addEventListener('click', logout);
        } else {
            // Se não há usuário, injeta os botões de login e cadastro
            usuarioAreaDiv.innerHTML = `
                <button id="login-btn" class="btn btn-outline-light me-2">Login</button>
                <button id="cadastro-btn" class="btn btn-outline-light me-2">Cadastro</button>
            `;
            // Adiciona os eventos de clique aos novos botões
            document.getElementById('login-btn').addEventListener('click', login);
            document.getElementById('cadastro-btn').addEventListener('click', cadastro);
        }
    }
}

// FUNÇÕES DE REQUISIÇÕES AO BACKEND (Página Principal)
async function carregar(endpoint) {
    if (!endpoint) {
        console.error("Endpoint não pode ser vazio.");
        return;
    }
    endpointAtual = endpoint;
    if (!lista) {
        console.error("Elemento 'lista' não encontrado.");
        return;
    }
    lista.innerHTML = "";

    try {
        const resposta = await fetch(`/auth/${endpoint}`);
        if (!resposta.ok) {
            throw new Error(`Erro ao carregar dados: ${resposta.statusText}`);
        }
        const dados = await resposta.json();
        if (dados.length === 0) {
            lista.innerHTML = "<li>Nenhum item encontrado.</li>";
        } else {
            dados.forEach(item => {
                adicionarNaLista(item);
            });
        }
    } catch (erro) {
        console.error("Falha ao carregar dados:", erro);
        lista.innerHTML = "<li>Não foi possível carregar os dados. Tente novamente mais tarde.</li>";
    }
}

function adicionarNaLista(item) {
    const li = document.createElement("li");
    const localizacaoTexto = item.localizacao ? `<p class="item-location">${item.localizacao}</p>` : '';

    li.dataset.id = item.id;
    li.dataset.titulo = item.titulo;
    li.dataset.descricao = item.descricao;
    li.dataset.localizacao = item.localizacao || '';

    li.innerHTML = `
        <div class="item-content">
            <h3 class="item-title">${item.titulo}</h3>
            <p class="item-description">${item.descricao}</p>
            ${localizacaoTexto}
        </div>
        <div class="item-actions">
            <button class="editar-btn">Editar</button>
            <button class="apagar-btn">Apagar</button>
        </div>
    `;
    // Adiciona event listeners para os botões de editar e apagar
    const editarBtn = li.querySelector('.editar-btn');
    const apagarBtn = li.querySelector('.apagar-btn');

    editarBtn.addEventListener('click', () => editarItem(li));
    apagarBtn.addEventListener('click', () => apagarItem(item.id));

    document.getElementById("lista").appendChild(li);
}

// FUNÇÕES DE CRUD (Página Principal)
function editarItem(li) {
    const id = li.dataset.id;
    const titulo = li.dataset.titulo;
    const descricao = li.dataset.descricao;
    const localizacao = li.dataset.localizacao;

    document.getElementById("id").value = id;
    document.getElementById("titulo").value = titulo;
    document.getElementById("descricao").value = descricao;
    document.getElementById("localizacao").value = localizacao;
    document.getElementById("titulo-form").innerText = "Editar Item";
    document.getElementById("crud-form").querySelector("button[type='submit']").innerText = "Atualizar";
}

async function apagarItem(id) {
    if (!id) return;
    
    if (confirm("Deseja realmente apagar este item?")) {
        try {
            const resposta = await fetch(`/auth/${endpointAtual}/${id}`, { method: "DELETE" });
            if (!resposta.ok) {
                throw new Error(`Erro ao apagar: ${resposta.statusText}`);
            }
            carregar(endpointAtual);
        } catch (erro) {
            console.error("Falha ao apagar item:", erro);
            alert("Não foi possível apagar o item. Tente novamente.");
        }
    }
}

function limparFormulario() {
    document.getElementById("crud-form").reset();
    document.getElementById("id").value = "";
    document.getElementById("titulo-form").innerText = "Adicionar Item";
    document.getElementById("crud-form").querySelector("button[type='submit']").innerText = "Salvar";
}

// LÓGICA DE INICIALIZAÇÃO E EVENT LISTENERS
document.addEventListener("DOMContentLoaded", () => {
    // Detecta a página atual
    const isLoginPage = window.location.pathname.endsWith('telaLogin.html');
    const isCadastroPage = window.location.pathname.endsWith('telaCadastro.html');

    // Lógica para a página principal (index.html)
    if (!isLoginPage && !isCadastroPage) {
        const usuarioSalvo = JSON.parse(localStorage.getItem('user'));
        exibirUsuarioLogado(usuarioSalvo);

        const btnConhecaProjeto = document.getElementById('btnConhecaProjeto');
        const btnDashboard = document.getElementById('btnDashboard');
        const btnNovoPonto = document.getElementById('btnNovoPonto');

        if (btnConhecaProjeto) {
            btnConhecaProjeto.addEventListener('click', () => {
                console.log("Abrindo modal/página Conheça o Projeto");
            });
        }
        
        if (btnDashboard) {
            btnDashboard.addEventListener('click', () => {
                console.log("Abrindo modal/página Dashboard");
            });
        }

        if (btnNovoPonto) {
            btnNovoPonto.addEventListener('click', () => {
                console.log("Abrindo modal/página Novo Ponto");
            });
        }
        
        if (usuarioSalvo) {
            carregar(endpointAtual);
        }

        if (crudForm) {
            crudForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const id = document.getElementById("id").value;
                const titulo = document.getElementById("titulo").value.trim();
                const descricao = document.getElementById("descricao").value.trim();
                const localizacao = document.getElementById("localizacao").value.trim();
        
                if (!titulo || !descricao) {
                    alert("Título e Descrição são campos obrigatórios.");
                    return;
                }
        
                const dados = { titulo, descricao, localizacao };
                const metodo = id ? "PUT" : "POST";
                const url = id ? `/auth/${endpointAtual}/${id}` : `/auth/${endpointAtual}`;
        
                try {
                    const resposta = await fetch(url, {
                        method: metodo,
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(dados)
                    });
        
                    if (!resposta.ok) {
                        throw new Error(`Erro ao salvar: ${resposta.statusText}`);
                    }
        
                    carregar(endpointAtual);
                    limparFormulario();
                    
                } catch (erro) {
                    console.error("Falha ao salvar dados:", erro);
                    alert("Não foi possível salvar os dados. Verifique sua conexão e tente novamente.");
                }
            });
        }
    }
    
    // Lógica para a página de login
    if (isLoginPage) {
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const senha = document.getElementById('login-senha').value;

                try {
                    const resposta = await fetch('/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, senha })
                    });
                    const usuario = await resposta.json();
                    if (resposta.ok) {
                        localStorage.setItem('user', JSON.stringify(usuario));
                        window.location.href = 'index.html'; // Redireciona para a página principal
                    } else {
                        alert(usuario.mensagem || 'Login falhou. Verifique suas credenciais.');
                    }
                } catch (erro) {
                    console.error('Erro de login:', erro);
                    alert('Ocorreu um erro no login. Tente novamente.');
                }
            });
        }
    }
    
    // Lógica para a página de cadastro
    if (isCadastroPage) {
        if (cadastroForm) {
            cadastroForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const nome = document.getElementById('cadastro-nome').value;
                const email = document.getElementById('cadastro-email').value;
                const senha = document.getElementById('cadastro-senha').value;
                const foto = document.getElementById('cadastro-foto').files[0];
        
                const formData = new FormData();
                formData.append('nome', nome);
                formData.append('email', email);
                formData.append('senha', senha);
                if (foto) {
                    formData.append('foto', foto);
                }
        
                try {
                    const resposta = await fetch('/auth/register', {
                        method: 'POST',
                        body: formData
                    });
                    const resultado = await resposta.json();
                    if (resposta.ok) {
                        alert('Cadastro realizado com sucesso! Faça login para continuar.');
                        window.location.href = 'telaLogin.html'; // Redireciona para a página de login
                    } else {
                        alert(resultado.mensagem || 'Falha no cadastro.');
                    }
                } catch (erro) {
                    console.error('Erro de cadastro:', erro);
                    alert('Ocorreu um erro no cadastro. Tente novamente.');
                }
            });
        }
    }
});