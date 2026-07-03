import { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Search, 
  Settings, 
  Calendar, 
  AlertCircle, 
  RefreshCw
} from 'lucide-react';
import { 
  fetchUserProfile, 
  fetchUserPullRequests
} from './services/github';
import type { GitHubProfile, PullRequest } from './services/github';
import { Header } from './components/Header';
import { ProfileCard } from './components/ProfileCard';
import { StatsGrid } from './components/StatsGrid';
import { PRCalendar } from './components/PRCalendar';
import { RepoBreakdown } from './components/RepoBreakdown';
import { PRList } from './components/PRList';
import { SettingsModal } from './components/SettingsModal';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [profileData, setProfileData] = useState<GitHubProfile | null>(null);
  const [allPrs, setAllPrs] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Date states
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [activePreset, setActivePreset] = useState<'30' | '90' | '365' | 'custom'>('365');

  // Token settings
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('gitpulse_pat') || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Set default dates (Last 1 year)
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);
    
    setStartDateStr(start.toISOString().split('T')[0]);
    setEndDateStr(end.toISOString().split('T')[0]);
  }, []);

  // Handle Preset Changes
  const handlePresetChange = (preset: '30' | '90' | '365' | 'custom') => {
    setActivePreset(preset);
    if (preset === 'custom') return;

    const end = new Date();
    const start = new Date();
    const days = parseInt(preset);
    start.setDate(start.getDate() - days);

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
      // Go back to landing screen
      setProfileData(null);
      setAllPrs([]);
      setError(null);
      setUsername('');
      return;
    }

    setLoading(true);
    setError(null);
    setUsername(searchUser);
    setProgressText('Fetching profile information...');

    try {
      const profile = await fetchUserProfile(searchUser, githubToken);
      setProfileData(profile);

      setProgressText('Fetching pull requests contributions...');
      const prList = await fetchUserPullRequests(
        searchUser, 
        githubToken, 
        (loaded, total) => {
          setProgressText(`Loaded ${loaded} of ${total} pull requests...`);
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
  const parsedStartDate = useMemo(() => new Date(startDateStr + 'T00:00:00'), [startDateStr]);
  const parsedEndDate = useMemo(() => new Date(endDateStr + 'T23:59:59'), [endDateStr]);

  // Filter PRs by selected date range
  const filteredPrs = useMemo(() => {
    return allPrs.filter((pr) => {
      const createdDate = new Date(pr.created_at);
      return createdDate >= parsedStartDate && createdDate <= parsedEndDate;
    });
  }, [allPrs, parsedStartDate, parsedEndDate]);

  // Render Landing Page
  if (!profileData) {
    return (
      <div className="landing-container animate-fade-in">
        <header className="landing-header">
          <button onClick={() => setIsSettingsOpen(true)} className="landing-settings-btn" title="API Settings">
            <Settings size={18} /> Settings
          </button>
        </header>

        <main className="landing-main">
          <div className="landing-hero">
            <div className="logo-glow-wrapper">
              <Activity className="hero-logo" />
            </div>
            <h1 className="hero-title gradient-text">GitPulse</h1>
            <p className="hero-subtitle">
              Interactive GitHub profile analytics. Count pull request contributions, 
              view repository breakdowns, and explore density calendars.
            </p>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const userVal = formData.get('username') as string;
              if (userVal.trim()) handleSearch(userVal.trim());
            }} 
            className="search-card glass-panel"
          >
            <div className="landing-search-input">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                name="username"
                placeholder="Enter GitHub username (e.g. torvalds)"
                required
                disabled={loading}
                autoFocus
              />
            </div>
            <button type="submit" className="landing-submit-btn" disabled={loading}>
              {loading ? <RefreshCw className="spinner" size={18} /> : 'Analyze Profile'}
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

          <div className="suggestions">
            <span>Or check out:</span>
            <div className="suggestion-links">
              {['torvalds', 'gaearon', 'yyx990803', 'addyosmani'].map((u) => (
                <button key={u} onClick={() => handleSearch(u)} disabled={loading} className="suggestion-btn">
                  @{u}
                </button>
              ))}
            </div>
          </div>
        </main>

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

      <main className="dashboard-grid">
        {/* Profile Card & Info Sidebar */}
        <section className="sidebar-col">
          <ProfileCard profile={profileData} />
        </section>

        {/* Analytics Section */}
        <section className="main-col">
          {/* Controls: Date Filtering & Presets */}
          <div className="controls-panel glass-panel">
            <div className="control-section">
              <Calendar className="panel-icon" size={16} />
              <span className="section-title">Date Filter</span>
            </div>

            <div className="filters-row">
              {/* Presets */}
              <div className="presets-group">
                {[
                  { value: '30', label: '30 Days' },
                  { value: '90', label: '90 Days' },
                  { value: '365', label: '1 Year' },
                  { value: 'custom', label: 'Custom' },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    className={`preset-btn ${activePreset === preset.value ? 'active' : ''}`}
                    onClick={() => handlePresetChange(preset.value as any)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom Date Pickers */}
              <div className="custom-dates">
                <div className="date-input-group">
                  <span className="date-label">From:</span>
                  <input
                    type="date"
                    value={startDateStr}
                    onChange={(e) => {
                      setStartDateStr(e.target.value);
                      setActivePreset('custom');
                    }}
                    className="date-picker"
                  />
                </div>
                <div className="date-input-group">
                  <span className="date-label">To:</span>
                  <input
                    type="date"
                    value={endDateStr}
                    onChange={(e) => {
                      setEndDateStr(e.target.value);
                      setActivePreset('custom');
                    }}
                    className="date-picker"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <StatsGrid prs={filteredPrs} />

          {/* Activity Heatmap Calendar */}
          <PRCalendar 
            prs={filteredPrs} 
            startDate={parsedStartDate} 
            endDate={parsedEndDate} 
          />

          {/* Repo Breakdown & Detailed Contributions List */}
          <div className="visuals-split">
            <div className="breakdown-wrapper">
              <RepoBreakdown prs={filteredPrs} />
            </div>
            <div className="list-wrapper">
              <PRList prs={filteredPrs} />
            </div>
          </div>
        </section>
      </main>

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
