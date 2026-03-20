-- AI Brand Builder v2.0 — Database Schema
-- Supabase PostgreSQL + pgvector

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Drop existing tables (fresh start only)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS generations CASCADE;
DROP TABLE IF EXISTS brand_vectors CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  credits INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. brands table (stores Brand DNA + all outputs)
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  brand_idea TEXT,
  industry TEXT,
  target_audience TEXT,
  visual_style TEXT,
  colors JSONB,
  typography TEXT,
  brand_dna JSONB,
  inspiration_sources JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. brand_vectors table (pgvector embeddings — 1536-dim for text-embedding-3-small)
CREATE TABLE IF NOT EXISTS brand_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  style_vector VECTOR(1536),
  description TEXT,
  source TEXT DEFAULT 'inspiration',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. generations table (regeneration limits per v2.0)
-- Types: names, moodboards, logos, guidelines, wireframe, socialCampaigns
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  regen_count INT DEFAULT 0,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(brand_id, type)
);

-- 7. assets table (Cloudflare R2 URLs)
-- asset_type: logo, moodboard, social_asset, wireframe, business_card, letterhead
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  url TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Similarity search index for style vectors
CREATE INDEX IF NOT EXISTS brand_vectors_style_idx
  ON brand_vectors USING ivfflat (style_vector vector_cosine_ops)
  WITH (lists = 100);
