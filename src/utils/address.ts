/**
 * Utility functions for address formatting and validation
 */

/**
 * Shorten an Ethereum address for display
 * @param address - The full Ethereum address
 * @param chars - Number of characters to show at start and end (default: 4)
 * @returns Shortened address (e.g., "0x1234...5678")
 */
export const shortenAddress = (address: string, chars: number = 4): string => {
  if (!address) return '';
  if (address.length < chars * 2 + 2) return address; // Too short to shorten
  
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

/**
 * Validate if a string is a valid Ethereum address
 * @param address - The address to validate
 * @returns True if valid Ethereum address
 */
export const isValidAddress = (address: string): boolean => {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Format address for display with optional ENS name
 * @param address - The Ethereum address
 * @param ensName - Optional ENS name
 * @param chars - Number of characters to show when shortening
 * @returns Formatted address string
 */
export const formatAddress = (address: string, ensName?: string, chars: number = 4): string => {
  if (!address) return '';
  
  if (ensName) {
    return `${ensName} (${shortenAddress(address, chars)})`;
  }
  
  return shortenAddress(address, chars);
};

/**
 * Get address from ENS name or return the address if it's already an address
 * @param input - ENS name or address
 * @returns Promise resolving to the address
 */
export const resolveAddress = async (input: string): Promise<string> => {
  if (isValidAddress(input)) {
    return input;
  }
  
  // In a real implementation, you would resolve ENS names here
  // For now, just return the input
  return input;
};

/**
 * Copy address to clipboard
 * @param address - The address to copy
 * @returns Promise that resolves when copy is complete
 */
export const copyToClipboard = async (address: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(address);
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = address;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};

/**
 * Get explorer URL for an address
 * @param address - The Ethereum address
 * @param chainId - The chain ID (default: 50312 for Somnia)
 * @returns Explorer URL
 */
export const getExplorerUrl = (address: string, chainId: number = 50312): string => {
  const baseUrl = chainId === 50312 
    ? 'https://shannon-explorer.somnia.network/address/'
    : `https://etherscan.io/address/`;
  
  return `${baseUrl}${address}`;
};

/**
 * Get transaction explorer URL
 * @param txHash - The transaction hash
 * @param chainId - The chain ID (default: 50312 for Somnia)
 * @returns Explorer URL
 */
export const getTransactionUrl = (txHash: string, chainId: number = 50312): string => {
  const baseUrl = chainId === 50312 
    ? 'https://shannon-explorer.somnia.network/tx/'
    : `https://etherscan.io/tx/`;
  
  return `${baseUrl}${txHash}`;
};
