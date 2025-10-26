// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ConfigRegistry
 * @dev On-chain configuration registry with governance controls
 * @notice Manages protocol parameters with timelock and upgrade mechanisms
 */
contract ConfigRegistry is AccessControl, UUPSUpgradeable, ReentrancyGuard, Pausable {
    using EnumerableSet for EnumerableSet.Bytes32Set;
    
    // Role definitions
    bytes32 public constant TIMELOCK_ROLE = keccak256("TIMELOCK_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    
    // Configuration value structure
    struct ConfigValue {
        uint256 value;
        uint256 minValue;
        uint256 maxValue;
        uint256 updatedAt;
        address updatedBy;
        string description;
    }
    
    // Configuration keys (using keccak256 for gas efficiency)
    bytes32 public constant PLATFORM_FEE = keccak256("PLATFORM_FEE");
    bytes32 public constant MIN_RENTAL_DURATION = keccak256("MIN_RENTAL_DURATION");
    bytes32 public constant MAX_RENTAL_DURATION = keccak256("MAX_RENTAL_DURATION");
    bytes32 public constant COLLATERAL_MULTIPLIER = keccak256("COLLATERAL_MULTIPLIER");
    bytes32 public constant REPUTATION_THRESHOLD = keccak256("REPUTATION_THRESHOLD");
    bytes32 public constant MAX_RENTAL_PRICE = keccak256("MAX_RENTAL_PRICE");
    bytes32 public constant MIN_RENTAL_PRICE = keccak256("MIN_RENTAL_PRICE");
    bytes32 public constant DISPUTE_TIMEOUT = keccak256("DISPUTE_TIMEOUT");
    bytes32 public constant EMERGENCY_PAUSE_DURATION = keccak256("EMERGENCY_PAUSE_DURATION");
    
    // Storage
    mapping(bytes32 => ConfigValue) public config;
    EnumerableSet.Bytes32Set private configKeys;
    
    // Timelock for upgrades
    address private _pendingImplementation;
    uint256 private _upgradeScheduledAt;
    uint256 public constant UPGRADE_DELAY = 2 days;
    
    // Emergency pause mechanism
    uint256 private _emergencyPauseUntil;
    bool private _emergencyPaused;
    
    // Events
    event ConfigUpdated(bytes32 indexed key, uint256 value, uint256 updatedAt, address updatedBy);
    event UpgradeScheduled(address newImplementation, uint256 executeAfter);
    event UpgradeExecuted(address newImplementation);
    event EmergencyPauseActivated(uint256 until);
    event EmergencyPauseDeactivated();
    event OracleUpdated(bytes32 indexed key, uint256 value, address oracle);
    
    // Errors
    error ConfigValueOutOfBounds(bytes32 key, uint256 value, uint256 minValue, uint256 maxValue);
    error UpgradeNotScheduled();
    error UpgradeDelayNotPassed();
    error EmergencyPauseActive();
    error InvalidConfigKey(bytes32 key);
    error UnauthorizedOracle(address caller);
    
    /**
     * @dev Initialize the contract
     * @param admin Address with admin role
     * @param timelock Address with timelock role
     * @param emergency Address with emergency role
     */
    function initialize(
        address admin,
        address timelock,
        address emergency
    ) public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(TIMELOCK_ROLE, timelock);
        _grantRole(UPGRADER_ROLE, timelock);
        _grantRole(EMERGENCY_ROLE, emergency);
        
        // Initialize default values
        _setConfig(PLATFORM_FEE, 250, 0, 1000, "Platform fee in basis points (2.5%)");
        _setConfig(MIN_RENTAL_DURATION, 60, 1, 300, "Minimum rental duration in seconds");
        _setConfig(MAX_RENTAL_DURATION, 2592000, 3600, 31536000, "Maximum rental duration in seconds (30 days)");
        _setConfig(COLLATERAL_MULTIPLIER, 200, 100, 500, "Collateral multiplier in basis points (2.0x)");
        _setConfig(REPUTATION_THRESHOLD, 500, 0, 1000, "Minimum reputation score for certain actions");
        _setConfig(MAX_RENTAL_PRICE, 1000000000000000000000, 0, type(uint256).max, "Maximum rental price per second in wei");
        _setConfig(MIN_RENTAL_PRICE, 1000000000000000, 0, type(uint256).max, "Minimum rental price per second in wei");
        _setConfig(DISPUTE_TIMEOUT, 604800, 3600, 2592000, "Dispute timeout in seconds (7 days)");
        _setConfig(EMERGENCY_PAUSE_DURATION, 86400, 3600, 604800, "Emergency pause duration in seconds (1 day)");
    }
    
    /**
     * @dev Update configuration parameter (timelock required)
     * @param key Configuration key
     * @param value New value
     * @param minValue Minimum allowed value
     * @param maxValue Maximum allowed value
     */
    function updateConfig(
        bytes32 key,
        uint256 value,
        uint256 minValue,
        uint256 maxValue
    ) external onlyRole(TIMELOCK_ROLE) whenNotPaused {
        if (value < minValue || value > maxValue) {
            revert ConfigValueOutOfBounds(key, value, minValue, maxValue);
        }
        
        _setConfig(key, value, minValue, maxValue, config[key].description);
    }
    
    /**
     * @dev Update configuration parameter with description
     * @param key Configuration key
     * @param value New value
     * @param minValue Minimum allowed value
     * @param maxValue Maximum allowed value
     * @param description Description of the parameter
     */
    function updateConfigWithDescription(
        bytes32 key,
        uint256 value,
        uint256 minValue,
        uint256 maxValue,
        string calldata description
    ) external onlyRole(TIMELOCK_ROLE) whenNotPaused {
        if (value < minValue || value > maxValue) {
            revert ConfigValueOutOfBounds(key, value, minValue, maxValue);
        }
        
        _setConfig(key, value, minValue, maxValue, description);
    }
    
    /**
     * @dev Oracle update (for automated parameter adjustments)
     * @param key Configuration key
     * @param value New value
     */
    function oracleUpdate(bytes32 key, uint256 value) external onlyRole(ORACLE_ROLE) {
        ConfigValue storage configValue = config[key];
        if (configValue.value == 0) {
            revert InvalidConfigKey(key);
        }
        
        if (value < configValue.minValue || value > configValue.maxValue) {
            revert ConfigValueOutOfBounds(key, value, configValue.minValue, configValue.maxValue);
        }
        
        configValue.value = value;
        configValue.updatedAt = block.timestamp;
        configValue.updatedBy = msg.sender;
        
        emit OracleUpdated(key, value, msg.sender);
    }
    
    /**
     * @dev Get configuration value
     * @param key Configuration key
     * @return ConfigValue struct
     */
    function getConfig(bytes32 key) external view returns (ConfigValue memory) {
        return config[key];
    }
    
    /**
     * @dev Get all configuration keys
     * @return Array of configuration keys
     */
    function getConfigKeys() external view returns (bytes32[] memory) {
        return configKeys.values();
    }
    
    /**
     * @dev Check if configuration key exists
     * @param key Configuration key
     * @return True if key exists
     */
    function hasConfig(bytes32 key) external view returns (bool) {
        return configKeys.contains(key);
    }
    
    /**
     * @dev Get configuration value as uint256
     * @param key Configuration key
     * @return Configuration value
     */
    function getConfigValue(bytes32 key) external view returns (uint256) {
        return config[key].value;
    }
    
    /**
     * @dev Batch get configuration values
     * @param keys Array of configuration keys
     * @return Array of configuration values
     */
    function getConfigValues(bytes32[] calldata keys) external view returns (uint256[] memory) {
        uint256[] memory values = new uint256[](keys.length);
        for (uint256 i = 0; i < keys.length; i++) {
            values[i] = config[keys[i]].value;
        }
        return values;
    }
    
    /**
     * @dev Activate emergency pause
     */
    function activateEmergencyPause() external onlyRole(EMERGENCY_ROLE) {
        uint256 pauseDuration = config[EMERGENCY_PAUSE_DURATION].value;
        _emergencyPauseUntil = block.timestamp + pauseDuration;
        _emergencyPaused = true;
        _pause();
        
        emit EmergencyPauseActivated(_emergencyPauseUntil);
    }
    
    /**
     * @dev Deactivate emergency pause
     */
    function deactivateEmergencyPause() external onlyRole(EMERGENCY_ROLE) {
        _emergencyPauseUntil = 0;
        _emergencyPaused = false;
        _unpause();
        
        emit EmergencyPauseDeactivated();
    }
    
    /**
     * @dev Check if emergency pause is active
     * @return True if emergency pause is active
     */
    function isEmergencyPaused() external view returns (bool) {
        return _emergencyPaused && block.timestamp < _emergencyPauseUntil;
    }
    
    /**
     * @dev Get emergency pause status
     * @return paused True if paused
     * @return until Timestamp when pause ends
     */
    function getEmergencyPauseStatus() external view returns (bool paused, uint256 until) {
        return (_emergencyPaused, _emergencyPauseUntil);
    }
    
    /**
     * @dev Schedule contract upgrade
     * @param newImplementation Address of new implementation
     */
    function scheduleUpgrade(address newImplementation) external onlyRole(UPGRADER_ROLE) {
        _pendingImplementation = newImplementation;
        _upgradeScheduledAt = block.timestamp + UPGRADE_DELAY;
        
        emit UpgradeScheduled(newImplementation, _upgradeScheduledAt);
    }
    
    /**
     * @dev Execute scheduled upgrade
     */
    function executeUpgrade() external onlyRole(UPGRADER_ROLE) {
        if (_pendingImplementation == address(0)) {
            revert UpgradeNotScheduled();
        }
        
        if (block.timestamp < _upgradeScheduledAt) {
            revert UpgradeDelayNotPassed();
        }
        
        address implementation = _pendingImplementation;
        _pendingImplementation = address(0);
        _upgradeScheduledAt = 0;
        
        _upgradeTo(implementation);
        
        emit UpgradeExecuted(implementation);
    }
    
    /**
     * @dev Get upgrade status
     * @return pendingImplementation Address of pending implementation
     * @return executeAfter Timestamp when upgrade can be executed
     */
    function getUpgradeStatus() external view returns (address pendingImplementation, uint256 executeAfter) {
        return (_pendingImplementation, _upgradeScheduledAt);
    }
    
    /**
     * @dev Cancel scheduled upgrade
     */
    function cancelUpgrade() external onlyRole(UPGRADER_ROLE) {
        _pendingImplementation = address(0);
        _upgradeScheduledAt = 0;
    }
    
    /**
     * @dev Grant oracle role to address
     * @param oracle Address to grant oracle role
     */
    function grantOracleRole(address oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(ORACLE_ROLE, oracle);
    }
    
    /**
     * @dev Revoke oracle role from address
     * @param oracle Address to revoke oracle role
     */
    function revokeOracleRole(address oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(ORACLE_ROLE, oracle);
    }
    
    /**
     * @dev Internal function to set configuration
     */
    function _setConfig(
        bytes32 key,
        uint256 value,
        uint256 minValue,
        uint256 maxValue,
        string memory description
    ) internal {
        config[key] = ConfigValue({
            value: value,
            minValue: minValue,
            maxValue: maxValue,
            updatedAt: block.timestamp,
            updatedBy: msg.sender,
            description: description
        });
        
        configKeys.add(key);
        
        emit ConfigUpdated(key, value, block.timestamp, msg.sender);
    }
    
    /**
     * @dev Authorize upgrade (UUPS)
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {
        // Upgrade authorization is handled by scheduleUpgrade/executeUpgrade
    }
    
    /**
     * @dev Modifier to check emergency pause
     */
    modifier whenNotEmergencyPaused() {
        if (_emergencyPaused && block.timestamp < _emergencyPauseUntil) {
            revert EmergencyPauseActive();
        }
        _;
    }
    
    /**
     * @dev Get contract version
     * @return Version string
     */
    function version() external pure returns (string memory) {
        return "1.0.0";
    }
    
    /**
     * @dev Get contract info
     * @return info Struct with contract information
     */
    function getContractInfo() external view returns (
        string memory version,
        uint256 configCount,
        bool paused,
        bool emergencyPaused,
        address pendingImplementation,
        uint256 upgradeScheduledAt
    ) {
        return (
            "1.0.0",
            configKeys.length(),
            paused(),
            _emergencyPaused,
            _pendingImplementation,
            _upgradeScheduledAt
        );
    }
}
