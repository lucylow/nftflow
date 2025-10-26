/**
 * AI Agent Service for NFTFlow - Somnia AI Hackathon Integration
 * 
 * This service implements AI-powered agents that automate and enhance the NFT rental experience:
 * - Intelligent Rental Agent: Automatically manages pricing and availability
 * - Personalized Discovery Agent: Recommends NFTs based on user behavior
 * - Collateral & Trust Agent: AI-driven risk assessment and collateral management
 * - Automated Utility Agent: Finds renters for idle assets
 */

import { ethers } from 'ethers';

// Agent Types
export enum AgentType {
  INTELLIGENT_RENTAL = 'intelligent_rental',
  DISCOVERY = 'discovery',
  TRUST_ASSESSMENT = 'trust_assessment',
  UTILITY_OPTIMIZATION = 'utility_optimization',
}

export enum AgentStatus {
  IDLE = 'idle',
  ACTIVE = 'active',
  PROCESSING = 'processing',
  ERROR = 'error',
}

export interface AgentAction {
  id: string;
  type: string;
  agentId: string;
  timestamp: number;
  description: string;
  result: 'success' | 'failed' | 'pending';
  metadata?: Record<string, unknown>;
}

export interface AgentConfig {
  enabled: boolean;
  pollingInterval: number;
  maxActionsPerPeriod: number;
  riskThreshold: number;
}

export interface RentalRecommendation {
  listingId: string;
  confidence: number;
  reason: string;
  expectedValue: number;
  riskScore: number;
}

export interface PriceAdjustment {
  suggestedPrice: number;
  reason: string;
  marketData?: {
    averagePrice: number;
    demandLevel: string;
    competitorCount: number;
  };
}

export interface TrustAssessment {
  userAddress: string;
  trustScore: number;
  riskFactors: string[];
  recommendations: string[];
  collateralMultiplier: number;
  requiresManualReview: boolean;
}

/**
 * Base AI Agent Interface
 */
export abstract class BaseAIAgent {
  protected agentId: string;
  protected config: AgentConfig;
  protected status: AgentStatus;
  protected actions: AgentAction[];

  constructor(agentId: string, config: AgentConfig) {
    this.agentId = agentId;
    this.config = config;
    this.status = AgentStatus.IDLE;
    this.actions = [];
  }

  abstract execute(contract: ethers.Contract, ...args: unknown[]): Promise<AgentAction>;

  getStatus(): AgentStatus {
    return this.status;
  }

  getActions(): AgentAction[] {
    return this.actions;
  }

  protected addAction(action: AgentAction): void {
    this.actions.push(action);
    // Keep only last 100 actions
    if (this.actions.length > 100) {
      this.actions = this.actions.slice(-100);
    }
  }

  async start(contract: ethers.Contract): Promise<void> {
    this.status = AgentStatus.ACTIVE;
    console.log(`${this.agentId} agent started`);
  }

  async stop(): Promise<void> {
    this.status = AgentStatus.IDLE;
    console.log(`${this.agentId} agent stopped`);
  }
}

/**
 * Intelligent Rental Agent
 * 
 * Automatically manages NFT rental pricing based on:
 * - Market demand from DIA Oracle
 * - Competitor prices
 * - Asset rarity and utility
 * - Historical rental performance
 */
export class IntelligentRentalAgent extends BaseAIAgent {
  private lastPriceUpdate: Record<string, number> = {};
  private marketDataCache: Map<string, any> = new Map();

