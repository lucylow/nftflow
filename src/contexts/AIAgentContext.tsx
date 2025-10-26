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
    isInitialized,
    getPersonalizedRecommendations,
    assessRentalRisk,
    agents,
  } = useAIAgents();

  const { toast } = useToast();

  const [intelligentRentalActive, setIntelligentRentalActive] = useState(false);
  const [discoveryActive, setDiscoveryActive] = useState(false);
  const [trustAssessmentActive, setTrustAssessmentActive] = useState(false);
  const [utilityOptimizationActive, setUtilityOptimizationActive] = useState(false);
  const [recentActions, setRecentActions] = useState<AgentAction[]>([]);

  const toggleIntelligentRental = async () => {
    setIntelligentRentalActive(!intelligentRentalActive);
    toast({
      title: intelligentRentalActive ? 'Intelligent Rental Agent Disabled' : 'Intelligent Rental Agent Enabled',
      description: intelligentRentalActive 
        ? 'Automated price management has been turned off'
        : 'AI will now automatically optimize your rental prices',
    });
  };

  const toggleDiscovery = async () => {
    setDiscoveryActive(!discoveryActive);
    toast({
      title: discoveryActive ? 'Discovery Agent Disabled' : 'Discovery Agent Enabled',
      description: discoveryActive
        ? 'Personalized recommendations have been turned off'
        : 'Get personalized NFT recommendations based on your preferences',
    });
  };

  const toggleTrustAssessment = async () => {
    setTrustAssessmentActive(!trustAssessmentActive);
    toast({
      title: trustAssessmentActive ? 'Trust Assessment Agent Disabled' : 'Trust Assessment Agent Enabled',
      description: trustAssessmentActive
        ? 'AI-powered risk analysis has been turned off'
        : 'AI will now analyze user trustworthiness and collateral needs',
    });
  };

  const toggleUtilityOptimization = async () => {
    setUtilityOptimizationActive(!utilityOptimizationActive);
    toast({
      title: utilityOptimizationActive ? 'Utility Optimization Agent Disabled' : 'Utility Optimization Agent Enabled',
      description: utilityOptimizationActive
        ? 'Asset utilization optimization has been turned off'
        : 'AI will automatically find renters for your idle assets',
    });
  };

  const assessUserTrust = async (userAddress: string, rentalValue: number) => {
    try {
      const assessment = await assessRentalRisk(userAddress, rentalValue, 3600);
      return assessment;
    } catch (error) {
      console.error('Failed to assess user trust:', error);
      return null;
    }
  };

  const optimizeAssetUtility = async () => {
    // Placeholder implementation
    return [];
  };

  // Mock implementations for missing methods
  const getPriceSuggestion = async (listingId: string, currentPrice: number) => {
    return { suggestedPrice: currentPrice, reason: 'AI analysis not available yet' };
  };

  const getRecommendations = async (preferences?: any) => {
    try {
      if (isInitialized && getPersonalizedRecommendations) {
        return await getPersonalizedRecommendations(10);
      }
      return [];
    } catch (error) {
      console.error('Failed to get recommendations:', error);
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
