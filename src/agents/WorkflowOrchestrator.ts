import { OpenAI } from 'openai';
import { ethers } from 'ethers';
import { RentalIntelligenceAgent } from './RentalIntelligenceAgent';
import { RecommendationAgent } from './RecommendationAgent';
import { CollateralAgent } from './CollateralAgent';
import { PricingAnalyst } from './PricingAnalyst';

/**
 * @title WorkflowOrchestrator
 * @dev Implements AgentFlow-inspired modular multi-agent system for NFTFlow
 * 
 * This orchestrator manages complex workflows by coordinating multiple specialized agents:
 * - Planner: Analyzes the task and creates an execution plan
 * - Executor: Executes actions on-chain or off-chain
 * - Verifier: Validates results and checks for anomalies
 * - Generator: Creates summaries and reports
 */
export interface WorkflowStep {
  agent: string;
  action: string;
  parameters: Record<string, any>;
  dependencies?: string[];
}

export interface WorkflowPlan {
  id: string;
  workflowType: 'rental_listing' | 'dynamic_pricing' | 'risk_assessment' | 'market_analysis';
  steps: WorkflowStep[];
  estimatedTime: number;
  confidence: number;
}

export interface WorkflowResult {
  success: boolean;
  results: Record<string, any>;
  verification: {
    passed: boolean;
    issues: string[];
  };
  summary: string;
  timestamp: number;
}

export class WorkflowOrchestrator {
  private openai: OpenAI;
  private provider: ethers.BrowserProvider | null;
  
  // Core agents
  private rentalAgent: RentalIntelligenceAgent;
  private recommendationAgent: RecommendationAgent;
  private collateralAgent: CollateralAgent;
  private pricingAgent: PricingAnalyst;
  
  private activeWorkflows: Map<string, WorkflowPlan> = new Map();

  constructor(
    apiKey: string,
    provider: ethers.BrowserProvider | null,
    contractAddress: string | null,
    contractABI: any[]
  ) {
    this.openai = new OpenAI({ apiKey });
    this.provider = provider;

    // Initialize all agents
    this.rentalAgent = new RentalIntelligenceAgent(apiKey, provider, contractAddress, contractABI);
    this.recommendationAgent = new RecommendationAgent(apiKey, provider);
    this.collateralAgent = new CollateralAgent(apiKey, provider, contractAddress);
    this.pricingAgent = new PricingAnalyst(apiKey, provider, contractAddress, contractABI);
  }

