import React, { useState, useEffect } from "react";
import { Music, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useWallet from "../hooks/useWallet";

const CreateNFT = () => {
  const { account } = useWallet();
  const navigate = useNavigate();

  // Redirect if wallet not connected
  useEffect(() => {
    if (!account) {
      navigate("/");
    }
  }, [account, navigate]);

  const [musicUrl, setMusicUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [maxSupply, setMaxSupply] = useState("");
  const [royaltyPercentage, setRoyaltyPercentage] = useState("");

  const handleCreateNFT = async () => {
    console.log("Creating NFT...");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Create Music NFT
          </h2>

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

            <button
              onClick={handleCreateNFT}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Create NFT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNFT;
