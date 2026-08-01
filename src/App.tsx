import { useState, useEffect, useMemo } from 'react';
import { 
  Activity as ActivityIcon, 
  Search, 
  Settings, 
  AlertCircle, 
  RefreshCw,
  Sparkles,
  GitPullRequest,
  TrendingUp,
  Flame,
  ArrowRight,
  MapPin,
  Building2,
  Heart
} from 'lucide-react';
import { 
  fetchUserProfile, 
  fetchUserPullRequests 
} from './services/github';
import type { GitHubProfile, PullRequest } from './services/github';

// Layout Components
import { Header } from './components/Header';
import { SidebarNav } from './components/SidebarNav';
import type { ActiveTab } from './components/SidebarNav';
import { DateRangePicker } from './components/DateRangePicker';
import type { PresetOption } from './components/DateRangePicker';
import { SettingsModal } from './components/SettingsModal';

// Tab Components
import { OverviewTab } from './components/tabs/OverviewTab';
import { PRAnalyticsTab } from './components/tabs/PRAnalyticsTab';
import { MonthlyPerformanceTab } from './components/tabs/MonthlyPerformanceTab';
import { LanguagesTab } from './components/tabs/LanguagesTab';
import { RepositoriesTab } from './components/tabs/RepositoriesTab';
import { StreaksTab } from './components/tabs/StreaksTab';
import { ActivityTab } from './components/tabs/ActivityTab';

