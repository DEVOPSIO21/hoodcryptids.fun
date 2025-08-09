import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Heart, Loader2, Check } from 'lucide-react';
import { submitVote, getUserVotesForEvent } from '../lib/supabase';

interface VotingButtonProps {
  cryptidId: string;
  eventId: string;
  hasVoted: boolean;
  voteCount: number;
  onVoteSuccess: () => void;
}

export const VotingButton: React.FC<VotingButtonProps> = ({
  cryptidId,
  eventId,
  hasVoted,
  voteCount,
  onVoteSuccess
}) => {
  const { publicKey, signMessage } = useWallet();
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async () => {
    if (!publicKey || !signMessage) {
      setError('Please connect your wallet first');
      return;
    }

    if (hasVoted) {
      setError('You have already voted. 1 Vote per Wallet');
      return;
    }

    setIsVoting(true);
    setError(null);

    try {
      // Double-check if user has already voted (prevent race conditions)
      const existingVotes = await getUserVotesForEvent(publicKey.toString(), eventId);
      const alreadyVotedForThisCryptid = existingVotes.some(vote => vote.card_id === cryptidId);
      
      if (alreadyVotedForThisCryptid) {
        setError('You have already voted. 1 Vote per Wallet');
        setIsVoting(false);
        return;
      }

      // Create message to sign
      const message = `Vote for cryptid ${cryptidId} in event ${eventId} at ${new Date().toISOString()}`;
      const messageBytes = new TextEncoder().encode(message);
      
      // Sign the message
      const signature = await signMessage(messageBytes);
      
      // Verify signature exists (basic validation)
      if (!signature) {
        throw new Error('Failed to sign message');
      }

      // Submit vote to database
      await submitVote(publicKey.toString(), cryptidId, eventId);
      
      // Call success callback
      onVoteSuccess();
      
    } catch (err: any) {
      console.error('Voting error:', err);
      if (err.message?.includes('User rejected') || err.message?.includes('rejected')) {
        setError('Vote cancelled');
      } else if (err.message?.includes('duplicate key')) {
        setError('You have already voted. 1 Vote per Wallet');
      } else {
        setError('Failed to submit vote. Please try again.');
      }
    } finally {
      setIsVoting(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 border border-gray-600">
        <div className="flex items-center space-x-2">
          <Heart className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-400">Connect wallet to vote</span>
        </div>
        <span className="text-sm font-bold text-orange-400">{voteCount}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleVote}
        disabled={isVoting || hasVoted}
        className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-300 ${
          hasVoted
            ? 'bg-green-900/30 border-green-500/50 text-green-400'
            : isVoting
            ? 'bg-orange-900/30 border-orange-500/50 text-orange-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-500/30 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20 text-orange-400 hover:scale-105'
        }`}
      >
        <div className="flex items-center space-x-2">
          {isVoting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : hasVoted ? (
            <Check className="w-4 h-4" />
          ) : (
            <Heart className="w-4 h-4" />
          )}
          <span className="text-sm font-bold">
            {isVoting ? 'Voting...' : hasVoted ? 'Voted!' : 'Vote'}
          </span>
        </div>
        <span className="text-sm font-bold">{voteCount}</span>
      </button>
      
      {error && (
        <div className="text-xs text-red-400 bg-red-900/20 border border-red-500/30 rounded px-2 py-1">
          {error}
        </div>
      )}
    </div>
  );
};