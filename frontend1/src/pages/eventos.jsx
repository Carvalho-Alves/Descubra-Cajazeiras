import React, { useMemo, useState } from "react";
import "./styles/eventos.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { eventosMock } from "../mocks/eventosMock";

const MOCK_EVENTS = eventosMock.map(evento => ({
  id: evento.id,
  nome: evento.titulo,
  data: evento.data,
  horario: "19:00",
  status: "ativo",
  descricao: evento.descricao,
  latitude: -6.88,
  longitude: -38.55,
}));

const STATUS_LABELS = {
  ativo: "Ativo",
  cancelado: "Cancelado",
  encerrado: "Encerrado",
};

export default function EventosPage() {
  const [eventos, setEventos] = useState(MOCK_EVENTS);
  const [statusFiltro, setStatusFiltro] = useState("");
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [eventoEditando, setEventoEditando] = useState(null);

  const [form, setForm] = useState({
    nome: "",
    data: "",
    horario: "",
    status: "ativo",
    descricao: "",
    latitude: "",
    longitude: "",
  });

  // contadores
  const total = eventos.length;
  const ativos = eventos.filter((e) => e.status === "ativo").length;
  const encerrados = eventos.filter((e) => e.status === "encerrado").length;

  const eventosFiltrados = useMemo(() => {
    return eventos.filter((evento) => {
      const matchStatus = statusFiltro ? evento.status === statusFiltro : true;
      const matchBusca = busca
        ? evento.nome.toLowerCase().includes(busca.toLowerCase())
        : true;
      return matchStatus && matchBusca;
    });
  }, [eventos, statusFiltro, busca]);

  function abrirModalNovo() {
    setEventoEditando(null);
    setForm({
      nome: "",
      data: "",
      horario: "",
      status: "ativo",
      descricao: "",
      latitude: "",
      longitude: "",
    });
    setModalAberto(true);
  }

  function abrirModalEditar(evento) {
    setEventoEditando(evento);
    setForm({
      nome: evento.nome || "",
      data: evento.data || "",
      horario: evento.horario || "",
      status: evento.status || "ativo",
      descricao: evento.descricao || "",
      latitude: evento.latitude ?? "",
      longitude: evento.longitude ?? "",
    });
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSalvar(e) {
    e.preventDefault();

    if (!form.nome || !form.data || !form.latitude || !form.longitude) {
      alert("Preencha pelo menos nome, data, latitude e longitude.");
      return;
    }

    if (eventoEditando) {
      setEventos((prev) =>
        prev.map((ev) =>
          ev.id === eventoEditando.id ? { ...eventoEditando, ...form } : ev
        )
      );
    } else {
      const novo = {
        id: Date.now(),
        ...form,
      };
      setEventos((prev) => [novo, ...prev]);
    }

    fecharModal();
  }

  function handleRemover(id) {
    if (!window.confirm("Deseja realmente remover este evento?")) return;
    setEventos((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="page-eventos">
      <Header titulo="Eventos" subtitulo="Gerencie os eventos da cidade" />
      <header className="ev-header">
        <div className="ev-header-left">
          <a href="/index.html" className="ev-logo-link">
            <img
              src="/assets/images/logotipo.png"
              alt="Descubra+ Cajazeiras"
              className="ev-logo-img"
            />
          </a>
        </div>

        <nav className="ev-header-center">
          <a href="/index.html" className="ev-btn ev-btn-outline">
            ← Voltar ao mapa
          </a>
          <button className="ev-btn ev-btn-outline" onClick={abrirModalNovo}>
            + Novo evento
          </button>
        </nav>

        <div className="ev-header-right" id="usuario-area">
        </div>
      </header>

      <main className="ev-main">
        <div className="ev-layout">
          <section className="ev-col ev-col-left">
            <div className="ev-card">
              <div className="ev-card-header">
                <div className="ev-card-header-top">
                  <h2 className="ev-title">
                    Gerenciar eventos
                  </h2>
                  <button
                    className="ev-icon-button"
                    onClick={() => console.log("atualizar mock")}
                    title="Atualizar lista"
                  >
                    ↻
                  </button>
                </div>
                <div className="ev-count-grid">
                  <div className="ev-count-card">
                    <small>Total</small>
                    <span>{total}</span>
                  </div>
                  <div className="ev-count-card">
                    <small>Ativos</small>
                    <span className="ev-text-success">{ativos}</span>
                  </div>
                  <div className="ev-count-card">
                    <small>Encerrados</small>
                    <span className="ev-text-muted">{encerrados}</span>
                  </div>
                </div>
                <div className="ev-filter-group">
                  <button
                    type="button"
                    className={`ev-filter-btn ${
                      statusFiltro === "" ? "active" : ""
                    }`}
                    onClick={() => setStatusFiltro("")}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    className={`ev-filter-btn ${
                      statusFiltro === "ativo" ? "active" : ""
                    }`}
                    onClick={() => setStatusFiltro("ativo")}
                  >
                    Ativo
                  </button>
                  <button
                    type="button"
                    className={`ev-filter-btn ${
                      statusFiltro === "cancelado" ? "active" : ""
                    }`}
                    onClick={() => setStatusFiltro("cancelado")}
                  >
                    Cancelado
                  </button>
                  <button
                    type="button"
                    className={`ev-filter-btn ${
                      statusFiltro === "encerrado" ? "active" : ""
                    }`}
                    onClick={() => setStatusFiltro("encerrado")}
                  >
                    Encerrado
                  </button>
                </div>
                <div className="ev-search">
                  <input
                    type="text"
                    placeholder="Buscar eventos..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => {}}
                    className="ev-icon-button"
                  >
                    🔍
                  </button>
                </div>
              </div>

              <div className="ev-card-body">
                {eventosFiltrados.length === 0 ? (
                  <div className="ev-empty">
                    <p>Nenhum evento encontrado.</p>
                    <button
                      className="ev-btn ev-btn-primary"
                      onClick={abrirModalNovo}
                    >
                      Cadastrar primeiro evento
                    </button>
                  </div>
                ) : (
                  <ul className="ev-list">
                    {eventosFiltrados.map((evento) => (
                      <li
                        key={evento.id}
                        className="ev-list-item"
                        onClick={() => abrirModalEditar(evento)}
                      >
                        <div className="ev-list-main">
                          <strong>{evento.nome}</strong>
                          <span className="ev-list-meta">
                            {evento.data} • {evento.horario || "horário não informado"}
                          </span>
                        </div>
                        <div className="ev-list-right">
                          <span className={`ev-badge ev-badge-${evento.status}`}>
                            {STATUS_LABELS[evento.status] || evento.status}
                          </span>
                          <button
                            className="ev-icon-button ev-icon-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemover(evento.id);
                            }}
                            title="Remover evento"
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
          <section className="ev-col ev-col-right">
            <div className="ev-card">
              <div className="ev-card-header ev-card-header-top">
                <h2 className="ev-title">Localização dos eventos</h2>
                <div className="ev-header-actions">
                  <button
                    className="ev-icon-button"
                    onClick={() => console.log("centralizar mock")}
                  >
                    🎯
                  </button>
                  <button
                    className="ev-btn ev-btn-primary ev-btn-sm"
                    onClick={abrirModalNovo}
                  >
                    + Novo evento
                  </button>
                </div>
              </div>

              <div className="ev-card-body">
                <div className="ev-map">
                  
                  <span className="ev-map-helper">
                    Mapa dos eventos (placeholder). Clique nos pontos para
                    gerenciar.
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {modalAberto && (
        <div className="ev-modal-backdrop" onClick={fecharModal}>
          <div
            className="ev-modal"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <header className="ev-modal-header">
              <h3>{eventoEditando ? "Editar evento" : "Novo evento"}</h3>
              <button className="ev-icon-button" onClick={fecharModal}>
                ✕
              </button>
            </header>

            <form className="ev-modal-body" onSubmit={handleSalvar}>
              <div className="ev-form-grid">
                <div className="ev-form-group">
                  <label>Nome *</label>
                  <input
                    type="text"
                    name="nome"
                    value={form.nome}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="ev-form-group">
                  <label>Data *</label>
                  <input
                    type="date"
                    name="data"
                    value={form.data}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="ev-form-grid">
                <div className="ev-form-group">
                  <label>Horário</label>
                  <input
                    type="text"
                    name="horario"
                    value={form.horario}
                    onChange={handleChange}
                    placeholder="Ex: 19:00"
                  />
                </div>

                <div className="ev-form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="cancelado">Cancelado</option>
                    <option value="encerrado">Encerrado</option>
                  </select>
                </div>
              </div>

              <div className="ev-form-group">
                <label>Descrição</label>
                <textarea
                  name="descricao"
                  rows={3}
                  value={form.descricao}
                  onChange={handleChange}
                />
              </div>

              <h4 className="ev-subtitle">Localização</h4>
              <div className="ev-form-grid">
                <div className="ev-form-group">
                  <label>Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={form.latitude}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="ev-form-group">
                  <label>Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={form.longitude}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <footer className="ev-modal-footer">
                <button
                  type="button"
                  className="ev-btn ev-btn-secondary"
                  onClick={fecharModal}
                >
                  Cancelar
                </button>
                <button type="submit" className="ev-btn ev-btn-primary">
                  Salvar evento
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
      <Footer texto="© 2025 Descubra Cajazeiras - Todos os direitos reservados" />
    </div>
  );
}
