-- SQL para criar a tabela de resultados salvos no Supabase
-- Execute este comando no SQL Editor do seu projeto Supabase

CREATE TABLE IF NOT EXISTS saved_pipelines (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now(),
  ticker      TEXT NOT NULL,
  period      TEXT,
  start_date  TEXT,
  end_date    TEXT,
  clean_days  INTEGER,
  metrics     JSONB NOT NULL,          -- { mse, r2, mape }
  coefficients JSONB NOT NULL,         -- array de coeficientes
  intercept   FLOAT NOT NULL,
  raw_series  JSONB,                   -- Opcional: dados históricos
  feature_series JSONB,               -- Opcional: indicadores calculados
  train_series JSONB,                 -- Opcional: dados de treino
  test_series JSONB,                  -- Opcional: predições do teste
  notes       TEXT                     -- Campo para anotações do usuário
);

-- Configurar RLS (Row Level Security) se desejar
-- Por enquanto, habilitamos acesso total (Development mode)
ALTER TABLE saved_pipelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON saved_pipelines FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON saved_pipelines FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete access" ON saved_pipelines FOR DELETE USING (true);
