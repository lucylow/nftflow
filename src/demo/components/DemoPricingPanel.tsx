import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useSomniaMock } from '../useSomniaMock';
import { SCHEMA_IDS } from '../sampleSchemas';
import { StreamEvent } from '../mockSomnia';
import { TrendingUp, TrendingDown, Bot, Sparkles } from 'lucide-react';

interface PricingSuggestion {
  id: string;
  nftName: string;
  currentPrice: string;
  suggestedPrice: string;
  confidence: string;
  trend: string;
  note: string;
  timestamp: number;
}

interface AgentAction {
  id: string;
  agentType: string;
  action: string;
  note: string;
  confidence: string;
  timestamp: number;
}

export function DemoPricingPanel() {
  const [suggestions, setSuggestions] = useState<PricingSuggestion[]>([]);
  const [agentActions, setAgentActions] = useState<AgentAction[]>([]);

  useSomniaMock(SCHEMA_IDS.PRICING_SUGGESTION, (event: StreamEvent) => {
    const data = event.raw;
    const newSuggestion: PricingSuggestion = {
      id: event.dataId,
      nftName: data.nftName,
      currentPrice: data.currentPrice,
      suggestedPrice: data.suggestedPricePerSecond,
      confidence: data.confidence,
      trend: data.trend,
      note: data.note,
      timestamp: Date.now(),
    };
    setSuggestions(prev => [newSuggestion, ...prev].slice(0, 10));
  });

  useSomniaMock(SCHEMA_IDS.AGENT_ACTION, (event: StreamEvent) => {
    const data = event.raw;
    const newAction: AgentAction = {
      id: event.dataId,
      agentType: data.agentType,
      action: data.action,
      note: data.note,
      confidence: data.confidence,
      timestamp: Date.now(),
    };
    setAgentActions(prev => [newAction, ...prev].slice(0, 5));
  });

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="space-y-4">
      {/* AI Pricing Suggestions */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="font-semibold text-foreground text-sm">AI Pricing Suggestions</h3>
        </div>
        
        <div className="p-3 space-y-2 max-h-[300px] overflow-auto">
          {suggestions.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Waiting for AI suggestions...
            </div>
          ) : (
            suggestions.map((s) => (
              <div
                key={s.id}
                className="border border-border rounded p-2 bg-background/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground text-sm">{s.nftName}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] ${
                      s.trend === 'up' 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}
                  >
                    {s.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {s.trend === 'up' ? '+' : '-'}
                    {Math.abs(
                      ((parseFloat(s.suggestedPrice) - parseFloat(s.currentPrice)) / 
                        parseFloat(s.currentPrice)) * 100
                    ).toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Current: </span>
                    <span className="font-mono text-foreground">{s.currentPrice} STT/s</span>
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <div>
                    <span className="text-muted-foreground">Suggested: </span>
                    <span className="font-mono text-primary font-medium">{s.suggestedPrice} STT/s</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">{s.note}</span>
                  <span className="text-muted-foreground">
                    Confidence: {(parseFloat(s.confidence) * 100).toFixed(0)}%
                  </span>
                </div>
                
                <div className="text-[10px] text-muted-foreground text-right">
                  {formatTime(s.timestamp)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Agent Actions */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <Bot className="w-4 h-4 text-orange-400" />
          <h3 className="font-semibold text-foreground text-sm">Agent Actions</h3>
        </div>
        
        <div className="p-3 space-y-2 max-h-[200px] overflow-auto">
          {agentActions.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Waiting for agent actions...
            </div>
          ) : (
            agentActions.map((a) => (
              <div
                key={a.id}
                className="border border-border rounded p-2 bg-background/50"
              >
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-[10px]">
                    {a.agentType.replace('_', ' ')}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {formatTime(a.timestamp)}
                  </span>
                </div>
                <div className="text-xs text-foreground">{a.note}</div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  Action: {a.action} • Confidence: {(parseFloat(a.confidence) * 100).toFixed(0)}%
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
