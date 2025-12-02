import React, { useMemo, useState } from "react";
import "../styles/servicos.css";

const MOCK_SERVICES = [
  {
    id: 1,
    nome: "Hotel Cajazeiras Palace",
    tipo: "Hospedagem",
    descricao: "Hotel confortável no centro, café da manhã incluso.",
    latitude: -6.88,
    longitude: -38.56,
    telefone: "(83) 99999-0001",
    instagram: "cajazeiraspalace",
  },
  {
    id: 2,
    nome: "Restaurante Sabor do Sertão",
    tipo: "Alimentação/Lazer",
    descricao: "Comida regional, música ao vivo aos fins de semana.",
    latitude: -6.881,
    longitude: -38.55,
    telefone: "(83) 98888-0002",
    instagram: "sabordosertao",
  },
  {
    id: 3,
    nome: "Mirante do Cristo Rei",
    tipo: "Ponto Turístico",
    descricao: "Vista panorâmica da cidade, pôr do sol incrível.",
    latitude: -6.89,
    longitude: -38.57,
    telefone: "",
    instagram: "",
  },
];

const TIPO_LABEL = {
  "Hospedagem": "Hospedagem",
  "Alimentação/Lazer": "Alimentação/Lazer",
  "Ponto Turístico": "Ponto Turístico",
};

