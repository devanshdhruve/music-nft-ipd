import React from 'react';
import { NavLink } from 'react-router-dom';
import { Music, Wallet, LogOut } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

const Navbar = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnectWallet = async () => {
    try {
      await connect({ connector: injected() });
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="bg-black bg-opacity-50 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <Music className="text-white" size={24} />
            <span className="text-white text-xl font-bold">Music NFT</span>
          </div>
          <div className="flex items-center space-x-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-white hover:text-purple-300 transition-colors ${
                  isActive ? 'text-purple-300 font-semibold' : ''
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/create"
              className={({ isActive }) =>
                `text-white hover:text-purple-300 transition-colors ${
                  isActive ? 'text-purple-300 font-semibold' : ''
                }`
              }
            >
              Create NFT
            </NavLink>
            <NavLink
              to="/sell"
              className={({ isActive }) =>
                `text-white hover:text-purple-300 transition-colors ${
                  isActive ? 'text-purple-300 font-semibold' : ''
                }`
              }
            >
              Sell NFT
            </NavLink>
          </div>
        </div>
        {isConnected ? (
          <div className="flex items-center space-x-4">
            <span className="text-white">{formatAddress(address)}</span>
            <button
              onClick={() => disconnect()}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Disconnect</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnectWallet}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Wallet size={20} />
            <span>Connect Wallet</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
