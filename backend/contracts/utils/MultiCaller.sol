// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/Address.sol";
import "../interfaces/IMultiCall.sol";

/**
 * @title MultiCaller
 * @dev Utility contract to batch multiple calls using Somnia's MultiCallV3
 * This significantly reduces gas costs by minimizing transaction overhead
 */
contract MultiCaller {
    using Address for address;
    
    // Somnia's MultiCallV3 contract address
    address public constant MULTICALL_V3 = 0x841b8199E6d3Db3C6f264f6C2bd8848b3cA64223;
    
    /**
     * @dev Executes multiple calls in a single transaction
     * @param calls Array of call operations (target and data)
     * @return results Array of call results
     */
    function multiCall(IMultiCall.Call[] memory calls) public returns (bytes[] memory results) {
        // Execute all calls using Somnia's MultiCallV3
        (, bytes[] memory returnData) = IMultiCall(MULTICALL_V3).aggregate(calls);
        return returnData;
    }
    
    /**
     * @dev Creates a rental transaction with multiple operations batched together
     * @param nftContract Address of the NFT contract
     * @param tokenId ID of the NFT to rent
     * @param user Address that will receive rental access
     * @param expires Unix timestamp when rental expires
     * @return calls Array of calls to be executed
     */
    function createRentalCalls(
        address nftContract,
        uint256 tokenId,
        address user,
        uint64 expires
    ) public view returns (IMultiCall.Call[] memory) {
        IMultiCall.Call[] memory calls = new IMultiCall.Call[](2);
        
        // Call 1: Approve the rental contract to manage the NFT (if not already approved)
        calls[0] = IMultiCall.Call({
            target: nftContract,
            callData: abi.encodeWithSignature(
                "approve(address,uint256)",
                address(this),
                tokenId
            )
        });
        
        // Call 2: Set the user for the NFT (ERC-4907 standard)
        calls[1] = IMultiCall.Call({
            target: nftContract,
            callData: abi.encodeWithSignature(
                "setUser(uint256,address,uint64)",
                tokenId,
                user,
                expires
            )
        });
        
        return calls;
    }
}
