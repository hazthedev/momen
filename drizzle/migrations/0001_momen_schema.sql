-- ============================================
-- MOMEN DATABASE SCHEMA - MIGRATION 0001
-- Fixed version of Galería schema
-- ============================================

-- ============================================
-- ENUM TYPES
-- ============================================
CREATE TYPE tenant_type AS ENUM ('white_label');
CREATE TYPE tenant_status AS ENUM ('trial', 'active', 'suspended');
CREATE TYPE user_role AS ENUM ('guest', 'organizer', 'super_admin');
CREATE TYPE event_status AS ENUM ('draft', 'active', 'ended');
CREATE TYPE photo_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');

-- ============================================
-- TENANT CONTEXT FUNCTION
-- ============================================
-- Sets the current tenant_id for RLS policies
CREATE OR REPLACE FUNCTION set_tenant_id(tenant_uuid UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', tenant_uuid::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gets the current tenant_id from session config
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- AUTO UPDATE TIMESTAMP TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TABLES
-- ============================================

-- TENANTS
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_type tenant_type NOT NULL DEFAULT 'white_label',
  brand_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  support_email TEXT,
  phone TEXT,
  domain TEXT,
  subdomain TEXT,
  is_custom_domain BOOLEAN NOT NULL DEFAULT false,
  branding JSONB NOT NULL DEFAULT '{}',
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  features_enabled JSONB NOT NULL DEFAULT '{}',
  limits JSONB NOT NULL DEFAULT '{}',
  status tenant_status NOT NULL DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role user_role NOT NULL DEFAULT 'organizer',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);

-- EVENTS
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  short_code TEXT NOT NULL UNIQUE,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  status event_status NOT NULL DEFAULT 'draft',
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- PHOTOS
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_fingerprint TEXT NOT NULL,
  images JSONB NOT NULL DEFAULT '{}',
  caption TEXT,
  contributor_name TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  status photo_status NOT NULL DEFAULT 'pending',
  reactions JSONB NOT NULL DEFAULT '{"heart": 0, "clap": 0, "laugh": 0, "wow": 0}',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

-- ATTENDANCE
CREATE TABLE IF NOT EXISTS attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  name TEXT NOT NULL,
  companions INTEGER NOT NULL DEFAULT 0,
  user_fingerprint TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS tenants_subdomain_idx ON tenants(subdomain);
CREATE INDEX IF NOT EXISTS users_tenant_email_idx ON users(tenant_id, email);
CREATE INDEX IF NOT EXISTS events_tenant_slug_idx ON events(tenant_id, slug);
CREATE INDEX IF NOT EXISTS events_organizer_idx ON events(organizer_id);
CREATE INDEX IF NOT EXISTS photos_event_idx ON photos(event_id);
CREATE INDEX IF NOT EXISTS photos_event_status_idx ON photos(event_id, status);
CREATE INDEX IF NOT EXISTS attendances_event_email_idx ON attendances(event_id, email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS attendances_event_fingerprint_idx ON attendances(event_id, user_fingerprint);

-- ============================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;

-- TENANT TABLE: Only system tenant can manage tenants
CREATE POLICY tenants_select_policy ON tenants
  FOR SELECT TO PUBLIC
  USING (id = (SELECT id FROM tenants WHERE subdomain = 'system' LIMIT 1) OR current_tenant_id() = id);

CREATE POLICY tenants_insert_policy ON tenants
  FOR INSERT WITH CHECK
  (id = (SELECT id FROM tenants WHERE subdomain = 'system' LIMIT 1) OR current_tenant_id() = id);

CREATE POLICY tenants_update_policy ON tenants
  FOR UPDATE USING (id = (SELECT id FROM tenants WHERE subdomain = 'system' LIMIT 1) OR current_tenant_id() = id);

CREATE POLICY tenants_delete_policy ON tenants
  FOR DELETE USING (id = (SELECT id FROM tenants WHERE subdomain = 'system' LIMIT 1) OR current_tenant_id() = id);

-- USERS: Tenant can only see their own users
CREATE POLICY users_select_policy ON users
  FOR SELECT TO PUBLIC
  USING (tenant_id = current_tenant_id());

CREATE POLICY users_insert_policy ON users
  FOR INSERT WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY users_update_policy ON users
  FOR UPDATE USING (tenant_id = current_tenant_id());

CREATE POLICY users_delete_policy ON users
  FOR DELETE USING (tenant_id = current_tenant_id());

-- EVENTS: Tenant can only see their own events
CREATE POLICY events_select_policy ON events
  FOR SELECT TO PUBLIC
  USING (tenant_id = current_tenant_id());

CREATE POLICY events_insert_policy ON events
  FOR INSERT WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY events_update_policy ON events
  FOR UPDATE USING (tenant_id = current_tenant_id());

CREATE POLICY events_delete_policy ON events
  FOR DELETE USING (tenant_id = current_tenant_id());

-- PHOTOS: Tenant isolation through event
CREATE POLICY photos_select_policy ON photos
  FOR SELECT TO PUBLIC
  USING (event_id IN (SELECT id FROM events WHERE tenant_id = current_tenant_id()));

CREATE POLICY photos_insert_policy ON photos
  FOR INSERT WITH CHECK
  (event_id IN (SELECT id FROM events WHERE tenant_id = current_tenant_id()));

CREATE POLICY photos_update_policy ON photos
  FOR UPDATE USING
  (event_id IN (SELECT id FROM events WHERE tenant_id = current_tenant_id()));

CREATE POLICY photos_delete_policy ON photos
  FOR DELETE USING
  (event_id IN (SELECT id FROM events WHERE tenant_id = current_tenant_id()));

-- ATTENDANCE: Tenant isolation through event
CREATE POLICY attendances_select_policy ON attendances
  FOR SELECT TO PUBLIC
  USING (event_id IN (SELECT id FROM events WHERE tenant_id = current_tenant_id()));

CREATE POLICY attendances_insert_policy ON attendances
  FOR INSERT WITH CHECK
  (event_id IN (SELECT id FROM events WHERE tenant_id = current_tenant_id()));

CREATE POLICY attendances_update_policy ON attendances
  FOR UPDATE USING
  (event_id IN (SELECT id FROM events WHERE tenant_id = current_tenant_id()));

CREATE POLICY attendances_delete_policy ON attendances
  FOR DELETE USING
  (event_id IN (SELECT id FROM events WHERE tenant_id = current_tenant_id()));

-- ============================================
-- TRIGGERS (auto-update updated_at)
-- ============================================
CREATE TRIGGER tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER photos_updated_at BEFORE UPDATE ON photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRATION VERSION TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS migration_version (
  version INTEGER PRIMARY KEY
);

INSERT INTO migration_version (version) VALUES (1)
  ON CONFLICT (version) DO NOTHING;
