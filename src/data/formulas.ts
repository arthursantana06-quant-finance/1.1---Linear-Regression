/* ═══════════════════════════════════
   formulas.ts — Explicações Técnicas
   ═══════════════════════════════════ */

export interface FormulaInfo {
  title: string;
  formula: string;
  description: string;
  module: string;
}

export const FORMULAS: Record<string, FormulaInfo> = {
  SMA: {
    title: "Simple Moving Average (SMA)",
    formula: "SMA(n) = (P₁ + P₂ + ... + Pₙ) / n",
    description: "Média aritmética simples dos preços de fechamento em uma janela de n períodos. Suaviza ruídos de curto prazo para identificar tendências.",
    module: "core_quant.features.moving_averages.compute_sma"
  },
  EMA: {
    title: "Exponential Moving Average (EMA)",
    formula: "EMAₜ = (Pₜ × α) + (EMAₜ₋₁ × (1 - α)), onde α = 2/(n+1)",
    description: "Média móvel que atribui maior peso aos dados mais recentes. Reage mais rápido a mudanças de preço que a SMA.",
    module: "core_quant.features.moving_averages.compute_ema"
  },
  RSI: {
    title: "Relative Strength Index (RSI)",
    formula: "RSI = 100 - [100 / (1 + RS)], onde RS = Média(Ganhos) / Média(Perdas)",
    description: "Oscilador de momento que mede a velocidade e a mudança dos movimentos de preços. Valores acima de 70 sugerem sobrecompra; abaixo de 30, sobrevenda.",
    module: "core_quant.features.momentum.compute_rsi"
  },
  BOLLINGER: {
    title: "Bollinger Bands",
    formula: "Banda = SMA(n) ± k × σ(n)",
    description: "Indicador de volatilidade. Consiste em uma média móvel central (SMA 20) e duas bandas laterais a ±2 desvios-padrão (σ).",
    module: "core_quant.features.volatility.compute_bollinger_bands"
  },
  BB_WIDTH: {
    title: "Bollinger Band Width",
    formula: "Width = (Banda Superior - Banda Inferior) / SMA",
    description: "Mede a distância relativa entre as bandas. Estreitamento (Squeeze) indica baixa volatilidade e possível rompimento iminente.",
    module: "core_quant.features.volatility.compute_bollinger_bands"
  },
  BB_PCT: {
    title: "%B (Bollinger Band Percentage)",
    formula: "%B = (Preço - Banda Inferior) / (Banda Superior - Banda Inferior)",
    description: "Quantifica a posição do preço em relação às bandas. 1.0 = na banda superior, 0.5 = na média, 0.0 = na banda inferior.",
    module: "core_quant.features.volatility.compute_bollinger_bands"
  },
  LINEAR_REGRESSION: {
    title: "Ordinary Least Squares (OLS)",
    formula: "y = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ + ε",
    description: "Estima o valor futuro do ativo minimizando a soma dos quadrados das diferenças entre os valores reais e as predições do modelo.",
    module: "core_quant.models.regressao.LinearRegressionModel"
  },
  STANDARD_SCALER: {
    title: "Standardization (Z-Score)",
    formula: "z = (x - μ) / σ",
    description: "Transforma os dados para que tenham média (μ) zero e desvio-padrão (σ) um. Essencial para modelos lineares onde features têm escalas diferentes.",
    module: "core_quant.models.regressao.LinearRegressionModel"
  },
  MSE: {
    title: "Mean Squared Error (MSE)",
    formula: "MSE = (1/n) Σ (yᵢ - ŷᵢ)²",
    description: "Média dos erros ao quadrado. Penaliza erros maiores de forma mais agressiva devido à exponenciação.",
    module: "core_quant.metrics.error_metrics.compute_mse"
  },
  R2: {
    title: "R-Squared (R²)",
    formula: "R² = 1 - (SSR / SST)",
    description: "Coeficiente de determinação. Indica a proporção da variância da variável dependente que é explicada pelo modelo.",
    module: "core_quant.metrics.error_metrics.compute_r2"
  },
  MAPE: {
    title: "Mean Absolute Percentage Error (MAPE)",
    formula: "MAPE = (100%/n) Σ |(yᵢ - ŷᵢ) / yᵢ|",
    description: "Média do erro percentual absoluto. Facilita a interpretação intuitiva do erro em relação ao valor do ativo.",
    module: "core_quant.metrics.error_metrics.compute_mape"
  }
};
