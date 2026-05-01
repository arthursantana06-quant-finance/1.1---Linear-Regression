"""
core_quant.metrics.error_metrics
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Fórmulas de erro para avaliação de modelos de regressão.

Métricas
--------
MSE  = (1/n) * Σ(y_i - ŷ_i)²
R²   = 1 - Σ(y_i - ŷ_i)² / Σ(y_i - ȳ)²
MAPE = (100/n) * Σ |((y_i - ŷ_i) / y_i)|
"""

import numpy as np


def compute_mse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Mean Squared Error."""
    residuals = y_true - y_pred
    return float(np.mean(residuals ** 2))


def compute_r2(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Coeficiente de Determinação R²."""
    ss_res = np.sum((y_true - y_pred) ** 2)
    ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
    if ss_tot == 0:
        return 0.0
    return float(1 - ss_res / ss_tot)


def compute_mape(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Mean Absolute Percentage Error (%)."""
    mask = y_true != 0
    if not np.any(mask):
        return 0.0
    return float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100)
