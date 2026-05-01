/* ═══════════════════════════════════
   Tab 01: DATA_FETCH
   Raw price data, volume, and table
   ═══════════════════════════════════ */

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { PipelineResponse } from "../types";

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

export function TabDataFetch({ data }: Props) {
  const raw = data.raw_series;
  const last20 = raw.slice(-20);

  return (
    <div>
      {/* Metric cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card__label">Total Registros</div>
          <div className="metric-card__value metric-card__value--cyan">{data.total_days}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label">Período</div>
          <div className="metric-card__value">{data.period}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label">Início</div>
          <div className="metric-card__value" style={{ fontSize: 14 }}>{data.date_range.start}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label">Fim</div>
          <div className="metric-card__value" style={{ fontSize: 14 }}>{data.date_range.end}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label">Último Close</div>
          <div className="metric-card__value metric-card__value--green">
            {raw[raw.length - 1]?.close.toFixed(2)}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label">Volume Médio</div>
          <div className="metric-card__value" style={{ fontSize: 14 }}>
            {(raw.reduce((s, r) => s + r.volume, 0) / raw.length / 1e6).toFixed(1)}M
          </div>
        </div>
      </div>

      {/* Close Price Chart */}
      <div className="chart-panel">
        <div className="chart-panel__header">
          <span className="chart-panel__title">Preço de Fechamento (Close)</span>
          <span className="chart-panel__meta">{data.ticker} · {raw.length} data points</span>
        </div>
        <div className="chart-panel__body">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={raw}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 9, fill: "#666" }} interval={Math.floor(raw.length / 8)} />
              <YAxis tick={{ fontSize: 9, fill: "#666" }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={tipStyle} labelFormatter={(v: string) => v} />
              <Line type="monotone" dataKey="close" stroke="#00ff88" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="chart-panel">
        <div className="chart-panel__header">
          <span className="chart-panel__title">Volume de Negociação</span>
          <span className="chart-panel__meta">barras diárias</span>
        </div>
        <div className="chart-panel__body">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={raw}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 9, fill: "#666" }} interval={Math.floor(raw.length / 8)} />
              <YAxis tick={{ fontSize: 9, fill: "#666" }} tickFormatter={(v: number) => `${(v / 1e6).toFixed(0)}M`} />
              <Tooltip contentStyle={tipStyle} labelFormatter={(v: string) => v} />
              <Bar dataKey="volume" fill="#00d4ff" opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Raw Data Table */}
      <div className="section">
        <div className="section__header">
          <span className="section__title">Dados Brutos</span>
          <span className="section__subtitle">Últimos 20 registros</span>
        </div>
        <div className="data-table-wrapper" style={{ maxHeight: 320 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Open</th>
                <th>High</th>
                <th>Low</th>
                <th>Close</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              {last20.map((r) => (
                <tr key={r.date}>
                  <td>{r.date}</td>
                  <td>{r.open.toFixed(2)}</td>
                  <td>{r.high.toFixed(2)}</td>
                  <td>{r.low.toFixed(2)}</td>
                  <td style={{ color: "#00ff88", fontWeight: 600 }}>{r.close.toFixed(2)}</td>
                  <td>{r.volume.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
