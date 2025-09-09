// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../interfaces/IERC4907.sol";

/**
 * @title MockERC4907
 * @dev Mock implementation of ERC-4907 for testing purposes
 */
contract MockERC4907 is ERC721, IERC4907 {
    // Mapping from token ID to user info
    mapping(uint256 => UserInfo) private _users;
    
    struct UserInfo {
        address user;   // address of user role
        uint64 expires; // unix timestamp, user expires
    }
    
    constructor() ERC721("MockERC4907", "MOCK4907") {}
    
    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }
    
    function setUser(uint256 tokenId, address user, uint64 expires) public virtual override {
        require(_isApprovedOrOwner(msg.sender, tokenId), "ERC4907: transfer caller is not owner nor approved");
        UserInfo storage info = _users[tokenId];
        info.user = user;
        info.expires = expires;
        emit UpdateUser(tokenId, user, expires);
    }
    
    function userOf(uint256 tokenId) public view virtual override returns (address) {
        if (uint256(_users[tokenId].expires) >= block.timestamp) {
            return _users[tokenId].user;
        } else {
            return address(0);
        }
    }
    
    function userExpires(uint256 tokenId) public view virtual override returns (uint256) {
        return _users[tokenId].expires;
    }
    
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, IERC165) returns (bool) {
        return interfaceId == type(IERC4907).interfaceId || super.supportsInterface(interfaceId);
    }
}
