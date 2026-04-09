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

CREATE TABLE IF NOT EXISTS spots (
  id text PRIMARY KEY,
  city_id text NOT NULL DEFAULT 'itarare',
  name text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  type text NOT NULL,
  image text,
  capacity int NOT NULL DEFAULT 0,
  current_load int NOT NULL DEFAULT 0,
  average_rating numeric(3,2) NOT NULL DEFAULT 0,
  historical_snippet text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS spots_city_idx ON spots(city_id);

CREATE TABLE IF NOT EXISTS establishments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  address text,
  image_url text,
  category text,
  lat double precision,
  lng double precision,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS establishments_owner_idx ON establishments(owner_user_id);

CREATE TABLE IF NOT EXISTS coupons_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id uuid NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  title text NOT NULL,
  discount text NOT NULL,
  requirement_label text,
  requires_profile boolean NOT NULL DEFAULT false,
  requires_lodging boolean NOT NULL DEFAULT false,
  min_adventure_spots int,
  is_premium boolean NOT NULL DEFAULT false,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS coupons_establishment_idx ON coupons_catalog(establishment_id);
