/* Tab 04: ANALYTICS */

import { useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import type { PipelineResponse } from "../types";
import { InfoButton } from "../components/InfoButton";

const tipStyle = {
  backgroundColor: "#121212",
  border: "1px solid #333",
  borderRadius: 0,
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 10,
};

interface Props { data: PipelineResponse; }

export function TabAnalytics({ data }: Props) {
  const { metrics, test_series: ts } = data;
  const fmtD = (v: string) => { const d = new Date(v); return `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}`; };

  const residualBins = useMemo(() => {
    const residuals = ts.map(t => t.residual);
    const min = Math.min(...residuals);
    const max = Math.max(...residuals);
    const binCount = 20;
    const binWidth = (max - min) / binCount || 1;
    const bins: { range: string; count: number }[] = [];
    for (let i = 0; i < binCount; i++) {
      const lo = min + i * binWidth;
      const hi = lo + binWidth;
      bins.push({
        range: lo.toFixed(1),
        count: residuals.filter(r => r >= lo && (i < binCount - 1 ? r < hi : r <= hi)).length,
      });
    }
    return bins;
  }, [ts]);

  const r2Color = metrics.r2 >= 0.7 ? "--accent-green" : metrics.r2 >= 0.4 ? "--accent-amber" : "--accent-red";

  return (
    <div>
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card__label" style={{ display: 'flex', alignItems: 'center' }}>
            MSE <InfoButton id="MSE" />
          </div>
          <div className="metric-card__value">{metrics.mse.toFixed(4)}</div>
          <div className="metric-card__sub">Mean Squared Error</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label" style={{ display: 'flex', alignItems: 'center' }}>
            R² <InfoButton id="R2" />
          </div>
          <div className="metric-card__value" style={{color:`var(${r2Color})`}}>{metrics.r2.toFixed(4)}</div>
          <div className="metric-card__sub">Coeficiente de Determinação</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label" style={{ display: 'flex', alignItems: 'center' }}>
            MAPE <InfoButton id="MAPE" />
          </div>
          <div className="metric-card__value metric-card__value--amber">{metrics.mape.toFixed(2)}%</div>
          <div className="metric-card__sub">Mean Abs % Error</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label" style={{ display: 'flex', alignItems: 'center' }}>
            RMSE <InfoButton id="MSE" />
          </div>
          <div className="metric-card__value">{Math.sqrt(metrics.mse).toFixed(4)}</div>
          <div className="metric-card__sub">Root MSE</div>
        </div>
      </div>

      {/* Real vs Predicted */}
      <div className="chart-panel">
        <div className="chart-panel__header">
          <span className="chart-panel__title">Preço Real vs. Previsto (Test Set)</span>
          <span className="chart-panel__meta">{ts.length} amostras</span>
        </div>
        <div className="chart-panel__body">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333"/>
              <XAxis dataKey="date" tickFormatter={fmtD} tick={{fontSize:9,fill:"#666"}} interval={Math.floor(ts.length/8)}/>
              <YAxis tick={{fontSize:9,fill:"#666"}} domain={["auto","auto"]}/>
              <Tooltip contentStyle={tipStyle} labelFormatter={(v:string)=>v}/>
              <Line type="monotone" dataKey="real" stroke="#e0e0e0" strokeWidth={1.5} dot={false} name="Real"/>
              <Line type="monotone" dataKey="predicted" stroke="#00ff88" strokeWidth={2} dot={false} name="Previsto"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2">
        {/* Residuals */}
        <div className="chart-panel">
          <div className="chart-panel__header">
            <span className="chart-panel__title">Resíduos (Real - Previsto)</span>
          </div>
          <div className="chart-panel__body">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={ts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333"/>
                <XAxis dataKey="date" tickFormatter={fmtD} tick={{fontSize:9,fill:"#666"}} interval={Math.floor(ts.length/6)}/>
                <YAxis tick={{fontSize:9,fill:"#666"}}/>
                <Tooltip contentStyle={tipStyle} labelFormatter={(v:string)=>v}/>
                <ReferenceLine y={0} stroke="#444"/>
                <Line type="monotone" dataKey="residual" stroke="#ff2d55" strokeWidth={1} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Residual Histogram */}
        <div className="chart-panel">
          <div className="chart-panel__header">
            <span className="chart-panel__title">Distribuição dos Resíduos</span>
          </div>
          <div className="chart-panel__body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={residualBins}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333"/>
                <XAxis dataKey="range" tick={{fontSize:8,fill:"#666"}} interval={2}/>
                <YAxis tick={{fontSize:9,fill:"#666"}}/>
                <Tooltip contentStyle={tipStyle}/>
                <Bar dataKey="count" fill="#00d4ff" opacity={0.6}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="analysis-block">
        <div className="analysis-block__title">Análise dos Resultados</div>
        <p>
          O modelo de Regressão Linear foi treinado com <code>{data.train_range.count}</code> amostras
          e avaliado em <code>{data.test_range.count}</code> amostras do conjunto de teste.
        </p>
        <p>
          O coeficiente R² de <code>{metrics.r2.toFixed(4)}</code> indica que o modelo
          {metrics.r2 >= 0.7 ? " explica bem" : metrics.r2 >= 0.4 ? " explica parcialmente" : " tem dificuldade em explicar"} a
          variância dos preços. O MAPE de <code>{metrics.mape.toFixed(2)}%</code> mostra o erro
          percentual médio das predições.
        </p>
        <p>
          A análise de resíduos revela {Math.abs(ts.reduce((s,t)=>s+t.residual,0)/ts.length) < 1
            ? "baixo viés (média dos resíduos próxima de zero)"
            : "possível viés no modelo"}.
          A distribuição dos resíduos deve idealmente se aproximar de uma distribuição normal para
          validar as premissas da regressão linear.
        </p>
      </div>
    </div>
  );
}
