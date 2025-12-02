import React, { useState } from "react";
import "../styles/auth.css";

export default function Auth() {
  const [activeTab, setActiveTab] = useState("login"); // login | register
  const [preview, setPreview] = useState(null);

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  function handleClearImage() {
    setPreview(null);
  }

  function handleSubmitLogin(e) {
    e.preventDefault();
   
    console.log("login enviado");
  }

  function handleSubmitRegister(e) {
    e.preventDefault();
    
    console.log("cadastro enviado");
  }

  return (
    <div className="auth-page">
    
      <header className="auth-header">
        <div className="auth-container header-content">
          <div className="header-left">
            <a href="#" aria-label="Descubra+ Cajazeiras" className="logo-link">
              <img
                src="/assets/images/logotipo.png"
                alt="Logo Descubra+ Cajazeiras"
                className="logo-img"
              />
            </a>
            <span className="brand-title">Descubra+ Cajazeiras</span>
          </div>

          <a href="/index.html" className="btn-outline">
            ← Voltar ao mapa
          </a>
        </div>
      </header>

    
      <main className="auth-main">
        <div className="auth-container">
          <div className="auth-card">
           
            <div className="tabs">
              <button
                type="button"
                className={`tab ${activeTab === "login" ? "active" : ""}`}
                onClick={() => setActiveTab("login")}
              >
                Entrar
              </button>
              <button
                type="button"
                className={`tab ${activeTab === "register" ? "active" : ""}`}
                onClick={() => setActiveTab("register")}
              >
                Cadastrar
              </button>
            </div>

           
            <div id="alertContainer" />

           
            {activeTab === "login" && (
              <div className="tab-panel fade-in">
                <form id="loginForm" onSubmit={handleSubmitLogin}>
                  <div className="text-center mb-24">
                    <h3 className="title-primary">Bem-vindo de volta!</h3>
                    <p className="subtitle-muted">
                      Entre com sua conta para gerenciar serviços
                    </p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="loginEmail">E-mail</label>
                    <input
                      type="email"
                      id="loginEmail"
                      required
                      className="input-lg"
                      placeholder="seuemail@exemplo.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="loginSenha">Senha</label>
                    <input
                      type="password"
                      id="loginSenha"
                      required
                      className="input-lg"
                      placeholder="Digite sua senha"
                    />
                  </div>

                  <button type="submit" className="btn-primary btn-block">
                    Entrar
                  </button>
                </form>
              </div>
            )}

            
            {activeTab === "register" && (
              <div className="tab-panel fade-in">
                <form id="registerForm" onSubmit={handleSubmitRegister}>
                  <div className="text-center mb-24">
                    <h3 className="title-success">Criar nova conta</h3>
                    <p className="subtitle-muted">
                      Cadastre-se para contribuir com o turismo local
                    </p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="registerNome">Nome completo</label>
                    <input
                      type="text"
                      id="registerNome"
                      required
                      className="input-lg"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="registerEmail">E-mail</label>
                    <input
                      type="email"
                      id="registerEmail"
                      required
                      className="input-lg"
                      placeholder="seuemail@exemplo.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="registerFoto">Foto de perfil (opcional)</label>
                    <input
                      type="file"
                      id="registerFoto"
                      className="input-lg"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <small className="helper-text">
                      Formatos aceitos: JPG, PNG, GIF. Até 5MB.
                    </small>

                    {preview && (
                      <div className="preview-wrapper">
                        <img
                          src={preview}
                          alt="Pré-visualização"
                          className="avatar-preview"
                          onError={(e) => {
                            e.target.src = "/assets/images/default-avatar.svg";
                          }}
                        />
                        <button
                          type="button"
                          className="btn-small-outline"
                          onClick={handleClearImage}
                        >
                          Remover foto
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="registerSenha">Senha</label>
                    <input
                      type="password"
                      id="registerSenha"
                      required
                      minLength={6}
                      className="input-lg"
                      placeholder="Mínimo de 6 caracteres"
                    />
                    <small className="helper-text">Mínimo de 6 caracteres</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="registerConfirmarSenha">
                      Confirmar senha
                    </label>
                    <input
                      type="password"
                      id="registerConfirmarSenha"
                      required
                      className="input-lg"
                    />
                  </div>

                  <button type="submit" className="btn-success btn-block">
                    Cadastrar
                  </button>
                </form>
              </div>
            )}
            <div className="divider">
              <p className="divider-text">
                Ao se cadastrar, você poderá adicionar e gerenciar pontos
                turísticos.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
