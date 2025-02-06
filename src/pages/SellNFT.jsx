import React, { useState, useEffect } from "react";
import { Music, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useWallet from "../hooks/useWallet";

const mockOwnedNFTs = [
  {
    id: 1,
    name: "Summer Vibes",
    imageUrl:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    currentPrice: "0.1",
    supply: "5",
  },
];

const SellNFT = () => {
  const { account } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (!account) {
      navigate("/");
    }
  }, [account, navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">Your Music NFTs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockOwnedNFTs.map((nft) => (
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
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
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
