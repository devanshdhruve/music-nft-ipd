import React from 'react';
import { Music, ShoppingCart } from 'lucide-react';
import { useAccount } from 'wagmi';

// This would come from your contract
const mockNFTs = [
  {
    id: 1,
    name: "Summer Vibes",
    artist: "0x1234...5678",
    price: "0.1",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    musicUrl: "https://example.com/music1.mp3",
    supply: "5",
  },
  {
    id: 2,
    name: "Midnight Jazz",
    artist: "0x8765...4321",
    price: "0.2",
    imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    musicUrl: "https://example.com/music2.mp3",
    supply: "3",
  },
];

const Home = () => {
  const { isConnected } = useAccount();

  const handleBuyNFT = async (id) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    // Implementation will be added when contract is deployed
    console.log('Buying NFT:', id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">Featured Music NFTs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockNFTs.map((nft) => (
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
                <p className="text-gray-600">Artist: {nft.artist}</p>
                <p className="text-gray-600">Available: {nft.supply}</p>
                <p className="text-xl font-semibold text-purple-600">{nft.price} ETH</p>
              </div>
              <button
                onClick={() => handleBuyNFT(nft.id)}
                disabled={!isConnected}
                className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                  isConnected
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-300 cursor-not-allowed text-gray-500'
                }`}
              >
                <ShoppingCart size={20} />
                <span>{isConnected ? 'Buy Now' : 'Connect Wallet to Buy'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
