"""
core_quant.data.fetchers
~~~~~~~~~~~~~~~~~~~~~~~~
Coleta de séries históricas de preços via yfinance.
Suporta tickers brasileiros (IBOV, PETR4.SA) e americanos (AAPL, MSFT).
"""

import yfinance as yf
import pandas as pd
from typing import Literal

# Tickers pré-configurados
TICKERS = {
    "BR": ["PETR4.SA", "VALE3.SA", "ITUB4.SA", "BBDC4.SA", "ABEV3.SA"],
    "US": ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"],
}

def download_ticker_data(
    ticker: str,
    period: str = None,
    start: str = None,
    end: str = None,
) -> pd.DataFrame:
    """
    Baixa dados históricos OHLCV de um ativo via yfinance.

    Parameters
    ----------
    ticker : str
        Código do ativo (ex: 'PETR4.SA', 'AAPL', 'BTC-USD').
    period : str, optional
        Período (ex: '1y', '2y', '5y'). Se start/end forem passados, este é ignorado.
    start : str, optional
        Data de início (YYYY-MM-DD).
    end : str, optional
        Data de fim (YYYY-MM-DD).

    Returns
    -------
    pd.DataFrame
        DataFrame com colunas: Open, High, Low, Close, Volume.
    """
    if start and end:
        df = yf.download(ticker, start=start, end=end, progress=False)
    else:
        df = yf.download(ticker, period=period or "2y", progress=False)

    if df.empty:
        raise ValueError(f"Nenhum dado retornado para o ticker: {ticker}. Verifique se o símbolo está correto no Yahoo Finance.")

    # yfinance >= 0.2.50 retorna MultiIndex quando single ticker
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    df = df[["Open", "High", "Low", "Close", "Volume"]].copy()
    df.dropna(inplace=True)

    return df
