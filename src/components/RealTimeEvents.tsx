import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Zap, 
  Clock, 
  Hash, 
  ArrowRight, 
  Circle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { somniaWebSocketService, SomniaEvent } from '@/services/somniaWebSocketService';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { NFTFLOW_ABI } from '@/lib/web3';

interface RealTimeEventsProps {
  className?: string;
}

const RealTimeEvents: React.FC<RealTimeEventsProps> = ({ className }) => {
  const [events, setEvents] = useState<SomniaEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const handleConnection = (event: SomniaEvent) => {
      setIsConnected(event.data.status === 'connected');
    };

    const handleBlock = (event: SomniaEvent) => {
      setEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
    };

    const handleTransaction = (event: SomniaEvent) => {
      setEvents(prev => [event, ...prev.slice(0, 49)]);
    };

    const handleContract = (event: SomniaEvent) => {
      setEvents(prev => [event, ...prev.slice(0, 49)]);
    };

    const handleMetric = (event: SomniaEvent) => {
      setMetrics(event.data);
    };

    // Subscribe to events
    somniaWebSocketService.on('connection', handleConnection);
    somniaWebSocketService.on('block', handleBlock);
    somniaWebSocketService.on('transaction', handleTransaction);
    somniaWebSocketService.on('contract', handleContract);
    somniaWebSocketService.on('metric', handleMetric);

    // Connect to WebSocket
    somniaWebSocketService.connect();

    // Get initial metrics
    somniaWebSocketService.getRealTimeMetrics().then(setMetrics);

    return () => {
      somniaWebSocketService.off('connection', handleConnection);
      somniaWebSocketService.off('block', handleBlock);
      somniaWebSocketService.off('transaction', handleTransaction);
      somniaWebSocketService.off('contract', handleContract);
      somniaWebSocketService.off('metric', handleMetric);
    };
  }, []);

  const startMonitoring = async () => {
    try {
      await somniaWebSocketService.subscribeToContractEvents(
        CONTRACT_ADDRESSES.NFTFlow,
        NFTFLOW_ABI
      );
      setIsMonitoring(true);
    } catch (error) {
      console.error('Failed to start monitoring:', error);
    }
  };

  const stopMonitoring = () => {
    somniaWebSocketService.disconnect();
    setIsMonitoring(false);
    setIsConnected(false);
  };

  const clearEvents = () => {
    setEvents([]);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'block': return <Hash className="w-4 h-4" />;
      case 'transaction': return <ArrowRight className="w-4 h-4" />;
      case 'contract': return <Activity className="w-4 h-4" />;
      case 'metric': return <Zap className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'block': return 'text-blue-400 bg-blue-400/20';
      case 'transaction': return 'text-green-400 bg-green-400/20';
      case 'contract': return 'text-purple-400 bg-purple-400/20';
      case 'metric': return 'text-yellow-400 bg-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatValue = (value: string) => {
    if (value.length > 20) {
      return `${value.slice(0, 10)}...${value.slice(-10)}`;
    }
    return value;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Real-Time Somnia Events</h2>
          <p className="text-slate-400">Live blockchain activity monitoring</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={`${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border-0`}>
            <Circle className={`w-2 h-2 mr-1 ${isConnected ? 'fill-green-400' : 'fill-red-400'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          
          {isMonitoring && (
            <Badge className="bg-purple-500/20 text-purple-400 border-0">
              <Activity className="w-3 h-3 mr-1" />
              Monitoring
            </Badge>
          )}
        </div>
      </div>

      {/* Controls */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
                disabled={!isConnected}
                className={`${isMonitoring 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isMonitoring ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Stop Monitoring
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Monitoring
                  </>
                )}
              </Button>
              
              <Button
                onClick={clearEvents}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear Events
              </Button>
            </div>
            
            {metrics && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Hash className="w-3 h-3 text-blue-400" />
                  <span className="text-slate-300">Block #{metrics.blockNumber}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span className="text-slate-300">{metrics.gasPrice} Gwei</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="w-5 h-5 text-purple-400" />
            Live Events ({events.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {events.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                <p className="text-slate-400">No events yet</p>
                <p className="text-slate-500 text-sm">Start monitoring to see live blockchain activity</p>
              </div>
            ) : (
              <div className="space-y-2">
                {events.map((event, index) => (
                  <div
                    key={`${event.type}-${event.timestamp}-${index}`}
                    className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${getEventColor(event.type)} border-0 text-xs`}>
                          {event.type.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-slate-300 space-y-1">
                        {event.type === 'block' && (
                          <>
                            <div>Block #{event.data.blockNumber}</div>
                            <div className="text-xs text-slate-500">
                              {event.data.transactionCount} transactions • {event.data.blockTime}s block time
                            </div>
                          </>
                        )}
                        
                        {event.type === 'transaction' && (
                          <>
                            <div className="font-mono text-xs">
                              {formatValue(event.data.hash)}
                            </div>
                            <div className="text-xs text-slate-500">
                              {event.data.from?.slice(0, 10)}... → {event.data.to?.slice(0, 10)}...
                            </div>
                          </>
                        )}
                        
                        {event.type === 'contract' && (
                          <>
                            <div className="font-semibold">{event.data.event}</div>
                            <div className="text-xs text-slate-500">
                              Contract: {event.data.contractAddress?.slice(0, 10)}...
                            </div>
                          </>
                        )}
                        
                        {event.type === 'metric' && (
                          <div className="text-xs text-slate-500">
                            {JSON.stringify(event.data, null, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {event.transactionHash && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-400 hover:bg-slate-700"
                        onClick={() => {
                          window.open(`https://shannon-explorer.somnia.network/tx/${event.transactionHash}`, '_blank');
                        }}
                      >
                        View
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {events.filter(e => e.type === 'block').length}
            </div>
            <div className="text-sm text-slate-400">Blocks</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {events.filter(e => e.type === 'transaction').length}
            </div>
            <div className="text-sm text-slate-400">Transactions</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {events.filter(e => e.type === 'contract').length}
            </div>
            <div className="text-sm text-slate-400">Contract Events</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {events.filter(e => e.type === 'metric').length}
            </div>
            <div className="text-sm text-slate-400">Metrics</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeEvents;
