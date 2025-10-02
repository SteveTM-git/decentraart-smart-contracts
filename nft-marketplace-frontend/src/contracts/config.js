export const CONTRACT_ADDRESS = "0xfFd322FBe14c824b3E8f25e69a68156bd4c4059C";

export const CONTRACT_ABI = [
  "function mintNFT(string memory tokenURI, uint256 royalty) public returns (uint256)",
  "function listNFT(uint256 tokenId, uint256 price) public",
  "function unlistNFT(uint256 tokenId) public",
  "function buyNFT(uint256 tokenId) public payable",
  "function makeOffer(uint256 tokenId) public payable",
  "function acceptOffer(uint256 tokenId, uint256 offerIndex) public",
  "function cancelOffer(uint256 tokenId, uint256 offerIndex) public",
  "function getOffers(uint256 tokenId) public view returns (tuple(address buyer, uint256 amount, uint256 timestamp)[])",
  "function getTokensByOwner(address owner) public view returns (uint256[])",
  "function getListedNFTs() public view returns (uint256[])",
  "function getTotalNFTs() public view returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function getCreator(uint256 tokenId) public view returns (address)",
  "function getRoyalty(uint256 tokenId) public view returns (uint256)",
  "function listings(uint256) public view returns (uint256 tokenId, address seller, uint256 price, bool isListed)",
  "event NFTMinted(uint256 indexed tokenId, address indexed creator, string tokenURI)",
  "event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price)",
  "event NFTSold(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price)",
  "event OfferMade(uint256 indexed tokenId, address indexed buyer, uint256 amount)",
  "event OfferAccepted(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 amount)"
];