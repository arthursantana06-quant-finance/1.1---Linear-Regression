/* ═══════════════════════════════════
   TypeScript types for the pipeline
   ═══════════════════════════════════ */

export type LoadState = "idle" | "loading" | "success" | "error";

export type TabId = "DATA_FETCH" | "FEATURE_ENG" | "MODEL_TRAIN" | "ANALYTICS" | "SAVED";

export interface RawPoint {
  date: string;
  close: number;
  volume: number;
  open: number;
  high: number;
  low: number;
}

export interface FeaturePoint {
  date: string;
  close: number;
  SMA_10: number;
  SMA_50: number;
  EMA_12: number;
  EMA_26: number;
  RSI: number;
  BB_mid: number;
  BB_upper: number;
  BB_lower: number;
  BB_width: number;
  BB_pct: number;
  Vol_rel: number;
  log_return: number;
}

export interface TestPoint {
  date: string;
  real: number;
  predicted: number;
  residual: number;
}

export interface TrainPoint {
  date: string;
  real: number;
  predicted: number;
}

export interface Coefficient {
  feature: string;
  coefficient: number;
  abs_coefficient: number;
}

export interface DateRange {
  start: string;
  end: string;
  count?: number;
}

export interface PipelineResponse {
  ticker: string;
  period: string;
  total_days: number;
  clean_days: number;
  date_range: DateRange;
  train_range: DateRange;
  test_range: DateRange;
  raw_series: RawPoint[];
  feature_series: FeaturePoint[];
  train_series: TrainPoint[];
  test_series: TestPoint[];
  coefficients: Coefficient[];
  intercept: number;
  metrics: {
    mse: number;
    r2: number;
    mape: number;
  };
}

export interface LogEntry {
  timestamp: string;
  level: string;
  module: string;
  message: string;
}
