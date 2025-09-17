import React, { useState, useEffect, useRef } from 'react';

interface TourStep {
  title: string;
  content: string;
  selector: string;
  position: 'top' | 'bottom' | 'center';
  action?: string;
}

const OnboardingTour: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [highlightElement, setHighlightElement] = useState<HTMLElement | null>(null);
  const tourRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('nftflow-tour-completed');
    if (!hasSeenTour) {
      // Delay showing tour to ensure page is loaded
      setTimeout(() => setShowTour(true), 1000);
    }
  }, []);

  const steps: TourStep[] = [
    {
      title: "Welcome to NFTFlow",
      content: "Rent NFTs instantly on the Somnia network. No need to buy - just rent and enjoy!",
      selector: ".hero-section",
      position: "center"
    },
    {
      title: "Browse NFTs",
      content: "Explore available NFTs without connecting your wallet. See what's available before you commit.",
      selector: ".nft-grid",
      position: "top"
    },
    {
      title: "Rent in Seconds",
      content: "Click rent to access NFTs for as little as a few minutes. Perfect for trying before buying.",
      selector: ".nft-card:first-child .rent-btn",
      position: "top",
      action: "Try renting an NFT"
    },
    {
      title: "Earn from Your NFTs",
      content: "List your NFTs for rent and earn passive income. Turn your collection into a revenue stream.",
      selector: ".dashboard-link",
      position: "bottom"
    },
    {
      title: "Secure & Transparent",
      content: "All transactions are secured by blockchain technology. No hidden fees, no surprises.",
      selector: ".security-badge",
      position: "center"
    }
  ];

  useEffect(() => {
    if (showTour && steps[currentStep]) {
      const element = document.querySelector(steps[currentStep].selector) as HTMLElement;
      setHighlightElement(element);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStep, showTour]);

  const completeTour = () => {
    setShowTour(false);
    localStorage.setItem('nftflow-tour-completed', 'true');
  };

  const skipTour = () => {
    setShowTour(false);
    localStorage.setItem('nftflow-tour-completed', 'true');
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!showTour) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="tour-overlay" />
      
      {/* Highlight */}
      {highlightElement && (
        <div 
          className="tour-highlight"
          style={{
            position: 'absolute',
            top: highlightElement.offsetTop - 8,
            left: highlightElement.offsetLeft - 8,
            width: highlightElement.offsetWidth + 16,
            height: highlightElement.offsetHeight + 16,
            border: '3px solid #3b82f6',
            borderRadius: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          }}
        />
      )}
      
      {/* Tour Content */}
      <div 
        ref={tourRef}
        className="tour-content"
        style={{
          position: 'fixed',
          top: currentStepData.position === 'top' ? '20px' : 
               currentStepData.position === 'bottom' ? 'auto' : '50%',
          bottom: currentStepData.position === 'bottom' ? '20px' : 'auto',
          left: '50%',
          transform: currentStepData.position === 'center' ? 'translate(-50%, -50%)' : 'translateX(-50%)',
          zIndex: 1001,
          maxWidth: '400px',
          width: '90%',
        }}
      >
        <div className="tour-card">
          <div className="tour-header">
            <h3>{currentStepData.title}</h3>
            <button 
              onClick={skipTour}
              className="skip-btn"
              aria-label="Skip tour"
            >
              Skip
            </button>
          </div>
          
          <div className="tour-body">
            <p>{currentStepData.content}</p>
            
            {currentStepData.action && (
              <div className="tour-action">
                <span className="action-text">{currentStepData.action}</span>
              </div>
            )}
          </div>
          
          <div className="tour-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="progress-text">
              {currentStep + 1} of {steps.length}
            </span>
          </div>
          
          <div className="tour-actions">
            <div className="step-indicators">
              {steps.map((_, index) => (
                <div 
                  key={index} 
                  className={`step-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                />
              ))}
            </div>
            
            <div className="navigation-buttons">
              {currentStep > 0 && (
                <button onClick={prevStep} className="nav-btn prev-btn">
                  ← Back
                </button>
              )}
              
              <button 
                onClick={nextStep} 
                className="nav-btn next-btn"
              >
                {currentStep < steps.length - 1 ? 'Next →' : 'Get Started'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingTour;
