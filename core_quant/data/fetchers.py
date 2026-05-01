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

VALID_PERIODS = {"1y", "2y", "5y"}


def download_ticker_data(
    ticker: str,
    period: str = "2y",
) -> pd.DataFrame:
    """
    Baixa dados históricos OHLCV de um ativo via yfinance.

    Parameters
    ----------
    ticker : str
        Código do ativo (ex: 'PETR4.SA', 'AAPL').
    period : str
        Período de dados: '1y', '2y' ou '5y'.

    Returns
    -------
    pd.DataFrame
        DataFrame com colunas: Open, High, Low, Close, Volume
        e DatetimeIndex.
    """
    if period not in VALID_PERIODS:
        raise ValueError(f"Período inválido: {period}. Use: {VALID_PERIODS}")

    df = yf.download(ticker, period=period, progress=False)

    if df.empty:
        raise ValueError(f"Nenhum dado retornado para o ticker: {ticker}")

    # yfinance >= 0.2.50 retorna MultiIndex quando single ticker
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    df = df[["Open", "High", "Low", "Close", "Volume"]].copy()
    df.dropna(inplace=True)

    return df
