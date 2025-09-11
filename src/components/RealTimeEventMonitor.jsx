// src/components/RealTimeEventMonitor.jsx
import React, { useState, useEffect, useRef } from 'react';
import SomniaWebSocketService from '../services/somniaWebSocketService';

const RealTimeEventMonitor = () => {
  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({});
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [eventFilter, setEventFilter] = useState('all');
  const [contractFilter, setContractFilter] = useState('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const eventsEndRef = useRef(null);

  useEffect(() => {
    initializeWebSocket();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [events]);

  useEffect(() => {
    filterEvents();
  }, [events, eventFilter, contractFilter]);

  const initializeWebSocket = async () => {
    try {
      // Register event callbacks
      SomniaWebSocketService.on('NFTListedForRent', handleEvent);
      SomniaWebSocketService.on('NFTRented', handleEvent);
      SomniaWebSocketService.on('RentalCompleted', handleEvent);
      SomniaWebSocketService.on('SOMIPaymentReceived', handleEvent);
      SomniaWebSocketService.on('StreamCreated', handleEvent);
      SomniaWebSocketService.on('StreamWithdrawn', handleEvent);
      SomniaWebSocketService.on('MilestoneReached', handleEvent);
      SomniaWebSocketService.on('ReputationUpdated', handleEvent);
      SomniaWebSocketService.on('UserVerified', handleEvent);
      SomniaWebSocketService.on('NewBlock', handleEvent);

      // Initialize connection
      const connected = await SomniaWebSocketService.initialize();
      setIsConnected(connected);

      // Start status monitoring
      startStatusMonitoring();
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  };

  const handleEvent = (eventData) => {
    setEvents(prevEvents => {
      const newEvents = [eventData, ...prevEvents];
      return newEvents.slice(0, 1000); // Keep last 1000 events
    });
  };

  const startStatusMonitoring = () => {
    setInterval(() => {
      const status = SomniaWebSocketService.getStatus();
      setConnectionStatus(status);
      setIsConnected(status.isConnected);
    }, 5000);
  };

  const filterEvents = () => {
    let filtered = events;

    if (eventFilter !== 'all') {
      filtered = filtered.filter(event => event.event === eventFilter);
    }

    if (contractFilter !== 'all') {
      filtered = filtered.filter(event => event.contract === contractFilter);
    }

    setFilteredEvents(filtered);
  };

  const scrollToBottom = () => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const cleanup = async () => {
    await SomniaWebSocketService.disconnect();
  };

  const getEventIcon = (eventName) => {
    const icons = {
      'NFTListedForRent': '🏠',
      'NFTRented': '🔑',
      'RentalCompleted': '✅',
      'SOMIPaymentReceived': '💰',
      'StreamCreated': '💧',
      'StreamWithdrawn': '💸',
      'MilestoneReached': '🎯',
      'ReputationUpdated': '⭐',
      'UserVerified': '✅',
      'NewBlock': '🔗'
    };
    return icons[eventName] || '📄';
  };

  const getEventColor = (eventName) => {
    const colors = {
      'NFTListedForRent': 'text-blue-400',
      'NFTRented': 'text-green-400',
      'RentalCompleted': 'text-emerald-400',
      'SOMIPaymentReceived': 'text-yellow-400',
      'StreamCreated': 'text-cyan-400',
      'StreamWithdrawn': 'text-purple-400',
      'MilestoneReached': 'text-orange-400',
      'ReputationUpdated': 'text-pink-400',
      'UserVerified': 'text-green-400',
      'NewBlock': 'text-gray-400'
    };
    return colors[eventName] || 'text-gray-400';
  };

  const formatEventData = (event) => {
    switch (event.event) {
      case 'NFTListedForRent':
        return `NFT ${event.tokenId} listed for ${event.pricePerSecondSOMI} SOMI/sec`;
      case 'NFTRented':
        return `NFT ${event.tokenId} rented for ${event.duration}s (${event.totalPriceSOMI} SOMI)`;
      case 'RentalCompleted':
        return `Rental completed: ${event.totalPaidSOMI} SOMI paid`;
      case 'SOMIPaymentReceived':
        return `${event.amountSOMI} SOMI payment (${event.purpose})`;
      case 'StreamCreated':
        return `Payment stream created: ${event.depositSOMI} SOMI`;
      case 'StreamWithdrawn':
        return `Stream withdrawal: ${event.amountSOMI} SOMI`;
      case 'MilestoneReached':
        return `Milestone ${event.milestoneIndex} reached: ${event.amountSOMI} SOMI`;
      case 'ReputationUpdated':
        return `Reputation updated: ${event.score} (${event.success ? 'success' : 'failure'})`;
      case 'UserVerified':
        return `User verified: ${event.user}`;
      case 'NewBlock':
        return `New block: #${event.blockNumber}`;
      default:
        return 'Unknown event';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">📡</span>
          </div>
          <h3 className="text-lg font-semibold">Real-Time Event Monitor</h3>
          <div className={`px-2 py-1 rounded-full text-xs ${
            isConnected 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded"
            />
            <span>Auto-scroll</span>
          </label>
          
          <button
            onClick={() => setEvents([])}
            className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded transition-colors"
          >
            Clear Events
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="text-xs text-slate-400">Network</div>
          <div className="font-mono text-sm">{connectionStatus.network || 'Unknown'}</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="text-xs text-slate-400">Contracts</div>
          <div className="font-mono text-sm">{connectionStatus.contracts?.length || 0}</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="text-xs text-slate-400">Queue</div>
          <div className="font-mono text-sm">{connectionStatus.eventQueueLength || 0}</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="text-xs text-slate-400">Reconnects</div>
          <div className="font-mono text-sm">{connectionStatus.reconnectAttempts || 0}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Event Type</label>
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm"
          >
            <option value="all">All Events</option>
            <option value="NFTListedForRent">NFT Listed</option>
            <option value="NFTRented">NFT Rented</option>
            <option value="RentalCompleted">Rental Completed</option>
            <option value="SOMIPaymentReceived">SOMI Payment</option>
            <option value="StreamCreated">Stream Created</option>
            <option value="StreamWithdrawn">Stream Withdrawn</option>
            <option value="MilestoneReached">Milestone Reached</option>
            <option value="ReputationUpdated">Reputation Updated</option>
            <option value="UserVerified">User Verified</option>
            <option value="NewBlock">New Block</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs text-slate-400 mb-1">Contract</label>
          <select
            value={contractFilter}
            onChange={(e) => setContractFilter(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm"
          >
            <option value="all">All Contracts</option>
            <option value="NFTFlowSOMI">NFTFlow</option>
            <option value="PaymentStreamSOMI">Payment Stream</option>
            <option value="ReputationSystem">Reputation</option>
            <option value="Network">Network</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-slate-900 rounded-lg border border-slate-700 max-h-96 overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <div className="text-4xl mb-2">📡</div>
            <div>No events to display</div>
            <div className="text-sm mt-1">
              {isConnected ? 'Waiting for events...' : 'WebSocket disconnected'}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filteredEvents.map((event, index) => (
              <div
                key={`${event.transactionHash}-${index}`}
                className="flex items-start space-x-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition-colors"
              >
                <div className="text-lg">{getEventIcon(event.event)}</div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`font-semibold ${getEventColor(event.event)}`}>
                      {event.event}
                    </span>
                    <span className="text-xs text-slate-400">
                      {event.contract}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-slate-300 mb-2">
                    {formatEventData(event)}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span>Block: {event.blockNumber}</span>
                    <span>TX: {event.transactionHash?.slice(0, 10)}...</span>
                    {event.gasUsed && <span>Gas: {event.gasUsed}</span>}
                  </div>
                </div>
              </div>
            ))}
            <div ref={eventsEndRef} />
          </div>
        )}
      </div>

      {/* Event Statistics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-slate-400">Total Events</div>
          <div className="font-mono">{events.length}</div>
        </div>
        <div className="text-center">
          <div className="text-slate-400">Filtered Events</div>
          <div className="font-mono">{filteredEvents.length}</div>
        </div>
        <div className="text-center">
          <div className="text-slate-400">Processing</div>
          <div className="font-mono">{connectionStatus.processing ? 'Yes' : 'No'}</div>
        </div>
        <div className="text-center">
          <div className="text-slate-400">Last Update</div>
          <div className="font-mono">{events[0] ? formatTimestamp(events[0].timestamp) : 'N/A'}</div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeEventMonitor;
