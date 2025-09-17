// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library NFTFlowErrors {
    // Access control errors
    error UnauthorizedAccess(address caller, address required);
    error NotOwner(address caller, address owner);
    error NotLender(address caller, address lender);
    error NotTenant(address caller, address tenant);
    
    // Rental errors
    error RentalNotFound(bytes32 rentalId);
    error RentalAlreadyExists(bytes32 rentalId);
    error RentalNotActive(bytes32 rentalId);
    error RentalNotListed(bytes32 rentalId);
    error RentalNotRented(bytes32 rentalId);
    error InvalidRentalState(bytes32 rentalId, uint8 current, uint8 expected);
    
    // Parameter validation errors
    error InvalidPrice();
    error InvalidDuration(uint256 min, uint256 max, uint256 provided);
    error InvalidCollateral(uint256 required, uint256 provided);
    error InvalidAddress(address addr);
    error InvalidInput();
    
    // Payment errors
    error InsufficientPayment(uint256 required, uint256 provided);
    error PaymentFailed(address token, uint256 amount);
    error StreamNotFound(bytes32 streamId);
    error StreamAlreadyExists(bytes32 streamId);
    
    // Reputation errors
    error ReputationTooLow(uint256 current, uint256 required);
    error CannotUpdateReputation(address caller, address target);
    
    // Protocol errors
    error ProtocolPaused();
    error EmergencyPauseActive();
    error UpgradeFailed(address implementation);
    
    // Oracle errors
    error OraclePriceUnavailable(address nftContract, uint256 tokenId);
    error OracleNotConfigured();
    
    // Dispute errors
    error DisputePeriodExpired(uint256 deadline, uint256 current);
    error DisputeAlreadyResolved(bytes32 disputeId);
    error NotArbitrator(address caller, address arbitrator);
}
