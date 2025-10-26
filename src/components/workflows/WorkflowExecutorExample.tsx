import React, { useState } from 'react';
import { useWorkflowOrchestrator } from '../../hooks/useWorkflowOrchestrator';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, FileText, TrendingUp, Shield } from 'lucide-react';

/**
 * Example component demonstrating the enhanced Workflow Orchestrator
 * Shows how to use the AgentFlow-inspired multi-agent system
 */
export const WorkflowExecutorExample: React.FC = () => {
  const {
    isInitialized,
    executeIntelligentListing,
    executePricingOptimization,
    executeMarketAnalysis,
    executeRiskAssessment,
    activeWorkflows,
    workflowHistory
  } = useWorkflowOrchestrator();

  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  if (!isInitialized) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" />
          <span>Initializing workflow orchestrator...</span>
        </div>
      </Card>
    );
  }

  const executeWorkflow = async (
    workflowName: string,
    executor: () => Promise<any>
  ) => {
    setActiveWorkflow(workflowName);
    setLoading(true);
    setResults(null);

    try {
      const result = await executor();
      setResults(result);
    } catch (error) {
      console.error('Workflow execution failed:', error);
      setResults({ error: error.message });
    } finally {
      setLoading(false);
      setActiveWorkflow(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Workflow Orchestrator Examples</h2>
        <p className="text-muted-foreground mb-6">
          Demonstrates the AgentFlow-inspired modular multi-agent system (Planner → Executor → Verifier → Generator)
        </p>

        {/* Workflow Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            onClick={() => executeWorkflow('intelligent_listing', () =>
              executeIntelligentListing('0xExampleNFT', '123', 0.001)
            )}
            disabled={loading}
            className="h-24 flex-col gap-2"
          >
            <FileText className="w-6 h-6" />
            Intelligent Listing
            <span className="text-xs opacity-75">Analyze → Price → List</span>
          </Button>

          <Button
            onClick={() => executeWorkflow('pricing_optimization', () =>
              executePricingOptimization('0xExampleNFT', '123')
            )}
            disabled={loading}
            variant="outline"
            className="h-24 flex-col gap-2"
          >
            <TrendingUp className="w-6 h-6" />
            Pricing Optimization
            <span className="text-xs opacity-75">Multi-agent workflow</span>
          </Button>

          <Button
            onClick={() => executeWorkflow('market_analysis', () =>
              executeMarketAnalysis('0xExampleNFT', '123')
            )}
            disabled={loading}
            variant="outline"
            className="h-24 flex-col gap-2"
          >
            <FileText className="w-6 h-6" />
            Market Analysis
            <span className="text-xs opacity-75">Deep market insights</span>
          </Button>

          <Button
            onClick={() => executeWorkflow('risk_assessment', () =>
              executeRiskAssessment('0x1234567890123456789012345678901234567890', 100, 3600)
            )}
            disabled={loading}
            variant="outline"
            className="h-24 flex-col gap-2"
          >
            <Shield className="w-6 h-6" />
            Risk Assessment
            <span className="text-xs opacity-75">Collateral analysis</span>
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" />
              <span>Executing {activeWorkflow} workflow...</span>
            </div>
          </Card>
        )}

        {/* Results Display */}
        {results && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              {results.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <h3 className="text-lg font-semibold">Workflow Results</h3>
              <Badge variant={results.success ? 'default' : 'destructive'}>
                {results.success ? 'Success' : 'Failed'}
              </Badge>
            </div>

            {/* Verification Results */}
            {results.verification && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Verification</h4>
                <div className="space-y-1">
                  <Badge variant={results.verification.passed ? 'default' : 'destructive'}>
                    {results.verification.passed ? 'Passed' : 'Failed'}
                  </Badge>
                  {results.verification.issues && results.verification.issues.length > 0 && (
                    <ul className="list-disc list-inside text-sm text-muted-foreground ml-2">
                      {results.verification.issues.map((issue: string, i: number) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Summary */}
            {results.summary && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Summary</h4>
                <div className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">
                  {results.summary}
                </div>
              </div>
            )}

            {/* Results Data */}
            {results.results && (
              <details className="mt-4">
                <summary className="cursor-pointer font-medium">
                  View Raw Results
                </summary>
                <pre className="mt-2 text-xs bg-muted p-3 rounded-md overflow-auto">
                  {JSON.stringify(results.results, null, 2)}
                </pre>
              </details>
            )}

            {/* Error Display */}
            {results.error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                {results.error}
              </div>
            )}
          </Card>
        )}

        {/* Active Workflows */}
        {activeWorkflows.length > 0 && (
          <Card className="p-4">
            <h3 className="font-medium mb-2">Active Workflows: {activeWorkflows.length}</h3>
            <div className="text-sm text-muted-foreground">
              Currently executing workflows...
            </div>
          </Card>
        )}
      </Card>

      {/* Documentation Link */}
      <Card className="p-4 bg-blue-50">
        <p className="text-sm text-blue-900">
          📖 <strong>Learn More:</strong> See{' '}
          <a
            href="/docs/ai-agents/ENHANCED_WORKFLOW_ORCHESTRATOR.md"
            className="underline"
          >
            ENHANCED_WORKFLOW_ORCHESTRATOR.md
          </a>{' '}
          for complete documentation on the workflow orchestrator system.
        </p>
      </Card>
    </div>
  );
};

