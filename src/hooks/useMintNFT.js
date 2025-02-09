import { useState } from "react";
import { getContract } from "../utils/contract";
import { ethers } from "ethers";

export const useMintNFT = (signer) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mintNFT = async (tokenId, amount, price) => {
    setLoading(true);
    setError(null);

    try {
      if (!signer) throw new Error("Signer is required");
      if (!tokenId) throw new Error("Token ID is required");
      if (Number(amount) <= 0) throw new Error("Invalid mint amount");
      if (Number(price) <= 0) throw new Error("Invalid price");

      const contract = getContract(signer);

      // Calculate total cost in Wei
      const totalCost = ethers.utils.parseUnits(
        (price * amount).toString(),
        "wei"
      );

      const tx = await contract.mintNFT(tokenId, amount, {
        value: totalCost,
      });

      const receipt = await tx.wait();
      return { tx, receipt };
    } catch (error) {
      setError(error);
      console.error("Error minting NFT:", error);
    } finally {
      setLoading(false);
    }
  };

  return { mintNFT, loading, error };
};
