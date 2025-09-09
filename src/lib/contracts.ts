// Contract ABIs - separated for better code splitting
export const NFTFLOW_ABI = [
  // Events
  "event RentalListed(bytes32 indexed listingId, address indexed nftContract, uint256 indexed tokenId, address owner, uint256 pricePerSecond, uint256 collateralMultiplier)",
  "event RentalStarted(uint256 indexed rentalId, address indexed nftContract, uint256 indexed tokenId, address owner, address renter, uint256 duration, uint256 totalCost, uint256 streamId)",
  "event RentalCreated(uint256 indexed rentalId, address indexed nftContract, uint256 indexed tokenId, address owner, address renter, uint256 duration, uint256 totalCost)",
  "event RentalCompleted(uint256 indexed rentalId, address indexed renter, bool successful, uint256 totalPaid)",
  "event RentalCancelled(uint256 indexed rentalId, address indexed cancelledBy, string reason, uint256 refundAmount)",
  "event CollateralDeposited(address indexed user, uint256 amount)",
  "event CollateralWithdrawn(address indexed user, uint256 amount)",
  "event CreatorRoyaltySet(address indexed nftContract, address indexed creator)",
  "event UpgradeProposed(address indexed newImplementation, uint256 upgradeTime)",
  "event UpgradeExecuted(address indexed newImplementation)",
  
  // Functions
  "function listForRental(address nftContract, uint256 tokenId, uint256 basePricePerSecond, uint256 minDuration, uint256 maxDuration, uint256 collateralMultiplier) external",
  "function rentNFT(bytes32 listingId, uint256 duration) external payable",
  "function completeRental(uint256 rentalId) external",
  "function cancelRental(uint256 rentalId, string calldata reason) external",
  "function depositCollateral() external payable",
  "function withdrawCollateral(uint256 amount) external",
  "function getRental(uint256 rentalId) external view returns (tuple(address nftContract, uint256 tokenId, address owner, address renter, uint256 pricePerSecond, uint256 startTime, uint256 endTime, uint256 collateralAmount, uint256 streamId, uint8 state, uint256 createdAt, uint256 lastUpdated))",
  "function getListing(bytes32 listingId) external view returns (tuple(address nftContract, uint256 tokenId, address owner, uint256 pricePerSecond, uint256 minRentalDuration, uint256 maxRentalDuration, uint256 collateralMultiplier, bool active, uint256 createdAt, uint256 lastPriceUpdate))",
  "function getRentalState(uint256 rentalId) external view returns (uint8)",
  "function userCollateralBalance(address user) external view returns (uint256)",
  "function platformFeePercentage() external view returns (uint256)",
  "function creatorRoyaltyPercentage() external view returns (uint256)",
  "function nextRentalId() external view returns (uint256)",
  "function setCreatorRoyalty(address nftContract, address creator) external",
  "function proposeUpgrade(address newImplementation) external",
  "function executeUpgrade() external",
  "function getUtilityBasedPrice(address nftContract, uint256 tokenId, uint256 basePrice) external view returns (uint256)",
  "function hasHighUtilityDemand(address nftContract, uint256 tokenId) external view returns (bool)",
  "function pause() external",
  "function unpause() external",
  "function updatePlatformFee(uint256 newFeePercentage) external",
  "function updateCreatorRoyalty(uint256 newRoyaltyPercentage) external",
  "function withdrawPlatformFees() external"
];

