-- ============================================
-- MOMEN SEED DATA
-- Initial data for development
-- ============================================

-- ============================================
-- SYSTEM TENANT
-- ============================================
INSERT INTO tenants (id, subdomain, brand_name, company_name, contact_email, subscription_tier, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'system',
  'Momen System',
  'Momen Platform',
  'system@momen.app',
  'enterprise',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- DEFAULT TENANT (for development)
-- ============================================
INSERT INTO tenants (id, subdomain, brand_name, company_name, contact_email, subscription_tier, status)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'demo',
  'Demo Tenant',
  'Demo Company',
  'demo@momen.app',
  'pro',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ADMIN USER (for system tenant)
-- ============================================
-- Password: admin123 (change in production!)
INSERT INTO users (id, tenant_id, email, password_hash, name, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'admin@momen.app',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewd5j4xOO9kKz8qN5', -- admin123
  'System Admin',
  'super_admin'
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- DEMO USER (for demo tenant)
-- ============================================
-- Password: demo123
INSERT INTO users (id, tenant_id, email, password_hash, name, role)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  'demo@momen.app',
  '$2a$12$EixZaYVK1fsbw1ZfbX3x2P5EX5HvK4u2UQZ3yXaXvXZxKz8qN5', -- demo123
  'Demo User',
  'organizer'
) ON CONFLICT (id) DO NOTHING;
