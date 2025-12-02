import React, { useState } from "react";
import "../styles/ponto.css";

const INITIAL_FORM = {
  nome: "",
  descricao: "",
  tipo: "",
  endereco: "",
  latitude: "",
  longitude: "",
  horarioFuncionamento: "",
  categoriaServico: "",
  dataEvento: "",
  horarioEvento: "",
};

export default function PontoModelPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [tipo, setTipo] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleTipoChange(e) {
    const value = e.target.value;
    setTipo(value);
    setForm((prev) => ({ ...prev, tipo: value }));
  }

  function validar() {
    const novo = {};
    if (!form.nome.trim()) novo.nome = "Informe o nome do ponto.";
    if (!form.tipo) novo.tipo = "Selecione o tipo.";
    if (!form.latitude) novo.latitude = "Informe a latitude.";
    if (!form.longitude) novo.longitude = "Informe a longitude.";
    return novo;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const novoErrors = validar();
    setErrors(novoErrors);
    if (Object.keys(novoErrors).length > 0) return;

    console.log("Ponto salvo (mock):", form);
    alert("Ponto salvo (mock). Depois você integra com a API.");
    setForm(INITIAL_FORM);
    setTipo("");
    setErrors({});
  }

  function handleUsarLocalizacao() {
    const lat = -6.88;
    const lng = -38.56;
    setForm((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  }

  function handleBuscarEndereco() {
    alert("Busca de endereço será integrada ao serviço de geocodificação.");
  }

  return (
    <div className="ponto-page">
      <header className="ponto-header">
        <nav className="ponto-nav">
          <a href="/index.html" className="ponto-logo-link">
            <img
              src="/assets/images/logotipo.png"
              alt="Logo Descubra+ Cajazeiras"
              className="ponto-logo"
            />
          </a>
        </nav>
      </header>
      <main className="ponto-main">
        <form
          className="ponto-card"
          onSubmit={handleSubmit}
          noValidate
        >
          <h2 className="ponto-title">Novo Ponto</h2>

          <div className="ponto-grid">
            <div className="ponto-col">
              <div className="ponto-field">
                <label htmlFor="ponto-nome">
                  Nome <span className="ponto-required">*</span>
                </label>
                <input
                  id="ponto-nome"
                  name="nome"
                  type="text"
                  value={form.nome}
                  onChange={handleChange}
                  className={errors.nome ? "ponto-input erro" : "ponto-input"}
                />
                {errors.nome && (
                  <span className="ponto-error">{errors.nome}</span>
                )}
              </div>

              <div className="ponto-field">
                <label htmlFor="ponto-descricao">Descrição</label>
                <textarea
                  id="ponto-descricao"
                  name="descricao"
                  rows={5}
                  value={form.descricao}
                  onChange={handleChange}
                  className="ponto-input"
                />
              </div>

              <div className="ponto-field">
                <label htmlFor="tipoCadastro">
                  Tipo <span className="ponto-required">*</span>
                </label>
                <select
                  id="tipoCadastro"
                  value={tipo}
                  onChange={handleTipoChange}
                  className={errors.tipo ? "ponto-input erro" : "ponto-input"}
                >
                  <option value="">Selecione um tipo</option>
                  <option value="servico">Serviço Turístico</option>
                  <option value="evento">Evento</option>
                </select>
                {errors.tipo && (
                  <span className="ponto-error">{errors.tipo}</span>
                )}
              </div>
              {tipo === "servico" && (
                <div className="ponto-dynamic">
                  <h4 className="ponto-subtitle">Dados do serviço</h4>

                  <div className="ponto-field">
                    <label htmlFor="categoriaServico">Categoria</label>
                    <input
                      id="categoriaServico"
                      name="categoriaServico"
                      type="text"
                      value={form.categoriaServico}
                      onChange={handleChange}
                      className="ponto-input"
                      placeholder="Ex: Hotel, Restaurante, Agência..."
                    />
                  </div>

                  <div className="ponto-field">
                    <label htmlFor="horarioFuncionamento">
                      Horário de funcionamento
                    </label>
                    <input
                      id="horarioFuncionamento"
                      name="horarioFuncionamento"
                      type="text"
                      value={form.horarioFuncionamento}
                      onChange={handleChange}
                      className="ponto-input"
                      placeholder="Ex: Seg a dom, 8h às 18h"
                    />
                  </div>
                </div>
              )}

              {tipo === "evento" && (
                <div className="ponto-dynamic">
                  <h4 className="ponto-subtitle">Dados do evento</h4>

                  <div className="ponto-field">
                    <label htmlFor="dataEvento">Data do evento</label>
                    <input
                      id="dataEvento"
                      name="dataEvento"
                      type="date"
                      value={form.dataEvento}
                      onChange={handleChange}
                      className="ponto-input"
                    />
                  </div>

                  <div className="ponto-field">
                    <label htmlFor="horarioEvento">Horário do evento</label>
                    <input
                      id="horarioEvento"
                      name="horarioEvento"
                      type="text"
                      value={form.horarioEvento}
                      onChange={handleChange}
                      className="ponto-input"
                      placeholder="Ex: 19:00"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="ponto-col">
              <div className="ponto-field">
                <label htmlFor="ponto-endereco">Endereço</label>
                <div className="ponto-input-group">
                  <input
                    id="ponto-endereco"
                    name="endereco"
                    type="text"
                    value={form.endereco}
                    onChange={handleChange}
                    className="ponto-input"
                    placeholder="Digite um endereço para buscar no mapa"
                  />
                  <button
                    type="button"
                    className="ponto-btn-ghost"
                    onClick={handleBuscarEndereco}
                  >
                    Buscar
                  </button>
                </div>
              </div>

              <div className="ponto-grid-2">
                <div className="ponto-field">
                  <label htmlFor="ponto-latitude">
                    Latitude <span className="ponto-required">*</span>
                  </label>
                  <input
                    id="ponto-latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={handleChange}
                    className={
                      errors.latitude ? "ponto-input erro" : "ponto-input"
                    }
                  />
                  {errors.latitude && (
                    <span className="ponto-error">{errors.latitude}</span>
                  )}
                </div>

                <div className="ponto-field">
                  <label htmlFor="ponto-longitude">
                    Longitude <span className="ponto-required">*</span>
                  </label>
                  <input
                    id="ponto-longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={handleChange}
                    className={
                      errors.longitude ? "ponto-input erro" : "ponto-input"
                    }
                  />
                  {errors.longitude && (
                    <span className="ponto-error">{errors.longitude}</span>
                  )}
                </div>
              </div>

              <div className="ponto-field">
                <button
                  type="button"
                  className="ponto-btn-outline full-width"
                  onClick={handleUsarLocalizacao}
                >
                  Usar minha localização (mock)
                </button>
              </div>

              <div className="ponto-map-block">
                <label className="ponto-label-map">Selecione no mapa:</label>
                <small className="ponto-muted">
                  Clique ou arraste o marcador para definir a localização.
                </small>

                <div className="ponto-map">
                  <span className="ponto-map-placeholder">
                    Mapa (placeholder). Integração com Leaflet entra depois.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="ponto-actions">
            <a href="/index.html" className="ponto-btn-secondary">
              Cancelar
            </a>
            <button type="submit" className="ponto-btn-primary">
              Salvar
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
