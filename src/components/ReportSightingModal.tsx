import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { X, Camera, ExternalLink, Loader2, CheckCircle, AlertCircle, Lock, Clock, Shield } from 'lucide-react';
import { submitCryptidSighting } from '../lib/supabase';
import { motion } from 'framer-motion';

interface ReportSightingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportSightingModal: React.FC<ReportSightingModalProps> = ({
  isOpen,
  onClose
}) => {
  const { publicKey, signMessage } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    cryptid_name: '',
    platform: 'X' as 'X' | 'instagram' | 'youtube' | 'tiktok',
    platform_url: '',
    lore: '',
    image_url: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey || !signMessage) {
      setError('Please connect your wallet first');
      return;
    }

    // Validate required fields
    if (!formData.cryptid_name.trim() || !formData.platform_url.trim() || !formData.lore.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate URL format
    try {
      new URL(formData.platform_url);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create message to sign
      const timestamp = new Date().toISOString();
      const message = `Report cryptid sighting: ${formData.cryptid_name} at ${timestamp}`;
      const messageBytes = new TextEncoder().encode(message);
      
      // Sign the message
      const signature = await signMessage(messageBytes);
      const signatureBase64 = Buffer.from(signature).toString('base64');

      // Submit to database
      await submitCryptidSighting({
        wallet: publicKey.toString(),
        signature: signatureBase64,
        cryptid_name: formData.cryptid_name.trim(),
        platform: formData.platform,
        platform_url: formData.platform_url.trim(),
        lore: formData.lore.trim(),
        image_url: formData.image_url.trim() || undefined
      });

      setSubmitSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          cryptid_name: '',
          platform: 'X',
          platform_url: '',
          lore: '',
          image_url: ''
        });
        setSubmitSuccess(false);
        onClose();
      }, 2000);

    } catch (err: any) {
      console.error('Submission error:', err);
      if (err.message?.includes('User rejected') || err.message?.includes('rejected')) {
        setError('Signature cancelled');
      } else {
        setError('Failed to submit sighting. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setFormData({
      cryptid_name: '',
      platform: 'X',
      platform_url: '',
      lore: '',
      image_url: ''
    });
    setError(null);
    setSubmitSuccess(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-gray-900 to-black border-2 border-orange-500/50 rounded-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl shadow-orange-500/20 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-orange-500/30">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
            </motion.div>
            <h2 className="text-lg sm:text-2xl font-bold gradient-text">🚧 Report Cryptid Sighting</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800/50 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 modal-scrollbar overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-140px)] relative">
          {/* Coming Soon Overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-10 flex items-center justify-center">
            <div className="text-center space-y-6 p-6">
              {/* Animated Lock Icon */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="mx-auto"
              >
                <div className="relative">
                  <Lock className="w-20 h-20 text-orange-500 mx-auto" />
                  <motion.div
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl"
                  />
                </div>
              </motion.div>

              {/* Main Message */}
              <div className="space-y-4">
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-black text-orange-400 glitch-text"
                  data-text="🚧 COMING SOON 🚧"
                >
                  🚧 COMING SOON 🚧
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-white font-bold"
                >
                  Cryptid Reporting System
                </motion.p>
              </div>

              {/* Feature Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-500/30 rounded-xl p-6 max-w-md mx-auto"
              >
                <h4 className="text-lg font-bold text-orange-400 mb-3 flex items-center justify-center">
                  <Camera className="w-5 h-5 mr-2" />
                  What's Coming
                </h4>
                
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Secure wallet-verified sighting submissions</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Camera className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Photo & video evidence upload system</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Real-time location & timestamp verification</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0">🏆</span>
                    <span>Rewards for verified cryptid discoveries</span>
                  </div>
                </div>
              </motion.div>

              {/* Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-r from-black via-orange-900/10 to-black border border-orange-400/30 rounded-xl p-4"
              >
                <h4 className="text-sm font-bold text-orange-400 mb-3 text-center">Development Timeline</h4>
                
                <div className="grid grid-cols-3 gap-4 text-center text-xs">
                  <div className="space-y-1">
                    <div className="text-lg">🔬</div>
                    <div className="font-bold text-orange-400">Phase 1</div>
                    <div className="text-gray-400">Research & Design</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg">⚡</div>
                    <div className="font-bold text-orange-400">Phase 2</div>
                    <div className="text-gray-400">Beta Testing</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg">🚀</div>
                    <div className="font-bold text-orange-400">Phase 3</div>
                    <div className="text-gray-400">Public Launch</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Blurred Background Form (for visual context) */}
          {!publicKey ? (
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Wallet Required</h3>
              <p className="text-gray-400 mb-6">
                Please connect your wallet to report a cryptid sighting.
              </p>
              <button
                onClick={handleClose}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-black px-6 py-2 rounded-full font-bold hover:scale-105 transition-all duration-300"
              >
                Connect Wallet First
              </button>
            </div>
          ) : submitSuccess ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Sighting Reported!</h3>
              <p className="text-gray-400">
                Your cryptid sighting has been submitted for review. Thank you for contributing to the research!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cryptid Name */}
              <div>
                <label className="block text-sm font-bold text-orange-400 mb-2">
                  Cryptid Name *
                </label>
                <input
                  type="text"
                  name="cryptid_name"
                  value={formData.cryptid_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Shadow Walker, Neon Phantom..."
                  className="w-full bg-black/50 border border-orange-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 hover:border-orange-500/50"
                  required
                />
              </div>

              {/* Platform */}
              <div>
                <label className="block text-sm font-bold text-orange-400 mb-2">
                  Social Media Platform *
                </label>
                <div className="relative group">
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-orange-500/30 rounded-lg px-4 py-3 pr-12 text-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 hover:border-orange-500/50 appearance-none cursor-pointer backdrop-blur-sm group-hover:bg-black/70 group-hover:shadow-lg group-hover:shadow-orange-500/10"
                    required
                  >
                    <option value="X" className="bg-black text-white py-2">🐦 Twitter/X</option>
                    <option value="instagram" className="bg-black text-white py-2">📸 Instagram</option>
                    <option value="youtube" className="bg-black text-white py-2">📺 YouTube</option>
                    <option value="tiktok" className="bg-black text-white py-2">🎵 TikTok</option>
                  </select>
                  
                  {/* Custom dropdown arrow with glow effect */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <div className="relative">
                      <svg className="w-5 h-5 text-orange-500 group-hover:text-orange-400 transition-colors duration-300 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      {/* Subtle glow effect */}
                      <div className="absolute inset-0 w-5 h-5 bg-orange-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                  
                  {/* Focus ring effect */}
                  <div className="absolute inset-0 rounded-lg border-2 border-transparent group-focus-within:border-orange-500/50 group-focus-within:shadow-lg group-focus-within:shadow-orange-500/20 transition-all duration-300 pointer-events-none"></div>
                  </div>
                </div>

              {/* Platform URL */}
              <div>
                <label className="block text-sm font-bold text-orange-400 mb-2">
                  Post URL *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    name="platform_url"
                    value={formData.platform_url}
                    onChange={handleInputChange}
                    placeholder="https://x.com/user/status/123456789..."
                    className="w-full bg-black/50 border border-orange-500/30 rounded-lg px-4 py-3 pr-10 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 hover:border-orange-500/50"
                    required
                  />
                  <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-500/60" />
                </div>
              </div>

              {/* Image URL (Optional) */}
              <div>
                <label className="block text-sm font-bold text-orange-400 mb-2">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/cryptid-photo.jpg"
                  className="w-full bg-black/50 border border-orange-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 hover:border-orange-500/50"
                />
              </div>

              {/* Lore/Description */}
              <div>
                <label className="block text-sm font-bold text-orange-400 mb-2">
                  Sighting Details & Lore *
                </label>
                <textarea
                  name="lore"
                  value={formData.lore}
                  onChange={handleInputChange}
                  placeholder="Describe your encounter... Where did you see it? What was it doing? How did it make you feel? Any strange phenomena?"
                  rows={5}
                  className="w-full bg-black/50 border border-orange-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 hover:border-orange-500/50 resize-none min-h-[120px]"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Be detailed! The more information you provide, the better we can document this cryptid.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm animate-pulse">
                  {error}
                </div>
              )}

              {/* Submit Button */}
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};