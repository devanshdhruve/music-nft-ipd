import React from "react";
import useFetchMusicNFTs from "../hooks/useFetchMusicNFTs";
import useWallet from "../hooks/useWallet";
import MusicNFTCard from "../components/MusicNFTCard";

const Home = () => {
  const { account } = useWallet();
  const { nfts, loading, error } = useFetchMusicNFTs();

  const handleBuyNFT = (tokenId) => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }
    console.log("Buying NFT with tokenId:", tokenId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">
        Featured Music NFTs
      </h1>

      {loading && <p className="text-white">Loading NFTs...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft, index) => (
          <MusicNFTCard
            key={nft.tokenId || index}
            nft={nft}
            onBuy={handleBuyNFT}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
