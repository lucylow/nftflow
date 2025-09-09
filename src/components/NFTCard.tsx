import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, User, DollarSign, ImageOff, Heart, Eye, Share2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

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
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isRenting, setIsRenting] = useState(false);
  const { toast } = useToast();

  const handleRent = async () => {
    if (nft.isRented) return;
    
    setIsRenting(true);
    try {
      await onRent?.(nft);
      toast({
        title: "Rental Started",
        description: `Successfully rented ${nft.name}`,
      });
    } catch (error) {
      toast({
        title: "Rental Failed",
        description: "Failed to start rental. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRenting(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from Favorites" : "Added to Favorites",
      description: isLiked ? `${nft.name} removed from favorites` : `${nft.name} added to favorites`,
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/nft/${nft.id}`);
    toast({
      title: "Link Copied",
      description: "NFT link copied to clipboard",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group"
    >
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm overflow-hidden hover:border-primary/30 transition-all duration-300 group/card shadow-lg hover:shadow-xl hover:shadow-primary/10">
        {/* Image Container */}
        <div className="aspect-square relative overflow-hidden bg-muted/20">
          <AnimatePresence>
            {isImageLoading && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <Skeleton className="w-full h-full" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center bg-muted/30">
              <ImageOff size={32} className="text-muted-foreground" />
            </div>
          ) : (
            <img
              src={nft.image}
              alt={nft.name}
              className={`w-full h-full object-cover transition-all duration-500 group-hover/card:scale-110 ${
                isImageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setIsImageLoading(false)}
              onError={() => {
                setImageError(true);
                setIsImageLoading(false);
              }}
            />
          )}
          
          {/* Overlay Controls */}
          <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/20 transition-all duration-300">
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
              <div className="flex gap-2">
                {nft.rarity && (
                  <Badge 
                    variant="secondary" 
                    className="bg-primary/90 text-primary-foreground backdrop-blur-sm border-0"
                  >
                    {nft.rarity}
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLike}
                  className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                    isLiked 
                      ? 'bg-red-500/90 text-white shadow-lg' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleShare}
                  className="p-2 rounded-full backdrop-blur-sm bg-white/20 text-white hover:bg-white/30 transition-all duration-200"
                  aria-label="Share NFT"
                >
                  <Share2 size={16} />
                </motion.button>
              </div>
            </div>
            
            {nft.isRented && (
              <div className="absolute bottom-3 right-3">
                <Badge 
                  variant="destructive" 
                  className="bg-red-500/90 text-white backdrop-blur-sm border-0"
                >
                  Rented
                </Badge>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Title and Collection */}
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-foreground truncate group-hover/card:text-primary transition-colors">
              {nft.name}
            </h3>
            <p className="text-muted-foreground text-sm">{nft.collection}</p>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Price/hour</span>
              <span className="font-mono text-primary font-semibold">
                {nft.pricePerHour} STT
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <User size={12} />
                <span className="font-mono">{nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}</span>
              </div>
              {nft.isRented && nft.timeLeft && (
                <div className="flex items-center gap-1 text-warning">
                  <Clock size={12} />
                  <span className="font-medium">{nft.timeLeft}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleRent}
            disabled={nft.isRented || isRenting}
            variant={nft.isRented ? "secondary" : "premium"}
            className="w-full transition-all duration-200"
          >
            {isRenting ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
              />
            ) : null}
            {isRenting ? 'Starting Rental...' : nft.isRented ? 'Currently Rented' : 'Rent Now'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NFTCard;