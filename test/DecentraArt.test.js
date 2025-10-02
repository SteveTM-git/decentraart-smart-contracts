const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DecentraArt NFT Marketplace", function () {
  let decentraArt;
  let owner;
  let buyer;
  let seller;

  beforeEach(async function () {
    // Get test accounts
    [owner, seller, buyer] = await ethers.getSigners();

    // Deploy contract
    const DecentraArt = await ethers.getContractFactory("DecentraArt");
    decentraArt = await DecentraArt.deploy();
    await decentraArt.waitForDeployment();
  });

  describe("Minting NFTs", function () {
    it("Should mint an NFT with correct token URI", async function () {
      const tokenURI = "ipfs://QmTest123";
      
      await decentraArt.connect(seller).mintNFT(tokenURI);
      
      expect(await decentraArt.ownerOf(1)).to.equal(seller.address);
      expect(await decentraArt.tokenURI(1)).to.equal(tokenURI);
      expect(await decentraArt.getTotalNFTs()).to.equal(1);
    });

    it("Should increment token IDs correctly", async function () {
      await decentraArt.connect(seller).mintNFT("ipfs://QmTest1");
      await decentraArt.connect(buyer).mintNFT("ipfs://QmTest2");
      
      expect(await decentraArt.getTotalNFTs()).to.equal(2);
      expect(await decentraArt.ownerOf(1)).to.equal(seller.address);
      expect(await decentraArt.ownerOf(2)).to.equal(buyer.address);
    });

    it("Should emit NFTMinted event", async function () {
      const tokenURI = "ipfs://QmTest123";
      
      await expect(decentraArt.connect(seller).mintNFT(tokenURI))
        .to.emit(decentraArt, "NFTMinted")
        .withArgs(1, seller.address, tokenURI);
    });
  });

  describe("Listing NFTs", function () {
    beforeEach(async function () {
      await decentraArt.connect(seller).mintNFT("ipfs://QmTest123");
    });

    it("Should list an NFT for sale", async function () {
      const price = ethers.parseEther("1.0");
      
      await decentraArt.connect(seller).listNFT(1, price);
      
      const listing = await decentraArt.listings(1);
      expect(listing.isListed).to.equal(true);
      expect(listing.price).to.equal(price);
      expect(listing.seller).to.equal(seller.address);
    });

    it("Should fail if non-owner tries to list", async function () {
      const price = ethers.parseEther("1.0");
      
      await expect(
        decentraArt.connect(buyer).listNFT(1, price)
      ).to.be.revertedWith("You don't own this NFT");
    });

    it("Should fail if price is zero", async function () {
      await expect(
        decentraArt.connect(seller).listNFT(1, 0)
      ).to.be.revertedWith("Price must be greater than 0");
    });

    it("Should emit NFTListed event", async function () {
      const price = ethers.parseEther("1.0");
      
      await expect(decentraArt.connect(seller).listNFT(1, price))
        .to.emit(decentraArt, "NFTListed")
        .withArgs(1, seller.address, price);
    });
  });

  describe("Buying NFTs", function () {
    const price = ethers.parseEther("1.0");

    beforeEach(async function () {
      await decentraArt.connect(seller).mintNFT("ipfs://QmTest123");
      await decentraArt.connect(seller).listNFT(1, price);
    });

    it("Should allow buying a listed NFT", async function () {
      await decentraArt.connect(buyer).buyNFT(1, { value: price });
      
      expect(await decentraArt.ownerOf(1)).to.equal(buyer.address);
      
      const listing = await decentraArt.listings(1);
      expect(listing.isListed).to.equal(false);
    });

    it("Should transfer correct amount to seller (minus fee)", async function () {
      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
      
      await decentraArt.connect(buyer).buyNFT(1, { value: price });
      
      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      const expectedAmount = price * BigInt(975) / BigInt(1000); // 97.5% (2.5% fee)
      
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(expectedAmount);
    });

    it("Should fail if NFT is not listed", async function () {
      await expect(
        decentraArt.connect(buyer).buyNFT(2, { value: price })
      ).to.be.revertedWith("NFT is not listed");
    });

    it("Should fail if payment is insufficient", async function () {
      const insufficientPrice = ethers.parseEther("0.5");
      
      await expect(
        decentraArt.connect(buyer).buyNFT(1, { value: insufficientPrice })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should emit NFTSold event", async function () {
      await expect(decentraArt.connect(buyer).buyNFT(1, { value: price }))
        .to.emit(decentraArt, "NFTSold")
        .withArgs(1, buyer.address, seller.address, price);
    });
  });

  describe("Marketplace Fee", function () {
    it("Should have default fee of 2.5%", async function () {
      expect(await decentraArt.marketplaceFee()).to.equal(25);
    });

    it("Should collect fees in contract", async function () {
      const price = ethers.parseEther("1.0");
      
      await decentraArt.connect(seller).mintNFT("ipfs://QmTest");
      await decentraArt.connect(seller).listNFT(1, price);
      
      const contractBalanceBefore = await ethers.provider.getBalance(await decentraArt.getAddress());
      
      await decentraArt.connect(buyer).buyNFT(1, { value: price });
      
      const contractBalanceAfter = await ethers.provider.getBalance(await decentraArt.getAddress());
      const expectedFee = price * BigInt(25) / BigInt(1000);
      
      expect(contractBalanceAfter - contractBalanceBefore).to.equal(expectedFee);
    });
  });
});