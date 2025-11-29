import { useEffect, useRef, useState, useCallback } from 'react';
import { mockSomnia, StreamEvent } from './mockSomnia';

export function useSomniaMock(schemaId: string, onData: (d: StreamEvent) => void) {
  const subRef = useRef<{ unsubscribe: () => void } | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const onDataRef = useRef(onData);
  
  // Keep callback ref updated
  useEffect(() => {
    onDataRef.current = onData;
  }, [onData]);

  useEffect(() => {
    subRef.current = mockSomnia.subscribe({ 
      schemaId, 
      onData: (d) => onDataRef.current(d) 
    });
    setIsSubscribed(true);
    
    return () => {
      subRef.current?.unsubscribe();
      setIsSubscribed(false);
    };
  }, [schemaId]);

  return { isSubscribed };
}

export function useSomniaSimulation() {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [activeRentals, setActiveRentals] = useState<Map<number, { data: any; sequence: number }>>(new Map());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const rentalIdRef = useRef(1);

  const startSimulation = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stopSimulation = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetSimulation = useCallback(() => {
    stopSimulation();
    setActiveRentals(new Map());
    rentalIdRef.current = 1;
    mockSomnia.clearStore();
  }, [stopSimulation]);

  const addRental = useCallback(() => {
    const { generateRentalStarted, SCHEMA_IDS } = require('./sampleSchemas');
    const rentalId = rentalIdRef.current++;
    const rentalData = generateRentalStarted(rentalId);
    
    mockSomnia.emitEvent(SCHEMA_IDS.RENTAL_STARTED, rentalData);
    
    setActiveRentals(prev => {
      const newMap = new Map(prev);
      newMap.set(rentalId, { data: rentalData, sequence: 0 });
      return newMap;
    });
    
    return rentalId;
  }, []);

  const removeRental = useCallback((rentalId: number) => {
    setActiveRentals(prev => {
      const newMap = new Map(prev);
      newMap.delete(rentalId);
      return newMap;
    });
  }, []);

  // Main simulation loop
  useEffect(() => {
    if (!isRunning) return;

    const { generateRentalTick, generatePricingSuggestion, generateAgentAction, SCHEMA_IDS } = require('./sampleSchemas');
    
    const tickInterval = 1000 / speed;
    let tickCount = 0;
    
    intervalRef.current = setInterval(() => {
      tickCount++;
      
      // Emit ticks for all active rentals
      setActiveRentals(prev => {
        const newMap = new Map(prev);
        newMap.forEach((rental, rentalId) => {
          const newSequence = rental.sequence + 1;
          const tickData = generateRentalTick(rentalId, newSequence, rental.data.pricePerSecond);
          mockSomnia.emitEvent(SCHEMA_IDS.RENTAL_TICK, tickData);
          newMap.set(rentalId, { ...rental, sequence: newSequence });
        });
        return newMap;
      });

      // Emit pricing suggestion every 5 ticks
      if (tickCount % 5 === 0) {
        const suggestion = generatePricingSuggestion(Math.floor(Math.random() * 10));
        mockSomnia.emitEvent(SCHEMA_IDS.PRICING_SUGGESTION, suggestion);
      }

      // Emit agent action every 8 ticks
      if (tickCount % 8 === 0) {
        const agentAction = generateAgentAction();
        mockSomnia.emitEvent(SCHEMA_IDS.AGENT_ACTION, agentAction);
      }
    }, tickInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, speed]);

  return {
    isRunning,
    speed,
    setSpeed,
    activeRentals,
    startSimulation,
    stopSimulation,
    resetSimulation,
    addRental,
    removeRental,
  };
}
