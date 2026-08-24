import React, { useMemo, useState } from 'react';
import type { PullRequest } from '../../services/github';
import { Search, FolderGit2, Star, ExternalLink } from 'lucide-react';
import './RepositoriesTab.css';

interface RepositoriesTabProps {
  prs: PullRequest[];
}

interface RepoMetrics {
  name: string;
  owner: string;
  totalPrs: number;
  mergedPrs: number;
  openPrs: number;
  closedPrs: number;
  mergeRate: number;
  additions: number;
  deletions: number;
  netLines: number;
  primaryLanguage: string;
  lastPrDate: string;
  recentPrs: PullRequest[];
}

export const RepositoriesTab: React.FC<RepositoriesTabProps> = ({ prs }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Aggregate metrics per repo
  const repoData = useMemo(() => {
    const map: Record<string, RepoMetrics> = {};

    prs.forEach((pr) => {
      const key = pr.repo_name;
      if (!map[key]) {
        map[key] = {
          name: pr.repo_name,
          owner: pr.repo_owner,
          totalPrs: 0,
          mergedPrs: 0,
          openPrs: 0,
          closedPrs: 0,
          mergeRate: 0,
          additions: 0,
          deletions: 0,
          netLines: 0,
          primaryLanguage: pr.primary_language || 'TypeScript',
          lastPrDate: pr.created_at,
          recentPrs: [],
        };
      }

      const r = map[key];
      if (!pr.is_direct_commit) {
        r.totalPrs += 1;
        if (pr.state === 'merged') r.mergedPrs += 1;
        else if (pr.state === 'open') r.openPrs += 1;
        else if (pr.state === 'closed') r.closedPrs += 1;
        r.recentPrs.push(pr);
      }

      r.additions += pr.additions;
      r.deletions += pr.deletions;

      // Keep latest date
      if (new Date(pr.created_at) > new Date(r.lastPrDate)) {
        r.lastPrDate = pr.created_at;
      }
    });

    const list = Object.values(map).map((r) => {
      const mergeRate = r.totalPrs > 0 ? Math.round((r.mergedPrs / r.totalPrs) * 100) : 0;
      const netLines = r.additions - r.deletions;
      // Sort recent PRs descending
      r.recentPrs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return { ...r, mergeRate, netLines };
    });

    // Sort repos by total PR count descending
    return list.sort((a, b) => b.totalPrs - a.totalPrs);
  }, [prs]);

  // Overall aggregate stats
  const totalReposCount = repoData.length;
  const realPrs = prs.filter(p => !p.is_direct_commit);
  const totalPrsCount = realPrs.length;
  const totalMergedCount = realPrs.filter((p) => p.state === 'merged').length;
  const overallMergeRate = totalPrsCount > 0 ? Math.round((totalMergedCount / totalPrsCount) * 100) : 0;
  const totalAdditions = prs.reduce((acc, p) => acc + p.additions, 0);
  const totalDeletions = prs.reduce((acc, p) => acc + p.deletions, 0);

  // Filtered repos
  const filteredRepos = repoData.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatK = (num: number) => {
    if (Math.abs(num) >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="repositories-container animate-fade-in">
      {/* Header */}
      <div className="tab-header">
        <h2 className="tab-title">Repositories</h2>
        <p className="tab-subtitle">Repos where you raised pull requests</p>
      </div>

      {/* Top 6 KPI Banner matching reference image #5 */}
      <div className="kpi-grid">
        <div className="kpi-card glass-panel">
          <span className="kpi-label">REPOS WORKED ON</span>
          <span className="kpi-value">{totalReposCount}</span>
        </div>

        <div className="kpi-card glass-panel">
          <span className="kpi-label">TOTAL PRS</span>
          <span className="kpi-value">{totalPrsCount}</span>
        </div>

        <div className="kpi-card glass-panel">
          <span className="kpi-label">PRS MERGED</span>
          <span className="kpi-value green-text">{totalMergedCount}</span>
        </div>

        <div className="kpi-card glass-panel">
          <span className="kpi-label">MERGE RATE</span>
          <span className="kpi-value">{overallMergeRate}%</span>
        </div>

        <div className="kpi-card glass-panel">
          <span className="kpi-label">LINES ADDED</span>
          <span className="kpi-value green-text">+{formatK(totalAdditions)}</span>
        </div>

        <div className="kpi-card glass-panel">
          <span className="kpi-label">LINES REMOVED</span>
          <span className="kpi-value red-text">-{formatK(totalDeletions)}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="repo-search-bar glass-panel">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Filter repositories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="repo-search-input"
        />
      </div>

      {/* Repository Cards List */}
      <div className="repos-cards-list">
        {filteredRepos.length === 0 ? (
          <div className="empty-state glass-panel">No repositories match your filter.</div>
        ) : (
          filteredRepos.map((repo) => {
            const totalCodeChanges = repo.additions + repo.deletions;
            const addedPct = totalCodeChanges > 0 ? ((repo.additions / totalCodeChanges) * 100).toFixed(1) : '50';
            const removedPct = totalCodeChanges > 0 ? ((repo.deletions / totalCodeChanges) * 100).toFixed(1) : '50';

            const lastPrFormatted = new Date(repo.lastPrDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div key={repo.name} className="repo-detail-card glass-panel">
                {/* Repo Card Header */}
                <div className="repo-card-header">
                  <div className="repo-name-group">
                    <FolderGit2 size={18} className="repo-icon" />
                    <a
                      href={`https://github.com/${repo.owner}/${repo.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="repo-title-link"
                    >
                      {repo.name} <ExternalLink size={14} className="link-icon" />
                    </a>
                    <span className="visibility-badge">Private</span>
                    <span className="lang-tag">{repo.primaryLanguage}</span>
                  </div>
                  <div className="repo-meta-right">
                    <span className="star-count"><Star size={14} /> 1</span>
                    <span className="last-pr-date">Last PR: {lastPrFormatted}</span>
                  </div>
                </div>

                {/* Metrics Sub-grid */}
                <div className="repo-metrics-row">
                  <div className="rm-box">
                    <span className="rm-lbl">PRS</span>
                    <span className="rm-val">{repo.totalPrs}</span>
                    <span className="rm-sub">in range</span>
                  </div>

                  <div className="rm-box">
                    <span className="rm-lbl">MERGED</span>
                    <span className="rm-val green-txt">{repo.mergedPrs}</span>
                    <span className="rm-sub">{repo.openPrs} open · {repo.closedPrs} closed</span>
                  </div>

                  <div className="rm-box">
                    <span className="rm-lbl">RATE</span>
                    <div className="rate-circle-badge">{repo.mergeRate}%</div>
                  </div>

                  <div className="rm-box">
                    <span className="rm-lbl">ADDED</span>
                    <span className="rm-val green-txt">+{formatK(repo.additions)}</span>
                    <span className="rm-sub">{repo.additions.toLocaleString()} lines</span>
                  </div>

                  <div className="rm-box">
                    <span className="rm-lbl">REMOVED</span>
                    <span className="rm-val red-txt">-{formatK(repo.deletions)}</span>
                    <span className="rm-sub">{repo.deletions.toLocaleString()} lines</span>
                  </div>

                  <div className="rm-box">
                    <span className="rm-lbl">NET</span>
                    <span className={`rm-val ${repo.netLines >= 0 ? 'green-txt' : 'red-txt'}`}>
                      {repo.netLines >= 0 ? '+' : ''}{formatK(repo.netLines)}
                    </span>
                    <span className="rm-sub">lines net</span>
                  </div>
                </div>

                {/* Code Churn Ratio Bar */}
                <div className="churn-section">
                  <span className="churn-label">CODE CHURN</span>
                  <div className="churn-bar">
                    <div className="churn-fill-added" style={{ width: `${addedPct}%` }}></div>
                    <div className="churn-fill-removed" style={{ width: `${removedPct}%` }}></div>
                  </div>
                  <div className="churn-details font-mono">
                    <span className="green-txt">{addedPct}% +{repo.additions.toLocaleString()} added</span>
                    <span className="red-txt">{removedPct}% -{repo.deletions.toLocaleString()} removed</span>
                  </div>
                </div>

                {/* Recent PRs showing inside repo */}
                <div className="repo-recent-prs">
                  <span className="recent-prs-title">
                    RECENT PRS SHOWING {Math.min(5, repo.recentPrs.length)} OF {repo.totalPrs}
                  </span>
                  <div className="mini-prs-list">
                    {repo.recentPrs.slice(0, 5).map((pr) => (
                      <div key={pr.id} className="mini-pr-row">
                        <span className={`mini-status-dot ${pr.state}`}></span>
                        <a href={pr.html_url} target="_blank" rel="noopener noreferrer" className="mini-pr-title">
                          #{pr.number} {pr.title}
                        </a>
                        <span className="mini-pr-date">
                          {new Date(pr.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
