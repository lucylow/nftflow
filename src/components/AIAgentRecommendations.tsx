import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, TrendingUp, Star, Shield, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAIAgentContext } from '@/contexts/AIAgentContext';
import { RentalRecommendation } from '@/services/AIAgentService';

interface AIAgentRecommendationsProps {
  onSelectRecommendation?: (recommendation: RentalRecommendation) => void;
}

export const AIAgentRecommendations: React.FC<AIAgentRecommendationsProps> = ({
  onSelectRecommendation,
}) => {
  const { getRecommendations, discoveryActive } = useAIAgentContext();
  const [recommendations, setRecommendations] = useState<RentalRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (discoveryActive) {
      loadRecommendations();
    }
  }, [discoveryActive]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const recs = await getRecommendations();
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!discoveryActive) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="p-6 text-center">
          <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Enable the Discovery Agent to get personalized NFT recommendations
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 animate-pulse text-primary" />
            <span>Analyzing your preferences...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            No recommendations available at the moment
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          AI-Powered Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.listingId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-500/10 text-green-600">
                  {Math.round(rec.confidence * 100)}% Match
                </Badge>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600">
                  ID: {rec.listingId}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                  <Star className="w-3 h-3 mr-1" />
                  {rec.expectedValue.toFixed(4)} STT
                </Badge>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-3">
              {rec.reason}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Risk: {Math.round(rec.riskScore * 100)}%
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Value: {rec.expectedValue} STT
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => onSelectRecommendation?.(rec)}
              >
                View Details
              </Button>
            </div>
          </motion.div>
        ))}

        <Button
          variant="outline"
          className="w-full"
          onClick={loadRecommendations}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Refresh Recommendations
        </Button>
      </CardContent>
    </Card>
  );
};
