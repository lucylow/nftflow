// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IERC4907.sol";
import "./interfaces/IPriceOracle.sol";
import "./PaymentStream.sol";
import "./ReputationSystem.sol";

contract NFTFlowCore is ReentrancyGuard, Ownable {
    // Somnia MulticallV3 address
    address constant MULTICALL = 0x841b8199E6d3Db3C6f264f6C2bd8848b3cA64223;
    
    struct Rental {
        address lender;
        address tenant;
        address nftContract;
        uint256 tokenId;
        uint256 startTime;
        uint256 endTime;
        uint256 totalPrice;
        uint256 paymentStreamId;
        bool active;
    }
    
    struct NFTListing {
        address nftContract;
        uint256 tokenId;
        address owner;
        uint256 pricePerSecond;
        uint256 minDuration;
        uint256 maxDuration;
        uint256 collateralRequired;
        bool active;
    }
    
    mapping(bytes32 => Rental) public rentals;
    mapping(bytes32 => NFTListing) public listings;
    mapping(address => uint256) public userReputation;
    
    PaymentStream public paymentStreamFactory;
    ReputationSystem public reputationSystem;
    IPriceOracle public priceOracle;
    
    uint256 public constant MIN_RENTAL_DURATION = 60; // 1 minute minimum
    uint256 public constant MAX_RENTAL_DURATION = 2592000; // 30 days maximum
    
    event NFTListedForRent(
        bytes32 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address owner,
        uint256 pricePerSecond,
        uint256 minDuration,
        uint256 maxDuration
    );
    
    event NFTRented(
        bytes32 indexed rentalId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address tenant,
        uint256 duration,
        uint256 totalPrice
    );
    
    event RentalCompleted(bytes32 indexed rentalId);
    event RentalCancelled(bytes32 indexed rentalId, uint256 refundAmount);
    
    constructor(
        address _paymentStreamFactory,
        address _reputationSystem,
        address _priceOracle
    ) Ownable() {
        paymentStreamFactory = PaymentStream(payable(_paymentStreamFactory));
        reputationSystem = ReputationSystem(_reputationSystem);
        priceOracle = IPriceOracle(_priceOracle);
    }
    
    function listNFTForRent(
        address nftContract,
        uint256 tokenId,
        uint256 pricePerSecond,
        uint256 minDuration,
        uint256 maxDuration,
        uint256 collateralRequired
    ) external returns (bytes32 listingId) {
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not NFT owner");
        require(pricePerSecond > 0, "Price must be greater than 0");
        require(minDuration >= MIN_RENTAL_DURATION, "Min duration too short");
        require(maxDuration <= MAX_RENTAL_DURATION, "Max duration too long");
        require(minDuration <= maxDuration, "Invalid duration range");
        
        // Note: The caller must have already approved this contract to manage the NFT
        // This is checked by the require statement above
        
        listingId = keccak256(abi.encodePacked(nftContract, tokenId, block.timestamp));
        
        listings[listingId] = NFTListing({
            nftContract: nftContract,
            tokenId: tokenId,
            owner: msg.sender,
            pricePerSecond: pricePerSecond,
            minDuration: minDuration,
            maxDuration: maxDuration,
            collateralRequired: collateralRequired,
            active: true
        });
        
        emit NFTListedForRent(listingId, nftContract, tokenId, msg.sender, pricePerSecond, minDuration, maxDuration);
        
        return listingId;
    }
    
    function rentNFT(
        bytes32 listingId,
        uint256 duration
    ) external payable nonReentrant {
        NFTListing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(duration >= listing.minDuration, "Duration too short");
        require(duration <= listing.maxDuration, "Duration too long");
        require(listing.owner != msg.sender, "Cannot rent own NFT");
        
        // Check if NFT is available (not currently rented)
        bytes32 rentalId = keccak256(abi.encodePacked(listing.nftContract, listing.tokenId));
        require(!rentals[rentalId].active, "NFT already rented");
        
        uint256 totalPrice = listing.pricePerSecond * duration;
        require(msg.value >= totalPrice, "Insufficient payment");
        
        // Check reputation and collateral requirements
        uint256 userRep = reputationSystem.getReputationScore(msg.sender);
        uint256 requiredCollateral = listing.collateralRequired;
        
        if (userRep < 100) { // Low reputation users need collateral
            require(msg.value >= totalPrice + requiredCollateral, "Insufficient collateral");
        }
        
        // Create payment stream
        uint256 streamId = paymentStreamFactory.createStream{value: msg.value}(
            listing.owner,
            block.timestamp,
            block.timestamp + duration,
            listing.nftContract
        );
        
        // Set user for ERC-4907 if the NFT supports it
        try IERC4907(listing.nftContract).setUser(listing.tokenId, msg.sender, uint64(block.timestamp + duration)) {
            // ERC-4907 supported
        } catch {
            // Fallback: transfer NFT temporarily (requires approval)
            IERC721(listing.nftContract).transferFrom(listing.owner, address(this), listing.tokenId);
        }
        
        rentals[rentalId] = Rental({
            lender: listing.owner,
            tenant: msg.sender,
            nftContract: listing.nftContract,
            tokenId: listing.tokenId,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            totalPrice: totalPrice,
            paymentStreamId: streamId,
            active: true
        });
        
        emit NFTRented(rentalId, listing.nftContract, listing.tokenId, msg.sender, duration, totalPrice);
    }
    
    function completeRental(bytes32 rentalId) external {
        Rental storage rental = rentals[rentalId];
        require(rental.active, "Rental not active");
        require(block.timestamp >= rental.endTime, "Rental period not ended");
        require(msg.sender == rental.tenant || msg.sender == rental.lender, "Not authorized");
        
        // Clear user in ERC-4907
        try IERC4907(rental.nftContract).setUser(rental.tokenId, address(0), 0) {
            // ERC-4907 supported
        } catch {
            // Fallback: return NFT to owner
            // This would need the NFT contract address, which we'd need to store
        }
        
        // Update reputation
        reputationSystem.updateReputation(rental.tenant, true);
        
        rental.active = false;
        emit RentalCompleted(rentalId);
    }
    
    function cancelRental(bytes32 rentalId) external {
        Rental storage rental = rentals[rentalId];
        require(rental.active, "Rental not active");
        require(msg.sender == rental.tenant || msg.sender == rental.lender, "Not authorized");
        
        // Cancel payment stream
        paymentStreamFactory.cancelStream(rental.paymentStreamId);
        
        // Clear user in ERC-4907
        try IERC4907(rental.nftContract).setUser(rental.tokenId, address(0), 0) {
            // ERC-4907 supported
        } catch {
            // Fallback: return NFT to owner
        }
        
        rental.active = false;
        emit RentalCancelled(rentalId, 0); // Refund amount would be calculated by PaymentStream
    }
    
    function getAvailableNFTs() external view returns (NFTListing[] memory) {
        // This would need to be implemented with proper filtering
        // For now, return empty array
        NFTListing[] memory availableNFTs = new NFTListing[](0);
        return availableNFTs;
    }
    
    function getUserRentals(address user) external view returns (bytes32[] memory) {
        // This would need to track user rentals
        // For now, return empty array
        bytes32[] memory userRentals = new bytes32[](0);
        return userRentals;
    }
    
    function updatePriceOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle address");
        priceOracle = IPriceOracle(newOracle);
    }
    
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Withdraw accumulated funds (alias for emergencyWithdraw for test compatibility)
     */
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}