"""
core_quant.models.regressao
~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Implementação da Regressão Linear usando NumPy puro.
Encapsula treinamento, predição e extração de coeficientes.

Nota: Reimplementado sem scikit-learn para reduzir o tamanho do
bundle em deploys serverless (Vercel Lambda ≤ 500 MB).
"""

import numpy as np
from typing import Dict, Any, List


class LinearRegressionModel:
    """
    Regressão linear OLS (Ordinary Least Squares) com normalização
    integrada, implementada com NumPy puro.

    Normalização (StandardScaler): z = (x - μ) / σ
    Solução OLS: β = (X^T X)^-1 X^T y
    """

    def __init__(self):
        self._mean: np.ndarray | None = None
        self._std: np.ndarray | None = None
        self._coef: np.ndarray | None = None
        self._intercept: float = 0.0
        self._feature_names: List[str] = []
        self._is_fitted = False

    # ── StandardScaler reimplementado ──

    def _fit_scaler(self, X: np.ndarray) -> None:
        """Calcula média e desvio-padrão para cada feature."""
        self._mean = X.mean(axis=0)
        self._std = X.std(axis=0)
        # Evita divisão por zero: se σ == 0, tratar como 1
        self._std[self._std == 0] = 1.0

    def _transform(self, X: np.ndarray) -> np.ndarray:
        """Aplica normalização z-score."""
        return (X - self._mean) / self._std

    # ── Fit / Predict ──

    def fit(self, X: np.ndarray, y: np.ndarray, feature_names: List[str] = None):
        """
        Treina o modelo com normalização.

        Parameters
        ----------
        X : np.ndarray
            Matriz de features (n_samples, n_features).
        y : np.ndarray
            Vetor alvo (n_samples,).
        feature_names : list[str], optional
            Nomes das colunas de features.
        """
        self._feature_names = feature_names or [f"x{i}" for i in range(X.shape[1])]

        # Normalização
        self._fit_scaler(X)
        X_scaled = self._transform(X)

        # Adiciona coluna de 1s para o intercept (bias)
        ones = np.ones((X_scaled.shape[0], 1))
        X_b = np.concatenate([ones, X_scaled], axis=1)

        # Solução OLS: β = (X^T X)^-1 X^T y
        # Usa pseudo-inversa para estabilidade numérica
        beta = np.linalg.pinv(X_b.T @ X_b) @ X_b.T @ y

        self._intercept = float(beta[0])
        self._coef = beta[1:]
        self._is_fitted = True

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Gera predições a partir da matriz de features."""
        if not self._is_fitted:
            raise RuntimeError("Modelo não treinado. Chame fit() primeiro.")
        X_scaled = self._transform(X)
        return X_scaled @ self._coef + self._intercept

    def get_coefficients(self) -> List[Dict[str, Any]]:
        """
        Retorna os coeficientes aprendidos.

        Returns
        -------
        list[dict]
            Lista de {feature, coefficient, abs_coefficient} ordenada por
            importância absoluta (descendente).
        """
        if not self._is_fitted:
            raise RuntimeError("Modelo não treinado.")

        coefs = []
        for name, coef in zip(self._feature_names, self._coef):
            coefs.append({
                "feature": name,
                "coefficient": float(coef),
                "abs_coefficient": float(abs(coef)),
            })
        coefs.sort(key=lambda x: x["abs_coefficient"], reverse=True)
        return coefs

    def get_intercept(self) -> float:
        """Retorna o intercepto do modelo."""
        if not self._is_fitted:
            raise RuntimeError("Modelo não treinado.")
        return self._intercept
