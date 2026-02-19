import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  id: string;
  name: string;
  age?: number;
  created_at: string;
}

export interface Cycle {
  id: string;
  user_id: string;
  cycle_length: number;
  mood: string;
  energy: string;
  date: string;
  created_at: string;
}

export interface TextAnalysis {
  id: string;
  user_id: string;
  input_text: string;
  ai_response: string;
  created_at: string;
}

export interface ImageAnalysis {
  id: string;
  user_id: string;
  image_url: string;
  red_intensity: number;
  risk_level: string;
  analysis_result: string;
  created_at: string;
}
