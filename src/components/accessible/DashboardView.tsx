import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DashboardViewProps {
  agents: any[];
  toggleAgent: (agentId: string) => void;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'x-large';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  agents,
  toggleAgent,
  highContrast,
  fontSize
}) => {
  const fontSizeClasses = {
    normal: 'text-base',
    large: 'text-lg',
    'x-large': 'text-xl'
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="text-green-500" size={20} aria-hidden="true" />;
      case 'loading':
        return <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" aria-label="Loading" />;
      case 'error':
        return <AlertCircle className="text-red-500" size={20} aria-hidden="true" />;
      default:
        return <Pause className="text-slate-500" size={20} aria-hidden="true" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return highContrast ? 'bg-green-600 text-white' : 'bg-green-500/20 text-green-400';
      case 'loading':
        return highContrast ? 'bg-yellow-600 text-white' : 'bg-yellow-500/20 text-yellow-400';
      case 'error':
        return highContrast ? 'bg-red-600 text-white' : 'bg-red-500/20 text-red-400';
      default:
        return highContrast ? 'bg-gray-600 text-white' : 'bg-slate-700 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <section 
        className={`
          rounded-2xl p-6
          ${highContrast 
            ? 'bg-white text-black border-4 border-black' 
            : 'bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border border-slate-700'
          }
        `}
        aria-labelledby="welcome-heading"
      >
        <h1 
          id="welcome-heading"
          className={`
            font-bold mb-2
            ${fontSize === 'large' ? 'text-3xl' : fontSize === 'x-large' ? 'text-4xl' : 'text-2xl'}
          `}
        >
          🤖 AI Agent Dashboard
        </h1>
        <p className={`${highContrast ? 'text-gray-800' : 'text-slate-300'} ${fontSizeClasses[fontSize]}`}>
          Manage your autonomous AI agents for optimal NFT rental performance
        </p>
      </section>

      {/* Agent Grid */}
      <section aria-labelledby="agents-heading">
        <h2 id="agents-heading" className="sr-only">
          AI Agents Management
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                rounded-xl p-6 border-2 transition-all
                ${highContrast 
                  ? agent.status === 'active' 
                    ? 'bg-green-100 border-green-600' 
                    : 'bg-white border-black'
                  : 'bg-slate-800/50 border-slate-700'
                }
                hover:shadow-lg focus-within:ring-4 focus-within:ring-cyan-300
              `}
              tabIndex={0}
              role="article"
              aria-labelledby={`${agent.id}-title`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(agent.status)}
                  <h3 
                    id={`${agent.id}-title`}
                    className={`
                      font-semibold
                      ${fontSize === 'large' ? 'text-xl' : fontSize === 'x-large' ? 'text-2xl' : 'text-lg'}
                    `}
                  >
                    {agent.name}
                  </h3>
                </div>
                
                <span 
                  className={`
                    px-3 py-1 rounded-full text-xs font-semibold
                    ${getStatusColor(agent.status)}
                  `}
                >
                  {agent.status.toUpperCase()}
                </span>
              </div>

              <p 
                className={`
                  mb-4
                  ${highContrast ? 'text-gray-700' : 'text-slate-400'}
                  ${fontSizeClasses[fontSize]}
                `}
              >
                {agent.description}
              </p>

              <div className="space-y-3">
                {/* Agent Metrics */}
                <div className="flex justify-between text-sm">
                  <span className={highContrast ? 'text-gray-600' : 'text-slate-500'}>
                    Success Rate
                  </span>
                  <span className={highContrast ? 'text-green-700 font-bold' : 'text-green-400 font-semibold'}>
                    {agent.successRate}%
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className={highContrast ? 'text-gray-600' : 'text-slate-500'}>
                    Last Action
                  </span>
                  <span className={highContrast ? 'text-gray-800' : 'text-slate-300'}>
                    {agent.lastAction.toLocaleTimeString()}
                  </span>
                </div>

                {/* Toggle Button */}
                <button
                  onClick={() => toggleAgent(agent.id)}
                  disabled={agent.status === 'loading'}
                  className={`
                    w-full py-3 rounded-lg font-semibold transition-all
                    flex items-center justify-center gap-2
                    ${agent.status === 'active'
                      ? highContrast
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30'
                      : highContrast
                        ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                        : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    }
                    ${agent.status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''}
                    focus:outline-none focus:ring-2 focus:ring-cyan-300
                  `}
                  aria-label={`${agent.status === 'active' ? 'Deactivate' : 'Activate'} ${agent.name}`}
                  aria-describedby={`${agent.id}-status`}
                >
                  {agent.status === 'loading' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                      Processing...
                    </>
                  ) : agent.status === 'active' ? (
                    <>
                      <Pause size={18} aria-hidden="true" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Play size={18} aria-hidden="true" />
                      Activate
                    </>
                  )}
                </button>

                {/* Accessibility Info */}
                <div className="text-xs text-slate-500">
                  {agent.accessibility.keyboardShortcut && (
                    <div>Shortcut: {agent.accessibility.keyboardShortcut}</div>
                  )}
                  <div>Voice: &quot;{agent.accessibility.voiceCommand}&quot;</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        aria-labelledby="stats-heading"
      >
        <h2 id="stats-heading" className="sr-only">
          Platform Statistics
        </h2>
        
        {[
          { label: 'Active Agents', value: agents.filter(a => a.status === 'active').length, total: agents.length },
          { label: 'AI Decisions', value: '439', trend: '+12%' },
          { label: 'Revenue Generated', value: '2.4K STT', trend: '+8%' },
          { label: 'User Satisfaction', value: '94%', trend: '+3%' }
        ].map((stat, index) => (
          <div
            key={stat.label}
            className={`
              rounded-xl p-4 text-center
              ${highContrast 
                ? 'bg-white text-black border-2 border-black' 
                : 'bg-slate-800/30 border border-slate-700'
              }
            `}
          >
            <div 
              className={`
                font-bold mb-1
                ${fontSize === 'large' ? 'text-2xl' : fontSize === 'x-large' ? 'text-3xl' : 'text-xl'}
              `}
            >
              {stat.value}
            </div>
            <div 
              className={`
                ${highContrast ? 'text-gray-700' : 'text-slate-400'}
                ${fontSizeClasses[fontSize]}
              `}
            >
              {stat.label}
            </div>
            {stat.trend && (
              <div 
                className={`
                  text-xs mt-1
                  ${stat.trend.startsWith('+') 
                    ? highContrast ? 'text-green-700' : 'text-green-400' 
                    : highContrast ? 'text-red-700' : 'text-red-400'
                  }
                `}
              >
                {stat.trend}
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
};
