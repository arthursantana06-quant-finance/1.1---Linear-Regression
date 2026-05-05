import { useState, useRef, useEffect } from "react";
import { FORMULAS } from "../data/formulas";

interface Props {
  id: string;
}

export function InfoButton({ id }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const info = FORMULAS[id];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!info) return null;

  return (
    <div style={{ position: "relative", display: "inline-block", marginLeft: 8 }} ref={ref}>
      <button
        className="info-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Ver explicação técnica"
      >
        i
      </button>
      
      {isOpen && (
        <div className="info-panel">
          <div className="info-panel__header">
            <span className="info-panel__title">{info.title}</span>
            <button className="info-panel__close" onClick={() => setIsOpen(false)}>×</button>
          </div>
          <div className="info-panel__body">
            <div className="info-panel__formula">{info.formula}</div>
            <p className="info-panel__desc">{info.description}</p>
            <div className="info-panel__module">Módulo: <code>{info.module}</code></div>
          </div>
        </div>
      )}
    </div>
  );
}
