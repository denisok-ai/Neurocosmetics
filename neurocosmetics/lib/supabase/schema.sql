-- =============================================================
-- HAEE Neurocosmetics Portal — Database Schema
-- Supabase (PostgreSQL) with Row Level Security
-- Created: 2025-03-05
-- =============================================================

-- ======================== ENUM TYPES =========================

CREATE TYPE user_role AS ENUM ('guest', 'user', 'b2b', 'manager', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'cancelled');
CREATE TYPE agent_type AS ENUM ('sales', 'b2b', 'care', 'copilot');

-- ======================== PROFILES ============================

CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       user_role NOT NULL DEFAULT 'user',
  full_name  TEXT,
  phone      TEXT,
  email      TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ======================== PRODUCTS ============================

CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price       NUMERIC(10, 2) NOT NULL,
  image_url   TEXT,
  stock       INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are publicly readable"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ======================== ORDERS ==============================

CREATE TABLE orders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status     order_status NOT NULL DEFAULT 'pending',
  total      NUMERIC(10, 2) NOT NULL DEFAULT 0,
  items      JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins/managers can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins/managers can update orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- ======================== B2B_LEADS =============================

CREATE TABLE b2b_leads (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company    TEXT,
  contact_name TEXT,
  email      TEXT NOT NULL,
  phone      TEXT,
  message    TEXT,
  source     TEXT NOT NULL DEFAULT 'b2b_form' CHECK (source IN ('b2b_form', 'b2b_chat')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE b2b_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins/managers can view b2b leads"
  ON b2b_leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Anyone can insert b2b leads (public form)"
  ON b2b_leads FOR INSERT
  WITH CHECK (true);

-- ======================== AI_PROMPTS ==========================

CREATE TABLE ai_prompts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type    agent_type NOT NULL,
  title         TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  model         TEXT NOT NULL DEFAULT 'gpt-4o',
  temperature   NUMERIC(3, 2) NOT NULL DEFAULT 0.7,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage prompts"
  ON ai_prompts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ======================== AUDIT_LOGS ==========================

CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert-only for the system (via service role)
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- ======================== SEED DATA ===========================

INSERT INTO products (slug, name, description, price, image_url, stock, is_active, metadata) VALUES
('haee-starter', 'HAEE Starter: Системный старт',
  'Идеальный комплект для первого знакомства с технологией трансдермального восстановления. Базовый курс для первичной нейтрализации свободных радикалов и коррекции тона кожи плеч и рук.',
  12900.00, '/images/haee-starter-1-front.png', 100, true,
  '{"course":"10 процедур (1 раз в 7–10 дней). Около 2,5 месяцев.","composition":"10 ампул по 2 мл, мезороллер, спиртовые салфетки, протокол процедуры.","images":["/images/haee-starter-1-front.png","/images/haee-starter-2-left.png","/images/haee-starter-3-right.png","/images/haee-starter-4-top.png","/images/haee-starter-5-detail.png"]}'::jsonb),
('haee-intensive', 'HAEE Intensive: Нейро-Регенерация',
  'Усиленный комплекс при выраженном фотостарении или глубоком дефиците пептида (постковидный синдром, хронический стресс). Полный курс восстановления защиты мозга.',
  19900.00, '/images/haee-intensive-1-front.png', 50, true,
  '{"course":"Первые 4 недели — 1 раз в 5–7 дней, далее — 1 раз в 7–10 дней.","composition":"20 ампул (2×10), мезороллер (замена через 15 процедур), крем-постуход SPF 30+.","images":["/images/haee-intensive-1-front.png","/images/haee-intensive-2-left.png","/images/haee-intensive-3-right.png","/images/haee-intensive-4-top.png","/images/haee-intensive-5-detail.png"]}'::jsonb),
('haee-refill', 'HAEE Refill: Поддерживающий уход',
  'Экономичный вариант для тех, кто уже имеет мезороллер и завершил основной курс. Поддержание нормы HAEE в крови и предотвращение повторной пигментации (lentigo senilis).',
  8500.00, '/images/haee-refill-1-front.png', 100, true,
  '{"course":"1 процедура в 2–4 недели.","composition":"10 ампул по 2 мл.","images":["/images/haee-refill-1-front.png","/images/haee-refill-2-left.png","/images/haee-refill-3-right.png","/images/haee-refill-4-top.png","/images/haee-refill-5-detail.png"]}'::jsonb),
('haee-professional', 'HAEE Professional: B2B-Box',
  'Формат для клиник эстетической медицины и нейрореабилитационных центров. Интеграция HAEE в протоколы когнитивных дисфункций и анти-эйдж ухода. Маржинальность для партнёра выше 70%.',
  0, '/images/haee-professional-1-front.png', 0, true,
  '{"course":"По протоколу клиники.","composition":"Диспенсер 50–100 ампул, сменные насадки для аппаратов микронидлинга, доступ к AI-аттестации персонала.","price_on_request":true,"images":["/images/haee-professional-1-front.png","/images/haee-professional-2-left.png","/images/haee-professional-3-right.png","/images/haee-professional-4-top.png","/images/haee-professional-5-detail.png"]}'::jsonb);

INSERT INTO ai_prompts (agent_type, title, system_prompt, model, temperature) VALUES
(
  'sales',
  'Sales Consultant (B2C)',
  'You are the official AI Consultant for HAEE Neurocosmetics. Tone: Scientific, premium, empathetic, and professional. Product: HAEE is a revolutionary endogenous peptide (Ac-His-Ala-Glu-Glu-NH2) delivered transdermally via a meso-roller. It offers dual action: local skin brightening/anti-aging and systemic neuroprotection (replenishing natural brain defenses). Your goal: Answer user questions accurately based strictly on provided clinical data. If the user is ready, use the add_to_cart tool to help them buy. Do not promise medical cures; position it as professional cosmetic care with fundamental scientific backing.',
  'gpt-4o',
  0.7
),
(
  'b2b',
  'Wholesale Consultant (B2B)',
  'You are the HAEE B2B Manager AI. You speak with clinic owners and cosmetologists. Focus on: High ROI (EBITDA margins), regulatory purity (Customs Union TR CU 009/2011 compliance, no medical license required for sales), and patent protection (RU 2826728). Use the create_b2b_lead tool to collect their contacts for the human sales team.',
  'gpt-4o',
  0.5
),
(
  'care',
  'Post-Care Retention Agent',
  'You are the HAEE Care Companion. The user has purchased the ampoule kit. Instructions to strictly follow: Meso-roller is strictly individual. Use 0.5-1.0 ml per procedure on the upper arm. Roll horizontally, vertically, diagonally (4-6 times). Redness for 1-3 hours is normal. MUST remind about SPF 30+ the next morning. Your goal: Ensure safe usage, answer procedural questions, and gently suggest repurchasing when the 10-ampoule kit is almost empty using the reorder_kit tool.',
  'gpt-4o',
  0.6
);

-- ======================== RAG (pgvector) ============================
-- Опционально: включить расширение vector в Supabase Dashboard → Database → Extensions

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS rag_chunks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content    TEXT NOT NULL,
  source     TEXT,
  embedding  vector(1536),
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE rag_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RAG chunks readable by anon (for chat)"
  ON rag_chunks FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert rag_chunks"
  ON rag_chunks FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can delete rag_chunks (for re-seed)"
  ON rag_chunks FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Поиск по косинусному сходству (1 - cosine distance)
CREATE OR REPLACE FUNCTION match_rag_chunks(
  query_embedding vector(1536),
  match_count int DEFAULT 4,
  match_threshold float DEFAULT 0.2
)
RETURNS TABLE(content text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT c.content
  FROM rag_chunks c
  WHERE c.embedding IS NOT NULL
    AND (1 - (c.embedding <=> query_embedding)) >= match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
