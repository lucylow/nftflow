/**
 * AI Agent Configuration
 * 
 * Centralized configuration for all AI agents in the NFTFlow system
 */

export interface AgentConfiguration {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  pollingInterval: number;
  maxActionsPerPeriod: number;
  riskThreshold: number;
  autoExecute: boolean;
  requiresApproval: boolean;
}

export const AI_AGENT_CONFIGS: Record<string, AgentConfiguration> = {
  intelligentRental: {
    id: 'intelligent-rental',
    name: 'Intelligent Rental Agent',
    type: 'intelligent_rental',
    enabled: true,
    pollingInterval: 60000, // 1 minute
    maxActionsPerPeriod: 100,
    riskThreshold: 0.7,
    autoExecute: false, // Requires user approval
    requiresApproval: true,
  },
  discovery: {
    id: 'discovery',
    name: 'Discovery Agent',
    type: 'discovery',
    enabled: false,
    pollingInterval: 300000, // 5 minutes
    maxActionsPerPeriod: 20,
    riskThreshold: 0.5,
    autoExecute: true,
    requiresApproval: false,
  },
  trustAssessment: {
    id: 'trust-assessment',
    name: 'Trust Assessment Agent',
    type: 'trust_assessment',
    enabled: false,
    pollingInterval: 120000, // 2 minutes
    maxActionsPerPeriod: 50,
    riskThreshold: 0.8,
    autoExecute: true,
    requiresApproval: false,
  },
  utilityOptimization: {
    id: 'utility-optimization',
    name: 'Utility Optimization Agent',
    type: 'utility_optimization',
    enabled: false,
    pollingInterval: 3600000, // 1 hour
    maxActionsPerPeriod: 10,
    riskThreshold: 0.6,
    autoExecute: false,
    requiresApproval: true,
  },
};

export const AI_AGENT_FEATURES = {
  intelligentRental: [
    'Real-time market data from DIA Oracle',
    'Automatic price adjustments',
    'Competitor tracking',
    'Performance-based optimization',
  ],
  discovery: [
    'User behavior analysis',
    'Collaborative filtering',
    'Success rate prediction',
    'Personalized recommendations',
  ],
  trustAssessment: [
    'On-chain behavior analysis',
    'Dynamic collateral calculation',
    'Risk factor identification',
    'Automated trust scoring',
  ],
  utilityOptimization: [
    'Idle asset detection',
    'Automatic renter matching',
    'Utilization tracking',
    'Revenue optimization',
  ],
};
