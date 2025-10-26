import React, { useState } from 'react';
import { 
  Accessibility, 
  Contrast, 
  Type, 
  Pause,
  Mic,
  MicOff,
  Volume2
} from 'lucide-react';

interface AccessibilityControlsProps {
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  fontSize: 'normal' | 'large' | 'x-large';
  setFontSize: (value: 'normal' | 'large' | 'x-large') => void;
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
  voiceControlActive: boolean;
  setVoiceControlActive: (value: boolean) => void;
}

export const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  highContrast,
  setHighContrast,
  fontSize,
  setFontSize,
  reducedMotion,
  setReducedMotion,
  voiceControlActive,
  setVoiceControlActive
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const fontSizeClasses = {
    normal: 'text-base',
    large: 'text-lg',
    'x-large': 'text-xl'
  };

  return (
    <div className="fixed top-4 left-4 z-30">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          p-3 rounded-full shadow-lg transition-all
          ${highContrast 
            ? 'bg-black text-white border-2 border-white' 
            : 'bg-slate-800 text-white border-2 border-cyan-500'
          }
          hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300
        `}
        aria-label="Accessibility controls"
        aria-expanded={isOpen}
      >
        <Accessibility size={24} />
      </button>

      {/* Controls Panel */}
      {isOpen && (
        <div className={`
          absolute left-0 top-16 mt-2 p-4 rounded-lg shadow-2xl
          ${highContrast 
            ? 'bg-white text-black border-2 border-black' 
            : 'bg-slate-800 text-white border border-slate-600'
          }
          min-w-64
        `}>
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Accessibility size={20} />
            Accessibility Settings
          </h3>

          <div className="space-y-4">
            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between">
              <label htmlFor="high-contrast" className="flex items-center gap-2 cursor-pointer">
                <Contrast size={18} />
                <span>High Contrast</span>
              </label>
              <button
                id="high-contrast"
                onClick={() => setHighContrast(!highContrast)}
                className={`
                  w-12 h-6 rounded-full transition-colors relative
                  ${highContrast ? 'bg-cyan-600' : 'bg-slate-600'}
                `}
                aria-checked={highContrast}
                role="switch"
              >
                <span
                  className={`
                    absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                    ${highContrast ? 'left-7' : 'left-1'}
                  `}
                />
              </button>
            </div>

            {/* Font Size Controls */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <Type size={18} />
                <span>Font Size</span>
              </label>
              <div className="flex gap-2">
                {(['normal', 'large', 'x-large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`
                      flex-1 py-2 rounded text-sm font-semibold transition-all
                      ${fontSize === size
                        ? highContrast
                          ? 'bg-black text-white'
                          : 'bg-cyan-600 text-white'
                        : highContrast
                          ? 'bg-gray-200 text-black'
                          : 'bg-slate-700 text-slate-300'
                      }
                      hover:scale-105
                    `}
                  >
                    {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'}
                  </button>
                ))}
              </div>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <label htmlFor="reduced-motion" className="flex items-center gap-2 cursor-pointer">
                <Pause size={18} />
                <span>Reduced Motion</span>
              </label>
              <button
                id="reduced-motion"
                onClick={() => setReducedMotion(!reducedMotion)}
                className={`
                  w-12 h-6 rounded-full transition-colors relative
                  ${reducedMotion ? 'bg-cyan-600' : 'bg-slate-600'}
                `}
                aria-checked={reducedMotion}
                role="switch"
              >
                <span
                  className={`
                    absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                    ${reducedMotion ? 'left-7' : 'left-1'}
                  `}
                />
              </button>
            </div>

            {/* Voice Control */}
            <div className="flex items-center justify-between">
              <label htmlFor="voice-control" className="flex items-center gap-2 cursor-pointer">
                {voiceControlActive ? <Mic size={18} /> : <MicOff size={18} />}
                <span>Voice Control</span>
              </label>
              <button
                id="voice-control"
                onClick={() => setVoiceControlActive(!voiceControlActive)}
                className={`
                  w-12 h-6 rounded-full transition-colors relative
                  ${voiceControlActive ? 'bg-green-600' : 'bg-slate-600'}
                `}
                aria-checked={voiceControlActive}
                role="switch"
              >
                <span
                  className={`
                    absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                    ${voiceControlActive ? 'left-7' : 'left-1'}
                  `}
                />
              </button>
            </div>

            {/* Keyboard Shortcuts Help */}
            <div className="pt-4 border-t border-slate-600">
              <details>
                <summary className="cursor-pointer font-semibold">
                  Keyboard Shortcuts
                </summary>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <kbd className="px-2 py-1 bg-slate-700 rounded">Alt + 1-4</kbd>
                    <span>Navigate views</span>
                  </div>
                  <div className="flex justify-between">
                    <kbd className="px-2 py-1 bg-slate-700 rounded">Alt + R</kbd>
                    <span>Toggle recommendations</span>
                  </div>
                  <div className="flex justify-between">
                    <kbd className="px-2 py-1 bg-slate-700 rounded">Alt + A</kbd>
                    <span>Toggle analytics</span>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
