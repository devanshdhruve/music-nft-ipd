import { ethers } from "ethers";
import contractABI from "../../contracts/MusicNFTMarketplace.json"; // Adjust path if needed

const contractAddress = "0x63406d65318404165cc7aBf857D882a6E4676278"; // Replace with actual contract address

export const getContract = (providerOrSigner) => {
  return new ethers.Contract(
    contractAddress,
    contractABI.abi,
    providerOrSigner
  );
};
