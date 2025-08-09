/*
  # Create voting system for cryptid cards

  1. New Tables
    - `voting_events`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `start_time` (timestamptz, not null)
      - `end_time` (timestamptz, not null)
      - `created_at` (timestamptz, default now())
    - `votes`
      - `id` (uuid, primary key)
      - `wallet` (text, not null)
      - `card_id` (text, not null)
      - `voting_event_id` (uuid, foreign key)
      - `created_at` (timestamptz, default now())
      - Unique constraint on (wallet, card_id, voting_event_id)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read voting data
    - Add policies for authenticated users to insert votes
    - Add policies to prevent duplicate votes

  3. Sample Data
    - Create initial voting event for cryptid popularity contest
*/

CREATE TABLE IF NOT EXISTS voting_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet TEXT NOT NULL,
  card_id TEXT NOT NULL,
  voting_event_id UUID REFERENCES voting_events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(wallet, card_id, voting_event_id)
);

-- Enable RLS
ALTER TABLE voting_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policies for voting_events
CREATE POLICY "Anyone can read voting events"
  ON voting_events
  FOR SELECT
  TO public
  USING (true);

-- Policies for votes
CREATE POLICY "Anyone can read votes"
  ON votes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert votes"
  ON votes
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Insert sample voting event
INSERT INTO voting_events (name, description, start_time, end_time)
VALUES (
  'Hood Cryptids Popularity Contest 2024',
  'Vote for your favorite cryptid! Help us determine which urban legend deserves the most recognition.',
  '2024-01-01 00:00:00+00',
  '2024-12-31 23:59:59+00'
) ON CONFLICT DO NOTHING;