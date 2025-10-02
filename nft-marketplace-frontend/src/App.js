import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contracts/config';
import './App.css';

const SEPOLIA_CHAIN_ID = '0xaa36a7';

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  
  const [myNFTs, setMyNFTs] = useState([]);
  const [listedNFTs, setListedNFTs] = useState([]);
  const [totalNFTs, setTotalNFTs] = useState(0);
  
  const [mintForm, setMintForm] = useState({ tokenURI: '', royalty: 50 });
  const [listForm, setListForm] = useState({ tokenId: '', price: '' });
  
  const [activeTab, setActiveTab] = useState('marketplace');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask browser extension to use this marketplace!');
        return;
      }

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia Test Network',
                nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io']
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      setAccount(accounts[0]);
      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setShowWelcome(false);
      
      loadData(contract, accounts[0]);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setMessage('Failed to connect wallet. Please try again.');
    }
  };

  const loadData = async (contractInstance, userAccount) => {
    try {
      const total = await contractInstance.getTotalNFTs();
      setTotalNFTs(Number(total));
      
      const myTokens = await contractInstance.getTokensByOwner(userAccount);
      const myNFTData = await Promise.all(
        myTokens.map(async (tokenId) => {
          const uri = await contractInstance.tokenURI(tokenId);
          const listing = await contractInstance.listings(tokenId);
          const creator = await contractInstance.getCreator(tokenId);
          const royalty = await contractInstance.getRoyalty(tokenId);
          return {
            tokenId: Number(tokenId),
            uri,
            isListed: listing.isListed,
            price: listing.price,
            creator,
            royalty: Number(royalty)
          };
        })
      );
      setMyNFTs(myNFTData);
      
      const listedTokenIds = await contractInstance.getListedNFTs();
      const listedData = await Promise.all(
        listedTokenIds.map(async (tokenId) => {
          const uri = await contractInstance.tokenURI(tokenId);
          const listing = await contractInstance.listings(tokenId);
          const owner = await contractInstance.ownerOf(tokenId);
          const creator = await contractInstance.getCreator(tokenId);
          return {
            tokenId: Number(tokenId),
            uri,
            price: listing.price,
            seller: owner,
            creator
          };
        })
      );
      setListedNFTs(listedData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const mintNFT = async () => {
    if (!contract) return;
    
    setLoading(true);
    setMessage('');
    try {
      const tx = await contract.mintNFT(mintForm.tokenURI, mintForm.royalty);
      setMessage('Transaction submitted! Waiting for confirmation...');
      await tx.wait();
      
      setMessage('NFT Minted Successfully! Check "My NFTs" tab.');
      setMintForm({ tokenURI: '', royalty: 50 });
      loadData(contract, account);
    } catch (error) {
      console.error('Error minting NFT:', error);
      setMessage('Failed to mint NFT. Please try again.');
    }
    setLoading(false);
  };

  const listNFT = async () => {
    if (!contract) return;
    
    setLoading(true);
    setMessage('');
    try {
      const priceInWei = ethers.parseEther(listForm.price);
      const tx = await contract.listNFT(listForm.tokenId, priceInWei);
      setMessage('Transaction submitted! Waiting for confirmation...');
      await tx.wait();
      
      setMessage('NFT Listed Successfully! Check the Marketplace tab.');
      setListForm({ tokenId: '', price: '' });
      loadData(contract, account);
    } catch (error) {
      console.error('Error listing NFT:', error);
      setMessage('Failed to list NFT. Make sure you own this token.');
    }
    setLoading(false);
  };

  const unlistNFT = async (tokenId) => {
    if (!contract) return;
    
    setLoading(true);
    setMessage('');
    try {
      const tx = await contract.unlistNFT(tokenId);
      setMessage('Transaction submitted! Waiting for confirmation...');
      await tx.wait();
      
      setMessage('NFT Unlisted Successfully!');
      loadData(contract, account);
    } catch (error) {
      console.error('Error unlisting NFT:', error);
      setMessage('Failed to unlist NFT.');
    }
    setLoading(false);
  };

  const buyNFT = async (tokenId, price) => {
    if (!contract) return;
    
    setLoading(true);
    setMessage('');
    try {
      const tx = await contract.buyNFT(tokenId, { value: price });
      setMessage('Transaction submitted! Waiting for confirmation...');
      await tx.wait();
      
      setMessage('NFT Purchased Successfully! Check "My NFTs" tab.');
      loadData(contract, account);
    } catch (error) {
      console.error('Error buying NFT:', error);
      setMessage('Failed to buy NFT. Check your balance.');
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <header className="header">
        <div className="logo">
          <h1>DecentraArt</h1>
          <span className="beta-badge">Testnet</span>
        </div>
        {!account ? (
          <button onClick={connectWallet} className="connect-btn">
            Connect MetaMask Wallet
          </button>
        ) : (
          <div className="account-info">
            <div className="account-badge">
              <span className="account-label">Connected:</span>
              <span className="account-address">{account.slice(0, 6)}...{account.slice(-4)}</span>
            </div>
            <div className="stats-badge">
              <span>Total NFTs: {totalNFTs}</span>
            </div>
          </div>
        )}
      </header>

      {message && (
        <div className={`message ${message.includes('Failed') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {showWelcome && !account && (
        <div className="welcome-section">
          <div className="hero">
            <h2>Welcome to DecentraArt NFT Marketplace</h2>
            <p className="subtitle">A decentralized platform for creating, buying, and selling NFTs with built-in creator royalties</p>
            <button onClick={connectWallet} className="cta-button">
              Get Started - Connect Wallet
            </button>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Mint Your NFTs</h3>
              <p>Create unique digital assets with custom metadata and set your own royalty percentages (up to 10%)</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏪</div>
              <h3>List & Sell</h3>
              <p>List your NFTs for sale at any price. You can unlist anytime before someone buys</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Earn Royalties</h3>
              <p>Original creators earn royalties on every secondary sale automatically via smart contracts</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Transparent</h3>
              <p>All transactions are recorded on the Ethereum blockchain. 2.5% marketplace fee on sales</p>
            </div>
          </div>

          <div className="how-it-works">
            <h3>How It Works</h3>
            <div className="steps">
              <div className="step">
                <span className="step-number">1</span>
                <div>
                  <h4>Connect Your Wallet</h4>
                  <p>Click "Connect MetaMask Wallet" and approve the connection. Make sure you're on Sepolia testnet.</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <div>
                  <h4>Mint Your First NFT</h4>
                  <p>Go to "Mint NFT" tab, enter your token URI (IPFS link or metadata), set royalty percentage, and mint.</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <div>
                  <h4>List for Sale (Optional)</h4>
                  <p>Enter your token ID and price in ETH, then list it on the marketplace for others to buy.</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">4</span>
                <div>
                  <h4>Browse & Trade</h4>
                  <p>Explore the marketplace, buy NFTs you like, and manage your collection in "My NFTs" tab.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="info-box">
            <h4>Important Notes:</h4>
            <ul>
              <li>This marketplace runs on <strong>Sepolia testnet</strong> - all transactions use test ETH (no real money)</li>
              <li>Get free test ETH from <a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer">Sepolia Faucet</a></li>
              <li>You need MetaMask browser extension installed</li>
              <li>Contract Address: {CONTRACT_ADDRESS}</li>
            </ul>
          </div>
        </div>
      )}

      {account && (
        <>
          <nav className="tabs">
            <button 
              className={activeTab === 'marketplace' ? 'active' : ''} 
              onClick={() => setActiveTab('marketplace')}
            >
              Marketplace
              <span className="tab-description">Browse & Buy NFTs</span>
            </button>
            <button 
              className={activeTab === 'mint' ? 'active' : ''} 
              onClick={() => setActiveTab('mint')}
            >
              Mint NFT
              <span className="tab-description">Create New NFTs</span>
            </button>
            <button 
              className={activeTab === 'my-nfts' ? 'active' : ''} 
              onClick={() => setActiveTab('my-nfts')}
            >
              My NFTs ({myNFTs.length})
              <span className="tab-description">Your Collection</span>
            </button>
          </nav>

          <main className="content">
            {activeTab === 'marketplace' && (
              <div className="marketplace">
                <div className="section-header">
                  <h2>NFT Marketplace</h2>
                  <p>Browse and purchase NFTs listed by other creators</p>
                </div>
                <div className="nft-grid">
                  {listedNFTs.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">🛒</div>
                      <h3>No NFTs Listed Yet</h3>
                      <p>Be the first to mint and list an NFT for sale!</p>
                      <button onClick={() => setActiveTab('mint')} className="empty-action">
                        Mint Your First NFT
                      </button>
                    </div>
                  ) : (
                    listedNFTs.map((nft) => (
                      <div key={nft.tokenId} className="nft-card">
                        <div className="nft-image">#{nft.tokenId}</div>
                        <div className="nft-details">
                          <div className="nft-id">Token ID: {nft.tokenId}</div>
                          <div className="nft-uri">{nft.uri}</div>
                          <div className="nft-meta">
                            <div className="meta-item">
                              <span className="meta-label">Price:</span>
                              <span className="meta-value price">{ethers.formatEther(nft.price)} ETH</span>
                            </div>
                            <div className="meta-item">
                              <span className="meta-label">Seller:</span>
                              <span className="meta-value">{nft.seller.slice(0, 6)}...{nft.seller.slice(-4)}</span>
                            </div>
                          </div>
                          {nft.seller.toLowerCase() !== account.toLowerCase() ? (
                            <button 
                              onClick={() => buyNFT(nft.tokenId, nft.price)}
                              disabled={loading}
                              className="buy-btn"
                            >
                              {loading ? 'Processing...' : 'Buy Now'}
                            </button>
                          ) : (
                            <div className="own-badge">You own this NFT</div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'mint' && (
              <div className="mint-section">
                <div className="section-header">
                  <h2>Mint New NFT</h2>
                  <p>Create your unique digital asset on the blockchain</p>
                </div>
                
                <div className="form-container">
                  <div className="form-card">
                    <h3>Create NFT</h3>
                    <div className="form-group">
                      <label>Token URI</label>
                      <input
                        type="text"
                        placeholder="ipfs://Qm... or https://..."
                        value={mintForm.tokenURI}
                        onChange={(e) => setMintForm({ ...mintForm, tokenURI: e.target.value })}
                      />
                      <small>IPFS hash or URL pointing to your NFT metadata JSON file</small>
                    </div>
                    <div className="form-group">
                      <label>Royalty Percentage</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="50"
                        value={mintForm.royalty}
                        onChange={(e) => setMintForm({ ...mintForm, royalty: e.target.value })}
                      />
                      <small>Enter 50 for 5% royalty (max 100 = 10%). You'll earn this on every resale.</small>
                    </div>
                    <button 
                      onClick={mintNFT} 
                      disabled={loading || !mintForm.tokenURI}
                      className="mint-btn"
                    >
                      {loading ? 'Minting...' : 'Mint NFT'}
                    </button>
                  </div>

                  <div className="form-card">
                    <h3>List NFT for Sale</h3>
                    <div className="form-group">
                      <label>Token ID</label>
                      <input
                        type="number"
                        placeholder="1"
                        value={listForm.tokenId}
                        onChange={(e) => setListForm({ ...listForm, tokenId: e.target.value })}
                      />
                      <small>The ID of the NFT you want to list (check "My NFTs" tab)</small>
                    </div>
                    <div className="form-group">
                      <label>Price (ETH)</label>
                      <input
                        type="text"
                        placeholder="0.01"
                        value={listForm.price}
                        onChange={(e) => setListForm({ ...listForm, price: e.target.value })}
                      />
                      <small>Set your selling price in ETH (e.g., 0.01 for 0.01 ETH)</small>
                    </div>
                    <button 
                      onClick={listNFT} 
                      disabled={loading || !listForm.tokenId || !listForm.price}
                      className="list-btn"
                    >
                      {loading ? 'Listing...' : 'List for Sale'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'my-nfts' && (
              <div className="my-nfts">
                <div className="section-header">
                  <h2>My NFT Collection</h2>
                  <p>Manage and view all your owned NFTs</p>
                </div>
                <div className="nft-grid">
                  {myNFTs.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">🖼️</div>
                      <h3>No NFTs in Your Collection</h3>
                      <p>Start by minting your first NFT or buying from the marketplace</p>
                      <button onClick={() => setActiveTab('mint')} className="empty-action">
                        Mint Your First NFT
                      </button>
                    </div>
                  ) : (
                    myNFTs.map((nft) => (
                      <div key={nft.tokenId} className="nft-card my-nft">
                        <div className="nft-image">#{nft.tokenId}</div>
                        <div className="nft-details">
                          <div className="nft-id">Token ID: {nft.tokenId}</div>
                          <div className="nft-uri">{nft.uri}</div>
                          <div className="nft-meta">
                            <div className="meta-item">
                              <span className="meta-label">Royalty:</span>
                              <span className="meta-value">{nft.royalty / 10}%</span>
                            </div>
                            {nft.creator.toLowerCase() === account.toLowerCase() && (
                              <div className="creator-badge">Original Creator</div>
                            )}
                          </div>
                          {nft.isListed ? (
                            <>
                              <div className="listed-badge">
                                Listed for {ethers.formatEther(nft.price)} ETH
                              </div>
                              <button 
                                onClick={() => unlistNFT(nft.tokenId)}
                                disabled={loading}
                                className="unlist-btn"
                              >
                                {loading ? 'Processing...' : 'Unlist from Marketplace'}
                              </button>
                            </>
                          ) : (
                            <div className="not-listed-badge">Not Currently Listed</div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
}

export default App;