import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, Share, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface TouchOptimizedCardProps {
  nft: {
    id: string;
    title: string;
    creator: string;
    price: string;
    duration: string;
    rating: number;
    image: string;
  };
}

const TouchOptimizedCard: React.FC<TouchOptimizedCardProps> = ({ nft }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <motion.div
      className="w-full"
      animate={{ scale: isPressed ? 0.98 : 1 }}
      transition={{ duration: 0.1 }}
    >
      <Card className="bg-gray-900 border-gray-700 overflow-hidden">
        <div 
          className="relative"
          onTouchStart={() => setIsPressed(true)}
          onTouchEnd={() => setIsPressed(false)}
        >
          <img 
            src={nft.image} 
            alt={nft.title}
            className="w-full h-48 object-cover"
          />
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* Top right actions */}
          <div className="absolute top-3 right-3 flex space-x-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsFavorited(!isFavorited)}
              className="p-2 bg-black/50 backdrop-blur-sm rounded-full"
            >
              <Heart 
                className={`w-5 h-5 ${isFavorited ? 'text-red-500 fill-current' : 'text-white'}`} 
              />
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-black/50 backdrop-blur-sm rounded-full"
            >
              <Share className="w-5 h-5 text-white" />
            </motion.button>
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${i < nft.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} 
                  />
                ))}
              </div>
              
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button 
                  size="sm" 
                  className="bg-white text-black hover:bg-gray-200 px-4 py-2 text-sm font-semibold"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Rent
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-white text-lg mb-1 truncate">{nft.title}</h3>
          <p className="text-gray-400 text-sm mb-3">by {nft.creator}</p>
          
          <div className="flex justify-between items-center">
            <div className="text-green-400 font-bold text-lg">{nft.price}</div>
            <div className="text-gray-400 text-sm flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {nft.duration}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TouchOptimizedCard;
