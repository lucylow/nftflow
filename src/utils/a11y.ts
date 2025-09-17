/**
 * Accessibility utilities for NFTFlow
 * Provides focus management, ARIA helpers, and keyboard navigation utilities
 */

// Focus trap implementation
export const focusTrap = (element: HTMLElement): (() => void) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) return () => {};

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTab = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  element.addEventListener('keydown', handleTab);
  
  return () => element.removeEventListener('keydown', handleTab);
};

// Focus management for modals
export const focusModal = (modalElement: HTMLElement): (() => void) => {
  const previousActiveElement = document.activeElement as HTMLElement;
  
  // Focus the modal
  modalElement.focus();
  
  // Set up focus trap
  const cleanupFocusTrap = focusTrap(modalElement);
  
  return () => {
    cleanupFocusTrap();
    // Return focus to previous element
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus();
    }
  };
};

// Announce messages to screen readers
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Generate unique IDs for ARIA relationships
export const generateAriaId = (prefix: string = 'aria'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

// ARIA label helpers
export const createAriaLabel = (action: string, target: string, context?: string): string => {
  if (context) {
    return `${action} ${target} ${context}`;
  }
  return `${action} ${target}`;
};

// Keyboard navigation helpers
export const handleArrowKeys = (
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  onIndexChange: (index: number) => void,
  orientation: 'horizontal' | 'vertical' = 'vertical'
): void => {
  const isVertical = orientation === 'vertical';
  const isHorizontal = orientation === 'horizontal';
  
  if (isVertical && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
    event.preventDefault();
    const direction = event.key === 'ArrowUp' ? -1 : 1;
    const newIndex = Math.max(0, Math.min(items.length - 1, currentIndex + direction));
    onIndexChange(newIndex);
    items[newIndex]?.focus();
  }
  
  if (isHorizontal && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
    event.preventDefault();
    const direction = event.key === 'ArrowLeft' ? -1 : 1;
    const newIndex = Math.max(0, Math.min(items.length - 1, currentIndex + direction));
    onIndexChange(newIndex);
    items[newIndex]?.focus();
  }
};

// Skip link functionality
export const createSkipLink = (targetId: string, text: string = 'Skip to main content'): HTMLElement => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'skip-link';
  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView();
    }
  });
  
  return skipLink;
};

// High contrast mode detection
export const isHighContrastMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check for Windows High Contrast mode
  if (window.matchMedia('(-ms-high-contrast: active)').matches) {
    return true;
  }
  
  // Check for forced colors
  if (window.matchMedia('(forced-colors: active)').matches) {
    return true;
  }
  
  return false;
};

// Reduced motion detection
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Color scheme detection
export const getColorScheme = (): 'light' | 'dark' | 'no-preference' => {
  if (typeof window === 'undefined') return 'no-preference';
  
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  
  return 'no-preference';
};

// Form validation helpers
export const validateFormField = (
  field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
  }
): string | null => {
  const value = field.value.trim();
  
  if (rules.required && !value) {
    return 'This field is required';
  }
  
  if (value && rules.minLength && value.length < rules.minLength) {
    return `Minimum length is ${rules.minLength} characters`;
  }
  
  if (value && rules.maxLength && value.length > rules.maxLength) {
    return `Maximum length is ${rules.maxLength} characters`;
  }
  
  if (value && rules.pattern && !rules.pattern.test(value)) {
    return 'Invalid format';
  }
  
  if (value && rules.custom) {
    return rules.custom(value);
  }
  
  return null;
};

// Error message management
export const setFieldError = (field: HTMLElement, message: string | null): void => {
  const fieldId = field.id || generateAriaId('field');
  if (!field.id) field.id = fieldId;
  
  // Remove existing error
  const existingError = document.getElementById(`${fieldId}-error`);
  if (existingError) {
    existingError.remove();
  }
  
  // Remove error state
  field.removeAttribute('aria-invalid');
  field.removeAttribute('aria-describedby');
  
  if (message) {
    // Add error state
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', `${fieldId}-error`);
    
    // Create error message
    const errorElement = document.createElement('div');
    errorElement.id = `${fieldId}-error`;
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    
    // Insert error message
    field.parentNode?.insertBefore(errorElement, field.nextSibling);
    
    // Announce error to screen readers
    announceToScreenReader(message, 'assertive');
  }
};

// Loading state management
export const setLoadingState = (element: HTMLElement, isLoading: boolean, loadingText: string = 'Loading...'): void => {
  if (isLoading) {
    element.setAttribute('aria-busy', 'true');
    element.setAttribute('aria-label', loadingText);
    
    // Disable interactive elements
    const interactiveElements = element.querySelectorAll('button, input, select, textarea, a');
    interactiveElements.forEach(el => {
      el.setAttribute('aria-disabled', 'true');
      el.setAttribute('tabindex', '-1');
    });
  } else {
    element.removeAttribute('aria-busy');
    element.removeAttribute('aria-label');
    
    // Re-enable interactive elements
    const interactiveElements = element.querySelectorAll('button, input, select, textarea, a');
    interactiveElements.forEach(el => {
      el.removeAttribute('aria-disabled');
      el.removeAttribute('tabindex');
    });
  }
};

// Progress indicator helpers
export const createProgressIndicator = (
  current: number,
  total: number,
  label: string = 'Progress'
): { progress: number; ariaLabel: string } => {
  const progress = Math.round((current / total) * 100);
  const ariaLabel = `${label}: ${current} of ${total} (${progress}%)`;
  
  return { progress, ariaLabel };
};

// Table accessibility helpers
export const makeTableAccessible = (table: HTMLTableElement): void => {
  // Add role if not present
  if (!table.getAttribute('role')) {
    table.setAttribute('role', 'table');
  }
  
  // Add caption if not present
  if (!table.querySelector('caption')) {
    const caption = document.createElement('caption');
    caption.textContent = 'Data table';
    table.insertBefore(caption, table.firstChild);
  }
  
  // Ensure headers are properly associated
  const headers = table.querySelectorAll('th');
  headers.forEach((header, index) => {
    if (!header.id) {
      header.id = `header-${index}`;
    }
  });
  
  // Associate data cells with headers
  const rows = table.querySelectorAll('tr');
  rows.forEach((row, rowIndex) => {
    const cells = row.querySelectorAll('td');
    cells.forEach((cell, cellIndex) => {
      const header = headers[cellIndex];
      if (header && header.id) {
        cell.setAttribute('headers', header.id);
      }
    });
  });
};

// Export all utilities
export default {
  focusTrap,
  focusModal,
  announceToScreenReader,
  generateAriaId,
  createAriaLabel,
  handleArrowKeys,
  createSkipLink,
  isHighContrastMode,
  prefersReducedMotion,
  getColorScheme,
  validateFormField,
  setFieldError,
  setLoadingState,
  createProgressIndicator,
  makeTableAccessible
};
