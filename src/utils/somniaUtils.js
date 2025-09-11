// src/utils/somniaUtils.js
import { ethers } from 'ethers';
import { SOMNIA_CONFIG } from '../config/constants.js';

/**
 * SomniaUtils
 * Utility functions for native Somnia token (SOMI/STT) operations
 * Leverages Somnia's low fees and high throughput
 */
export class SomniaUtils {
  /**
   * Format SOMI/STT amount for display
   */
  static formatSOMI(amount, decimals = 4) {
    try {
      return parseFloat(ethers.formatEther(amount)).toFixed(decimals);
    } catch (error) {
      console.error('Error formatting SOMI:', error);
      return '0.0000';
    }
  }

  /**
   * Parse SOMI/STT amount from user input
   */
  static parseSOMI(amount) {
    try {
      return ethers.parseEther(amount.toString());
    } catch (error) {
      console.error('Error parsing SOMI:', error);
      return ethers.parseEther('0');
    }
  }

  /**
   * Check if address has sufficient SOMI/STT balance
   */
  static async hasSufficientBalance(address, requiredAmount) {
    try {
      const provider = new ethers.JsonRpcProvider(SOMNIA_CONFIG.TESTNET.RPC_URL);
      const balance = await provider.getBalance(address);
      const requiredWei = ethers.parseEther(requiredAmount.toString());
      return balance >= requiredWei;
    } catch (error) {
      console.error('Error checking balance:', error);
      return false;
    }
  }

  /**
   * Get current SOMI/STT balance
   */
  static async getBalance(address) {
    try {
      const provider = new ethers.JsonRpcProvider(SOMNIA_CONFIG.TESTNET.RPC_URL);
      const balance = await provider.getBalance(address);
      return {
        balance: ethers.formatEther(balance),
        balanceWei: balance.toString(),
        symbol: SOMNIA_CONFIG.TESTNET.currency.symbol
      };
    } catch (error) {
      console.error('Error getting balance:', error);
      return {
        balance: '0.000000',
        balanceWei: '0',
        symbol: 'SOMI'
      };
    }
  }

  /**
   * Estimate transaction gas cost in SOMI/STT
   */
  static async estimateGasCost(transaction) {
    try {
      const provider = new ethers.JsonRpcProvider(SOMNIA_CONFIG.TESTNET.RPC_URL);
      const gasEstimate = await provider.estimateGas(transaction);
      const gasPrice = await provider.getFeeData();
      const gasCost = gasEstimate * (gasPrice.gasPrice || gasPrice.maxFeePerGas);
      
      return {
        gasEstimate: gasEstimate.toString(),
        gasPrice: (gasPrice.gasPrice || gasPrice.maxFeePerGas).toString(),
        gasCost: ethers.formatEther(gasCost),
        gasCostWei: gasCost.toString()
      };
    } catch (error) {
      console.error('Error estimating gas cost:', error);
      return {
        gasEstimate: '21000',
        gasPrice: ethers.parseUnits('1', 'gwei').toString(),
        gasCost: '0.000021',
        gasCostWei: ethers.parseUnits('0.000021', 'ether').toString()
      };
    }
  }

  /**
   * Get current gas price
   */
  static async getGasPrice() {
    try {
      const provider = new ethers.JsonRpcProvider(SOMNIA_CONFIG.TESTNET.RPC_URL);
      const feeData = await provider.getFeeData();
      return feeData.gasPrice || feeData.maxFeePerGas || ethers.parseUnits('1', 'gwei');
    } catch (error) {
      console.error('Error getting gas price:', error);
      return ethers.parseUnits('1', 'gwei');
    }
  }

  /**
   * Get gas price recommendations
   */
  static async getGasPriceRecommendations() {
    try {
      const gasPrice = await this.getGasPrice();
      const gasPriceGwei = ethers.formatUnits(gasPrice, 'gwei');
      const gasPriceFloat = parseFloat(gasPriceGwei);
      
      return {
        current: gasPriceGwei,
        slow: (gasPriceFloat * 0.9).toFixed(2),
        standard: gasPriceGwei,
        fast: (gasPriceFloat * 1.1).toFixed(2),
        instant: (gasPriceFloat * 1.2).toFixed(2)
      };
    } catch (error) {
      console.error('Error getting gas price recommendations:', error);
      return {
        current: '1',
        slow: '0.9',
        standard: '1',
        fast: '1.1',
        instant: '1.2'
      };
    }
  }

  /**
   * Wait for transaction confirmation (leveraging Somnia's fast finality)
   */
  static async waitForConfirmation(txHash, confirmations = 1) {
    try {
      const provider = new ethers.JsonRpcProvider(SOMNIA_CONFIG.TESTNET.RPC_URL);
      const receipt = await provider.waitForTransaction(txHash, confirmations);
      return receipt;
    } catch (error) {
      console.error('Error waiting for confirmation:', error);
      throw new Error('Failed to wait for confirmation');
    }
  }

  /**
   * Get network status
   */
  static async getNetworkStatus() {
    try {
      const provider = new ethers.JsonRpcProvider(SOMNIA_CONFIG.TESTNET.RPC_URL);
      const [blockNumber, gasPrice, network] = await Promise.all([
        provider.getBlockNumber(),
        this.getGasPrice(),
        provider.getNetwork()
      ]);
      
      return {
        blockNumber,
        gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
        chainId: network.chainId.toString(),
        name: network.name,
        currency: SOMNIA_CONFIG.TESTNET.currency.symbol,
        rpcUrl: SOMNIA_CONFIG.TESTNET.RPC_URL
      };
    } catch (error) {
      console.error('Error getting network status:', error);
      throw new Error('Failed to get network status');
    }
  }

