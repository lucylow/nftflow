// src/components/SomniaPaymentInterface.jsx
import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useFeeData } from 'wagmi';
import { ethers } from 'ethers';
import SomniaTokenService from '../services/somniaTokenService';

const SomniaPaymentInterface = ({ nft, duration, onPaymentComplete }) => {
  const [priceInfo, setPriceInfo] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isRenting, setIsRenting] = useState(false);
  const [usdAmount, setUsdAmount] = useState(0);
  const [gasRecommendations, setGasRecommendations] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [error, setError] = useState(null);
  
  const { address } = useAccount();
  const { data: balance } = useBalance({ 
    address,
    chainId: 50312 // Somnia Testnet
  });
  const { data: feeData } = useFeeData({ 
    chainId: 50312,
    watch: true
  });

  useEffect(() => {
    if (nft && duration) {
      calculateRentalCost();
      loadUserStats();
      loadGasRecommendations();
    }
  }, [nft, duration, address]);

  const calculateRentalCost = async () => {
    setIsCalculating(true);
    setError(null);
    
    try {
      const costInfo = await SomniaTokenService.calculateRentalCost(
        nft.contractAddress,
        nft.tokenId,
        duration
      );
      
      setPriceInfo(costInfo);
      
      // Convert to USD
      const usd = await SomniaTokenService.convertToUSD(costInfo.totalWithGas);
      setUsdAmount(usd);
    } catch (error) {
      console.error('Error calculating cost:', error);
      setError('Failed to calculate rental cost');
    } finally {
      setIsCalculating(false);
    }
  };

  const loadUserStats = async () => {
    if (!address) return;
    
    try {
      const stats = await SomniaTokenService.getUserSOMIStats(address);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const loadGasRecommendations = async () => {
    try {
      const recommendations = await SomniaTokenService.getGasPriceRecommendations();
      setGasRecommendations(recommendations);
    } catch (error) {
      console.error('Error loading gas recommendations:', error);
    }
  };

  const handleRent = async () => {
    if (!priceInfo || !address) return;
    
    setIsRenting(true);
    setError(null);
    
    try {
      // Check if user has sufficient balance
      const hasBalance = await SomniaTokenService.hasSufficientBalance(
        address,
        priceInfo.totalWithGas
      );
      
      if (!hasBalance) {
        throw new Error('Insufficient SOMI balance');
      }
      
      // Generate listing ID (in production, this would come from the listing)
      const listingId = ethers.keccak256(
        ethers.solidityPacked(
          ['address', 'uint256', 'address', 'uint256'],
          [nft.contractAddress, nft.tokenId, nft.owner, Date.now()]
        )
      );
      
      // Prepare milestones (example: every 10% of duration)
      const milestones = [];
      const milestoneInterval = Math.floor(duration / 10);
      for (let i = 1; i <= 10; i++) {
        milestones.push(milestoneInterval * i);
      }
      
      // Rent NFT
      const result = await SomniaTokenService.rentNFT(
        listingId,
        duration,
        milestones,
        {
          nftContract: nft.contractAddress,
          tokenId: nft.tokenId
        }
      );
      
      onPaymentComplete(result);
      
      // Refresh user stats
      await loadUserStats();
      
    } catch (error) {
      console.error('Rental failed:', error);
      setError(error.message || 'Rental failed');
    } finally {
      setIsRenting(false);
    }
  };

  const formatSOMI = (amount) => {
    return SomniaTokenService.formatSOMI(amount, 6);
  };

  const formatDuration = (seconds) => {
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
  };

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
        <div className="flex items-center space-x-2 text-red-400 mb-4">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">Error</span>
        </div>
        <p className="text-red-300">{error}</p>
        <button
          onClick={calculateRentalCost}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <h3 className="text-lg font-semibold">Rental Payment with SOMI</h3>
        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
          Somnia Native
        </span>
      </div>
      
      {isCalculating ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          <span className="ml-3 text-slate-400">Calculating costs...</span>
        </div>
      ) : priceInfo ? (
        <>
          {/* Rental Details */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Duration:</span>
              <span className="font-mono text-cyan-400">
                {formatDuration(duration)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Price per second:</span>
              <span className="font-mono">
                {formatSOMI(priceInfo.pricePerSecond)} SOMI
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total cost:</span>
              <span className="font-mono text-cyan-400 text-lg">
                {formatSOMI(priceInfo.totalCost)} SOMI
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Network fee:</span>
              <span className="font-mono text-slate-400">
                {formatSOMI(priceInfo.gasCost)} SOMI
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Total with fees:</span>
              <span className="font-mono text-cyan-400 font-semibold">
                {formatSOMI(priceInfo.totalWithGas)} SOMI
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Approx USD:</span>
              <span className="text-slate-400">${usdAmount.toFixed(2)}</span>
            </div>
          </div>
          
          {/* User Balance */}
          <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400">Your balance:</span>
              <span className="font-mono">
                {balance ? formatSOMI(balance.value) : '0.000000'} {balance?.symbol || 'SOMI'}
              </span>
            </div>
            
            {userStats && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Total spent:</span>
                  <div className="font-mono">{formatSOMI(userStats.totalSpent)} SOMI</div>
                </div>
                <div>
                  <span className="text-slate-400">Total earned:</span>
                  <div className="font-mono text-green-400">{formatSOMI(userStats.totalEarned)} SOMI</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Gas Price Info */}
          {gasRecommendations && (
            <div className="bg-slate-700/30 rounded-lg p-3 mb-6">
              <div className="text-xs text-slate-400 mb-2">Current Gas Price</div>
              <div className="flex space-x-4 text-sm">
                <div className="text-slate-400">Slow: {gasRecommendations.slow} gwei</div>
                <div className="text-cyan-400">Standard: {gasRecommendations.standard} gwei</div>
                <div className="text-green-400">Fast: {gasRecommendations.fast} gwei</div>
              </div>
            </div>
          )}
          
          {/* Action Button */}
          <button
            onClick={handleRent}
            disabled={
              !balance || 
              BigInt(balance.value) < ethers.parseEther(priceInfo.totalWithGas) ||
              isRenting
            }
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
          >
            {isRenting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing Rental...</span>
              </div>
            ) : (
              `Rent with ${formatSOMI(priceInfo.totalWithGas)} SOMI`
            )}
          </button>
          
          {/* Somnia Network Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              Powered by Somnia Network • Sub-second confirmation • Low fees
            </p>
            <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-slate-400">
              <span>⚡ Fast</span>
              <span>💰 Cheap</span>
              <span>🔒 Secure</span>
            </div>
          </div>
        </>
      ) : (
        <div className="text-slate-400 text-center py-8">
          <div className="animate-pulse">Calculating rental cost...</div>
        </div>
      )}
    </div>
  );
};

export default SomniaPaymentInterface;
