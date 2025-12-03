import React, { useState } from "react";
import "./styles/telaCadastros.css";

const INITIAL_FORM = {
  nome: "",
  email: "",
  senha: "",
  foto: null,
};

export default function CadastroPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, foto: file }));

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }

  function validar() {
    const novo = {};

    if (!form.nome.trim()) novo.nome = "Informe seu nome.";
    if (!form.email.trim()) {
      novo.email = "Informe seu e-mail.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      novo.email = "Informe um e-mail válido.";
    }
    if (!form.senha) {
      novo.senha = "Crie uma senha.";
    } else if (form.senha.length < 6) {
      novo.senha = "A senha deve ter pelo menos 6 caracteres.";
    }

    return novo;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const novoErrors = validar();
    setErrors(novoErrors);

    if (Object.keys(novoErrors).length > 0) return;

    console.log("Cadastro enviado (mock):", form);
    alert("Conta criada (mock). Depois você integra com a API.");

    setForm(INITIAL_FORM);
    setErrors({});
    setPreviewUrl(null);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-body">
          <div className="auth-header">
            <a href="/index.html" className="auth-logo-link">
              <img
                src="/assets/images/logotipo.png"
                alt="Descubra+ Cajazeiras"
                className="auth-logo"
              />
            </a>
            <h1 className="auth-title">Crie sua conta</h1>
            <p className="auth-subtitle">
              Cadastre-se para gerenciar pontos e serviços turísticos.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
    
            <div className="auth-field">
              <label htmlFor="cadastro-nome">
                Nome <span className="auth-required">*</span>
              </label>
              <input
                id="cadastro-nome"
                name="nome"
                type="text"
                value={form.nome}
                onChange={handleChange}
                className={errors.nome ? "erro" : ""}
                placeholder="Seu nome completo"
              />
              {errors.nome && (
                <span className="auth-error">{errors.nome}</span>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="cadastro-email">
                E-mail <span className="auth-required">*</span>
              </label>
              <input
                id="cadastro-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={errors.email ? "erro" : ""}
                placeholder="voce@exemplo.com"
              />
              {errors.email && (
                <span className="auth-error">{errors.email}</span>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="cadastro-senha">
                Senha <span className="auth-required">*</span>
              </label>
              <input
                id="cadastro-senha"
                name="senha"
                type="password"
                value={form.senha}
                onChange={handleChange}
                className={errors.senha ? "erro" : ""}
                placeholder="Mínimo 6 caracteres"
              />
              {errors.senha && (
                <span className="auth-error">{errors.senha}</span>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="cadastro-foto">Foto de perfil (opcional)</label>
              <input
                id="cadastro-foto"
                name="foto"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {previewUrl && (
                <div className="auth-avatar-preview">
                  <img
                    src={previewUrl}
                    alt="Prévia do avatar"
                    className="auth-avatar-img"
                  />
                  <button
                    type="button"
                    className="auth-avatar-remove"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, foto: null }));
                      setPreviewUrl(null);
                    }}
                  >
                    Remover foto
                  </button>
                </div>
              )}
            </div>

            <button type="submit" className="auth-btn-primary">
              Criar conta
            </button>
          </form>

          <p className="auth-footer-text">
            Já tem uma conta?{" "}
            <a href="/telaLogin.html" className="auth-link">
              Faça login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
