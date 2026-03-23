-- ARORA.SYS — Supabase Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Visitor analytics ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visits (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  country    text,
  city       text,
  referrer   text,
  user_agent text
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS visits_created_at_idx ON visits (created_at DESC);
CREATE INDEX IF NOT EXISTS visits_country_idx    ON visits (country);

-- ─── Command analytics ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS command_logs (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  command    text NOT NULL,
  session_id text,
  country    text
);

CREATE INDEX IF NOT EXISTS command_logs_command_idx    ON command_logs (command);
CREATE INDEX IF NOT EXISTS command_logs_created_at_idx ON command_logs (created_at DESC);

-- ─── Guestbook ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guestbook (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  name       text NOT NULL,
  message    text NOT NULL CHECK (char_length(message) <= 280),
  country    text,
  approved   boolean DEFAULT true
);

CREATE INDEX IF NOT EXISTS guestbook_approved_idx    ON guestbook (approved);
CREATE INDEX IF NOT EXISTS guestbook_created_at_idx  ON guestbook (created_at DESC);

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Allow public reads on approved guestbook entries
ALTER TABLE guestbook ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read approved guestbook entries"
  ON guestbook FOR SELECT
  USING (approved = true);

CREATE POLICY "Service role full access"
  ON guestbook FOR ALL
  USING (auth.role() = 'service_role');

-- Visits and command_logs: write-only for anon, read for service_role
ALTER TABLE visits       ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon insert visits"
  ON visits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role read visits"
  ON visits FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Anon insert command_logs"
  ON command_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role read command_logs"
  ON command_logs FOR SELECT
  USING (auth.role() = 'service_role');
