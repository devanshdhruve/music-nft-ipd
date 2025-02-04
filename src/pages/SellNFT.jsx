import React from 'react';
import { Music, Tag } from 'lucide-react';
import { useAccount } from 'wagmi';

// This would come from your contract - user's owned NFTs
const mockOwnedNFTs = [
  {
    id: 1,
    name: "Summer Vibes",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    currentPrice: "0.1",
    supply: "5",
  },
  {
    id: 2,
    name: "Midnight Jazz",
    imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    currentPrice: "0.2",
    supply: "3",
  },
];

const SellNFT = () => {
  const { isConnected } = useAccount();

  const handleListNFT = async (id, currentPrice) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    // Implementation will be added when contract is deployed
    console.log('Listing NFT:', id, 'for', currentPrice, 'ETH');
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
          <p>Please connect your wallet to view and list your NFTs for sale.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">Your Music NFTs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockOwnedNFTs.map((nft) => (
          <div key={nft.id} className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <img
              src={nft.imageUrl}
              alt={nft.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{nft.name}</h2>
                <Music className="text-purple-600" size={24} />
              </div>
              <div className="space-y-2 mb-6">
                <p className="text-gray-600">Available: {nft.supply}</p>
                <div className="flex items-center space-x-2">
                  <Tag size={20} className="text-purple-600" />
                  <input
                    type="number"
                    defaultValue={nft.currentPrice}
                    step="0.01"
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Set price in ETH"
                  />
                </div>
              </div>
              <button
                onClick={() => handleListNFT(nft.id, nft.currentPrice)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                List for Sale
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellNFT;
