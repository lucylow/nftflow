import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import CommandPalette from './CommandPalette';

interface NavItemProps {
  to: string;
  label: string;
  icon?: string;
  badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon, badge }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <button
      onClick={() => navigate(to)}
      className={`nav-item ${isActive ? 'active' : ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {icon && <span className="nav-icon" aria-hidden="true">{icon}</span>}
      <span className="nav-label">{label}</span>
      {badge && badge > 0 && (
        <span className="nav-badge" aria-label={`${badge} notifications`}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
};

const Navigation: React.FC = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);

  // Command palette hotkey (K)
  useHotkeys('k', () => setIsCommandPaletteOpen(true), {
    preventDefault: true,
    enableOnFormTags: false
  });

  // Escape key to close command palette
  useHotkeys('escape', () => setIsCommandPaletteOpen(false), {
    enableOnFormTags: false
  });

  // Global hotkeys for navigation
  useHotkeys('ctrl+1', () => navigate('/browse'), { preventDefault: true });
  useHotkeys('ctrl+2', () => navigate('/create'), { preventDefault: true });
  useHotkeys('ctrl+3', () => navigate('/dashboard'), { preventDefault: true });
  useHotkeys('ctrl+4', () => navigate('/activity'), { preventDefault: true });

  const navigate = useNavigate();

  // Mock notifications count - in real app, this would come from context
  useEffect(() => {
    // Simulate notification count
    setNotifications(Math.floor(Math.random() * 5));
  }, []);

  return (
    <>
      <nav 
        className="navigation" 
        role="navigation" 
        aria-label="Main navigation"
      >
        <div className="nav-container">
          <div className="nav-brand">
            <h1 className="nav-title">
              <span className="nav-logo" aria-hidden="true">🎨</span>
              NFTFlow
            </h1>
          </div>

          <div className="nav-menu">
            <NavItem 
              to="/browse" 
              label="Browse" 
              icon="🔍"
              badge={notifications}
            />
            <NavItem 
              to="/create" 
              label="Create" 
              icon="➕"
            />
            <NavItem 
              to="/dashboard" 
              label="Dashboard" 
              icon="📊"
            />
            <NavItem 
              to="/activity" 
              label="Activity" 
              icon="📈"
            />
          </div>

          <div className="nav-actions">
            <button
              className="nav-action-button"
              onClick={() => setIsCommandPaletteOpen(true)}
              aria-label="Open command palette (Press K)"
              title="Open command palette (K)"
            >
              <span className="nav-icon" aria-hidden="true">⌘</span>
              <span className="nav-shortcut">K</span>
            </button>

            <button
              className="nav-action-button"
              aria-label="Notifications"
              title="View notifications"
            >
              <span className="nav-icon" aria-hidden="true">🔔</span>
              {notifications > 0 && (
                <span className="nav-badge" aria-label={`${notifications} notifications`}>
                  {notifications}
                </span>
              )}
            </button>

            <button
              className="nav-action-button"
              aria-label="User menu"
              title="User menu"
            >
              <span className="nav-icon" aria-hidden="true">👤</span>
            </button>
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="nav-mobile-toggle"
          aria-label="Toggle mobile menu"
          aria-expanded="false"
        >
          <span className="hamburger" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </nav>

      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </>
  );
};

export default Navigation;
