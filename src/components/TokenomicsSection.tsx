import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Lock, Megaphone, Gift, Code, TrendingUp } from 'lucide-react';

interface TokenomicsItem {
  category: string;
  allocation: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

const tokenomicsData: TokenomicsItem[] = [
  {
    category: "🔓 Pump.fun LP",
    allocation: "93.00%",
    description: "Unlocked via trading on Pump.fun. No presale, fair launch.",
    icon: <TrendingUp className="w-4 h-4" />,
    color: "from-orange-500 to-orange-600",
    delay: 0.1
  },
  {
    category: "🧠 Team Wallet",
    allocation: "2.00%",
    description: "2-month lock → weekly unlocks after (transparency posted)",
    icon: <Lock className="w-4 h-4" />,
    color: "from-orange-600 to-orange-700",
    delay: 0.2
  },
  {
    category: "💸 Marketing & Memes",
    allocation: "2.50%",
    description: "For bounties, AMAs, meme contests & guerilla ops",
    icon: <Megaphone className="w-4 h-4" />,
    color: "from-orange-700 to-red-600",
    delay: 0.3
  },
  {
    category: "🎁 Community Airdrop",
    allocation: "1.50%",
    description: "Reserved for NFT holders, lore contributors, & OGs",
    icon: <Gift className="w-4 h-4" />,
    color: "from-red-600 to-red-700",
    delay: 0.4
  },
  {
    category: "📜 Dev Fund",
    allocation: "1.00%",
    description: "For bot infra, site scaling & launch platform fees",
    icon: <Code className="w-4 h-4" />,
    color: "from-red-700 to-red-800",
    delay: 0.5
  }
];

export const TokenomicsSection: React.FC = () => {
  return (
    <section id="tokenomics" className="py-12 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(249,115,22,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(220,38,38,0.1),transparent_50%)]" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-orange-500 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              x: [-5, 5, -5],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2 + Math.random() * 1,
              repeat: Infinity,
              delay: Math.random() * 1,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Compact Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="mr-3"
            >
              <Coins className="w-8 h-8 text-orange-500" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold glitch-text" data-text="🧾 Tokenomics Breakdown">
              🧾 Tokenomics Breakdown
            </h2>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Token Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border-2 border-orange-500/30 rounded-2xl p-6 backdrop-blur-sm h-full">
              <h3 className="text-2xl font-bold text-orange-400 mb-6 text-center">Token Details</h3>
              
              <div className="space-y-4">
                <div className="text-center p-4 bg-black/30 rounded-xl border border-orange-500/20">
                  <h4 className="text-lg font-bold text-orange-400 mb-1">Token Name</h4>
                  <p className="text-xl text-white">Hood Cryptids</p>
                </div>
                
                <div className="text-center p-4 bg-black/30 rounded-xl border border-orange-500/20">
                  <h4 className="text-lg font-bold text-orange-400 mb-1">Ticker Symbol</h4>
                  <p className="text-xl text-white font-mono">$CRYPTIDS</p>
                </div>
                
                <div className="text-center p-4 bg-black/30 rounded-xl border border-orange-500/20">
                  <h4 className="text-lg font-bold text-orange-400 mb-1">Total Supply</h4>
                  <p className="text-xl text-white">1,000,000,000</p>
                  <p className="text-sm text-gray-400">(1 Billion)</p>
                </div>
              </div>

              {/* Fair Launch Badge */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="mt-6 text-center"
              >
                <div className="bg-gradient-to-r from-orange-500 to-red-600 text-black font-bold py-3 px-4 rounded-xl shadow-lg">
                  Fair Launch • No Presale • Community Driven
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border-2 border-orange-500/30 rounded-2xl p-6 backdrop-blur-sm h-full">
              <h3 className="text-2xl font-bold text-center mb-6">
                <span className="gradient-text">📊 Distribution</span>
              </h3>
              
              {/* Compact Distribution Grid */}
              <div className="grid gap-3">
                {tokenomicsData.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.5, 
                      delay: item.delay,
                    }}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-600/10 rounded-xl blur-sm group-hover:blur-md transition-all duration-300 opacity-0 group-hover:opacity-100" />
                    
                    <div className="relative bg-gradient-to-r from-gray-800/60 to-black/60 border border-orange-500/20 rounded-xl p-4 group-hover:border-orange-500/40 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        {/* Left: Icon + Category */}
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.3 }}
                            className={`flex-shrink-0 w-8 h-8 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center text-black shadow-sm`}
                          >
                            {item.icon}
                          </motion.div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors duration-300 truncate">
                              {item.category}
                            </h4>
                            <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300 line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        
                        {/* Right: Allocation */}
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: item.delay + 0.1 }}
                          className={`flex-shrink-0 ml-4 px-3 py-1 bg-gradient-to-r ${item.color} rounded-full text-black font-bold text-sm shadow-sm`}
                        >
                          {item.allocation}
                        </motion.div>
                      </div>
                      
                      {/* Progress Bar Animation */}
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: item.delay + 0.3 }}
                        className="mt-2 h-0.5 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};