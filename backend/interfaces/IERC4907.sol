// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title IERC4907
 * @dev Interface for ERC-4907 Rental NFT Standard
 * Allows NFTs to have users separate from owners for rental purposes
 */
interface IERC4907 is IERC721 {
    /**
     * @dev Emitted when the user of an NFT is changed or expires is changed
     * @param tokenId The NFT to get the user address for
     * @param user The new user of the NFT
     * @param expires UNIX timestamp, the new user could use the NFT before expires
     */
    event UpdateUser(uint256 indexed tokenId, address indexed user, uint64 expires);

    /**
     * @dev Set the user and expires of an NFT
     * @param tokenId The NFT to set the user for
     * @param user The new user of the NFT
     * @param expires UNIX timestamp, the new user could use the NFT before expires
     */
    function setUser(uint256 tokenId, address user, uint64 expires) external;

    /**
     * @dev Get the user address of an NFT
     * @param tokenId The NFT to get the user address for
     * @return The user address for this NFT
     */
    function userOf(uint256 tokenId) external view returns (address);

    /**
     * @dev Get the user expires of an NFT
     * @param tokenId The NFT to get the user expires for
     * @return The user expires for this NFT
     */
    function userExpires(uint256 tokenId) external view returns (uint256);
}

