import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Music, Image, Type, FileText } from "lucide-react";
import { useCreateNFT } from "../hooks/useCreateNFT";
import { uploadToPinata } from "../utils/pinataUpload";

const CreateNFT = () => {
  const [signer, setSigner] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [musicFile, setMusicFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [price, setPrice] = useState("");
  const [maxSupply, setMaxSupply] = useState("");
  const [royaltyPercentage, setRoyaltyPercentage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const { createNFT, loading, error } = useCreateNFT(signer);

  useEffect(() => {
    const connectWallet = async () => {
      if (!window.ethereum) {
        console.error("MetaMask not found. Please install it.");
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setSigner(signer);
      } catch (error) {
        console.error("Error getting signer:", error);
      }
    };

    connectWallet();
  }, []);

  const handleFileChange = (event, setFile) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
    }
  };

  const validateInputs = () => {
    if (!signer) {
      throw new Error("Please connect your wallet first!");
    }

    if (
      !name ||
      !description ||
      !musicFile ||
      !imageFile ||
      !price ||
      !maxSupply ||
      !royaltyPercentage
    ) {
      throw new Error("All fields are required.");
    }

    if (isNaN(price) || Number(price) <= 0) {
      throw new Error("Invalid price. Must be greater than 0.");
    }

    if (isNaN(maxSupply) || Number(maxSupply) <= 0) {
      throw new Error("Invalid max supply. Must be greater than 0.");
    }

    const royaltyValue = parseFloat(royaltyPercentage);
    if (isNaN(royaltyValue) || royaltyValue < 0 || royaltyValue > 100) {
      throw new Error("Royalty percentage must be between 0 and 100.");
    }
  };

  // ... (previous imports remain the same)

  const handleCreateNFT = async () => {
    try {
      setUploadError(null);
      validateInputs();

      setUploading(true);

      // Add loading state for IPFS upload
      console.log("Starting IPFS upload...");
      const [musicUrl, imageUrl] = await Promise.all([
        uploadToPinata(musicFile),
        uploadToPinata(imageFile),
      ]);
      console.log("IPFS upload complete:", { musicUrl, imageUrl });

      // Convert royalty percentage to basis points
      const royaltyBPS = Math.floor(parseFloat(royaltyPercentage) * 100);

      console.log("Creating NFT with params:", {
        name,
        description,
        musicUrl,
        imageUrl,
        price,
        maxSupply,
        royaltyBPS,
      });

      const result = await createNFT(
        name,
        description,
        musicUrl,
        imageUrl,
        price,
        parseInt(maxSupply),
        royaltyBPS
      );

      console.log("Creation result:", result);

      if (!result.tokenId) {
        throw new Error("No token ID returned from creation");
      }

      // Success handling
      console.log("NFT Created successfully!", {
        tokenId: result.tokenId,
        transaction: result.tx.hash,
        receipt: result.receipt,
      });

      // Clear form
      setName("");
      setDescription("");
      setMusicFile(null);
      setImageFile(null);
      setPrice("");
      setMaxSupply("");
      setRoyaltyPercentage("");

      alert(`NFT created successfully! Token ID: ${result.tokenId}`);
    } catch (err) {
      console.error("Failed to create NFT:", err);
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // ... (rest of the component remains the same)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Create Music NFT
          </h2>

          {!signer ? (
            <button
              onClick={() =>
                window.ethereum?.request({ method: "eth_requestAccounts" })
              }
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="space-y-6">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <div className="flex items-center">
                  <Type className="text-gray-400 mr-2" size={20} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter NFT name"
                  />
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <div className="flex items-center">
                  <FileText className="text-gray-400 mr-2" size={20} />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter NFT description"
                    rows={3}
                  />
                </div>
              </div>

              {/* File Inputs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Music File
                </label>
                <div className="flex items-center">
                  <Music className="text-gray-400 mr-2" size={20} />
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, setMusicFile)}
                    accept="audio/*"
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image
                </label>
                <div className="flex items-center">
                  <Image className="text-gray-400 mr-2" size={20} />
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, setImageFile)}
                    accept="image/*"
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Price Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (ETH)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  step="0.000000000000000001"
                  min="0"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {/* Max Supply Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Supply
                </label>
                <input
                  type="number"
                  value={maxSupply}
                  onChange={(e) => setMaxSupply(e.target.value)}
                  min="1"
                  step="1"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="1"
                />
              </div>

              {/* Royalty Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Royalty Percentage (%)
                </label>
                <input
                  type="number"
                  value={royaltyPercentage}
                  onChange={(e) => setRoyaltyPercentage(e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>

              {/* Error Display */}
              {(error || uploadError) && (
                <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded-lg">
                  {error?.message || uploadError || "An error occurred"}
                </div>
              )}

              {/* Create Button */}
              <button
                onClick={handleCreateNFT}
                disabled={loading || uploading}
                className={`w-full ${
                  loading || uploading
                    ? "bg-purple-400"
                    : "bg-purple-600 hover:bg-purple-700"
                } text-white font-bold py-3 px-4 rounded-lg transition-colors`}
              >
                {uploading
                  ? "Uploading to IPFS..."
                  : loading
                  ? "Creating NFT..."
                  : "Create NFT"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateNFT;
