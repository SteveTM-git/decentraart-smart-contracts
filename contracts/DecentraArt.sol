// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DecentraArt - Enhanced NFT Marketplace
 * @dev Complete NFT marketplace with advanced features
 */
contract DecentraArt is ERC721URIStorage, Ownable, ReentrancyGuard {
    
    uint256 private _tokenIdCounter;
    uint256 public marketplaceFee = 25; // 2.5% fee
    
    struct NFTListing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isListed;
    }
    
    struct Offer {
        address buyer;
        uint256 amount;
        uint256 timestamp;
    }
    
    // Mappings
    mapping(uint256 => NFTListing) public listings;
    mapping(address => uint256) public userSales;
    mapping(uint256 => Offer[]) public tokenOffers;
    mapping(uint256 => address) public tokenCreators; // Track original creators
    mapping(uint256 => uint256) public royaltyPercentage; // Royalty for creators
    
    // Events
    event NFTMinted(uint256 indexed tokenId, address indexed creator, string tokenURI);
    event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event NFTSold(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price);
    event NFTUnlisted(uint256 indexed tokenId, address indexed seller);
    event OfferMade(uint256 indexed tokenId, address indexed buyer, uint256 amount);
    event OfferAccepted(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 amount);
    event OfferCancelled(uint256 indexed tokenId, address indexed buyer);
    
    constructor() ERC721("DecentraArt", "DART") Ownable(msg.sender) {}
    
    /**
     * @dev Mint NFT with optional royalty percentage
     * @param tokenURI IPFS URI for metadata
     * @param royalty Royalty percentage (0-100, where 50 = 5%)
     */
    function mintNFT(string memory tokenURI, uint256 royalty) public returns (uint256) {
        require(royalty <= 100, "Royalty cannot exceed 10%");
        
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        tokenCreators[newTokenId] = msg.sender;
        royaltyPercentage[newTokenId] = royalty;
        
        emit NFTMinted(newTokenId, msg.sender, tokenURI);
        return newTokenId;
    }
    
    /**
     * @dev List NFT for sale
     */
    function listNFT(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "You don't own this NFT");
        require(price > 0, "Price must be greater than 0");
        require(!listings[tokenId].isListed, "Already listed");
        
        approve(address(this), tokenId);
        listings[tokenId] = NFTListing(tokenId, msg.sender, price, true);
        
        emit NFTListed(tokenId, msg.sender, price);
    }
    
    /**
     * @dev Unlist NFT from marketplace
     */
    function unlistNFT(uint256 tokenId) public {
        require(listings[tokenId].seller == msg.sender, "Not your listing");
        require(listings[tokenId].isListed, "Not listed");
        
        delete listings[tokenId];
        emit NFTUnlisted(tokenId, msg.sender);
    }
    
    /**
     * @dev Buy NFT with royalty support
     */
    function buyNFT(uint256 tokenId) public payable nonReentrant {
        NFTListing memory listing = listings[tokenId];
        require(listing.isListed, "NFT is not listed");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy your own NFT");
        
        // Calculate fees and royalties
        uint256 marketplaceCut = (listing.price * marketplaceFee) / 1000;
        uint256 royaltyCut = 0;
        
        address creator = tokenCreators[tokenId];
        if (creator != listing.seller && royaltyPercentage[tokenId] > 0) {
            royaltyCut = (listing.price * royaltyPercentage[tokenId]) / 1000;
        }
        
        uint256 sellerAmount = listing.price - marketplaceCut - royaltyCut;
        
        // Transfer NFT
        _transfer(listing.seller, msg.sender, tokenId);
        
        // Transfer payments
        payable(listing.seller).transfer(sellerAmount);
        if (royaltyCut > 0) {
            payable(creator).transfer(royaltyCut);
        }
        
        // Update tracking
        userSales[listing.seller] += listing.price;
        delete listings[tokenId];
        
        // Refund excess
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }
        
        emit NFTSold(tokenId, msg.sender, listing.seller, listing.price);
    }
    
    /**
     * @dev Make an offer on an NFT
     */
    function makeOffer(uint256 tokenId) public payable {
        require(_ownerOf(tokenId) != address(0), "NFT does not exist");
        require(msg.value > 0, "Offer must be greater than 0");
        require(ownerOf(tokenId) != msg.sender, "Cannot offer on your own NFT");
        
        tokenOffers[tokenId].push(Offer({
            buyer: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));
        
        emit OfferMade(tokenId, msg.sender, msg.value);
    }
    
    /**
     * @dev Accept an offer on your NFT
     */
    function acceptOffer(uint256 tokenId, uint256 offerIndex) public nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "You don't own this NFT");
        require(offerIndex < tokenOffers[tokenId].length, "Invalid offer");
        
        Offer memory offer = tokenOffers[tokenId][offerIndex];
        
        // Calculate fees and royalties
        uint256 marketplaceCut = (offer.amount * marketplaceFee) / 1000;
        uint256 royaltyCut = 0;
        
        address creator = tokenCreators[tokenId];
        if (creator != msg.sender && royaltyPercentage[tokenId] > 0) {
            royaltyCut = (offer.amount * royaltyPercentage[tokenId]) / 1000;
        }
        
        uint256 sellerAmount = offer.amount - marketplaceCut - royaltyCut;
        
        // Transfer NFT
        _transfer(msg.sender, offer.buyer, tokenId);
        
        // Transfer payments
        payable(msg.sender).transfer(sellerAmount);
        if (royaltyCut > 0) {
            payable(creator).transfer(royaltyCut);
        }
        
        // Refund other offers
        for (uint256 i = 0; i < tokenOffers[tokenId].length; i++) {
            if (i != offerIndex) {
                payable(tokenOffers[tokenId][i].buyer).transfer(tokenOffers[tokenId][i].amount);
            }
        }
        
        // Clear offers and listing
        delete tokenOffers[tokenId];
        if (listings[tokenId].isListed) {
            delete listings[tokenId];
        }
        
        emit OfferAccepted(tokenId, msg.sender, offer.buyer, offer.amount);
    }
    
    /**
     * @dev Cancel your offer
     */
    function cancelOffer(uint256 tokenId, uint256 offerIndex) public nonReentrant {
        require(offerIndex < tokenOffers[tokenId].length, "Invalid offer");
        require(tokenOffers[tokenId][offerIndex].buyer == msg.sender, "Not your offer");
        
        uint256 refundAmount = tokenOffers[tokenId][offerIndex].amount;
        
        // Remove offer from array
        tokenOffers[tokenId][offerIndex] = tokenOffers[tokenId][tokenOffers[tokenId].length - 1];
        tokenOffers[tokenId].pop();
        
        // Refund
        payable(msg.sender).transfer(refundAmount);
        
        emit OfferCancelled(tokenId, msg.sender);
    }
    
    /**
     * @dev Get all offers for a token
     */
    function getOffers(uint256 tokenId) public view returns (Offer[] memory) {
        return tokenOffers[tokenId];
    }
    
    /**
     * @dev Get tokens owned by address
     */
    function getTokensByOwner(address owner) public view returns (uint256[] memory) {
        uint256 totalTokens = _tokenIdCounter;
        uint256 tokenCount = 0;
        
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (_ownerOf(i) == owner) {
                tokenCount++;
            }
        }
        
        uint256[] memory ownedTokens = new uint256[](tokenCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (_ownerOf(i) == owner) {
                ownedTokens[index] = i;
                index++;
            }
        }
        
        return ownedTokens;
    }
    
    /**
     * @dev Get all listed NFTs
     */
    function getListedNFTs() public view returns (uint256[] memory) {
        uint256 totalTokens = _tokenIdCounter;
        uint256 listedCount = 0;
        
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (listings[i].isListed) {
                listedCount++;
            }
        }
        
        uint256[] memory listedTokens = new uint256[](listedCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (listings[i].isListed) {
                listedTokens[index] = i;
                index++;
            }
        }
        
        return listedTokens;
    }
    
    /**
     * @dev Get total minted NFTs
     */
    function getTotalNFTs() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Update marketplace fee (owner only)
     */
    function setMarketplaceFee(uint256 newFee) public onlyOwner {
        require(newFee <= 100, "Fee cannot exceed 10%");
        marketplaceFee = newFee;
    }
    
    /**
     * @dev Withdraw marketplace fees (owner only)
     */
    function withdrawFees() public onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Get NFT creator
     */
    function getCreator(uint256 tokenId) public view returns (address) {
        return tokenCreators[tokenId];
    }
    
    /**
     * @dev Get NFT royalty percentage
     */
    function getRoyalty(uint256 tokenId) public view returns (uint256) {
        return royaltyPercentage[tokenId];
    }
}