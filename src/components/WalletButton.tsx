import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Wallet, LogOut } from 'lucide-react';

export const WalletButton: React.FC = () => {
  const { publicKey, connected, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.warn('Error disconnecting wallet:', error);
    }
  };

  const handleConnect = () => {
    setVisible(true);
  };

  // Custom wallet button component
  const CustomWalletButton = () => (
    <button
      onClick={handleConnect}
      disabled={connecting}
      className="bg-gradient-to-r from-orange-400 to-orange-500 text-black px-4 py-2 rounded-full font-bold border-none hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-orange-500/50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {connecting ? (
        <>
          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
        <Wallet className="w-4 h-4" />
        <span>Connect</span>
        </>
      )}
    </button>
  );

  return (
    <div className="wallet-button-container">
      {connected && publicKey ? (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-black px-4 py-2 rounded-full font-bold shadow-lg shadow-orange-500/30">
            <Wallet className="w-4 h-4" />
            <span className="text-sm">{formatAddress(publicKey.toString())}</span>
          </div>
          <button
            onClick={handleDisconnect}
            className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-orange-700 to-orange-800 text-white rounded-full font-bold shadow-lg hover:scale-110 transition-all duration-300 hover:shadow-orange-500/50"
            title="Disconnect Wallet"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <CustomWalletButton />
      )}
    </div>
  );
};