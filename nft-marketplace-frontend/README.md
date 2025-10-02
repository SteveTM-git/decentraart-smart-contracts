# DecentraArt NFT Marketplace - Frontend

A modern, user-friendly web interface for the DecentraArt NFT marketplace built with React and ethers.js.

## Features

- **MetaMask Integration** - Seamless wallet connection
- **Auto Network Switching** - Automatically switches to Sepolia testnet
- **Real-time Updates** - Live blockchain data synchronization
- **Intuitive UI** - Beautiful, responsive design
- **Complete Marketplace** - Browse, mint, buy, and manage NFTs
- **Transaction Feedback** - Clear status messages for all operations

## Technology Stack

- React 18
- Ethers.js v6
- CSS3 with modern design
- MetaMask Web3 Provider

## Prerequisites

- Node.js v16+
- MetaMask browser extension
- Sepolia testnet ETH ([Get free test ETH](https://sepoliafaucet.com))

## Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd nft-marketplace-frontend

# Install dependencies
npm install

# Start development server
npm start
The app will open at http://localhost:3000
Configuration
The contract configuration is in src/contracts/config.js:
javascriptexport const CONTRACT_ADDRESS = "0xfFd322FBe14c824b3E8f25e69a68156bd4c4059C";
export const CONTRACT_ABI = [...];
Usage Guide
1. Connect Wallet

Click "Connect MetaMask Wallet"
Approve the connection
The app will automatically switch to Sepolia network

2. Mint NFT

Go to "Mint NFT" tab
Enter token URI (IPFS hash or metadata URL)
Set royalty percentage (0-100, where 50 = 5%)
Click "Mint NFT" and approve transaction

3. List for Sale

After minting, use the "List NFT for Sale" form
Enter your token ID
Set price in ETH
Approve transaction

4. Buy NFT

Browse "Marketplace" tab
Click "Buy Now" on any listed NFT
Confirm transaction in MetaMask

5. Manage Collection

View all your NFTs in "My NFTs" tab
Unlist any NFT you've listed for sale

Features Overview
Marketplace Tab

Browse all listed NFTs
View prices, sellers, and token IDs
Purchase NFTs instantly
See creator information

Mint NFT Tab

Create new NFTs with custom metadata
Set creator royalties
List newly minted NFTs for sale

My NFTs Tab

View your complete collection
See which NFTs are listed
Unlist NFTs from marketplace
Track original creator status

Network Details

Network: Sepolia Testnet
Chain ID: 11155111
Contract: 0xfFd322FBe14c824b3E8f25e69a68156bd4c4059C
Currency: SepoliaETH (test ETH)

Get Test ETH
Visit any Sepolia faucet:

Alchemy Sepolia Faucet
Sepolia Faucet
Google Cloud Faucet

Build for Production
bashnpm run build
Creates optimized production build in build/ folder.
Project Structure
nft-marketplace-frontend/
├── public/
├── src/
│   ├── contracts/
│   │   └── config.js          # Contract configuration
│   ├── App.js                 # Main application
│   ├── App.css                # Styles
│   └── index.js               # Entry point
├── package.json
└── README.md
Troubleshooting
MetaMask Not Detected

Install MetaMask browser extension
Refresh the page

Wrong Network

The app auto-switches to Sepolia
If it fails, manually switch in MetaMask

Transaction Failed

Ensure you have enough SepoliaETH
Check you're on Sepolia network
Verify you own the NFT you're trying to list

Browser Support

Chrome (recommended)
Firefox
Brave
Edge

Contributing
Contributions welcome! Please open an issue or submit a PR.
License
MIT License
Disclaimer
This is a testnet application for educational purposes. All transactions use test ETH with no real monetary value.