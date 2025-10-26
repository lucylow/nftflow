/**
 * AI Configuration for NFTFlow
 * 
 * Centralized configuration for AI models, providers, and workflows
 */

export const AIConfig = {
  // API Keys (use environment variables in production)
  apiKeys: {
    // @ts-ignore - import.meta.env is available at runtime
    openai: import.meta?.env?.VITE_OPENAI_API_KEY || '',
    // @ts-ignore
    anthropic: import.meta?.env?.VITE_ANTHROPIC_API_KEY || '',
    // @ts-ignore
    replicate: import.meta?.env?.VITE_REPLICATE_API_KEY || '',
    // @ts-ignore
    google: import.meta?.env?.VITE_GOOGLE_API_KEY || ''
  },

  // Model Defaults
  defaults: {
    temperature: {
      creative: 0.8,
      analytical: 0.3,
      balanced: 0.7
    },
    maxTokens: {
      short: 500,
      medium: 1500,
      long: 4000
    },
    timeout: 30000 // 30 seconds
  },

  // Budget Limits
  budgets: {
    low: {
      maxCostPerRequest: 0.10,
      preferredModels: ['gpt-4o-mini', 'claude-3-haiku', 'gemini-1.5-flash']
    },
    medium: {
      maxCostPerRequest: 0.50,
      preferredModels: ['gpt-4o', 'claude-3-5-sonnet', 'gemini-1.5-pro']
    },
    high: {
      maxCostPerRequest: 2.00,
      preferredModels: ['gpt-4o', 'claude-3-5-sonnet', 'llama-3.1-405b']
    }
  },

  // Rate Limiting
  rateLimits: {
    openai: { requestsPerMinute: 60 },
    anthropic: { requestsPerMinute: 40 },
    replicate: { requestsPerMinute: 30 },
    google: { requestsPerMinute: 60 }
  },

  // Workflow Configuration
  workflows: {
    intelligentListing: {
      enabled: true,
      primaryModel: 'claude-3-5-sonnet',
      fallbackModels: ['gpt-4o', 'gpt-4o-mini'],
      budget: 'medium' as const
    },
    marketAnalysis: {
      enabled: true,
      primaryModel: 'gpt-4o-mini',
      fallbackModels: ['claude-3-haiku', 'gemini-1.5-flash'],
      budget: 'low' as const
    },
    contentGeneration: {
      enabled: true,
      primaryModel: 'gpt-4o',
      fallbackModels: ['claude-3-5-sonnet', 'gemini-1.5-pro'],
      budget: 'medium' as const
    },
    riskAssessment: {
      enabled: true,
      primaryModel: 'gpt-4o',
      fallbackModels: ['claude-3-5-sonnet', 'gemini-1.5-pro'],
      budget: 'medium' as const
    }
  },

  // Feature Flags
  features: {
    enableFallbacks: true,
    enableCostTracking: true,
    enableLatencyMetrics: true,
    enableErrorRetry: true
  }
};

export default AIConfig;

