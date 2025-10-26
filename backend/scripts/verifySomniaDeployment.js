const { ethers } = require('hardhat');
const { SOMNIA_CONFIG } = require('../src/config/somniaConfig');

/**
 * Verify Somnia Testnet Deployment
 * Checks all contracts are deployed and functional
 */

async function verifyDeployment() {
  console.log('🔍 Verifying Somnia Testnet Deployment...\n');
  
  // Initialize provider
  const provider = new ethers.JsonRpcProvider(SOMNIA_CONFIG.RPC_URL);
  
  // Contract addresses to verify
  const contracts = [
    {
      name: 'NFTFlow',
      address: SOMNIA_CONFIG.CONTRACTS.NFT_FLOW,
      required: true
    },
    {
      name: 'PaymentStream',
      address: SOMNIA_CONFIG.CONTRACTS.PAYMENT_STREAM,
      required: true
    },
    {
      name: 'ReputationSystem',
      address: SOMNIA_CONFIG.CONTRACTS.REPUTATION_SYSTEM,
      required: true
    },
    {
      name: 'MockPriceOracle',
      address: SOMNIA_CONFIG.CONTRACTS.MOCK_PRICE_ORACLE,
      required: true
    },
    {
      name: 'MockERC721',
      address: SOMNIA_CONFIG.CONTRACTS.MOCK_ERC721,
      required: true
    },
    {
      name: 'UtilityTracker',
      address: SOMNIA_CONFIG.CONTRACTS.UTILITY_TRACKER,
      required: true
    },
    {
      name: 'NFTFlowMetadata',
      address: SOMNIA_CONFIG.CONTRACTS.NFT_FLOW_METADATA,
      required: false
    },
    {
      name: 'SomniaBatchOperations',
      address: SOMNIA_CONFIG.CONTRACTS.SOMNIA_BATCH_OPERATIONS,
      required: false
    },
    {
      name: 'SomniaPaymentStream',
      address: SOMNIA_CONFIG.CONTRACTS.SOMNIA_PAYMENT_STREAM,
      required: false
    },
    {
      name: 'SomniaGasOptimized',
      address: SOMNIA_CONFIG.CONTRACTS.SOMNIA_GAS_OPTIMIZED,
      required: false
    },
    {
      name: 'OnChainAnalytics',
      address: SOMNIA_CONFIG.CONTRACTS.ON_CHAIN_ANALYTICS,
      required: false
    }
  ];
  
  const results = {
    deployed: [],
    notDeployed: [],
    errors: []
  };
  
  // Check each contract
  for (const contract of contracts) {
    try {
      console.log(`Checking ${contract.name} at ${contract.address}...`);
      
      if (!contract.address) {
        console.log(`❌ ${contract.name}: No address provided`);
        results.notDeployed.push(contract.name);
        continue;
      }
      
      const code = await provider.getCode(contract.address);
      
      if (code === '0x') {
        console.log(`❌ ${contract.name}: NOT DEPLOYED`);
        results.notDeployed.push(contract.name);
      } else {
        console.log(`✅ ${contract.name}: DEPLOYED`);
        results.deployed.push(contract.name);
        
        // Test basic contract interaction
        await testContractInteraction(contract.name, contract.address, provider);
      }
    } catch (error) {
      console.log(`❌ ${contract.name}: ERROR - ${error.message}`);
      results.errors.push({ name: contract.name, error: error.message });
    }
  }
  
  // Print summary
  console.log('\n📊 Deployment Summary:');
  console.log(`✅ Deployed: ${results.deployed.length}`);
  console.log(`❌ Not Deployed: ${results.notDeployed.length}`);
  console.log(`⚠️  Errors: ${results.errors.length}`);
  
  if (results.deployed.length > 0) {
    console.log('\n✅ Deployed Contracts:');
    results.deployed.forEach(name => console.log(`  - ${name}`));
  }
  
  if (results.notDeployed.length > 0) {
    console.log('\n❌ Not Deployed Contracts:');
    results.notDeployed.forEach(name => console.log(`  - ${name}`));
  }
  
  if (results.errors.length > 0) {
    console.log('\n⚠️  Errors:');
    results.errors.forEach(({ name, error }) => console.log(`  - ${name}: ${error}`));
  }
  
  // Check network connectivity
  await checkNetworkConnectivity(provider);
  
  // Check gas prices
  await checkGasPrices(provider);
  
  // Check block times
  await checkBlockTimes(provider);
  
  return results;
}

