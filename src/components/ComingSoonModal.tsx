import React from 'react';
import { X, AlertTriangle, Eye, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-gray-900 to-black border-2 border-orange-500/50 rounded-2xl max-w-2xl w-full shadow-2xl shadow-orange-500/20 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orange-500/30 bg-gradient-to-r from-orange-900/20 to-red-900/20">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </motion.div>
            <h2 className="text-2xl font-bold gradient-text">⚠️ CRYPTID ALERT ⚠️</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800/50 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Main Warning */}
          <div className="text-center space-y-4">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl"
            >
              🚨
            </motion.div>
            
            <h3 className="text-3xl font-black text-orange-400 glitch-text" data-text="TOKEN NOT YET RELEASED">
              TOKEN NOT YET RELEASED
            </h3>
            
            <div className="bg-red-900/30 border-2 border-red-500/50 rounded-xl p-4">
              <p className="text-red-400 font-bold text-lg mb-2">
                🔒 CONTRACT ADDRESS: COMING SOON
              </p>
              <p className="text-red-300 text-sm">
                Any tokens claiming to be $CRYPTIDS are <span className="font-black text-red-400">SCAMS!</span>
              </p>
            </div>
          </div>

          {/* Warning Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Eye className="w-5 h-5 text-orange-500" />
                <h4 className="font-bold text-orange-400">Stay Vigilant</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start space-x-2">
                  <span className="text-orange-500 mt-1">▸</span>
                  <span>Only trust official announcements</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-orange-500 mt-1">▸</span>
                  <span>Verify all contract addresses</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-orange-500 mt-1">▸</span>
                  <span>Report suspicious activity</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 border border-orange-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Shield className="w-5 h-5 text-orange-500" />
                <h4 className="font-bold text-orange-400">Official Channels</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start space-x-2">
                  <span className="text-orange-500 mt-1">🐦</span>
                  <span>Twitter: @HoodCryptids</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-orange-500 mt-1">💬</span>
                  <span>Telegram: Official Group</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-orange-500 mt-1">🌐</span>
                  <span>Website: hoodcryptids.com</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Launch Timeline */}
          <div className="bg-gradient-to-r from-black via-orange-900/10 to-black border border-orange-400/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="w-5 h-5 text-orange-500" />
              <h4 className="font-bold text-orange-400">What's Coming</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl">🔬</div>
                <div className="text-sm font-bold text-orange-400">Phase 1</div>
                <div className="text-xs text-gray-400">Final Research & Testing</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl">🚀</div>
                <div className="text-sm font-bold text-orange-400">Phase 2</div>
                <div className="text-xs text-gray-400">Token Launch on Pump.fun</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl">💎</div>
                <div className="text-sm font-bold text-orange-400">Phase 3</div>
                <div className="text-xs text-gray-400">NFT Collection Drop</div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center space-y-4">
            <p className="text-gray-300 text-sm">
              Join our community to be the first to know when $CRYPTIDS launches!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-orange-500/30"
              >
                🔔 I'll Stay Alert
              </button>
              
              <a
                href="https://t.me/hoodcryptidss"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 py-3 rounded-full font-bold hover:scale-105 transition-all duration-300 border border-orange-500/30 hover:border-orange-500/50"
              >
                📱 Join Telegram
              </a>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-center">
            <p className="text-xs text-gray-500 italic">
              Remember: If it sounds too good to be true, it probably involves a cryptid trying to steal your wallet. 
              Stay safe out there, researchers! 👻
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};