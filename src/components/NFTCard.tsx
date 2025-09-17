import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useTheme } from '../contexts/ThemeContext';
import { useAchievements } from '../contexts/AchievementContext';
import AnimatedCard from './AnimatedCard';
import Lottie from 'lottie-react';
import checkAnimation from '../animations/check.json';

interface NFT {
  id: number;
  contractAddress: string;
  tokenId: string;
  name: string;
  collection: string;
  image: string;
  pricePerSecond: number;
  pricePerHour: number;
  pricePerDay: number;
  collectionColor?: string;
  uptimePercentage?: number;
  traits: string[];
  listDate: string;
  owner: string;
  isRentable: boolean;
  description: string;
  rarity: string;
  utility: string;
}

interface NFTCardProps {
  nft: NFT;
  isRentable?: boolean;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, isRentable = true }) => {
  const [isRenting, setIsRenting] = useState(false);
  const [rentalSuccess, setRentalSuccess] = useState(false);
  const { getThemeColors, setPendingTxState } = useTheme();
  const { unlockAchievement, incrementRentalStreak } = useAchievements();
  const { nftFlowContract, account } = useWeb3();
  const colors = getThemeColors();

  const handleRent = async () => {
    if (!account || !nftFlowContract) {
      console.error('Wallet not connected or contract not available');
      return;
    }

    setIsRenting(true);
    setPendingTxState(true);
    
    try {
      // This would be a real contract call
      // const tx = await nftFlowContract.rentNFT(
      //   nft.contractAddress,
      //   nft.tokenId,
      //   3600, // 1 hour rental
      //   { value: ethers.utils.parseEther((nft.pricePerSecond * 3600 * 2).toString()) }
      // );
      // await tx.wait();

      // Simulate transaction for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsRenting(false);
      setRentalSuccess(true);
      setPendingTxState(false);
      unlockAchievement('FIRST_RENTAL');
      incrementRentalStreak();
      
      setTimeout(() => setRentalSuccess(false), 3000);
    } catch (error) {
      console.error('Error renting NFT:', error);
      setIsRenting(false);
      setPendingTxState(false);
    }
  };

  return (
    <AnimatedCard
      depth={15}
      tilt={8}
      className="bg-white/80 backdrop-blur-md border border-white/20"
    >
      <div className="relative overflow-hidden group">
        {/* NFT Image */}
        <div className="aspect-square overflow-hidden">
          <img
            src={nft.image}
            alt={nft.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
        
        {/* Collection Color Overlay */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
          style={{ backgroundColor: nft.collectionColor || colors.primary }}
        />
        
        {/* Radial Uptime Indicator */}
        <div className="absolute top-4 right-4 w-12 h-12">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#eee"
              strokeWidth="2"
              strokeDasharray="100, 100"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={colors.primary}
              strokeWidth="2"
              strokeDasharray={`${nft.uptimePercentage || 75}, 100`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
            {nft.uptimePercentage || 75}%
          </span>
        </div>

        {/* Rarity Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            nft.rarity === 'Legendary' ? 'bg-purple-100 text-purple-800' :
            nft.rarity === 'Epic' ? 'bg-blue-100 text-blue-800' :
            nft.rarity === 'Rare' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {nft.rarity}
          </span>
        </div>

        {/* Card Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg truncate">{nft.name}</h3>
          <p className="text-gray-600 text-sm truncate">{nft.collection}</p>
          
          {/* Animated Price Ticker */}
          <div className="flex items-center mt-2">
            <span className="text-xs text-gray-500 mr-1">Price/sec:</span>
            <div className="font-mono text-sm bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              {nft.pricePerSecond.toFixed(8)} STT
            </div>
          </div>
          
          {/* Traits */}
          <div className="flex flex-wrap gap-1 mt-2">
            {nft.traits.slice(0, 3).map((trait, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
              >
                {trait}
              </span>
            ))}
            {nft.traits.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                +{nft.traits.length - 3}
              </span>
            )}
          </div>
          
          {/* Rent Button with Animation */}
          {isRentable && (
            <button
              onClick={handleRent}
              disabled={isRenting || rentalSuccess}
              className="mt-4 w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 relative overflow-hidden"
              style={{
                background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
                boxShadow: `0 4px 15px ${colors.primary}30`,
              }}
            >
              {isRenting ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Renting...
                </div>
              ) : rentalSuccess ? (
                <div className="flex items-center justify-center">
                  <Lottie animationData={checkAnimation} loop={false} className="w-5 h-5 mr-1" />
                  Success!
                </div>
              ) : (
                `Rent Now - ${(nft.pricePerSecond * 3600).toFixed(4)} STT/hr`
              )}
            </button>
          )}
        </div>
      </div>
    </AnimatedCard>
  );
};

export default NFTCard;