import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { WorkflowOrchestrator, WorkflowResult } from '../agents/WorkflowOrchestrator';
import { useAccount } from 'wagmi';
import { useEthersProvider } from './useEthersProvider';
import { CONTRACT_ADDRESSES } from '../config/contracts';

export const useWorkflowOrchestrator = () => {
  const { address, isConnected } = useAccount();
  const provider = useEthersProvider();
  const [orchestrator, setOrchestrator] = useState<WorkflowOrchestrator | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeWorkflows, setActiveWorkflows] = useState<any[]>([]);
  const [workflowHistory, setWorkflowHistory] = useState<WorkflowResult[]>([]);

  useEffect(() => {
    const initializeOrchestrator = async () => {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey || !provider || !isConnected) {
        setIsInitialized(false);
        return;
      }

      try {
        // Import the NFT Flow ABI (you may need to adjust this path)
        const nftFlowABI = []; // You'll need to add the actual ABI
        
        const workflowOrchestrator = new WorkflowOrchestrator(
          apiKey,
          provider,
          CONTRACT_ADDRESSES.NFTFlow,
          nftFlowABI
        );

        setOrchestrator(workflowOrchestrator);
        setIsInitialized(true);
        console.log('✅ Workflow Orchestrator initialized');
      } catch (error) {
        console.error('Failed to initialize workflow orchestrator:', error);
        setIsInitialized(false);
      }
    };

    initializeOrchestrator();
  }, [provider, isConnected]);

  /**
   * Execute an intelligent NFT listing workflow
   */
  const executeIntelligentListing = useCallback(async (
    nftContract: string,
    tokenId: string,
    basePrice?: number
  ): Promise<WorkflowResult> => {
    if (!orchestrator) {
      throw new Error('Workflow orchestrator not initialized');
    }

    return await orchestrator.executeWorkflow('rental_listing', {
      nftContract,
      tokenId,
      basePrice: basePrice || 0
    });
  }, [orchestrator]);

  /**
   * Execute a dynamic pricing optimization workflow
   */
  const executePricingOptimization = useCallback(async (
    nftContract: string,
    tokenId: string
  ): Promise<WorkflowResult> => {
    if (!orchestrator) {
      throw new Error('Workflow orchestrator not initialized');
    }

    return await orchestrator.executeWorkflow('dynamic_pricing', {
      nftContract,
      tokenId
    });
  }, [orchestrator]);

  /**
   * Execute a comprehensive market analysis workflow
   */
  const executeMarketAnalysis = useCallback(async (
    nftContract: string,
    tokenId: string
  ): Promise<WorkflowResult> => {
    if (!orchestrator) {
      throw new Error('Workflow orchestrator not initialized');
    }

    return await orchestrator.executeWorkflow('market_analysis', {
      nftContract,
      tokenId,
      userAddress: address
    });
  }, [orchestrator, address]);

  /**
   * Execute a risk assessment workflow
   */
  const executeRiskAssessment = useCallback(async (
    renterAddress: string,
    nftValue: number,
    duration: number
  ): Promise<WorkflowResult> => {
    if (!orchestrator) {
      throw new Error('Workflow orchestrator not initialized');
    }

    return await orchestrator.executeWorkflow('risk_assessment', {
      renterAddress,
      nftValue,
      duration
    });
  }, [orchestrator]);

  /**
   * Get active workflows
   */
  const getActiveWorkflows = useCallback(() => {
    return orchestrator?.getActiveWorkflows() || [];
  }, [orchestrator]);

  /**
   * Get workflow history
   */
  const getWorkflowHistory = useCallback(async (limit: number = 10) => {
    if (!orchestrator) return [];
    
    const history = await orchestrator.getWorkflowHistory(limit);
    setWorkflowHistory(history);
    return history;
  }, [orchestrator]);

  return {
    isInitialized,
    orchestrator,
    activeWorkflows,
    workflowHistory,
    executeIntelligentListing,
    executePricingOptimization,
    executeMarketAnalysis,
    executeRiskAssessment,
    getActiveWorkflows,
    getWorkflowHistory
  };
};

