// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title PaymentStream
 * @dev Enhanced contract for real-time payment streaming for NFT rentals
 * Implements continuous payment flow with platform fees and creator royalties
 * Designed for formal verification and security
 */
contract PaymentStream is ReentrancyGuard, Ownable, Pausable {

    struct Stream {
        address sender;
        address recipient;
        uint256 deposit;
        uint256 ratePerSecond;
        uint256 startTime;
        uint256 stopTime;
        uint256 remainingBalance;
        uint256 totalWithdrawn;
        bool active;
        bool finalized;
        uint256 platformFeeAmount;
        uint256 creatorRoyaltyAmount;
        address creatorAddress;
    }

    // State variables
    mapping(uint256 => Stream) public streams;
    mapping(address => uint256[]) public senderStreams;
    mapping(address => uint256[]) public recipientStreams;
    
    uint256 public nextStreamId;
    uint256 public constant MINIMUM_STREAM_DURATION = 1; // 1 second
    uint256 public constant BASIS_POINTS = 10000;
    
    // Fee structure
    uint256 public platformFeePercentage = 250; // 2.5%
    uint256 public creatorRoyaltyPercentage = 50; // 0.5% of total rental
    address public treasury;
    mapping(address => address) public collectionCreators; // NFT contract => creator address
    
    // Security features
    mapping(address => bool) public authorizedContracts;
    uint256 public maxStreamDuration = 30 days;
    
    // Events
    event StreamCreated(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        uint256 deposit,
        uint256 ratePerSecond,
        uint256 startTime,
        uint256 stopTime,
        uint256 platformFeeAmount,
        uint256 creatorRoyaltyAmount
    );
    
    event StreamWithdrawn(
        uint256 indexed streamId,
        address indexed recipient,
        uint256 amount,
        uint256 totalWithdrawn
    );
    
    event StreamCancelled(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        uint256 senderBalance,
        uint256 recipientBalance
    );
    
    event StreamFinalized(
        uint256 indexed streamId,
        uint256 totalPaid,
        uint256 platformFeeCollected,
        uint256 creatorRoyaltyCollected
    );
    
    event PlatformFeeWithdrawn(
        address indexed treasury,
        uint256 amount
    );
    
    event CreatorRoyaltyPaid(
        address indexed creator,
        uint256 amount
    );

    // Modifiers
    modifier onlyAuthorized() {
        require(
            authorizedContracts[msg.sender] || 
            msg.sender == owner(),
            "Not authorized"
        );
        _;
    }

    constructor(address _treasury) {
        treasury = _treasury;
    }

    /**
     * @dev Create a new payment stream with fee calculation
     * @param recipient Address to receive the stream
     * @param startTime When the stream starts (unix timestamp)
     * @param stopTime When the stream stops (unix timestamp)
     * @param nftContract NFT contract address for creator royalty calculation
     */
    function createStream(
        address recipient,
        uint256 startTime,
        uint256 stopTime,
        address nftContract
    ) external payable nonReentrant whenNotPaused returns (uint256 streamId) {
        require(recipient != address(0), "Invalid recipient");
        require(recipient != msg.sender, "Cannot stream to self");
        require(msg.value > 0, "Deposit must be greater than 0");
        require(startTime >= block.timestamp, "Start time in the past");
        require(stopTime > startTime, "Stop time before start time");
        
        uint256 duration = stopTime - startTime;
        require(duration >= MINIMUM_STREAM_DURATION, "Duration too short");
        require(duration <= maxStreamDuration, "Duration too long");
        
        // Calculate fees
        uint256 platformFeeAmount = msg.value * platformFeePercentage / BASIS_POINTS;
        uint256 creatorRoyaltyAmount = msg.value * creatorRoyaltyPercentage / BASIS_POINTS;
        uint256 netAmount = msg.value - platformFeeAmount - creatorRoyaltyAmount;
        
        uint256 ratePerSecond = netAmount / duration;
        require(ratePerSecond > 0, "Rate per second must be greater than 0");

        streamId = nextStreamId++;
        
        streams[streamId] = Stream({
            sender: msg.sender,
            recipient: recipient,
            deposit: netAmount,
            ratePerSecond: ratePerSecond,
            startTime: startTime,
            stopTime: stopTime,
            remainingBalance: netAmount,
            totalWithdrawn: 0,
            active: true,
            finalized: false,
            platformFeeAmount: platformFeeAmount,
            creatorRoyaltyAmount: creatorRoyaltyAmount,
            creatorAddress: collectionCreators[nftContract]
        });

        senderStreams[msg.sender].push(streamId);
        recipientStreams[recipient].push(streamId);

        emit StreamCreated(
            streamId,
            msg.sender,
            recipient,
            netAmount,
            ratePerSecond,
            startTime,
            stopTime,
            platformFeeAmount,
            creatorRoyaltyAmount
        );
    }

    /**
     * @dev Calculate the available balance for withdrawal
     * @param streamId The stream ID
     * @return The available balance
     */
    function balanceOf(uint256 streamId) external view returns (uint256) {
        Stream memory stream = streams[streamId];
        require(stream.sender != address(0), "Stream does not exist");
        
        if (block.timestamp <= stream.startTime) {
            return 0;
        }
        
        if (block.timestamp >= stream.stopTime) {
            return stream.remainingBalance;
        }
        
        uint256 elapsedTime = block.timestamp - stream.startTime;
        uint256 availableAmount = elapsedTime * stream.ratePerSecond;
        uint256 totalWithdrawn = stream.deposit - stream.remainingBalance;
        
        return availableAmount - totalWithdrawn;
    }

    /**
     * @dev Withdraw available funds from a stream with enhanced security
     * @param streamId The stream ID
     * @param amount Amount to withdraw (0 for all available)
     */
    function withdrawFromStream(uint256 streamId, uint256 amount) external nonReentrant whenNotPaused {
        Stream storage stream = streams[streamId];
        require(stream.recipient == msg.sender, "Not the recipient");
        require(stream.active && !stream.finalized, "Stream not active");
        
        uint256 availableBalance = this.balanceOf(streamId);
        require(availableBalance > 0, "No funds available");
        
        uint256 withdrawAmount = amount == 0 ? availableBalance : amount;
        require(withdrawAmount <= availableBalance, "Insufficient balance");
        require(withdrawAmount <= stream.remainingBalance, "Exceeds remaining balance");
        
        stream.remainingBalance = stream.remainingBalance - withdrawAmount;
        stream.totalWithdrawn = stream.totalWithdrawn + withdrawAmount;
        
        payable(msg.sender).transfer(withdrawAmount);
        
        emit StreamWithdrawn(streamId, msg.sender, withdrawAmount, stream.totalWithdrawn);
    }

    /**
     * @dev Release funds automatically (called by upkeeper bots)
     * @param streamId The stream ID
     */
    function releaseFunds(uint256 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(stream.active && !stream.finalized, "Stream not active");
        require(block.timestamp >= stream.startTime, "Stream not started");
        
        uint256 availableBalance = this.balanceOf(streamId);
        if (availableBalance > 0) {
            stream.remainingBalance = stream.remainingBalance - availableBalance;
            stream.totalWithdrawn = stream.totalWithdrawn + availableBalance;
            
            payable(stream.recipient).transfer(availableBalance);
            
            emit StreamWithdrawn(streamId, stream.recipient, availableBalance, stream.totalWithdrawn);
        }
    }

    /**
     * @dev Finalize a stream and distribute remaining funds and fees
     * @param streamId The stream ID
     */
    function finalizeStream(uint256 streamId) external onlyAuthorized {
        Stream storage stream = streams[streamId];
        require(stream.active && !stream.finalized, "Stream not active");
        
        stream.active = false;
        stream.finalized = true;
        
        // Transfer any remaining balance to recipient
        if (stream.remainingBalance > 0) {
            payable(stream.recipient).transfer(stream.remainingBalance);
            stream.totalWithdrawn = stream.totalWithdrawn + stream.remainingBalance;
            stream.remainingBalance = 0;
        }
        
        // Distribute platform fee to treasury
        if (stream.platformFeeAmount > 0 && treasury != address(0)) {
            payable(treasury).transfer(stream.platformFeeAmount);
            emit PlatformFeeWithdrawn(treasury, stream.platformFeeAmount);
        }
        
        // Distribute creator royalty
        if (stream.creatorRoyaltyAmount > 0 && stream.creatorAddress != address(0)) {
            payable(stream.creatorAddress).transfer(stream.creatorRoyaltyAmount);
            emit CreatorRoyaltyPaid(stream.creatorAddress, stream.creatorRoyaltyAmount);
        }
        
        emit StreamFinalized(
            streamId,
            stream.totalWithdrawn,
            stream.platformFeeAmount,
            stream.creatorRoyaltyAmount
        );
    }


    /**
     * @dev Get stream details
     * @param streamId The stream ID
     * @return Stream struct
     */
    function getStream(uint256 streamId) external view returns (Stream memory) {
        return streams[streamId];
    }

    /**
     * @dev Get streams where user is sender
     * @param user User address
     * @return Array of stream IDs
     */
    function getSenderStreams(address user) external view returns (uint256[] memory) {
        return senderStreams[user];
    }

    /**
     * @dev Get streams where user is recipient
     * @param user User address
     * @return Array of stream IDs
     */
    function getRecipientStreams(address user) external view returns (uint256[] memory) {
        return recipientStreams[user];
    }

    /**
     * @dev Check if a stream is active and ongoing
     * @param streamId The stream ID
     * @return True if stream is active
     */
    function isStreamActive(uint256 streamId) external view returns (bool) {
        Stream memory stream = streams[streamId];
        return stream.active && 
               block.timestamp >= stream.startTime && 
               block.timestamp < stream.stopTime &&
               stream.remainingBalance > 0;
    }

    /**
     * @dev Get the current streaming rate for a stream
     * @param streamId The stream ID
     * @return Rate per second in wei
     */
    function getStreamRate(uint256 streamId) external view returns (uint256) {
        return streams[streamId].ratePerSecond;
    }

    /**
     * @dev Calculate total streamed amount so far
     * @param streamId The stream ID
     * @return Total amount streamed
     */
    function getTotalStreamed(uint256 streamId) external view returns (uint256) {
        Stream memory stream = streams[streamId];
        require(stream.sender != address(0), "Stream does not exist");
        
        if (block.timestamp <= stream.startTime) {
            return 0;
        }
        
        uint256 endTime = block.timestamp >= stream.stopTime ? stream.stopTime : block.timestamp;
        uint256 elapsedTime = endTime - stream.startTime;
        
        return elapsedTime * stream.ratePerSecond;
    }

    /**
     * @dev Cancel a stream and return remaining funds with pro-rata distribution
     * @param streamId The stream ID
     */
    function cancelStream(uint256 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(
            stream.sender == msg.sender || 
            stream.recipient == msg.sender ||
            authorizedContracts[msg.sender],
            "Not authorized"
        );
        require(stream.active && !stream.finalized, "Stream not active");
        
        uint256 availableToRecipient = this.balanceOf(streamId);
        uint256 remainingToSender = stream.remainingBalance - availableToRecipient;
        
        stream.active = false;
        stream.finalized = true;
        stream.remainingBalance = 0;
        
        if (availableToRecipient > 0) {
            payable(stream.recipient).transfer(availableToRecipient);
        }
        
        if (remainingToSender > 0) {
            payable(stream.sender).transfer(remainingToSender);
        }
        
        emit StreamCancelled(
            streamId,
            stream.sender,
            stream.recipient,
            remainingToSender,
            availableToRecipient
        );
    }

    /**
     * @dev Set creator address for a collection
     * @param nftContract NFT contract address
     * @param creator Creator address
     */
    function setCollectionCreator(address nftContract, address creator) external onlyOwner {
        collectionCreators[nftContract] = creator;
    }

    /**
     * @dev Update platform fee percentage
     * @param newFeePercentage New fee percentage in basis points
     */
    function updatePlatformFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 1000, "Fee too high"); // Max 10%
        platformFeePercentage = newFeePercentage;
    }

    /**
     * @dev Update creator royalty percentage
     * @param newRoyaltyPercentage New royalty percentage in basis points
     */
    function updateCreatorRoyalty(uint256 newRoyaltyPercentage) external onlyOwner {
        require(newRoyaltyPercentage <= 500, "Royalty too high"); // Max 5%
        creatorRoyaltyPercentage = newRoyaltyPercentage;
    }

    /**
     * @dev Update treasury address
     * @param newTreasury New treasury address
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        treasury = newTreasury;
    }

    /**
     * @dev Add authorized contract
     * @param contractAddr Contract address to authorize
     */
    function addAuthorizedContract(address contractAddr) external onlyOwner {
        authorizedContracts[contractAddr] = true;
    }

    /**
     * @dev Remove authorized contract
     * @param contractAddr Contract address to remove
     */
    function removeAuthorizedContract(address contractAddr) external onlyOwner {
        authorizedContracts[contractAddr] = false;
    }

    /**
     * @dev Update maximum stream duration
     * @param newMaxDuration New maximum duration in seconds
     */
    function updateMaxStreamDuration(uint256 newMaxDuration) external onlyOwner {
        require(newMaxDuration >= MINIMUM_STREAM_DURATION, "Duration too short");
        maxStreamDuration = newMaxDuration;
    }

    /**
     * @dev Emergency pause function
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause function
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency function to recover stuck funds (only owner)
     * @param streamId The stream ID
     */
    function emergencyWithdraw(uint256 streamId) external onlyOwner {
        Stream storage stream = streams[streamId];
        require(stream.remainingBalance > 0, "No balance to withdraw");
        
        uint256 amount = stream.remainingBalance;
        stream.remainingBalance = 0;
        stream.active = false;
        stream.finalized = true;
        
        payable(owner()).transfer(amount);
    }

    /**
     * @dev Get comprehensive stream information
     * @param streamId The stream ID
     * @return Stream struct with all details
     */
    function getStreamDetails(uint256 streamId) external view returns (Stream memory) {
        return streams[streamId];
    }

    /**
     * @dev Get total platform fees collected
     * @return Total platform fees in contract
     */
    function getTotalPlatformFees() external view returns (uint256) {
        uint256 totalFees = 0;
        for (uint256 i = 0; i < nextStreamId; i++) {
            if (streams[i].finalized) {
                totalFees += streams[i].platformFeeAmount;
            }
        }
        return totalFees;
    }

    /**
     * @dev Get total creator royalties collected
     * @return Total creator royalties in contract
     */
    function getTotalCreatorRoyalties() external view returns (uint256) {
        uint256 totalRoyalties = 0;
        for (uint256 i = 0; i < nextStreamId; i++) {
            if (streams[i].finalized) {
                totalRoyalties += streams[i].creatorRoyaltyAmount;
            }
        }
        return totalRoyalties;
    }

    /**
     * @dev Withdraw accumulated platform fees
     */
    function withdrawPlatformFees() external onlyOwner {
        require(treasury != address(0), "Treasury not set");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(treasury).transfer(balance);
        emit PlatformFeeWithdrawn(treasury, balance);
    }

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}

