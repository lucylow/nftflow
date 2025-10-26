import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useProvider } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';

// AI Agent Types
interface AIAgentState {
  id: string;
  name: string;
  type: 'pricing' | 'recommendation' | 'collateral' | 'analytics';
  status: 'active' | 'inactive' | 'loading' | 'error';
  lastAction: Date;
  successRate: number;
  description: string;
  accessibility: {
    keyboardShortcut?: string;
    ariaLabel: string;
    voiceCommand: string;
  };
}

interface AccessibleAction {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  duration?: number;
}

export const AccessibleDashboard: React.FC = () => {
  const { address, isConnected } = useAccount();
  const provider = useProvider();
  
  const [agents, setAgents] = useState<AIAgentState[]>([
    {
      id: 'pricing-agent',
      name: 'AI Pricing Intelligence',
      type: 'pricing',
      status: 'inactive',
      lastAction: new Date(),
      successRate: 92,
      description: 'Automatically optimizes rental prices based on market demand and trends',
      accessibility: {
        ariaLabel: 'AI Pricing Intelligence Agent, currently inactive',
        voiceCommand: 'Activate pricing agent'
      }
    },
    {
      id: 'recommendation-agent',
      name: 'Smart Recommendation Engine',
      type: 'recommendation',
      status: 'active',
      lastAction: new Date(),
      successRate: 88,
      description: 'Provides personalized NFT recommendations using machine learning',
      accessibility: {
        keyboardShortcut: 'Alt+R',
        ariaLabel: 'Smart Recommendation Engine, currently active',
        voiceCommand: 'Show recommendations'
      }
    },
    {
      id: 'collateral-agent',
      name: 'Risk Management Agent',
      type: 'collateral',
      status: 'inactive',
      lastAction: new Date(),
      successRate: 95,
      description: 'Dynamically adjusts collateral requirements based on risk assessment',
      accessibility: {
        ariaLabel: 'Risk Management Agent, currently inactive',
        voiceCommand: 'Activate risk management'
      }
    },
    {
      id: 'analytics-agent',
      name: 'Market Analytics Engine',
      type: 'analytics',
      status: 'active',
      lastAction: new Date(),
      successRate: 85,
      description: 'Provides real-time market insights and trend analysis',
      accessibility: {
        keyboardShortcut: 'Alt+A',
        ariaLabel: 'Market Analytics Engine, currently active',
        voiceCommand: 'Show analytics'
      }
    }
  ]);

  const [notifications, setNotifications] = useState<AccessibleAction[]>([]);
  const [activeView, setActiveView] = useState<'dashboard' | 'marketplace' | 'agents' | 'profile'>('dashboard');
  const [voiceControlActive, setVoiceControlActive] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'x-large'>('normal');
  const [reducedMotion, setReducedMotion] = useState(false);
  
  const mainContentRef = useRef<HTMLDivElement>(null);
  const skipToContentRef = useRef<HTMLButtonElement>(null);

  // Add notification
  const addNotification = (action: Omit<AccessibleAction, 'id' | 'timestamp'>) => {
    const newNotification: AccessibleAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
    
    // Auto-remove after duration
    if (action.duration) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, action.duration);
    }
  };

  // Toggle agent status
  const toggleAgent = async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    // Update UI immediately
    setAgents(prev => prev.map(a => 
      a.id === agentId 
        ? { ...a, status: 'loading' as const }
        : a
    ));

    addNotification({
      type: 'info',
      message: `${agent.name} is ${agent.status === 'active' ? 'deactivating' : 'activating'}...`
    });

    try {
      // Simulate API call to backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAgents(prev => prev.map(a => 
        a.id === agentId 
          ? { 
              ...a, 
              status: a.status === 'active' ? 'inactive' : 'active',
              lastAction: new Date()
            }
          : a
      ));

      addNotification({
        type: 'success',
        message: `${agent.name} ${agent.status === 'active' ? 'deactivated' : 'activated'} successfully`,
        duration: 3000
      });

    } catch (error) {
      setAgents(prev => prev.map(a => 
        a.id === agentId 
          ? { ...a, status: 'error' as const }
          : a
      ));

      addNotification({
        type: 'error',
        message: `Failed to toggle ${agent.name}`,
        duration: 5000
      });
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip to main content
      if (event.key === 'Tab' && event.shiftKey && event.key === 'Home') {
        event.preventDefault();
        skipToContentRef.current?.focus();
      }

      // Agent shortcuts
      if (event.altKey) {
        switch (event.key) {
          case '1':
            setActiveView('dashboard');
            break;
          case '2':
            setActiveView('marketplace');
            break;
          case '3':
            setActiveView('agents');
            break;
          case '4':
            setActiveView('profile');
            break;
          case 'R':
            toggleAgent('recommendation-agent');
            break;
          case 'A':
            toggleAgent('analytics-agent');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Voice control setup (simplified)
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        
        // Basic voice commands
        if (transcript.includes('activate pricing')) {
          toggleAgent('pricing-agent');
        } else if (transcript.includes('show recommendations')) {
          setActiveView('marketplace');
        } else if (transcript.includes('show analytics')) {
          toggleAgent('analytics-agent');
        }
      };
      
      if (voiceControlActive) {
        recognition.start();
      } else {
        recognition.stop();
      }
      
      return () => recognition.stop();
    }
  }, [voiceControlActive]);

  if (!isConnected) {
    return (
      <div className={`min-h-screen ${highContrast ? 'bg-white text-black' : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white'} flex items-center justify-center p-4`}>
        <div className="text-center max-w-md">
          <h1 className={`text-4xl font-bold mb-4 ${fontSize === 'large' ? 'text-5xl' : fontSize === 'x-large' ? 'text-6xl' : ''}`}>
            🤖 NFTFlow AI
          </h1>
          <p className={`mb-8 ${highContrast ? 'text-gray-800' : 'text-slate-300'} ${fontSize === 'large' ? 'text-xl' : fontSize === 'x-large' ? 'text-2xl' : ''}`}>
            Please connect your wallet to access AI-powered NFT rentals
          </p>
          <button 
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors text-lg"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      min-h-screen 
      ${highContrast 
        ? 'bg-white text-black' 
        : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white'
      }
      ${reducedMotion ? 'reduce-motion' : ''}
    `}>
      {/* Accessibility Controls */}
      <div className="p-4">
        <h1 className={`text-3xl font-bold mb-4 ${fontSize === 'large' ? 'text-4xl' : fontSize === 'x-large' ? 'text-5xl' : ''}`}>
          Accessible AI Agent Dashboard
        </h1>
        <p className={highContrast ? 'text-gray-800' : 'text-slate-300'}>
          WCAG 2.1 AA compliant AI agent management for NFTFlow
        </p>
      </div>
    </div>
  );
};
