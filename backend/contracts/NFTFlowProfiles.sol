// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title NFTFlowProfiles
 * @dev On-chain social profiles with reputation and attestation system
 * @notice Manages user profiles, reputation scores, and social attestations
 */
contract NFTFlowProfiles is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Profile structure
    struct Profile {
        string avatarURI;
        string bio;
        uint256 reputationScore;
        uint256 rentalCount;
        uint256 disputeCount;
        uint256 streak;
        uint256 lastActivity;
        bool verified;
        uint256 createdAt;
    }
    
    // Attestation structure
    struct Attestation {
        string attestationType;
        string attestationData;
        address createdBy;
        uint256 createdAt;
        bool active;
    }
    
    // Badge structure
    struct Badge {
        string badgeType;
        string description;
        uint256 earnedAt;
        bool active;
    }
    
    // Storage mappings
    mapping(address => Profile) public profiles;
    mapping(address => Attestation[]) public userAttestations;
    mapping(address => Badge[]) public userBadges;
    mapping(bytes32 => bool) public usedSignatures;
    mapping(address => bool) public trustedSigners;
    
    // Counters
    Counters.Counter private _attestationIdCounter;
    Counters.Counter private _badgeIdCounter;
    
    // Events
    event ProfileUpdated(address indexed user, string avatarURI, string bio);
    event AttestationAdded(address indexed user, string attestationType, string attestationData);
    event BadgeEarned(address indexed user, string badgeType, string description);
    event ReputationUpdated(address indexed user, uint256 newScore, string reason);
    event TrustedSignerAdded(address indexed signer);
    event TrustedSignerRemoved(address indexed signer);
    
    // Modifiers
    modifier onlyTrustedSigner() {
        require(trustedSigners[msg.sender] || msg.sender == owner(), "Not a trusted signer");
        _;
    }
    
    modifier profileExists(address user) {
        require(profiles[user].createdAt > 0, "Profile does not exist");
        _;
    }
    
    /**
     * @dev Set or update user profile
     * @param avatarURI IPFS URI for avatar image
     * @param bio User biography text
     */
    function setProfile(string calldata avatarURI, string calldata bio) external {
        Profile storage profile = profiles[msg.sender];
        
        // Create profile if it doesn't exist
        if (profile.createdAt == 0) {
            profile.createdAt = block.timestamp;
            profile.reputationScore = 500; // Starting reputation
        }
        
        profile.avatarURI = avatarURI;
        profile.bio = bio;
        profile.lastActivity = block.timestamp;
        
        emit ProfileUpdated(msg.sender, avatarURI, bio);
    }
    
    /**
     * @dev Update user reputation based on rental outcome
     * @param user User address
     * @param success Whether the rental was successful
     * @param dispute Whether there was a dispute
     * @param reason Reason for reputation change
     */
    function updateReputation(
        address user, 
        bool success, 
        bool dispute, 
        string calldata reason
    ) external onlyOwner {
        Profile storage profile = profiles[user];
        
        if (profile.createdAt == 0) {
            profile.createdAt = block.timestamp;
            profile.reputationScore = 500;
        }
        
        if (success) {
            profile.reputationScore += 10;
            profile.rentalCount += 1;
            profile.streak += 1;
            
            // Award consistency badge for streaks
            if (profile.streak % 10 == 0) {
                _awardBadge(user, "Consistency", "Maintained rental streak");
            }
            
            // Award milestone badges
            if (profile.rentalCount == 10) {
                _awardBadge(user, "Rental Novice", "Completed 10 rentals");
            } else if (profile.rentalCount == 50) {
                _awardBadge(user, "Rental Expert", "Completed 50 rentals");
            } else if (profile.rentalCount == 100) {
                _awardBadge(user, "Rental Master", "Completed 100 rentals");
            }
            
        } else if (dispute) {
            profile.disputeCount += 1;
            profile.reputationScore = profile.reputationScore > 20 ? 
                profile.reputationScore - 20 : 0;
            profile.streak = 0;
        }
        
        profile.lastActivity = block.timestamp;
        
        emit ReputationUpdated(user, profile.reputationScore, reason);
    }
    
    /**
     * @dev Add attestation to user profile
     * @param user User address to attest
     * @param attestationType Type of attestation
     * @param attestationData Attestation data
     * @param signature Signature from trusted signer
     */
    function addAttestation(
        address user,
        string calldata attestationType,
        string calldata attestationData,
        bytes calldata signature
    ) external onlyTrustedSigner {
        bytes32 messageHash = keccak256(abi.encodePacked(
            user, 
            attestationType, 
            attestationData, 
            block.chainid
        ));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32", 
            messageHash
        ));
        
        address signer = recoverSigner(ethSignedMessageHash, signature);
        require(signer == msg.sender, "Invalid signature");
        require(!usedSignatures[messageHash], "Signature already used");
        
        usedSignatures[messageHash] = true;
        
        userAttestations[user].push(Attestation({
            attestationType: attestationType,
            attestationData: attestationData,
            createdBy: msg.sender,
            createdAt: block.timestamp,
            active: true
        }));
        
        emit AttestationAdded(user, attestationType, attestationData);
    }
    
    /**
     * @dev Get user profile with attestations and badges
     * @param user User address
     * @return profile User profile data
     * @return attestations User attestations
     * @return badges User badges
     */
    function getUserProfile(address user) external view returns (
        Profile memory profile,
        Attestation[] memory attestations,
        Badge[] memory badges
    ) {
        profile = profiles[user];
        attestations = userAttestations[user];
        badges = userBadges[user];
    }
    
    /**
     * @dev Get user reputation score
     * @param user User address
     * @return reputation score
     */
    function getReputationScore(address user) external view returns (uint256) {
        return profiles[user].reputationScore;
    }
    
    /**
     * @dev Check if user is verified
     * @param user User address
     * @return true if verified
     */
    function isVerified(address user) external view returns (bool) {
        return profiles[user].verified;
    }
    
    /**
     * @dev Verify a user (only owner)
     * @param user User address to verify
     */
    function verifyUser(address user) external onlyOwner {
        profiles[user].verified = true;
        _awardBadge(user, "Verified", "Profile verified by NFTFlow");
    }
    
    /**
     * @dev Add trusted signer
     * @param signer Address to add as trusted signer
     */
    function addTrustedSigner(address signer) external onlyOwner {
        trustedSigners[signer] = true;
        emit TrustedSignerAdded(signer);
    }
    
    /**
     * @dev Remove trusted signer
     * @param signer Address to remove from trusted signers
     */
    function removeTrustedSigner(address signer) external onlyOwner {
        trustedSigners[signer] = false;
        emit TrustedSignerRemoved(signer);
    }
    
    /**
     * @dev Award badge to user
     * @param user User address
     * @param badgeType Type of badge
     * @param description Badge description
     */
    function _awardBadge(
        address user, 
        string memory badgeType, 
        string memory description
    ) internal {
        userBadges[user].push(Badge({
            badgeType: badgeType,
            description: description,
            earnedAt: block.timestamp,
            active: true
        }));
        
        emit BadgeEarned(user, badgeType, description);
    }
    
    /**
     * @dev Recover signer from signature
     * @param hash Message hash
     * @param signature Signature bytes
     * @return signer address
     */
    function recoverSigner(bytes32 hash, bytes memory signature) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(hash, v, r, s);
    }
    
    /**
     * @dev Split signature into components
     * @param sig Signature bytes
     * @return r, s, v signature components
     */
    function splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");
        
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
    
    /**
     * @dev Get profile statistics
     * @param user User address
     * @return rentalCount Number of rentals
     * @return disputeCount Number of disputes
     * @return streak Current streak
     * @return lastActivity Last activity timestamp
     */
    function getProfileStats(address user) external view returns (
        uint256 rentalCount,
        uint256 disputeCount,
        uint256 streak,
        uint256 lastActivity
    ) {
        Profile memory profile = profiles[user];
        return (profile.rentalCount, profile.disputeCount, profile.streak, profile.lastActivity);
    }
    
    /**
     * @dev Get all attestations for a user
     * @param user User address
     * @return attestations array
     */
    function getAttestations(address user) external view returns (Attestation[] memory) {
        return userAttestations[user];
    }
    
    /**
     * @dev Get all badges for a user
     * @param user User address
     * @return badges array
     */
    function getBadges(address user) external view returns (Badge[] memory) {
        return userBadges[user];
    }
    
    /**
     * @dev Check if signature has been used
     * @param signature Signature to check
     * @return true if used
     */
    function isSignatureUsed(bytes32 signature) external view returns (bool) {
        return usedSignatures[signature];
    }
    
    /**
     * @dev Get contract version
     * @return version string
     */
    function version() external pure returns (string memory) {
        return "1.0.0";
    }
}