  async execute(
    contract: ethers.Contract,
    listingId: string,
    currentPrice: number
  ): Promise<AgentAction> {
    this.status = AgentStatus.PROCESSING;

    try {
      // Fetch market data from oracle
      const marketData = await this.fetchMarketData(listingId);
      this.marketDataCache.set(listingId, marketData);

      // AI-powered price optimization
      const adjustment = await this.calculatePriceAdjustment(listingId, currentPrice, marketData);

      const action: AgentAction = {
        id: `action-${Date.now()}`,
        type: 'price_optimization',
        agentId: this.agentId,
        timestamp: Date.now(),
        description: `Suggested price adjustment: ${adjustment.reason}`,
        result: adjustment.suggestedPrice !== currentPrice ? 'success' : 'pending',
        metadata: {
          listingId,
          currentPrice,
          suggestedPrice: adjustment.suggestedPrice,
          reason: adjustment.reason,
          marketData: adjustment.marketData,
        },
      };

      // Auto-execute if adjustment is significant (>10% difference)
      if (Math.abs(adjustment.suggestedPrice - currentPrice) / currentPrice > 0.1) {
        // Can optionally auto-update price here with owner's permission
        action.result = 'success';
      }

      this.addAction(action);
      return action;
    } catch (error) {
      this.status = AgentStatus.ERROR;
      throw error;
    } finally {
      this.status = AgentStatus.ACTIVE;
    }
  }

  private async fetchMarketData(listingId: string): Promise<any> {
    // Simulated oracle data - in production, would fetch from DIA Oracle on Somnia
    return {
      averagePrice: 0.001,
      demandLevel: 'high',
      competitorCount: 5,
      historicalVolume: 150,
      priceTrend: 'increasing',
    };
  }

  private async calculatePriceAdjustment(
    listingId: string,
    currentPrice: number,
    marketData: any
  ): Promise<PriceAdjustment> {
    let suggestedPrice = currentPrice;
    let reason = 'No adjustment needed';

    // AI Logic for price adjustment
    const averagePrice = marketData.averagePrice;
    const demandLevel = marketData.demandLevel;

    if (demandLevel === 'high' && currentPrice < averagePrice * 0.9) {
      suggestedPrice = averagePrice * 1.1;
      reason = 'High demand detected - increasing price';
    } else if (demandLevel === 'low' && currentPrice > averagePrice * 1.1) {
      suggestedPrice = averagePrice * 0.9;
      reason = 'Low demand - reducing price for competitiveness';
    } else if (marketData.priceTrend === 'increasing') {
      suggestedPrice = currentPrice * 1.05;
      reason = 'Market trend increasing - slight price raise';
    }

    return {
      suggestedPrice,
      reason,
      marketData,
    };
  }
}

/**
 * Personalized Discovery Agent
 * 
 * Recommends NFTs based on:
 * - User rental history
 * - Similar user behavior patterns
 * - Asset popularity and performance
 * - Price range and collateral requirements
 */
export class PersonalizedDiscoveryAgent extends BaseAIAgent {
  private userProfiles: Map<string, any> = new Map();

  async execute(
    contract: ethers.Contract,
    userAddress: string,
    preferences: any
  ): Promise<AgentAction> {
    this.status = AgentStatus.PROCESSING;

    try {
      // Analyze user behavior
      const userProfile = await this.analyzeUserBehavior(userAddress, preferences);
      this.userProfiles.set(userAddress, userProfile);

      // Generate recommendations
      const recommendations = await this.generateRecommendations(userAddress, userProfile);

      const action: AgentAction = {
        id: `action-${Date.now()}`,
        type: 'recommendation',
        agentId: this.agentId,
        timestamp: Date.now(),
        description: `Generated ${recommendations.length} personalized recommendations`,
        result: recommendations.length > 0 ? 'success' : 'pending',
        metadata: {
          userAddress,
          recommendations,
          confidence: recommendations[0]?.confidence || 0,
        },
      };

      this.addAction(action);
      return action;
    } catch (error) {
      this.status = AgentStatus.ERROR;
      throw error;
    } finally {
      this.status = AgentStatus.ACTIVE;
    }
  }

  private async analyzeUserBehavior(userAddress: string, preferences: any): Promise<any> {
    // Simulated AI analysis - would use ML models in production
    return {
      preferredCategories: ['gaming', 'art'],
      averagePriceRange: [0.001, 0.01],
      rentalDurationPreference: 'short',
      riskTolerance: 'medium',
      pastRentals: 12,
      successfulRentals: 10,
    };
  }