export const PAYMENT_STREAM_ABI = [
  // Events
  "event StreamCreated(uint256 indexed streamId, address indexed sender, address indexed recipient, uint256 deposit, uint256 ratePerSecond, uint256 startTime, uint256 stopTime, uint256 platformFeeAmount, uint256 creatorRoyaltyAmount)",
  "event StreamWithdrawn(uint256 indexed streamId, address indexed recipient, uint256 amount, uint256 totalWithdrawn)",
  "event StreamCancelled(uint256 indexed streamId, address indexed sender, address indexed recipient, uint256 senderBalance, uint256 recipientBalance)",
  "event StreamFinalized(uint256 indexed streamId, uint256 totalPaid, uint256 platformFeeCollected, uint256 creatorRoyaltyCollected)",
  "event PlatformFeeWithdrawn(address indexed treasury, uint256 amount)",
  "event CreatorRoyaltyPaid(address indexed creator, uint256 amount)",
  
  // Functions
  "function createStream(address recipient, uint256 startTime, uint256 stopTime, address nftContract) external payable returns (uint256 streamId)",
  "function withdrawFromStream(uint256 streamId, uint256 amount) external",
  "function releaseFunds(uint256 streamId) external",
  "function finalizeStream(uint256 streamId) external",
  "function cancelStream(uint256 streamId) external",
  "function balanceOf(uint256 streamId) external view returns (uint256)",
  "function getStream(uint256 streamId) external view returns (tuple(address sender, address recipient, uint256 deposit, uint256 ratePerSecond, uint256 startTime, uint256 stopTime, uint256 remainingBalance, uint256 totalWithdrawn, bool active, bool finalized, uint256 platformFeeAmount, uint256 creatorRoyaltyAmount, address creatorAddress))",
  "function getStreamDetails(uint256 streamId) external view returns (tuple(address sender, address recipient, uint256 deposit, uint256 ratePerSecond, uint256 startTime, uint256 stopTime, uint256 remainingBalance, uint256 totalWithdrawn, bool active, bool finalized, uint256 platformFeeAmount, uint256 creatorRoyaltyAmount, address creatorAddress))",
  "function isStreamActive(uint256 streamId) external view returns (bool)",
  "function getStreamRate(uint256 streamId) external view returns (uint256)",
  "function getTotalStreamed(uint256 streamId) external view returns (uint256)",
  "function getSenderStreams(address user) external view returns (uint256[] memory)",
  "function getRecipientStreams(address user) external view returns (uint256[] memory)",
  "function setCollectionCreator(address nftContract, address creator) external",
  "function updatePlatformFee(uint256 newFeePercentage) external",
  "function updateCreatorRoyalty(uint256 newRoyaltyPercentage) external",
  "function updateTreasury(address newTreasury) external",
  "function addAuthorizedContract(address contractAddr) external",
  "function removeAuthorizedContract(address contractAddr) external",
  "function updateMaxStreamDuration(uint256 newMaxDuration) external",
  "function pause() external",
  "function unpause() external",
  "function emergencyWithdraw(uint256 streamId) external",
  "function getTotalPlatformFees() external view returns (uint256)",
  "function getTotalCreatorRoyalties() external view returns (uint256)",
  "function withdrawPlatformFees() external"
];

export const REPUTATION_SYSTEM_ABI = [
  // Events
  "event ReputationUpdated(address indexed user, uint256 oldScore, uint256 newScore, bool success)",
  "event AchievementUnlocked(address indexed user, uint256 indexed achievementId, string achievementName)",
  "event UserBlacklisted(address indexed user, bool blacklisted)",
  
  // Functions
  "function updateReputation(address user, bool success) external",
  "function getCollateralMultiplier(address user) external view returns (uint256)",
  "function getUserReputation(address user) external view returns (tuple(uint256 totalRentals, uint256 successfulRentals, uint256 reputationScore, uint256 lastUpdated, bool blacklisted))",
  "function getSuccessRate(address user) external view returns (uint256)",
  "function hasAchievement(address user, uint256 achievementId) external view returns (bool)",
  "function getAchievement(uint256 achievementId) external view returns (tuple(string name, string description, uint256 requirement, uint256 rewardPoints, bool active))",
  "function getUserAchievements(address user) external view returns (uint256[])",
  "function getTotalAchievements() external view returns (uint256)"
];

export const MOCK_PRICE_ORACLE_ABI = [
  "function getPricePerSecond(address nftContract, uint256 tokenId) external view returns (uint256 pricePerSecond)",
  "function getFloorPrice(address nftContract) external view returns (uint256 floorPrice)",
  "function updatePrice(address nftContract, uint256 tokenId, uint256 pricePerSecond) external",
  "function hasPrice(address nftContract, uint256 tokenId) external view returns (bool)",
  "function setFloorPrice(address nftContract, uint256 floorPrice) external"
];

export const MOCK_ERC721_ABI = [
  "function mint(address to, uint256 tokenId) external",
  "function safeMint(address to) external",
  "function burn(uint256 tokenId) external",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function isApprovedForAll(address owner, address operator) external view returns (bool)",
  "function setApprovalForAll(address operator, bool approved) external",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function tokenURI(uint256 tokenId) external view returns (string)"
];

export const DYNAMIC_PRICING_ABI = [
  // Events
  "event PricingDataUpdated(address indexed nftContract, uint256 indexed tokenId, uint256 newUtilizationRate, uint256 newPrice)",
  "event CollectionPricingUpdated(address indexed nftContract, uint256 floorPrice, uint256 averagePrice, uint256 lastSalePrice)",
  "event PricingParametersUpdated(uint256 highDemandMultiplier, uint256 lowDemandMultiplier, uint256 maxMultiplier, uint256 minMultiplier)",
  
  // Functions
  "function getDynamicPrice(address nftContract, uint256 tokenId, uint256 basePrice, address user) external view returns (uint256)",
  "function updatePricingData(address nftContract, uint256 tokenId, uint256 rentalDuration, uint256 pricePerSecond) external",
  "function updateCollectionPricing(address nftContract) external",
  "function getUtilizationRate(address nftContract, uint256 tokenId) external view returns (uint256)",
  "function getPricingData(address nftContract, uint256 tokenId) external view returns (tuple(uint256 basePrice, uint256 utilizationRate, uint256 lastUpdate, uint256 rentalCount, uint256 totalRentalTime, uint256 rollingWindowStart))",
  "function getCollectionPricing(address nftContract) external view returns (tuple(uint256 floorPrice, uint256 averagePrice, uint256 lastSalePrice, uint256 rarityScore, uint256 lastUpdate))",
  "function hasHighUtilityDemand(address nftContract, uint256 tokenId) external view returns (bool)",
  "function getSuggestedPrice(address nftContract, uint256 tokenId) external view returns (uint256)",
  "function getComprehensivePricing(address nftContract, uint256 tokenId, uint256 basePrice, address user) external view returns (uint256 dynamicPrice, uint256 utilizationRate, uint256 utilizationMultiplier, uint256 oraclePrice, uint256 reputationDiscount, uint256 finalPrice)",
  "function updatePricingParameters(uint256 _highDemandMultiplier, uint256 _lowDemandMultiplier, uint256 _maxMultiplier, uint256 _minMultiplier) external",
  "function updateReputationDiscounts(uint256 _highReputationDiscount, uint256 _midReputationDiscount, uint256 _lowReputationDiscount) external",
  "function updateOraclePriceMultiplier(uint256 _multiplier) external",
  "function addAuthorizedContract(address contractAddr) external",
  "function removeAuthorizedContract(address contractAddr) external"
];

export const UTILITY_TRACKER_ABI = [
  // Events
  "event UtilityUsageRecorded(uint256 indexed usageId, address indexed nftContract, uint256 indexed tokenId, address user, uint256 utilityType, uint256 duration, uint256 utilityValue)",
  "event UtilityAnalyticsUpdated(bytes32 indexed nftKey, uint256 utilityScore, uint256 totalUsageTime, uint256 totalRentals)",
  
  // Functions
  "function recordUtilityUsage(address nftContract, uint256 tokenId, address user, uint256 startTime, uint256 endTime, uint256 utilityType, uint256 utilityValue) external",
  "function getNFTAnalytics(address nftContract, uint256 tokenId) external view returns (tuple(uint256 totalUsageTime, uint256 totalRentals, uint256 averageRentalDuration, uint256 peakUsageHours, uint256 utilityScore, uint256 lastUsed))",
  "function getUserUtilityScore(address user) external view returns (uint256)",
  "function getUtilityBasedPrice(address nftContract, uint256 tokenId, uint256 basePrice) external view returns (uint256)",
  "function getPopularRentalDuration(address nftContract, uint256 tokenId) external view returns (uint256)",
  "function hasHighUtilityDemand(address nftContract, uint256 tokenId) external view returns (bool)",
  "function getUserUtilityHistory(address user) external view returns (uint256[])",
  "function getUtilityUsage(uint256 usageId) external view returns (tuple(address nftContract, uint256 tokenId, address user, uint256 startTime, uint256 endTime, uint256 utilityType, uint256 utilityValue, bool completed))",
  "function getUtilityTypeName(uint256 utilityType) external pure returns (string)"
];