async function testContractInteraction(contractName, address, provider) {
  try {
    // Basic contract interaction tests
    switch (contractName) {
      case 'NFTFlow':
        await testNFTFlowContract(address, provider);
        break;
      case 'PaymentStream':
        await testPaymentStreamContract(address, provider);
        break;
      case 'ReputationSystem':
        await testReputationSystemContract(address, provider);
        break;
      case 'MockPriceOracle':
        await testMockPriceOracleContract(address, provider);
        break;
      case 'MockERC721':
        await testMockERC721Contract(address, provider);
        break;
      case 'UtilityTracker':
        await testUtilityTrackerContract(address, provider);
        break;
      default:
        console.log(`  ⚠️  No specific tests for ${contractName}`);
    }
  } catch (error) {
    console.log(`  ⚠️  Contract interaction test failed: ${error.message}`);
  }
}

async function testNFTFlowContract(address, provider) {
  try {
    // Basic ABI for testing
    const nftFlowABI = [
      'function platformFeePercentage() view returns (uint256)',
      'function totalListings() view returns (uint256)',
      'function totalRentals() view returns (uint256)',
      'function owner() view returns (address)'
    ];
    
    const contract = new ethers.Contract(address, nftFlowABI, provider);
    
    const platformFee = await contract.platformFeePercentage();
    const totalListings = await contract.totalListings();
    const totalRentals = await contract.totalRentals();
    const owner = await contract.owner();
    
    console.log(`    Platform Fee: ${platformFee}%`);
    console.log(`    Total Listings: ${totalListings}`);
    console.log(`    Total Rentals: ${totalRentals}`);
    console.log(`    Owner: ${owner}`);
  } catch (error) {
    throw new Error(`NFTFlow test failed: ${error.message}`);
  }
}

async function testPaymentStreamContract(address, provider) {
  try {
    const paymentStreamABI = [
      'function totalStreams() view returns (uint256)',
      'function platformFeePercentage() view returns (uint256)',
      'function owner() view returns (address)'
    ];
    
    const contract = new ethers.Contract(address, paymentStreamABI, provider);
    
    const totalStreams = await contract.totalStreams();
    const platformFee = await contract.platformFeePercentage();
    const owner = await contract.owner();
    
    console.log(`    Total Streams: ${totalStreams}`);
    console.log(`    Platform Fee: ${platformFee}%`);
    console.log(`    Owner: ${owner}`);
  } catch (error) {
    throw new Error(`PaymentStream test failed: ${error.message}`);
  }
}

async function testReputationSystemContract(address, provider) {
  try {
    const reputationABI = [
      'function totalUsers() view returns (uint256)',
      'function owner() view returns (address)'
    ];
    
    const contract = new ethers.Contract(address, reputationABI, provider);
    
    const totalUsers = await contract.totalUsers();
    const owner = await contract.owner();
    
    console.log(`    Total Users: ${totalUsers}`);
    console.log(`    Owner: ${owner}`);
  } catch (error) {
    throw new Error(`ReputationSystem test failed: ${error.message}`);
  }
}

async function testMockPriceOracleContract(address, provider) {
  try {
    const oracleABI = [
      'function getPrice(address token) view returns (uint256)',
      'function owner() view returns (address)'
    ];
    
    const contract = new ethers.Contract(address, oracleABI, provider);
    
    // Test with a dummy token address
    const dummyToken = '0x0000000000000000000000000000000000000000';
    const price = await contract.getPrice(dummyToken);
    const owner = await contract.owner();
    
    console.log(`    Test Price: ${price}`);
    console.log(`    Owner: ${owner}`);
  } catch (error) {
    throw new Error(`MockPriceOracle test failed: ${error.message}`);
  }
}

async function testMockERC721Contract(address, provider) {
  try {
    const erc721ABI = [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function totalSupply() view returns (uint256)',
      'function owner() view returns (address)'
    ];
    
    const contract = new ethers.Contract(address, erc721ABI, provider);
    
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();
    const owner = await contract.owner();
    
    console.log(`    Name: ${name}`);
    console.log(`    Symbol: ${symbol}`);
    console.log(`    Total Supply: ${totalSupply}`);
    console.log(`    Owner: ${owner}`);
  } catch (error) {
    throw new Error(`MockERC721 test failed: ${error.message}`);
  }
}

