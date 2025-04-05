import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { getContract } from '../utils/contract';
import { fetchContractMetadata } from '../utils/nftUtils';

export const useMarketplaceNFTs = (account, alchemy) => {
  const [marketNfts, setMarketNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [buyInputs, setBuyInputs] = useState({});

  const fetchMarketNfts = useCallback(async () => {
    if (!alchemy) return;
    setLoading(true);
    setError(null);
    console.log(`Fetching MARKET NFTs`);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = getContract(provider);
      const contractAddress = await contract.getAddress();

      // 1. Get all created NFTs
      const allNftInfo = await contract.getAllMusicNFTs();
      console.log("All created NFT info:", allNftInfo);

      const marketListings = [];
      const metadataCache = {};

      const listingChecks = allNftInfo.map(async (nftInfo) => {
        const tokenId = nftInfo.tokenId.toString();
        const creator = nftInfo.creator;

        // 2. Check if the CREATOR has an active listing
        try {
          const listing = await contract.getListing(tokenId, creator);
          const availableAmount = ethers.toBigInt(listing.amount);

          if (availableAmount > 0n) {
            // 3. If listed, fetch metadata
            if (!metadataCache[tokenId]) {
              metadataCache[tokenId] = await fetchContractMetadata(contract, tokenId);
            }
            const metadata = metadataCache[tokenId];

            const listingId = `${contractAddress}-${tokenId}-${creator}`;

            marketListings.push({
              listingId,
              tokenId,
              seller: creator,
              price: listing.price,
              availableAmount: availableAmount.toString(),
              name: metadata.name,
              imageUrl: metadata.imageUrl,
            });
            console.log(`Found active listing for token ${tokenId} by creator ${creator}`);
          }
        } catch (e) {
          if (!e.message?.includes("NFTNotFound") && !e.message?.includes("Listing not found")) {
            console.warn(`Could not check listing for token ${tokenId} from creator ${creator}:`, e.message);
          }
        }
      });

      await Promise.all(listingChecks);

      console.log("Processed market listings:", marketListings);
      setMarketNfts(marketListings);
      
      // Initialize buy inputs
      const initialBuyInputs = marketListings.reduce((acc, listing) => { 
        acc[listing.listingId] = ''; 
        return acc; 
      }, {});
      setBuyInputs(initialBuyInputs);
    } catch (err) {
      console.error("Error fetching MARKET NFTs:", err);
      setError("Could not fetch marketplace listings. Check console.");
    } finally { 
      setLoading(false); 
    }
  }, [alchemy]);

  useEffect(() => {
    if (alchemy) {
      fetchMarketNfts();
    } else {
      setMarketNfts([]);
      setBuyInputs({});
    }
  }, [alchemy, fetchMarketNfts]);

  const handleBuyInputChange = (listingId, value) => {
    setBuyInputs(prevInputs => ({ ...prevInputs, [listingId]: value }));
  };

  return {
    marketNfts,
    loading,
    error,
    buyInputs,
    handleBuyInputChange,
    refreshMarketNFTs: fetchMarketNfts
  };
};