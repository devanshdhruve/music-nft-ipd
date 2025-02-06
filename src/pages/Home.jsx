import React from "react";
import { Music, ShoppingCart } from "lucide-react";
import useWallet from "../hooks/useWallet";

const mockNFTs = [
  {
    id: 1,
    name: "Summer Vibes",
    artist: "0x1234...5678",
    price: "0.1",
    imageUrl:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60",
  },
];

const Home = () => {
  const { account } = useWallet();

  const handleBuyNFT = (id) => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }
    console.log("Buying NFT:", id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">
        Featured Music NFTs
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockNFTs.map((nft) => (
          <div
            key={nft.id}
            className="bg-white rounded-xl shadow-2xl overflow-hidden"
          >
            <img
              src={nft.imageUrl}
              alt={nft.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800">{nft.name}</h2>
              <p className="text-xl font-semibold text-purple-600">
                {nft.price} ETH
              </p>
              <button
                onClick={() => handleBuyNFT(nft.id)}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded"
              >
                <ShoppingCart size={20} /> Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
