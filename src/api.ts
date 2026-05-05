/* ═══════════════════════════════════
   API client + SSE log listener
   ═══════════════════════════════════ */

import type { PipelineResponse, LogEntry } from "./types";

const BASE = "/api";

// ── Pipeline execution ──
export async function runPipeline(
  ticker: string,
  period?: string,
  startDate?: string,
  endDate?: string
): Promise<PipelineResponse> {
  const params = new URLSearchParams({ ticker });
  if (startDate && endDate) {
    params.append("start_date", startDate);
    params.append("end_date", endDate);
  } else if (period) {
    params.append("period", period);
  } else {
    params.append("period", "2y");
  }

  const res = await fetch(`${BASE}/run?${params}`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── Ticker Search ──
export interface SearchResult {
  symbol: string;
  shortname: string;
  exchDisp: string;
  typeDisp: string;
}

export async function searchTickers(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
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
