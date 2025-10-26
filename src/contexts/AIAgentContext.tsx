import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAIAgents } from '@/hooks/useAIAgents';
import { AgentType, AgentStatus, AgentAction } from '@/services/AIAgentService';
import { useToast } from '@/hooks/use-toast';

interface AIAgentContextType {
  // Agent Status
  intelligentRentalActive: boolean;
  discoveryActive: boolean;
  trustAssessmentActive: boolean;
  utilityOptimizationActive: boolean;

  // Agent Actions
  recentActions: AgentAction[];
  
  // Control Functions
  toggleIntelligentRental: () => Promise<void>;
  toggleDiscovery: () => Promise<void>;
  toggleTrustAssessment: () => Promise<void>;
  toggleUtilityOptimization: () => Promise<void>;

  // Agent-specific functions
  getPriceSuggestion: (listingId: string, currentPrice: number) => Promise<any>;
  getRecommendations: (preferences?: any) => Promise<any[]>;
  assessUserTrust: (userAddress: string, rentalValue: number) => Promise<any>;
  optimizeAssetUtility: () => Promise<any[]>;
}

const AIAgentContext = createContext<AIAgentContextType | undefined>(undefined);

export const useAIAgentContext = () => {
  const context = useContext(AIAgentContext);
  if (context === undefined) {
    throw new Error('useAIAgentContext must be used within AIAgentProvider');
  }
  return context;
};

interface AIAgentProviderProps {
  children: ReactNode;
}

export const AIAgentProvider: React.FC<AIAgentProviderProps> = ({ children }) => {
  const {
    startAgent,
    stopAgent,
    getPriceSuggestion,
    getRecommendations,
    assessTrust,
    optimizeUtility,
    isAgentActive,
  } = useAIAgents();

  const { toast } = useToast();

  const [intelligentRentalActive, setIntelligentRentalActive] = useState(false);
  const [discoveryActive, setDiscoveryActive] = useState(false);
  const [trustAssessmentActive, setTrustAssessmentActive] = useState(false);
  const [utilityOptimizationActive, setUtilityOptimizationActive] = useState(false);
  const [recentActions, setRecentActions] = useState<AgentAction[]>([]);

  // Sync agent states
  useEffect(() => {
    setIntelligentRentalActive(isAgentActive(AgentType.INTELLIGENT_RENTAL));
    setDiscoveryActive(isAgentActive(AgentType.DISCOVERY));
    setTrustAssessmentActive(isAgentActive(AgentType.TRUST_ASSESSMENT));
    setUtilityOptimizationActive(isAgentActive(AgentType.UTILITY_OPTIMIZATION));
  }, [isAgentActive]);

  const toggleIntelligentRental = async () => {
    if (intelligentRentalActive) {
      await stopAgent(AgentType.INTELLIGENT_RENTAL);
      setIntelligentRentalActive(false);
      toast({
        title: 'Intelligent Rental Agent Disabled',
        description: 'Automated price management has been turned off',
      });
    } else {
      await startAgent(AgentType.INTELLIGENT_RENTAL);
      setIntelligentRentalActive(true);
      toast({
        title: 'Intelligent Rental Agent Enabled',
        description: 'AI will now automatically optimize your rental prices',
      });
    }
  };

  const toggleDiscovery = async () => {
    if (discoveryActive) {
      await stopAgent(AgentType.DISCOVERY);
      setDiscoveryActive(false);
      toast({
        title: 'Discovery Agent Disabled',
        description: 'Personalized recommendations have been turned off',
      });
    } else {
      await startAgent(AgentType.DISCOVERY);
      setDiscoveryActive(true);
      toast({
        title: 'Discovery Agent Enabled',
        description: 'Get personalized NFT recommendations based on your preferences',
      });
    }
  };

  const toggleTrustAssessment = async () => {
    if (trustAssessmentActive) {
      await stopAgent(AgentType.TRUST_ASSESSMENT);
      setTrustAssessmentActive(false);
      toast({
        title: 'Trust Assessment Agent Disabled',
        description: 'AI-powered risk analysis has been turned off',
      });
    } else {
      await startAgent(AgentType.TRUST_ASSESSMENT);
      setTrustAssessmentActive(true);
      toast({
        title: 'Trust Assessment Agent Enabled',
        description: 'AI will now analyze user trustworthiness and collateral needs',
      });
    }
  };

  const toggleUtilityOptimization = async () => {
    if (utilityOptimizationActive) {
      await stopAgent(AgentType.UTILITY_OPTIMIZATION);
      setUtilityOptimizationActive(false);
      toast({
        title: 'Utility Optimization Agent Disabled',
        description: 'Asset utilization optimization has been turned off',
      });
    } else {
      await startAgent(AgentType.UTILITY_OPTIMIZATION);
      setUtilityOptimizationActive(true);
      toast({
        title: 'Utility Optimization Agent Enabled',
        description: 'AI will automatically find renters for your idle assets',
      });
    }
  };

  const assessUserTrust = async (userAddress: string, rentalValue: number) => {
    try {
      const assessment = await assessTrust(userAddress, rentalValue);
      return assessment;
    } catch (error) {
      console.error('Failed to assess user trust:', error);
      return null;
    }
  };

  const optimizeAssetUtility = async () => {
    try {
      const assets = await optimizeUtility();
      return assets;
    } catch (error) {
      console.error('Failed to optimize asset utility:', error);
      return [];
    }
  };

  const value: AIAgentContextType = {
    intelligentRentalActive,
    discoveryActive,
    trustAssessmentActive,
    utilityOptimizationActive,
    recentActions,
    toggleIntelligentRental,
    toggleDiscovery,
    toggleTrustAssessment,
    toggleUtilityOptimization,
    getPriceSuggestion,
    getRecommendations,
    assessUserTrust,
    optimizeAssetUtility,
  };

  return (
    <AIAgentContext.Provider value={value}>
      {children}
    </AIAgentContext.Provider>
  );
};
