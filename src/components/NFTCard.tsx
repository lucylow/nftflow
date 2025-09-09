import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, User, DollarSign, ImageOff, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NFT {
  id: string;
  name: string;
  image: string;
  collection: string;
  pricePerHour: number;
  isRented: boolean;
  owner: string;
  timeLeft?: string;
  rarity?: string;
}

interface NFTCardProps {
  nft: NFT;
  onRent?: (nft: NFT) => void;
}

const NFTCard = ({ nft, onRent }: NFTCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden hover:border-purple-500/30 transition-all duration-300 group">
        {/* Image Container */}
        <div className="aspect-square relative overflow-hidden">
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center bg-slate-700">
              <ImageOff size={32} className="text-slate-500" />
            </div>
          ) : (
            <img
              src={nft.image}
              alt={nft.name}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          )}
          
          {/* Overlay Controls */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
            <div className="absolute top-3 left-3 right-3 flex justify-between">
              {nft.rarity && (
                <Badge variant="secondary" className="bg-purple-500/80 text-white">
                  {nft.rarity}
                </Badge>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                  isLiked 
                    ? 'bg-red-500/80 text-white' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
              </motion.button>
            </div>
            
            {nft.isRented && (
              <div className="absolute bottom-3 right-3">
                <Badge variant="destructive" className="bg-red-500/80">
                  Rented
                </Badge>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Title and Collection */}
          <div>
            <h3 className="font-semibold text-lg text-white truncate">{nft.name}</h3>
            <p className="text-slate-400 text-sm">{nft.collection}</p>
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Price/hour</span>
              <span className="font-mono text-purple-400 font-semibold">
                {nft.pricePerHour} STT
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-slate-400">
                <User size={12} />
                <span>{nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}</span>
              </div>
              {nft.isRented && nft.timeLeft && (
                <div className="flex items-center gap-1 text-amber-400">
                  <Clock size={12} />
                  <span>{nft.timeLeft}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={() => onRent?.(nft)}
            disabled={nft.isRented}
            className={`w-full transition-all ${
              nft.isRented
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
            }`}
          >
            {nft.isRented ? 'Currently Rented' : 'Rent Now'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NFTCard;