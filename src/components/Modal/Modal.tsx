import React, { useEffect, useRef, ReactNode } from 'react';
import { focusModal, announceToScreenReader } from '../../utils/a11y';

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  children,
  onClose,
  title,
  description,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = ''
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = description ? `modal-description-${Math.random().toString(36).substr(2, 9)}` : undefined;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    const handleFocus = (e: FocusEvent) => {
      // Keep focus within modal
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        modalRef.current.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('focusin', handleFocus);

    // Focus the modal and set up focus trap
    const cleanupFocus = modalRef.current ? focusModal(modalRef.current) : undefined;

    // Announce modal opening
    announceToScreenReader(`Modal opened: ${title}`);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('focusin', handleFocus);
      cleanupFocus?.();
      document.body.style.overflow = '';
      
      // Announce modal closing
      announceToScreenReader('Modal closed');
    };
  }, [onClose, title, closeOnEscape]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    onClose();
  };

  return (
    <div 
      className={`modal-overlay ${className}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div 
        ref={modalRef}
        className={`modal-content modal-${size}`}
        tabIndex={-1}
      >
        <div className="modal-header">
          <h2 id={titleId} className="modal-title">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="modal-description">
              {description}
            </p>
          )}
          {showCloseButton && (
            <button
              className="modal-close"
              onClick={handleCloseClick}
              aria-label="Close modal"
              type="button"
            >
              <span aria-hidden="true">×</span>
            </button>
          )}
        </div>
        
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
