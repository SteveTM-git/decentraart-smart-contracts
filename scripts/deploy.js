async function main() {
    console.log("🚀 Deploying DecentraArt NFT Contract to Sepolia...");
  
    const DecentraArt = await ethers.getContractFactory("DecentraArt");
    const decentraArt = await DecentraArt.deploy();
    await decentraArt.waitForDeployment();
    
    const address = await decentraArt.getAddress();
    
    console.log("✅ DecentraArt deployed to:", address);
    console.log("🔗 View on Etherscan:", `https://sepolia.etherscan.io/address/${address}`);
    console.log("🎉 Your NFT marketplace is live!");
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });