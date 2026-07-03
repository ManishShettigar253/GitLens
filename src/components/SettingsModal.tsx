import React, { useState } from 'react';
import { X, Key, ShieldCheck, HelpCircle } from 'lucide-react';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onSaveToken: (token: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  token,
  onSaveToken,
}) => {
  const [inputToken, setInputToken] = useState(token);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveToken(inputToken.trim());
    setShowSavedMessage(true);
    setTimeout(() => {
      setShowSavedMessage(false);
      onClose();
    }, 1500);
  };

  const handleClear = () => {
    setInputToken('');
    onSaveToken('');
    setShowSavedMessage(true);
    setTimeout(() => {
      setShowSavedMessage(false);
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <Key size={18} className="modal-icon" />
            GitHub API Settings
          </h3>
          <button className="close-btn" onClick={onClose} aria-label="Close settings">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-body">
          <p className="modal-description">
            GitHub limits unauthenticated API requests to 10 queries per minute. 
            Add a Personal Access Token (PAT) to increase this limit to 5000 requests per hour.
          </p>

          <div className="input-group">
            <label htmlFor="github-token">Personal Access Token</label>
            <input
              type="password"
              id="github-token"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxx"
              className="token-input"
            />
          </div>

          <div className="info-box">
            <ShieldCheck size={16} className="info-icon" />
            <span>
              Your token is stored locally in your browser (localStorage) and only sent directly to GitHub.
            </span>
          </div>

          <div className="instructions-link">
            <HelpCircle size={14} />
            <a 
              href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              How to create a Personal Access Token?
            </a>
          </div>

          <div className="modal-actions">
            {token && (
              <button type="button" onClick={handleClear} className="btn-secondary">
                Clear Token
              </button>
            )}
            <div className="right-actions">
              <button type="button" onClick={onClose} className="btn-ghost">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </div>
          </div>

          {showSavedMessage && (
            <div className="save-success animate-fade-in">
              Token settings updated successfully!
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
