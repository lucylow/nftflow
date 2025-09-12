// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NFTFlowMetadata
 * @dev Full on-chain metadata storage system for NFTFlow
 * Achieves 100% on-chain data storage, eliminating IPFS dependencies
 * Optimized for Somnia Network's low storage costs
 */
contract NFTFlowMetadata is Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    // ============ METADATA STRUCTS ============
    
    struct NFTMetadata {
        string name;
        string description;
        string[] attributes;
        string[] values;
        uint256 rarity;
        bytes32 contentHash;
        uint256 creationTime;
        address creator;
        bool isVerified;
        uint256 totalRentals;
        uint256 totalEarnings;
        uint256 lastRentalTime;
        MetadataStats stats;
    }

    struct MetadataStats {
        uint256 viewCount;
        uint256 favoriteCount;
        uint256 shareCount;
        uint256 rentalCount;
        uint256 averageRentalDuration;
        uint256 averageRentalPrice;
        uint256 popularityScore;
        uint256 liquidityScore;
    }

    struct CollectionMetadata {
        string name;
        string description;
        string symbol;
        string[] categories;
        address creator;
        uint256 totalSupply;
        uint256 totalRentals;
        uint256 totalVolume;
        uint256 floorPrice;
        uint256 ceilingPrice;
        uint256 creationTime;
        bool isVerified;
        CollectionStats stats;
    }

    struct CollectionStats {
        uint256 totalViews;
        uint256 totalFavorites;
        uint256 totalShares;
        uint256 averageRentalDuration;
        uint256 averageRentalPrice;
        uint256 popularityScore;
        uint256 liquidityScore;
        uint256 volatility;
        uint256 momentum;
    }

    struct UserProfile {
        string username;
        string bio;
        bytes32 avatarHash;
        uint256[] ownedNFTs;
        uint256[] rentalHistory;
        uint256 joinDate;
        bool isVerified;
        uint256 totalEarnings;
        uint256 totalSpent;
        UserStats stats;
    }

    struct UserStats {
        uint256 totalRentals;
        uint256 totalListings;
        uint256 averageRentalDuration;
        uint256 averageRentalPrice;
        uint256 reputationScore;
        uint256 achievementCount;
        uint256 referralCount;
        uint256 referralEarnings;
    }

    // ============ STATE VARIABLES ============
    
    // NFT metadata storage
    mapping(address => mapping(uint256 => NFTMetadata)) public nftMetadata;
    mapping(address => CollectionMetadata) public collectionMetadata;
    mapping(address => UserProfile) public userProfiles;
    
    // Metadata tracking
    mapping(bytes32 => bool) public contentHashes;
    mapping(string => bool) public usernames;
    mapping(address => bool) public verifiedCollections;
    mapping(address => bool) public verifiedUsers;
    
    // Statistics
    uint256 public totalNFTs;
    uint256 public totalCollections;
    uint256 public totalUsers;
    uint256 public totalMetadataSize;
    
    // Authorization
    mapping(address => bool) public authorizedContracts;
    mapping(address => bool) public authorizedMinters;
    
    // ============ EVENTS ============
    
    event MetadataStored(
        address indexed nftContract,
        uint256 indexed tokenId,
        string name,
        bytes32 contentHash,
        address indexed creator
    );
    
    event CollectionMetadataStored(
        address indexed collection,
        string name,
        address indexed creator
    );
    
    event UserProfileUpdated(
        address indexed user,
        string username,
        bool isVerified
    );
    
    event MetadataUpdated(
        address indexed nftContract,
        uint256 indexed tokenId,
        string field,
        string newValue
    );
    
    event CollectionVerified(
        address indexed collection,
        bool verified
    );
    
    event UserVerified(
        address indexed user,
        bool verified
    );
    
    event MetadataStatsUpdated(
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 viewCount,
        uint256 favoriteCount,
        uint256 rentalCount
    );

    // ============ MODIFIERS ============
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner() ||
            authorizedContracts[msg.sender] ||
            authorizedMinters[msg.sender],
            "Not authorized"
        );
        _;
    }
    
    modifier onlyVerifiedUser() {
        require(verifiedUsers[msg.sender], "User not verified");
        _;
    }
    
    modifier validMetadata(string memory name, string memory description) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(name).length <= 100, "Name too long");
        require(bytes(description).length <= 1000, "Description too long");
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor() Ownable() {
        totalNFTs = 0;
        totalCollections = 0;
        totalUsers = 0;
        totalMetadataSize = 0;
    }

    // ============ CORE METADATA FUNCTIONS ============

    /**
     * @dev Store NFT metadata on-chain
     */
    function storeMetadata(
        address nftContract,
        uint256 tokenId,
        string memory name,
        string memory description,
        string[] memory attributes,
        string[] memory values,
        uint256 rarity,
        bytes32 contentHash
    ) external onlyAuthorized validMetadata(name, description) {
        require(attributes.length == values.length, "Attributes and values length mismatch");
        require(attributes.length <= 20, "Too many attributes");
        require(contentHashes[contentHash] == false, "Content hash already exists");
        
        NFTMetadata storage metadata = nftMetadata[nftContract][tokenId];
        metadata.name = name;
        metadata.description = description;
        metadata.attributes = attributes;
        metadata.values = values;
        metadata.rarity = rarity;
        metadata.contentHash = contentHash;
        metadata.creationTime = block.timestamp;
        metadata.creator = msg.sender;
        metadata.isVerified = false;
        metadata.totalRentals = 0;
        metadata.totalEarnings = 0;
        metadata.lastRentalTime = 0;
        
        // Initialize stats
        metadata.stats = MetadataStats({
            viewCount: 0,
            favoriteCount: 0,
            shareCount: 0,
            rentalCount: 0,
            averageRentalDuration: 0,
            averageRentalPrice: 0,
            popularityScore: 0,
            liquidityScore: 0
        });
        
        contentHashes[contentHash] = true;
        totalNFTs = totalNFTs.add(1);
        totalMetadataSize = totalMetadataSize.add(
            bytes(name).length +
            bytes(description).length +
            attributes.length * 50 + // Estimated average attribute length
            values.length * 50 // Estimated average value length
        );
        
        emit MetadataStored(nftContract, tokenId, name, contentHash, msg.sender);
    }

    /**
     * @dev Store collection metadata on-chain
     */
    function storeCollectionMetadata(
        address collection,
        string memory name,
        string memory description,
        string memory symbol,
        string[] memory categories
    ) external onlyAuthorized validMetadata(name, description) {
        require(categories.length <= 10, "Too many categories");
        
        CollectionMetadata storage metadata = collectionMetadata[collection];
        metadata.name = name;
        metadata.description = description;
        metadata.symbol = symbol;
        metadata.categories = categories;
        metadata.creator = msg.sender;
        metadata.totalSupply = 0;
        metadata.totalRentals = 0;
        metadata.totalVolume = 0;
        metadata.floorPrice = 0;
        metadata.ceilingPrice = 0;
        metadata.creationTime = block.timestamp;
        metadata.isVerified = false;
        
        // Initialize stats
        metadata.stats = CollectionStats({
            totalViews: 0,
            totalFavorites: 0,
            totalShares: 0,
            averageRentalDuration: 0,
            averageRentalPrice: 0,
            popularityScore: 0,
            liquidityScore: 0,
            volatility: 0,
            momentum: 0
        });
        
        totalCollections = totalCollections.add(1);
        totalMetadataSize = totalMetadataSize.add(
            bytes(name).length +
            bytes(description).length +
            bytes(symbol).length +
            categories.length * 20 // Estimated average category length
        );
        
        emit CollectionMetadataStored(collection, name, msg.sender);
    }

    /**
     * @dev Update user profile on-chain
     */
    function updateUserProfile(
        string memory username,
        string memory bio,
        bytes32 avatarHash
    ) external {
        require(bytes(username).length > 0, "Username cannot be empty");
        require(bytes(username).length <= 50, "Username too long");
        require(bytes(bio).length <= 500, "Bio too long");
        require(usernames[username] == false || userProfiles[msg.sender].username == username, "Username taken");
        
        UserProfile storage profile = userProfiles[msg.sender];
        
        // If this is a new user, initialize
        if (profile.joinDate == 0) {
            profile.joinDate = block.timestamp;
            profile.isVerified = false;
            profile.totalEarnings = 0;
            profile.totalSpent = 0;
            profile.stats = UserStats({
                totalRentals: 0,
                totalListings: 0,
                averageRentalDuration: 0,
                averageRentalPrice: 0,
                reputationScore: 0,
                achievementCount: 0,
                referralCount: 0,
                referralEarnings: 0
            });
            totalUsers = totalUsers.add(1);
        }
        
        // Update username tracking
        if (bytes(profile.username).length > 0) {
            usernames[profile.username] = false;
        }
        usernames[username] = true;
        
        profile.username = username;
        profile.bio = bio;
        profile.avatarHash = avatarHash;
        
        totalMetadataSize = totalMetadataSize.add(
            bytes(username).length +
            bytes(bio).length
        );
        
        emit UserProfileUpdated(msg.sender, username, profile.isVerified);
    }

    /**
     * @dev Update NFT metadata stats
     */
    function updateMetadataStats(
        address nftContract,
        uint256 tokenId,
        uint256 viewCount,
        uint256 favoriteCount,
        uint256 shareCount,
        uint256 rentalCount
    ) external onlyAuthorized {
        NFTMetadata storage metadata = nftMetadata[nftContract][tokenId];
        require(metadata.creationTime > 0, "Metadata not found");
        
        metadata.stats.viewCount = metadata.stats.viewCount.add(viewCount);
        metadata.stats.favoriteCount = metadata.stats.favoriteCount.add(favoriteCount);
        metadata.stats.shareCount = metadata.stats.shareCount.add(shareCount);
        metadata.stats.rentalCount = metadata.stats.rentalCount.add(rentalCount);
        
        // Update popularity score
        metadata.stats.popularityScore = _calculatePopularityScore(metadata.stats);
        
        emit MetadataStatsUpdated(nftContract, tokenId, metadata.stats.viewCount, metadata.stats.favoriteCount, metadata.stats.rentalCount);
    }

    /**
     * @dev Update rental information
     */
    function updateRentalInfo(
        address nftContract,
        uint256 tokenId,
        uint256 duration,
        uint256 price
    ) external onlyAuthorized {
        NFTMetadata storage metadata = nftMetadata[nftContract][tokenId];
        require(metadata.creationTime > 0, "Metadata not found");
        
        metadata.totalRentals = metadata.totalRentals.add(1);
        metadata.lastRentalTime = block.timestamp;
        
        // Update average rental duration
        uint256 totalDuration = metadata.stats.averageRentalDuration.mul(metadata.stats.rentalCount).add(duration);
        metadata.stats.averageRentalDuration = totalDuration.div(metadata.stats.rentalCount.add(1));
        
        // Update average rental price
        uint256 totalPrice = metadata.stats.averageRentalPrice.mul(metadata.stats.rentalCount).add(price);
        metadata.stats.averageRentalPrice = totalPrice.div(metadata.stats.rentalCount.add(1));
        
        metadata.stats.rentalCount = metadata.stats.rentalCount.add(1);
        
        // Update liquidity score
        metadata.stats.liquidityScore = _calculateLiquidityScore(metadata.stats);
    }

    /**
     * @dev Update collection stats
     */
    function updateCollectionStats(
        address collection,
        uint256 totalSupply,
        uint256 totalRentals,
        uint256 totalVolume,
        uint256 floorPrice,
        uint256 ceilingPrice
    ) external onlyAuthorized {
        CollectionMetadata storage metadata = collectionMetadata[collection];
        require(metadata.creationTime > 0, "Collection metadata not found");
        
        metadata.totalSupply = totalSupply;
        metadata.totalRentals = metadata.totalRentals.add(totalRentals);
        metadata.totalVolume = metadata.totalVolume.add(totalVolume);
        metadata.floorPrice = floorPrice;
        metadata.ceilingPrice = ceilingPrice;
        
        // Update average rental duration and price
        if (metadata.totalRentals > 0) {
            metadata.stats.averageRentalDuration = metadata.stats.averageRentalDuration.mul(metadata.totalRentals.sub(totalRentals)).add(totalRentals).div(metadata.totalRentals);
            metadata.stats.averageRentalPrice = metadata.stats.averageRentalPrice.mul(metadata.totalRentals.sub(totalRentals)).add(totalVolume).div(metadata.totalRentals);
        }
        
        // Update popularity and liquidity scores
        metadata.stats.popularityScore = _calculateCollectionPopularityScore(metadata.stats);
        metadata.stats.liquidityScore = _calculateCollectionLiquidityScore(metadata.stats);
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get NFT metadata
     */
    function getNFTMetadata(address nftContract, uint256 tokenId) external view returns (NFTMetadata memory) {
        return nftMetadata[nftContract][tokenId];
    }

    /**
     * @dev Get collection metadata
     */
    function getCollectionMetadata(address collection) external view returns (CollectionMetadata memory) {
        return collectionMetadata[collection];
    }

    /**
     * @dev Get user profile
     */
    function getUserProfile(address user) external view returns (UserProfile memory) {
        return userProfiles[user];
    }

    /**
     * @dev Get metadata by content hash
     */
    function getMetadataByContentHash(bytes32 contentHash) external view returns (
        address nftContract,
        uint256 tokenId,
        string memory name
    ) {
        // This would require additional mapping for reverse lookup
        // For now, return empty values
        return (address(0), 0, "");
    }

    /**
     * @dev Get collection by category
     */
    function getCollectionsByCategory(string memory category) external view returns (address[] memory) {
        // This would require additional mapping for category lookup
        // For now, return empty array
        address[] memory result = new address[](0);
        return result;
    }

    /**
     * @dev Get user's owned NFTs
     */
    function getUserOwnedNFTs(address user) external view returns (uint256[] memory) {
        return userProfiles[user].ownedNFTs;
    }

    /**
     * @dev Get user's rental history
     */
    function getUserRentalHistory(address user) external view returns (uint256[] memory) {
        return userProfiles[user].rentalHistory;
    }

    // ============ VERIFICATION FUNCTIONS ============

    /**
     * @dev Verify collection
     */
    function verifyCollection(address collection) external onlyOwner {
        verifiedCollections[collection] = true;
        collectionMetadata[collection].isVerified = true;
        emit CollectionVerified(collection, true);
    }

    /**
     * @dev Unverify collection
     */
    function unverifyCollection(address collection) external onlyOwner {
        verifiedCollections[collection] = false;
        collectionMetadata[collection].isVerified = false;
        emit CollectionVerified(collection, false);
    }

    /**
     * @dev Verify user
     */
    function verifyUser(address user) external onlyOwner {
        verifiedUsers[user] = true;
        userProfiles[user].isVerified = true;
        emit UserVerified(user, true);
    }

    /**
     * @dev Unverify user
     */
    function unverifyUser(address user) external onlyOwner {
        verifiedUsers[user] = false;
        userProfiles[user].isVerified = false;
        emit UserVerified(user, false);
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Calculate popularity score
     */
    function _calculatePopularityScore(MetadataStats memory stats) internal pure returns (uint256) {
        uint256 score = 0;
        score = score.add(stats.viewCount.div(10));
        score = score.add(stats.favoriteCount.mul(5));
        score = score.add(stats.shareCount.mul(3));
        score = score.add(stats.rentalCount.mul(2));
        return score;
    }

    /**
     * @dev Calculate liquidity score
     */
    function _calculateLiquidityScore(MetadataStats memory stats) internal pure returns (uint256) {
        if (stats.rentalCount == 0) return 0;
        return stats.averageRentalPrice.mul(stats.rentalCount).div(1000);
    }

    /**
     * @dev Calculate collection popularity score
     */
    function _calculateCollectionPopularityScore(CollectionStats memory stats) internal pure returns (uint256) {
        uint256 score = 0;
        score = score.add(stats.totalViews.div(100));
        score = score.add(stats.totalFavorites.mul(10));
        score = score.add(stats.totalShares.mul(5));
        return score;
    }

    /**
     * @dev Calculate collection liquidity score
     */
    function _calculateCollectionLiquidityScore(CollectionStats memory stats) internal pure returns (uint256) {
        if (stats.averageRentalPrice == 0) return 0;
        return stats.averageRentalPrice.mul(stats.totalViews).div(10000);
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Add authorized contract
     */
    function addAuthorizedContract(address contractAddr) external onlyOwner {
        authorizedContracts[contractAddr] = true;
    }

    /**
     * @dev Remove authorized contract
     */
    function removeAuthorizedContract(address contractAddr) external onlyOwner {
        authorizedContracts[contractAddr] = false;
    }

    /**
     * @dev Add authorized minter
     */
    function addAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
    }

    /**
     * @dev Remove authorized minter
     */
    function removeAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
    }

    /**
     * @dev Get total metadata size
     */
    function getTotalMetadataSize() external view returns (uint256) {
        return totalMetadataSize;
    }

    /**
     * @dev Get platform statistics
     */
    function getPlatformStats() external view returns (
        uint256 nftCount,
        uint256 collectionCount,
        uint256 userCount,
        uint256 metadataSize
    ) {
        return (totalNFTs, totalCollections, totalUsers, totalMetadataSize);
    }
}

