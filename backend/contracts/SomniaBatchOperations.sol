// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title SomniaBatchOperations
 * @dev Somnia-optimized batch operations for NFTFlow
 * Leverages Somnia's 1M+ TPS capability for high-throughput operations
 * Optimized for sub-cent gas fees and fast finality
 */
contract SomniaBatchOperations is Ownable, ReentrancyGuard, Pausable {
    using SafeMath for uint256;

    // ============ STRUCTS ============
    
    struct BatchRentalRequest {
        bytes32 listingId;
        uint256 duration;
        address recipient;
        uint256 price;
        uint256 collateral;
    }
    
    struct BatchPriceUpdate {
        bytes32 listingId;
        uint256 newPrice;
        uint256 newDuration;
    }
    
    struct BatchListing {
        address nftContract;
        uint256 tokenId;
        uint256 pricePerSecond;
        uint256 minDuration;
        uint256 maxDuration;
        uint256 collateralRequired;
        bool isActive;
    }
    
    struct BatchTransfer {
        address nftContract;
        uint256 tokenId;
        address from;
        address to;
    }

    // ============ STATE VARIABLES ============
    
    // Contract interfaces
    address public nftFlowContract;
    address public paymentStreamContract;
    address public reputationSystemContract;
    
    // Batch operation limits (Somnia can handle large batches)
    uint256 public maxBatchSize = 1000;
    uint256 public maxBatchValue = 1000 ether;
    
    // Batch operation tracking
    mapping(bytes32 => bool) public processedBatches;
    mapping(address => uint256) public userBatchCount;
    mapping(address => uint256) public userBatchVolume;
    
    // Gas optimization settings
    uint256 public gasPriceMultiplier = 100; // 1x for Somnia's low fees
    uint256 public maxGasPrice = 10 gwei; // Very low for Somnia
    
    // ============ EVENTS ============
    
    event BatchRentalsProcessed(
        address indexed user,
        bytes32 indexed batchId,
        uint256 rentalCount,
        uint256 totalValue,
        uint256 gasUsed,
        uint256 timestamp
    );
    
    event BatchPricesUpdated(
        address indexed user,
        bytes32 indexed batchId,
        uint256 updateCount,
        uint256 gasUsed,
        uint256 timestamp
    );
    
    event BatchListingsCreated(
        address indexed user,
        bytes32 indexed batchId,
        uint256 listingCount,
        uint256 gasUsed,
        uint256 timestamp
    );
    
    event BatchTransfersProcessed(
        address indexed user,
        bytes32 indexed batchId,
        uint256 transferCount,
        uint256 gasUsed,
        uint256 timestamp
    );
    
    event BatchSizeUpdated(uint256 newMaxBatchSize);
    event BatchValueUpdated(uint256 newMaxBatchValue);
    event GasSettingsUpdated(uint256 newMultiplier, uint256 newMaxPrice);

    // ============ MODIFIERS ============
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner() ||
            msg.sender == nftFlowContract,
            "Not authorized"
        );
        _;
    }
    
    modifier validBatchSize(uint256 size) {
        require(size > 0, "Batch size must be greater than 0");
        require(size <= maxBatchSize, "Batch size exceeds maximum");
        _;
    }
    
    modifier validBatchValue(uint256 value) {
        require(value <= maxBatchValue, "Batch value exceeds maximum");
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor(
        address _nftFlowContract,
        address _paymentStreamContract,
        address _reputationSystemContract
    ) {
        nftFlowContract = _nftFlowContract;
        paymentStreamContract = _paymentStreamContract;
        reputationSystemContract = _reputationSystemContract;
    }

    // ============ BATCH RENTAL OPERATIONS ============

    /**
     * @dev Batch rent multiple NFTs in a single transaction
     * Leverages Somnia's high TPS for efficient batch processing
     */
    function batchRentNFTs(
        BatchRentalRequest[] calldata requests
    ) external payable nonReentrant whenNotPaused validBatchSize(requests.length) {
        require(requests.length > 0, "No requests provided");
        
        bytes32 batchId = keccak256(abi.encodePacked(msg.sender, block.timestamp, requests.length));
        require(!processedBatches[batchId], "Batch already processed");
        
        uint256 totalCost = 0;
        uint256 successfulRentals = 0;
        uint256 gasStart = gasleft();
        
        // Calculate total cost upfront
        for (uint256 i = 0; i < requests.length; i++) {
            totalCost = totalCost.add(requests[i].price);
        }
        
        require(msg.value >= totalCost, "Insufficient payment");
        
        // Process all rentals
        for (uint256 i = 0; i < requests.length; i++) {
            try this._processRental(requests[i]) {
                successfulRentals = successfulRentals.add(1);
            } catch {
                // Continue with other rentals if one fails
                continue;
            }
        }
        
        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value.sub(totalCost));
        }
        
        // Update user statistics
        userBatchCount[msg.sender] = userBatchCount[msg.sender].add(1);
        userBatchVolume[msg.sender] = userBatchVolume[msg.sender].add(totalCost);
        
        processedBatches[batchId] = true;
        
        uint256 gasUsed = gasStart.sub(gasleft());
        
        emit BatchRentalsProcessed(
            msg.sender,
            batchId,
            successfulRentals,
            totalCost,
            gasUsed,
            block.timestamp
        );
    }

    /**
     * @dev Batch update listing prices
     */
    function batchUpdatePrices(
        BatchPriceUpdate[] calldata updates
    ) external nonReentrant whenNotPaused validBatchSize(updates.length) {
        require(updates.length > 0, "No updates provided");
        
        bytes32 batchId = keccak256(abi.encodePacked(msg.sender, block.timestamp, updates.length));
        require(!processedBatches[batchId], "Batch already processed");
        
        uint256 gasStart = gasleft();
        uint256 successfulUpdates = 0;
        
        for (uint256 i = 0; i < updates.length; i++) {
            try this._updateListingPrice(updates[i]) {
                successfulUpdates = successfulUpdates.add(1);
            } catch {
                // Continue with other updates if one fails
                continue;
            }
        }
        
        processedBatches[batchId] = true;
        
        uint256 gasUsed = gasStart.sub(gasleft());
        
        emit BatchPricesUpdated(
            msg.sender,
            batchId,
            successfulUpdates,
            gasUsed,
            block.timestamp
        );
    }

    /**
     * @dev Batch create listings
     */
    function batchCreateListings(
        BatchListing[] calldata listings
    ) external nonReentrant whenNotPaused validBatchSize(listings.length) {
        require(listings.length > 0, "No listings provided");
        
        bytes32 batchId = keccak256(abi.encodePacked(msg.sender, block.timestamp, listings.length));
        require(!processedBatches[batchId], "Batch already processed");
        
        uint256 gasStart = gasleft();
        uint256 successfulListings = 0;
        
        for (uint256 i = 0; i < listings.length; i++) {
            try this._createListing(listings[i]) {
                successfulListings = successfulListings.add(1);
            } catch {
                // Continue with other listings if one fails
                continue;
            }
        }
        
        processedBatches[batchId] = true;
        
        uint256 gasUsed = gasStart.sub(gasleft());
        
        emit BatchListingsCreated(
            msg.sender,
            batchId,
            successfulListings,
            gasUsed,
            block.timestamp
        );
    }

    /**
     * @dev Batch process transfers
     */
    function batchProcessTransfers(
        BatchTransfer[] calldata transfers
    ) external nonReentrant whenNotPaused validBatchSize(transfers.length) {
        require(transfers.length > 0, "No transfers provided");
        
        bytes32 batchId = keccak256(abi.encodePacked(msg.sender, block.timestamp, transfers.length));
        require(!processedBatches[batchId], "Batch already processed");
        
        uint256 gasStart = gasleft();
        uint256 successfulTransfers = 0;
        
        for (uint256 i = 0; i < transfers.length; i++) {
            try this._processTransfer(transfers[i]) {
                successfulTransfers = successfulTransfers.add(1);
            } catch {
                // Continue with other transfers if one fails
                continue;
            }
        }
        
        processedBatches[batchId] = true;
        
        uint256 gasUsed = gasStart.sub(gasleft());
        
        emit BatchTransfersProcessed(
            msg.sender,
            batchId,
            successfulTransfers,
            gasUsed,
            block.timestamp
        );
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Process individual rental
     */
    function _processRental(BatchRentalRequest memory request) external {
        require(msg.sender == address(this), "Internal function only");
        
        // This would call the actual NFTFlow contract
        // For now, we'll simulate the rental process
        require(request.duration > 0, "Invalid duration");
        require(request.price > 0, "Invalid price");
        require(request.recipient != address(0), "Invalid recipient");
        
        // Simulate rental processing
        // In real implementation, this would call NFTFlow.rentNFT()
    }

    /**
     * @dev Update listing price
     */
    function _updateListingPrice(BatchPriceUpdate memory update) external {
        require(msg.sender == address(this), "Internal function only");
        
        // This would call the actual NFTFlow contract
        // For now, we'll simulate the price update
        require(update.newPrice > 0, "Invalid price");
        require(update.newDuration > 0, "Invalid duration");
        
        // Simulate price update
        // In real implementation, this would call NFTFlow.updateListingPrice()
    }

    /**
     * @dev Create listing
     */
    function _createListing(BatchListing memory listing) external {
        require(msg.sender == address(this), "Internal function only");
        
        // This would call the actual NFTFlow contract
        // For now, we'll simulate the listing creation
        require(listing.nftContract != address(0), "Invalid NFT contract");
        require(listing.tokenId > 0, "Invalid token ID");
        require(listing.pricePerSecond > 0, "Invalid price");
        require(listing.minDuration > 0, "Invalid min duration");
        require(listing.maxDuration >= listing.minDuration, "Invalid duration range");
        
        // Simulate listing creation
        // In real implementation, this would call NFTFlow.createListing()
    }

    /**
     * @dev Process transfer
     */
    function _processTransfer(BatchTransfer memory transfer) external {
        require(msg.sender == address(this), "Internal function only");
        
        // This would call the actual NFT contract
        // For now, we'll simulate the transfer
        require(transfer.nftContract != address(0), "Invalid NFT contract");
        require(transfer.tokenId > 0, "Invalid token ID");
        require(transfer.from != address(0), "Invalid from address");
        require(transfer.to != address(0), "Invalid to address");
        
        // Simulate transfer
        // In real implementation, this would call IERC721.safeTransferFrom()
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get user batch statistics
     */
    function getUserBatchStats(address user) external view returns (
        uint256 batchCount,
        uint256 batchVolume,
        uint256 averageBatchSize
    ) {
        return (
            userBatchCount[user],
            userBatchVolume[user],
            userBatchCount[user] > 0 ? userBatchVolume[user].div(userBatchCount[user]) : 0
        );
    }

    /**
     * @dev Get batch operation limits
     */
    function getBatchLimits() external view returns (
        uint256 maxSize,
        uint256 maxValue,
        uint256 gasMultiplier,
        uint256 maxGasPrice
    ) {
        return (maxBatchSize, maxBatchValue, gasPriceMultiplier, maxGasPrice);
    }

    /**
     * @dev Check if batch was processed
     */
    function isBatchProcessed(bytes32 batchId) external view returns (bool) {
        return processedBatches[batchId];
    }

    /**
     * @dev Calculate batch gas cost estimate
     */
    function estimateBatchGasCost(uint256 batchSize, uint256 operationType) external view returns (uint256) {
        // Base gas cost for batch operation
        uint256 baseGas = 21000;
        
        // Gas cost per item based on operation type
        uint256 gasPerItem;
        if (operationType == 0) { // Rental
            gasPerItem = 100000;
        } else if (operationType == 1) { // Price update
            gasPerItem = 50000;
        } else if (operationType == 2) { // Listing creation
            gasPerItem = 150000;
        } else if (operationType == 3) { // Transfer
            gasPerItem = 75000;
        } else {
            gasPerItem = 100000; // Default
        }
        
        uint256 totalGas = baseGas.add(batchSize.mul(gasPerItem));
        uint256 gasPrice = tx.gasprice.mul(gasPriceMultiplier).div(100);
        
        if (gasPrice > maxGasPrice) {
            gasPrice = maxGasPrice;
        }
        
        return totalGas.mul(gasPrice);
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Update batch size limit
     */
    function updateMaxBatchSize(uint256 newSize) external onlyOwner {
        require(newSize > 0, "Size must be greater than 0");
        require(newSize <= 10000, "Size too large"); // Reasonable upper limit
        maxBatchSize = newSize;
        emit BatchSizeUpdated(newSize);
    }

    /**
     * @dev Update batch value limit
     */
    function updateMaxBatchValue(uint256 newValue) external onlyOwner {
        require(newValue > 0, "Value must be greater than 0");
        maxBatchValue = newValue;
        emit BatchValueUpdated(newValue);
    }

    /**
     * @dev Update gas settings
     */
    function updateGasSettings(uint256 newMultiplier, uint256 newMaxPrice) external onlyOwner {
        require(newMultiplier > 0, "Multiplier must be greater than 0");
        require(newMaxPrice > 0, "Max price must be greater than 0");
        gasPriceMultiplier = newMultiplier;
        maxGasPrice = newMaxPrice;
        emit GasSettingsUpdated(newMultiplier, newMaxPrice);
    }

    /**
     * @dev Update contract addresses
     */
    function updateContractAddresses(
        address _nftFlowContract,
        address _paymentStreamContract,
        address _reputationSystemContract
    ) external onlyOwner {
        require(_nftFlowContract != address(0), "Invalid NFTFlow contract");
        require(_paymentStreamContract != address(0), "Invalid PaymentStream contract");
        require(_reputationSystemContract != address(0), "Invalid ReputationSystem contract");
        
        nftFlowContract = _nftFlowContract;
        paymentStreamContract = _paymentStreamContract;
        reputationSystemContract = _reputationSystemContract;
    }

    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdraw
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
