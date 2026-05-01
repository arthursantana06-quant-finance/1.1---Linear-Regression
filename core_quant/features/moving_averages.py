"""
core_quant.features.moving_averages
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Cálculo modular de Médias Móveis Simples (SMA) e Exponenciais (EMA).

Fórmulas
--------
SMA_n = (1/n) * Σ(Close_i)  para i em [t-n+1, t]
EMA_n = Close_t * k + EMA_{t-1} * (1 - k),  onde k = 2 / (n + 1)
"""

import pandas as pd
import numpy as np


def compute_sma(series: pd.Series, window: int) -> pd.Series:
    """
    Calcula a Média Móvel Simples (SMA).

    Parameters
    ----------
    series : pd.Series
        Série de preços de fechamento.
    window : int
        Tamanho da janela (ex: 10, 20, 50).

    Returns
    -------
    pd.Series
        Série com os valores de SMA. NaN nas primeiras `window - 1` posições.
    """
    if window < 1:
        raise ValueError(f"Janela deve ser >= 1, recebido: {window}")

    return series.rolling(window=window, min_periods=window).mean()


def compute_ema(series: pd.Series, span: int) -> pd.Series:
    """
    Calcula a Média Móvel Exponencial (EMA).

    Parameters
    ----------
    series : pd.Series
        Série de preços de fechamento.
    span : int
        Período da EMA (ex: 12, 26).

    Returns
    -------
    pd.Series
        Série com os valores de EMA.
    """
    if span < 1:
        raise ValueError(f"Span deve ser >= 1, recebido: {span}")

    return series.ewm(span=span, adjust=False).mean()
