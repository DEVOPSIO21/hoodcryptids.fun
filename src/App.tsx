import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, MapPin, Zap, Heart, Shield, DoorClosed as Nose, ExternalLink, TrendingUp, Users, Star, Flame, Skull, X, MessageCircle } from 'lucide-react';
import { supabase, type Cryptid, type VotingEvent, getActiveVotingEvents, getVoteCountsForEvent, getUserVotesForEvent } from './lib/supabase';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from './components/WalletButton';
import { TokenomicsSection } from './components/TokenomicsSection';
import { VotingButton } from './components/VotingButton';
import { RoadmapModal } from './components/RoadmapModal';
import { ComingSoonModal } from './components/ComingSoonModal';
import { ReportSightingModal } from './components/ReportSightingModal';
import './animations.css';

function App() {
  const { publicKey } = useWallet();
  const [cryptids, setCryptids] = useState<Cryptid[]>([]);
  const [selectedCryptid, setSelectedCryptid] = useState<Cryptid | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [heroCryptid, setHeroCryptid] = useState<Cryptid | null>(null);
  const [activeVotingEvent, setActiveVotingEvent] = useState<VotingEvent | null>(null);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [showReportSightingModal, setShowReportSightingModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ---- helpers / safety ----
  const safe = (s?: string | null, n = 80) => {
    if (!s) return '';
    return s.length > n ? `${s.slice(0, n)}…` : s;
  };

  // Tailwind class maps (prevents purge issues)
  const tierGradientMap: Record<string, string> = {
    'SSS+': 'from-red-500 via-orange-500 to-yellow-400',
    'S+': 'from-purple-500 via-pink-500 to-red-400',
    'A': 'from-blue-500 via-cyan-400 to-green-400',
    'B': 'from-green-400 to-blue-400',
    'C': 'from-gray-400 to-gray-600',
    default: 'from-gray-600 to-gray-400',
  };

  const getTierColor = (tier: string) => tierGradientMap[tier] ?? tierGradientMap.default;

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'SSS+': return 'SSS+ LEGENDARY';
      case 'S+': return 'S TIER EPIC';
      case 'A': return 'A TIER RARE';
      case 'B': return 'B TIER UNCOMMON';
      case 'C': return 'C TIER UNUSUAL';
      default: return tier;
    }
  };

  // Stable random rotations per cryptid id
  const rotationClasses = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2', 'rotate-3', '-rotate-3'];
  const rotationMapRef = useRef<Map<string, string>>(new Map());
  const getStableRotation = (id: string) => {
    const map = rotationMapRef.current;
    if (!map.has(id)) {
      const c = rotationClasses[Math.floor(Math.random() * rotationClasses.length)];
      map.set(id, c);
    }
    return map.get(id)!;
  };
  // One-off rotation for "Coming Soon" card
  const comingSoonRotation = useMemo(
    () => rotationClasses[Math.floor(Math.random() * rotationClasses.length)],
    []
  );

  // Scroll: rAF throttled
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // parallel, separate loading flag applies to cryptids list
    fetchCryptids();
    fetchVotingData();
  }, []);

  useEffect(() => {
    if (cryptids.length > 0 && !heroCryptid) {
      const randomCryptid = cryptids[Math.floor(Math.random() * cryptids.length)];
      setHeroCryptid(randomCryptid);
    }
  }, [cryptids, heroCryptid]);

  useEffect(() => {
    if (publicKey && activeVotingEvent) {
      fetchUserVotes();
    }
  }, [publicKey, activeVotingEvent]);

  const fetchCryptids = async () => {
    try {
      const { data, error } = await supabase
        .from('cryptids')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCryptids(data || []);
    } catch (error) {
      console.error('Error fetching cryptids:', error);
      setCryptids([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVotingData = async () => {
    try {
      const events = await getActiveVotingEvents();
      if (events.length > 0) {
        const event = events[0]; // first active
        setActiveVotingEvent(event);

        const counts = await getVoteCountsForEvent(event.id);
        setVoteCounts(counts);
      } else {
        setActiveVotingEvent(null);
        setVoteCounts({});
      }
    } catch (error) {
      console.error('Error fetching voting data:', error);
    }
  };

  const fetchUserVotes = async () => {
    if (!publicKey || !activeVotingEvent) return;

    try {
      const votes = await getUserVotesForEvent(publicKey.toString(), activeVotingEvent.id);
      const votedCardIds = new Set(votes.map(vote => vote.card_id));
      setUserVotes(votedCardIds);
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  };

  const handleVoteSuccess = async () => {
    // refresh after a successful vote; ensure order with awaits
    try {
      await fetchVotingData();
      if (publicKey && activeVotingEvent) {
        await fetchUserVotes();
      }
    } catch (e) {
      console.error('Error refreshing vote state:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-orange-900 text-white overflow-x-hidden">
      {/* Parallax Film Strip Background */}
      {cryptids.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-0 opacity-15">
          <div className="film-strip-container">
            {/* Top Diagonal Film Strip */}
            <div
              className="film-strip film-strip-top"
              style={{ transform: `translateX(${-scrollY * 0.5}px)` }}
            >
              {[...cryptids, ...cryptids].map((cryptid, index) => (
                <div key={`top-${cryptid.id}-${index}`} className="film-frame">
                  <img
                    src={cryptid.nft_image}
                    alt=""
                    className="film-image"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            {/* Middle Diagonal Film Strip (Opposite Direction) */}
            <div
              className="film-strip film-strip-middle"
              style={{ transform: `translateX(${scrollY * 0.3}px)` }}
            >
              {[...cryptids, ...cryptids].map((cryptid, index) => (
                <div key={`middle-${cryptid.id}-${index}`} className="film-frame">
                  <img
                    src={cryptid.nft_image}
                    alt=""
                    className="film-image"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            {/* Bottom Diagonal Film Strip */}
            <div
              className="film-strip film-strip-bottom"
              style={{ transform: `translateX(${-scrollY * 0.7}px)` }}
            >
              {[...cryptids, ...cryptids].map((cryptid, index) => (
                <div key={`bottom-${cryptid.id}-${index}`} className="film-frame">
                  <img
                    src={cryptid.nft_image}
                    alt=""
                    className="film-image"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            {/* Vertical Film Strips */}
            <div
              className="film-strip film-strip-left"
              style={{ transform: `translateY(${-scrollY * 0.4}px)` }}
            >
              {[...cryptids].map((cryptid, index) => (
                <div key={`left-${cryptid.id}-${index}`} className="film-frame film-frame-vertical">
                  <img
                    src={cryptid.nft_image}
                    alt=""
                    className="film-image"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            <div
              className="film-strip film-strip-right"
              style={{ transform: `translateY(${scrollY * 0.6}px)` }}
            >
              {[...cryptids].map((cryptid, index) => (
                <div key={`right-${cryptid.id}-${index}`} className="film-frame film-frame-vertical">
                  <img
                    src={cryptid.nft_image}
                    alt=""
                    className="film-image"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-10">
        <div className="absolute top-20 left-10 text-6xl opacity-10 floating">👻</div>
        <div className="absolute top-40 right-20 text-4xl opacity-15 floating" style={{ animationDelay: '1s' }}>🔥</div>
        <div className="absolute bottom-40 left-20 text-5xl opacity-10 floating" style={{ animationDelay: '2s' }}>💀</div>
        <div className="absolute top-60 left-1/2 text-3xl opacity-10 floating" style={{ animationDelay: '0.5s' }}>⚡</div>
        <div className="absolute bottom-20 right-10 text-4xl opacity-10 floating" style={{ animationDelay: '1.5s' }}>⚡</div>
      </div>

      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-md border-b-2 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center space-x-3 group relative">
              <div className="relative -mt-2 -mb-2">
                <img 
                  src="https://hcwlzapihxurjezqmgea.supabase.co/storage/v1/object/public/cryptid-images/logo.png" 
                  alt="Hood Cryptids Logo" 
                  className="h-20 w-20 glitch-text group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-orange-500 glitch-text leading-none" style={{ fontFamily: '"Permanent Marker", "Creepster", cursive' }}>HOOD CRYPTIDS</span>
                <span className="text-xs text-orange-300/80 font-bold tracking-wider">RESEARCH INSTITUTE</span>
              </div>
            </div>

            {/* Center: Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 bg-black/30 rounded-full px-6 py-2 border border-orange-500/20 backdrop-blur-sm">
              <a href="#cryptids" className="px-4 py-2 text-orange-300 hover:text-white hover:bg-orange-500/20 font-bold transition-all duration-300 rounded-full text-sm">
                📁 Cryptids
              </a>
              <a href="#roadmap" className="px-4 py-2 text-orange-300 hover:text-white hover:bg-orange-500/20 font-bold transition-all duration-300 rounded-full text-sm">
                🗺️ Roadmap
              </a>
              <a href="#tokenomics" className="px-4 py-2 text-orange-300 hover:text-white hover:bg-orange-500/20 font-bold transition-all duration-300 rounded-full text-sm">
                💰 Tokenomics
              </a>
              <a href="#research" className="px-4 py-2 text-orange-300 hover:text-white hover:bg-orange-500/20 font-bold transition-all duration-300 rounded-full text-sm">
                🔬 Research
              </a>
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3">
              {/* Buy Button */}
              <button
                onClick={() => setShowComingSoonModal(true)}
                className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-black font-bold px-5 py-2.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-green-500/30 hover:scale-105 border-2 border-green-400/50"
              >
                <span className="text-lg">💎</span>
                <span className="text-sm">Buy $CRYPTIDS</span>
              </button>
              
              {/* Wallet Button */}
              <WalletButton />
              
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 bg-orange-500/20 hover:bg-orange-500/30 rounded-full border border-orange-500/30 transition-all duration-300"
              >
                <div className={`flex flex-col space-y-1 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-45' : ''}`}>
                  <div className={`w-4 h-0.5 bg-orange-500 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-90 translate-y-1.5' : ''}`}></div>
                  <div className={`w-4 h-0.5 bg-orange-500 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
                  <div className={`w-4 h-0.5 bg-orange-500 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-90 -translate-y-1.5' : ''}`}></div>
                </div>
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className={`lg:hidden transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-96 mt-4 pt-4 border-t border-orange-500/20' : 'max-h-0'}`}>
            <div className="grid grid-cols-2 gap-2">
              <a 
                href="#cryptids" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-2 px-3 py-2 text-orange-300 hover:text-white hover:bg-orange-500/20 font-bold transition-all duration-300 rounded-lg text-sm"
              >
                <span>📁</span>
                <span>Cryptids</span>
              </a>
              <a 
                href="#roadmap" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-2 px-3 py-2 text-orange-300 hover:text-white hover:bg-orange-500/20 font-bold transition-all duration-300 rounded-lg text-sm"
              >
                <span>🗺️</span>
                <span>Roadmap</span>
              </a>
              <a 
                href="#tokenomics" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-2 px-3 py-2 text-orange-300 hover:text-white hover:bg-orange-500/20 font-bold transition-all duration-300 rounded-lg text-sm"
              >
                <span>💰</span>
                <span>Tokenomics</span>
              </a>
              <a 
                href="#research" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-2 px-3 py-2 text-orange-300 hover:text-white hover:bg-orange-500/20 font-bold transition-all duration-300 rounded-lg text-sm"
              >
                <span>🔬</span>
                <span>Research</span>
              </a>
            </div>
            <div className="mt-3 flex justify-center">
              <button
                onClick={() => setShowComingSoonModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-black font-bold px-6 py-2.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-green-500/30 hover:scale-105 border-2 border-green-400/50"
              >
                <span className="text-lg">💎</span>
                <span className="text-sm">Buy $CRYPTIDS</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Social Media Icons */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col space-y-4">
        {/* Twitter/X */}
        <a
          href="https://x.com/hood_cryptids"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative bg-gradient-to-br from-black via-gray-900 to-orange-900/30 p-3 rounded-full border-2 border-orange-500/30 hover:border-orange-500 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-orange-500/30 backdrop-blur-sm"
          title="Follow us on Twitter/X"
          aria-label="Follow Hood Cryptids on Twitter/X"
        >
          <img 
            src="https://www.freeiconspng.com/thumbs/x-logo/black-x-logo-twitter-new-emblem-png-2.png"
            alt="X/Twitter"
            className="w-6 h-6 group-hover:scale-110 transition-transform duration-300"
          />
          
          {/* Tooltip */}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-black/90 text-orange-400 text-sm font-bold px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            Twitter/X
          </div>
        </a>

        {/* Telegram */}
        <a
          href="https://t.me/hoodcryptidss"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative bg-gradient-to-br from-black via-gray-900 to-orange-900/30 p-3 rounded-full border-2 border-orange-500/30 hover:border-orange-500 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-orange-500/30 backdrop-blur-sm"
          title="Join our Telegram"
          aria-label="Join Hood Cryptids Telegram"
        >
          <img 
            src="https://cdn0.iconfinder.com/data/icons/tuts/256/telegram.png"
            alt="Telegram"
            className="w-6 h-6 group-hover:scale-110 transition-transform duration-300"
          />
          
          {/* Tooltip */}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-black/90 text-orange-400 text-sm font-bold px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            Telegram
          </div>
        </a>
      </div>

      {/* Mobile Floating Social Icons */}
      <div className="fixed bottom-6 right-6 z-30 flex sm:hidden space-x-3">
        {/* Twitter/X */}
        <a
          href="https://x.com/hood_cryptids"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-br from-black via-gray-900 to-orange-900/30 p-2.5 rounded-full border-2 border-orange-500/30 hover:border-orange-500 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-orange-500/30 backdrop-blur-sm"
          aria-label="Follow Hood Cryptids on Twitter/X"
        >
          <img 
            src="https://pngdownload.io/wp-content/uploads/2023/12/X-Logo-Twitter-Logo-Iconic-Social-Media-Brand-Symbol-PNG-Transparent-Recognizable-Emblem-jpg.webp"
            alt="X/Twitter"
            className="w-5 h-5"
          />
        </a>

        {/* Telegram */}
        <a
          href="https://t.me/hoodcryptidss"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-br from-black via-gray-900 to-orange-900/30 p-2.5 rounded-full border-2 border-orange-500/30 hover:border-orange-500 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-orange-500/30 backdrop-blur-sm"
          aria-label="Join Hood Cryptids Telegram"
        >
          <img 
            src="https://e7.pngegg.com/pngimages/590/916/png-clipart-computer-icons-telegram-graphics-messaging-apps-mobile-app-telegram-orange-triangle.png"
            alt="Telegram"
            className="w-5 h-5"
          />
        </a>
      </div>

      {/* Fixed Floating Stats Dock */}
      <div className="fixed top-24 right-6 z-30 bg-gradient-to-r from-black via-gray-900 to-orange-900/30 rounded-full px-4 py-2 border border-orange-500/50 shadow-xl shadow-orange-500/20 backdrop-blur-md">
        <div className="flex items-center space-x-4 text-center">
          <div className="flex flex-col">
            <div className="text-sm font-black text-orange-500">{cryptids.length}</div>
            <div className="text-xs text-gray-400">Confirmed</div>
          </div>
          <div className="w-px h-6 bg-orange-500/30"></div>
          <div className="flex flex-col">
            <div className="text-sm font-black text-orange-400">47</div>
            <div className="text-xs text-gray-400">Sites</div>
          </div>
          <div className="w-px h-6 bg-orange-500/30"></div>
          <div className="flex flex-col">
            <div className="text-sm font-black text-orange-300">1B</div>
            <div className="text-xs text-gray-400">Supply</div>
          </div>
          <div className="w-px h-6 bg-orange-500/30"></div>
          <div className="flex flex-col">
            <div className="text-sm font-black text-orange-200">99.9%</div>
            <div className="text-xs text-gray-400">Accuracy</div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 bg-gradient-to-b from-transparent to-black/20 z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Left Side */}
            <div className="lg:col-span-2 space-y-6">
              <div className="text-center lg:text-left">
                <div className="text-4xl md:text-5xl font-black text-orange-500 mb-3 glitch-text" data-text="Hood Cryptids" style={{ fontFamily: '"Permanent Marker", "Creepster", cursive' }}>
                  Hood Cryptids
                </div>
                <div className="text-lg md:text-xl font-bold text-orange-400 mb-4">
                  Urban Legend Documentation Initiative
                </div>
                <p className="text-gray-300 text-base leading-relaxed mb-6">
                  The Hood Cryptid Research Institute (HCRI) maintains the world's most comprehensive database of neighborhood anomalies, convenience store entities, and public transit phenomena.
                </p>
              </div>

              <div className="bg-gradient-to-br from-black via-gray-900 to-orange-900/30 rounded-2xl p-6 border-2 border-orange-500/30 shadow-xl">
                <h3 className="text-lg font-black text-orange-400 mb-4 flex items-center">
                  <span className="text-2xl mr-2">📊</span>
                  HCRI Research Division
                </h3>
                
                {/* CA Warning Section */}
                <div className="mb-4 text-center">
                  <div className="inline-block bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-black px-4 py-2 rounded-full shadow-lg mb-2">
                    CA: Coming Soon!
                  </div>
                  <p className="text-xs text-red-400 leading-tight">
                    We have not yet released, any CA's claiming to be us are scams!
                  </p>
                </div>
                
                {/* Stats Grid - More Compact */}
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-lg font-black text-orange-500">{cryptids.length}</div>
                    <div className="text-gray-400 text-xs">Docs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black text-orange-400">47</div>
                    <div className="text-gray-400 text-xs">Sites</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black text-orange-300">24/7</div>
                    <div className="text-gray-400 text-xs">Live</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black text-orange-200">99.9%</div>
                    <div className="text-gray-400 text-xs">Accurate*</div>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-2 italic text-center">
                  *Accuracy based on vibes and peer-reviewed meme analysis
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-2xl p-6 border-2 border-orange-400/30">
                <h3 className="text-lg font-black text-orange-400 mb-3 flex items-center">
                  <span className="text-2xl mr-2">🔬</span>
                  Scientific Methodology
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-500">▸</span>
                    <span>Advanced smartphone documentation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-500">▸</span>
                    <span>Peer-reviewed witness testimonies</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-500">▸</span>
                    <span>Behavioral pattern analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-500">▸</span>
                    <span>Real-time threat assessment</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Featured Cryptids */}
            <div className="lg:col-span-3">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-black text-orange-400 mb-2">🔥 Most Active Specimens</h3>
                <p className="text-sm text-gray-400">Currently under intensive observation</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cryptids.slice(0, 3).map((cryptid, index) => (
                  <div
                    key={cryptid.id}
                    onClick={() => setSelectedCryptid(cryptid)}
                    className={`group bg-gradient-to-br from-black via-gray-900 to-orange-900/20 rounded-2xl border-2 border-orange-500/30 overflow-hidden cursor-pointer hover:scale-105 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-500 ${getStableRotation(cryptid.id)} hover:rotate-0`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    {/* Tier Badge */}
                    <div className="p-3">
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-black bg-gradient-to-r ${getTierColor(cryptid.tier)} text-black shadow-lg`}>
                        {cryptid.tier}
                      </div>
                    </div>

                    {/* NFT Image */}
                    <div className="relative aspect-square overflow-hidden mx-3 mb-3 rounded-xl border-2 border-orange-500/30">
                      <img
                        src={cryptid.nft_image}
                        alt={cryptid.name}
                        className="w-full h-full object-contain bg-black group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                      {/* Mood/Threat pill moved to bottom center */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg max-w-[85%] truncate">
                        {safe(cryptid.mood ?? cryptid.threat_level, 40)}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3 pt-0">
                      <h4 className="text-lg font-black mb-2 text-orange-500 truncate">
                        {safe(cryptid.name, 50)}
                      </h4>

                      <div className="space-y-1 text-xs mb-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Last Seen:</span>
                          <span className="text-orange-400 font-bold text-right truncate ml-2">{safe(cryptid.last_seen, 20)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Research:</span>
                          <span className="text-orange-400 font-bold">{cryptid.research_completion ?? 0}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Status:</span>
                          <span className="text-green-400 font-bold">ACTIVE</span>
                        </div>
                      </div>

                      <p className="text-gray-300 text-xs leading-relaxed mb-3">
                        {safe(cryptid.lore, 80)}
                      </p>

                      {/* Action Button (button semantics) */}
                      <div className="text-center">
                        <button
                          type="button"
                          className="bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-bold py-2 px-4 rounded-full hover:from-orange-500 hover:to-red-500 transition-colors duration-300"
                          aria-label={`View file for ${cryptid.name}`}
                        >
                          📋 View File
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Button */}
              <div className="text-center mt-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <a
                    href="#cryptids"
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-black to-orange-900/30 border-2 border-orange-500/50 text-orange-400 font-bold py-3 px-6 rounded-full hover:border-orange-500 hover:scale-105 transition-all duration-300"
                  >
                    <span>🗂️</span>
                    <span>Access Full Database</span>
                    <span className="text-sm">({cryptids.length} Files)</span>
                  </a>

                  <div className="text-center">
                    <a
                      href="#cryptids"
                      className="text-xs text-gray-400 hover:text-orange-400 transition-colors duration-300 underline hover:no-underline"
                    >
                      Witnessed something unexplainable? Our research team is standing by.
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cryptids Section */}
      <section id="cryptids" className="py-20 px-4 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-6 glitch-text" data-text="Active Cryptid Database" style={{ fontFamily: '"Permanent Marker", "Creepster", cursive' }}>Active Cryptid Database</h2>
            <p className="text-xl text-gray-300">Our highly trained researchers have catalogued these specimens with utmost scientific precision</p>
            {activeVotingEvent && (
              <div className="mt-6 bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-xl p-4 max-w-2xl mx-auto">
                <h3 className="text-lg font-black text-orange-400 mb-2">{activeVotingEvent.name}</h3>
                <p className="text-sm text-gray-300">{activeVotingEvent.description}</p>
                <p className="text-xs text-orange-300 mt-2">Connect your wallet and vote for your favorite cryptids!</p>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="text-4xl text-orange-500 glitch-text" data-text="Loading the weirdness..." style={{ fontFamily: '"Permanent Marker", "Creepster", cursive' }}>Loading the weirdness...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cryptids.map((cryptid, index) => (
                <div
                  key={cryptid.id}
                  onClick={() => setSelectedCryptid(cryptid)}
                  className={`bg-gradient-to-br from-black via-gray-900 to-orange-900/20 rounded-2xl border-2 border-orange-500/30 overflow-hidden cursor-pointer hover:scale-105 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-500 ${getStableRotation(cryptid.id)} hover:rotate-0`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Tier Badge */}
                  <div className="p-4">
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r ${getTierColor(cryptid.tier)} text-black shadow-lg`}>
                      {getTierLabel(cryptid.tier)}
                    </div>
                  </div>

                  {/* NFT Image */}
                  <div className="relative aspect-square overflow-hidden mx-4 mb-4 rounded-xl border-2 border-orange-500/30 group">
                    <img
                      src={cryptid.nft_image}
                      alt={cryptid.name}
                      className="w-full h-full object-contain bg-black group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Mood/Threat pill at bottom center */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg max-w-[85%] truncate">
                      {safe(cryptid.mood ?? cryptid.threat_level, 40)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 pt-0">
                    <h3 className="text-xl font-black mb-3 text-orange-500">
                      {safe(cryptid.name, 60)}
                    </h3>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Last Seen:</span>
                        <span className="text-orange-400 font-bold text-right">{safe(cryptid.last_seen, 40)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Threat Level:</span>
                        <span className="text-red-500 font-black">{safe(cryptid.threat_level, 24)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Researched:</span>
                        <span className="text-orange-400 font-bold">{cryptid.research_completion ?? 0}% 🔬</span>
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm leading-relaxed">
                      {safe(cryptid.lore, 120)}
                    </p>
                  </div>

                  {/* Voting Section (stop propagation so button clicks don't open modal) */}
                  <div onClick={(e) => e.stopPropagation()} className="px-4 pb-4">
                    {activeVotingEvent && (
                      <VotingButton
                        cryptidId={cryptid.id}
                        eventId={activeVotingEvent.id}
                        hasVoted={userVotes.has(cryptid.id)}
                        voteCount={voteCounts[cryptid.id] || 0}
                        onVoteSuccess={handleVoteSuccess}
                      />
                    )}
                  </div>
                </div>
              ))}

              {/* Coming Soon Card */}
              <div className={`bg-gradient-to-br from-black to-orange-900/20 rounded-2xl border-2 border-dashed border-orange-400 overflow-hidden ${comingSoonRotation} hover:rotate-0 hover:scale-105 transition-all duration-500`}>
                {/* Header */}
                <div className="p-4 border-b border-orange-400/30">
                  <div className="text-6xl mb-2">❓</div>
                  <h3 className="text-2xl font-black text-orange-400">More Cryptids Soon</h3>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-medium">Status:</span>
                      <span className="text-orange-300 font-bold">Under Investigation</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-medium">ETA:</span>
                      <span className="text-orange-300 font-bold">Soon™</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-medium">Hype Level:</span>
                      <span className="text-orange-300 font-bold">Maximum</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                    Our research team is currently investigating several new urban legends. Stay tuned!
                  </p>

                  {/* Report Sightings Button */}
                  <button
                    onClick={() => setShowReportSightingModal(true)}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-black font-bold py-3 px-4 rounded-full hover:from-orange-400 hover:to-red-400 transition-all duration-300 shadow-lg hover:shadow-orange-500/30 hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <span>🚨</span>
                    <span>Report Sightings</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Roadmap Section (unchanged visuals) */}
      <section id="roadmap" className="py-20 px-4 bg-gradient-to-r from-black via-orange-900/10 to-black relative z-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-6 glitch-text" data-text="Hood Cryptids Roadmap" style={{ fontFamily: '"Permanent Marker", "Creepster", cursive' }}>📍 Hood Cryptids Roadmap</h2>
            <p className="text-xl text-gray-300">The master plan for urban legend domination</p>
          </div>

          {/* Graffiti Blob Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[
              {
                phase: "Phase 0: Project Foundation",
                icon: "🏗️",
                progress: 100,
                status: "complete",
                items: [
                  "Brand + identity locked in",
                  "Supabase cryptid model created",
                  "Lore generation & insertion system live"
                ]
              },
              {
                phase: "Phase 1: Platform Launch",
                icon: "🚀",
                progress: 85,
                status: "active",
                items: [
                  "Launch hoodcryptids.com",
                  "Cryptid profiles live with metadata",
                  "Filtering + homepage rollout",
                  "Twitter/X and Telegram",
                  "Token on pump.fun or letsbonk.fun"
                ]
              },
              {
                phase: "Phase 2: NFT Minting",
                icon: "🎨",
                progress: 0,
                status: "locked",
                items: [
                  "NFT contract deployed (Solana or Base)",
                  "Cryptid images + lore tied to NFTs",
                  "Public mint + holder Discord gating"
                ]
              },
              {
                phase: "Phase 3: Cryptid Expansion Pack",
                icon: "📦",
                progress: 0,
                status: "locked",
                items: [
                  "50+ new cryptids in waves",
                  "Community-submitted lore",
                  "Geo-tagged sightings & rarity unlocks",
                  "Airdrop for early holders"
                ]
              },
              {
                phase: "Phase 4: Advanced Mechanics",
                icon: "🎮",
                progress: 0,
                status: "locked",
                items: [
                  "Meme bounties, staking mechanics",
                  "Cryptid factions + leveling",
                  "Street rep leaderboards",
                  "Meme-to-earn + faction wars"
                ]
              },
              {
                phase: "Phase 5: Cultural Infiltration",
                icon: "🌍",
                progress: 0,
                status: "locked",
                items: [
                  "Merch + QR NFTs",
                  "IRL Snap lenses",
                  "Collabs with rap meme pages"
                ]
              }
            ].map((phase, index) => {
              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'complete': return 'from-orange-400 to-orange-500';
                  case 'active': return 'from-orange-500 to-red-500';
                  default: return 'from-gray-700 to-gray-800';
                }
              };

              const getStatusBadge = (status: string) => {
                switch (status) {
                  case 'complete': return { text: '✅ DONE', color: 'bg-orange-500 text-black' };
                  case 'active': return { text: 'LIVE', color: 'bg-gradient-to-r from-orange-500 to-red-500 text-black animate-pulse' };
                  default: return { text: '🔒 LOCKED', color: 'bg-gray-700 text-gray-300' };
                }
              };

              const statusBadge = getStatusBadge(phase.status);

              return (
                <div
                  key={index}
                  className={`bg-gradient-to-br from-black via-gray-900 to-orange-900/20 rounded-2xl border-2 border-orange-500/30 p-6 hover:scale-105 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-500 ${getStableRotation(`roadmap-${index}`)} hover:rotate-0`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">{phase.icon}</div>
                    <div className={`px-3 py-1 rounded-full text-xs font-black ${statusBadge.color}`}>
                      {statusBadge.text}
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-orange-400 mb-4">{phase.phase}</h3>

                  <div className="space-y-2 mb-4">
                    {phase.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start space-x-2 text-sm">
                        <span className="text-orange-500 mt-1">▸</span>
                        <span className="text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-400">Progress</span>
                      <span className="text-xs font-bold text-orange-400">{phase.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${getStatusColor(phase.status)} h-2 rounded-full transition-all duration-1000`}
                        style={{ width: `${phase.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tokenomics Section */}
      <TokenomicsSection />

      {/* Footer */}
      <footer className="border-t-2 border-orange-500 py-4 px-4 bg-gradient-to-t from-black to-gray-900 relative z-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="flex items-center space-x-3">
              <Eye className="h-6 w-6 text-orange-500 glitch-text" />
              <span className="text-xl font-black text-orange-500 gradient-text">Hood Cryptids</span>
            </div>
          </div>

          <p className="text-sm text-gray-300 mb-3">Documenting urban legends, one meme at a time.</p>

          <div className="flex flex-wrap justify-center gap-4 mb-3">
            <a href="https://x.com/hood_cryptids" target="_blank" rel="noopener noreferrer" className="text-orange-300 hover:text-orange-500 transition-colors font-bold">Twitter</a>
            <a href="https://t.me/hoodcryptidss" target="_blank" rel="noopener noreferrer" className="text-orange-300 hover:text-orange-500 transition-colors font-bold">Telegram</a>
            <a href="#" className="text-orange-300 hover:text-orange-500 transition-colors font-bold">Cryptid Database</a>
            <a href="#" className="text-orange-300 hover:text-orange-500 transition-colors font-bold">Research</a>
            <a href="#" className="text-orange-300 hover:text-orange-500 transition-colors font-bold">Community</a>
          </div>

          <div className="text-sm text-gray-400 space-y-2">
            <p className="text-xs">© 2024 Hood Cryptids Research Institute. All sightings reserved.</p>
            <p className="italic">
              This is a meme token. Please invest responsibly and don't blame us if the cryptids steal your lunch money. *Scientific accuracy not guaranteed.
            </p>
          </div>
        </div>
      </footer>

      {/* Cryptid Detail Modal */}
      {selectedCryptid && (
        <div 
          className="fixed inset-0 z-50 backdrop-blur-lg bg-black/90 flex items-center justify-center p-4 overflow-hidden"
          onClick={() => setSelectedCryptid(null)}
        >
          {/* Memecoin Style Modal */}
          <div 
            className="relative bg-gradient-to-br from-black via-gray-900 to-orange-900/30 rounded-3xl border-4 border-orange-500 max-w-7xl w-full h-[90vh] shadow-2xl shadow-orange-500/30 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glowing Border Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 blur-xl modal-glow"></div>
            
            {/* Header */}
            <div className="relative bg-gradient-to-r from-orange-500 to-black p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-wrap">
                {/* Cryptid Name in Dark Pill */}
                <div className="bg-black/80 backdrop-blur-sm border-2 border-orange-500/30 rounded-full px-6 py-3 shadow-lg">
                  <h2 className="text-xl font-black text-orange-400 text-center" style={{ fontFamily: '"Permanent Marker", "Creepster", cursive' }}>
                    {selectedCryptid.name}
                  </h2>
                </div>
                
                {/* Tier Badge - moved to same line */}
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r ${getTierColor(selectedCryptid.tier)} text-black shadow-lg`}>
                  {getTierLabel(selectedCryptid.tier)}
                </div>
              </div>
              <button
                onClick={() => setSelectedCryptid(null)}
                className="bg-black/40 hover:bg-black/60 text-white hover:text-orange-400 rounded-full p-3 transition-all duration-300 hover:scale-110 border border-orange-500/30 hover:border-orange-500/50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Main Content - Single Viewport */}
            <div className="relative p-6 h-[calc(90vh-100px)] grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Image & Basic Info */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative bg-black rounded-2xl border-2 border-orange-500/50 overflow-hidden group">
                  <img
                    src={selectedCryptid.nft_image}
                    alt={selectedCryptid.name}
                    className="w-full aspect-square object-contain group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Floating Stats */}
                  <div className="absolute top-3 left-3 bg-orange-500 text-black px-3 py-1 rounded-full text-sm font-black">
                    🔬 {selectedCryptid.research_completion ?? 0}% Researched
                  </div>
                  
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-black text-center">
                      ⚠️ {safe(selectedCryptid.threat_level, 30)}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-2xl border-2 border-orange-500/30 p-4">
                  <h3 className="text-lg font-black text-orange-400 mb-3 flex items-center">
                    📊 Quick Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-black/30 rounded-lg p-2 text-center">
                      <div className="text-orange-400 font-bold">Last Seen</div>
                      <div className="text-white text-xs">{safe(selectedCryptid.last_seen, 15)}</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2 text-center">
                      <div className="text-orange-400 font-bold">Habitat</div>
                      <div className="text-white text-xs">{safe(selectedCryptid.habitat, 15)}</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2 text-center">
                      <div className="text-orange-400 font-bold">Active Hours</div>
                      <div className="text-white text-xs">{safe(selectedCryptid.active_hours, 15)}</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2 text-center">
                      <div className="text-orange-400 font-bold">Mood</div>
                      <div className="text-white text-xs">{safe(selectedCryptid.mood, 15)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column - Lore & Details */}
              <div className="space-y-4">
                {/* Main Lore */}
                <div className="bg-gradient-to-br from-gray-900/80 to-black/80 rounded-2xl border-2 border-orange-500/30 p-4 h-full">
                  <h3 className="text-xl font-black text-orange-400 mb-4 flex items-center">
                    📜 The Legend
                  </h3>
                  <div className="text-gray-300 leading-relaxed text-sm h-[calc(100%-60px)] overflow-hidden">
                    <p className="mb-4">{selectedCryptid.lore}</p>
                    
                    {selectedCryptid.field_notes && (
                      <div className="mt-4 p-3 bg-orange-900/20 rounded-lg border border-orange-500/20">
                        <div className="text-orange-400 font-bold text-xs mb-2">🗒️ Field Notes:</div>
                        <p className="text-xs text-gray-400 whitespace-pre-line">{safe(selectedCryptid.field_notes, 200)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Fun Facts & Voting */}
              <div className="space-y-4">
                {/* Fun Facts */}
                <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-2xl border-2 border-orange-500/30 p-4">
                  <h3 className="text-lg font-black text-orange-400 mb-3 flex items-center">
                    🎯 Fun Facts
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <span className="text-2xl">👃</span>
                      <div>
                        <div className="text-orange-400 font-bold">Smells Like:</div>
                        <div className="text-white">{safe(selectedCryptid.smells_like, 25)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <span className="text-2xl">🎯</span>
                      <div>
                        <div className="text-orange-400 font-bold">Weakness:</div>
                        <div className="text-white">{safe(selectedCryptid.known_weakness, 25)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <span className="text-2xl">📅</span>
                      <div>
                        <div className="text-orange-400 font-bold">First Spotted:</div>
                        <div className="text-white">{safe(selectedCryptid.first_sighting, 25)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <span className="text-2xl">🏷️</span>
                      <div>
                        <div className="text-orange-400 font-bold">Category:</div>
                        <div className="text-white">{safe(selectedCryptid.category, 25)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Voting Section */}
                {activeVotingEvent && (
                  <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl border-2 border-purple-500/30 p-4">
                    <h3 className="text-lg font-black text-purple-400 mb-3 flex items-center">
                      🗳️ Vote for This Cryptid!
                    </h3>
                    <VotingButton
                      cryptidId={selectedCryptid.id}
                      eventId={activeVotingEvent.id}
                      hasVoted={userVotes.has(selectedCryptid.id)}
                      voteCount={voteCounts[selectedCryptid.id] || 0}
                      onVoteSuccess={handleVoteSuccess}
                    />
                  </div>
                )}

                {/* Meme Status */}
                <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-2xl border-2 border-green-500/30 p-4">
                  <h3 className="text-lg font-black text-green-400 mb-3 flex items-center">
                    🚀 Meme Status
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Hype Level:</span>
                      <span className="text-green-400 font-bold">📈 TO THE MOON</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Meme Potential:</span>
                      <span className="text-yellow-400 font-bold">⭐ LEGENDARY</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Community Love:</span>
                      <span className="text-red-400 font-bold">❤️ {voteCounts[selectedCryptid.id] || 0} votes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon Modal */}
      <ComingSoonModal 
        isOpen={showComingSoonModal} 
        onClose={() => setShowComingSoonModal(false)} 
      />

      {/* Report Sighting Modal */}
      <ReportSightingModal 
        isOpen={showReportSightingModal} 
        onClose={() => setShowReportSightingModal(false)} 
      />
    </div>
  );
}

export default App;