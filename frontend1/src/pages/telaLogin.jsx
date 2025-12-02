import React, { useState } from "react";
import "../styles/auth.css";

const INITIAL_FORM = {
  email: "",
  senha: "",
};

export default function TelaLogin() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validar() {
    const novo = {};

    if (!form.email.trim()) {
      novo.email = "Informe seu e-mail.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      novo.email = "E-mail inválido.";
    }

    if (!form.senha.trim()) {
      novo.senha = "Informe sua senha.";
    }

    return novo;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const novoErrors = validar();
    setErrors(novoErrors);

    if (Object.keys(novoErrors).length > 0) return;

    console.log("Login (mock):", form);
    alert("Login realizado (mock). Integração com backend entra depois.");
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

            <h1 className="auth-title">Acessar sua Conta</h1>
            <p className="auth-subtitle">
              Entre para gerenciar pontos e serviços turísticos.
            </p>
          </div>


          <form className="auth-form" onSubmit={handleSubmit} noValidate>

            <div className="auth-field">
              <label htmlFor="login-email">
                E-mail <span className="auth-required">*</span>
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="voce@exemplo.com"
                className={errors.email ? "erro" : ""}
              />
              {errors.email && <span className="auth-error">{errors.email}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="login-senha">
                Senha <span className="auth-required">*</span>
              </label>
              <input
                id="login-senha"
                name="senha"
                type="password"
                value={form.senha}
                onChange={handleChange}
                placeholder="Digite sua senha"
                className={errors.senha ? "erro" : ""}
              />
              {errors.senha && <span className="auth-error">{errors.senha}</span>}
            </div>

            <button type="submit" className="auth-btn-primary">
              Entrar
            </button>
          </form>

          <p className="auth-footer-text">
            Ainda não tem uma conta?{" "}
            <a href="/telaCadastro.html" className="auth-link">
              Cadastre-se
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