  /**
   * Convert SOMI to USD
   */
  static async convertToUSD(amountSOMI) {
    try {
      const response = await fetch('/api/somnia/convert-to-usd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountSOMI })
      });
      
      if (!response.ok) {
        throw new Error('Failed to convert to USD');
      }
      
      const data = await response.json();
      return data.usdAmount;
    } catch (error) {
      console.error('Error converting SOMI to USD:', error);
      // Fallback to fixed rate
      return parseFloat(amountSOMI) * 0.25;
    }
  }

  /**
   * Format duration in human readable format
   */
  static formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Calculate rental cost breakdown
   */
  static calculateRentalCost(pricePerSecond, duration, gasPrice = null) {
    const totalCost = pricePerSecond * duration;
    const gasCost = gasPrice ? gasPrice * 200000 : 0; // Estimate 200k gas
    const totalWithGas = totalCost + gasCost;
    
    return {
      pricePerSecond,
      totalCost,
      gasCost,
      totalWithGas,
      duration
    };
  }

  /**
   * Validate SOMI amount
   */
  static validateSOMIAmount(amount) {
    try {
      const parsed = ethers.parseEther(amount.toString());
      const minAmount = ethers.parseEther('0.000001'); // 0.000001 SOMI minimum
      
      return {
        isValid: parsed >= minAmount,
        amount: parsed,
        formatted: ethers.formatEther(parsed),
        minAmount: ethers.formatEther(minAmount)
      };
    } catch (error) {
      return {
        isValid: false,
        amount: ethers.parseEther('0'),
        formatted: '0.000000',
        minAmount: '0.000001',
        error: error.message
      };
    }
  }

  /**
   * Get transaction history for an address
   */
  static async getTransactionHistory(address, limit = 100) {
    try {
      const response = await fetch(`/api/somnia/transactions/${address}?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to get transaction history');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }

  /**
   * Monitor transaction status
   */
  static async monitorTransaction(txHash, onUpdate = null) {
    try {
      const provider = new ethers.JsonRpcProvider(SOMNIA_CONFIG.TESTNET.RPC_URL);
      
      // Check transaction status
      const tx = await provider.getTransaction(txHash);
      if (!tx) {
        throw new Error('Transaction not found');
      }
      
      // Wait for confirmation
      const receipt = await provider.waitForTransaction(txHash, 1);
      
      if (onUpdate) {
        onUpdate({
          status: receipt.status === 1 ? 'confirmed' : 'failed',
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          effectiveGasPrice: receipt.gasPrice?.toString() || '0'
        });
      }
      
      return receipt;
    } catch (error) {
      console.error('Error monitoring transaction:', error);
      throw error;
    }
  }

  /**
   * Get contract instance
   */
  static getContract(address, abi, signerOrProvider) {
    return new ethers.Contract(address, abi, signerOrProvider);
  }

  /**
   * Create provider instance
   */
  static createProvider() {
    return new ethers.JsonRpcProvider(SOMNIA_CONFIG.TESTNET.RPC_URL);
  }

  /**
   * Create wallet instance
   */
  static createWallet(privateKey, provider = null) {
    const prov = provider || this.createProvider();
    return new ethers.Wallet(privateKey, prov);
  }

  /**
   * Generate random wallet for testing
   */
  static generateTestWallet() {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic.phrase
    };
  }

  /**
   * Calculate gas price with multiplier
   */
  static async calculateGasPriceWithMultiplier(multiplier = 1.1) {
    try {
      const gasPrice = await this.getGasPrice();
      const adjustedGasPrice = gasPrice * BigInt(Math.floor(multiplier * 100)) / BigInt(100);
      return adjustedGasPrice;
    } catch (error) {
      console.error('Error calculating gas price with multiplier:', error);
      return ethers.parseUnits('1', 'gwei');
    }
  }

  /**
   * Get block information
   */
  static async getBlock(blockNumber = 'latest') {
    try {
      const provider = this.createProvider();
      const block = await provider.getBlock(blockNumber);
      return block;
    } catch (error) {
      console.error('Error getting block:', error);
      throw error;
    }
  }

  /**
   * Get transaction receipt
   */
  static async getTransactionReceipt(txHash) {
    try {
      const provider = this.createProvider();
      const receipt = await provider.getTransactionReceipt(txHash);
      return receipt;
    } catch (error) {
      console.error('Error getting transaction receipt:', error);
      throw error;
    }
  }

  /**
   * Check if transaction is confirmed
   */
  static async isTransactionConfirmed(txHash) {
    try {
      const receipt = await this.getTransactionReceipt(txHash);
      return receipt && receipt.status === 1;
    } catch (error) {
      console.error('Error checking transaction confirmation:', error);
      return false;
    }
  }

  /**
   * Get network info
   */
  static getNetworkInfo() {
    return {
      name: 'Somnia Testnet',
      chainId: 50312,
      currency: 'STT',
      rpcUrl: SOMNIA_CONFIG.TESTNET.RPC_URL,
      blockExplorer: 'https://testnet.somnia.network',
      features: [
        'High Throughput (1M+ TPS)',
        'Low Fees (Sub-cent)',
        'Fast Finality (Sub-second)',
        'EVM Compatible',
        'Native Token Support'
      ]
    };
  }
}

export default SomniaUtils;
