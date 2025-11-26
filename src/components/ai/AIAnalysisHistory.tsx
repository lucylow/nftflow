import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Clock, TrendingUp, Shield, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const AIAnalysisHistory: React.FC = () => {
  const [pricingHistory, setPricingHistory] = useState<any[]>([]);
  const [riskHistory, setRiskHistory] = useState<any[]>([]);
  const [insightsHistory, setInsightsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const [pricing, risk, insights] = await Promise.all([
        supabase
          .from('nft_pricing_analyses')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('rental_risk_assessments')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('market_insights')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      if (pricing.data) setPricingHistory(pricing.data);
      if (risk.data) setRiskHistory(risk.data);
      if (insights.data) setInsightsHistory(insights.data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'text-green-500';
      case 'bearish': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Clock className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Analysis History</h2>
      </div>

      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pricing">
            <TrendingUp className="w-4 h-4 mr-2" />
            Pricing ({pricingHistory.length})
          </TabsTrigger>
          <TabsTrigger value="risk">
            <Shield className="w-4 h-4 mr-2" />
            Risk ({riskHistory.length})
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Eye className="w-4 h-4 mr-2" />
            Insights ({insightsHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="space-y-4">
          {pricingHistory.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No pricing analyses yet. Run your first analysis above!
              </CardContent>
            </Card>
          ) : (
            pricingHistory.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {item.nft_address.slice(0, 10)}...{item.nft_address.slice(-8)}
                      </CardTitle>
                      <CardDescription>Token #{item.token_id}</CardDescription>
                    </div>
                    <Badge variant="outline">{formatDate(item.created_at)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Optimal Price:</span>
                    <span className="text-lg font-bold text-primary">
                      {item.optimal_price} STT/s
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Confidence:</span>
                    <Badge variant="secondary">{item.confidence}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Trend:</span>
                    <span className={`font-bold uppercase text-sm ${getTrendColor(item.market_trend)}`}>
                      {item.market_trend}
                    </span>
                  </div>
                  {item.strategy && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">{item.strategy}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          {riskHistory.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No risk assessments yet. Run your first assessment above!
              </CardContent>
            </Card>
          ) : (
            riskHistory.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {item.renter_address.slice(0, 10)}...{item.renter_address.slice(-8)}
                      </CardTitle>
                      <CardDescription>
                        Value: {item.nft_value} STT | Duration: {Math.floor(item.duration / 3600)}h
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{formatDate(item.created_at)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Risk Level:</span>
                    <Badge className={getRiskColor(item.risk_level)}>
                      {item.risk_level?.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Risk Score:</span>
                    <span className="text-lg font-bold">{item.risk_score}/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Collateral:</span>
                    <span className="font-bold text-primary">{item.collateral_percentage}%</span>
                  </div>
                  {item.explanation && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {insightsHistory.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No market insights yet. Generate your first insight above!
              </CardContent>
            </Card>
          ) : (
            insightsHistory.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {item.collection_address.slice(0, 10)}...{item.collection_address.slice(-8)}
                      </CardTitle>
                      <CardDescription>Timeframe: {item.timeframe}</CardDescription>
                    </div>
                    <Badge variant="outline">{formatDate(item.created_at)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sentiment:</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold uppercase text-sm ${getTrendColor(item.sentiment)}`}>
                        {item.sentiment}
                      </span>
                      <Badge variant="secondary">
                        {item.sentiment_score > 0 ? '+' : ''}{item.sentiment_score}
                      </Badge>
                    </div>
                  </div>
                  {item.prediction && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium mb-1">Prediction:</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.prediction}</p>
                    </div>
                  )}
                  {item.summary && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground line-clamp-3">{item.summary}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAnalysisHistory;