  private async generateRecommendations(userAddress: string, profile: any): Promise<RentalRecommendation[]> {
    // Simulated recommendations - would match against listings in production
    return [
      {
        listingId: 'listing-001',
        confidence: 0.85,
        reason: 'Matches your gaming preference and price range',
        expectedValue: 0.005,
        riskScore: 0.2,
      },
      {
        listingId: 'listing-002',
        confidence: 0.75,
        reason: 'Similar users enjoyed this rental',
        expectedValue: 0.003,
        riskScore: 0.15,
      },
    ];
  }
}

/**
 * Collateral & Trust Agent
 * 
 * Uses AI to assess user trustworthiness and calculate collateral requirements:
 * - On-chain behavior analysis
 * - Rental history patterns
 * - Reputation system data
 * - Risk factor identification
 */
export class CollateralTrustAgent extends BaseAIAgent {
  private assessments: Map<string, TrustAssessment> = new Map();

  async execute(
    contract: ethers.Contract,
    userAddress: string,
    rentalValue: number
  ): Promise<AgentAction> {
    this.status = AgentStatus.PROCESSING;

    try {
      // Assess user trust
      const assessment = await this.assessTrustworthiness(userAddress, rentalValue);
      this.assessments.set(userAddress, assessment);

      const action: AgentAction = {
        id: `action-${Date.now()}`,
        type: 'trust_assessment',
        agentId: this.agentId,
        timestamp: Date.now(),
        description: `Trust score: ${assessment.trustScore}, Collateral: ${assessment.collateralMultiplier}x`,
        result: assessment.requiresManualReview ? 'pending' : 'success',
        metadata: {
          userAddress,
          assessment,
          collateralAmount: rentalValue * assessment.collateralMultiplier,
        },
      };

      this.addAction(action);
      return action;
    } catch (error) {
      this.status = AgentStatus.ERROR;
      throw error;
    } finally {
      this.status = AgentStatus.ACTIVE;
    }
  }

  private async assessTrustworthiness(userAddress: string, rentalValue: number): Promise<TrustAssessment> {
    // Simulated AI assessment - would analyze on-chain data
    const riskFactors: string[] = [];
    const recommendations: string[] = [];

    // Check reputation score
    let trustScore = 50; // Base score
    let collateralMultiplier = 1.0;

    // Simulate on-chain data fetch
    const userHistory = {
      totalRentals: 5,
      successfulRentals: 4,
      totalValue: 0.05,
      disputes: 0,
    };

    if (userHistory.successfulRentals / userHistory.totalRentals > 0.8) {
      trustScore += 20;
      recommendations.push('User has good rental history');
    } else {
      riskFactors.push('Low success rate');
      collateralMultiplier = 1.5;
    }

    if (rentalValue > userHistory.totalValue * 2) {
      riskFactors.push('Rental value exceeds user history');
      collateralMultiplier = 1.2;
    }

    if (userHistory.disputes > 0) {
      riskFactors.push('Previous disputes');
      trustScore -= 30;
      collateralMultiplier = 2.0;
    }

    return {
      userAddress,
      trustScore: Math.min(Math.max(trustScore, 0), 100),
      riskFactors,
      recommendations,
      collateralMultiplier,
      requiresManualReview: trustScore < 30 || riskFactors.length > 2,
    };
  }
}

/**
 * Automated Utility Agent
 * 
 * Automatically identifies idle assets and finds suitable renters:
 * - Tracks NFT utilization
 * - Identifies dormant assets
 * - Matches with potential renters
 * - Optimizes asset availability
 */
export class AutomatedUtilityAgent extends BaseAIAgent {
  private idleAssets: Map<string, any> = new Map();
  private potentialMatches: Map<string, string[]> = new Map();