import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [profileData, setProfileData] = useState<GitHubProfile | null>(null);
  const [allPrs, setAllPrs] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Active view tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Date range filter states
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [activePreset, setActivePreset] = useState<PresetOption>('all');

  // Token settings
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('gitpulse_pat') || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initialize default date range (All Time / 15 Years)
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 15);

    setStartDateStr(start.toISOString().split('T')[0]);
    setEndDateStr(end.toISOString().split('T')[0]);
  }, []);

  // Handle Preset Changes (30D, 90D, 1Y, 3Y, 5Y, All Time, Custom)
  const handlePresetChange = (preset: PresetOption) => {
    setActivePreset(preset);
    if (preset === 'custom') return;

    const end = new Date();
    const start = new Date();

    if (preset === 'all') {
      if (profileData?.created_at) {
        const userCreated = new Date(profileData.created_at);
        start.setTime(userCreated.getTime());
      } else {
        start.setFullYear(start.getFullYear() - 10);
      }
    } else {
      const days = parseInt(preset, 10);
      if (!isNaN(days)) {
        start.setDate(start.getDate() - days);
      }
    }

    setStartDateStr(start.toISOString().split('T')[0]);
    setEndDateStr(end.toISOString().split('T')[0]);
  };

  const saveToken = (token: string) => {
    setGithubToken(token);
    if (token) {
      localStorage.setItem('gitpulse_pat', token);
    } else {
      localStorage.removeItem('gitpulse_pat');
    }
  };

  const handleSearch = async (searchUser: string) => {
    if (!searchUser) {
      setProfileData(null);
      setAllPrs([]);
      setError(null);
      setUsername('');
      return;
    }

    setLoading(true);
    setError(null);
    setUsername(searchUser);
    setProgressText('Fetching profile details...');

    try {
      const profile = await fetchUserProfile(searchUser, githubToken);
      setProfileData(profile);

      // Automatically align default All Time date range to user's GitHub creation date
      if (profile.created_at && activePreset === 'all') {
        const createdDateStr = new Date(profile.created_at).toISOString().split('T')[0];
        setStartDateStr(createdDateStr);
      }

      setProgressText('Fetching pull requests and contributions...');
      const prList = await fetchUserPullRequests(
        searchUser, 
        githubToken, 
        (loaded, total) => {
          setProgressText(`Loaded ${loaded} of ${total} contributions and repositories...`);
        }
      );
      setAllPrs(prList);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setProfileData(null);
      setAllPrs([]);
    } finally {
      setLoading(false);
      setProgressText('');
    }
  };

  // Convert date strings to Date objects
  const parsedStartDate = useMemo(() => new Date((startDateStr || '2000-01-01') + 'T00:00:00'), [startDateStr]);
  const parsedEndDate = useMemo(() => new Date((endDateStr || '2099-12-31') + 'T23:59:59'), [endDateStr]);

  // Filter PRs by selected date range
  const filteredPrs = useMemo(() => {
    return allPrs.filter((pr) => {
      const createdDate = new Date(pr.created_at);
      return createdDate >= parsedStartDate && createdDate <= parsedEndDate;
    });
  }, [allPrs, parsedStartDate, parsedEndDate]);

  const uniqueReposCount = useMemo(() => {
    return new Set(filteredPrs.map((p) => `${p.repo_owner}/${p.repo_name}`)).size;
  }, [filteredPrs]);

  // Render Landing Page
  // Render Minimalist Modern Landing Page
  if (!profileData) {
    return (
      <div className="landing-container animate-fade-in">
        {/* Ambient Glow Orbs */}
        <div className="landing-glow-orb orb-1"></div>
        <div className="landing-glow-orb orb-2"></div>

        {/* Navbar */}
        <header className="landing-header glass-panel">
          <div className="landing-brand">
            <ActivityIcon className="brand-logo" />
            <span className="brand-name gradient-text">GitPulse</span>
            <span className="version-pill">v2.0</span>
          </div>
          <div className="landing-header-right">
            <button onClick={() => setIsSettingsOpen(true)} className="landing-settings-btn" title="API Settings">
              <Settings size={16} /> <span>API Settings</span>
            </button>
          </div>
        </header>

        {/* Minimal Hero & Search */}
        <main className="landing-main">
          <div className="hero-badge animate-slide-up">
            <Sparkles size={14} className="sparkle-icon" />
            <span>GitHub Profile Intelligence</span>
          </div>

          <h1 className="hero-title animate-slide-up">
            Instant GitHub Profile <span className="gradient-text">Analytics</span>
          </h1>

          <p className="hero-subtitle animate-slide-up">
            Deep dive into PR velocity, monthly performance tiers, streak heatmaps, and repository churn.
          </p>

          {/* Glowing Search Form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const userVal = formData.get('username') as string;
              if (userVal.trim()) handleSearch(userVal.trim());
            }} 
            className="search-card glass-panel animate-slide-up"
          >
            <div className="landing-search-input">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                name="username"
                placeholder="Enter GitHub username..."
                required
                disabled={loading}
                autoFocus
              />
            </div>
            <button type="submit" className="landing-submit-btn" disabled={loading}>
              {loading ? <RefreshCw className="spinner" size={18} /> : (
                <>
                  <span>Analyze</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {loading && (
            <div className="loading-status animate-fade-in">
              <div className="loading-spinner"></div>
              <span>{progressText}</span>
            </div>
          )}

          {error && (
            <div className="error-box glass-panel animate-fade-in">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}


          {/* Minimal 3 Feature Badges */}
          <div className="mini-features-row">
            <div className="mini-feature-chip">
              <GitPullRequest size={16} className="cyan-txt" />
              <span>PR Velocity & Churn</span>
            </div>
            <div className="mini-feature-chip">
              <TrendingUp size={16} className="purple-txt" />
              <span>Monthly Performance</span>
            </div>
            <div className="mini-feature-chip">
              <Flame size={16} className="flame-txt" />
              <span>Streaks & Heatmaps</span>
            </div>
          </div>
        </main>

        {/* Developer Section */}
        <section className="dev-section">
          <div className="dev-section-header">
            <span className="dev-section-tag">👨‍💻</span>
            <h3 className="dev-section-title">Meet the Developer</h3>
          </div>
          <div className="dev-card glass-panel animate-slide-up">
            <div className="dev-card-top">
              <img
                src="https://avatars.githubusercontent.com/u/142647718?v=4"
                alt="Manish"
                className="dev-avatar"
              />
              <div className="dev-info">
                <h3 className="dev-name">Manish</h3>
                <div className="dev-meta-row">
                  <span className="dev-meta-item"><Building2 size={13} /> SDE at IBM</span>
                  <span className="dev-meta-item"><MapPin size={13} /> Mangalore</span>
                </div>
              </div>
            </div>
            <div className="dev-social-row">
              <a href="https://www.linkedin.com/in/manish253/" target="_blank" rel="noopener noreferrer" className="dev-social-link linkedin">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </a>
              <a href="https://www.instagram.com/manish__shettigar" target="_blank" rel="noopener noreferrer" className="dev-social-link instagram">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                Instagram
              </a>
              <a href="https://github.com/ManishShettigar253" target="_blank" rel="noopener noreferrer" className="dev-social-link github">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <span>Built with <Heart size={13} className="heart-icon" /> by Manish</span>
          <span className="footer-dot">•</span>
          <span>GitPulse &copy; 2026</span>
          <span className="footer-dot">•</span>
          <span>Powered by GitHub REST API & Vite</span>
        </footer>

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          token={githubToken}
          onSaveToken={saveToken}
        />
      </div>
    );
  }

  // Render Dashboard
  return (
    <div className="app-container animate-fade-in">
      <Header
        currentUsername={username}
        onSearch={handleSearch}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isLoading={loading}
      />

      {error && (
        <div className="error-box glass-panel animate-fade-in" style={{ marginBottom: '24px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="dashboard-layout">
        {/* Left Sidebar Navigation */}
        <SidebarNav
          profile={profileData}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSignOut={() => handleSearch('')}
          onOpenSettings={() => setIsSettingsOpen(true)}
          totalPrsCount={filteredPrs.length}
          totalReposCount={uniqueReposCount}
        />

        {/* Main Analytics Content */}
        <main className="dashboard-content">
          {/* Top Date Range Picker Filter */}
          <DateRangePicker
            startDateStr={startDateStr}
            endDateStr={endDateStr}
            activePreset={activePreset}
            onPresetChange={handlePresetChange}
            onStartDateChange={(val) => {
              setStartDateStr(val);
              setActivePreset('custom');
            }}
            onEndDateChange={(val) => {
              setEndDateStr(val);
              setActivePreset('custom');
            }}
            onApplyCustom={() => setActivePreset('custom')}
          />

          {/* Active Tab View */}
          {activeTab === 'overview' && (
            <OverviewTab
              profile={profileData}
              prs={filteredPrs}
              startDate={parsedStartDate}
              endDate={parsedEndDate}
            />
          )}

          {activeTab === 'pr-analytics' && (
            <PRAnalyticsTab prs={filteredPrs} />
          )}

          {activeTab === 'monthly-performance' && (
            <MonthlyPerformanceTab
              prs={filteredPrs}
              startDate={parsedStartDate}
              endDate={parsedEndDate}
            />
          )}

          {activeTab === 'languages' && (
            <LanguagesTab prs={filteredPrs} />
          )}

          {activeTab === 'repositories' && (
            <RepositoriesTab prs={filteredPrs} />
          )}

          {activeTab === 'streaks' && (
            <StreaksTab
              prs={filteredPrs}
              startDate={parsedStartDate}
              endDate={parsedEndDate}
            />
          )}

          {activeTab === 'activity' && (
            <ActivityTab prs={filteredPrs} />
          )}
        </main>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        token={githubToken}
        onSaveToken={saveToken}
      />
    </div>
  );
}

export default App;
