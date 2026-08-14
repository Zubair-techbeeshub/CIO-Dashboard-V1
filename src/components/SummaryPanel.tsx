import React, { useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import './SummaryPanel.css';

interface SummaryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  isLoading = false 
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <div className={`summary-panel-container ${isOpen ? 'open' : ''}`}>
      {/* Backdrop */}
      <div 
        className="summary-backdrop" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Panel */}
      <div className="summary-panel" role="dialog" aria-modal="true">
        <div className="summary-panel-header">
          <div className="summary-panel-title">
            <Sparkles size={20} className="ai-icon" />
            <h2>AI Summary: {title}</h2>
          </div>
          <button 
            className="summary-close-button" 
            onClick={onClose}
            aria-label="Close summary panel"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="summary-panel-content">
          {isLoading ? (
            <div className="summary-loading">
              <div className="ai-pulse">
                <Sparkles size={32} />
              </div>
              <p>AI is generating insights...</p>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryPanel;