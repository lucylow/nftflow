import React, { useEffect, useRef, useState } from 'react';

// Hook to manage focus for accessibility
export const useFocusManagement = () => {
  const focusableElementsRef = useRef<HTMLElement[]>([]);
  
  useEffect(() => {
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
      
      // Escape key to close modals
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('[role="dialog"]');
        if (modals.length > 0) {
          const lastModal = modals[modals.length - 1] as HTMLElement;
          const closeButton = lastModal.querySelector('[aria-label*="close"], [aria-label*="Close"]') as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, []);
  
  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    focusableElementsRef.current = Array.from(focusableElements);
    
    if (focusableElementsRef.current.length > 0) {
      focusableElementsRef.current[0].focus();
    }
  };
  
  return { trapFocus };
};

// Accessible modal component
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  className = ''
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { trapFocus } = useFocusManagement();
  
  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      if (modalRef.current) {
        trapFocus(modalRef.current);
      }
      
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      
      // Announce modal opening to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `Modal opened: ${title}`;
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
      
      return () => {
        // Restore focus and scroll
        if (previousFocusRef.current && previousFocusRef.current.focus) {
          previousFocusRef.current.focus();
        }
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, title, trapFocus]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className={`modal-overlay ${className}`}
      role="dialog" 
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button 
            onClick={onClose}
            aria-label="Close modal"
            className="close-button"
            autoFocus
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

// High contrast mode support
export const useHighContrast = () => {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    
    const handleContrastChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.setAttribute('data-contrast', 'high');
      } else {
        document.documentElement.removeAttribute('data-contrast');
      }
    };
    
    // Initial check
    handleContrastChange({ matches: mediaQuery.matches } as MediaQueryListEvent);
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleContrastChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);
};

// Reduced motion support
export const useReducedMotion = () => {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.setAttribute('data-reduced-motion', 'true');
      } else {
        document.documentElement.removeAttribute('data-reduced-motion');
      }
    };
    
    // Initial check
    handleMotionChange({ matches: mediaQuery.matches } as MediaQueryListEvent);
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleMotionChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);
};

// Screen reader only text component
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <span className="sr-only" aria-hidden="false">
      {children}
    </span>
  );
};

// Accessible button component
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  loadingText?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  loadingText = 'Loading...',
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading;
  
  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`accessible-button ${variant} ${size} ${loading ? 'loading' : ''}`}
      aria-disabled={isDisabled}
    >
      {loading && (
        <>
          <span className="loading-spinner" aria-hidden="true"></span>
          <ScreenReaderOnly>{loadingText}</ScreenReaderOnly>
        </>
      )}
      <span style={{ opacity: loading ? 0 : 1 }}>
        {children}
      </span>
    </button>
  );
};

// Accessible form field component
interface AccessibleFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  helpText?: string;
}

export const AccessibleField: React.FC<AccessibleFieldProps> = ({
  label,
  error,
  required = false,
  children,
  helpText
}) => {
  const fieldId = `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `error-${fieldId}`;
  const helpId = `help-${fieldId}`;
  
  return (
    <div className="accessible-field">
      <label 
        htmlFor={fieldId}
        className="field-label"
      >
        {label}
        {required && <span className="required-indicator" aria-label="required">*</span>}
      </label>
      
      <div className="field-input">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          'aria-describedby': `${error ? errorId : ''} ${helpText ? helpId : ''}`.trim(),
          'aria-invalid': error ? 'true' : 'false',
          'aria-required': required
        })}
      </div>
      
      {helpText && (
        <div id={helpId} className="field-help">
          {helpText}
        </div>
      )}
      
      {error && (
        <div id={errorId} className="field-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

// Skip to content link
export const SkipToContent: React.FC = () => {
  return (
    <a 
      href="#main-content" 
      className="skip-to-content"
      onFocus={(e) => {
        e.currentTarget.style.position = 'absolute';
        e.currentTarget.style.top = '0';
        e.currentTarget.style.left = '0';
        e.currentTarget.style.zIndex = '9999';
      }}
      onBlur={(e) => {
        e.currentTarget.style.position = 'absolute';
        e.currentTarget.style.top = '-100px';
        e.currentTarget.style.left = '-100px';
      }}
    >
      Skip to main content
    </a>
  );
};

// Live region for announcements
interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

export const LiveRegion: React.FC<LiveRegionProps> = ({ message, priority = 'polite' }) => {
  const [announcement, setAnnouncement] = useState('');
  
  useEffect(() => {
    if (message) {
      setAnnouncement(message);
      // Clear after announcement
      const timer = setTimeout(() => setAnnouncement(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [message]);
  
  return (
    <div 
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
};

// Keyboard navigation hook
export const useKeyboardNavigation = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [items, setItems] = useState<HTMLElement[]>([]);
  
  const registerItems = (newItems: HTMLElement[]) => {
    setItems(newItems);
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        setCurrentIndex(prev => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
        break;
      case 'Home':
        e.preventDefault();
        setCurrentIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setCurrentIndex(items.length - 1);
        break;
    }
  };
  
  useEffect(() => {
    if (items.length > 0) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [items]);
  
  useEffect(() => {
    if (items[currentIndex]) {
      items[currentIndex].focus();
    }
  }, [currentIndex, items]);
  
  return { currentIndex, registerItems };
};

// Accessibility provider
interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  useHighContrast();
  useReducedMotion();
  
  return (
    <div className="accessibility-provider">
      <SkipToContent />
      {children}
    </div>
  );
};
