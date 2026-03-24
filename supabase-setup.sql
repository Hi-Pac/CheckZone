-- ============================================================
-- CheckZone – Supabase Database Setup
-- Run this SQL in the Supabase SQL Editor (app.supabase.com)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. EMPLOYEES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employees (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid        text        NOT NULL UNIQUE,          -- device UUID
    name        text        NOT NULL,
    department  text,
    created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Allow anonymous reads & inserts (the PWA uses the anon key)
CREATE POLICY "anon_select_employees"
    ON employees FOR SELECT
    USING (true);

CREATE POLICY "anon_insert_employees"
    ON employees FOR INSERT
    WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- 2. ATTENDANCE
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
    id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid         text        NOT NULL REFERENCES employees(uuid) ON DELETE CASCADE,
    name         text        NOT NULL,
    date         text        NOT NULL,   -- YYYY-MM-DD
    time         text        NOT NULL,   -- HH:MM:SS
    timestamp    bigint      NOT NULL,   -- Unix ms
    type         text        NOT NULL CHECK (type IN ('حضور','انصراف')),
    work_hours   numeric,
    coordinates  jsonb,                  -- {latitude, longitude, accuracy}
    device_info  jsonb,                  -- {userAgent, platform, vendor}
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attendance_uuid       ON attendance(uuid);
CREATE INDEX IF NOT EXISTS idx_attendance_date       ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_uuid_date  ON attendance(uuid, date);
CREATE INDEX IF NOT EXISTS idx_attendance_timestamp  ON attendance(timestamp DESC);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_attendance"
    ON attendance FOR SELECT
    USING (true);

CREATE POLICY "anon_insert_attendance"
    ON attendance FOR INSERT
    WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- 3. DEDUCTION RULES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deduction_rules (
    id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    name             text        NOT NULL,
    minutes_late_min int         NOT NULL DEFAULT 0,  -- lower bound (inclusive)
    minutes_late_max int,                              -- upper bound (NULL = no cap)
    deduction_type   text        NOT NULL DEFAULT 'fixed' CHECK (deduction_type IN ('fixed','percentage')),
    deduction_value  numeric     NOT NULL,
    created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE deduction_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_deduction_rules"
    ON deduction_rules FOR SELECT
    USING (true);

CREATE POLICY "admin_all_deduction_rules"
    ON deduction_rules FOR ALL
    USING (auth.role() = 'authenticated');

-- ────────────────────────────────────────────────────────────
-- 4. PENALTIES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS penalties (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid            text        NOT NULL REFERENCES employees(uuid) ON DELETE CASCADE,
    date            text        NOT NULL,
    reason          text        NOT NULL,
    deduction_amount numeric    NOT NULL DEFAULT 0,
    applied_by      text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE penalties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_penalties"
    ON penalties FOR SELECT
    USING (true);

CREATE POLICY "admin_all_penalties"
    ON penalties FOR ALL
    USING (auth.role() = 'authenticated');

-- ────────────────────────────────────────────────────────────
-- 5. REWARDS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rewards (
    id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid          text        NOT NULL REFERENCES employees(uuid) ON DELETE CASCADE,
    date          text        NOT NULL,
    reason        text        NOT NULL,
    reward_amount numeric     NOT NULL DEFAULT 0,
    granted_by    text,
    created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_rewards"
    ON rewards FOR SELECT
    USING (true);

CREATE POLICY "admin_all_rewards"
    ON rewards FOR ALL
    USING (auth.role() = 'authenticated');

-- ────────────────────────────────────────────────────────────
-- 6. SETTINGS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
    key        text PRIMARY KEY,
    value      text NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_settings"
    ON settings FOR SELECT
    USING (true);

CREATE POLICY "admin_all_settings"
    ON settings FOR ALL
    USING (auth.role() = 'authenticated');

-- Seed default settings (replace coordinates with your actual office location)
INSERT INTO settings (key, value) VALUES
    ('company_latitude',    '0.0'),         -- Replace with your office latitude
    ('company_longitude',   '0.0'),         -- Replace with your office longitude
    ('allowed_radius_m',    '25'),
    ('checkin_cutoff_hour', '14'),           -- before this hour → حضور, after → انصراف
    ('telegram_bot_token',  ''),
    ('telegram_chat_id',    '')
ON CONFLICT (key) DO NOTHING;
