// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../interfaces/IPriceOracle.sol";

/**
 * @title DIAPriceOracle
 * @dev Price oracle implementation using DIA Oracle for NFT valuation
 */
contract DIAPriceOracle is IPriceOracle, Ownable {
    // DIA Oracle address on Somnia
    address public constant DIA_ORACLE = 0xbA0E0750A56e995506CA458b2BdD752754CF39C4;
    
    // Mapping of NFT contract => base price multiplier
    mapping(address => uint256) public basePriceMultipliers;
    
    // Mapping of NFT contract => token ID => custom price
    mapping(address => mapping(uint256 => uint256)) public customPrices;
    
    // Oracle usage fee (in wei)
    uint256 public oracleFee = 0.001 ether;
    
    // Minimum price per second (to prevent dust attacks)
    uint256 public constant MIN_PRICE_PER_SECOND = 0.000001 ether;
    
    // Maximum price per second (to prevent excessive pricing)
    uint256 public constant MAX_PRICE_PER_SECOND = 1 ether;
    
    // Default price per second (fallback when DIA Oracle fails)
    uint256 public constant DEFAULT_PRICE_PER_SECOND = 0.0001 ether;
    
    // Event emitted when a price is fetched
    event PriceFetched(address indexed nftContract, uint256 indexed tokenId, uint256 price);
    
    // Event emitted when custom price is set
    event CustomPriceSet(address indexed nftContract, uint256 indexed tokenId, uint256 price);
    
    /**
     * @dev Set base price multiplier for an NFT collection
     * @param nftContract Address of the NFT contract
     * @param multiplier Base price multiplier (1e18 = 1x)
     */
    function setBasePriceMultiplier(address nftContract, uint256 multiplier) external onlyOwner {
        require(multiplier > 0, "Multiplier must be greater than 0");
        basePriceMultipliers[nftContract] = multiplier;
    }
    
    /**
     * @dev Set custom price for a specific NFT
     * @param nftContract Address of the NFT contract
     * @param tokenId ID of the NFT
     * @param price Custom price per second (in wei)
     */
    function setCustomPrice(address nftContract, uint256 tokenId, uint256 price) external {
        require(price >= MIN_PRICE_PER_SECOND && price <= MAX_PRICE_PER_SECOND, "Price out of range");
        
        // Check authorization - only the owner of the NFT can set custom price
        require(
            msg.sender == IERC721(nftContract).ownerOf(tokenId),
            "Not authorized"
        );
        
        customPrices[nftContract][tokenId] = price;
        emit CustomPriceSet(nftContract, tokenId, price);
    }
    
    /**
     * @dev Get the rental price per second for an NFT
     * @param nftContract Address of the NFT contract
     * @param tokenId ID of the NFT
     * @return pricePerSecond Price per second in wei
     */
    function getPrice(address nftContract, uint256 tokenId) 
        external 
        payable 
        override 
        returns (uint256 pricePerSecond) 
    {
        require(msg.value >= oracleFee, "Insufficient oracle fee");
        
        // Return custom price if set
        if (customPrices[nftContract][tokenId] > 0) {
            return customPrices[nftContract][tokenId];
        }
        
        // Get base price from DIA Oracle
        (bool success, bytes memory data) = DIA_ORACLE.call{value: msg.value}(
            abi.encodeWithSignature(
                "getValue(string)",
                string(abi.encodePacked("NFT/", nftContract, "/", tokenId))
            )
        );
        
        uint256 basePrice;
        if (success) {
            basePrice = abi.decode(data, (uint256));
        } else {
            // Fallback to default price for testing
            basePrice = DEFAULT_PRICE_PER_SECOND;
        }
        uint256 multiplier = basePriceMultipliers[nftContract];
        
        // Apply multiplier if set (defaults to 1x)
        if (multiplier == 0) {
            multiplier = 1e18;
        }
        
        pricePerSecond = (basePrice * multiplier) / 1e18;
        
        // Ensure price is within bounds
        if (pricePerSecond < MIN_PRICE_PER_SECOND) {
            pricePerSecond = MIN_PRICE_PER_SECOND;
        } else if (pricePerSecond > MAX_PRICE_PER_SECOND) {
            pricePerSecond = MAX_PRICE_PER_SECOND;
        }
        
        emit PriceFetched(nftContract, tokenId, pricePerSecond);
        return pricePerSecond;
    }
    
    /**
     * @dev Get price without making oracle call (for estimation)
     * @param nftContract Address of the NFT contract
     * @param tokenId ID of the NFT
     * @return pricePerSecond Estimated price per second in wei
     */
    function getEstimatedPrice(address nftContract, uint256 tokenId) 
        external 
        view 
        returns (uint256 pricePerSecond) 
    {
        // Return custom price if set
        if (customPrices[nftContract][tokenId] > 0) {
            return customPrices[nftContract][tokenId];
        }
        
        // Return default price based on collection multiplier
        uint256 multiplier = basePriceMultipliers[nftContract];
        if (multiplier == 0) {
            multiplier = 1e18;
        }
        
        // Use a default base price for estimation
        uint256 defaultBasePrice = 0.00001 ether; // 0.00001 ETH per second
        pricePerSecond = (defaultBasePrice * multiplier) / 1e18;
        
        // Ensure price is within bounds
        if (pricePerSecond < MIN_PRICE_PER_SECOND) {
            pricePerSecond = MIN_PRICE_PER_SECOND;
        } else if (pricePerSecond > MAX_PRICE_PER_SECOND) {
            pricePerSecond = MAX_PRICE_PER_SECOND;
        }
        
        return pricePerSecond;
    }
    
    /**
     * @dev Batch set custom prices for multiple NFTs
     * @param nftContracts Array of NFT contract addresses
     * @param tokenIds Array of token IDs
     * @param prices Array of prices per second
     */
    function batchSetCustomPrices(
        address[] calldata nftContracts,
        uint256[] calldata tokenIds,
        uint256[] calldata prices
    ) external {
        require(
            nftContracts.length == tokenIds.length && 
            tokenIds.length == prices.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < nftContracts.length; i++) {
            require(
                prices[i] >= MIN_PRICE_PER_SECOND && prices[i] <= MAX_PRICE_PER_SECOND,
                "Price out of range"
            );
            
            // Check authorization
            require(
                msg.sender == Ownable(nftContracts[i]).owner() ||
                msg.sender == IERC721(nftContracts[i]).ownerOf(tokenIds[i]),
                "Not authorized"
            );
            
            customPrices[nftContracts[i]][tokenIds[i]] = prices[i];
            emit CustomPriceSet(nftContracts[i], tokenIds[i], prices[i]);
        }
    }
    
    /**
     * @dev Withdraw accumulated oracle fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Set the oracle usage fee
     * @param fee New fee amount in wei
     */
    function setOracleFee(uint256 fee) external onlyOwner {
        require(fee <= 0.01 ether, "Fee too high");
        oracleFee = fee;
    }
    
    /**
     * @dev Update price for an NFT (required by interface)
     */
    function updatePrice(address nftContract, uint256 tokenId, uint256 newPrice) external override onlyOwner {
        require(newPrice >= MIN_PRICE_PER_SECOND && newPrice <= MAX_PRICE_PER_SECOND, "Invalid price");
        customPrices[nftContract][tokenId] = newPrice;
    }
    
    /**
     * @dev Get last updated timestamp for an NFT price (required by interface)
     */
    function getLastUpdated(address nftContract, uint256 tokenId) external view override returns (uint256 timestamp) {
        // For simplicity, return current timestamp
        // In a real implementation, this would track when prices were last updated
        return block.timestamp;
    }
    
    /**
     * @dev Emergency function to recover stuck funds
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
