// src/services/somniaTokenService.js
import { ethers } from 'ethers';
import { SOMNIA_CONFIG } from '../config/constants.js';

/**
 * SomniaTokenService
 * Service for handling native Somnia token (SOMI/STT) operations
 * Leverages Somnia's low fees and high throughput for micro-payments
 */
class SomniaTokenService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(SOMNIA_CONFIG.TESTNET.RPC_URL);
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    this.contractAddress = process.env.NFTFLOW_CONTRACT_ADDRESS;
    this.contractABI = this.getContractABI();
  }

  /**
   * Get contract ABI for NFTFlowSOMI
   */
  getContractABI() {
    return [
      "function rentNFT(bytes32 listingId, uint256 duration, uint256[] memory milestones) external payable",
      "function estimateRentalCost(address nftContract, uint256 tokenId, uint256 duration) external view returns (uint256 totalCostSOMI, uint256 gasEstimate, uint256 totalWithGas)",
      "function getUserSOMIStats(address user) external view returns (uint256 balance, uint256 totalSpent, uint256 totalEarned, uint256 totalRentals)",
      "function getSOMIMetrics() external view returns (tuple(uint256 totalVolumeSOMI, uint256 totalFeesSOMI, uint256 totalGasUsed, uint256 averageTransactionFee, uint256 microPaymentCount, uint256 totalMicroPayments))",
      "function depositSOMI() external payable",
      "function withdrawSOMI(uint256 amount) external",
      "event NFTRented(bytes32 indexed rentalId, address indexed nftContract, uint256 indexed tokenId, address tenant, uint256 duration, uint256 totalPriceSOMI, uint256 collateralAmountSOMI, uint256 gasUsed)",
      "event SOMIPaymentReceived(address indexed from, address indexed to, uint256 amountSOMI, string purpose, uint256 timestamp)",
      "event MicroPaymentProcessed(address indexed user, uint256 amountSOMI, uint256 gasUsed, uint256 timestamp)"
    ];
  }

  /**
   * Calculate rental cost in SOMI/STT
   */
  async calculateRentalCost(nftContract, tokenId, duration) {
    try {
      const contract = new ethers.Contract(this.contractAddress, this.contractABI, this.provider);
      const [totalCostSOMI, gasEstimate, totalWithGas] = await contract.estimateRentalCost(
        nftContract,
        tokenId,
        duration
      );
      
      const currentGasPrice = await this.getCurrentGasPrice();
      const gasCostSOMI = gasEstimate * currentGasPrice;
      
      return {
        pricePerSecond: ethers.formatEther(totalCostSOMI / BigInt(duration)),
        totalCost: ethers.formatEther(totalCostSOMI),
        gasEstimate: gasEstimate.toString(),
        gasCost: ethers.formatEther(gasCostSOMI),
        totalWithGas: ethers.formatEther(totalWithGas),
        currency: SOMNIA_CONFIG.TESTNET.currency.symbol,
        networkFee: ethers.formatEther(gasCostSOMI)
      };
    } catch (error) {
      console.error('Error calculating rental cost:', error);
      throw new Error('Failed to calculate rental cost');
    }
  }

  /**
   * Get current SOMI/STT balance for a user
   */
  async getBalance(address) {
    try {
      const balance = await this.provider.getBalance(address);
      return {
        balance: ethers.formatEther(balance),
        balanceWei: balance.toString(),
        symbol: SOMNIA_CONFIG.TESTNET.currency.symbol
      };
    } catch (error) {
      console.error('Error getting balance:', error);
      throw new Error('Failed to get balance');
    }
  }

  /**
   * Check if user has sufficient SOMI/STT balance
   */
  async hasSufficientBalance(address, requiredAmountSOMI) {
    try {
      const balance = await this.provider.getBalance(address);
      const requiredWei = ethers.parseEther(requiredAmountSOMI.toString());
      return balance >= requiredWei;
    } catch (error) {
      console.error('Error checking balance:', error);
      return false;
    }
  }

  /**
   * Get current gas price in SOMI/STT
   */
  async getCurrentGasPrice() {
    try {
      const gasPrice = await this.provider.getFeeData();
      return gasPrice.gasPrice || gasPrice.maxFeePerGas || ethers.parseUnits('1', 'gwei');
    } catch (error) {
      console.error('Error getting gas price:', error);
      return ethers.parseUnits('1', 'gwei'); // Fallback to 1 gwei
    }
  }

  /**
   * Estimate transaction gas cost in SOMI/STT
   */
  async estimateGasCost(transaction) {
    try {
      const gasEstimate = await this.provider.estimateGas(transaction);
      const gasPrice = await this.getCurrentGasPrice();
      const gasCost = gasEstimate * gasPrice;
      
      return {
        gasEstimate: gasEstimate.toString(),
        gasPrice: gasPrice.toString(),
        gasCost: ethers.formatEther(gasCost),
        gasCostWei: gasCost.toString()
      };
    } catch (error) {
      console.error('Error estimating gas cost:', error);
      throw new Error('Failed to estimate gas cost');
    }
  }

  /**
   * Send SOMI/STT payment (for manual operations)
   */
  async sendPayment(toAddress, amountSOMI, options = {}) {
    try {
      const tx = await this.wallet.sendTransaction({
        to: toAddress,
        value: ethers.parseEther(amountSOMI.toString()),
        gasLimit: options.gasLimit || 21000,
        gasPrice: options.gasPrice || await this.getCurrentGasPrice(),
        ...options
      });
      
      const receipt = await tx.wait();
      return {
        txHash: tx.hash,
        receipt: receipt,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.gasPrice.toString()
      };
    } catch (error) {
      console.error('Error sending payment:', error);
      throw new Error('Failed to send payment');
    }
  }

  /**
   * Rent NFT with SOMI/STT payment
   */
  async rentNFT(listingId, duration, milestones = [], options = {}) {
    try {
      const contract = new ethers.Contract(this.contractAddress, this.contractABI, this.wallet);
      
      // Calculate total cost
      const costInfo = await this.calculateRentalCost(
        options.nftContract,
        options.tokenId,
        duration
      );
      
      const totalCostWei = ethers.parseEther(costInfo.totalWithGas);
      
      // Prepare transaction
      const tx = await contract.rentNFT(
        listingId,
        duration,
        milestones,
        {
          value: totalCostWei,
          gasLimit: options.gasLimit || 500000,
          gasPrice: options.gasPrice || await this.getCurrentGasPrice(),
          ...options
        }
      );
      
      const receipt = await tx.wait();
      
      // Parse events
      const events = this.parseRentalEvents(receipt.logs);
      
      return {
        txHash: tx.hash,
        receipt: receipt,
        events: events,
        gasUsed: receipt.gasUsed.toString(),
        totalCost: costInfo.totalWithGas,
        effectiveGasPrice: receipt.gasPrice.toString()
      };
    } catch (error) {
      console.error('Error renting NFT:', error);
      throw new Error('Failed to rent NFT');
    }
  }

  /**
   * Deposit SOMI/STT to contract
   */
  async depositSOMI(amountSOMI, options = {}) {
    try {
      const contract = new ethers.Contract(this.contractAddress, this.contractABI, this.wallet);
      
      const tx = await contract.depositSOMI({
        value: ethers.parseEther(amountSOMI.toString()),
        gasLimit: options.gasLimit || 100000,
        gasPrice: options.gasPrice || await this.getCurrentGasPrice(),
        ...options
      });
      
      const receipt = await tx.wait();
      return {
        txHash: tx.hash,
        receipt: receipt,
        amount: amountSOMI
      };
    } catch (error) {
      console.error('Error depositing SOMI:', error);
      throw new Error('Failed to deposit SOMI');
    }
  }

  /**
   * Withdraw SOMI/STT from contract
   */
  async withdrawSOMI(amountSOMI, options = {}) {
    try {
      const contract = new ethers.Contract(this.contractAddress, this.contractABI, this.wallet);
      
      const tx = await contract.withdrawSOMI(ethers.parseEther(amountSOMI.toString()), {
        gasLimit: options.gasLimit || 100000,
        gasPrice: options.gasPrice || await this.getCurrentGasPrice(),
        ...options
      });
      
      const receipt = await tx.wait();
      return {
        txHash: tx.hash,
        receipt: receipt,
        amount: amountSOMI
      };
    } catch (error) {
      console.error('Error withdrawing SOMI:', error);
      throw new Error('Failed to withdraw SOMI');
    }
  }

  /**
   * Get user SOMI statistics
   */
  async getUserSOMIStats(address) {
    try {
      const contract = new ethers.Contract(this.contractAddress, this.contractABI, this.provider);
      const [balance, totalSpent, totalEarned, totalRentals] = await contract.getUserSOMIStats(address);
      
      return {
        balance: ethers.formatEther(balance),
        totalSpent: ethers.formatEther(totalSpent),
        totalEarned: ethers.formatEther(totalEarned),
        totalRentals: totalRentals.toString()
      };
    } catch (error) {
      console.error('Error getting user SOMI stats:', error);
      throw new Error('Failed to get user SOMI stats');
    }
  }

  /**
   * Get platform SOMI metrics
   */
  async getPlatformSOMIMetrics() {
    try {
      const contract = new ethers.Contract(this.contractAddress, this.contractABI, this.provider);
      const metrics = await contract.getSOMIMetrics();
      
      return {
        totalVolume: ethers.formatEther(metrics.totalVolumeSOMI),
        totalFees: ethers.formatEther(metrics.totalFeesSOMI),
        totalGasUsed: metrics.totalGasUsed.toString(),
        averageTransactionFee: ethers.formatEther(metrics.averageTransactionFee),
        microPaymentCount: metrics.microPaymentCount.toString(),
        totalMicroPayments: ethers.formatEther(metrics.totalMicroPayments)
      };
    } catch (error) {
      console.error('Error getting platform SOMI metrics:', error);
      throw new Error('Failed to get platform SOMI metrics');
    }
  }

  /**
   * Convert SOMI/STT to USD (using oracle)
   */
  async convertToUSD(amountSOMI) {
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
      return parseFloat(amountSOMI) * 0.25; // Example rate
    }
  }

  /**
   * Monitor SOMI/STT transactions for rentals
   */
  async monitorRentalTransactions() {
    try {
      // Listen for new blocks on Somnia
      this.provider.on('block', async (blockNumber) => {
        try {
          const block = await this.provider.getBlock(blockNumber);
          
          // Process transactions in the block
          for (const txHash of block.transactions) {
            const receipt = await this.provider.getTransactionReceipt(txHash);
            
            if (receipt && receipt.to === this.contractAddress) {
              await this.processRentalTransaction(receipt);
            }
          }
        } catch (error) {
          console.error('Error processing block:', error);
        }
      });
    } catch (error) {
      console.error('Error setting up transaction monitoring:', error);
    }
  }

  /**
   * Process rental transaction
   */
  async processRentalTransaction(receipt) {
    try {
      const tx = await this.provider.getTransaction(receipt.transactionHash);
      
      if (tx.value > 0) {
        // This is a rental payment in SOMI/STT
        const rentalEvent = this.parseRentalEvents(receipt.logs);
        
        if (rentalEvent) {
          await this.updateRentalDatabase(rentalEvent, tx.value.toString());
        }
      }
    } catch (error) {
      console.error('Error processing rental transaction:', error);
    }
  }

  /**
   * Parse rental events from transaction logs
   */
  parseRentalEvents(logs) {
    try {
      const contract = new ethers.Contract(this.contractAddress, this.contractABI, this.provider);
      
      for (const log of logs) {
        try {
          const parsed = contract.interface.parseLog(log);
          
          if (parsed && parsed.name === 'NFTRented') {
            return {
              rentalId: parsed.args.rentalId,
              nftContract: parsed.args.nftContract,
              tokenId: parsed.args.tokenId.toString(),
              tenant: parsed.args.tenant,
              duration: parsed.args.duration.toString(),
              totalPriceSOMI: ethers.formatEther(parsed.args.totalPriceSOMI),
              collateralAmountSOMI: ethers.formatEther(parsed.args.collateralAmountSOMI),
              gasUsed: parsed.args.gasUsed.toString()
            };
          }
        } catch (parseError) {
          // Skip logs that can't be parsed
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing rental events:', error);
      return null;
    }
  }

  /**
   * Update rental database
   */
  async updateRentalDatabase(rentalEvent, valueWei) {
    try {
      // Update database with rental information
      const response = await fetch('/api/rentals/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rentalId: rentalEvent.rentalId,
          nftContract: rentalEvent.nftContract,
          tokenId: rentalEvent.tokenId,
          tenant: rentalEvent.tenant,
          duration: rentalEvent.duration,
          totalPriceSOMI: rentalEvent.totalPriceSOMI,
          collateralAmountSOMI: rentalEvent.collateralAmountSOMI,
          gasUsed: rentalEvent.gasUsed,
          valueWei: valueWei
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update rental database');
      }
    } catch (error) {
      console.error('Error updating rental database:', error);
    }
  }

  /**
   * Get transaction history for an address
   */
  async getTransactionHistory(address, limit = 100) {
    try {
      const response = await fetch(`/api/somnia/transactions/${address}?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to get transaction history');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw new Error('Failed to get transaction history');
    }
  }

  /**
   * Get gas price recommendations
   */
  async getGasPriceRecommendations() {
    try {
      const gasPrice = await this.getCurrentGasPrice();
      const gasPriceGwei = ethers.formatUnits(gasPrice, 'gwei');
      
      return {
        current: gasPriceGwei,
        slow: (parseFloat(gasPriceGwei) * 0.9).toFixed(2),
        standard: gasPriceGwei,
        fast: (parseFloat(gasPriceGwei) * 1.1).toFixed(2),
        instant: (parseFloat(gasPriceGwei) * 1.2).toFixed(2)
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
   * Format SOMI amount for display
   */
  formatSOMI(amount, decimals = 4) {
    return parseFloat(ethers.formatEther(amount)).toFixed(decimals);
  }

  /**
   * Parse SOMI amount from user input
   */
  parseSOMI(amount) {
    return ethers.parseEther(amount.toString());
  }

  /**
   * Wait for transaction confirmation (leveraging Somnia's fast finality)
   */
  async waitForConfirmation(txHash, confirmations = 1) {
    try {
      const receipt = await this.provider.waitForTransaction(txHash, confirmations);
      return receipt;
    } catch (error) {
      console.error('Error waiting for confirmation:', error);
      throw new Error('Failed to wait for confirmation');
    }
  }

  /**
   * Get network status
   */
  async getNetworkStatus() {
    try {
      const [blockNumber, gasPrice, network] = await Promise.all([
        this.provider.getBlockNumber(),
        this.getCurrentGasPrice(),
        this.provider.getNetwork()
      ]);
      
      return {
        blockNumber,
        gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
        chainId: network.chainId.toString(),
        name: network.name,
        currency: SOMNIA_CONFIG.TESTNET.currency.symbol
      };
    } catch (error) {
      console.error('Error getting network status:', error);
      throw new Error('Failed to get network status');
    }
  }
}

export default new SomniaTokenService();