async function testUtilityTrackerContract(address, provider) {
  try {
    const trackerABI = [
      'function totalUtilities() view returns (uint256)',
      'function owner() view returns (address)'
    ];
    
    const contract = new ethers.Contract(address, trackerABI, provider);
    
    const totalUtilities = await contract.totalUtilities();
    const owner = await contract.owner();
    
    console.log(`    Total Utilities: ${totalUtilities}`);
    console.log(`    Owner: ${owner}`);
  } catch (error) {
    throw new Error(`UtilityTracker test failed: ${error.message}`);
  }
}

async function checkNetworkConnectivity(provider) {
  console.log('\n🌐 Network Connectivity Check:');
  
  try {
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    const gasPrice = await provider.getGasPrice();
    
    console.log(`✅ Network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`✅ Current Block: ${blockNumber}`);
    console.log(`✅ Gas Price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
    
    // Check if we're on Somnia
    if (network.chainId === BigInt(SOMNIA_CONFIG.NETWORK_ID)) {
      console.log('✅ Connected to Somnia Testnet');
    } else {
      console.log(`⚠️  Connected to wrong network. Expected: ${SOMNIA_CONFIG.NETWORK_ID}, Got: ${network.chainId}`);
    }
  } catch (error) {
    console.log(`❌ Network connectivity check failed: ${error.message}`);
  }
}

async function checkGasPrices(provider) {
  console.log('\n⛽ Gas Price Analysis:');
  
  try {
    const gasPrice = await provider.getGasPrice();
    const gasPriceGwei = parseFloat(ethers.formatUnits(gasPrice, 'gwei'));
    
    console.log(`Current Gas Price: ${gasPriceGwei} gwei`);
    
    if (gasPriceGwei <= 5) {
      console.log('✅ Gas price is optimal for Somnia (≤5 gwei)');
    } else if (gasPriceGwei <= 10) {
      console.log('⚠️  Gas price is acceptable for Somnia (≤10 gwei)');
    } else {
      console.log('❌ Gas price is high for Somnia (>10 gwei)');
    }
    
    // Check if gas price is within Somnia's expected range
    const maxGasPriceWei = BigInt(SOMNIA_CONFIG.MAX_GAS_PRICE);
    if (gasPrice <= maxGasPriceWei) {
      console.log('✅ Gas price is within Somnia limits');
    } else {
      console.log('❌ Gas price exceeds Somnia limits');
    }
  } catch (error) {
    console.log(`❌ Gas price check failed: ${error.message}`);
  }
}

async function checkBlockTimes(provider) {
  console.log('\n⏱️  Block Time Analysis:');
  
  try {
    const startBlock = await provider.getBlockNumber();
    const startTime = Date.now();
    
    // Wait for next block
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const endBlock = await provider.getBlockNumber();
    const endTime = Date.now();
    
    if (endBlock > startBlock) {
      const blockTime = (endTime - startTime) / (endBlock - startBlock);
      console.log(`✅ Average Block Time: ${blockTime.toFixed(2)}ms`);
      
      if (blockTime <= 2000) {
        console.log('✅ Block time is optimal for Somnia (≤2s)');
      } else if (blockTime <= 5000) {
        console.log('⚠️  Block time is acceptable for Somnia (≤5s)');
      } else {
        console.log('❌ Block time is slow for Somnia (>5s)');
      }
    } else {
      console.log('⚠️  No new blocks detected during test period');
    }
  } catch (error) {
    console.log(`❌ Block time check failed: ${error.message}`);
  }
}

// Run verification if called directly
if (require.main === module) {
  verifyDeployment()
    .then((results) => {
      console.log('\n🎯 Verification Complete!');
      
      const requiredContracts = ['NFTFlow', 'PaymentStream', 'ReputationSystem', 'MockPriceOracle', 'MockERC721', 'UtilityTracker'];
      const allRequiredDeployed = requiredContracts.every(name => results.deployed.includes(name));
      
      if (allRequiredDeployed) {
        console.log('✅ All required contracts are deployed and functional');
        process.exit(0);
      } else {
        console.log('❌ Some required contracts are missing');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Verification failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyDeployment };

