import React from 'react';
import { 
  Users, 
  UserCheck, 
  FolderGit2, 
  GitPullRequest, 
  GitMerge, 
  Code2, 
  Flame 
} from 'lucide-react';
import type { GitHubProfile, PullRequest } from '../../services/github';
import { PRCalendar } from '../PRCalendar';
import './OverviewTab.css';

interface OverviewTabProps {
  profile: GitHubProfile;
  prs: PullRequest[];
  startDate: Date;
  endDate: Date;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  profile,
  prs,
  startDate,
  endDate,
}) => {
  const realPrs = prs.filter(p => !p.is_direct_commit);
  const totalPrs = realPrs.length;
  const mergedPrs = realPrs.filter((p) => p.state === 'merged').length;
  const openPrs = realPrs.filter((p) => p.state === 'open').length;
  const closedPrs = realPrs.filter((p) => p.state === 'closed').length;

  const mergeRate = totalPrs > 0 ? Math.round((mergedPrs / totalPrs) * 100) : 0;

  // Unique repos
  const uniqueRepos = new Set(prs.map((p) => p.repo_name)).size;

  // Primary language
  const languageCounts: Record<string, number> = {};
  prs.forEach((p) => {
    const lang = p.primary_language || 'Other';
    const lines = p.additions + p.deletions;
    languageCounts[lang] = (languageCounts[lang] || 0) + lines;
  });
  const topLanguage = Object.entries(languageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'TypeScript';

  return (
    <div className="overview-container animate-fade-in">
      {/* Profile Metrics Sub-header */}
      <div className="profile-banner glass-panel">
        <div className="banner-user">
          <h2 className="user-title">{profile.name || profile.login}</h2>
          <span className="user-handle">@{profile.login}</span>
        </div>
        <div className="banner-stats">
          <div className="banner-stat">
            <Users size={16} className="stat-icon" />
            <span><strong>{profile.followers}</strong> followers</span>
          </div>
          <div className="banner-stat">
            <UserCheck size={16} className="stat-icon" />
            <span><strong>{profile.following}</strong> following</span>
          </div>
          <div className="banner-stat">
            <FolderGit2 size={16} className="stat-icon" />
            <span><strong>{profile.public_repos}</strong> public repos</span>
          </div>
        </div>
      </div>

      {/* Quick Summary Grid */}
      <div className="overview-stats-grid">
        <div className="overview-stat-card glass-panel">
          <div className="stat-icon-bg blue"><GitPullRequest size={22} /></div>
          <div className="stat-content">
            <span className="stat-label">Total Pull Requests</span>
            <span className="stat-val">{totalPrs}</span>
          </div>
        </div>

        <div className="overview-stat-card glass-panel">
          <div className="stat-icon-bg green"><GitMerge size={22} /></div>
          <div className="stat-content">
            <span className="stat-label">Merge Success Rate</span>
            <span className="stat-val">{mergeRate}%</span>
          </div>
        </div>

        <div className="overview-stat-card glass-panel">
          <div className="stat-icon-bg purple"><FolderGit2 size={22} /></div>
          <div className="stat-content">
            <span className="stat-label">Active Repositories</span>
            <span className="stat-val">{uniqueRepos}</span>
          </div>
        </div>

        <div className="overview-stat-card glass-panel">
          <div className="stat-icon-bg orange"><Code2 size={22} /></div>
          <div className="stat-content">
            <span className="stat-label">Top Language</span>
            <span className="stat-val">{topLanguage}</span>
          </div>
        </div>
      </div>

      {/* Activity Timeline & Pull Request Breakdown split matching reference photo #3 */}
      <div className="overview-dual-split">
        {/* Activity Timeline */}
        <div className="overview-card glass-panel flex-2">
          <div className="card-header">
            <Flame size={18} className="header-icon" />
            <h3>Activity Timeline</h3>
          </div>
          <PRCalendar prs={prs} startDate={startDate} endDate={endDate} />
        </div>

        {/* PR Breakdown */}
        <div className="overview-card glass-panel flex-1">
          <div className="card-header">
            <GitPullRequest size={18} className="header-icon" />
            <h3>Pull Request Breakdown</h3>
          </div>
          
          <div className="breakdown-chart-container">
            {/* SVG Donut Chart */}
            <div className="donut-wrapper">
              <svg viewBox="0 0 100 100" className="donut-svg">
                <circle cx="50" cy="50" r="38" className="donut-bg" />
                {totalPrs > 0 && (
                  <>
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      className="donut-segment merged"
                      strokeDasharray={`${(mergedPrs / totalPrs) * 238.76} 238.76`}
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      className="donut-segment open"
                      strokeDasharray={`${(openPrs / totalPrs) * 238.76} 238.76`}
                      strokeDashoffset={`-${(mergedPrs / totalPrs) * 238.76}`}
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      className="donut-segment closed"
                      strokeDasharray={`${(closedPrs / totalPrs) * 238.76} 238.76`}
                      strokeDashoffset={`-${((mergedPrs + openPrs) / totalPrs) * 238.76}`}
                    />
                  </>
                )}
              </svg>
              <div className="donut-inner-text">
                <span className="inner-number">{totalPrs}</span>
                <span className="inner-label">PRs</span>
              </div>
            </div>

            {/* Legend */}
            <div className="donut-legend">
              <div className="legend-item">
                <span className="legend-dot merged"></span>
                <span className="legend-name">Merged</span>
                <span className="legend-val">{mergedPrs} ({totalPrs ? Math.round((mergedPrs / totalPrs) * 100) : 0}%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot open"></span>
                <span className="legend-name">Open</span>
                <span className="legend-val">{openPrs} ({totalPrs ? Math.round((openPrs / totalPrs) * 100) : 0}%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot closed"></span>
                <span className="legend-name">Closed</span>
                <span className="legend-val">{closedPrs} ({totalPrs ? Math.round((closedPrs / totalPrs) * 100) : 0}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
