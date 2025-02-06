//hooks/useCreateNft

import { useState } from "react";
import { getContract } from "../utils/contract";

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
      const contract = getContract(signer);
      const tx = await contract.createMusicNFT(
        name,
        description,
        musicUrl,
        imageUrl,
        ethers.utils.parseUnits(price.toString(), "wei"), // Ensure price is in wei
        maxSupply,
        royaltyBPS
      );
      await tx.wait();
      return tx;
    } catch (error) {
      setError(error);
      console.error("Error creating NFT:", error);
    } finally {
      setLoading(false);
    }
  };

  return { createNFT, loading, error };
};
