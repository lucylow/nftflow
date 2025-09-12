// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "../interfaces/IERC4907.sol";
import "../interfaces/IPriceOracle.sol";
import "./ReputationSystem.sol";

/**
 * @title MicroRentalRevolution
 * @dev Revolutionary micro-rental system enabling second-based NFT rentals
 * Leverages Somnia's sub-cent fees and 1M+ TPS for unprecedented granularity
 */
contract MicroRentalRevolution is ReentrancyGuard, Ownable {
    
    // Micro-rental structure optimized for Somnia's capabilities
    struct MicroRental {
        address nftContract;
        uint256 tokenId;
        address owner;
        address renter;
        uint256 pricePerSecond;
        uint256 startTime;
        uint256 endTime;
        uint256 totalCost;
        uint256 collateralAmount;
        bool active;
        bool completed;
        uint256 reputationDiscount; // Discount based on reputation
        uint8 rentalType; // 0: Standard, 1: TimeSlot, 2: Group, 3: Instant
    }
    
    // Time-slot rental for exclusive content
    struct TimeSlot {
        uint256 startTime;
        uint256 endTime;
        address renter;
        bool isReserved;
        uint256 premiumMultiplier; // Extra cost for exclusive time slots
    }
    
    // Group rental structure
    struct RentalGroup {
        address owner;
        address[] members;
        uint256 createdTime;
        bool active;
        mapping(address => bool) isMember;
    }
    
    // Achievement tracking
    struct Achievement {
        string name;
        string description;
        uint256 requirement;
        uint256 reward; // STT reward for achieving
        bool isActive;
    }
    
    // State variables
    mapping(uint256 => MicroRental) public microRentals;
    mapping(address => mapping(uint256 => TimeSlot[])) public timeSlots; // nftContract => tokenId => timeSlots
    mapping(uint256 => RentalGroup) public rentalGroups;
    mapping(address => string[]) public userAchievements;
    mapping(string => Achievement) public achievements;
    
    uint256 public nextRentalId;
    uint256 public nextGroupId;
    uint256 public totalMicroRentals;
    uint256 public totalVolume;
    
    // Somnia-optimized constants
    uint256 public constant MIN_RENTAL_DURATION = 1; // 1 second minimum
    uint256 public constant MAX_RENTAL_DURATION = 31536000; // 1 year maximum
    uint256 public constant MIN_PRICE_PER_SECOND = 0.000001 ether; // Minimum viable price
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 250; // 2.5%
    
    // Contract dependencies
    ReputationSystem public reputationSystem;
    IPriceOracle public priceOracle;
    
    // Events for real-time monitoring
    event MicroRentalCreated(
        uint256 indexed rentalId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address renter,
        uint256 duration,
        uint256 pricePerSecond,
        uint256 totalCost
    );
    
    event TimeSlotRented(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed renter,
        uint256 startTime,
        uint256 endTime,
        uint256 premiumCost
    );
    
    event GroupRentalCreated(
        uint256 indexed groupId,
        address indexed owner,
        address[] members,
        uint256 rentalId
    );
    
    event AchievementUnlocked(
        address indexed user,
        string indexed achievementName,
        uint256 reward
    );
    
    event RealTimePaymentUpdate(
        uint256 indexed rentalId,
        uint256 streamedAmount,
        uint256 timestamp
    );
    
    constructor(address _reputationSystem, address _priceOracle) {
        reputationSystem = ReputationSystem(_reputationSystem);
        priceOracle = IPriceOracle(_priceOracle);
        _initializeAchievements();
    }
    
    /**
     * @dev Rent NFT by the second - the core micro-rental functionality
     * @param nftContract Address of the NFT contract
     * @param tokenId ID of the NFT
     * @param secondsToRent Number of seconds to rent
     * @param rentalType Type of rental (0: Standard, 1: TimeSlot, 2: Group, 3: Instant)
     */
    function rentByTheSecond(
        address nftContract,
        uint256 tokenId,
        uint256 secondsToRent,
        uint8 rentalType
    ) external payable nonReentrant {
        require(secondsToRent >= MIN_RENTAL_DURATION, "Duration too short");
        require(secondsToRent <= MAX_RENTAL_DURATION, "Duration too long");
        require(rentalType <= 3, "Invalid rental type");
        
        // Get price per second from oracle
        uint256 pricePerSecond = priceOracle.getEstimatedPrice{value: 0.001 ether}(nftContract, tokenId);
        require(pricePerSecond >= MIN_PRICE_PER_SECOND, "Price too low");
        
        // Calculate total cost
        uint256 totalCost = pricePerSecond * secondsToRent;
        
        // Apply reputation discount
        uint256 reputationDiscount = _calculateReputationDiscount(msg.sender);
        uint256 discountedCost = totalCost - (totalCost * reputationDiscount / 10000);
        
        // Calculate collateral requirements
        uint256 collateralRequired = _calculateCollateral(nftContract, tokenId, msg.sender);
        
        require(msg.value >= discountedCost + collateralRequired, "Insufficient payment");
        
        // Create micro-rental
        uint256 rentalId = nextRentalId++;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + secondsToRent;
        
        microRentals[rentalId] = MicroRental({
            nftContract: nftContract,
            tokenId: tokenId,
            owner: IERC721(nftContract).ownerOf(tokenId),
            renter: msg.sender,
            pricePerSecond: pricePerSecond,
            startTime: startTime,
            endTime: endTime,
            totalCost: discountedCost,
            collateralAmount: collateralRequired,
            active: true,
            completed: false,
            reputationDiscount: reputationDiscount,
            rentalType: rentalType
        });
        
        totalMicroRentals++;
        totalVolume += discountedCost;
        
        // Set user for ERC-4907 compatible NFTs
        if (supportsInterface(nftContract, type(IERC4907).interfaceId)) {
            IERC4907(nftContract).setUser(tokenId, msg.sender, uint64(endTime));
        }
        
        // Check for achievements
        _checkAchievements(msg.sender);
        
        emit MicroRentalCreated(
            rentalId,
            nftContract,
            tokenId,
            msg.sender,
            secondsToRent,
            pricePerSecond,
            discountedCost
        );
        
        // Start real-time payment stream
        _startPaymentStream(rentalId, discountedCost, secondsToRent);
    }
    
    /**
     * @dev Rent specific time slot for exclusive content
     * @param nftContract Address of the NFT contract
     * @param tokenId ID of the NFT
     * @param startTime Start time of the slot
     * @param endTime End time of the slot
     * @param premiumMultiplier Extra cost multiplier for exclusive access
     */
    function rentTimeSlot(
        address nftContract,
        uint256 tokenId,
        uint256 startTime,
        uint256 endTime,
        uint256 premiumMultiplier
    ) external payable nonReentrant {
        require(startTime > block.timestamp, "Start time in the past");
        require(endTime > startTime, "Invalid time range");
        require(premiumMultiplier >= 100, "Invalid premium multiplier"); // 100 = 1x
        
        // Check if time slot is available
        require(!_isTimeSlotTaken(nftContract, tokenId, startTime, endTime), "Time slot taken");
        
        uint256 duration = endTime - startTime;
        uint256 basePrice = priceOracle.getEstimatedPrice{value: 0.001 ether}(nftContract, tokenId);
        uint256 premiumPrice = (basePrice * premiumMultiplier) / 100;
        uint256 totalCost = premiumPrice * duration;
        
        require(msg.value >= totalCost, "Insufficient payment");
        
        // Reserve time slot
        timeSlots[nftContract][tokenId].push(TimeSlot({
            startTime: startTime,
            endTime: endTime,
            renter: msg.sender,
            isReserved: true,
            premiumMultiplier: premiumMultiplier
        }));
        
        emit TimeSlotRented(nftContract, tokenId, msg.sender, startTime, endTime, totalCost);
    }
    
    /**
     * @dev Create collaborative rental group
     * @param members Array of member addresses
     */
    function createRentalGroup(address[] memory members) external {
        require(members.length > 1 && members.length <= 10, "Invalid group size");
        
        uint256 groupId = nextGroupId++;
        RentalGroup storage group = rentalGroups[groupId];
        group.owner = msg.sender;
        group.members = members;
        group.createdTime = block.timestamp;
        group.active = true;
        
        for (uint256 i = 0; i < members.length; i++) {
            group.isMember[members[i]] = true;
        }
        
        emit GroupRentalCreated(groupId, msg.sender, members, 0);
    }
    
    /**
     * @dev Rent NFT to group (split cost among members)
     * @param groupId ID of the rental group
     * @param nftContract Address of the NFT contract
     * @param tokenId ID of the NFT
     * @param secondsToRent Number of seconds to rent
     */
    function rentToGroup(
        uint256 groupId,
        address nftContract,
        uint256 tokenId,
        uint256 secondsToRent
    ) external payable nonReentrant {
        RentalGroup storage group = rentalGroups[groupId];
        require(group.active, "Group not active");
        require(group.isMember[msg.sender], "Not group member");
        
        uint256 pricePerSecond = priceOracle.getEstimatedPrice{value: 0.001 ether}(nftContract, tokenId);
        uint256 totalCost = pricePerSecond * secondsToRent;
        uint256 costPerMember = totalCost / group.members.length;
        
        require(msg.value >= costPerMember, "Insufficient payment");
        
        // Create group rental
        uint256 rentalId = nextRentalId++;
        microRentals[rentalId] = MicroRental({
            nftContract: nftContract,
            tokenId: tokenId,
            owner: IERC721(nftContract).ownerOf(tokenId),
            renter: address(this), // Contract holds the rental for the group
            pricePerSecond: pricePerSecond,
            startTime: block.timestamp,
            endTime: block.timestamp + secondsToRent,
            totalCost: totalCost,
            collateralAmount: 0,
            active: true,
            completed: false,
            reputationDiscount: 0,
            rentalType: 2 // Group rental
        });
        
        emit GroupRentalCreated(groupId, group.owner, group.members, rentalId);
    }
    
    /**
     * @dev Complete rental and update reputation
     * @param rentalId ID of the rental to complete
     */
    function completeRental(uint256 rentalId) external {
        MicroRental storage rental = microRentals[rentalId];
        require(rental.active, "Rental not active");
        require(block.timestamp >= rental.endTime, "Rental not ended");
        require(
            msg.sender == rental.renter || 
            msg.sender == rental.owner || 
            msg.sender == owner(),
            "Not authorized"
        );
        
        // Clear user in ERC-4907
        if (supportsInterface(rental.nftContract, type(IERC4907).interfaceId)) {
            IERC4907(rental.nftContract).setUser(rental.tokenId, address(0), 0);
        }
        
        // Update reputation
        reputationSystem.updateReputation(rental.renter, true);
        
        rental.active = false;
        rental.completed = true;
        
        // Check for completion achievements
        _checkAchievements(rental.renter);
    }
    
    /**
     * @dev Update real-time payment stream (called by external service)
     * @param rentalId ID of the rental
     * @param streamedAmount Amount streamed so far
     */
    function updateRealTimeStream(uint256 rentalId, uint256 streamedAmount) external {
        MicroRental storage rental = microRentals[rentalId];
        require(rental.active, "Rental not active");
        
        emit RealTimePaymentUpdate(rentalId, streamedAmount, block.timestamp);
    }
    
    /**
     * @dev Calculate reputation-based discount
     * @param user User address
     * @return discount Discount percentage (in basis points)
     */
    function _calculateReputationDiscount(address user) internal view returns (uint256 discount) {
        uint256 reputation = reputationSystem.getReputationScore(user);
        
        if (reputation >= 900) return 2000; // 20% discount
        if (reputation >= 750) return 1500; // 15% discount
        if (reputation >= 500) return 1000; // 10% discount
        if (reputation >= 250) return 500;  // 5% discount
        
        return 0; // No discount
    }
    
    /**
     * @dev Calculate collateral requirements based on reputation
     * @param nftContract NFT contract address
     * @param tokenId NFT token ID
     * @param user User address
     * @return collateral Required collateral amount
     */
    function _calculateCollateral(address nftContract, uint256 tokenId, address user) internal view returns (uint256 collateral) {
        uint256 reputation = reputationSystem.getReputationScore(user);
        
        if (reputation >= 750) return 0; // No collateral for trusted users
        if (reputation >= 500) return 0.1 ether; // Reduced collateral
        if (reputation >= 250) return 0.5 ether; // Medium collateral
        
        return 1 ether; // Full collateral for new users
    }
    
    /**
     * @dev Check if time slot is taken
     * @param nftContract NFT contract address
     * @param tokenId NFT token ID
     * @param startTime Start time
     * @param endTime End time
     * @return taken True if time slot is taken
     */
    function _isTimeSlotTaken(
        address nftContract,
        uint256 tokenId,
        uint256 startTime,
        uint256 endTime
    ) internal view returns (bool taken) {
        TimeSlot[] storage slots = timeSlots[nftContract][tokenId];
        
        for (uint256 i = 0; i < slots.length; i++) {
            TimeSlot storage slot = slots[i];
            if (slot.isReserved && 
                ((startTime >= slot.startTime && startTime < slot.endTime) ||
                 (endTime > slot.startTime && endTime <= slot.endTime) ||
                 (startTime <= slot.startTime && endTime >= slot.endTime))) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @dev Start payment stream for rental
     * @param rentalId Rental ID
     * @param totalCost Total cost of rental
     * @param duration Rental duration in seconds
     */
    function _startPaymentStream(uint256 rentalId, uint256 totalCost, uint256 duration) internal {
        // Implementation would integrate with payment streaming contract
        // For now, emit event for external service to handle
        emit RealTimePaymentUpdate(rentalId, 0, block.timestamp);
    }
    
    /**
     * @dev Check and unlock achievements
     * @param user User address
     */
    function _checkAchievements(address user) internal {
        // Check rental count achievements
        uint256 rentalCount = _getUserRentalCount(user);
        
        if (rentalCount >= 10 && !_hasAchievement(user, "Rental Novice")) {
            _grantAchievement(user, "Rental Novice", 0.01 ether);
        }
        
        if (rentalCount >= 100 && !_hasAchievement(user, "Rental Master")) {
            _grantAchievement(user, "Rental Master", 0.1 ether);
        }
        
        if (rentalCount >= 1000 && !_hasAchievement(user, "Rental Legend")) {
            _grantAchievement(user, "Rental Legend", 1 ether);
        }
    }
    
    /**
     * @dev Get user's rental count
     * @param user User address
     * @return count Number of completed rentals
     */
    function _getUserRentalCount(address user) internal view returns (uint256 count) {
        // This would need to be implemented with proper tracking
        // For now, return 0
        return 0;
    }
    
    /**
     * @dev Check if user has specific achievement
     * @param user User address
     * @param achievementName Achievement name
     * @return has True if user has achievement
     */
    function _hasAchievement(address user, string memory achievementName) internal view returns (bool has) {
        string[] memory userAchievementsList = userAchievements[user];
        
        for (uint256 i = 0; i < userAchievementsList.length; i++) {
            if (keccak256(bytes(userAchievementsList[i])) == keccak256(bytes(achievementName))) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @dev Grant achievement to user
     * @param user User address
     * @param achievementName Achievement name
     * @param reward Reward amount
     */
    function _grantAchievement(address user, string memory achievementName, uint256 reward) internal {
        userAchievements[user].push(achievementName);
        
        if (reward > 0) {
            payable(user).transfer(reward);
        }
        
        emit AchievementUnlocked(user, achievementName, reward);
    }
    
    /**
     * @dev Initialize default achievements
     */
    function _initializeAchievements() internal {
        achievements["Rental Novice"] = Achievement({
            name: "Rental Novice",
            description: "Complete 10 rentals",
            requirement: 10,
            reward: 0.01 ether,
            isActive: true
        });
        
        achievements["Rental Master"] = Achievement({
            name: "Rental Master",
            description: "Complete 100 rentals",
            requirement: 100,
            reward: 0.1 ether,
            isActive: true
        });
        
        achievements["Rental Legend"] = Achievement({
            name: "Rental Legend",
            description: "Complete 1000 rentals",
            requirement: 1000,
            reward: 1 ether,
            isActive: true
        });
    }
    
    /**
     * @dev Check if contract supports interface
     * @param contractAddress Contract address
     * @param interfaceId Interface ID
     * @return supported True if interface is supported
     */
    function supportsInterface(address contractAddress, bytes4 interfaceId) internal view returns (bool supported) {
        try IERC165(contractAddress).supportsInterface(interfaceId) returns (bool result) {
            return result;
        } catch {
            return false;
        }
    }
    
    /**
     * @dev Get rental details
     * @param rentalId Rental ID
     * @return rental Rental details
     */
    function getRental(uint256 rentalId) external view returns (MicroRental memory rental) {
        return microRentals[rentalId];
    }
    
    /**
     * @dev Get user's achievements
     * @param user User address
     * @return achievementsList Array of achievement names
     */
    function getUserAchievements(address user) external view returns (string[] memory achievementsList) {
        return userAchievements[user];
    }
    
    /**
     * @dev Emergency withdrawal (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}



