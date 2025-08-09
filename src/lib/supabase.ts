import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Cryptid {
  id: string
  name: string
  rarity: string
  tier: string
  category: string
  mood: string
  threat_level: string
  research_completion: number
  last_seen: string
  habitat: string
  active_hours: string
  first_sighting: string
  smells_like: string
  known_weakness: string
  lore: string
  field_notes: string
  incident_reports: {
    witness_credibility: string
    most_recent_sighting: string
    photographic_evidence: string
  }
  original_image: string
  nft_image: string
  animation_url: string | null
  classification: string
  created_at: string
}

export interface VotingEvent {
  id: string
  name: string
  description: string | null
  start_time: string
  end_time: string
  created_at: string
}

export interface Vote {
  id: string
  wallet: string
  card_id: string
  voting_event_id: string
  created_at: string
}

// Voting functions
export const getActiveVotingEvents = async () => {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('voting_events')
    .select('*')
    .lte('start_time', now)
    .gte('end_time', now)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as VotingEvent[]
}

export const getVotesForEvent = async (eventId: string) => {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('voting_event_id', eventId)
  
  if (error) throw error
  return data as Vote[]
}

export const getUserVotesForEvent = async (wallet: string, eventId: string) => {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('wallet', wallet)
    .eq('voting_event_id', eventId)
  
  if (error) throw error
  return data as Vote[]
}

export const submitVote = async (wallet: string, cardId: string, eventId: string) => {
  const { data, error } = await supabase
    .from('votes')
    .insert({
      wallet,
      card_id: cardId,
      voting_event_id: eventId
    })
    .select()
  
  if (error) throw error
  return data[0] as Vote
}

export const getVoteCountsForEvent = async (eventId: string) => {
  const { data, error } = await supabase
    .from('votes')
    .select('card_id')
    .eq('voting_event_id', eventId)
  
  if (error) throw error
  
  // Count votes per card
  const voteCounts: Record<string, number> = {}
  data.forEach(vote => {
    voteCounts[vote.card_id] = (voteCounts[vote.card_id] || 0) + 1
  })
  
  return voteCounts
}

// Cryptid Submissions
export interface CryptidSubmission {
  id: string
  wallet: string
  signature: string
  cryptid_name: string
  platform: 'X' | 'instagram' | 'youtube' | 'tiktok'
  platform_url: string
  lore: string
  image_url?: string
  image_storage_path?: string
  status: 'pending' | 'approved' | 'rejected'
  moderator_notes?: string
  created_at: string
  updated_at: string
}

export const submitCryptidSighting = async (submission: {
  wallet: string
  signature: string
  cryptid_name: string
  platform: 'X' | 'instagram' | 'youtube' | 'tiktok'
  platform_url: string
  lore: string
  image_url?: string
}) => {
  const { data, error } = await supabase
    .from('cryptid_submissions')
    .insert({
      wallet: submission.wallet,
      signature: submission.signature,
      cryptid_name: submission.cryptid_name,
      platform: submission.platform,
      platform_url: submission.platform_url,
      lore: submission.lore,
      image_url: submission.image_url
    })
    .select()
  
  if (error) throw error
  return data[0] as CryptidSubmission
}