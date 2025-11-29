import { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useSomniaMock } from '../useSomniaMock';
import { SCHEMA_IDS } from '../sampleSchemas';
import { StreamEvent } from '../mockSomnia';
import { Activity, DollarSign, TrendingUp, Bot, ChevronDown, ChevronRight } from 'lucide-react';

interface EventItem {
  id: string;
  type: string;
  event: StreamEvent;
  receivedAt: number;
}

export function DemoEventFeed() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleEvent = (type: string) => (event: StreamEvent) => {
    const newEvent: EventItem = {
      id: `${event.dataId}-${Date.now()}`,
      type,
      event,
      receivedAt: Date.now(),
    };
    setEvents(prev => [newEvent, ...prev].slice(0, 50)); // Keep last 50
  };

  useSomniaMock(SCHEMA_IDS.RENTAL_STARTED, handleEvent('rental_started'));
  useSomniaMock(SCHEMA_IDS.RENTAL_TICK, handleEvent('rental_tick'));
  useSomniaMock(SCHEMA_IDS.PRICING_SUGGESTION, handleEvent('pricing_suggestion'));
  useSomniaMock(SCHEMA_IDS.AGENT_ACTION, handleEvent('agent_action'));

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'rental_started': return <Activity className="w-3 h-3" />;
      case 'rental_tick': return <DollarSign className="w-3 h-3" />;
      case 'pricing_suggestion': return <TrendingUp className="w-3 h-3" />;
      case 'agent_action': return <Bot className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'rental_started': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rental_tick': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pricing_suggestion': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'agent_action': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    const ms = date.getMilliseconds().toString().padStart(3, '0').slice(0, 2);
    return `${date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit'
    })}.${ms}`;
  };

  const getEventSummary = (item: EventItem) => {
    const { raw } = item.event;
    switch (item.type) {
      case 'rental_started':
        return `${raw.nftName} rented`;
      case 'rental_tick':
        return `Rental #${raw.rentalId} tick #${raw.sequence}`;
      case 'pricing_suggestion':
        return `${raw.nftName}: ${raw.trend === 'up' ? '↑' : '↓'} ${raw.suggestedPricePerSecond} STT/s`;
      case 'agent_action':
        return `${raw.agentType}: ${raw.action}`;
      default:
        return 'Event';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden h-full flex flex-col">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">Event Stream</h3>
        <Badge variant="outline" className="text-xs">
          {events.length} events
        </Badge>
      </div>
      
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-2 space-y-1">
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Start simulation to see events
            </div>
          ) : (
            events.map((item) => (
              <div
                key={item.id}
                className="border border-border rounded bg-background/50 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="w-full p-2 flex items-center gap-2 hover:bg-muted/50 transition-colors text-left"
                >
                  <span className={`p-1 rounded border ${getEventColor(item.type)}`}>
                    {getEventIcon(item.type)}
                  </span>
                  <span className="flex-1 text-xs text-foreground truncate">
                    {getEventSummary(item)}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {formatTime(item.receivedAt)}
                  </span>
                  {expandedId === item.id ? (
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  )}
                </button>
                
                {expandedId === item.id && (
                  <div className="px-2 pb-2 border-t border-border">
                    <div className="mt-2 space-y-1 text-[10px]">
                      <div className="flex gap-2">
                        <span className="text-muted-foreground">Schema:</span>
                        <span className="font-mono text-foreground truncate">
                          {item.event.schemaId}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-muted-foreground">TxHash:</span>
                        <span className="font-mono text-foreground truncate">
                          {item.event.txHash.slice(0, 20)}...
                        </span>
                      </div>
                      <div className="bg-muted/50 rounded p-2 mt-2">
                        <pre className="text-[9px] text-muted-foreground overflow-auto">
                          {JSON.stringify(item.event.raw, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
