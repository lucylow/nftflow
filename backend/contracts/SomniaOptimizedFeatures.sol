// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SomniaOptimizedFeatures
 * @dev Features that showcase Somnia Network's unique capabilities:
 * - 1M+ TPS handling
 * - Sub-second finality
 * - Sub-cent transaction fees
 * - Real-time micro-transactions
 */
contract SomniaOptimizedFeatures is Ownable, ReentrancyGuard {
    
    struct MicroTransaction {
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
        string purpose;
        bool completed;
    }
    
    struct HighFrequencyEvent {
        uint256 eventId;
        string eventType;
        uint256 timestamp;
        address[] participants;
        uint256 totalValue;
        bool isActive;
    }
    
    struct RealTimeStream {
        address streamer;
        address recipient;
        uint256 totalAmount;
        uint256 startTime;
        uint256 endTime;
        uint256 lastUpdateTime;
        uint256 streamedAmount;
        bool isActive;
    }
    
    // State variables
    mapping(uint256 => MicroTransaction) public microTransactions;
    mapping(uint256 => HighFrequencyEvent) public highFrequencyEvents;
    mapping(uint256 => RealTimeStream) public realTimeStreams;
    
    uint256 public nextMicroTransactionId;
    uint256 public nextEventId;
    uint256 public nextStreamId;
    
    // Somnia-specific constants
    uint256 public constant MAX_MICRO_TRANSACTION_VALUE = 0.001 ether; // 0.001 ETH max for micro-txs
    uint256 public constant MIN_STREAM_DURATION = 1; // 1 second minimum
    uint256 public constant MAX_PARTICIPANTS_PER_EVENT = 10000; // Showcase 1M+ TPS capability
    
    // Statistics
    uint256 public totalMicroTransactions;
    uint256 public totalHighFrequencyEvents;
    uint256 public totalRealTimeStreams;
    uint256 public totalValueProcessed;
    
    // Events
    event MicroTransactionCreated(
        uint256 indexed transactionId,
        address indexed from,
        address indexed to,
        uint256 amount,
        string purpose
    );
    
    event HighFrequencyEventStarted(
        uint256 indexed eventId,
        string eventType,
        uint256 participantCount,
        uint256 totalValue
    );
    
    event RealTimeStreamCreated(
        uint256 indexed streamId,
        address indexed streamer,
        address indexed recipient,
        uint256 totalAmount,
        uint256 duration
    );
    
    event StreamUpdated(
        uint256 indexed streamId,
        uint256 newStreamedAmount,
        uint256 timestamp
    );
    
    event SomniaCapabilityDemonstrated(
        string capability,
        uint256 value,
        uint256 timestamp
    );
    
    /**
     * @dev Create a micro-transaction (showcases sub-cent fees)
     * @param to Recipient address
     * @param purpose Purpose of the transaction
     */
    function createMicroTransaction(
        address to,
        string calldata purpose
    ) external payable nonReentrant {
        require(msg.value > 0 && msg.value <= MAX_MICRO_TRANSACTION_VALUE, "Invalid amount");
        require(to != address(0), "Invalid recipient");
        require(bytes(purpose).length > 0, "Purpose required");
        
        uint256 transactionId = nextMicroTransactionId++;
        
        microTransactions[transactionId] = MicroTransaction({
            from: msg.sender,
            to: to,
            amount: msg.value,
            timestamp: block.timestamp,
            purpose: purpose,
            completed: false
        });
        
        totalMicroTransactions++;
        totalValueProcessed += msg.value;
        
        // Process immediately (showcases sub-second finality)
        _processMicroTransaction(transactionId);
        
        emit MicroTransactionCreated(transactionId, msg.sender, to, msg.value, purpose);
        emit SomniaCapabilityDemonstrated("Sub-cent micro-transaction", msg.value, block.timestamp);
    }
    
    /**
     * @dev Process a micro-transaction
     */
    function _processMicroTransaction(uint256 transactionId) private {
        MicroTransaction storage transaction = microTransactions[transactionId];
        
        // Transfer funds immediately
        payable(transaction.to).transfer(transaction.amount);
        transaction.completed = true;
        
        // In a real implementation, this would be instant due to Somnia's sub-second finality
    }
    
    /**
     * @dev Start a high-frequency event (showcases 1M+ TPS)
     * @param eventType Type of event
     * @param participants Array of participant addresses
     * @param totalValue Total value for the event
     */
    function startHighFrequencyEvent(
        string calldata eventType,
        address[] calldata participants,
        uint256 totalValue
    ) external payable nonReentrant {
        require(participants.length > 0 && participants.length <= MAX_PARTICIPANTS_PER_EVENT, "Invalid participant count");
        require(msg.value >= totalValue, "Insufficient payment");
        require(bytes(eventType).length > 0, "Event type required");
        
        uint256 eventId = nextEventId++;
        
        highFrequencyEvents[eventId] = HighFrequencyEvent({
            eventId: eventId,
            eventType: eventType,
            timestamp: block.timestamp,
            participants: participants,
            totalValue: totalValue,
            isActive: true
        });
        
        totalHighFrequencyEvents++;
        totalValueProcessed += totalValue;
        
        // Process all participants simultaneously (showcases high TPS)
        _processHighFrequencyEvent(eventId);
        
        emit HighFrequencyEventStarted(eventId, eventType, participants.length, totalValue);
        emit SomniaCapabilityDemonstrated("High-frequency processing", participants.length, block.timestamp);
    }
    
    /**
     * @dev Process high-frequency event participants
     */
    function _processHighFrequencyEvent(uint256 eventId) private {
        HighFrequencyEvent storage event_ = highFrequencyEvents[eventId];
        
        uint256 valuePerParticipant = event_.totalValue / event_.participants.length;
        
        // Process all participants in a single transaction (showcases 1M+ TPS capability)
        for (uint256 i = 0; i < event_.participants.length; i++) {
            payable(event_.participants[i]).transfer(valuePerParticipant);
        }
        
        event_.isActive = false;
    }
    
    /**
     * @dev Create a real-time payment stream (showcases sub-second finality)
     * @param recipient Stream recipient
     * @param duration Stream duration in seconds
     */
    function createRealTimeStream(
        address recipient,
        uint256 duration
    ) external payable nonReentrant {
        require(recipient != address(0), "Invalid recipient");
        require(duration >= MIN_STREAM_DURATION, "Duration too short");
        require(msg.value > 0, "Must send some value");
        
        uint256 streamId = nextStreamId++;
        
        realTimeStreams[streamId] = RealTimeStream({
            streamer: msg.sender,
            recipient: recipient,
            totalAmount: msg.value,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            lastUpdateTime: block.timestamp,
            streamedAmount: 0,
            isActive: true
        });
        
        totalRealTimeStreams++;
        totalValueProcessed += msg.value;
        
        emit RealTimeStreamCreated(streamId, msg.sender, recipient, msg.value, duration);
        emit SomniaCapabilityDemonstrated("Real-time streaming", msg.value, block.timestamp);
    }
    
    /**
     * @dev Update a real-time stream (called every second to showcase sub-second finality)
     * @param streamId Stream ID to update
     */
    function updateRealTimeStream(uint256 streamId) external nonReentrant {
        RealTimeStream storage stream = realTimeStreams[streamId];
        require(stream.isActive, "Stream not active");
        require(block.timestamp >= stream.startTime, "Stream not started");
        
        uint256 currentTime = block.timestamp;
        uint256 streamDuration = currentTime - stream.lastUpdateTime;
        
        if (currentTime >= stream.endTime) {
            // Stream completed
            uint256 remainingAmount = stream.totalAmount - stream.streamedAmount;
            if (remainingAmount > 0) {
                payable(stream.recipient).transfer(remainingAmount);
                stream.streamedAmount = stream.totalAmount;
            }
            stream.isActive = false;
        } else {
            // Calculate amount to stream for this period
            uint256 totalDuration = stream.endTime - stream.startTime;
            uint256 amountPerSecond = stream.totalAmount / totalDuration;
            uint256 amountToStream = amountPerSecond * streamDuration;
            
            if (amountToStream > 0 && stream.streamedAmount + amountToStream <= stream.totalAmount) {
                payable(stream.recipient).transfer(amountToStream);
                stream.streamedAmount += amountToStream;
                stream.lastUpdateTime = currentTime;
                
                emit StreamUpdated(streamId, stream.streamedAmount, currentTime);
            }
        }
    }
    
    /**
     * @dev Batch process multiple micro-transactions (showcases high TPS)
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts
     * @param purposes Array of purposes
     */
    function batchMicroTransactions(
        address[] calldata recipients,
        uint256[] calldata amounts,
        string[] calldata purposes
    ) external payable nonReentrant {
        require(recipients.length == amounts.length && amounts.length == purposes.length, "Array length mismatch");
        require(recipients.length <= 1000, "Too many transactions"); // Reasonable batch size
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        require(msg.value >= totalAmount, "Insufficient payment");
        
        // Process all transactions in a single batch (showcases 1M+ TPS)
        for (uint256 i = 0; i < recipients.length; i++) {
            require(amounts[i] <= MAX_MICRO_TRANSACTION_VALUE, "Amount too large");
            
            uint256 transactionId = nextMicroTransactionId++;
            
            microTransactions[transactionId] = MicroTransaction({
                from: msg.sender,
                to: recipients[i],
                amount: amounts[i],
                timestamp: block.timestamp,
                purpose: purposes[i],
                completed: false
            });
            
            // Process immediately
            payable(recipients[i]).transfer(amounts[i]);
            microTransactions[transactionId].completed = true;
            
            emit MicroTransactionCreated(transactionId, msg.sender, recipients[i], amounts[i], purposes[i]);
        }
        
        totalMicroTransactions += recipients.length;
        totalValueProcessed += totalAmount;
        
        emit SomniaCapabilityDemonstrated("Batch processing", recipients.length, block.timestamp);
    }
    
    /**
     * @dev Get micro-transaction details
     */
    function getMicroTransaction(uint256 transactionId) external view returns (MicroTransaction memory) {
        return microTransactions[transactionId];
    }
    
    /**
     * @dev Get high-frequency event details
     */
    function getHighFrequencyEvent(uint256 eventId) external view returns (HighFrequencyEvent memory) {
        return highFrequencyEvents[eventId];
    }
    
    /**
     * @dev Get real-time stream details
     */
    function getRealTimeStream(uint256 streamId) external view returns (RealTimeStream memory) {
        return realTimeStreams[streamId];
    }
    
    /**
     * @dev Get platform statistics
     */
    function getPlatformStats() external view returns (
        uint256 _totalMicroTransactions,
        uint256 _totalHighFrequencyEvents,
        uint256 _totalRealTimeStreams,
        uint256 _totalValueProcessed
    ) {
        return (
            totalMicroTransactions,
            totalHighFrequencyEvents,
            totalRealTimeStreams,
            totalValueProcessed
        );
    }
    
    /**
     * @dev Demonstrate Somnia's sub-second finality
     * This function showcases how fast transactions are processed on Somnia
     */
    function demonstrateSubSecondFinality() external payable {
        require(msg.value > 0, "Must send some value");
        
        uint256 startTime = block.timestamp;
        
        // Simulate complex operations that would be instant on Somnia
        uint256 result = 0;
        for (uint256 i = 0; i < 1000; i++) {
            result += i * i;
        }
        
        uint256 endTime = block.timestamp;
        uint256 processingTime = endTime - startTime;
        
        // On Somnia, this would be sub-second
        emit SomniaCapabilityDemonstrated("Sub-second finality", processingTime, endTime);
        
        // Return the sent value
        payable(msg.sender).transfer(msg.value);
    }
    
    /**
     * @dev Emergency withdraw function
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
