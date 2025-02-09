import { useState } from "react";
import { getContract } from "../utils/contract";
import { ethers } from "ethers";

export const useCreateNFT = (signer) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createNFT = async (
    name,
    description,
    musicUrl,
    imageUrl,
    price,
    maxSupply,
    royaltyBPS
  ) => {
    setLoading(true);
    setError(null);

    try {
      if (!signer) {
        throw new Error("Signer is required");
      }

      const contract = getContract(signer);

      // Log contract interface for debugging
      console.log("Contract interface:", contract.interface.format());

      const formattedPrice = ethers.parseEther(price.toString());

      // Create NFT with gasLimit to ensure enough gas for event emission
      const tx = await contract.createMusicNFT(
        name,
        description,
        musicUrl,
        imageUrl,
        formattedPrice,
        maxSupply,
        royaltyBPS,
        {
          gasLimit: 500000, // Add explicit gas limit
        }
      );

      console.log("Transaction sent:", tx.hash);

      // Wait for more confirmations
      const receipt = await tx.wait(2);

      console.log("Full receipt:", receipt);
      console.log("All events:", receipt.logs);

      if (receipt.status !== 1) {
        throw new Error("Transaction failed");
      }

      // Try multiple methods to find the event
      let nftCreatedEvent;

      // Method 1: Direct event access
      nftCreatedEvent = receipt.events?.find((e) => e.event === "NFTCreated");

      if (!nftCreatedEvent) {
        // Method 2: Parse logs manually
        const NFTCreatedTopic = ethers.id(
          "NFTCreated(uint256,address,uint256,uint256)"
        );

        const log = receipt.logs.find(
          (log) => log.topics[0] === NFTCreatedTopic
        );

        if (log) {
          try {
            const parsedLog = contract.interface.parseLog({
              topics: log.topics,
              data: log.data,
            });
            nftCreatedEvent = {
              args: parsedLog.args,
            };
          } catch (e) {
            console.error("Failed to parse log:", e);
          }
        }
      }

      if (!nftCreatedEvent) {
        throw new Error("NFT creation event not found in transaction receipt");
      }

      const tokenId = nftCreatedEvent.args[0].toString();

      return {
        tx,
        tokenId,
        receipt,
      };
    } catch (error) {
      console.error("Detailed error:", {
        message: error.message,
        code: error.code,
        data: error.data,
        transaction: error.transaction,
      });
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createNFT, loading, error };
};
