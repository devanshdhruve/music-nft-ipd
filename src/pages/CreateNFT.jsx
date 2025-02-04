import React, { useState } from 'react';
import { Music, Image } from 'lucide-react';
import { useAccount } from 'wagmi';

const CreateNFT = () => {
  const [musicUrl, setMusicUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState('');
  const [maxSupply, setMaxSupply] = useState('');
  const [royaltyPercentage, setRoyaltyPercentage] = useState('');

  const { isConnected } = useAccount();

  const handleCreateNFT = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    // Implementation will be added when contract is deployed
    console.log('Creating NFT...');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Create Music NFT</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Music URL
              </label>
              <div className="flex items-center">
                <Music className="text-gray-400 mr-2" size={20} />
                <input
                  type="text"
                  value={musicUrl}
                  onChange={(e) => setMusicUrl(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter music file URL"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image URL
              </label>
              <div className="flex items-center">
                <Image className="text-gray-400 mr-2" size={20} />
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter cover image URL"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (ETH)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.1"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Supply
                </label>
                <input
                  type="number"
                  value={maxSupply}
                  onChange={(e) => setMaxSupply(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Royalty %
                </label>
                <input
                  type="number"
                  value={royaltyPercentage}
                  onChange={(e) => setRoyaltyPercentage(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="10"
                  max="25"
                />
              </div>
            </div>

            <button
              onClick={handleCreateNFT}
              disabled={!isConnected}
              className={`w-full font-bold py-3 px-4 rounded-lg transition-colors ${
                isConnected 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-gray-300 cursor-not-allowed text-gray-500'
              }`}
            >
              {isConnected ? 'Create NFT' : 'Connect Wallet to Create NFT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNFT;
