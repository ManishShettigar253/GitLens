import React, { useState } from 'react';
import { Search, Settings, Activity } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  currentUsername: string;
  onSearch: (username: string) => void;
  onOpenSettings: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUsername,
  onSearch,
  onOpenSettings,
  isLoading,
}) => {
  const [query, setQuery] = useState(currentUsername);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <header className="app-header glass-panel">
      <div className="header-brand" onClick={() => onSearch('')}>
        <Activity className="brand-logo" />
        <span className="brand-name gradient-text">GitPulse</span>
      </div>

      <form onSubmit={handleSubmit} className="header-search">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GitHub username..."
            className="search-field"
            disabled={isLoading}
          />
        </div>
        <button type="submit" className="search-btn" disabled={isLoading || !query.trim()}>
          {isLoading ? 'Loading...' : 'Analyze'}
        </button>
      </form>

      <div className="header-actions">
        <button 
          onClick={onOpenSettings} 
          className="icon-action-btn" 
          title="GitHub Token Settings"
        >
          <Settings size={20} />
        </button>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="icon-action-btn"
          title="GitHub Home"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
        </a>
      </div>
    </header>
  );
};
