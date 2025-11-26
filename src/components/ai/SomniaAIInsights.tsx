import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSomniaAI } from '@/hooks/useSomniaAI';
import { Brain, TrendingUp, Shield, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIAnalysisHistory } from './AIAnalysisHistory';

export const SomniaAIInsights: React.FC = () => {
  const { analyzePricingStream, assessRisk, getMarketInsights, isAnalyzing } = useSomniaAI();
  const [pricingResult, setPricingResult] = useState<any>(null);
  const [streamedText, setStreamedText] = useState<string>('');
  const [riskResult, setRiskResult] = useState<any>(null);
  const [marketResult, setMarketResult] = useState<any>(null);

  const handlePricingAnalysis = async () => {
    setStreamedText('');
    setPricingResult(null);
    
    const result = await analyzePricingStream(
      '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      '1',
      {
        floorPrice: 0.001,
        volume24h: 150,
        trending: true,
        avgRentalDuration: 7200
      },
      (text) => setStreamedText(text)
    );
    
    setPricingResult(result);
  };

  const handleRiskAssessment = async () => {
    const result = await assessRisk(
      '0x1234567890123456789012345678901234567890',
      0.5,
      86400,
      {
        totalRentals: 25,
        avgRating: 4.5,
        lateReturns: 1,
        disputes: 0
      }
    );
    setRiskResult(result);
  };

  const handleMarketInsights = async () => {
    const result = await getMarketInsights(
      '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      '24h',
      {
        totalVolume: 2500,
        activeRentals: 45,
        floorPrice: 0.001,
        avgDuration: 7200,
        uniqueRenters: 120,
        growthRate: 15
      }
    );
    setMarketResult(result);
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

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Somnia AI Insights</h1>
          <p className="text-muted-foreground">AI-powered analysis of Somnia blockchain data streams</p>
        </div>
      </div>

      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pricing">
            <TrendingUp className="w-4 h-4 mr-2" />
            Pricing Analysis
          </TabsTrigger>
          <TabsTrigger value="risk">
            <Shield className="w-4 h-4 mr-2" />
            Risk Assessment
          </TabsTrigger>
          <TabsTrigger value="market">
            <Brain className="w-4 h-4 mr-2" />
            Market Insights
          </TabsTrigger>
          <TabsTrigger value="history">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>NFT Pricing Analysis</CardTitle>
              <CardDescription>
                AI-powered pricing recommendations based on Somnia market data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handlePricingAnalysis} 
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? 'Analyzing (Streaming)...' : 'Analyze Demo NFT (Stream)'}
              </Button>

              {streamedText && !pricingResult && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{streamedText}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="animate-pulse">●</div>
                    AI is thinking...
                  </div>
                </div>
              )}

              {pricingResult && (
                <div className="space-y-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Optimal Price:</span>
                    <span className="text-2xl font-bold text-primary">
                      {pricingResult.optimalPrice} STT/s
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Confidence:</span>
                    <Badge variant="secondary">{pricingResult.confidence}%</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Market Trend:</span>
                    <span className={`font-bold uppercase ${getTrendColor(pricingResult.marketTrend)}`}>
                      {pricingResult.marketTrend}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Strategy:</h4>
                    <p className="text-sm text-muted-foreground">{pricingResult.strategy}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Reasoning:</h4>
                    <p className="text-sm text-muted-foreground">{pricingResult.reasoning}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rental Risk Assessment</CardTitle>
              <CardDescription>
                AI-powered risk analysis for potential renters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleRiskAssessment} 
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? 'Assessing...' : 'Assess Demo Renter Risk'}
              </Button>

              {riskResult && (
                <div className="space-y-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Risk Level:</span>
                    <Badge className={getRiskColor(riskResult.riskLevel)}>
                      {riskResult.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Risk Score:</span>
                    <span className="text-2xl font-bold">{riskResult.riskScore}/100</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Recommended Collateral:</span>
                    <span className="font-bold text-primary">{riskResult.collateralPercentage}%</span>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Risk Factors:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {riskResult.riskFactors.map((factor: string, i: number) => (
                        <li key={i}>{factor}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Mitigation Strategies:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {riskResult.mitigationStrategies.map((strategy: string, i: number) => (
                        <li key={i}>{strategy}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Explanation:</h4>
                    <p className="text-sm text-muted-foreground">{riskResult.explanation}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
              <CardDescription>
                AI-powered market analysis and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleMarketInsights} 
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? 'Analyzing...' : 'Generate Market Insights'}
              </Button>

              {marketResult && (
                <div className="space-y-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Market Sentiment:</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold uppercase ${getTrendColor(marketResult.sentiment)}`}>
                        {marketResult.sentiment}
                      </span>
                      <Badge variant="secondary">{marketResult.sentimentScore > 0 ? '+' : ''}{marketResult.sentimentScore}</Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Summary:</h4>
                    <p className="text-sm text-muted-foreground">{marketResult.summary}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Prediction:</h4>
                    <p className="text-sm text-muted-foreground">{marketResult.prediction}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Key Trends:</h4>
                    <div className="space-y-2">
                      {marketResult.trends.map((trend: any, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-0.5">{trend.impact}</Badge>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{trend.trend}</p>
                            <p className="text-xs text-muted-foreground">{trend.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Recommendations:</h4>
                    <div className="space-y-2">
                      {marketResult.recommendations.map((rec: any, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-0.5">{rec.priority}</Badge>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{rec.action}</p>
                            <p className="text-xs text-muted-foreground">{rec.rationale}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Opportunities:</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {marketResult.opportunities.map((opp: string, i: number) => (
                          <li key={i}>{opp}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Risks:</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {marketResult.risks.map((risk: string, i: number) => (
                          <li key={i}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <AIAnalysisHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SomniaAIInsights;
