import React, { useMemo } from 'react';
import { FolderGit } from 'lucide-react';
import type { PullRequest } from '../services/github';
import './RepoBreakdown.css';

interface RepoBreakdownProps {
  prs: PullRequest[];
}

export const RepoBreakdown: React.FC<RepoBreakdownProps> = ({ prs }) => {
  const repoStats = useMemo(() => {
    const counts: { [repoKey: string]: { count: number; name: string; owner: string } } = {};
    
    prs.forEach((pr) => {
      const key = `${pr.repo_owner}/${pr.repo_name}`;
      if (!counts[key]) {
        counts[key] = { count: 0, name: pr.repo_name, owner: pr.repo_owner };
      }
      counts[key].count += 1;
    });

    const totalPrs = prs.length;

    // Convert to sorted array and calculate percentages
    return Object.values(counts)
      .map((repo) => ({
        ...repo,
        percentage: totalPrs > 0 ? Math.round((repo.count / totalPrs) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Show top 5 repositories
  }, [prs]);

  if (prs.length === 0) {
    return (
      <div className="repo-breakdown-panel glass-panel animate-fade-in empty">
        <h4>Top Repositories</h4>
        <p className="empty-text">No repository data available.</p>
      </div>
    );
  }

  return (
    <div className="repo-breakdown-panel glass-panel animate-fade-in">
      <div className="panel-header">
        <h4>Top Repositories</h4>
        <span className="subtitle">By pull requests contributed</span>
      </div>

      <div className="repos-list">
        {repoStats.map((repo, idx) => (
          <div key={idx} className="repo-item">
            <div className="repo-info">
              <div className="repo-name-wrapper">
                <FolderGit size={16} className="repo-icon" />
                <span className="repo-name" title={`${repo.owner}/${repo.name}`}>
                  <span className="repo-owner">{repo.owner}/</span>
                  {repo.name}
                </span>
              </div>
              <span className="repo-count">
                <strong>{repo.count}</strong> PR{repo.count !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="progress-container">
              <div 
                className="progress-bar" 
                style={{ 
                  width: `${repo.percentage}%`,
                  background: `linear-gradient(90deg, var(--accent-cyan), var(--accent-indigo))`
                }}
              />
            </div>
            <div className="repo-percentage">{repo.percentage}% of total</div>
          </div>
        ))}
      </div>
    </div>
  );
};
