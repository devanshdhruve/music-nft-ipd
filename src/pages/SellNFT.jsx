// src/pages/sellnft.jsx
import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import { ethers } from "ethers"; // Ethers v6
import { Music, Tag, Hash, ShoppingCart } from "lucide-react"; // Added ShoppingCart
// Alchemy SDK Imports
import { Network, Alchemy } from 'alchemy-sdk';
// Helper to get contract instance
import { getContract } from '../utils/contract'; // Adjust path if needed

// --- Alchemy Configuration ---
const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY;
// --- Set Network to Optimism Sepolia ---
const alchemyNetwork = Network.OPT_SEPOLIA;
// -------------------------------------

if (!alchemyApiKey) {
  console.error("CRITICAL: Alchemy API Key (VITE_ALCHEMY_API_KEY) missing. Check .env.");
}
const settings = { apiKey: alchemyApiKey, network: alchemyNetwork };
let alchemy;
let alchemyInitializationError = null;
try {
  if (alchemyApiKey) {
      alchemy = new Alchemy(settings);
      console.log(`Alchemy SDK initialized for ${alchemyNetwork.toString()}.`);
  } else {
      alchemyInitializationError = "Alchemy API Key is missing. Check .env file (needs VITE_ prefix).";
  }
} catch (e) {
  console.error("Failed to initialize Alchemy SDK.", e);
  alchemyInitializationError = `Failed to initialize Alchemy SDK: ${e.message}`;
}

