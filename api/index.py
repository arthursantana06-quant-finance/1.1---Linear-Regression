"""
api.index
~~~~~~~~~
Servidor FastAPI com streaming SSE para logs em tempo real.
Endpoints para o pipeline de regressão linear.
"""

import sys
import os
import json
import asyncio
import logging
import queue
import threading
from datetime import datetime
from contextlib import contextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

# Adiciona o diretório raiz ao path para importar core_quant
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import numpy as np
import pandas as pd
from core_quant.data.fetchers import download_ticker_data, TICKERS
from core_quant.features.moving_averages import compute_sma, compute_ema
from core_quant.features.volatility import compute_bollinger_bands
from core_quant.features.momentum import compute_rsi
from core_quant.models.regressao import LinearRegressionModel
from core_quant.metrics.error_metrics import compute_mse, compute_r2, compute_mape

# ───────────── Logger SSE ─────────────

# Log queue global — consumers (SSE connections) read from here
_log_queues: list[queue.Queue] = []
_log_lock = threading.Lock()


def _broadcast_log(level: str, module: str, message: str):
    """Envia mensagem de log para todas as conexões SSE ativas."""
    ts = datetime.now().strftime("%d/%m/%y %H:%M")
    entry = {
        "timestamp": ts,
        "level": level,
        "module": module,
        "message": message,
    }
    with _log_lock:
        for q in _log_queues:
            try:
                q.put_nowait(entry)
            except queue.Full:
                pass  # Drop if consumer is too slow


def _log(module: str, message: str, level: str = "INFO"):
    _broadcast_log(level, module, message)


# ───────────── Helper ─────────────

def _safe(v):
    """Convert numpy/pandas types to JSON-safe Python types."""
    if isinstance(v, (np.integer,)):
        return int(v)
    if isinstance(v, (np.floating,)):
        return round(float(v), 6)
    if isinstance(v, (np.ndarray,)):
        return [_safe(x) for x in v]
    if isinstance(v, pd.Timestamp):
        return v.strftime("%Y-%m-%d")
    if pd.isna(v):
        return None
    return v


# ───────────── FastAPI App ─────────────

