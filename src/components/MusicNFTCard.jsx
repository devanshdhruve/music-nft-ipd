import React, { useState } from "react";

const getIPFSUrl = (ipfsUrl) => {
  // If URL is empty string, null, or undefined, return default image
  if (!ipfsUrl || ipfsUrl === "" || ipfsUrl === '""') {
    return "/placeholder-music.png"; // Make sure this file exists in your public folder
  }

  try {
    // Remove any extra quotes that might be in the string
    ipfsUrl = ipfsUrl.replace(/['"]+/g, "");

    if (ipfsUrl.startsWith("ipfs://")) {
      return ipfsUrl.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
    }

    if (ipfsUrl.startsWith("https://gateway.pinata.cloud")) {
      return ipfsUrl;
    }

    // If it's just a CID
    if (ipfsUrl.match(/^[a-zA-Z0-9]{46,59}$/)) {
      return `https://gateway.pinata.cloud/ipfs/${ipfsUrl}`;
    }

    return "/placeholder-music.png";
  } catch (error) {
    console.error("Error formatting IPFS URL:", error);
    return "/placeholder-music.png";
  }
};

const MusicNFTCard = ({ nft }) => {
  const [imageError, setImageError] = useState(false);

  if (!nft) return null;

  // Get image URL from either image or imageUrl property
  const imageUrl = nft.image || nft.imageUrl;

  console.log("NFT Data in Card:", {
    tokenId: nft.tokenId,
    name: nft.name,
    imageUrl: imageUrl,
    formattedImageUrl: getIPFSUrl(imageUrl),
  });

  const handleImageError = (e) => {
    console.error("Image loading failed for NFT:", nft.tokenId);
    setImageError(true);
    e.target.src = "/placeholder-music.png";
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-full">
      <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
        {!imageError && imageUrl ? (
          <img
            src={getIPFSUrl(imageUrl)}
            alt={nft.name || "Music NFT"}
            onError={handleImageError}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-purple-50">
            <div className="text-center">
              <span className="text-4xl">🎵</span>
              <p className="text-sm text-gray-500 mt-2">
                {nft.name || "Music NFT"}
              </p>
            </div>
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold mt-2 truncate">
        {nft.name || `NFT #${nft.tokenId}`}
      </h2>

      {nft.description && (
        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
          {nft.description}
        </p>
      )}

      <p className="text-gray-600 truncate mt-2">
        Creator:{" "}
        {nft.creator
          ? `${nft.creator.slice(0, 6)}...${nft.creator.slice(-4)}`
          : "Unknown"}
      </p>

      <p className="text-purple-600 font-bold mt-1">
        {nft.price ? `${Number(nft.price).toFixed(4)} ETH` : "N/A"}
      </p>

      {nft.maxSupply > 0 && (
        <p className="text-sm text-gray-500 mt-1">
          Supply: {nft.currentSupply || 0}/{nft.maxSupply}
        </p>
      )}

      {nft.musicUrl && (
        <div className="mt-3">
          <audio controls className="w-full">
            <source src={getIPFSUrl(nft.musicUrl)} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      <button
        className="bg-purple-600 hover:bg-purple-700 text-white w-full mt-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
        disabled={!nft.isActive}
      >
        <span>🛒</span>
        <span>Buy Now</span>
      </button>
    </div>
  );
};

export default MusicNFTCard;
