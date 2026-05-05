import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Cria o client apenas se as credenciais existem
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Tabela simplificada: apenas favorita ticker + período.
 * Os dados completos são carregados sob demanda via pipeline.
 */
export interface SavedPipelineRow {
  id: string;
  created_at: string;
  ticker: string;
  period: string;
}
