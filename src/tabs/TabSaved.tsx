import { useState, useEffect } from "react";
import { supabase, type SavedPipelineRow } from "../lib/supabase";

interface Props {
  onLoad: (ticker: string, period: string) => void;
}

export function TabSaved({ onLoad }: Props) {
  const [items, setItems] = useState<SavedPipelineRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSaved();
  }, []);

  async function fetchSaved() {
    if (!supabase) {
      setError("Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    const { data, error: err } = await supabase
      .from("saved_pipelines")
      .select("*")
      .order("created_at", { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  }

  async function deleteItem(id: string) {
    if (!supabase) return;
    if (!confirm("Excluir este favorito?")) return;
    const { error: err } = await supabase.from("saved_pipelines").delete().eq("id", id);
    if (!err) fetchSaved();
  }

  return (
    <div className="saved-tab">
      <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 className="section-title" style={{ margin: 0 }}>★ Pipelines Favoritos</h2>
        <button onClick={fetchSaved} className="controls__btn" style={{ fontSize: 10, padding: '4px 12px' }}>⟳ ATUALIZAR</button>
      </div>

      {error && (
        <div className="error-box" style={{ marginBottom: 16 }}>
          <div className="error-box__title">Erro</div>
          <div className="error-box__msg">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="loading-state">Conectando ao banco de dados...</div>
      ) : items.length === 0 && !error ? (
        <div className="empty-state">
          <div className="empty-state__icon">☆</div>
          <div className="empty-state__text">Nenhum pipeline salvo</div>
          <div className="empty-state__hint">Execute um pipeline e clique em "💾 SALVAR" para favoritá-lo.</div>
        </div>
      ) : (
        <div className="saved-list">
          <table className="saved-table">
            <thead>
              <tr>
                <th>Salvo em</th>
                <th>Ticker</th>
                <th>Período</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="ticker-cell">{item.ticker}</td>
                  <td>{item.period}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="load-btn" onClick={() => onLoad(item.ticker, item.period)}>▸ EXECUTAR</button>
                      <button className="delete-btn" onClick={() => deleteItem(item.id)}>×</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
