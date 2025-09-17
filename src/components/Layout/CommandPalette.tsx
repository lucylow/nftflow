import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';

interface Command {
  id: string;
  title: string;
  description: string;
  category: 'navigation' | 'action' | 'search';
  action: () => void;
  keywords: string[];
  icon?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState<Command[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Define available commands
  const commands: Command[] = [
    {
      id: 'browse',
      title: 'Browse Collections',
      description: 'Explore available NFT collections',
      category: 'navigation',
      action: () => navigate('/browse'),
      keywords: ['browse', 'explore', 'collections', 'nfts'],
      icon: '🔍'
    },
    {
      id: 'create',
      title: 'Create Listing',
      description: 'Create a new NFT rental listing',
      category: 'navigation',
      action: () => navigate('/create'),
      keywords: ['create', 'list', 'rental', 'listing'],
      icon: '➕'
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'View your dashboard and analytics',
      category: 'navigation',
      action: () => navigate('/dashboard'),
      keywords: ['dashboard', 'analytics', 'stats', 'overview'],
      icon: '📊'
    },
    {
      id: 'activity',
      title: 'Activity Feed',
      description: 'View recent activity and transactions',
      category: 'navigation',
      action: () => navigate('/activity'),
      keywords: ['activity', 'feed', 'transactions', 'history'],
      icon: '📈'
    },
    {
      id: 'profile',
      title: 'View Profile',
      description: 'View your user profile',
      category: 'navigation',
      action: () => navigate('/profile'),
      keywords: ['profile', 'account', 'settings'],
      icon: '👤'
    },
    {
      id: 'wallet',
      title: 'Connect Wallet',
      description: 'Connect or switch wallet',
      category: 'action',
      action: () => {
        // Trigger wallet connection
        console.log('Connect wallet');
      },
      keywords: ['wallet', 'connect', 'metamask'],
      icon: '🔗'
    },
    {
      id: 'search',
      title: 'Search Collections',
      description: 'Search for specific collections or NFTs',
      category: 'search',
      action: () => {
        // Open search modal or navigate to search page
        console.log('Open search');
      },
      keywords: ['search', 'find', 'lookup'],
      icon: '🔎'
    },
    {
      id: 'help',
      title: 'Help & Support',
      description: 'Get help and support',
      category: 'action',
      action: () => navigate('/help'),
      keywords: ['help', 'support', 'faq', 'guide'],
      icon: '❓'
    }
  ];

  // Filter commands based on query
  useEffect(() => {
    if (!query.trim()) {
      setFilteredCommands(commands);
    } else {
      const filtered = commands.filter(command => 
        command.title.toLowerCase().includes(query.toLowerCase()) ||
        command.description.toLowerCase().includes(query.toLowerCase()) ||
        command.keywords.some(keyword => 
          keyword.toLowerCase().includes(query.toLowerCase())
        )
      );
      setFilteredCommands(filtered);
    }
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard navigation
  useHotkeys('arrowdown', () => {
    setSelectedIndex(prev => 
      prev < filteredCommands.length - 1 ? prev + 1 : 0
    );
  }, { enableOnFormTags: false });

  useHotkeys('arrowup', () => {
    setSelectedIndex(prev => 
      prev > 0 ? prev - 1 : filteredCommands.length - 1
    );
  }, { enableOnFormTags: false });

  useHotkeys('enter', () => {
    if (filteredCommands[selectedIndex]) {
      filteredCommands[selectedIndex].action();
      onClose();
    }
  }, { enableOnFormTags: false });

  const handleCommandClick = (command: Command) => {
    command.action();
    onClose();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation': return '🧭';
      case 'action': return '⚡';
      case 'search': return '🔍';
      default: return '📋';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="command-palette-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-palette-title"
    >
      <div 
        className="command-palette"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="command-palette-header">
          <h2 id="command-palette-title" className="command-palette-title">
            Command Palette
          </h2>
          <button
            className="command-palette-close"
            onClick={onClose}
            aria-label="Close command palette"
          >
            ×
          </button>
        </div>

        <div className="command-palette-input-container">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for collections, users, or actions..."
            className="command-palette-input"
            aria-describedby="command-palette-help"
          />
          <div id="command-palette-help" className="sr-only">
            Use arrow keys to navigate, enter to select, escape to close
          </div>
        </div>

        <div className="command-palette-results">
          {filteredCommands.length === 0 ? (
            <div className="command-palette-empty">
              <p>No commands found for "{query}"</p>
            </div>
          ) : (
            <div className="command-palette-list" role="listbox">
              {filteredCommands.map((command, index) => (
                <button
                  key={command.id}
                  className={`command-palette-item ${
                    index === selectedIndex ? 'selected' : ''
                  }`}
                  onClick={() => handleCommandClick(command)}
                  role="option"
                  aria-selected={index === selectedIndex}
                >
                  <div className="command-palette-item-icon">
                    {command.icon || getCategoryIcon(command.category)}
                  </div>
                  <div className="command-palette-item-content">
                    <div className="command-palette-item-title">
                      {command.title}
                    </div>
                    <div className="command-palette-item-description">
                      {command.description}
                    </div>
                  </div>
                  <div className="command-palette-item-category">
                    {command.category}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="command-palette-footer">
          <div className="command-palette-shortcuts">
            <span className="shortcut">
              <kbd>↑↓</kbd> Navigate
            </span>
            <span className="shortcut">
              <kbd>Enter</kbd> Select
            </span>
            <span className="shortcut">
              <kbd>Esc</kbd> Close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
