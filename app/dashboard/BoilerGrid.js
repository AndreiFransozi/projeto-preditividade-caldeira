"use client";

import { useEffect, useState, useMemo } from "react";
import LogoutButton from "./LogoutButton";

const STATUS_LABELS = {
  normal: "Normal",
  atencao: "Atenção",
  alarme: "Alarme",
  desligada: "Desligada",
};

function createLocalId() {
  return `preview-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function BoilerGrid({
  user,
  boilers: initialBoilers,
  initialReadings,
  initialRecentReadings,
}) {
  const [boilers, setBoilers] = useState(initialBoilers);
  const [readings, setReadings] = useState(initialReadings);
  const [recentReadings, setRecentReadings] = useState(initialRecentReadings || []);

  // Filtros e busca
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  // Modais
  const [selectedBoiler, setSelectedBoiler] = useState(null);
  const [activeTab, setActiveTab] = useState("telemetria"); // telemetria, historico, ficha, acoes
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBoiler, setEditingBoiler] = useState(null);
  const [readingModalBoiler, setReadingModalBoiler] = useState(null);

  // Estados de formulário
  const [boilerForm, setBoilerForm] = useState({
    name: "",
    location: "",
    model: "",
    max_pressure: "10.0",
    createInitialReading: true,
  });

  const [readingForm, setReadingForm] = useState({
    pressure: "8.5",
    temperature: "175",
    water_level: "65",
    status: "normal",
  });

  const [feedbackMsg, setFeedbackMsg] = useState("");

  useEffect(() => setBoilers(initialBoilers), [initialBoilers]);
  useEffect(() => setReadings(initialReadings), [initialReadings]);
  useEffect(
    () => setRecentReadings(initialRecentReadings || []),
    [initialRecentReadings]
  );

  // Mostra feedback temporário
  function notify(msg) {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 4000);
  }

  // Filtragem das caldeiras
  const filteredBoilers = useMemo(() => {
    return boilers.filter((b) => {
      const r = readings[b.id];
      const status = r?.status ?? "desligada";

      // Filtro por status
      if (statusFilter !== "todos" && status !== statusFilter) {
        return false;
      }

      // Filtro por busca de texto
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = b.name?.toLowerCase().includes(query);
        const locMatch = b.location?.toLowerCase().includes(query);
        const modelMatch = b.model?.toLowerCase().includes(query);
        return nameMatch || locMatch || modelMatch;
      }

      return true;
    });
  }, [boilers, readings, statusFilter, searchQuery]);

  // Estatísticas do Proprietário
  const stats = useMemo(() => {
    const total = boilers.length;
    let normal = 0;
    let atencao = 0;
    let alarme = 0;
    let desligada = 0;
    let sumPressure = 0;
    let countActive = 0;

    boilers.forEach((b) => {
      const r = readings[b.id];
      const s = r?.status ?? "desligada";
      if (s === "normal") normal++;
      else if (s === "atencao") atencao++;
      else if (s === "alarme") alarme++;
      else desligada++;

      if (r && r.pressure != null) {
        sumPressure += Number(r.pressure);
        countActive++;
      }
    });

    const avgPressure = countActive > 0 ? (sumPressure / countActive).toFixed(1) : "--";

    return { total, normal, atencao, alarme, desligada, avgPressure };
  }, [boilers, readings]);

  function handleCreateBoiler(e) {
    e.preventDefault();
    const maxP = parseFloat(boilerForm.max_pressure) || 10.0;
    const newBoiler = {
      id: createLocalId(),
      user_id: user.id,
      name: boilerForm.name.trim(),
      location: boilerForm.location.trim() || "Unidade Principal",
      model: boilerForm.model.trim() || "Modelo Padrão",
      max_pressure: maxP,
      created_at: new Date().toISOString(),
    };

    if (boilerForm.createInitialReading) {
      const newReading = {
        id: createLocalId(),
        pressure: Number((maxP * 0.75).toFixed(1)),
        temperature: 175,
        water_level: 65,
        status: "normal",
        boiler_id: newBoiler.id,
        created_at: new Date().toISOString(),
      };
      setReadings((prev) => ({ ...prev, [newBoiler.id]: newReading }));
      setRecentReadings((prev) => [newReading, ...prev]);
    }

    setBoilers((prev) => [newBoiler, ...prev]);
    setIsAddModalOpen(false);
    setBoilerForm({
      name: "",
      location: "",
      model: "",
      max_pressure: "10.0",
      createInitialReading: true,
    });
    notify("Prévia atualizada. Os dados não serão salvos.");
  }

  function handleUpdateBoiler(e) {
    e.preventDefault();
    if (!editingBoiler) return;
    const maxP = parseFloat(editingBoiler.max_pressure) || 10.0;
    const updated = {
      ...editingBoiler,
      name: editingBoiler.name.trim(),
      location: editingBoiler.location.trim(),
      model: editingBoiler.model.trim(),
      max_pressure: maxP,
    };

    setBoilers((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    if (selectedBoiler && selectedBoiler.id === updated.id) {
      setSelectedBoiler(updated);
    }
    setEditingBoiler(null);
    notify("Prévia atualizada. Os dados não serão salvos.");
  }

  function handleDeleteBoiler(boilerId) {
    if (
      !confirm(
        "Tem certeza que deseja excluir esta caldeira? Todas as leituras associadas também serão apagadas."
      )
    ) {
      return;
    }

    setBoilers((prev) => prev.filter((b) => b.id !== boilerId));
    setReadings((prev) => {
      const next = { ...prev };
      delete next[boilerId];
      return next;
    });
    setRecentReadings((prev) => prev.filter((reading) => reading.boiler_id !== boilerId));
    if (selectedBoiler && selectedBoiler.id === boilerId) {
      setSelectedBoiler(null);
    }
    notify("Prévia atualizada. Os dados não serão salvos.");
  }

  function handleAddReading(e) {
    e.preventDefault();
    const boilerId = readingModalBoiler?.id || selectedBoiler?.id;
    if (!boilerId) return;

    const newReading = {
      id: createLocalId(),
      pressure: parseFloat(readingForm.pressure),
      temperature: parseFloat(readingForm.temperature),
      water_level: parseFloat(readingForm.water_level),
      status: readingForm.status,
      boiler_id: boilerId,
      created_at: new Date().toISOString(),
    };

    setReadings((prev) => ({ ...prev, [boilerId]: newReading }));
    setRecentReadings((prev) => [newReading, ...prev]);
    setReadingModalBoiler(null);
    notify("Prévia atualizada. Os dados não serão salvos.");
  }

  function handleSimulateTelemetry(boiler) {
    if (!boiler) return;
    const maxP = boiler.max_pressure || 10.0;
    const pressure = Number((maxP * (0.6 + Math.random() * 0.32)).toFixed(2));
    const temperature = Math.round(160 + Math.random() * 30);
    const water_level = Math.round(55 + Math.random() * 25);
    const status =
      pressure > maxP * 0.95
        ? "alarme"
        : pressure > maxP * 0.88
        ? "atencao"
        : "normal";
    const newReading = {
      id: createLocalId(),
      pressure,
      temperature,
      water_level,
      status,
      boiler_id: boiler.id,
      created_at: new Date().toISOString(),
    };

    setReadings((prev) => ({ ...prev, [boiler.id]: newReading }));
    setRecentReadings((prev) => [newReading, ...prev]);
    notify(`Leitura de prévia gerada para ${boiler.name}. Não será salva.`);
  }

  return (
    <div className="dashboard-wrapper">
      {/* Notificação flutuante */}
      {feedbackMsg && <div className="toast-notification">{feedbackMsg}</div>}

      {/* Barra Superior Personalizada */}
      <header className="topbar-personalized">
        <div className="topbar-brand">
          <img
            className="brand-logo"
            src="/safelife-ai-logo.jpeg"
            alt="SafeLife AI"
          />
          <div className="realtime-status-pill">
            <span className="pulsing-dot"></span>
            <span className="status-text">Modo de visualização</span>
          </div>
        </div>

        {/* Perfil Personalizado do Proprietário */}
        <div className="topbar-user-area">
          <div className="user-profile-badge">
            <div className="user-avatar">
              {user.fullName?.charAt(0)?.toUpperCase() || "P"}
            </div>
            <div className="user-details">
              <div className="user-greeting">
                Olá, <strong>{user.fullName}</strong>
              </div>
              <div className="user-meta">
                <span className="owner-role-tag">🛡️ {user.role}</span>
                <span className="owner-company-tag">🏢 {user.companyName}</span>
              </div>
            </div>
          </div>

          <div className="topbar-actions">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsAddModalOpen(true)}
              title="Cadastrar novo equipamento"
            >
              <span className="btn-icon">＋</span> Nova Caldeira
            </button>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Resumo Executivo / Métricas Rápidas do Dono */}
      <section className="owner-summary-section">
        <div className="welcome-banner">
          <div>
            <h1 className="welcome-title">Painel de Acesso do Proprietário</h1>
            <p className="welcome-sub">
              Monitore seus equipamentos, acompanhe pressões operacionais em relação à PMTA
              e explore os diagnósticos do SafeLife AI. As alterações são temporárias e não
              são salvas.
            </p>
          </div>
        </div>

        <div className="stats-kpi-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper blue">🏭</div>
            <div className="stat-info">
              <span className="stat-label">Minhas Caldeiras</span>
              <span className="stat-value">{stats.total}</span>
              <span className="stat-note">Equipamentos vinculados</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper green">✅</div>
            <div className="stat-info">
              <span className="stat-label">Operação Normal</span>
              <span className="stat-value text-success">{stats.normal}</span>
              <span className="stat-note">Dentro das normas de segurança</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper amber">⚠️</div>
            <div className="stat-info">
              <span className="stat-label">Atenção / Alarme</span>
              <span
                className={`stat-value ${
                  stats.atencao + stats.alarme > 0 ? "text-warn" : ""
                }`}
              >
                {stats.atencao + stats.alarme}
              </span>
              <span className="stat-note">Requerem supervisão</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper cyan">⚡</div>
            <div className="stat-info">
              <span className="stat-label">Pressão Média Atual</span>
              <span className="stat-value">
                {stats.avgPressure} <small className="stat-unit">kgf/cm²</small>
              </span>
              <span className="stat-note">Média operacional ativa</span>
            </div>
          </div>
        </div>
      </section>

      {/* Barra de Filtros e Busca */}
      <section className="controls-bar">
        <div className="search-box">
          <svg
            className="search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome da caldeira, local ou modelo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-chips">
          <button
            className={`filter-chip ${statusFilter === "todos" ? "active" : ""}`}
            onClick={() => setStatusFilter("todos")}
          >
            Todas ({boilers.length})
          </button>
          <button
            className={`filter-chip ${statusFilter === "normal" ? "active" : ""}`}
            onClick={() => setStatusFilter("normal")}
          >
            Normais ({stats.normal})
          </button>
          <button
            className={`filter-chip ${statusFilter === "atencao" ? "active" : ""}`}
            onClick={() => setStatusFilter("atencao")}
          >
            Atenção ({stats.atencao})
          </button>
          <button
            className={`filter-chip ${statusFilter === "alarme" ? "active" : ""}`}
            onClick={() => setStatusFilter("alarme")}
          >
            Alarme ({stats.alarme})
          </button>
          <button
            className={`filter-chip ${statusFilter === "desligada" ? "active" : ""}`}
            onClick={() => setStatusFilter("desligada")}
          >
            Desligadas ({stats.desligada})
          </button>
        </div>
      </section>

      {/* Grid de Caldeiras do Proprietário */}
      {filteredBoilers.length === 0 ? (
        <div className="empty-state-box card">
          <div className="empty-state-icon">♨️</div>
          {boilers.length === 0 ? (
            <>
              <h3>Bem-vindo, {user.fullName}!</h3>
              <p className="sub">
                Você ainda não possui caldeiras vinculadas à sua conta de proprietário.
                Cadastre uma caldeira para visualizar os formulários. Os dados existem
                apenas enquanto esta página estiver aberta.
              </p>
              <div className="empty-state-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  ＋ Visualizar Cadastro de Caldeira
                </button>
              </div>
            </>
          ) : (
            <>
              <h3>Nenhuma caldeira encontrada</h3>
              <p className="sub">
                Nenhum equipamento corresponde aos filtros atuais. Tente limpar os filtros
                de busca.
              </p>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("todos");
                }}
              >
                Limpar Filtros
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="boiler-grid">
          {filteredBoilers.map((b) => {
            const r = readings[b.id];
            const status = r?.status ?? "desligada";
            const maxP = b.max_pressure || 10.0;
            const currentP = r?.pressure != null ? Number(r.pressure) : 0;
            const pressureRatio = Math.min(
              100,
              Math.max(0, Math.round((currentP / maxP) * 100))
            );

            // Cores da barra de PMTA
            const pmtaColorClass =
              pressureRatio > 90
                ? "danger"
                : pressureRatio > 75
                ? "warning"
                : "normal";

            return (
              <div className={`boiler-card card status-border-${status}`} key={b.id}>
                <div className="boiler-card-header">
                  <div>
                    <h2 className="boiler-card-title">{b.name}</h2>
                    <div className="boiler-card-sub">
                      📍 {b.location || "Sem local"} · ⚙️ {b.model || "Sem modelo"}
                    </div>
                  </div>
                  <span className={`badge ${status}`}>{STATUS_LABELS[status]}</span>
                </div>

                {/* Barra de Pressão vs PMTA (Segurança NR-13) */}
                <div className="pmta-monitor-box">
                  <div className="pmta-header-row">
                    <span className="pmta-label">
                      Carga Operacional vs PMTA ({maxP} kgf/cm²)
                    </span>
                    <span className="pmta-percent">
                      {currentP > 0 ? `${pressureRatio}%` : "--"}
                    </span>
                  </div>
                  <div className="pmta-progress-track">
                    <div
                      className={`pmta-progress-bar ${pmtaColorClass}`}
                      style={{ width: `${currentP > 0 ? pressureRatio : 0}%` }}
                    ></div>
                  </div>
                  {pressureRatio > 90 && (
                    <div className="pmta-alert-warning">
                      ⚠️ Pressão próxima à PMTA de projeto!
                    </div>
                  )}
                </div>

                {/* Métricas dos Sensores */}
                <div className="metrics">
                  <div className="metric">
                    <div className="value">{r ? r.pressure : "--"}</div>
                    <div className="label">Pressão (kgf/cm²)</div>
                  </div>
                  <div className="metric">
                    <div className="value">{r ? r.temperature : "--"}</div>
                    <div className="label">Temp. (°C)</div>
                  </div>
                  <div className="metric">
                    <div className="value">{r ? r.water_level : "--"}</div>
                    <div className="label">Nível (%)</div>
                  </div>
                </div>

                {/* Diagnóstico Rápido SafeLife AI */}
                <div className="ai-insight-box">
                  <span className="ai-insight-icon">🤖</span>
                  <span className="ai-insight-text">
                    {status === "alarme"
                      ? "Alerta crítico: limites operacionais excedidos. Ação imediata recomendada."
                      : status === "atencao"
                      ? "Atenção: oscilação operacional detectada nos sensores."
                      : status === "desligada"
                      ? "Equipamento em repouso / telemetria inativa."
                      : "Regime estável: integridade e conformidade NR-13 garantidas."}
                  </span>
                </div>

                {/* Rodapé e Ações do Card */}
                <div className="boiler-card-footer">
                  <div className="timestamp-info">
                    {r ? (
                      `Atualizado: ${new Date(r.created_at).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}`
                    ) : (
                      <span className="text-muted">Aguardando telemetria</span>
                    )}
                  </div>

                  <div className="card-action-buttons">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setSelectedBoiler(b);
                        setActiveTab("telemetria");
                      }}
                      title="Acessar todos os dados e histórico da caldeira"
                    >
                      📊 Acessar Dados da Caldeira
                    </button>
                    <button
                      className="btn btn-icon-only btn-sm"
                      onClick={() => {
                        setReadingModalBoiler(b);
                        setReadingForm({
                          pressure: (maxP * 0.8).toFixed(1),
                          temperature: "175",
                          water_level: "65",
                          status: "normal",
                        });
                      }}
                      title="Registrar nova medição"
                    >
                      ⚡
                    </button>
                    <button
                      className="btn btn-icon-only btn-sm"
                      onClick={() => setEditingBoiler(b)}
                      title="Editar informações cadastrais"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 1: ACESSO COMPLETO AOS DADOS DA CALDEIRA (DEEP DIVE) */}
      {/* ========================================================== */}
      {selectedBoiler && (
        <div className="modal-backdrop" onClick={() => setSelectedBoiler(null)}>
          <div
            className="modal-box modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div className="modal-title-with-badge">
                  <h2 className="modal-title">{selectedBoiler.name}</h2>
                  <span
                    className={`badge ${
                      readings[selectedBoiler.id]?.status ?? "desligada"
                    }`}
                  >
                    {
                      STATUS_LABELS[
                        readings[selectedBoiler.id]?.status ?? "desligada"
                      ]
                    }
                  </span>
                </div>
                <div className="modal-subtitle">
                  📍 {selectedBoiler.location || "Sem localização"} · ⚙️{" "}
                  {selectedBoiler.model || "Modelo não especificado"} · PMTA:{" "}
                  {selectedBoiler.max_pressure} kgf/cm²
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedBoiler(null)}
              >
                ✕
              </button>
            </div>

            {/* Abas do Modal de Dados */}
            <div className="modal-tabs">
              <button
                className={`tab-btn ${activeTab === "telemetria" ? "active" : ""}`}
                onClick={() => setActiveTab("telemetria")}
              >
                📡 Telemetria & Preditividade
              </button>
              <button
                className={`tab-btn ${activeTab === "historico" ? "active" : ""}`}
                onClick={() => setActiveTab("historico")}
              >
                📜 Histórico de Leituras
              </button>
              <button
                className={`tab-btn ${activeTab === "ficha" ? "active" : ""}`}
                onClick={() => setActiveTab("ficha")}
              >
                📋 Ficha Técnica & Dono
              </button>
              <button
                className={`tab-btn ${activeTab === "acoes" ? "active" : ""}`}
                onClick={() => setActiveTab("acoes")}
              >
                ⚙️ Ações do Proprietário
              </button>
            </div>

            <div className="modal-body">
              {/* ABA 1: Telemetria & Preditividade */}
              {activeTab === "telemetria" && (
                <div className="telemetry-deep-view">
                  {(() => {
                    const r = readings[selectedBoiler.id];
                    const maxP = selectedBoiler.max_pressure || 10.0;
                    const p = r?.pressure != null ? Number(r.pressure) : 0;
                    const t = r?.temperature != null ? Number(r.temperature) : 0;
                    const w = r?.water_level != null ? Number(r.water_level) : 0;
                    const pRatio = Math.round((p / maxP) * 100);
                    const margin = (maxP - p).toFixed(2);

                    return (
                      <>
                        <div className="telemetry-gauges-grid">
                          {/* Pressão */}
                          <div className="gauge-panel card">
                            <span className="gauge-label">Pressão Operacional</span>
                            <div className="gauge-value-display">
                              <span className="gauge-number">{p > 0 ? p : "--"}</span>
                              <span className="gauge-unit">kgf/cm²</span>
                            </div>
                            <div className="gauge-limit-info">
                              PMTA: <strong>{maxP} kgf/cm²</strong>
                            </div>
                            <div className="pmta-progress-track">
                              <div
                                className={`pmta-progress-bar ${
                                  pRatio > 90
                                    ? "danger"
                                    : pRatio > 75
                                    ? "warning"
                                    : "normal"
                                }`}
                                style={{ width: `${Math.min(100, pRatio)}%` }}
                              ></div>
                            </div>
                            <div className="gauge-footer-note">
                              Margem de Segurança:{" "}
                              <strong className={Number(margin) < 1 ? "text-danger" : "text-success"}>
                                {margin} kgf/cm²
                              </strong>
                            </div>
                          </div>

                          {/* Temperatura */}
                          <div className="gauge-panel card">
                            <span className="gauge-label">Temperatura do Vapor</span>
                            <div className="gauge-value-display">
                              <span className="gauge-number">{t > 0 ? t : "--"}</span>
                              <span className="gauge-unit">°C</span>
                            </div>
                            <div className="gauge-limit-info">
                              Faixa Nominal: <strong>150°C - 195°C</strong>
                            </div>
                            <div className="pmta-progress-track">
                              <div
                                className={`pmta-progress-bar ${
                                  t > 220 ? "danger" : t > 195 ? "warning" : "normal"
                                }`}
                                style={{
                                  width: `${Math.min(100, Math.round((t / 250) * 100))}%`,
                                }}
                              ></div>
                            </div>
                            <div className="gauge-footer-note">
                              {t > 200
                                ? "Superaquecimento moderado"
                                : "Gradiente térmico adequado"}
                            </div>
                          </div>

                          {/* Nível da Água */}
                          <div className="gauge-panel card">
                            <span className="gauge-label">Nível de Água (Visor)</span>
                            <div className="gauge-value-display">
                              <span className="gauge-number">{w > 0 ? w : "--"}</span>
                              <span className="gauge-unit">%</span>
                            </div>
                            <div className="gauge-limit-info">
                              Faixa Segura: <strong>45% a 80%</strong>
                            </div>
                            <div className="pmta-progress-track">
                              <div
                                className={`pmta-progress-bar ${
                                  w < 35 || w > 85
                                    ? "danger"
                                    : w < 45 || w > 80
                                    ? "warning"
                                    : "normal"
                                }`}
                                style={{ width: `${Math.min(100, w)}%` }}
                              ></div>
                            </div>
                            <div className="gauge-footer-note">
                              {w < 40
                                ? "Nível baixo: risco de queima de tubos"
                                : w > 85
                                ? "Nível alto: risco de arraste de água"
                                : "Volume de alimentação estável"}
                            </div>
                          </div>
                        </div>

                        {/* Diagnóstico Preditivo SafeLife AI */}
                        <div className="predictive-card card">
                          <div className="predictive-header">
                            <span className="predictive-badge">SafeLife AI Preditividade</span>
                            <span className="predictive-meta">Análise em Tempo Real</span>
                          </div>
                          <div className="predictive-body">
                            <div className="predictive-row">
                              <span className="pred-icon">🛡️</span>
                              <div>
                                <strong>Conformidade com Norma Regulamentadora NR-13:</strong>
                                <p>
                                  {p < maxP * 0.9
                                    ? "A pressão operacional encontra-se estritamente abaixo da PMTA calibrada de projeto. As válvulas de alívio e segurança estão operando com folga adequada."
                                    : "ATENÇÃO: A pressão de operação aproximou-se da pressão máxima de trabalho admissível. Recomenda-se aferir a válvula de segurança e o sistema de modulação do queimador."}
                                </p>
                              </div>
                            </div>

                            <div className="predictive-row">
                              <span className="pred-icon">🔬</span>
                              <div>
                                <strong>Previsão de Vida Útil e Fadiga Térmica:</strong>
                                <p>
                                  Cálculo baseado em ciclos térmicos: regime de operação com
                                  desgaste moderado. Sem picos abruptos de sobrepressão
                                  detectados nas últimas leituras.
                                </p>
                              </div>
                            </div>

                            <div className="predictive-row">
                              <span className="pred-icon">💡</span>
                              <div>
                                <strong>Recomendação Operacional:</strong>
                                <p>
                                  Manter drenagem de fundo (purga) periódica para controle de
                                  sólidos dissolvidos e inspeção do abrandador de água de
                                  alimentação.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* ABA 2: Histórico de Leituras */}
              {activeTab === "historico" && (
                <div className="history-view">
                  <div className="history-header">
                    <h3>Registros Recentes de Telemetria</h3>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleSimulateTelemetry(selectedBoiler)}
                    >
                      🎲 Simular Leitura (prévia)
                    </button>
                  </div>

                  {recentReadings.filter((r) => r.boiler_id === selectedBoiler.id).length === 0 ? (
                    <div className="empty-history">
                      <p>Nenhuma leitura registrada para esta caldeira ainda.</p>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSimulateTelemetry(selectedBoiler)}
                      >
                        Gerar Primeira Leitura
                      </button>
                    </div>
                  ) : (
                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Data / Horário</th>
                            <th>Pressão (kgf/cm²)</th>
                            <th>Temperatura (°C)</th>
                            <th>Nível de Água (%)</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentReadings
                            .filter((r) => r.boiler_id === selectedBoiler.id)
                            .map((r, idx) => (
                              <tr key={r.id || idx}>
                                <td>{new Date(r.created_at).toLocaleString("pt-BR")}</td>
                                <td>
                                  <strong>{r.pressure}</strong>
                                </td>
                                <td>{r.temperature}°C</td>
                                <td>{r.water_level}%</td>
                                <td>
                                  <span className={`badge ${r.status}`}>
                                    {STATUS_LABELS[r.status] || r.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ABA 3: Ficha Técnica & Dono */}
              {activeTab === "ficha" && (
                <div className="datasheet-view">
                  <div className="datasheet-grid">
                    <div className="datasheet-item card">
                      <span className="ds-label">Identificação do Equipamento</span>
                      <span className="ds-value">{selectedBoiler.name}</span>
                    </div>

                    <div className="datasheet-item card">
                      <span className="ds-label">PMTA (Pressão Máx. Trabalho Admissível)</span>
                      <span className="ds-value text-accent">
                        {selectedBoiler.max_pressure} kgf/cm²
                      </span>
                    </div>

                    <div className="datasheet-item card">
                      <span className="ds-label">Modelo / Tipo de Caldeira</span>
                      <span className="ds-value">{selectedBoiler.model || "Não informado"}</span>
                    </div>

                    <div className="datasheet-item card">
                      <span className="ds-label">Localização / Setor</span>
                      <span className="ds-value">
                        {selectedBoiler.location || "Não informada"}
                      </span>
                    </div>

                    <div className="datasheet-item card">
                      <span className="ds-label">Proprietário / Responsável</span>
                      <span className="ds-value">{user.fullName}</span>
                      <small className="text-muted">{user.email}</small>
                    </div>

                    <div className="datasheet-item card">
                      <span className="ds-label">Empresa / Unidade</span>
                      <span className="ds-value">{user.companyName}</span>
                    </div>

                    <div className="datasheet-item card">
                      <span className="ds-label">ID do Sistema (UUID)</span>
                      <span className="ds-code">{selectedBoiler.id}</span>
                    </div>

                    <div className="datasheet-item card">
                      <span className="ds-label">Data de Cadastro no SafeLife AI</span>
                      <span className="ds-value">
                        {selectedBoiler.created_at
                          ? new Date(selectedBoiler.created_at).toLocaleDateString("pt-BR")
                          : "--"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 4: Ações do Proprietário */}
              {activeTab === "acoes" && (
                <div className="actions-tab-view">
                  <div className="action-card card">
                    <h3>⚡ Registrar Leitura Manual do Sensor</h3>
                    <p className="sub">
                      Insira dados manuais de inspeção física ou teste de instrumentos.
                    </p>
                    <form onSubmit={handleAddReading} className="compact-form">
                      <div className="form-row-3">
                        <div className="form-group">
                          <label className="input-label">Pressão (kgf/cm²)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={readingForm.pressure}
                            onChange={(e) =>
                              setReadingForm({ ...readingForm, pressure: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="input-label">Temperatura (°C)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={readingForm.temperature}
                            onChange={(e) =>
                              setReadingForm({ ...readingForm, temperature: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="input-label">Nível de Água (%)</label>
                          <input
                            type="number"
                            step="1"
                            value={readingForm.water_level}
                            onChange={(e) =>
                              setReadingForm({ ...readingForm, water_level: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label className="input-label">Status Operacional</label>
                          <select
                            value={readingForm.status}
                            onChange={(e) =>
                              setReadingForm({ ...readingForm, status: e.target.value })
                            }
                            className="select-input"
                          >
                            <option value="normal">Normal (Operação estável)</option>
                            <option value="atencao">Atenção (Requer verificação)</option>
                            <option value="alarme">Alarme (Condição de perigo)</option>
                            <option value="desligada">Desligada / Manutenção</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ display: "flex", alignItems: "flex-end" }}>
                          <button
                            type="submit"
                            className="btn btn-primary btn-block"
                          >
                            Atualizar Prévia
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  <div className="action-card card" style={{ marginTop: 16 }}>
                    <h3>🔧 Gerenciamento do Equipamento</h3>
                    <p className="sub">
                      Altere dados cadastrais ou remova a caldeira da sua conta.
                    </p>
                    <div className="danger-zone-actions">
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setEditingBoiler(selectedBoiler);
                          setSelectedBoiler(null);
                        }}
                      >
                        ✏️ Editar Informações da Caldeira
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteBoiler(selectedBoiler.id)}
                      >
                        🗑️ Excluir esta Caldeira
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedBoiler(null)}
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 2: CADASTRAR NOVA CALDEIRA                           */}
      {/* ========================================================== */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Cadastrar Nova Caldeira</h2>
                <p className="modal-subtitle">
                  Vincule um novo equipamento à sua conta de proprietário ({user.fullName})
                </p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBoiler}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="input-label">Nome / Identificação da Caldeira *</label>
                  <input
                    type="text"
                    placeholder="Ex: Caldeira 02 - Setor Industrial"
                    value={boilerForm.name}
                    onChange={(e) =>
                      setBoilerForm({ ...boilerForm, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="input-label">Localização / Casa de Máquinas</label>
                  <input
                    type="text"
                    placeholder="Ex: Pavilhão Sul - Bloco B"
                    value={boilerForm.location}
                    onChange={(e) =>
                      setBoilerForm({ ...boilerForm, location: e.target.value })
                    }
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="input-label">Modelo / Fabricante</label>
                    <input
                      type="text"
                      placeholder="Ex: Flamotubular 15 ton/h"
                      value={boilerForm.model}
                      onChange={(e) =>
                        setBoilerForm({ ...boilerForm, model: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="input-label">PMTA (kgf/cm²) *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      placeholder="Ex: 10.5"
                      value={boilerForm.max_pressure}
                      onChange={(e) =>
                        setBoilerForm({ ...boilerForm, max_pressure: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={boilerForm.createInitialReading}
                      onChange={(e) =>
                        setBoilerForm({
                          ...boilerForm,
                          createInitialReading: e.target.checked,
                        })
                      }
                    />
                    <span>Gerar primeira leitura de telemetria inicial em operação normal</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Atualizar Prévia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 3: EDITAR CALDEIRA EXISTENTE                         */}
      {/* ========================================================== */}
      {editingBoiler && (
        <div className="modal-backdrop" onClick={() => setEditingBoiler(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Editar Caldeira</h2>
                <p className="modal-subtitle">Atualize as informações cadastrais do equipamento</p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setEditingBoiler(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateBoiler}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="input-label">Nome da Caldeira *</label>
                  <input
                    type="text"
                    value={editingBoiler.name}
                    onChange={(e) =>
                      setEditingBoiler({ ...editingBoiler, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="input-label">Localização</label>
                  <input
                    type="text"
                    value={editingBoiler.location || ""}
                    onChange={(e) =>
                      setEditingBoiler({ ...editingBoiler, location: e.target.value })
                    }
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="input-label">Modelo</label>
                    <input
                      type="text"
                      value={editingBoiler.model || ""}
                      onChange={(e) =>
                        setEditingBoiler({ ...editingBoiler, model: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="input-label">PMTA (kgf/cm²) *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      value={editingBoiler.max_pressure || 10}
                      onChange={(e) =>
                        setEditingBoiler({
                          ...editingBoiler,
                          max_pressure: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingBoiler(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Atualizar Prévia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 4: REGISTRAR LEITURA RÁPIDA                          */}
      {/* ========================================================== */}
      {readingModalBoiler && (
        <div className="modal-backdrop" onClick={() => setReadingModalBoiler(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Nova Leitura de Telemetria</h2>
                <p className="modal-subtitle">
                  Caldeira: <strong>{readingModalBoiler.name}</strong> (PMTA:{" "}
                  {readingModalBoiler.max_pressure} kgf/cm²)
                </p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setReadingModalBoiler(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReading}>
              <div className="modal-body">
                <div className="form-row-3">
                  <div className="form-group">
                    <label className="input-label">Pressão (kgf/cm²)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={readingForm.pressure}
                      onChange={(e) =>
                        setReadingForm({ ...readingForm, pressure: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="input-label">Temperatura (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={readingForm.temperature}
                      onChange={(e) =>
                        setReadingForm({ ...readingForm, temperature: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="input-label">Nível de Água (%)</label>
                    <input
                      type="number"
                      step="1"
                      value={readingForm.water_level}
                      onChange={(e) =>
                        setReadingForm({ ...readingForm, water_level: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="input-label">Status Operacional</label>
                  <select
                    value={readingForm.status}
                    onChange={(e) =>
                      setReadingForm({ ...readingForm, status: e.target.value })
                    }
                    className="select-input"
                  >
                    <option value="normal">Normal (Operação estável)</option>
                    <option value="atencao">Atenção (Requer verificação)</option>
                    <option value="alarme">Alarme (Condição de perigo)</option>
                    <option value="desligada">Desligada / Manutenção</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setReadingModalBoiler(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Atualizar Prévia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
