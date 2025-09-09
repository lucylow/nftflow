// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PaymentStream
 * @dev Contract for real-time payment streaming for NFT rentals
 * Enables continuous payment flow from renter to owner during rental period
 */
contract PaymentStream is ReentrancyGuard, Ownable {

    struct Stream {
        address sender;
        address recipient;
        uint256 deposit;
        uint256 ratePerSecond;
        uint256 startTime;
        uint256 stopTime;
        uint256 remainingBalance;
        bool active;
    }

    // State variables
    mapping(uint256 => Stream) public streams;
    mapping(address => uint256[]) public senderStreams;
    mapping(address => uint256[]) public recipientStreams;
    
    uint256 public nextStreamId;
    uint256 public constant MINIMUM_STREAM_DURATION = 1; // 1 second
    
    // Events
    event StreamCreated(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        uint256 deposit,
        uint256 ratePerSecond,
        uint256 startTime,
        uint256 stopTime
    );
    
    event StreamWithdrawn(
        uint256 indexed streamId,
        address indexed recipient,
        uint256 amount
    );
    
    event StreamCancelled(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        uint256 senderBalance,
        uint256 recipientBalance
    );

    /**
     * @dev Create a new payment stream
     * @param recipient Address to receive the stream
     * @param startTime When the stream starts (unix timestamp)
     * @param stopTime When the stream stops (unix timestamp)
     */
    function createStream(
        address recipient,
        uint256 startTime,
        uint256 stopTime
    ) external payable nonReentrant returns (uint256 streamId) {
        require(recipient != address(0), "Invalid recipient");
        require(recipient != msg.sender, "Cannot stream to self");
        require(msg.value > 0, "Deposit must be greater than 0");
        require(startTime >= block.timestamp, "Start time in the past");
        require(stopTime > startTime, "Stop time before start time");
        
        uint256 duration = stopTime - startTime;
        require(duration >= MINIMUM_STREAM_DURATION, "Duration too short");
        
        uint256 ratePerSecond = msg.value / duration;
        require(ratePerSecond > 0, "Rate per second must be greater than 0");

        streamId = nextStreamId++;
        
        streams[streamId] = Stream({
            sender: msg.sender,
            recipient: recipient,
            deposit: msg.value,
            ratePerSecond: ratePerSecond,
            startTime: startTime,
            stopTime: stopTime,
            remainingBalance: msg.value,
            active: true
        });

        senderStreams[msg.sender].push(streamId);
        recipientStreams[recipient].push(streamId);

        emit StreamCreated(
            streamId,
            msg.sender,
            recipient,
            msg.value,
            ratePerSecond,
            startTime,
            stopTime
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
     * @dev Withdraw available funds from a stream
     * @param streamId The stream ID
     * @param amount Amount to withdraw (0 for all available)
     */
    function withdrawFromStream(uint256 streamId, uint256 amount) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(stream.recipient == msg.sender, "Not the recipient");
        require(stream.active, "Stream not active");
        
        uint256 availableBalance = this.balanceOf(streamId);
        require(availableBalance > 0, "No funds available");
        
        uint256 withdrawAmount = amount == 0 ? availableBalance : amount;
        require(withdrawAmount <= availableBalance, "Insufficient balance");
        require(withdrawAmount <= stream.remainingBalance, "Exceeds remaining balance");
        
        stream.remainingBalance = stream.remainingBalance - withdrawAmount;
        
        payable(msg.sender).transfer(withdrawAmount);
        
        emit StreamWithdrawn(streamId, msg.sender, withdrawAmount);
    }

    /**
     * @dev Cancel a stream and return remaining funds
     * @param streamId The stream ID
     */
    function cancelStream(uint256 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(
            stream.sender == msg.sender || stream.recipient == msg.sender,
            "Not authorized"
        );
        require(stream.active, "Stream not active");
        
        uint256 availableToRecipient = this.balanceOf(streamId);
        uint256 remainingToSender = stream.remainingBalance - availableToRecipient;
        
        stream.active = false;
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
     * @dev Emergency function to recover stuck funds (only owner)
     * @param streamId The stream ID
     */
    function emergencyWithdraw(uint256 streamId) external onlyOwner {
        Stream storage stream = streams[streamId];
        require(stream.remainingBalance > 0, "No balance to withdraw");
        
        uint256 amount = stream.remainingBalance;
        stream.remainingBalance = 0;
        stream.active = false;
        
        payable(owner()).transfer(amount);
    }
}

