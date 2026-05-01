/* ═══════════════════════════════════
   API client + SSE log listener
   ═══════════════════════════════════ */

import type { PipelineResponse, LogEntry } from "./types";

const BASE = "/api";

// ── Tickers (static config, no API call needed) ──
export const TICKERS: Record<string, string[]> = {
  BR: ["PETR4.SA", "VALE3.SA", "ITUB4.SA", "BBDC4.SA", "ABEV3.SA"],
  US: ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"],
};

// ── Pipeline execution ──
export async function runPipeline(
  ticker: string,
  period: string
): Promise<PipelineResponse> {
  const params = new URLSearchParams({ ticker, period });
  const res = await fetch(`${BASE}/run?${params}`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── SSE Log Stream ──
export function connectLogStream(
  onLog: (entry: LogEntry) => void,
  onError?: (err: Event) => void
): () => void {
  const es = new EventSource(`${BASE}/logs/stream`);

  es.addEventListener("log", (e: MessageEvent) => {
    try {
      const entry: LogEntry = JSON.parse(e.data);
      onLog(entry);
    } catch {
      // ignore malformed events
    }
  });

  es.onerror = (e) => {
    onError?.(e);
  };

  // Return cleanup function
  return () => {
    es.close();
  };
}
