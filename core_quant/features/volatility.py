"""
core_quant.features.volatility
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Cálculo de Bandas de Bollinger para medição de volatilidade.

Fórmulas
--------
BB_mid   = SMA(Close, n)
BB_upper = BB_mid + k * σ(Close, n)
BB_lower = BB_mid - k * σ(Close, n)
BB_width = (BB_upper - BB_lower) / BB_mid
BB_pct   = (Close - BB_lower) / (BB_upper - BB_lower)

Onde σ é o desvio padrão rolling e k tipicamente = 2.
"""

import pandas as pd
import numpy as np


def compute_bollinger_bands(
    series: pd.Series,
    window: int = 20,
    num_std: float = 2.0,
) -> pd.DataFrame:
    """
    Calcula as Bandas de Bollinger.

    Parameters
    ----------
    series : pd.Series
        Série de preços de fechamento.
    window : int
        Janela da média móvel central (padrão: 20).
    num_std : float
        Número de desvios padrão para as bandas (padrão: 2.0).

    Returns
    -------
    pd.DataFrame
        DataFrame com colunas: BB_mid, BB_upper, BB_lower, BB_width, BB_pct.
    """
    if window < 2:
        raise ValueError(f"Janela deve ser >= 2 para Bollinger, recebido: {window}")

    rolling_mean = series.rolling(window=window, min_periods=window).mean()
    rolling_std = series.rolling(window=window, min_periods=window).std()

    upper = rolling_mean + num_std * rolling_std
    lower = rolling_mean - num_std * rolling_std

    width = (upper - lower) / rolling_mean
    pct = (series - lower) / (upper - lower)

    return pd.DataFrame({
        "BB_mid": rolling_mean,
        "BB_upper": upper,
        "BB_lower": lower,
        "BB_width": width,
        "BB_pct": pct,
    })
