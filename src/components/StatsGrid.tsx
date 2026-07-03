import { GitPullRequest, GitMerge, GitPullRequestClosed } from 'lucide-react';
import type { PullRequest } from '../services/github';
import './StatsGrid.css';

interface StatsGridProps {
  prs: PullRequest[];
}

export const StatsGrid: React.FC<StatsGridProps> = ({ prs }) => {
  const total = prs.length;
  const open = prs.filter((pr) => pr.state === 'open').length;
  const merged = prs.filter((pr) => pr.state === 'merged').length;
  const closed = prs.filter((pr) => pr.state === 'closed').length;

  const mergeRate = total > 0 ? Math.round((merged / total) * 100) : 0;

  const stats = [
    {
      title: 'Total PRs',
      value: total,
      icon: <GitPullRequest className="stat-card-icon" size={24} />,
      colorClass: 'total-prs',
      desc: 'Pull Requests submitted',
    },
    {
      title: 'Merged PRs',
      value: merged,
      icon: <GitMerge className="stat-card-icon" size={24} />,
      colorClass: 'merged-prs',
      desc: `${mergeRate}% merge rate`,
    },
    {
      title: 'Open PRs',
      value: open,
      icon: <GitPullRequest className="stat-card-icon" size={24} />,
      colorClass: 'open-prs',
      desc: 'Active reviews',
    },
    {
      title: 'Closed PRs',
      value: closed,
      icon: <GitPullRequestClosed className="stat-card-icon" size={24} />,
      colorClass: 'closed-prs',
      desc: 'Closed without merging',
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, idx) => (
        <div key={idx} className={`stat-card glass-panel ${stat.colorClass} animate-fade-in`}>
          <div className="stat-card-header">
            <span className="stat-card-title">{stat.title}</span>
            <div className="stat-icon-wrapper">{stat.icon}</div>
          </div>
          <div className="stat-card-content">
            <span className="stat-card-value">{stat.value.toLocaleString()}</span>
            <span className="stat-card-desc">{stat.desc}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
