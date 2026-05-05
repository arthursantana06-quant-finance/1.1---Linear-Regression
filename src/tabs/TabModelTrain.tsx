/* Tab 03: MODEL_TRAIN */

import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, LineChart, Line,
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

export function TabModelTrain({ data }: Props) {
  const maxAbs = Math.max(...data.coefficients.map((c) => c.abs_coefficient));
  const fmtD = (v: string) => { const d = new Date(v); return `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}`; };

  return (
    <div>
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card__label" style={{ display: 'flex', alignItems: 'center' }}>
            Modelo <InfoButton id="LINEAR_REGRESSION" />
          </div>
          <div className="metric-card__value" style={{fontSize:14}}>LinearRegression</div>
          <div className="metric-card__sub">sklearn.linear_model</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label" style={{ display: 'flex', alignItems: 'center' }}>
            Normalização <InfoButton id="STANDARD_SCALER" />
          </div>
          <div className="metric-card__value" style={{fontSize:14}}>StandardScaler</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label">Train</div>
          <div className="metric-card__value metric-card__value--cyan">{data.train_range.count}</div>
          <div className="metric-card__sub">{data.train_range.start} → {data.train_range.end}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label">Test</div>
          <div className="metric-card__value metric-card__value--amber">{data.test_range.count}</div>
          <div className="metric-card__sub">{data.test_range.start} → {data.test_range.end}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label">Features</div>
          <div className="metric-card__value metric-card__value--green">{data.coefficients.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label">Intercepto (β₀)</div>
          <div className="metric-card__value">{data.intercept.toFixed(4)}</div>
        </div>
      </div>

      <div className="chart-panel">
        <div className="chart-panel__header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="chart-panel__title">Feature Importance (|β|)</span>
            <InfoButton id="LINEAR_REGRESSION" />
          </div>
        </div>
        <div className="chart-panel__body">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.coefficients} layout="vertical" margin={{left:80}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false}/>
              <XAxis type="number" tick={{fontSize:9,fill:"#666"}}/>
              <YAxis type="category" dataKey="feature" tick={{fontSize:10,fill:"#a0a0a0"}} width={75}/>
              <Tooltip contentStyle={tipStyle}/>
              <Bar dataKey="coefficient" name="Coeficiente">
                {data.coefficients.map((c,i)=>(<Cell key={i} fill={c.coefficient>=0?"#00ff88":"#ff2d55"} opacity={0.8}/>))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="section">
        <div className="section__header">
          <span className="section__title">Coeficientes</span>
          <span className="section__badge section__badge--success">TRAINED</span>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>Feature</th><th>β</th><th>|β|</th><th>Magnitude</th></tr></thead>
            <tbody>
              {data.coefficients.map((c)=>(
                <tr key={c.feature}>
                  <td style={{color:"#00d4ff",fontWeight:600}}>{c.feature}</td>
                  <td className={c.coefficient>=0?"positive":"negative"}>{c.coefficient>=0?"+":""}{c.coefficient.toFixed(4)}</td>
                  <td>{c.abs_coefficient.toFixed(4)}</td>
                  <td><div className="coeff-bar"><div className={`coeff-bar__fill ${c.coefficient>=0?"coeff-bar__fill--positive":"coeff-bar__fill--negative"}`} style={{width:`${(c.abs_coefficient/maxAbs)*100}%`}}/></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="chart-panel">
        <div className="chart-panel__header">
          <span className="chart-panel__title">Ajuste no Treino</span>
          <span className="chart-panel__meta">{data.train_range.count} amostras</span>
        </div>
        <div className="chart-panel__body">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.train_series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333"/>
              <XAxis dataKey="date" tick={{fontSize:9,fill:"#666"}} tickFormatter={fmtD} interval={Math.floor(data.train_series.length/8)}/>
              <YAxis tick={{fontSize:9,fill:"#666"}} domain={["auto","auto"]}/>
              <Tooltip contentStyle={tipStyle} labelFormatter={(v:string)=>v}/>
              <Line type="monotone" dataKey="real" stroke="#555" strokeWidth={1} dot={false} name="Real"/>
              <Line type="monotone" dataKey="predicted" stroke="#00ff88" strokeWidth={1.5} dot={false} name="Previsto" strokeDasharray="4 2"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
