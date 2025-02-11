import { ethers } from "ethers";
import contractABI from "../../artifacts/contracts/MusicNFTMarketplace.sol/MusicNFTMarketplace.json" assert { type: "json" };

const contractAddress = "0xdaeFaB09d327864cABb5C211f0ef1B03cf67BE36"; // Ensure this is correct

export const getContract = (providerOrSigner) => {
  if (!providerOrSigner) throw new Error("Provider or Signer is required");

  return new ethers.Contract(
    contractAddress,
    contractABI.abi,
    providerOrSigner
  );
};
