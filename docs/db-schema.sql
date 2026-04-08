-- Itararé Pass - Postgres schema
-- Requires: CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name text NOT NULL,
  whatsapp text,
  origin_city text,
  age_group text,
  cnpj text,
  business_name text,
  position text,
  tipo_usuario text NOT NULL,
  role text NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed boolean NOT NULL DEFAULT false,
  interest text,
  discovery_source text,
  discovery_source_other text
);

CREATE TABLE IF NOT EXISTS checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spot_id text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  insight text,
  language text,
  rating int,
  user_name text,
  UNIQUE (user_id, spot_id)
);

CREATE INDEX IF NOT EXISTS checkins_user_id_idx ON checkins(user_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS user_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coupon_id text NOT NULL,
  used boolean NOT NULL DEFAULT false,
  used_at timestamptz,
  UNIQUE (user_id, coupon_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spot_id text NOT NULL,
  spot_name text,
  text text,
  photo text,
  rating int,
  created_at timestamptz NOT NULL DEFAULT now(),
  user_name text
);

CREATE INDEX IF NOT EXISTS comments_spot_id_idx ON comments(spot_id, created_at DESC);
