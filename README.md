# DecentraArt NFT Marketplace - Smart Contracts

A decentralized NFT marketplace built on Ethereum with creator royalties and secondary sales support.

## Features

- **ERC-721 NFT Standard** - Full compatibility with all NFT platforms
- **Creator Royalties** - Automatic royalty payments on secondary sales (up to 10%)
- **Marketplace Functions** - List, unlist, buy, and make offers on NFTs
- **Secure** - Built with OpenZeppelin contracts and ReentrancyGuard
- **Gas Optimized** - Efficient smart contract design
- **2.5% Marketplace Fee** - Sustainable platform economics

## Technology Stack

- Solidity ^0.8.20
- Hardhat (Development Framework)
- OpenZeppelin Contracts
- Ethers.js
- Mocha & Chai (Testing)

## Smart Contract Functions

### Core Functions
- `mintNFT(tokenURI, royalty)` - Create new NFT with royalty percentage
- `listNFT(tokenId, price)` - List NFT for sale
- `unlistNFT(tokenId)` - Remove NFT from marketplace
- `buyNFT(tokenId)` - Purchase listed NFT
- `makeOffer(tokenId)` - Make offer on any NFT
- `acceptOffer(tokenId, offerIndex)` - Accept an offer
- `cancelOffer(tokenId, offerIndex)` - Cancel your offer

### View Functions
- `getTokensByOwner(address)` - Get all tokens owned by address
- `getListedNFTs()` - Get all listed NFTs in marketplace
- `getTotalNFTs()` - Get total minted NFTs
- `getCreator(tokenId)` - Get original creator
- `getRoyalty(tokenId)` - Get royalty percentage

## Deployed Contracts

### Sepolia Testnet
- **Contract Address:** `0xfFd322FBe14c824b3E8f25e69a68156bd4c4059C`
- **Network:** Sepolia (Chain ID: 11155111)
- **Explorer:** [View on Etherscan](https://sepolia.etherscan.io/address/0xfFd322FBe14c824b3E8f25e69a68156bd4c4059C)

## Setup & Installation

### Prerequisites
- Node.js v16+
- npm or yarn
- MetaMask wallet

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd nft-project-clean

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add your PRIVATE_KEY and SEPOLIA_RPC_URL
Environment Variables
Create a .env file:
envPRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
Never commit your .env file or expose private keys!
Testing
bash# Run all tests
npx hardhat test

# Run tests with gas reporting
REPORT_GAS=true npx hardhat test

# Run tests with coverage
npx hardhat coverage
Deployment
Deploy to Sepolia Testnet
bashnpx hardhat run scripts/deploy.js --network sepolia
Verify Contract (Optional)
bashnpx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
Project Structure
nft-project-clean/
├── contracts/
│   └── DecentraArt.sol          # Main NFT marketplace contract
├── scripts/
│   └── deploy.js                # Deployment script
├── test/
│   └── DecentraArt.test.js      # Test suite
├── hardhat.config.js            # Hardhat configuration
└── README.md
Security

Audited OpenZeppelin contracts
ReentrancyGuard protection
Ownership controls
Comprehensive test coverage

Gas Optimization
The contract is optimized for gas efficiency:

Minimal storage operations
Efficient loops
Batch operations where possible

License
MIT License
Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
Support
For questions and support, please open an issue in the GitHub repository.
Disclaimer
This is a testnet deployment for educational and demonstration purposes. Use at your own risk.

---

**`nft-marketplace-frontend/README.md`:**
```markdown
