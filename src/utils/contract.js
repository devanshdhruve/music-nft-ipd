import { ethers } from "ethers";
import contractABI from "../../artifacts/contracts/MusicNFTMarketplace.sol/MusicNFTMarketplace.json" assert { type: "json" };

const contractAddress = "0xBCE5B819c452FA79cA41494dA7Ff6FEe9Afafcc9"; // Ensure this is correct

export const getContract = (providerOrSigner) => {
  if (!providerOrSigner) throw new Error("Provider or Signer is required");

  return new ethers.Contract(
    contractAddress,
    contractABI.abi,
    providerOrSigner
  );
};