app = FastAPI(title="Quant 1.1 — Regressão Linear", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ───────────── SSE Endpoint ─────────────

@app.get("/api/logs/stream")
async def log_stream():
    """Server-Sent Events endpoint para streaming de logs."""
    q: queue.Queue = queue.Queue(maxsize=200)

    with _log_lock:
        _log_queues.append(q)

    async def event_generator():
        try:
            while True:
                try:
                    entry = q.get_nowait()
                    yield {
                        "event": "log",
                        "data": json.dumps(entry),
                    }
                except queue.Empty:
                    await asyncio.sleep(0.3)
        finally:
            with _log_lock:
                if q in _log_queues:
                    _log_queues.remove(q)

    return EventSourceResponse(event_generator())


# ───────────── Tickers Endpoint ─────────────

# ───────────── Search Endpoint ─────────────

@app.get("/api/search")
def search_tickers(q: str = Query(..., min_length=1)):
    """Busca ativos no Yahoo Finance usando a API de busca interna."""
    try:
        import yfinance as yf
        # yfinance.Search retorna resultados formatados
        s = yf.Search(q, max_results=8)
        return s.quotes
    except Exception as e:
        _log("api.index", f"Erro na busca: {str(e)}", level="ERROR")
        return []


# ───────────── Pipeline Run Endpoint ─────────────

FEATURE_COLS = [
    "SMA_10", "SMA_50", "EMA_12", "EMA_26",
    "RSI",
    "BB_mid", "BB_width", "BB_pct",
    "Vol_rel", "log_return",
]


@app.get("/api/run")
def run_pipeline(
    ticker: str = Query(..., description="Ticker do ativo"),
    period: str = Query(None, description="Período: 1y, 2y ou 5y"),
    start_date: str = Query(None, description="Data início (YYYY-MM-DD)"),
    end_date: str = Query(None, description="Data fim (YYYY-MM-DD)"),
):
    """
    Executa o pipeline completo:
    1. DATA_FETCH — Baixa dados via yfinance
    2. FEATURE_ENG — Calcula indicadores técnicos
    3. MODEL_TRAIN — Treina regressão linear
    4. ANALYTICS — Calcula métricas de erro

    Retorna JSON completo para todas as 4 abas.
    """
    try:
        # ─── STEP 1: DATA_FETCH ───
        if start_date and end_date:
            _log("core_quant.data.fetchers", f"Iniciando download: {ticker} | {start_date} → {end_date}")
            df = download_ticker_data(ticker, start=start_date, end=end_date)
        else:
            p = period or "2y"
            _log("core_quant.data.fetchers", f"Iniciando download: {ticker} | período: {p}")
            df = download_ticker_data(ticker, period=p)
        
        _log("core_quant.data.fetchers", f"download_ticker_data SUCCESS — {len(df)} registros")

        # ─── STEP 2: FEATURE_ENG ───
        _log("core_quant.features.moving_averages", "Calculando SMA_10, SMA_50...")
        df["SMA_10"] = compute_sma(df["Close"], 10)
        df["SMA_50"] = compute_sma(df["Close"], 50)

        _log("core_quant.features.moving_averages", "Calculando EMA_12, EMA_26...")
        df["EMA_12"] = compute_ema(df["Close"], 12)
        df["EMA_26"] = compute_ema(df["Close"], 26)

        _log("core_quant.features.momentum", "Calculando RSI_14...")
        df["RSI"] = compute_rsi(df["Close"], 14)

        _log("core_quant.features.volatility", "Calculando Bollinger Bands (20, 2σ)...")
        bb = compute_bollinger_bands(df["Close"], 20, 2.0)
        for col in bb.columns:
            df[col] = bb[col]

        # Extras
        df["Vol_rel"] = df["Volume"] / df["Volume"].rolling(20).mean()
        df["log_return"] = np.log(df["Close"] / df["Close"].shift(1))

        _log("core_quant.features", f"Feature engineering SUCCESS — {len(FEATURE_COLS)} features criadas")

        # Drop NaN (primeiras ~50 linhas por causa das janelas)
        df_clean = df.dropna(subset=FEATURE_COLS).copy()
        _log("core_quant.features", f"Dados limpos: {len(df_clean)} registros válidos")

        # ─── Preparar séries para o frontend ───

        # Raw series (para aba DATA_FETCH)
        raw_series = []
        for idx, row in df.iterrows():
            raw_series.append({
                "date": _safe(idx),
                "close": _safe(row["Close"]),
                "volume": _safe(row["Volume"]),
                "open": _safe(row["Open"]),
                "high": _safe(row["High"]),
                "low": _safe(row["Low"]),
            })

        # Feature series (para aba FEATURE_ENG)
        feature_series = []
        for idx, row in df_clean.iterrows():
            entry = {"date": _safe(idx), "close": _safe(row["Close"])}
            for col in FEATURE_COLS:
                entry[col] = _safe(row[col])
            # Bandas de Bollinger extras
            entry["BB_upper"] = _safe(row.get("BB_upper"))
            entry["BB_lower"] = _safe(row.get("BB_lower"))
            feature_series.append(entry)

        # ─── STEP 3: MODEL_TRAIN ───
        _log("core_quant.models.regressao", "Preparando split train/test (80/20)...")

        X = df_clean[FEATURE_COLS].values
        y = df_clean["Close"].values

        split_idx = int(len(X) * 0.8)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]

        dates_train = [_safe(d) for d in df_clean.index[:split_idx]]
        dates_test = [_safe(d) for d in df_clean.index[split_idx:]]

        _log("core_quant.models.regressao", f"Train: {len(X_train)} | Test: {len(X_test)} amostras")

        model = LinearRegressionModel()
        model.fit(X_train, y_train, feature_names=FEATURE_COLS)

        _log("core_quant.models.regressao", "LinearRegression.fit() SUCCESS")

        y_pred_train = model.predict(X_train)
        y_pred_test = model.predict(X_test)

        coefficients = model.get_coefficients()
        intercept = model.get_intercept()

        _log("core_quant.models.regressao", f"Intercept: {intercept:.4f} | Coefs: {len(coefficients)}")

        # ─── STEP 4: ANALYTICS ───
        _log("core_quant.metrics.error_metrics", "Calculando MSE, R², MAPE...")

        mse_val = compute_mse(y_test, y_pred_test)
        r2_val = compute_r2(y_test, y_pred_test)
        mape_val = compute_mape(y_test, y_pred_test)

        _log("core_quant.metrics.error_metrics", f"MSE={mse_val:.4f} | R²={r2_val:.4f} | MAPE={mape_val:.2f}%")

        # Test series (preço real vs previsto)
        test_series = []
        for i, date in enumerate(dates_test):
            test_series.append({
                "date": date,
                "real": _safe(y_test[i]),
                "predicted": _safe(y_pred_test[i]),
                "residual": _safe(y_test[i] - y_pred_test[i]),
            })

        # Train series
        train_series = []
        for i, date in enumerate(dates_train):
            train_series.append({
                "date": date,
                "real": _safe(y_train[i]),
                "predicted": _safe(y_pred_train[i]),
            })

        _log("api.index", f"Pipeline completo para {ticker} — STATUS: SUCCESS")

        return {
            "ticker": ticker,
            "period": period,
            "total_days": len(df),
            "clean_days": len(df_clean),
            "date_range": {
                "start": _safe(df.index[0]),
                "end": _safe(df.index[-1]),
            },
            "train_range": {
                "start": dates_train[0] if dates_train else None,
                "end": dates_train[-1] if dates_train else None,
                "count": len(dates_train),
            },
            "test_range": {
                "start": dates_test[0] if dates_test else None,
                "end": dates_test[-1] if dates_test else None,
                "count": len(dates_test),
            },
            "raw_series": raw_series,
            "feature_series": feature_series,
            "train_series": train_series,
            "test_series": test_series,
            "coefficients": coefficients,
            "intercept": _safe(intercept),
            "metrics": {
                "mse": _safe(mse_val),
                "r2": _safe(r2_val),
                "mape": _safe(mape_val),
            },
        }

    except ValueError as e:
        _log("api.index", f"ERRO: {str(e)}", level="ERROR")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        _log("api.index", f"ERRO INTERNO: {str(e)}", level="ERROR")
        raise HTTPException(status_code=500, detail=str(e))
