import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Share2, 
  Eye, 
  Clock, 
  Sparkles,
  User,
  TrendingUp,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

export interface NFTCardData {
  id: string;
  name: string;
  description?: string;
  image: string;
  price: string;
  currency?: string;
  owner?: string;
  views?: number;
  likes?: number;
  isLiked?: boolean;
  isPremium?: boolean;
  collection?: string;
  status?: 'available' | 'rented' | 'pending';
  rentalPrice?: string;
  rentalPeriod?: string;
  tags?: string[];
}

interface EnhancedNFTCardProps {
  nft: NFTCardData;
  onLike?: (id: string) => void;
  onShare?: (id: string) => void;
  onView?: (id: string) => void;
  className?: string;
}

export const EnhancedNFTCard: React.FC<EnhancedNFTCardProps> = ({
  nft,
  onLike,
  onShare,
  onView,
  className = '',
}) => {
  const statusColors = {
    available: 'bg-green-500/20 text-green-400 border-green-500/50',
    rented: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  };

  const statusIcons = {
    available: Sparkles,
    rented: Clock,
    pending: Zap,
  };

  const StatusIcon = nft.status ? statusIcons[nft.status] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`group ${className}`}
    >
      <Card className="overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover-lift h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <img
              src={nft.image}
              alt={nft.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </motion.div>

          {/* Premium Badge */}
          {nft.isPremium && (
            <Badge className="absolute top-3 left-3 glass-strong text-amber-400 border-amber-400/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}

          {/* Status Badge */}
          {nft.status && StatusIcon && (
            <Badge
              className={`absolute top-3 right-3 glass-strong border ${statusColors[nft.status]}`}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {nft.status.charAt(0).toUpperCase() + nft.status.slice(1)}
            </Badge>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onView?.(nft.id)}
              className="transform scale-0 group-hover:scale-100 transition-transform"
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
            <Button
              size="sm"
              variant="secondary"
              asChild
            >
              <Link to={`/nft/${nft.id}`}>
                Details
              </Link>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center justify-between text-white text-sm">
              {nft.views && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{nft.views}</span>
                </div>
              )}
              {nft.likes && (
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{nft.likes}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Title and Collection */}
          <div className="mb-2">
            <Link to={`/nft/${nft.id}`}>
              <h3 className="font-semibold text-base mb-1 truncate group-hover:text-primary transition-colors">
                {nft.name}
              </h3>
            </Link>
            {nft.collection && (
              <p className="text-xs text-muted-foreground truncate">
                {nft.collection}
              </p>
            )}
          </div>

          {/* Description */}
          {nft.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-shrink-0">
              {nft.description}
            </p>
          )}

          {/* Tags */}
          {nft.tags && nft.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {nft.tags.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Spacer */}
          <div className="flex-grow" />

          {/* Footer */}
          <div className="border-t border-border pt-3 mt-auto space-y-2">
            {/* Price */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold gradient-text">
                  {nft.price}
                  {nft.currency && (
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {nft.currency}
                    </span>
                  )}
                </p>
                {nft.rentalPrice && (
                  <p className="text-xs text-muted-foreground">
                    Rent: {nft.rentalPrice}
                    {nft.rentalPeriod && ` / ${nft.rentalPeriod}`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {nft.isLiked && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLike?.(nft.id)}
                    className={`h-8 w-8 p-0 ${nft.isLiked ? 'text-red-400' : 'text-muted-foreground'}`}
                  >
                    <Heart className={`w-4 h-4 ${nft.isLiked ? 'fill-current' : ''}`} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onShare?.(nft.id)}
                  className="h-8 w-8 p-0"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Owner */}
            {nft.owner && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                <span className="truncate">{nft.owner}</span>
              </div>
            )}

            {/* CTA Button */}
            <Button
              className="w-full animated-gradient text-white font-semibold mt-2"
              asChild
            >
              <Link to={`/nft/${nft.id}`}>
                {nft.rentalPrice ? 'Rent Now' : 'View Details'}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnhancedNFTCard;

