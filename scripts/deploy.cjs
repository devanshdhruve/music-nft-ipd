const { ethers } = require("hardhat");

async function main() {
  const MusicNFTMarketplace = await ethers.getContractFactory(
    "MusicNFTMarketplace"
  );
  const marketplace = await MusicNFTMarketplace.deploy();
  await marketplace.waitForDeployment();

  console.log(
    "MusicNFTMarketplace deployed to:",
    await marketplace.getAddress()
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

//address: 0x9A676e781A523b5d0C0e43731313A708CB607508
