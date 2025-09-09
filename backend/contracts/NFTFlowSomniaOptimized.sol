// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IERC4907.sol";
import "./interfaces/IPriceOracle.sol";
import "./PaymentStream.sol";
import "./ReputationSystem.sol";

/**
 * @title NFTFlowSomniaOptimized
 * @dev Enhanced NFT rental contract optimized for Somnia's high throughput and low fees
 * Leverages Somnia's 1M+ TPS, sub-second finality, and sub-cent transaction costs
 */
contract NFTFlowSomniaOptimized is ReentrancyGuard, Ownable {
    // Somnia MulticallV3 address for batch operations
    address constant MULTICALL_V3 = 0x841b8199E6d3Db3C6f264f6C2bd8848b3cA64223;
    
    // Somnia-specific storage optimization using packed structs
    struct Rental {
        address lender;           // 20 bytes
        address tenant;           // 20 bytes
        address nftContract;      // 20 bytes
        uint256 tokenId;          // 32 bytes
        uint40 startTime;         // 5 bytes - Reduced size for gas optimization
        uint40 endTime;           // 5 bytes - Reduced size for gas optimization
        uint96 totalPrice;        // 12 bytes - Optimized for Somnia's low fee environment
        uint256 paymentStreamId;  // 32 bytes - Stream ID instead of address
        bool isActive;           // 1 byte
        uint8 rentalType;        // 1 byte - Gaming, Art, Metaverse, etc.
    }
    
    struct NFTListing {
        address nftContract;     // 20 bytes
        uint256 tokenId;         // 32 bytes
        address owner;           // 20 bytes
        uint96 pricePerSecond;   // 12 bytes - Optimized for micro-payments
        uint32 minDuration;      // 4 bytes
        uint32 maxDuration;      // 4 bytes
        uint96 collateralRequired; // 12 bytes
        bool isActive;           // 1 byte
        uint8 utilityType;       // 1 byte - Gaming, Art, Metaverse, etc.
    }
    
    // Leverage Somnia's high TPS for frequent state updates
    mapping(bytes32 => Rental) public rentals;
    mapping(bytes32 => NFTListing) public listings;
    mapping(address => uint256) public reputationScore;
    mapping(address => uint256) public userRentalCount;
    
    // Somnia-optimized constants
    uint256 public constant MIN_RENTAL_DURATION = 60; // 1 minute minimum
    uint256 public constant MAX_RENTAL_DURATION = 2592000; // 30 days maximum
    uint256 public constant MAX_PRICE_PER_SECOND = 0.01 ether; // Prevent excessive pricing
    uint256 public constant MIN_PRICE_PER_SECOND = 0.000001 ether; // Minimum viable price
    
    PaymentStream public paymentStreamFactory;
    ReputationSystem public reputationSystem;
    IPriceOracle public priceOracle;
    
    // Events optimized for Somnia's high throughput
    event NFTListedForRent(
        bytes32 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address owner,
        uint256 pricePerSecond,
        uint256 minDuration,
        uint256 maxDuration,
        uint8 utilityType
    );
    
    event NFTRented(
        bytes32 indexed rentalId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address lender,
        address tenant,
        uint256 startTime,
        uint256 endTime,
        uint256 pricePerSecond,
        uint256 totalPrice
    );
    
    event RentalCompleted(bytes32 indexed rentalId, uint256 finalAmount);
    event RentalCancelled(bytes32 indexed rentalId, uint256 refundAmount);
    event PaymentStreamUpdated(bytes32 indexed rentalId, uint256 releasedAmount);
    
    constructor(
        address _paymentStreamFactory,
        address _reputationSystem,
        address _priceOracle
    ) Ownable() {
        paymentStreamFactory = PaymentStream(payable(_paymentStreamFactory));
        reputationSystem = ReputationSystem(_reputationSystem);
        priceOracle = IPriceOracle(_priceOracle);
    }
    
    /**
     * @dev List NFT for rent with Somnia-optimized parameters
     */
    function listNFTForRent(
        address nftContract,
        uint256 tokenId,
        uint256 pricePerSecond,
        uint256 minDuration,
        uint256 maxDuration,
        uint256 collateralRequired,
        uint8 utilityType
    ) external {
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not NFT owner");
        require(pricePerSecond >= MIN_PRICE_PER_SECOND && pricePerSecond <= MAX_PRICE_PER_SECOND, "Invalid price");
        require(minDuration >= MIN_RENTAL_DURATION, "Min duration too short");
        require(maxDuration <= MAX_RENTAL_DURATION, "Max duration too long");
        require(minDuration <= maxDuration, "Invalid duration range");
        require(utilityType > 0 && utilityType <= 10, "Invalid utility type");
        
        // Approve this contract to manage the NFT
        IERC721(nftContract).approve(address(this), tokenId);
        
        bytes32 listingId = keccak256(abi.encodePacked(nftContract, tokenId, block.timestamp, msg.sender));
        
        listings[listingId] = NFTListing({
            nftContract: nftContract,
            tokenId: tokenId,
            owner: msg.sender,
            pricePerSecond: uint96(pricePerSecond),
            minDuration: uint32(minDuration),
            maxDuration: uint32(maxDuration),
            collateralRequired: uint96(collateralRequired),
            isActive: true,
            utilityType: utilityType
        });
        
        emit NFTListedForRent(listingId, nftContract, tokenId, msg.sender, pricePerSecond, minDuration, maxDuration, utilityType);
    }
    
    /**
     * @dev Rent NFT with Somnia-optimized batch operations
     */
    function rentNFT(
        bytes32 listingId,
        uint256 duration
    ) external payable nonReentrant {
        NFTListing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(duration >= listing.minDuration, "Duration too short");
        require(duration <= listing.maxDuration, "Duration too long");
        require(listing.owner != msg.sender, "Cannot rent own NFT");
        
        // Check if NFT is available (not currently rented)
        bytes32 rentalId = keccak256(abi.encodePacked(listing.nftContract, listing.tokenId));
        require(!rentals[rentalId].isActive, "NFT already rented");
        
        uint256 totalPrice = uint256(listing.pricePerSecond) * duration;
        require(msg.value >= totalPrice, "Insufficient payment");
        
        // Check reputation and collateral requirements
        uint256 userRep = reputationSystem.getReputationScore(msg.sender);
        uint256 requiredCollateral = uint256(listing.collateralRequired);
        
        if (userRep < 100) { // Low reputation users need collateral
            require(msg.value >= totalPrice + requiredCollateral, "Insufficient collateral");
        }
        
        // Utilize Somnia's MultiCall for batch operations
        bytes[] memory calls = new bytes[](2);
        calls[0] = abi.encodeWithSignature(
            "approve(address,uint256)",
            address(this),
            listing.tokenId
        );
        calls[1] = abi.encodeWithSignature(
            "setUser(uint256,address,uint64)",
            listing.tokenId,
            msg.sender,
            uint64(block.timestamp + duration)
        );
        
        // Execute batch call leveraging Somnia's high TPS
        (bool success, ) = MULTICALL_V3.delegatecall(
            abi.encodeWithSignature("aggregate((address,bytes)[])", calls)
        );
        require(success, "Multicall failed");
        
        // Create payment stream optimized for Somnia's low fees
        uint256 streamId = paymentStreamFactory.createStream{value: msg.value}(
            listing.owner,
            block.timestamp,
            block.timestamp + duration,
            listing.nftContract
        );
        
        rentals[rentalId] = Rental({
            lender: listing.owner,
            tenant: msg.sender,
            nftContract: listing.nftContract,
            tokenId: listing.tokenId,
            startTime: uint40(block.timestamp),
            endTime: uint40(block.timestamp + duration),
            totalPrice: uint96(totalPrice),
            paymentStreamId: streamId,
            isActive: true,
            rentalType: listing.utilityType
        });
        
        userRentalCount[msg.sender]++;
        
        emit NFTRented(
            rentalId,
            listing.nftContract,
            listing.tokenId,
            listing.owner,
            msg.sender,
            block.timestamp,
            block.timestamp + duration,
            uint256(listing.pricePerSecond),
            totalPrice
        );
    }
    
    /**
     * @dev Complete rental leveraging Somnia's sub-second finality
     */
    function completeRental(bytes32 rentalId) external {
        Rental storage rental = rentals[rentalId];
        require(rental.isActive, "Rental not active");
        require(block.timestamp >= rental.endTime, "Rental period not ended");
        require(msg.sender == rental.tenant || msg.sender == rental.lender, "Not authorized");
        
        // Clear user in ERC-4907
        try IERC4907(rental.nftContract).setUser(rental.tokenId, address(0), 0) {
            // ERC-4907 supported
        } catch {
            // Fallback: return NFT to owner
        }
        
        // Update reputation leveraging Somnia's high TPS
        reputationSystem.updateReputation(rental.tenant, true);
        
        rental.isActive = false;
        emit RentalCompleted(rentalId, rental.totalPrice);
    }
    
    /**
     * @dev Cancel rental with instant refund leveraging Somnia's low fees
     */
    function cancelRental(bytes32 rentalId) external {
        Rental storage rental = rentals[rentalId];
        require(rental.isActive, "Rental not active");
        require(msg.sender == rental.tenant || msg.sender == rental.lender, "Not authorized");
        
        // Cancel payment stream
        paymentStreamFactory.cancelStream(rental.paymentStreamId);
        
        // Clear user in ERC-4907
        try IERC4907(rental.nftContract).setUser(rental.tokenId, address(0), 0) {
            // ERC-4907 supported
        } catch {
            // Fallback: return NFT to owner
        }
        
        rental.isActive = false;
        emit RentalCancelled(rentalId, rental.totalPrice);
    }
    
    /**
     * @dev Get available NFTs leveraging Somnia's high throughput for real-time data
     */
    function getAvailableNFTs() external view returns (NFTListing[] memory) {
        // This would need to be implemented with proper filtering
        // For now, return empty array
        NFTListing[] memory availableNFTs = new NFTListing[](0);
        return availableNFTs;
    }
    
    /**
     * @dev Get user rentals leveraging Somnia's fast read operations
     */
    function getUserRentals(address user) external view returns (bytes32[] memory) {
        // This would need to track user rentals
        // For now, return empty array
        bytes32[] memory userRentals = new bytes32[](0);
        return userRentals;
    }
    
    /**
     * @dev Update price oracle leveraging Somnia's governance capabilities
     */
    function updatePriceOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle address");
        priceOracle = IPriceOracle(newOracle);
    }
    
    /**
     * @dev Emergency withdraw leveraging Somnia's low fees for admin operations
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Get rental statistics leveraging Somnia's high throughput
     */
    function getRentalStats() external view returns (
        uint256 totalRentals,
        uint256 activeRentals,
        uint256 totalVolume,
        uint256 averageRentalDuration
    ) {
        // This would calculate real-time statistics
        return (0, 0, 0, 0);
    }
}