export default function ServicosPage() {
  const [servicos, setServicos] = useState(MOCK_SERVICES);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [servicoEditando, setServicoEditando] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    nome: "",
    tipo: "",
    descricao: "",
    endereco: "",
    latitude: "",
    longitude: "",
    telefone: "",
    instagram: "",
  });

  const total = servicos.length;
  const totalHospedagem = servicos.filter((s) => s.tipo === "Hospedagem").length;
  const totalTuristico = servicos.filter((s) => s.tipo === "Ponto Turístico").length;

  const servicosFiltrados = useMemo(() => {
    return servicos.filter((s) => {
      const matchTipo = filtroTipo ? s.tipo === filtroTipo : true;
      const matchBusca = busca
        ? s.nome.toLowerCase().includes(busca.toLowerCase())
        : true;
      return matchTipo && matchBusca;
    });
  }, [servicos, filtroTipo, busca]);

  function abrirModalNovo() {
    setServicoEditando(null);
    setForm({
      nome: "",
      tipo: "",
      descricao: "",
      endereco: "",
      latitude: "",
      longitude: "",
      telefone: "",
      instagram: "",
    });
    setErrors({});
    setModalAberto(true);
  }

  function abrirModalEditar(servico) {
    setServicoEditando(servico);
    setForm({
      nome: servico.nome || "",
      tipo: servico.tipo || "",
      descricao: servico.descricao || "",
      endereco: servico.endereco || "",
      latitude: servico.latitude ?? "",
      longitude: servico.longitude ?? "",
      telefone: servico.telefone || "",
      instagram: servico.instagram || "",
    });
    setErrors({});
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validar() {
    const novo = {};
    if (!form.nome.trim()) novo.nome = "Informe o nome do serviço.";
    if (!form.tipo) novo.tipo = "Selecione o tipo.";
    if (!form.latitude) novo.latitude = "Informe a latitude.";
    if (!form.longitude) novo.longitude = "Informe a longitude.";
    return novo;
  }

  function handleSalvar(e) {
    e.preventDefault();
    const novoErrors = validar();
    setErrors(novoErrors);
    if (Object.keys(novoErrors).length > 0) return;

    if (servicoEditando) {
      setServicos((prev) =>
        prev.map((s) =>
          s.id === servicoEditando.id ? { ...servicoEditando, ...form } : s
        )
      );
    } else {
      const novo = {
        id: Date.now(),
        ...form,
      };
      setServicos((prev) => [novo, ...prev]);
    }

    fecharModal();
  }

  function handleRemover(id) {
    if (!window.confirm("Deseja realmente remover este serviço?")) return;
    setServicos((prev) => prev.filter((s) => s.id !== id));
  }

  function handleCentralizarMapa() {
    console.log("Centralizar mapa (mock)");
  }

  function handleBuscarEndereco() {
    alert("Busca de endereço será integrada depois (mock).");
  }

  function handleNovoDoMapa() {
    abrirModalNovo();
  }

  function handleNovoPrimeiro() {
    abrirModalNovo();
  }

  return (
    <div className="sv-page">

      <header className="sv-header">
        <div className="sv-header-left">
          <a href="/index.html" className="sv-logo-link">
            <img
              src="/assets/images/logotipo.png"
              alt="Descubra+ Cajazeiras"
              className="sv-logo-img"
            />
          </a>
        </div>

        <nav className="sv-header-center">
          <a href="/index.html" className="sv-btn sv-btn-outline">
            ← Voltar ao mapa
          </a>
          <button className="sv-btn sv-btn-outline" onClick={abrirModalNovo}>
            + Novo serviço
          </button>
        </nav>

        <div className="sv-header-right" id="usuario-area" />
      </header>

 
      <main className="sv-main">
        <div className="sv-layout">

          <section className="sv-col sv-col-left">
            <div className="sv-card">
              <div className="sv-card-header">
                <div className="sv-card-header-top">
                  <h2 className="sv-title">Gerenciar serviços</h2>
                  <button
                    className="sv-icon-button"
                    onClick={() => console.log("Atualizar lista (mock)")}
                  >
                    ↻
                  </button>
                </div>

                <div className="sv-count-grid">
                  <div className="sv-count-card">
                    <small>Total</small>
                    <span>{total}</span>
                  </div>
                  <div className="sv-count-card">
                    <small>Hospedagem</small>
                    <span className="sv-text-success">{totalHospedagem}</span>
                  </div>
                  <div className="sv-count-card">
                    <small>Turístico</small>
                    <span className="sv-text-info">{totalTuristico}</span>
                  </div>
                </div>

                <div className="sv-filter-group">
                  <button
                    type="button"
                    className={`sv-filter-btn ${
                      filtroTipo === "" ? "active" : ""
                    }`}
                    onClick={() => setFiltroTipo("")}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    className={`sv-filter-btn ${
                      filtroTipo === "Hospedagem" ? "active" : ""
                    }`}
                    onClick={() => setFiltroTipo("Hospedagem")}
                  >
                    Hospedagem
                  </button>
                  <button
                    type="button"
                    className={`sv-filter-btn ${
                      filtroTipo === "Alimentação/Lazer" ? "active" : ""
                    }`}
                    onClick={() => setFiltroTipo("Alimentação/Lazer")}
                  >
                    Alimentação
                  </button>
                  <button
                    type="button"
                    className={`sv-filter-btn ${
                      filtroTipo === "Ponto Turístico" ? "active" : ""
                    }`}
                    onClick={() => setFiltroTipo("Ponto Turístico")}
                  >
                    Turístico
                  </button>
                </div>

                <div className="sv-search">
                  <input
                    type="text"
                    placeholder="Buscar serviços..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                  <button
                    type="button"
                    className="sv-icon-button"
                    onClick={() => {}}
                  >
                    🔍
                  </button>
                </div>
              </div>

              <div className="sv-card-body">
                {servicosFiltrados.length === 0 ? (
                  <div className="sv-empty">
                    <p>Nenhum serviço cadastrado.</p>
                    <button
                      className="sv-btn sv-btn-primary"
                      onClick={handleNovoPrimeiro}
                    >
                      Cadastrar primeiro serviço
                    </button>
                  </div>
                ) : (
                  <ul className="sv-list">
                    {servicosFiltrados.map((servico) => (
                      <li
                        key={servico.id}
                        className="sv-list-item"
                        onClick={() => abrirModalEditar(servico)}
                      >
                        <div className="sv-list-main">
                          <strong>{servico.nome}</strong>
                          <span className="sv-list-meta">
                            {TIPO_LABEL[servico.tipo] || servico.tipo}
                          </span>
                          {servico.telefone && (
                            <span className="sv-list-meta">
                              Tel: {servico.telefone}
                            </span>
                          )}
                          {servico.instagram && (
                            <span className="sv-list-meta">
                              @{servico.instagram}
                            </span>
                          )}
                        </div>
                        <div className="sv-list-right">
                          <span
                            className={`sv-badge sv-badge-${servico.tipo
                              .toLowerCase()
                              .replace(/\s|\/+/g, "-")}`}
                          >
                            {servico.tipo}
                          </span>
                          <button
                            className="sv-icon-button sv-icon-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemover(servico.id);
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          <section className="sv-col sv-col-right">
            <div className="sv-card">
              <div className="sv-card-header sv-card-header-top">
                <h2 className="sv-title">Localização dos serviços</h2>
                <div className="sv-header-actions">
                  <button
                    className="sv-icon-button"
                    onClick={handleCentralizarMapa}
                  >
                    🎯
                  </button>
                  <button
                    className="sv-btn sv-btn-primary sv-btn-sm"
                    onClick={handleNovoDoMapa}
                  >
                    + Novo serviço
                  </button>
                </div>
              </div>
              <div className="sv-card-body">
                <div className="sv-map">
            
                  <span className="sv-map-helper">
                    Mapa dos serviços (placeholder). Depois você pluga o
                    React-Leaflet aqui.
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {modalAberto && (
        <div className="sv-modal-backdrop" onClick={fecharModal}>
          <div
            className="sv-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="sv-modal-header">
              <h3>
                {servicoEditando
                  ? "Editar serviço turístico"
                  : "Novo serviço turístico"}
              </h3>
              <button className="sv-icon-button" onClick={fecharModal}>
                ✕
              </button>
            </header>

            <form className="sv-modal-body" onSubmit={handleSalvar}>
              <div className="sv-form-grid">
                <div className="sv-form-group">
                  <label>
                    Nome do estabelecimento <span className="sv-required">*</span>
                  </label>
                  <input
                    name="nome"
                    type="text"
                    value={form.nome}
                    onChange={handleChange}
                    className={errors.nome ? "erro" : ""}
                  />
                  {errors.nome && (
                    <span className="sv-error">{errors.nome}</span>
                  )}
                </div>

                <div className="sv-form-group">
                  <label>
                    Tipo de serviço <span className="sv-required">*</span>
                  </label>
                  <select
                    name="tipo"
                    value={form.tipo}
                    onChange={handleChange}
                    className={errors.tipo ? "erro" : ""}
                  >
                    <option value="">Selecione...</option>
                    <option value="Hospedagem">Hospedagem</option>
                    <option value="Alimentação/Lazer">Alimentação/Lazer</option>
                    <option value="Ponto Turístico">Ponto Turístico</option>
                  </select>
                  {errors.tipo && (
                    <span className="sv-error">{errors.tipo}</span>
                  )}
                </div>
              </div>

              <div className="sv-form-group">
                <label>Descrição</label>
                <textarea
                  name="descricao"
                  rows={3}
                  value={form.descricao}
                  onChange={handleChange}
                />
              </div>

              <h4 className="sv-subtitle">Localização</h4>

              <div className="sv-form-group">
                <label>Endereço</label>
                <div className="sv-input-group">
                  <input
                    name="endereco"
                    type="text"
                    value={form.endereco}
                    onChange={handleChange}
                    placeholder="Digite um endereço para buscar no mapa"
                  />
                  <button
                    type="button"
                    className="sv-btn-ghost"
                    onClick={handleBuscarEndereco}
                  >
                    Buscar
                  </button>
                </div>
              </div>

              <div className="sv-form-grid">
                <div className="sv-form-group">
                  <label>
                    Latitude <span className="sv-required">*</span>
                  </label>
                  <input
                    name="latitude"
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={handleChange}
                    className={errors.latitude ? "erro" : ""}
                  />
                  {errors.latitude && (
                    <span className="sv-error">{errors.latitude}</span>
                  )}
                </div>
                <div className="sv-form-group">
                  <label>
                    Longitude <span className="sv-required">*</span>
                  </label>
                  <input
                    name="longitude"
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={handleChange}
                    className={errors.longitude ? "erro" : ""}
                  />
                  {errors.longitude && (
                    <span className="sv-error">{errors.longitude}</span>
                  )}
                </div>
              </div>

              <h4 className="sv-subtitle">Contato (opcional)</h4>
              <div className="sv-form-grid">
                <div className="sv-form-group">
                  <label>Telefone</label>
                  <input
                    name="telefone"
                    type="tel"
                    value={form.telefone}
                    onChange={handleChange}
                    placeholder="(83) 9 9999-9999"
                  />
                </div>
                <div className="sv-form-group">
                  <label>Instagram</label>
                  <div className="sv-input-group">
                    <span className="sv-input-prefix">@</span>
                    <input
                      name="instagram"
                      type="text"
                      value={form.instagram}
                      onChange={handleChange}
                      placeholder="usuario_instagram"
                    />
                  </div>
                </div>
              </div>

              <footer className="sv-modal-footer">
                <button
                  type="button"
                  className="sv-btn sv-btn-secondary"
                  onClick={fecharModal}
                >
                  Cancelar
                </button>
                <button type="submit" className="sv-btn sv-btn-primary">
                  Salvar serviço
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
