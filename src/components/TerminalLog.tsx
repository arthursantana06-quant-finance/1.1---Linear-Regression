/* ═══════════════════════════════════
   Terminal Log Component (Footer)
   ═══════════════════════════════════ */

import { useState, useEffect, useRef } from "react";
import { connectLogStream } from "../api";
import type { LogEntry } from "../types";

export function TerminalLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanup = connectLogStream(
      (entry) => {
        setConnected(true);
        setLogs((prev) => [...prev.slice(-150), entry]); // Keep last 150 logs
      },
      () => setConnected(false)
    );

    return cleanup;
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="terminal">
      <div className="terminal__header">
        <div className="terminal__title">
          <span className={`terminal__dot`} style={{ background: connected ? "#00ff88" : "#ff2d55" }} />
          <span>SYS_LOG</span>
        </div>
        <span className="terminal__count">{logs.length} entries</span>
      </div>
      <div className="terminal__body" ref={bodyRef}>
        {logs.length === 0 && (
          <div className="terminal__line">
            <span className="terminal__ts">[--/--/-- --:--]</span>
            <span className="terminal__level terminal__level--INFO">SYS_INIT</span>
            <span className="terminal__msg">Aguardando execução do pipeline...</span>
          </div>
        )}
        {logs.map((log, i) => (
          <div className="terminal__line" key={i}>
            <span className="terminal__ts">[{log.timestamp}]</span>
            <span className={`terminal__level terminal__level--${log.level}`}>
              {log.level === "INFO" ? "SYS_LOAD" : log.level === "ERROR" ? "SYS_ERR" : "SYS_WARN"}
            </span>
            <span className="terminal__module">{log.module}</span>
            <span className="terminal__msg">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
