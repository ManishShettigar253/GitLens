import React, { useState, useMemo } from 'react';
import { GitPullRequest, GitMerge, GitPullRequestClosed, ExternalLink, Search, Filter } from 'lucide-react';
import type { PullRequest } from '../services/github';
import './PRList.css';

interface PRListProps {
  prs: PullRequest[];
}

type FilterState = 'all' | 'open' | 'merged' | 'closed';

export const PRList: React.FC<PRListProps> = ({ prs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterState>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Filter PRs based on search and status tabs
  const filteredPRs = useMemo(() => {
    return prs.filter((pr) => {
      const matchesSearch = 
        pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pr.repo_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pr.repo_owner.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' || 
        pr.state === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [prs, searchTerm, statusFilter]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPRs.length / itemsPerPage);
  const paginatedPRs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPRs.slice(start, start + itemsPerPage);
  }, [filteredPRs, currentPage]);

  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'merged':
        return <GitMerge size={16} className="state-icon merged" />;
      case 'open':
        return <GitPullRequest size={16} className="state-icon open" />;
      case 'closed':
      default:
        return <GitPullRequestClosed size={16} className="state-icon closed" />;
    }
  };

  const getStatusLabel = (state: string) => {
    return state.charAt(0).toUpperCase() + state.slice(1);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="pr-list-panel glass-panel animate-fade-in">
      <div className="list-header">
        <h4>Pull Request Contributions</h4>
        <div className="list-filters">
          {/* Search bar inside list */}
          <div className="search-bar">
            <Search size={14} className="input-search-icon" />
            <input
              type="text"
              placeholder="Filter by title or repository..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="list-search-input"
            />
          </div>
          
          {/* Status Tabs */}
          <div className="status-tabs">
            {(['all', 'open', 'merged', 'closed'] as FilterState[]).map((state) => {
              const count = state === 'all' 
                ? prs.length 
                : prs.filter((p) => p.state === state).length;
              
              return (
                <button
                  key={state}
                  className={`tab-btn ${statusFilter === state ? 'active' : ''}`}
                  onClick={() => setStatusFilter(state)}
                >
                  {state.charAt(0).toUpperCase() + state.slice(1)}
                  <span className="tab-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        {paginatedPRs.length === 0 ? (
          <div className="empty-list">
            <Filter size={24} className="empty-icon" />
            <p>No pull requests found matching the criteria.</p>
          </div>
        ) : (
          <table className="pr-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Repository</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPRs.map((pr) => (
                <tr key={pr.id} className="pr-row">
                  <td>
                    <div className="pr-title-cell">
                      <a 
                        href={pr.html_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="pr-title-link"
                      >
                        {pr.title}
                        <ExternalLink size={12} className="link-hover-icon" />
                      </a>
                      <span className="pr-number">#{pr.number}</span>
                    </div>
                  </td>
                  <td>
                    <span className="pr-repo-cell" title={`${pr.repo_owner}/${pr.repo_name}`}>
                      <span className="owner-dim">{pr.repo_owner}/</span>
                      {pr.repo_name}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${pr.state}`}>
                      {getStatusIcon(pr.state)}
                      {getStatusLabel(pr.state)}
                    </span>
                  </td>
                  <td>
                    <span className="pr-date-cell">{formatDate(pr.created_at)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination-bar">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="page-nav-btn"
          >
            Prev
          </button>
          <span className="page-indicator">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="page-nav-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
