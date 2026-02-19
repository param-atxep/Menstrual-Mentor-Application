/*
  # Menstrual Mentor Database Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `age` (integer)
      - `created_at` (timestamptz)
    
    - `cycles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `cycle_length` (integer)
      - `mood` (text)
      - `energy` (text)
      - `date` (timestamptz)
      - `created_at` (timestamptz)
    
    - `text_analyses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `input_text` (text)
      - `ai_response` (text)
      - `created_at` (timestamptz)
    
    - `image_analyses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `image_url` (text)
      - `red_intensity` (numeric)
      - `risk_level` (text)
      - `analysis_result` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  age integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create cycles table
CREATE TABLE IF NOT EXISTS cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_length integer NOT NULL,
  mood text NOT NULL,
  energy text NOT NULL,
  date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cycles"
  ON cycles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cycles"
  ON cycles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycles"
  ON cycles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cycles"
  ON cycles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create text_analyses table
CREATE TABLE IF NOT EXISTS text_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_text text NOT NULL,
  ai_response text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE text_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own text analyses"
  ON text_analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own text analyses"
  ON text_analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create image_analyses table
CREATE TABLE IF NOT EXISTS image_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  red_intensity numeric NOT NULL,
  risk_level text NOT NULL,
  analysis_result text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE image_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own image analyses"
  ON image_analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own image analyses"
  ON image_analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cycles_user_id ON cycles(user_id);
CREATE INDEX IF NOT EXISTS idx_cycles_date ON cycles(date DESC);
CREATE INDEX IF NOT EXISTS idx_text_analyses_user_id ON text_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_image_analyses_user_id ON image_analyses(user_id);