  async execute(contract: ethers.Contract, userId: string): Promise<AgentAction> {
    this.status = AgentStatus.PROCESSING;

    try {
      // Identify idle assets
      const idleAssets = await this.identifyIdleAssets(userId);

      // Find potential renters
      const matches = await this.findPotentialRenters(idleAssets);

      const action: AgentAction = {
        id: `action-${Date.now()}`,
        type: 'utility_optimization',
        agentId: this.agentId,
        timestamp: Date.now(),
        description: `Found ${idleAssets.length} idle assets with ${matches.length} potential renters`,
        result: matches.length > 0 ? 'success' : 'pending',
        metadata: {
          userId,
          idleAssets,
          matches,
        },
      };

      this.addAction(action);
      return action;
    } catch (error) {
      this.status = AgentStatus.ERROR;
      throw error;
    } finally {
      this.status = AgentStatus.ACTIVE;
    }
  }

  private async identifyIdleAssets(userId: string): Promise<any[]> {
    // Simulated idle asset detection
    return [
      {
        tokenId: '123',
        daysInactive: 30,
        suggestedPrice: 0.003,
        potentialValue: 0.09,
      },
      {
        tokenId: '456',
        daysInactive: 15,
        suggestedPrice: 0.002,
        potentialValue: 0.03,
      },
    ];
  }

  private async findPotentialRenters(idleAssets: any[]): Promise<string[]> {
    // Simulated renter matching
    return ['user-001', 'user-002', 'user-003'];
  }
}

/**
 * AI Agent Service
 * 
 * Central service for managing all AI agents
 */
export class AIAgentService {
  private agents: Map<AgentType, BaseAIAgent> = new Map();
  private contract: ethers.Contract | null = null;

  constructor() {
    // Initialize agents with default configs
    const baseConfig: AgentConfig = {
      enabled: true,
      pollingInterval: 60000, // 1 minute
      maxActionsPerPeriod: 100,
      riskThreshold: 0.7,
    };

    this.agents.set(AgentType.INTELLIGENT_RENTAL, new IntelligentRentalAgent('rental-agent-1', baseConfig));
    this.agents.set(AgentType.DISCOVERY, new PersonalizedDiscoveryAgent('discovery-agent-1', baseConfig));
    this.agents.set(AgentType.TRUST_ASSESSMENT, new CollateralTrustAgent('trust-agent-1', baseConfig));
    this.agents.set(AgentType.UTILITY_OPTIMIZATION, new AutomatedUtilityAgent('utility-agent-1', baseConfig));
  }

  setContract(contract: ethers.Contract): void {
    this.contract = contract;
  }

  async startAgent(agentType: AgentType): Promise<void> {
    const agent = this.agents.get(agentType);
    if (!agent) throw new Error(`Agent ${agentType} not found`);

    if (this.contract) {
      await agent.start(this.contract);
    }
  }

  async stopAgent(agentType: AgentType): Promise<void> {
    const agent = this.agents.get(agentType);
    if (!agent) throw new Error(`Agent ${agentType} not found`);

    await agent.stop();
  }

  getAgentStatus(agentType: AgentType): AgentStatus | null {
    const agent = this.agents.get(agentType);
    return agent ? agent.getStatus() : null;
  }

  getAgentActions(agentType: AgentType): AgentAction[] {
    const agent = this.agents.get(agentType);
    return agent ? agent.getActions() : [];
  }

  async executeAgent(agentType: AgentType, ...args: unknown[]): Promise<AgentAction | null> {
    if (!this.contract) throw new Error('Contract not set');

    const agent = this.agents.get(agentType);
    if (!agent) throw new Error(`Agent ${agentType} not found`);

    return await agent.execute(this.contract, ...args);
  }

  getAllAgents(): Map<AgentType, BaseAIAgent> {
    return this.agents;
  }
}

// Export singleton instance
export const aiAgentService = new AIAgentService();
