"""
core_quant.models.regressao
~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Implementação da Regressão Linear via Scikit-Learn.
Encapsula treinamento, predição e extração de coeficientes.
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from typing import Dict, Any, List


class LinearRegressionModel:
    """
    Wrapper sobre sklearn.LinearRegression com normalização integrada.
    """

    def __init__(self):
        self.scaler = StandardScaler()
        self.model = LinearRegression()
        self._feature_names: List[str] = []
        self._is_fitted = False

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
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        self._is_fitted = True

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Gera predições a partir da matriz de features."""
        if not self._is_fitted:
            raise RuntimeError("Modelo não treinado. Chame fit() primeiro.")
        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled)

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
        for name, coef in zip(self._feature_names, self.model.coef_):
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
        return float(self.model.intercept_)
