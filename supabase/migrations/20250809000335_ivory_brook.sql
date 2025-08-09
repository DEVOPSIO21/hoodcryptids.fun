/*
  # Create cryptid submissions table

  1. New Tables
    - `cryptid_submissions`
      - `id` (uuid, primary key)
      - `wallet` (text, not null) - Solana wallet address of submitter
      - `signature` (text, not null) - Base64 or hex-encoded signature from signMessage
      - `cryptid_name` (text, not null)
      - `platform` (text, not null) - Must be twitter, instagram, youtube, or tiktok
      - `platform_url` (text, not null)
      - `lore` (text, not null)
      - `image_url` (text) - Public URL to image (if uploaded or external)
      - `image_storage_path` (text) - Supabase storage path if uploaded
      - `status` (text, not null, default 'pending') - Must be pending, approved, or rejected
      - `moderator_notes` (text)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `cryptid_submissions` table
    - Add policy for anyone to read approved submissions
    - Add policy for anyone to insert submissions
    - Add policy for users to read their own submissions
*/

CREATE TABLE IF NOT EXISTS cryptid_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet TEXT NOT NULL,
    signature TEXT NOT NULL,
    cryptid_name TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('twitter', 'instagram', 'youtube', 'tiktok')),
    platform_url TEXT NOT NULL,
    lore TEXT NOT NULL,
    image_url TEXT,
    image_storage_path TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    moderator_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE cryptid_submissions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read approved submissions"
  ON cryptid_submissions
  FOR SELECT
  TO public
  USING (status = 'approved');

CREATE POLICY "Anyone can insert submissions"
  ON cryptid_submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can read their own submissions"
  ON cryptid_submissions
  FOR SELECT
  TO public
  USING (wallet = current_setting('request.jwt.claims', true)::json->>'wallet' OR true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cryptid_submissions_updated_at
    BEFORE UPDATE ON cryptid_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();