// Wallet connection test utilities
import { 
  isMetaMaskInstalled, 
  isMetaMaskConnected, 
  getMetaMaskAccount, 
  ensureSomniaNetwork, 
  getCurrentNetwork,
  switchToNetwork 
} from '@/lib/web3';

export const testWalletConnection = async () => {
  const results = {
    metaMaskInstalled: false,
    metaMaskConnected: false,
    account: null as string | null,
    currentNetwork: null as { chainId: number; name: string } | null,
    isSomniaNetwork: false,
    errors: [] as string[]
  };

  try {
    // Test 1: Check if MetaMask is installed
    results.metaMaskInstalled = isMetaMaskInstalled();
    console.log('✅ MetaMask installed:', results.metaMaskInstalled);

    if (!results.metaMaskInstalled) {
      results.errors.push('MetaMask not installed');
      return results;
    }

    // Test 2: Check if MetaMask is connected
    results.metaMaskConnected = await isMetaMaskConnected();
    console.log('✅ MetaMask connected:', results.metaMaskConnected);

    if (!results.metaMaskConnected) {
      results.errors.push('MetaMask not connected');
      return results;
    }

    // Test 3: Get account
    results.account = await getMetaMaskAccount();
    console.log('✅ Account:', results.account);

    if (!results.account) {
      results.errors.push('No account found');
      return results;
    }

    // Test 4: Get current network
    results.currentNetwork = await getCurrentNetwork();
    console.log('✅ Current network:', results.currentNetwork);

    if (!results.currentNetwork) {
      results.errors.push('Failed to get network info');
      return results;
    }

    // Test 5: Check if on Somnia network
    results.isSomniaNetwork = results.currentNetwork.isSomnia;
    console.log('✅ On Somnia network:', results.isSomniaNetwork);

    if (!results.isSomniaNetwork) {
      results.errors.push(`Not on Somnia network. Current: ${results.currentNetwork.chainId}`);
    }

    return results;

  } catch (error: unknown) {
    console.error('❌ Wallet test error:', error);
    results.errors.push(error instanceof Error ? error.message : 'Unknown error');
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

export const runFullWalletTest = async () => {
  console.log('🚀 Starting full wallet connection test...');
  
  const connectionTest = await testWalletConnection();
  console.log('📊 Connection test results:', connectionTest);
  
  if (!connectionTest.isSomniaNetwork) {
    console.log('🔄 Attempting to switch to Somnia network...');
    const switchTest = await testSomniaNetworkSwitch();
    console.log('📊 Network switch results:', switchTest);
  }
  
  return {
    connectionTest,
    allTestsPassed: connectionTest.errors.length === 0 && connectionTest.isSomniaNetwork
  };
};
