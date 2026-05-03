/* ═══════════════════════════════════
   Main App — Quant Terminal 1.1
   ═══════════════════════════════════ */

import { useState } from "react";
import { runPipeline, TICKERS } from "./api";
import type { PipelineResponse, LoadState, TabId } from "./types";

import { TabDataFetch } from "./tabs/TabDataFetch";
import { TabFeatureEng } from "./tabs/TabFeatureEng";
import { TabModelTrain } from "./tabs/TabModelTrain";
import { TabAnalytics } from "./tabs/TabAnalytics";
import { TerminalLog } from "./components/TerminalLog";

const TABS: { id: TabId; label: string; index: string }[] = [
  { id: "DATA_FETCH", label: "DATA_FETCH", index: "01" },
  { id: "FEATURE_ENG", label: "FEATURE_ENG", index: "02" },
  { id: "MODEL_TRAIN", label: "MODEL_TRAIN", index: "03" },
  { id: "ANALYTICS", label: "ANALYTICS", index: "04" },
];

const allTickers = [...TICKERS.BR, ...TICKERS.US];

export default function App() {
  const [tab, setTab] = useState<TabId>("DATA_FETCH");
  const [menuOpen, setMenuOpen] = useState(false);
  const [ticker, setTicker] = useState(allTickers[0]);
  const [period, setPeriod] = useState("2y");
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState("");
  const [data, setData] = useState<PipelineResponse | null>(null);

  const handleRun = async () => {
    setState("loading");
    setError("");
    setData(null);
    setTab("DATA_FETCH");

    try {
      const result = await runPipeline(ticker, period);
      setData(result);
      setState("success");
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
      setState("error");
    }
  };

  const canNavigate = state === "success" && data !== null;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* ── Header ── */}
      <header className="header">
        <div className="header__left">
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} title="Alternar Menu">
            {menuOpen ? "✕" : "☰"}
          </button>
          <div className="header__title">
            <span className="header__title-accent">▸</span>
            <span>1.1. Previsão de Preços com Regressão Linear & Features de Mercado.</span>
          </div>
        </div>
        <div className="header__status">
          <span>{new Date().toLocaleDateString("pt-BR")}</span>
          <div className="header__dot" />
          <span style={{ fontSize: '10px' }}>arthursantana06-quant-finance/1.1-Linear-Regression</span>
        </div>
      </header>

      {/* ── Tab Navigation ── */}
      <nav className={`tab-nav ${menuOpen ? "tab-nav--open" : ""}`}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-nav__item ${tab === t.id ? "tab-nav__item--active" : ""} ${
              !canNavigate && t.id !== "DATA_FETCH" ? "tab-nav__item--disabled" : ""
            }`}
            onClick={() => {
              if (canNavigate || t.id === "DATA_FETCH") {
                setTab(t.id);
                // setMenuOpen(false); // Opcional: fechar ao clicar
              }
            }}
            disabled={!canNavigate && t.id !== "DATA_FETCH"}
          >
            <span className="tab-nav__index">{t.index}.</span>
            {t.label}
          </button>
        ))}
      </nav>

      {/* ── Controls Bar ── */}
      <div className="controls">
        <div className="controls__group">
          <span className="controls__label">Ativo</span>
          <select
            className="controls__select"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            disabled={state === "loading"}
          >
            <optgroup label="🇧🇷 Brasil">
              {TICKERS.BR.map((t) => <option key={t} value={t}>{t}</option>)}
            </optgroup>
            <optgroup label="🇺🇸 EUA">
              {TICKERS.US.map((t) => <option key={t} value={t}>{t}</option>)}
            </optgroup>
          </select>
        </div>

        <div className="controls__separator" />

        <div className="controls__group">
          <span className="controls__label">Período</span>
          <select
            className="controls__select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            disabled={state === "loading"}
          >
            <option value="1y">1 ano</option>
            <option value="2y">2 anos</option>
            <option value="5y">5 anos</option>
          </select>
        </div>

        <div className="controls__separator" />

        <button
          className={`controls__btn ${state === "loading" ? "controls__btn--loading" : ""}`}
          onClick={handleRun}
          disabled={state === "loading"}
        >
          {state === "loading" ? "⟳ PROCESSANDO..." : "▸ EXECUTAR PIPELINE"}
        </button>

        {data && (
          <span className="controls__meta">
            {data.ticker} · {data.total_days} registros · {data.clean_days} válidos
          </span>
        )}
      </div>

      {/* ── Main Content ── */}
      <div className="main">
        <div className="content">
          {state === "idle" && (
            <div className="empty-state">
              <div className="empty-state__icon">⟐</div>
              <div className="empty-state__text">Selecione um ativo e execute o pipeline</div>
              <div className="empty-state__hint">
                O sistema irá baixar dados via yfinance, calcular indicadores técnicos,
                treinar uma regressão linear e avaliar o modelo.
              </div>
            </div>
          )}

          {state === "loading" && (
            <div className="loading-overlay">
              <div className="loading-spinner" />
              <div className="loading-text">Executando pipeline para {ticker}...</div>
              <div style={{ fontSize: 10, color: "#666", marginTop: 8 }}>
                Acompanhe o progresso no terminal abaixo
              </div>
            </div>
          )}

          {state === "error" && (
            <div>
              <div className="error-box">
                <div className="error-box__title">Pipeline Error</div>
                <div className="error-box__msg">{error}</div>
              </div>
            </div>
          )}

          {state === "success" && data && (
            <>
              {tab === "DATA_FETCH" && <TabDataFetch data={data} />}
              {tab === "FEATURE_ENG" && <TabFeatureEng data={data} />}
              {tab === "MODEL_TRAIN" && <TabModelTrain data={data} />}
              {tab === "ANALYTICS" && <TabAnalytics data={data} />}
            </>
          )}
        </div>
      </div>

      {/* ── Terminal Footer ── */}
      <TerminalLog />
    </div>
  );
}
