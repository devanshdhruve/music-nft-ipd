import { ethers } from "ethers";
import contractABI from "../../artifacts/contracts/MusicNFTMarketplace.sol/MusicNFTMarketplace.json" assert { type: "json" };

const contractAddress = "0xE5aD3CC39D9bf1F5C3b26C78fC96dC9420AFa40B"; // Ensure this is correct

export const getContract = (providerOrSigner) => {
  if (!providerOrSigner) throw new Error("Provider or Signer is required");

  return new ethers.Contract(
    contractAddress,
    contractABI.abi,
    providerOrSigner
  );
};