// --- Helper Function to Fetch Metadata --- remains the same ---
async function fetchContractMetadata(contract, tokenId) {
    let metadata = { name: "Unknown NFT", imageUrl: "/placeholder.png", musicUrl: "", description: "" };
    if (!contract) {
        console.error(`fetchContractMetadata: Invalid contract instance for token ${tokenId}.`);
        return { ...metadata, name: "Contract Error" };
    }
    if (typeof contract.getNFTMetadata === 'function') {
        try {
            const data = await contract.getNFTMetadata(tokenId);
            metadata = {
                name: data.name || "Unnamed NFT", imageUrl: data.imageUrl || "/placeholder.png",
                musicUrl: data.musicUrl || "", description: data.description || "", creator: data.creator,
                price: data.price, maxSupply: data.maxSupply, currentSupply: data.currentSupply,
                royaltyBPS: data.royaltyBPS, isActive: data.isActive,
            };
            return metadata;
        } catch (error) { console.warn(`getNFTMetadata failed for ${tokenId}, trying uri():`, error); }
    } else { console.warn(`Contract missing getNFTMetadata for ${tokenId}. Trying uri().`); }

    if (typeof contract.uri !== 'function') {
         console.warn(`Contract missing uri function for ${tokenId}. Cannot fetch metadata.`);
         return { ...metadata, name: "Metadata Function Missing" };
    }
    try {
        let uri = await contract.uri(tokenId);
        if (!uri) return metadata;
        if (uri.startsWith("ipfs://")) { uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/"); }
        if (uri.startsWith("data:application/json;base64,")) {
             const base64String = uri.split(',')[1];
             let jsonString = typeof atob !== 'undefined' ? atob(base64String) : Buffer.from(base64String, 'base64').toString('utf8');
             const parsedData = JSON.parse(jsonString);
             metadata = { name: parsedData.name || "Unnamed NFT", imageUrl: parsedData.image || parsedData.imageUrl || "/placeholder.png", musicUrl: parsedData.animation_url || parsedData.music_url || "", description: parsedData.description || "" };
        } else if (uri.startsWith('http')) {
             const response = await fetch(uri);
             if (!response.ok) { metadata.name = "Metadata Fetch Failed"; }
             else { const parsedData = await response.json(); metadata = { name: parsedData.name || "Unnamed NFT", imageUrl: parsedData.image || parsedData.imageUrl || "/placeholder.png", musicUrl: parsedData.animation_url || parsedData.music_url || "", description: parsedData.description || "" }; }
        } else { metadata.name = "Unsupported URI"; }
        return metadata;
    } catch (error) { console.error(`Error via uri() for ${tokenId}:`, error); return { ...metadata, name: "Metadata Error" }; }
}


// --- React Component (Consider Renaming) ---
const SellNFT = () => {
  const [account, setAccount] = useState(null);
  // State for Owned NFTs (for selling)
  const [ownedNfts, setOwnedNfts] = useState([]);
  const [loadingOwned, setLoadingOwned] = useState(false);
  const [errorOwned, setErrorOwned] = useState(null);
  const [listInputs, setListInputs] = useState({});
  // State for Marketplace Listings (for buying)
  const [marketNfts, setMarketNfts] = useState([]);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [errorMarket, setErrorMarket] = useState(null);
  const [buyInputs, setBuyInputs] = useState({}); // { listingId: amountToBuy }

  const generalError = alchemyInitializationError; // Display SDK error prominently

  // --- Connect Wallet --- (Modified to fetch both owned and market)
  const connectWallet = async () => {
    setErrorOwned(null);
    setErrorMarket(null);
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        console.log("Wallet connected:", accounts[0]);
        // Fetch data immediately after connecting
        // We'll rely on the useEffect hook based on 'account' instead
      } catch (err) {
        console.error("Wallet connection error:", err);
        const message = (err.code === 4001 || err.message?.includes("User rejected"))
          ? "Connection request rejected."
          : "Wallet connection failed.";
        setErrorOwned(message); // Show error in one place
      }
    } else {
      setErrorOwned("MetaMask is not installed or detected.");
    }
  };

  // --- Fetch OWNED NFTs using Alchemy SDK ---
  const fetchOwnedNFTs = useCallback(async (userAddress) => {
    if (!userAddress || !alchemy) return;
    setLoadingOwned(true);
    setErrorOwned(null);
    console.log(`Fetching OWNED NFTs for ${userAddress} on ${alchemyNetwork.toString()}`);
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = getContract(provider);
        const contractAddress = await contract.getAddress();
        const nftsForOwner = await alchemy.nft.getNftsForOwner(userAddress, { contractAddresses: [contractAddress] });
        const fetchedNftsData = [];
        if (nftsForOwner?.ownedNfts?.length > 0) {
            const metadataPromises = nftsForOwner.ownedNfts
                .filter(nft => nft.tokenType === "ERC1155" && nft.balance && parseInt(nft.balance, 16) > 0)
                .map(async (nft) => {
                    const tokenId = nft.tokenId;
                    const balance = ethers.toBigInt(nft.balance).toString();
                    const metadata = await fetchContractMetadata(contract, tokenId);
                    return {
                        id: `${contractAddress}-${tokenId}`, contractAddress, tokenId: tokenId.toString(), balance,
                        name: metadata.name, imageUrl: metadata.imageUrl !== "/placeholder.png" ? metadata.imageUrl : (nft.media?.[0]?.gateway || nft.rawMetadata?.image || "/placeholder.png"),
                    };
                });
            fetchedNftsData.push(...(await Promise.all(metadataPromises)));
        }
        setOwnedNfts(fetchedNftsData);
        const initialInputs = fetchedNftsData.reduce((acc, nft) => { acc[nft.id] = { price: '', amount: '' }; return acc; }, {});
        setListInputs(initialInputs);
    } catch (err) {
        console.error("Error fetching OWNED NFTs:", err);
        setErrorOwned("Could not fetch your NFTs. Check console.");
    } finally { setLoadingOwned(false); }
  }, []); // useCallback depends on nothing changing within it

  // --- Fetch MARKETPLACE Listings (Compromised Strategy) ---
  const fetchMarketNfts = useCallback(async () => {
      // No need for user address here, fetches potentially all listings (based on created NFTs)
      if (!alchemy) return; // Don't fetch if SDK failed
      setLoadingMarket(true);
      setErrorMarket(null);
      console.log(`Fetching MARKET NFTs on ${alchemyNetwork.toString()}`);
      try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const contract = getContract(provider);
          const contractAddress = await contract.getAddress();

          // 1. Get all created NFTs (as a starting point to know which token IDs exist)
          const allNftInfo = await contract.getAllMusicNFTs(); // Assuming this function exists and returns basic info including creator
          console.log("All created NFT info:", allNftInfo);

          const marketListings = [];
          const metadataCache = {}; // Cache metadata to avoid re-fetching

          const listingChecks = allNftInfo.map(async (nftInfo) => {
              const tokenId = nftInfo.tokenId.toString(); // Ensure tokenId is string for consistency
              const creator = nftInfo.creator;

              // 2. For each NFT, check if the CREATOR has an active listing
              // **LIMITATION**: This misses listings from non-creator sellers
              try {
                  const listing = await contract.getListing(tokenId, creator);
                  const availableAmount = ethers.toBigInt(listing.amount); // Amount listed by creator

                  if (availableAmount > 0n) { // Check if there's a positive amount listed
                      // 3. If listed, fetch metadata (use cache)
                      if (!metadataCache[tokenId]) {
                          metadataCache[tokenId] = await fetchContractMetadata(contract, tokenId);
                      }
                      const metadata = metadataCache[tokenId];

                      // Create a unique ID for the listing itself
                      const listingId = `${contractAddress}-${tokenId}-${creator}`;

                      marketListings.push({
                          listingId: listingId, // Unique ID for the buy input state
                          tokenId: tokenId,
                          seller: creator,
                          price: listing.price, // Price per item in Wei (as BigInt)
                          availableAmount: availableAmount.toString(), // Amount available from this seller
                          name: metadata.name,
                          imageUrl: metadata.imageUrl,
                          // Include other metadata if needed
                      });
                      console.log(`Found active listing for token ${tokenId} by creator ${creator}`);
                  }
              } catch (e) {
                  // Handle cases where getListing might fail (e.g., no listing exists for this combo)
                  if (!e.message?.includes("NFTNotFound") && !e.message?.includes("Listing not found")) { // Adjust error check based on actual contract errors
                     console.warn(`Could not check listing for token ${tokenId} from creator ${creator}:`, e.message);
                  }
              }
          });

          await Promise.all(listingChecks); // Wait for all checks to complete

          console.log("Processed market listings:", marketListings);
          setMarketNfts(marketListings);
          // Initialize buy inputs
          const initialBuyInputs = marketListings.reduce((acc, listing) => { acc[listing.listingId] = ''; return acc; }, {});
          setBuyInputs(initialBuyInputs);

      } catch (err) {
          console.error("Error fetching MARKET NFTs:", err);
          setErrorMarket("Could not fetch marketplace listings. Check console.");
      } finally { setLoadingMarket(false); }
  }, []); // useCallback depends on nothing changing within it

  // --- Effect to fetch data when account changes ---
  useEffect(() => {
    if (account && alchemy) {
      console.log("Account connected, fetching data...");
      fetchOwnedNFTs(account);
      fetchMarketNfts(); // Fetch market listings regardless of account, but need provider
    } else if (!account) {
      console.log("Account disconnected, clearing data.");
      setOwnedNfts([]);
      setListInputs({});
      setMarketNfts([]); // Clear market data too
      setBuyInputs({});
    } else if (!alchemy) {
        setErrorOwned(alchemyInitializationError || "Alchemy SDK Error.");
        setErrorMarket(alchemyInitializationError || "Alchemy SDK Error.");
    }
  }, [account, fetchOwnedNFTs, fetchMarketNfts]); // Add fetch functions to dependency array


  // --- Handle Input Change (Selling) ---
  const handleListInputChange = (nftId, field, value) => {
    setListInputs(prevInputs => ({ ...prevInputs, [nftId]: { ...prevInputs[nftId], [field]: value } }));
  };

  // --- Handle Input Change (Buying) ---
  const handleBuyInputChange = (listingId, value) => {
    setBuyInputs(prevInputs => ({ ...prevInputs, [listingId]: value }));
  };

  // --- Handle Listing NFT (Selling) --- (function remains largely the same)
  const handleListNFT = async (nft) => {
    setErrorOwned(null);
    // setListingInProgress...
    const inputs = listInputs[nft.id];
    const price = inputs?.price; const amountToList = inputs?.amount;
    let priceBN; try { if (!price || parseFloat(price) <= 0) throw new Error(); priceBN = ethers.parseEther(price); } catch (e) { alert("Valid price required."); return; }
    let amountBN; try { if (!amountToList || parseInt(amountToList) <= 0) throw new Error(); amountBN = ethers.toBigInt(amountToList); if (amountBN > ethers.toBigInt(nft.balance)) throw new Error("Amount exceeds balance."); } catch (e) { alert(`Invalid amount: ${e.message}`); return; }
    console.log(`List attempt: ID ${nft.tokenId}, Amount ${amountToList}, Price ${price} ETH`);
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = getContract(signer);
        const operatorAddress = await contract.getAddress();
        const isApproved = await contract.isApprovedForAll(account, operatorAddress);
        if (!isApproved) { alert(`Approval needed first.`); const approvalTx = await contract.setApprovalForAll(operatorAddress, true); await approvalTx.wait(); alert("Approved! Click List again."); return; }
        const listTx = await contract.listNFT(nft.tokenId, amountBN, priceBN);
        alert("Listing tx sent..."); await listTx.wait(); alert(`Listed ${amountToList} of ${nft.name} successfully!`);
        fetchOwnedNFTs(account); // Refresh owned NFTs
        fetchMarketNfts(); // Refresh market listings as well
    } catch (err) { console.error("List Error:", err); /* Parse error... */ let reason = "List tx failed."; if(err.code === 'ACTION_REJECTED'){reason="Tx rejected."} else if(err.reason){reason=`Failed: ${err.reason}`} alert(reason); setErrorOwned(reason); }
    // finally { setListingInProgress... }
  };

  // --- Handle Buying NFT ---
  const handleBuyNFT = async (listing) => {
      setErrorMarket(null); // Clear previous market errors
      const amountToBuyStr = buyInputs[listing.listingId];

      let amountToBuyBN;
      try {
          if (!amountToBuyStr || parseInt(amountToBuyStr) <= 0) throw new Error("Amount must be positive.");
          amountToBuyBN = ethers.toBigInt(amountToBuyStr);
          if (amountToBuyBN > ethers.toBigInt(listing.availableAmount)) {
              throw new Error(`Amount (${amountToBuyStr}) exceeds available amount (${listing.availableAmount}).`);
          }
      } catch(e) {
          alert(`Invalid amount: ${e.message || 'Please enter valid number.'}`);
          return;
      }

      let totalCostWei;
      try {
          // Price from listing is already BigInt (Wei)
          totalCostWei = ethers.toBigInt(listing.price) * amountToBuyBN;
      } catch (e) {
           alert("Could not calculate total cost.");
           console.error("Cost calculation error", e);
           return;
      }

      console.log(`Buy attempt: ID ${listing.tokenId}, Seller ${listing.seller}, Amount ${amountToBuyStr}, Cost ${ethers.formatEther(totalCostWei)} ETH`);
      // Add buying in progress state if needed

      try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = getContract(signer);

          console.log(`Calling buyListedNFT(${listing.tokenId}, ${listing.seller}, ${amountToBuyBN.toString()}) with value ${totalCostWei.toString()}`);

          const buyTx = await contract.buyListedNFT(
              listing.tokenId,
              listing.seller,
              amountToBuyBN,
              { value: totalCostWei } // Send ETH with the transaction
          );

          alert("Buy transaction sent! Waiting for confirmation...");
          await buyTx.wait();
          alert(`Successfully bought ${amountToBuyStr} of ${listing.name}!`);

          // Refresh both lists after successful purchase
          fetchOwnedNFTs(account);
          fetchMarketNfts();

      } catch (err) {
          console.error("Error buying NFT:", err);
          let reason = "Buy transaction failed. Check console.";
          if (err.code === 'ACTION_REJECTED') { reason = "Transaction rejected."; }
          else if (err.reason) { reason = `Failed: ${err.reason}`; }
          // Add more specific parsing if needed
          alert(reason);
          setErrorMarket(reason);
      } finally {
          // Reset buying in progress state
      }
  };


  // --- Component Render ---
  return (
    <div className="container mx-auto px-4 py-8 text-white">

      {/* Initial Config Error */}
      {generalError && (
        <div className="text-center bg-red-900 border border-red-700 p-4 rounded-lg mb-6">
          <p className="font-semibold text-lg">Configuration Error:</p>
          <p className="text-red-200">{generalError}</p>
        </div>
      )}

      {/* Wallet Connection */}
      {!account ? (
        <div className="text-center">
          <button onClick={connectWallet} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors disabled:opacity-50" disabled={!!generalError}>
            Connect Wallet
          </button>
          {errorOwned && !generalError && <p className="text-red-400 mt-4">{errorOwned}</p>}
        </div>
      ) : (
        // --- Main Content When Connected ---
        <div>
          <p className="mb-6">Connected: <span className="font-mono bg-gray-700 px-2 py-1 rounded text-sm">{account}</span></p>

          {/* Section 1: Your NFTs (for Selling) */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-b border-gray-700 pb-2">Your NFTs</h2>
            {loadingOwned && <p className="text-purple-300 text-center">Loading your NFTs...</p>}
            {errorOwned && !loadingOwned && !generalError && <p className="text-red-400 text-center mb-4">{errorOwned}</p>}
            {!loadingOwned && ownedNfts.length === 0 && !errorOwned && !generalError && (
              <p className="text-gray-400 text-center">You don't own any NFTs from this contract.</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownedNfts.map((nft) => (
                <div key={nft.id} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700 flex flex-col">
                   <img src={nft.imageUrl} alt={nft.name} className="w-full h-48 object-cover bg-gray-700" onError={(e) => { e.target.src="/placeholder.png"; }}/>
                   <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-xl font-semibold mb-1 truncate" title={nft.name}>{nft.name}</h3>
                      <p className="text-sm text-gray-400 mb-3">ID: {nft.tokenId} (Balance: {nft.balance})</p>
                      {/* Listing Inputs */}
                      <div className="space-y-3 mb-4 mt-auto pt-4 border-t border-gray-700">
                          {/* Price */}
                          <div className="flex items-center space-x-2">
                              <Tag size={18} className="text-purple-400 shrink-0"/>
                              <input type="number" value={listInputs[nft.id]?.price || ''} onChange={(e) => handleListInputChange(nft.id, 'price', e.target.value)} min="0" step="any" className="flex-1 p-1.5 border border-gray-600 rounded bg-gray-700 focus:ring-purple-500 placeholder-gray-500 text-sm" placeholder="Price" aria-label={`Price for ${nft.name}`}/>
                              <span className="text-gray-400 text-sm">ETH</span>
                          </div>
                          {/* Amount */}
                           <div className="flex items-center space-x-2">
                              <Hash size={18} className="text-blue-400 shrink-0"/>
                              <input type="number" value={listInputs[nft.id]?.amount || ''} onChange={(e) => handleListInputChange(nft.id, 'amount', e.target.value)} min="1" max={nft.balance} step="1" className="flex-1 p-1.5 border border-gray-600 rounded bg-gray-700 focus:ring-blue-500 placeholder-gray-500 text-sm" placeholder={`Amount (Max: ${nft.balance})`} aria-label={`Amount of ${nft.name} to list`}/>
                              <span className="text-gray-400 text-sm">QTY</span>
                          </div>
                      </div>
                      {/* List Button */}
                      <button onClick={() => handleListNFT(nft)} className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded text-sm" disabled={ !listInputs[nft.id]?.price || parseFloat(listInputs[nft.id]?.price) <= 0 || !listInputs[nft.id]?.amount || parseInt(listInputs[nft.id]?.amount) <= 0 || ethers.toBigInt(listInputs[nft.id]?.amount || 0) > ethers.toBigInt(nft.balance) }>
                         List for Sale
                      </button>
                   </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Marketplace Listings (for Buying) */}
          <section>
            <h2 className="text-3xl font-bold mb-6 border-b border-gray-700 pb-2">Marketplace Listings</h2>
             <p className="text-sm text-yellow-400 mb-4 italic">Note: This currently only shows listings made by the original NFT creator.</p>
            {loadingMarket && <p className="text-purple-300 text-center">Loading marketplace listings...</p>}
            {errorMarket && !loadingMarket && !generalError && <p className="text-red-400 text-center mb-4">{errorMarket}</p>}
            {!loadingMarket && marketNfts.length === 0 && !errorMarket && !generalError && (
              <p className="text-gray-400 text-center">No NFTs currently listed for sale by creators on the marketplace.</p>
            )}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketNfts.map((listing) => (
                  // Ensure the buyer isn't the seller
                  listing.seller.toLowerCase() !== account.toLowerCase() && (
                    <div key={listing.listingId} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700 flex flex-col">
                      <img src={listing.imageUrl} alt={listing.name} className="w-full h-48 object-cover bg-gray-700" onError={(e) => { e.target.src="/placeholder.png"; }}/>
                      <div className="p-4 flex flex-col flex-grow">
                          <h3 className="text-xl font-semibold mb-1 truncate" title={listing.name}>{listing.name}</h3>
                          <p className="text-xs text-gray-500 mb-1 truncate" title={listing.seller}>Seller: {listing.seller}</p>
                          <p className="text-sm text-gray-400 mb-1">ID: {listing.tokenId}</p>
                          <p className="text-md font-semibold text-purple-300 mb-2">{ethers.formatEther(listing.price)} ETH</p>
                          <p className="text-sm text-gray-400 mb-3">Available: {listing.availableAmount}</p>

                          {/* Buy Input */}
                          <div className="flex items-center space-x-2 mb-3 mt-auto pt-4 border-t border-gray-700">
                              <Hash size={18} className="text-green-400 shrink-0"/>
                              <input
                                type="number"
                                value={buyInputs[listing.listingId] || ''}
                                onChange={(e) => handleBuyInputChange(listing.listingId, e.target.value)}
                                min="1"
                                max={listing.availableAmount}
                                step="1"
                                className="flex-1 p-1.5 border border-gray-600 rounded bg-gray-700 focus:ring-green-500 placeholder-gray-500 text-sm"
                                placeholder={`Amount (Max: ${listing.availableAmount})`}
                                aria-label={`Amount of ${listing.name} to buy`}
                              />
                               <span className="text-gray-400 text-sm">QTY</span>
                          </div>
                          {/* Buy Button */}
                          <button
                             onClick={() => handleBuyNFT(listing)}
                             className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded text-sm"
                             disabled={
                                 !buyInputs[listing.listingId] || parseInt(buyInputs[listing.listingId]) <= 0 || ethers.toBigInt(buyInputs[listing.listingId] || 0) > ethers.toBigInt(listing.availableAmount)
                             }
                          >
                             <ShoppingCart size={16} className="inline mr-1" /> Buy Now
                          </button>
                      </div>
                    </div>
                  )
                ))}
             </div>
          </section>

        </div>
      )}
    </div>
  );
}
export default SellNFT;