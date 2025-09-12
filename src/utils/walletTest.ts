// Wallet connection test utilities
import { 
  isMetaMaskInstalled, 
  isMetaMaskConnected, 
  getMetaMaskAccount, 
  ensureSomniaNetwork, 
  getCurrentNetwork,
  switchToNetwork 
} from '@/lib/web3';

export interface WalletTestResults {
  metaMaskInstalled: boolean;
  metaMaskConnected: boolean;
  account: string | null;
  currentNetwork: { chainId: number; name: string; isSomnia: boolean } | null;
  isSomniaNetwork: boolean;
  errors: string[];
  warnings: string[];
  success: boolean;
  timestamp: number;
}

export const testWalletConnection = async (): Promise<WalletTestResults> => {
  const results: WalletTestResults = {
    metaMaskInstalled: false,
    metaMaskConnected: false,
    account: null,
    currentNetwork: null,
    isSomniaNetwork: false,
    errors: [],
    warnings: [],
    success: false,
    timestamp: Date.now()
  };

  console.log('🧪 Starting comprehensive wallet connection test...');

  try {
    // Test 1: Check if MetaMask is installed
    console.log('🔍 Test 1: Checking MetaMask installation...');
    results.metaMaskInstalled = isMetaMaskInstalled();
    console.log('✅ MetaMask installed:', results.metaMaskInstalled);

    if (!results.metaMaskInstalled) {
      results.errors.push('MetaMask not installed');
      console.log('❌ Test failed: MetaMask not installed');
      return results;
    }

    // Test 2: Check if MetaMask is connected
    console.log('🔍 Test 2: Checking MetaMask connection...');
    results.metaMaskConnected = await isMetaMaskConnected();
    console.log('✅ MetaMask connected:', results.metaMaskConnected);

    if (!results.metaMaskConnected) {
      results.errors.push('MetaMask not connected');
      console.log('❌ Test failed: MetaMask not connected');
      return results;
    }

    // Test 3: Get account
    console.log('🔍 Test 3: Getting account...');
    results.account = await getMetaMaskAccount();
    console.log('✅ Account:', results.account);

    if (!results.account) {
      results.errors.push('No account found');
      console.log('❌ Test failed: No account found');
      return results;
    }

    // Test 4: Get current network
    console.log('🔍 Test 4: Getting current network...');
    results.currentNetwork = await getCurrentNetwork();
    console.log('✅ Current network:', results.currentNetwork);

    if (!results.currentNetwork) {
      results.errors.push('Failed to get network info');
      console.log('❌ Test failed: Failed to get network info');
      return results;
    }

    // Test 5: Check if on Somnia network
    console.log('🔍 Test 5: Checking Somnia network...');
    results.isSomniaNetwork = results.currentNetwork.isSomnia;
    console.log('✅ On Somnia network:', results.isSomniaNetwork);

    if (!results.isSomniaNetwork) {
      results.warnings.push(`Not on Somnia network. Current: ${results.currentNetwork.chainId}`);
      console.log('⚠️ Warning: Not on Somnia network');
    }

    // Test 6: Test network switching capability
    console.log('🔍 Test 6: Testing network switching...');
    try {
      if (!results.isSomniaNetwork) {
        console.log('🔄 Attempting to switch to Somnia network...');
        await ensureSomniaNetwork();
        console.log('✅ Successfully switched to Somnia network');
        // Update the network info after successful switch
        results.currentNetwork = await getCurrentNetwork();
        results.isSomniaNetwork = results.currentNetwork?.isSomnia || false;
      } else {
        console.log('✅ Already on Somnia network, no switch needed');
      }
    } catch (switchError) {
      results.warnings.push(`Network switch failed: ${switchError instanceof Error ? switchError.message : 'Unknown error'}`);
      console.log('⚠️ Warning: Network switch failed:', switchError);
    }

    // Determine overall success
    results.success = results.errors.length === 0;
    
    if (results.success) {
      console.log('🎉 All wallet connection tests passed!');
    } else {
      console.log('❌ Some wallet connection tests failed:', results.errors);
    }

    return results;

  } catch (error: unknown) {
    console.error('❌ Wallet test error:', error);
    results.errors.push(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return results;
  }
};

export const testSomniaNetworkSwitch = async () => {
  try {
    console.log('🔄 Testing Somnia network switch...');
    await ensureSomniaNetwork();
    
    const network = await getCurrentNetwork();
    if (network?.isSomnia) {
      console.log('✅ Successfully switched to Somnia network');
      return { success: true, network };
    } else {
      console.log('❌ Failed to switch to Somnia network');
      return { success: false, network };
    }
  } catch (error: unknown) {
    console.error('❌ Network switch error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const runFullWalletTest = async (): Promise<{ connectionTest: WalletTestResults; allTestsPassed: boolean }> => {
  console.log('🚀 Starting full wallet connection test...');
  
  const connectionTest = await testWalletConnection();
  console.log('📊 Connection test results:', connectionTest);
  
  if (!connectionTest.isSomniaNetwork) {
    console.log('🔄 Attempting to switch to Somnia network...');
    const switchTest = await testSomniaNetworkSwitch();
    console.log('📊 Network switch results:', switchTest);
  }
  
  const allTestsPassed = connectionTest.success && connectionTest.isSomniaNetwork;
  
  console.log('📊 Test Results Summary:');
  console.log(`✅ MetaMask Installed: ${connectionTest.metaMaskInstalled}`);
  console.log(`✅ MetaMask Connected: ${connectionTest.metaMaskConnected}`);
  console.log(`✅ Account: ${connectionTest.account || 'None'}`);
  console.log(`✅ Network: ${connectionTest.currentNetwork?.name || 'Unknown'} (${connectionTest.currentNetwork?.chainId || 'N/A'})`);
  console.log(`✅ On Somnia: ${connectionTest.isSomniaNetwork}`);
  console.log(`✅ Success: ${connectionTest.success}`);
  console.log(`✅ All Tests Passed: ${allTestsPassed}`);
  
  if (connectionTest.errors.length > 0) {
    console.log('❌ Errors:', connectionTest.errors);
  }
  
  if (connectionTest.warnings.length > 0) {
    console.log('⚠️ Warnings:', connectionTest.warnings);
  }
  
  return {
    connectionTest,
    allTestsPassed
  };
};
