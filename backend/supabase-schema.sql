-- ============================================================================
-- Supabase PostgreSQL Schema for Membership Portal
-- Copy and paste this directly into Supabase SQL Editor (SQL Editor > New query)
-- ============================================================================

-- 1. Enable UUID Extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Members Table
CREATE TABLE IF NOT EXISTS public.members (
    id BIGSERIAL PRIMARY KEY,
    membership_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    photo TEXT,
    designation TEXT,
    location TEXT,
    mobile TEXT NOT NULL,
    email TEXT NOT NULL,
    category TEXT NOT NULL,
    validity_start DATE,
    validity_end DATE,
    organization TEXT,
    address TEXT,
    gender TEXT,
    date_of_birth DATE,
    notes TEXT,
    is_active SMALLINT NOT NULL DEFAULT 0,
    membership_status TEXT NOT NULL DEFAULT 'Pending',
    payment_method TEXT DEFAULT 'cash',
    payment_status TEXT DEFAULT 'Pending',
    payment_amount NUMERIC(10, 2) DEFAULT 0,
    payment_reference TEXT,
    payment_date TIMESTAMPTZ,
    pan_number TEXT,
    aadhaar_number TEXT,
    pan_card TEXT,
    aadhaar_card TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_members_name ON public.members (name);
CREATE INDEX IF NOT EXISTS idx_members_category ON public.members (category);
CREATE INDEX IF NOT EXISTS idx_members_location ON public.members (location);
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members (membership_status);
CREATE INDEX IF NOT EXISTS idx_members_active ON public.members (is_active);
CREATE INDEX IF NOT EXISTS idx_members_membership_id ON public.members (membership_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members (email);

-- 3. Payments Ledger Table
CREATE TABLE IF NOT EXISTS public.payments (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT REFERENCES public.members(id) ON DELETE SET NULL,
    membership_id TEXT,
    method TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    reference_id TEXT,
    razorpay_order_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payments_member_id ON public.payments (member_id);
CREATE INDEX IF NOT EXISTS idx_payments_membership_id ON public.payments (membership_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON public.payments (method);

-- 4. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT,
    admin_user TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_user ON public.audit_logs (admin_user);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs (entity_type, entity_id);

-- 5. Revoked Tokens Blacklist Table
CREATE TABLE IF NOT EXISTS public.revoked_tokens (
    jti TEXT PRIMARY KEY,
    admin_id BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires_at ON public.revoked_tokens (expires_at);

-- 6. Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
    id BIGSERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Trigger to automatically refresh updated_at on member modification
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_members_updated_at ON public.members;
CREATE TRIGGER trigger_members_updated_at
    BEFORE UPDATE ON public.members
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revoked_tokens ENABLE ROW LEVEL SECURITY;

-- Allow public read of active & approved members in directory
CREATE POLICY "Public directory reads approved active members"
    ON public.members FOR SELECT
    USING (membership_status = 'Approved' AND is_active = 1);

-- Allow public registration (inserts with Pending status)
CREATE POLICY "Public registration inserts"
    ON public.members FOR INSERT
    WITH CHECK (true);

-- Allow service role full access on all tables
CREATE POLICY "Service role full access on members"
    ON public.members FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access on payments"
    ON public.payments FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access on audit_logs"
    ON public.audit_logs FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access on admins"
    ON public.admins FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access on revoked_tokens"
    ON public.revoked_tokens FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 7. Automatic Member Expiration Logic (Flags is_active = 0 when expired)
-- ============================================================================

-- A. Row-level trigger: Ensures any member record with an expired validity_end
-- is automatically marked inactive (is_active = 0) and Expired upon insert or update.
CREATE OR REPLACE FUNCTION public.check_member_validity_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.validity_end IS NOT NULL AND NEW.validity_end < CURRENT_DATE THEN
        NEW.is_active := 0;
        NEW.membership_status := 'Expired';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_member_validity ON public.members;
CREATE TRIGGER trg_check_member_validity
    BEFORE INSERT OR UPDATE ON public.members
    FOR EACH ROW
    EXECUTE FUNCTION public.check_member_validity_trigger();

-- B. Bulk expiration procedure: Flags all members whose validity has lapsed
CREATE OR REPLACE FUNCTION public.expire_lapsed_members()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    affected_count integer;
BEGIN
    UPDATE public.members
    SET is_active = 0,
        membership_status = 'Expired',
        updated_at = timezone('utc'::text, now())
    WHERE validity_end IS NOT NULL
      AND validity_end < CURRENT_DATE
      AND (is_active = 1 OR membership_status <> 'Expired');
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$;

-- ----------------------------------------------------------------------------
-- 5. GALLERY TABLE (CMS Media & Foundation Photos)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    caption TEXT,
    album TEXT,
    photo TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gallery_album ON public.gallery (album);
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON public.gallery (created_at DESC);

-- Enable RLS for gallery
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all gallery photos
DROP POLICY IF EXISTS "Public can view gallery photos" ON public.gallery;
CREATE POLICY "Public can view gallery photos"
    ON public.gallery FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow full access to service_role (backend server)
DROP POLICY IF EXISTS "Service role has full gallery access" ON public.gallery;
CREATE POLICY "Service role has full gallery access"
    ON public.gallery FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

