import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  GitPullRequest, 
  TrendingUp, 
  Code2, 
  Flame, 
  FolderGit2, 
  Clock, 
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react';
import type { GitHubProfile } from '../services/github';
import './SidebarNav.css';

export type ActiveTab = 
  | 'overview' 
  | 'pr-analytics' 
  | 'monthly-performance' 
  | 'languages' 
  | 'streaks' 
  | 'repositories' 
  | 'activity';

interface SidebarNavProps {
  profile: GitHubProfile;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onSignOut: () => void;
  onOpenSettings: () => void;
  totalPrsCount?: number;
  totalReposCount?: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  profile,
  activeTab,
  onTabChange,
  onSignOut,
  onOpenSettings,
  totalPrsCount,
  totalReposCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'overview' as ActiveTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'pr-analytics' as ActiveTab, label: 'PR Analytics', icon: GitPullRequest, badge: totalPrsCount },
    { id: 'monthly-performance' as ActiveTab, label: 'Monthly Performance', icon: TrendingUp },
    { id: 'languages' as ActiveTab, label: 'Languages', icon: Code2 },
    { id: 'streaks' as ActiveTab, label: 'Streaks', icon: Flame },
    { id: 'repositories' as ActiveTab, label: 'Repositories', icon: FolderGit2, badge: totalReposCount },
    { id: 'activity' as ActiveTab, label: 'Activity', icon: Clock },
  ];

  const getInitial = (name?: string, login?: string) => {
    const text = name || login || 'U';
    return text.charAt(0).toUpperCase();
  };

  const activeItem = menuItems.find((m) => m.id === activeTab);
  const ActiveIcon = activeItem?.icon || LayoutDashboard;

  const handleMobileTabChange = (tab: ActiveTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <aside className={`sidebar-container glass-panel ${mobileMenuOpen ? 'mobile-open' : ''}`}>
      {/* Mobile-only: Collapsed toggle bar */}
      <button
        className="mobile-sidebar-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-expanded={mobileMenuOpen}
        aria-label="Toggle navigation menu"
      >
        <div className="mobile-toggle-left">
          <div className="avatar-wrapper-sm">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.login} className="profile-avatar-img-sm" />
            ) : (
              <span className="profile-avatar-fallback-sm">{getInitial(profile.name, profile.login)}</span>
            )}
          </div>
          <div className="mobile-toggle-info">
            <span className="mobile-toggle-name">{profile.name || profile.login}</span>
            <span className="mobile-toggle-tab">
              <ActiveIcon size={13} />
              {activeItem?.label || 'Overview'}
            </span>
          </div>
        </div>
        <ChevronDown size={18} className={`mobile-chevron ${mobileMenuOpen ? 'rotated' : ''}`} />
      </button>

      {/* Desktop: Profile Summary Header (hidden on mobile) */}
      <div className="sidebar-profile desktop-only">
        <div className="avatar-wrapper">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.login} className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar-fallback">{getInitial(profile.name, profile.login)}</div>
          )}
        </div>
        <div className="sidebar-profile-info">
          <h2 className="profile-display-name">{profile.name || profile.login}</h2>
          <span className="profile-handle">@{profile.login}</span>
        </div>
      </div>

      {/* Navigation Menu — always visible on desktop, slides down on mobile */}
      <div className="sidebar-collapsible">
        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMobileTabChange(item.id)}
                className={`sidebar-menu-btn ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} className="menu-icon" />
                <span className="menu-label">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="menu-count-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Controls */}
        <div className="sidebar-footer">
          <button onClick={onOpenSettings} className="sidebar-footer-btn">
            <Settings size={16} />
            <span>API Settings</span>
          </button>
          <button onClick={onSignOut} className="sidebar-footer-btn sign-out">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
