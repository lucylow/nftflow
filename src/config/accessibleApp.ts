export const accessibleAppConfig = {
  // AI Agent Configuration
  agents: {
    pricing: {
      name: 'AI Pricing Intelligence',
      description: 'Automatically optimizes rental prices using market analysis',
      endpoints: {
        analyze: '/api/ai/pricing/analyze',
        optimize: '/api/ai/pricing/optimize',
        predict: '/api/ai/pricing/predict'
      },
      accessibility: {
        keyboardShortcut: 'Alt+P',
        voiceCommands: [
          'activate pricing agent',
          'optimize prices',
          'show pricing analysis'
        ],
        ariaLabels: {
          active: 'Pricing intelligence agent active',
          inactive: 'Pricing intelligence agent inactive'
        }
      }
    },
    recommendation: {
      name: 'Smart Recommendation Engine',
      description: 'Provides personalized NFT recommendations using collaborative filtering',
      endpoints: {
        recommend: '/api/ai/recommendations/generate',
        train: '/api/ai/recommendations/train',
        evaluate: '/api/ai/recommendations/evaluate'
      },
      accessibility: {
        keyboardShortcut: 'Alt+R',
        voiceCommands: [
          'show recommendations',
          'find similar NFTs',
          'refresh suggestions'
        ],
        ariaLabels: {
          active: 'Recommendation engine active',
          inactive: 'Recommendation engine inactive'
        }
      }
    }
  },

  // Blockchain Configuration for Somnia
  blockchain: {
    network: {
      name: 'Somnia Testnet',
      chainId: 1337, // Update with actual Somnia Testnet ID
      rpcUrl: import.meta.env.VITE_SOMNIA_RPC_URL || 'https://testnet.somnia.network',
      explorer: import.meta.env.VITE_SOMNIA_EXPLORER || 'https://testnet.somnia.network/explorer'
    },
    contracts: {
      aiAgent: import.meta.env.VITE_AI_AGENT_CONTRACT || '0x...',
      nftFlow: import.meta.env.VITE_NFT_FLOW_CONTRACT || '0x...',
      reputation: import.meta.env.VITE_REPUTATION_CONTRACT || '0x...'
    },
    gasSettings: {
      maxFeePerGas: '5000000000', // 5 Gwei
      maxPriorityFeePerGas: '2000000000', // 2 Gwei
      gasLimit: '5000000'
    }
  },

  // Accessibility Configuration
  accessibility: {
    themes: {
      default: {
        colors: {
          primary: '#06b6d4',
          secondary: '#8b5cf6',
          background: '#0f172a',
          surface: '#1e293b',
          text: '#f8fafc',
          textMuted: '#cbd5e1'
        }
      },
      highContrast: {
        colors: {
          primary: '#000000',
          secondary: '#000000',
          background: '#ffffff',
          surface: '#f8f8f8',
          text: '#000000',
          textMuted: '#666666'
        }
      }
    },
    typography: {
      normal: {
        base: '16px',
        heading: '2rem',
        subheading: '1.5rem',
        body: '1rem'
      },
      large: {
        base: '18px',
        heading: '2.25rem',
        subheading: '1.75rem',
        body: '1.125rem'
      },
      xLarge: {
        base: '20px',
        heading: '2.5rem',
        subheading: '2rem',
        body: '1.25rem'
      }
    },
    animations: {
      enabled: {
        duration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      reduced: {
        duration: 0,
        easing: 'step-end'
      }
    }
  },

  // API Endpoints
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'https://api.nftflow.ai',
    endpoints: {
      // AI Agent Endpoints
      ai: {
        chat: '/v1/ai/chat',
        generateImage: '/v1/ai/generate-image',
        analyzeMarket: '/v1/ai/analyze-market',
        predictTrends: '/v1/ai/predict-trends'
      },
      // Blockchain Endpoints
      blockchain: {
        submitTransaction: '/v1/blockchain/submit',
        getTransactionStatus: '/v1/blockchain/status',
        getGasPrices: '/v1/blockchain/gas-prices'
      },
      // User Endpoints
      user: {
        preferences: '/v1/user/preferences',
        accessibility: '/v1/user/accessibility',
        history: '/v1/user/history'
      }
    }
  },

  // Feature Flags
  features: {
    aiAgents: true,
    voiceControl: true,
    highContrast: true,
    reducedMotion: true,
    keyboardNavigation: true,
    screenReader: true,
    realTimeUpdates: true
  }
};

// Utility functions for accessibility
export const accessibilityUtils = {
  // Generate ARIA labels based on agent state
  generateAriaLabel: (agent: any, action: string): string => {
    return `${agent.name}, ${agent.status}, ${action}`;
  },

  // Format numbers for screen readers
  formatNumberForScreenReader: (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  },

  // Generate keyboard shortcuts help text
  generateKeyboardHelp: (): string => {
    return `Keyboard Shortcuts Available:
    - Alt + 1: Dashboard
    - Alt + 2: Marketplace
    - Alt + 3: Agent Management
    - Alt + 4: Profile
    - Alt + R: Toggle Recommendations
    - Alt + A: Toggle Analytics
    - Tab: Navigate between elements
    - Shift + Tab: Navigate backwards
    - Enter/Space: Activate buttons`;
  },

  // Validate accessibility configuration
  validateAccessibilityConfig: (config: any): string[] => {
    const errors: string[] = [];
    
    if (!config.colors) errors.push('Color configuration missing');
    if (!config.typography) errors.push('Typography configuration missing');
    if (typeof config.highContrast !== 'boolean') errors.push('High contrast setting invalid');
    
    return errors;
  }
};
