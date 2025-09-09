// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./utils/MultiCaller.sol";
import "./interfaces/IERC4907.sol";
import "./interfaces/IReputationSystem.sol";

/**
 * @title NFTFlowGasOptimized
 * @dev Main rental contract with gas optimizations using MultiCall
 */
contract NFTFlowGasOptimized is MultiCaller, ReentrancyGuard, Ownable {
    // Event emitted when a rental is created
    event RentalCreated(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed lender,
        address tenant,
        uint64 expires,
        uint256 price
    );
    
    event RentalCompleted(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed lender,
        address tenant
    );
    
    // Rental information structure
    struct Rental {
        address lender;
        address tenant;
        uint64 expires;
        uint256 price;
        bool active;
    }
    
    // Mapping of NFT contract => token ID => rental info
    mapping(address => mapping(uint256 => Rental)) public rentals;
    
    // Reputation system contract
    IReputationSystem public reputationSystem;
    
    // Protocol fee percentage (in basis points, 250 = 2.5%)
    uint256 public protocolFeePercentage = 250;
    
    // Maximum rental duration (30 days)
    uint256 public constant MAX_RENTAL_DURATION = 30 days;
    
    constructor(address _reputationSystem) {
        reputationSystem = IReputationSystem(_reputationSystem);
    }
    
    /**
     * @dev Rent an NFT using batched calls for gas efficiency
     * @param nftContract Address of the NFT contract
     * @param tokenId ID of the NFT to rent
     * @param expires Unix timestamp when rental expires
     * @param price Rental price (for event logging)
     */
    function rentNFT(
        address nftContract,
        uint256 tokenId,
        uint64 expires,
        uint256 price
    ) external payable nonReentrant {
        require(expires > block.timestamp, "Rental expiration must be in the future");
        require(expires <= block.timestamp + MAX_RENTAL_DURATION, "Rental duration too long");
        require(msg.value >= price, "Insufficient payment");
        
        // Check if NFT is available for rent
        Rental storage rental = rentals[nftContract][tokenId];
        require(!rental.active || rental.expires < block.timestamp, "NFT already rented");
        
        // Get the current owner of the NFT
        address lender = IERC721(nftContract).ownerOf(tokenId);
        require(lender != address(0), "Invalid NFT");
        
        // Create batched calls for efficient execution
        IMultiCall.Call[] memory calls = createRentalCalls(
            nftContract,
            tokenId,
            msg.sender,
            expires
        );
        
        // Execute all calls in a single transaction
        multiCall(calls);
        
        // Store rental information
        rentals[nftContract][tokenId] = Rental({
            lender: lender,
            tenant: msg.sender,
            expires: expires,
            price: price,
            active: true
        });
        
        // Transfer payment to lender (minus protocol fee)
        uint256 protocolFee = (price * protocolFeePercentage) / 10000;
        uint256 lenderPayment = price - protocolFee;
        
        payable(lender).transfer(lenderPayment);
        
        // Emit event
        emit RentalCreated(nftContract, tokenId, lender, msg.sender, expires, price);
    }
    
    /**
     * @dev Complete a rental and free up the NFT
     * @param nftContract Address of the NFT contract
     * @param tokenId ID of the rented NFT
     */
    function completeRental(address nftContract, uint256 tokenId) external {
        Rental storage rental = rentals[nftContract][tokenId];
        require(rental.active, "Rental not active");
        require(block.timestamp >= rental.expires, "Rental period not ended");
        
        address lender = rental.lender;
        address tenant = rental.tenant;
        
        // Clear the rental information
        rental.active = false;
        
        // Clear the user from the NFT (ERC-4907)
        IERC4907(nftContract).setUser(tokenId, address(0), 0);
        
        // Update reputation (successful rental completion)
        reputationSystem.updateReputation(tenant, true);
        
        emit RentalCompleted(nftContract, tokenId, lender, tenant);
    }
    
    /**
     * @dev Check if collateral is required for a user
     * @param user Address of the user
     * @return true if collateral is required
     */
    function requiresCollateral(address user) external view returns (bool) {
        return reputationSystem.requiresCollateral(user);
    }
    
    /**
     * @dev Set the protocol fee percentage
     * @param _feePercentage New fee percentage in basis points
     */
    function setProtocolFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "Fee cannot exceed 10%");
        protocolFeePercentage = _feePercentage;
    }
    
    /**
     * @dev Withdraw accumulated protocol fees
     */
    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Emergency function to recover stuck NFTs
     * @param nftContract Address of the NFT contract
     * @param tokenId ID of the NFT
     */
    function emergencyRecoverNFT(address nftContract, uint256 tokenId) external onlyOwner {
        Rental storage rental = rentals[nftContract][tokenId];
        require(rental.active, "No active rental");
        require(block.timestamp > rental.expires + 7 days, "Recovery period not reached");
        
        // Clear rental and reset NFT user
        rental.active = false;
        IERC4907(nftContract).setUser(tokenId, address(0), 0);
    }
}