  /**
   * Main workflow execution: Planner -> Executor -> Verifier -> Generator
   */
  async executeWorkflow(workflowType: WorkflowPlan['workflowType'], context: any): Promise<WorkflowResult> {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Step 1: PLANNER - Create execution plan
      const plan = await this.planner.createPlan(workflowType, context);
      this.activeWorkflows.set(workflowId, plan);

      // Step 2: EXECUTOR - Execute workflow steps
      const results = await this.executor.executePlan(plan);

      // Step 3: VERIFIER - Validate results
      const verification = await this.verifier.verifyResults(plan, results);

      // Step 4: GENERATOR - Create summary report
      const summary = await this.generator.generateSummary(plan, results, verification);

      return {
        success: verification.passed,
        results,
        verification,
        summary,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Workflow ${workflowId} failed:`, error);
      throw error;
    } finally {
      this.activeWorkflows.delete(workflowId);
    }
  }

  /**
   * PLANNER Agent: Analyzes task and creates execution plan
   */
  private planner = {
    createPlan: async (
      workflowType: WorkflowPlan['workflowType'],
      context: any
    ): Promise<WorkflowPlan> => {
      const prompt = `
You are a Planner Agent for NFTFlow's AI orchestration system.

Workflow Type: ${workflowType}
Context: ${JSON.stringify(context, null, 2)}

Create an execution plan with sequential steps. Each step should specify:
1. Agent to use (rental_intelligence, recommendation, collateral, pricing)
2. Action to perform
3. Parameters required
4. Any dependencies on previous steps

Return JSON:
{
  "workflowType": "${workflowType}",
  "steps": [
    {
      "agent": "string",
      "action": "string",
      "parameters": {},
      "dependencies": []
    }
  ],
  "estimatedTime": number (seconds),
  "confidence": number (0-100)
}
`;

      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a strategic planning AI for NFT rental workflows.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3
        });

        const plan = JSON.parse(response.choices[0].message.content || '{}');
        plan.id = `plan_${Date.now()}`;
        return plan as WorkflowPlan;
      } catch (error) {
        console.error('Planner error:', error);
        // Return fallback plan
        return this.getDefaultPlan(workflowType, context);
      }
    }
  };

  /**
   * EXECUTOR Agent: Executes workflow steps
   */
  private executor = {
    executePlan: async (plan: WorkflowPlan): Promise<Record<string, any>> => {
      const results: Record<string, any> = {};
      
      for (const step of plan.steps) {
        try {
          console.log(`📋 Executing step: ${step.agent}.${step.action}`);
          const stepResult = await this.executeStep(step);
          results[`${step.agent}_${step.action}`] = stepResult;
        } catch (error) {
          console.error(`Step execution failed:`, error);
          results[`${step.agent}_${step.action}`] = { error: error.message };
        }
      }
      
      return results;
    },

    executeStep: async (step: WorkflowStep): Promise<any> => {
      const { agent, action, parameters } = step;

      switch (agent) {
        case 'rental_intelligence':
          if (action === 'analyze_pricing') {
            return await this.rentalAgent.generateRentalStrategy(parameters.nftContract, parameters.tokenId);
          }
          break;

        case 'recommendation':
          if (action === 'generate_recommendations') {
            return await this.recommendationAgent.generateRecommendations(parameters.userAddress, parameters.limit);
          }
          break;

        case 'collateral':
          if (action === 'assess_risk') {
            return await this.collateralAgent.assessRisk(parameters.renter, parameters.nftValue, parameters.duration);
          }
          break;

        case 'pricing':
          if (action === 'analyze_market') {
            return await this.pricingAgent.analyzePricing(parameters.nftContract, parameters.tokenId);
          }
          break;

        default:
          throw new Error(`Unknown agent: ${agent}`);
      }
    }
  };

  /**
   * VERIFIER Agent: Validates workflow results
   */
  private verifier = {
    verifyResults: async (
      plan: WorkflowPlan,
      results: Record<string, any>
    ): Promise<{ passed: boolean; issues: string[] }> => {
      const issues: string[] = [];
      
      // Check if all steps succeeded
      for (const step of plan.steps) {
        const key = `${step.agent}_${step.action}`;
        const result = results[key];
        
        if (result?.error) {
          issues.push(`Step ${key} failed: ${result.error}`);
        }
      }

      // Use AI to verify results quality
      const prompt = `
Verify the quality of these workflow results for ${plan.workflowType}:

Plan Steps:
${JSON.stringify(plan.steps, null, 2)}

Results:
${JSON.stringify(results, null, 2)}

Check for:
1. Data completeness
2. Logical consistency
3. Outliers or anomalies
4. Missing information

Return JSON:
{
  "passed": boolean,
  "issues": ["string"],
  "confidence": number
}
`;

      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a quality verification AI.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2
        });

        const aiVerification = JSON.parse(response.choices[0].message.content || '{}');
        
        return {
          passed: issues.length === 0 && aiVerification.passed !== false,
          issues: [...issues, ...(aiVerification.issues || [])]
        };
      } catch (error) {
        console.error('Verifier error:', error);
        return {
          passed: issues.length === 0,
          issues
        };
      }
    }
  };

  /**
   * GENERATOR Agent: Creates summary reports
   */
  private generator = {
    generateSummary: async (
      plan: WorkflowPlan,
      results: Record<string, any>,
      verification: { passed: boolean; issues: string[] }
    ): Promise<string> => {
      const prompt = `
Generate a comprehensive summary report for this ${plan.workflowType} workflow.

Plan: ${JSON.stringify(plan, null, 2)}
Results: ${JSON.stringify(results, null, 2)}
Verification: ${JSON.stringify(verification, null, 2)}

Create a markdown-formatted report with:
1. Executive summary
2. Key findings
3. Recommendations
4. Risk assessment (if any)
5. Next steps

Make it concise and actionable.
`;

      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an AI report generator specialized in blockchain analytics.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        });

        return response.choices[0].message.content || 'Summary unavailable.';
      } catch (error) {
        console.error('Generator error:', error);
        return `
# Workflow Summary

**Type:** ${plan.workflowType}
**Status:** ${verification.passed ? '✅ Success' : '❌ Failed'}
**Steps Executed:** ${plan.steps.length}
**Time:** ${plan.estimatedTime}s

${verification.issues.length > 0 ? `**Issues:** ${verification.issues.join(', ')}` : ''}
`;
      }
    }
  };

  /**
   * Fallback planner for common workflows
   */
  private getDefaultPlan(workflowType: WorkflowPlan['workflowType'], context: any): WorkflowPlan {
    const defaultPlans: Record<string, WorkflowPlan> = {
      rental_listing: {
        id: `plan_${Date.now()}`,
        workflowType: 'rental_listing',
        steps: [
          {
            agent: 'pricing',
            action: 'analyze_market',
            parameters: { nftContract: context.nftContract, tokenId: context.tokenId }
          },
          {
            agent: 'rental_intelligence',
            action: 'analyze_pricing',
            parameters: { nftContract: context.nftContract, tokenId: context.tokenId }
          }
        ],
        estimatedTime: 10,
        confidence: 70
      },
      dynamic_pricing: {
        id: `plan_${Date.now()}`,
        workflowType: 'dynamic_pricing',
        steps: [
          {
            agent: 'pricing',
            action: 'analyze_market',
            parameters: { nftContract: context.nftContract, tokenId: context.tokenId }
          }
        ],
        estimatedTime: 5,
        confidence: 80
      }
    };

    return defaultPlans[workflowType] || {
      id: `plan_${Date.now()}`,
      workflowType,
      steps: [],
      estimatedTime: 0,
      confidence: 0
    };
  }

  /**
   * Get active workflows
   */
  getActiveWorkflows(): WorkflowPlan[] {
    return Array.from(this.activeWorkflows.values());
  }

  /**
   * Get workflow history (would integrate with on-chain events)
   */
  async getWorkflowHistory(limit: number = 10): Promise<WorkflowResult[]> {
    // In production, this would query on-chain events
    return [];
  }
}

