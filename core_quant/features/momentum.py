"""
core_quant.features.momentum
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Cálculo do Índice de Força Relativa (RSI) — indicador de momentum.

Fórmulas
--------
Δ = Close_t - Close_{t-1}
gain = max(Δ, 0)
loss = max(-Δ, 0)
avg_gain = EMA(gain, n)
avg_loss = EMA(loss, n)
RS  = avg_gain / avg_loss
RSI = 100 - (100 / (1 + RS))

RSI ∈ [0, 100]. Valores > 70 indicam sobrecompra; < 30, sobrevenda.
"""

import pandas as pd
import numpy as np


def compute_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """
    Calcula o RSI (Relative Strength Index).

    Parameters
    ----------
    series : pd.Series
        Série de preços de fechamento.
    period : int
        Período do RSI (padrão: 14).

    Returns
    -------
    pd.Series
        Série com os valores de RSI [0, 100].
    """
    if period < 1:
        raise ValueError(f"Período deve ser >= 1, recebido: {period}")

    delta = series.diff()

    gain = delta.where(delta > 0, 0.0)
    loss = (-delta).where(delta < 0, 0.0)

    avg_gain = gain.ewm(span=period, adjust=False).mean()
    avg_loss = loss.ewm(span=period, adjust=False).mean()

    rs = avg_gain / avg_loss
    rsi = 100.0 - (100.0 / (1.0 + rs))

    return rsi
