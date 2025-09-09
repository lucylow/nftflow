// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title NFTSocialFeatures
 * @dev Social features for NFT rental community
 * Enables reviews, ratings, and social interactions
 */
contract NFTSocialFeatures is Ownable, ReentrancyGuard {
    
    struct Review {
        address reviewer;
        address nftContract;
        uint256 tokenId;
        uint8 rating; // 1-5 stars
        string comment;
        uint256 timestamp;
        bool isVerified; // True if reviewer actually rented the NFT
    }
    
    struct UserProfile {
        string username;
        string bio;
        string avatarUrl;
        uint256 joinDate;
        bool isVerified;
        uint256 totalReviews;
        uint256 averageRating;
    }
    
    struct NFTRating {
        uint256 totalRatings;
        uint256 sumOfRatings;
        uint256 reviewCount;
        mapping(uint8 => uint256) ratingDistribution; // rating => count
    }
    
    struct FollowData {
        mapping(address => bool) following;
        address[] followingList;
        address[] followersList;
    }
    
    // State variables
    mapping(address => UserProfile) public userProfiles;
    mapping(bytes32 => Review[]) public nftReviews; // keccak256(nftContract, tokenId) => reviews
    mapping(bytes32 => NFTRating) public nftRatings;
    mapping(address => FollowData) internal userFollows;
    mapping(address => bool) public registeredUsers;
    mapping(string => bool) public usernamesTaken;
    
    uint256 public totalUsers;
    uint256 public totalReviews;
    
    // Events
    event UserRegistered(
        address indexed user,
        string username,
        uint256 timestamp
    );
    
    event ReviewSubmitted(
        address indexed reviewer,
        address indexed nftContract,
        uint256 indexed tokenId,
        uint8 rating,
        string comment,
        bool isVerified
    );
    
    event UserFollowed(
        address indexed follower,
        address indexed following,
        uint256 timestamp
    );
    
    event UserUnfollowed(
        address indexed follower,
        address indexed unfollowed,
        uint256 timestamp
    );
    
    event ProfileUpdated(
        address indexed user,
        string username,
        string bio,
        string avatarUrl
    );
    
    // Modifiers
    modifier onlyRegisteredUser() {
        require(registeredUsers[msg.sender], "User not registered");
        _;
    }
    
    modifier validRating(uint8 rating) {
        require(rating >= 1 && rating <= 5, "Rating must be 1-5");
        _;
    }
    
    /**
     * @dev Register a new user
     * @param username Unique username
     * @param bio User bio
     * @param avatarUrl Avatar image URL
     */
    function registerUser(
        string calldata username,
        string calldata bio,
        string calldata avatarUrl
    ) external {
        require(!registeredUsers[msg.sender], "User already registered");
        require(!usernamesTaken[username], "Username already taken");
        require(bytes(username).length > 0 && bytes(username).length <= 32, "Invalid username length");
        
        registeredUsers[msg.sender] = true;
        usernamesTaken[username] = true;
        totalUsers++;
        
        userProfiles[msg.sender] = UserProfile({
            username: username,
            bio: bio,
            avatarUrl: avatarUrl,
            joinDate: block.timestamp,
            isVerified: false,
            totalReviews: 0,
            averageRating: 0
        });
        
        emit UserRegistered(msg.sender, username, block.timestamp);
    }
    
    /**
     * @dev Update user profile
     * @param username New username (if changed)
     * @param bio New bio
     * @param avatarUrl New avatar URL
     */
    function updateProfile(
        string calldata username,
        string calldata bio,
        string calldata avatarUrl
    ) external onlyRegisteredUser {
        UserProfile storage profile = userProfiles[msg.sender];
        
        // Check if username is being changed
        if (keccak256(bytes(profile.username)) != keccak256(bytes(username))) {
            require(!usernamesTaken[username], "Username already taken");
            require(bytes(username).length > 0 && bytes(username).length <= 32, "Invalid username length");
            
            usernamesTaken[profile.username] = false;
            usernamesTaken[username] = true;
            profile.username = username;
        }
        
        profile.bio = bio;
        profile.avatarUrl = avatarUrl;
        
        emit ProfileUpdated(msg.sender, username, bio, avatarUrl);
    }
    
    /**
     * @dev Submit a review for an NFT
     * @param nftContract NFT contract address
     * @param tokenId Token ID
     * @param rating Rating 1-5
     * @param comment Review comment
     * @param isVerified Whether the reviewer actually rented the NFT
     */
    function submitReview(
        address nftContract,
        uint256 tokenId,
        uint8 rating,
        string calldata comment,
        bool isVerified
    ) external onlyRegisteredUser validRating(rating) {
        require(bytes(comment).length <= 500, "Comment too long");
        
        bytes32 nftKey = keccak256(abi.encodePacked(nftContract, tokenId));
        
        // Check if user already reviewed this NFT
        Review[] storage reviews = nftReviews[nftKey];
        for (uint256 i = 0; i < reviews.length; i++) {
            require(reviews[i].reviewer != msg.sender, "Already reviewed this NFT");
        }
        
        // Create new review
        Review memory newReview = Review({
            reviewer: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            rating: rating,
            comment: comment,
            timestamp: block.timestamp,
            isVerified: isVerified
        });
        
        reviews.push(newReview);
        
        // Update NFT rating statistics
        NFTRating storage nftRating = nftRatings[nftKey];
        nftRating.totalRatings++;
        nftRating.sumOfRatings += rating;
        nftRating.reviewCount++;
        nftRating.ratingDistribution[rating]++;
        
        // Update user profile
        UserProfile storage profile = userProfiles[msg.sender];
        profile.totalReviews++;
        
        // Recalculate user's average rating
        uint256 totalUserRatings = 0;
        uint256 sumUserRatings = 0;
        
        // This is a simplified calculation - in production, you'd want to track this more efficiently
        profile.averageRating = 0; // Placeholder - would need more complex logic
        
        totalReviews++;
        
        emit ReviewSubmitted(msg.sender, nftContract, tokenId, rating, comment, isVerified);
    }
    
    /**
     * @dev Follow another user
     * @param userToFollow Address of user to follow
     */
    function followUser(address userToFollow) external onlyRegisteredUser {
        require(userToFollow != msg.sender, "Cannot follow yourself");
        require(registeredUsers[userToFollow], "User not registered");
        require(!userFollows[msg.sender].following[userToFollow], "Already following");
        
        userFollows[msg.sender].following[userToFollow] = true;
        userFollows[msg.sender].followingList.push(userToFollow);
        userFollows[userToFollow].followersList.push(msg.sender);
        
        emit UserFollowed(msg.sender, userToFollow, block.timestamp);
    }
    
    /**
     * @dev Unfollow a user
     * @param userToUnfollow Address of user to unfollow
     */
    function unfollowUser(address userToUnfollow) external onlyRegisteredUser {
        require(userFollows[msg.sender].following[userToUnfollow], "Not following this user");
        
        userFollows[msg.sender].following[userToUnfollow] = false;
        
        // Remove from following list
        address[] storage followingList = userFollows[msg.sender].followingList;
        for (uint256 i = 0; i < followingList.length; i++) {
            if (followingList[i] == userToUnfollow) {
                followingList[i] = followingList[followingList.length - 1];
                followingList.pop();
                break;
            }
        }
        
        // Remove from followers list
        address[] storage followersList = userFollows[userToUnfollow].followersList;
        for (uint256 i = 0; i < followersList.length; i++) {
            if (followersList[i] == msg.sender) {
                followersList[i] = followersList[followersList.length - 1];
                followersList.pop();
                break;
            }
        }
        
        emit UserUnfollowed(msg.sender, userToUnfollow, block.timestamp);
    }
    
    /**
     * @dev Get reviews for an NFT
     * @param nftContract NFT contract address
     * @param tokenId Token ID
     * @return Array of reviews
     */
    function getNFTReviews(address nftContract, uint256 tokenId) external view returns (Review[] memory) {
        bytes32 nftKey = keccak256(abi.encodePacked(nftContract, tokenId));
        return nftReviews[nftKey];
    }
    
    /**
     * @dev Get NFT rating statistics
     * @param nftContract NFT contract address
     * @param tokenId Token ID
     * @return totalRatings Total number of ratings
     * @return averageRating Average rating (1-5)
     * @return reviewCount Number of reviews
     */
    function getNFTRating(address nftContract, uint256 tokenId) external view returns (
        uint256 totalRatings,
        uint256 averageRating,
        uint256 reviewCount
    ) {
        bytes32 nftKey = keccak256(abi.encodePacked(nftContract, tokenId));
        NFTRating storage rating = nftRatings[nftKey];
        
        totalRatings = rating.totalRatings;
        reviewCount = rating.reviewCount;
        
        if (rating.totalRatings > 0) {
            averageRating = (rating.sumOfRatings * 100) / rating.totalRatings; // Return as percentage for precision
        }
    }
    
    /**
     * @dev Get user profile
     * @param user User address
     * @return Profile information
     */
    function getUserProfile(address user) external view returns (UserProfile memory) {
        return userProfiles[user];
    }
    
    /**
     * @dev Get users that a user is following
     * @param user User address
     * @return Array of addresses being followed
     */
    function getFollowing(address user) external view returns (address[] memory) {
        return userFollows[user].followingList;
    }
    
    /**
     * @dev Get followers of a user
     * @param user User address
     * @return Array of follower addresses
     */
    function getFollowers(address user) external view returns (address[] memory) {
        return userFollows[user].followersList;
    }
    
    /**
     * @dev Check if user A follows user B
     * @param follower User A
     * @param following User B
     * @return True if A follows B
     */
    function isFollowing(address follower, address following) external view returns (bool) {
        return userFollows[follower].following[following];
    }
    
    /**
     * @dev Get rating distribution for an NFT
     * @param nftContract NFT contract address
     * @param tokenId Token ID
     * @return Array of rating counts [1-star, 2-star, 3-star, 4-star, 5-star]
     */
    function getRatingDistribution(address nftContract, uint256 tokenId) external view returns (uint256[5] memory) {
        bytes32 nftKey = keccak256(abi.encodePacked(nftContract, tokenId));
        NFTRating storage rating = nftRatings[nftKey];
        
        return [
            rating.ratingDistribution[1],
            rating.ratingDistribution[2],
            rating.ratingDistribution[3],
            rating.ratingDistribution[4],
            rating.ratingDistribution[5]
        ];
    }
    
    /**
     * @dev Get top-rated NFTs (simplified - would need more complex logic for production)
     * @param count Number of top NFTs to return
     * @return contracts Array of NFT contract addresses
     * @return tokenIds Array of token IDs
     * @return ratings Array of average ratings
     */
    function getTopRatedNFTs(uint256 count) external view returns (
        address[] memory contracts,
        uint256[] memory tokenIds,
        uint256[] memory ratings
    ) {
        // This is a simplified implementation
        // In production, you'd want to maintain a sorted list or use events to track top NFTs
        contracts = new address[](0);
        tokenIds = new uint256[](0);
        ratings = new uint256[](0);
    }
    
    /**
     * @dev Verify a user (admin function)
     * @param user User to verify
     */
    function verifyUser(address user) external onlyOwner {
        require(registeredUsers[user], "User not registered");
        userProfiles[user].isVerified = true;
    }
    
    /**
     * @dev Get follow data for a user
     * @param user User address
     * @return followers Array of follower addresses
     * @return following Array of addresses the user is following
     * @return followerCount Number of followers
     * @return followingCount Number of users being followed
     */
    function getUserFollows(address user) external view returns (
        address[] memory followers,
        address[] memory following,
        uint256 followerCount,
        uint256 followingCount
    ) {
        FollowData storage data = userFollows[user];
        return (data.followersList, data.followingList, data.followersList.length, data.followingList.length);
    }
}
