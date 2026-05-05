/* ═══════════════════════════════════
   Tab 02: FEATURE_ENG
   Technical indicators visualization
   ═══════════════════════════════════ */

import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Area, ComposedChart,
} from "recharts";
import type { PipelineResponse } from "../types";
import { InfoButton } from "../components/InfoButton";

const fmtDate = (v: string) => {
  const d = new Date(v);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
};

const tipStyle = {
  backgroundColor: "#121212",
  border: "1px solid #333",
  borderRadius: 0,
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 10,
};

interface Props {
  data: PipelineResponse;
}

export function TabFeatureEng({ data }: Props) {
  const fs = data.feature_series;
  const interval = Math.floor(fs.length / 8);

  return (
    <div>
      {/* Info */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card__label">Features Calculadas</div>
          <div className="metric-card__value metric-card__value--green">10</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label">Registros Válidos</div>
          <div className="metric-card__value metric-card__value--cyan">{data.clean_days}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label">NaN Removidos</div>
          <div className="metric-card__value metric-card__value--amber">{data.total_days - data.clean_days}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label">Módulos Utilizados</div>
          <div className="metric-card__value">3</div>
          <div className="metric-card__sub">moving_averages · volatility · momentum</div>
        </div>
      </div>

      {/* SMA/EMA */}
      <div className="chart-panel">
        <div className="chart-panel__header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="chart-panel__title">Médias Móveis — SMA(10,50) + EMA(12,26)</span>
            <InfoButton id="SMA" />
            <InfoButton id="EMA" />
          </div>
          <span className="chart-panel__meta">core_quant.features.moving_averages</span>
        </div>
        <div className="chart-panel__body">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={fs}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 9, fill: "#666" }} interval={interval} />
              <YAxis tick={{ fontSize: 9, fill: "#666" }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={tipStyle} labelFormatter={(v: string) => v} />
              <Line type="monotone" dataKey="close" stroke="#555" strokeWidth={1} dot={false} name="Close" />
              <Line type="monotone" dataKey="SMA_10" stroke="#00ff88" strokeWidth={1.2} dot={false} name="SMA(10)" />
              <Line type="monotone" dataKey="SMA_50" stroke="#ff2d55" strokeWidth={1.2} dot={false} name="SMA(50)" />
              <Line type="monotone" dataKey="EMA_12" stroke="#00d4ff" strokeWidth={1} dot={false} strokeDasharray="4 2" name="EMA(12)" />
              <Line type="monotone" dataKey="EMA_26" stroke="#ffb800" strokeWidth={1} dot={false} strokeDasharray="4 2" name="EMA(26)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RSI */}
      <div className="chart-panel">
        <div className="chart-panel__header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="chart-panel__title">RSI — Relative Strength Index (14)</span>
            <InfoButton id="RSI" />
          </div>
          <span className="chart-panel__meta">core_quant.features.momentum</span>
        </div>
        <div className="chart-panel__body">
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={fs}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 9, fill: "#666" }} interval={interval} />
              <YAxis tick={{ fontSize: 9, fill: "#666" }} domain={[0, 100]} ticks={[0, 30, 50, 70, 100]} />
              <Tooltip contentStyle={tipStyle} labelFormatter={(v: string) => v} />
              <ReferenceLine y={70} stroke="#ff2d55" strokeDasharray="3 3" label={{ value: "Overbought", fill: "#ff2d55", fontSize: 9 }} />
              <ReferenceLine y={30} stroke="#00ff88" strokeDasharray="3 3" label={{ value: "Oversold", fill: "#00ff88", fontSize: 9 }} />
              <Line type="monotone" dataKey="RSI" stroke="#ffb800" strokeWidth={1.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bollinger Bands */}
      <div className="chart-panel">
        <div className="chart-panel__header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="chart-panel__title">Bandas de Bollinger (20, 2σ)</span>
            <InfoButton id="BOLLINGER" />
          </div>
          <span className="chart-panel__meta">core_quant.features.volatility</span>
        </div>
        <div className="chart-panel__body">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={fs}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 9, fill: "#666" }} interval={interval} />
              <YAxis tick={{ fontSize: 9, fill: "#666" }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={tipStyle} labelFormatter={(v: string) => v} />
              <Line type="monotone" dataKey="BB_upper" stroke="#444" strokeWidth={1} dot={false} strokeDasharray="2 2" name="BB Upper" />
              <Line type="monotone" dataKey="BB_lower" stroke="#444" strokeWidth={1} dot={false} strokeDasharray="2 2" name="BB Lower" />
              <Line type="monotone" dataKey="BB_mid" stroke="#00d4ff" strokeWidth={1} dot={false} name="BB Mid (SMA 20)" />
              <Line type="monotone" dataKey="close" stroke="#00ff88" strokeWidth={1.5} dot={false} name="Close" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BB Width */}
      <div className="grid-2">
        <div className="chart-panel">
          <div className="chart-panel__header">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="chart-panel__title">BB Width (Volatilidade)</span>
              <InfoButton id="BB_WIDTH" />
            </div>
          </div>
          <div className="chart-panel__body">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={fs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 9, fill: "#666" }} interval={interval} />
                <YAxis tick={{ fontSize: 9, fill: "#666" }} />
                <Tooltip contentStyle={tipStyle} labelFormatter={(v: string) => v} />
                <Line type="monotone" dataKey="BB_width" stroke="#ff2d55" strokeWidth={1.2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-panel">
          <div className="chart-panel__header">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="chart-panel__title">%B (Posição nas Bandas)</span>
              <InfoButton id="BB_PCT" />
            </div>
          </div>
          <div className="chart-panel__body">
            <ResponsiveContainer width="100%" height={180}>
              <ComposedChart data={fs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 9, fill: "#666" }} interval={interval} />
                <YAxis tick={{ fontSize: 9, fill: "#666" }} domain={[0, 1]} />
                <Tooltip contentStyle={tipStyle} labelFormatter={(v: string) => v} />
                <ReferenceLine y={1} stroke="#ff2d55" strokeDasharray="2 2" />
                <ReferenceLine y={0} stroke="#00ff88" strokeDasharray="2 2" />
                <ReferenceLine y={0.5} stroke="#333" strokeDasharray="2 2" />
                <Line type="monotone" dataKey="BB_pct" stroke="#00d4ff" strokeWidth={1.2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
