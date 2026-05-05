/* ═══════════════════════════════════
   Main App — Quant Terminal 1.1
   ═══════════════════════════════════ */

import { useState } from "react";
import { runPipeline, searchTickers, type SearchResult } from "./api";
import { supabase } from "./lib/supabase";
import type { PipelineResponse, LoadState, TabId } from "./types";

import { TabDataFetch } from "./tabs/TabDataFetch";
import { TabFeatureEng } from "./tabs/TabFeatureEng";
import { TabModelTrain } from "./tabs/TabModelTrain";
import { TabAnalytics } from "./tabs/TabAnalytics";
import { TabSaved } from "./tabs/TabSaved";
import { TerminalLog } from "./components/TerminalLog";

const TABS: { id: TabId; label: string; index: string }[] = [
  { id: "DATA_FETCH", label: "DATA_FETCH", index: "01" },
  { id: "FEATURE_ENG", label: "FEATURE_ENG", index: "02" },
  { id: "MODEL_TRAIN", label: "MODEL_TRAIN", index: "03" },
  { id: "ANALYTICS", label: "ANALYTICS", index: "04" },
  { id: "SAVED", label: "SAVED_RESULTS", index: "05" },
];

export default function App() {
  const [tab, setTab] = useState<TabId>("DATA_FETCH");
  const [menuOpen, setMenuOpen] = useState(false);
  const [ticker, setTicker] = useState("PETR4.SA");
  const [period, setPeriod] = useState("2y");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("PETR4.SA");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState("");
  const [data, setData] = useState<PipelineResponse | null>(null);

  const handleRun = async () => {
    setState("loading");
    setError("");
    setData(null);
    setTab("DATA_FETCH");

    try {
      const result = await runPipeline(ticker, period, startDate, endDate);
      setData(result);
      setState("success");
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
      setState("error");
    }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    setTicker(q);  // atualiza ticker imediatamente para que Execute use o valor digitado
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const results = await searchTickers(q);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSave = async () => {
    if (!supabase || !data) {
      alert("❌ Supabase não configurado.");
      return;
    }
    try {
      const { error } = await supabase.from("saved_pipelines").insert([{
        ticker: data.ticker,
        period: period || `${startDate} → ${endDate}`,
      }]);
      if (error) throw error;
      alert("✅ Pipeline salvo nos favoritos!");
    } catch (err: any) {
      alert("❌ Erro ao salvar: " + err.message);
    }
  };

  const handleLoadSaved = async (savedTicker: string, savedPeriod: string) => {
    // Atualiza os controles
    setTicker(savedTicker);
    setSearchQuery(savedTicker);
    setPeriod(savedPeriod);
    setStartDate("");
    setEndDate("");
    setTab("DATA_FETCH");

    // Executa o pipeline automaticamente
    setState("loading");
    setError("");
    setData(null);
    try {
      const result = await runPipeline(savedTicker, savedPeriod);
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
              !canNavigate && t.id !== "DATA_FETCH" && t.id !== "SAVED" ? "tab-nav__item--disabled" : ""
            }`}
            onClick={() => {
              if (canNavigate || t.id === "DATA_FETCH" || t.id === "SAVED") {
                setTab(t.id);
                // setMenuOpen(false); // Opcional: fechar ao clicar
              }
            }}
            disabled={!canNavigate && t.id !== "DATA_FETCH" && t.id !== "SAVED"}
          >
            <span className="tab-nav__index">{t.index}.</span>
            {t.label}
          </button>
        ))}
      </nav>

      {/* ── Controls Bar ── */}
      <div className="controls">
        <div className="controls__group" style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <span className="controls__label">Ativo</span>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              className="controls__input"
              style={{ width: '100%' }}
              placeholder="Buscar ticker (ex: AAPL, BTC-USD...)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={(e) => e.target.select()}
              onBlur={() => setTimeout(() => setSearchResults([]), 200)}
            />
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((res) => (
                  <div
                    key={res.symbol}
                    className="search-results__item"
                    onClick={() => {
                      setTicker(res.symbol);
                      setSearchQuery(res.symbol);
                      setSearchResults([]);
                    }}
                  >
                    <span className="search-results__symbol">{res.symbol}</span>
                    <span className="search-results__name">{res.shortname}</span>
                    <span className="search-results__exch">{res.exchDisp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="controls__separator" />

        <div className="controls__group">
          <span className="controls__label">Período</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              type="date"
              className="controls__input controls__input--date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPeriod(""); // Clear fixed period if custom dates are used
              }}
            />
            <span style={{ color: '#666' }}>→</span>
            <input
              type="date"
              className="controls__input controls__input--date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPeriod("");
              }}
            />
          </div>
        </div>

        <div className="controls__group">
          <select
            className="controls__select"
            style={{ paddingRight: 20, width: 80 }}
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value);
              setStartDate("");
              setEndDate("");
            }}
          >
            <option value="">Custom</option>
            <option value="1y">1Y</option>
            <option value="2y">2Y</option>
            <option value="5y">5Y</option>
          </select>
        </div>

        <div className="controls__separator" />

        <button
          className={`controls__btn ${state === "loading" ? "controls__btn--loading" : ""}`}
          onClick={handleRun}
          disabled={state === "loading" || !ticker}
        >
          {state === "loading" ? "⟳ PROCESSANDO..." : "▸ EXECUTAR"}
        </button>

        {data && (
          <button
            className="controls__btn"
            style={{ marginLeft: 8, background: '#1a1a1a', borderColor: '#444' }}
            onClick={handleSave}
          >
            💾 SALVAR
          </button>
        )}

        {data && (
          <span className="controls__meta">
            {data.ticker} · {data.clean_days} registros
          </span>
        )}
      </div>

      {/* ── Main Content ── */}
      <div className="main">
        <div className="content">
          {state === "idle" && tab !== "SAVED" && (
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

          {(state === "success" || tab === "SAVED") && (
            <>
              {tab === "DATA_FETCH" && data && <TabDataFetch data={data} />}
              {tab === "FEATURE_ENG" && data && <TabFeatureEng data={data} />}
              {tab === "MODEL_TRAIN" && data && <TabModelTrain data={data} />}
              {tab === "ANALYTICS" && data && <TabAnalytics data={data} />}
              {tab === "SAVED" && <TabSaved onLoad={handleLoadSaved} />}
            </>
          )}
        </div>
      </div>

      {/* ── Terminal Footer ── */}
      <TerminalLog />
    </div>
  );
}
