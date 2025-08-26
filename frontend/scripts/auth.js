import pontoService from './service/pontoService.js';

class AuthManager {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.checkExistingAuth();
    }

    initializeElements() {
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        
        // Login inputs
        this.loginEmail = document.getElementById('loginEmail');
        this.loginSenha = document.getElementById('loginSenha');
        
        // Register inputs
        this.registerNome = document.getElementById('registerNome');
        this.registerEmail = document.getElementById('registerEmail');
        this.registerSenha = document.getElementById('registerSenha');
        this.registerConfirmarSenha = document.getElementById('registerConfirmarSenha');
        
        // Alert container
        this.alertContainer = document.getElementById('alertContainer');
        
        // Tabs
        this.loginTab = document.getElementById('login-tab');
        this.registerTab = document.getElementById('register-tab');
    }

    setupEventListeners() {
        // Form submissions
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        
        // Real-time validation
        this.registerConfirmarSenha.addEventListener('blur', () => this.validatePasswordMatch());
        this.registerEmail.addEventListener('blur', () => this.validateEmail(this.registerEmail));
        this.loginEmail.addEventListener('blur', () => this.validateEmail(this.loginEmail));
    }

    checkExistingAuth() {
        const usuario = pontoService.getUsuarioAutenticado();
        if (usuario) {
            this.showAlert('Você já está logado! Redirecionando...', 'info');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = this.loginEmail.value.trim();
        const senha = this.loginSenha.value;
        
        if (!this.validateLoginForm(email, senha)) {
            return;
        }
        
        this.setLoadingState(this.loginForm, true);
        
        try {
            console.log('Tentando fazer login...');
            const resultado = await pontoService.loginUsuario(email, senha);
            console.log('Login bem-sucedido:', resultado);
            
            localStorage.setItem('usuarioAutenticado', JSON.stringify(resultado));
            if (resultado.token) {
                localStorage.setItem('authToken', resultado.token);
            }
            
            this.showAlert('Login realizado com sucesso! Redirecionando...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            console.error('Erro no login:', error);
            this.showAlert('Erro no login: ' + error.message, 'danger');
        } finally {
            this.setLoadingState(this.loginForm, false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const nome = this.registerNome.value.trim();
        const email = this.registerEmail.value.trim();
        const senha = this.registerSenha.value;
        const confirmarSenha = this.registerConfirmarSenha.value;
        
        if (!this.validateRegisterForm(nome, email, senha, confirmarSenha)) {
            return;
        }
        
        this.setLoadingState(this.registerForm, true);
        
        try {
            console.log('Tentando cadastrar usuário...');
            
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome, email, senha })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro no cadastro');
            }
            
            const resultado = await response.json();
            console.log('Cadastro bem-sucedido:', resultado);
            
            this.showAlert('Cadastro realizado com sucesso! Fazendo login...', 'success');
            
            setTimeout(async () => {
                try {
                    const loginResult = await pontoService.loginUsuario(email, senha);
                    localStorage.setItem('usuarioAutenticado', JSON.stringify(loginResult));
                    if (loginResult.token) {
                        localStorage.setItem('authToken', loginResult.token);
                    }
                    window.location.href = 'index.html';
                } catch (loginError) {
                    console.error('Erro no login automático:', loginError);
                    this.showAlert('Cadastro realizado! Por favor, faça login.', 'info');
                    this.switchToLoginTab();
                }
            }, 1500);
            
        } catch (error) {
            console.error('Erro no cadastro:', error);
            this.showAlert('Erro no cadastro: ' + error.message, 'danger');
        } finally {
            this.setLoadingState(this.registerForm, false);
        }
    }

    validateLoginForm(email, senha) {
        if (!email || !senha) {
            this.showAlert('Por favor, preencha todos os campos.', 'warning');
            return false;
        }
        
        if (!this.isValidEmail(email)) {
            this.showAlert('Por favor, insira um e-mail válido.', 'warning');
            return false;
        }
        
        return true;
    }

    validateRegisterForm(nome, email, senha, confirmarSenha) {
        if (!nome || !email || !senha || !confirmarSenha) {
            this.showAlert('Por favor, preencha todos os campos.', 'warning');
            return false;
        }
        
        if (nome.length < 2) {
            this.showAlert('Nome deve ter pelo menos 2 caracteres.', 'warning');
            return false;
        }
        
        if (!this.isValidEmail(email)) {
            this.showAlert('Por favor, insira um e-mail válido.', 'warning');
            return false;
        }
        
        if (senha.length < 6) {
            this.showAlert('Senha deve ter pelo menos 6 caracteres.', 'warning');
            return false;
        }
        
        if (senha !== confirmarSenha) {
            this.showAlert('As senhas não coincidem.', 'warning');
            return false;
        }
        
        return true;
    }

    validatePasswordMatch() {
        const senha = this.registerSenha.value;
        const confirmarSenha = this.registerConfirmarSenha.value;
        
        if (confirmarSenha && senha !== confirmarSenha) {
            this.registerConfirmarSenha.classList.add('is-invalid');
            this.registerConfirmarSenha.classList.remove('is-valid');
        } else if (confirmarSenha) {
            this.registerConfirmarSenha.classList.add('is-valid');
            this.registerConfirmarSenha.classList.remove('is-invalid');
        }
    }

    validateEmail(input) {
        const email = input.value.trim();
        
        if (email && this.isValidEmail(email)) {
            input.classList.add('is-valid');
            input.classList.remove('is-invalid');
        } else if (email) {
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    switchToLoginTab() {
        this.loginTab.click();
    }

    setLoadingState(form, isLoading) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const inputs = form.querySelectorAll('input');
        
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processando...';
            inputs.forEach(input => input.disabled = true);
        } else {
            submitBtn.disabled = false;
            inputs.forEach(input => input.disabled = false);
            
            if (form === this.loginForm) {
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Entrar';
            } else {
                submitBtn.innerHTML = '<i class="fas fa-user-plus me-2"></i>Cadastrar';
            }
        }
    }

    showAlert(message, type = 'info') {
        const alertHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="fas fa-${this.getAlertIcon(type)} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        this.alertContainer.innerHTML = alertHTML;
        
        setTimeout(() => {
            const alert = this.alertContainer.querySelector('.alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }

    getAlertIcon(type) {
        const icons = {
            success: 'check-circle',
            danger: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});

localStorage.removeItem('usuarioAutenticado');
localStorage.removeItem('authToken');
console.log('Dados de autenticação limpos');
