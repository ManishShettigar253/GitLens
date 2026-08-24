import React, { useMemo } from 'react';
import type { PullRequest } from '../../services/github';
import { Flame, CheckCircle2, Package } from 'lucide-react';
import './MonthlyPerformanceTab.css';

interface MonthlyPerformanceTabProps {
  prs: PullRequest[];
  startDate: Date;
  endDate: Date;
}

export type TierType = 'High' | 'Core' | 'Low';

export interface MonthData {
  monthKey: string; // e.g. "2026-07"
  monthLabel: string; // e.g. "Jul 2026"
  score: number;
  tier: TierType;
  prsOpened: number;
  prsMerged: number;
  commits: number;
  reviews: number;
  issues: number;
  comments: number;
  additions: number;
  deletions: number;
  prList: PullRequest[];
}

export const MonthlyPerformanceTab: React.FC<MonthlyPerformanceTabProps> = ({
  prs,
  startDate,
  endDate,
}) => {
  // Aggregate ALL months in selected date range (from startDate to endDate)
  const monthlyData = useMemo(() => {
    const map: Record<string, MonthData> = {};

    // 1. Generate all calendar month slots from startDate to endDate
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const endLimit = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    while (current <= endLimit) {
      const year = current.getFullYear();
      const month = current.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2, '0')}`;
      const label = current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      map[key] = {
        monthKey: key,
        monthLabel: label,
        score: 0,
        tier: 'Low',
        prsOpened: 0,
        prsMerged: 0,
        commits: 0,
        reviews: 0,
        issues: 0,
        comments: 0,
        additions: 0,
        deletions: 0,
        prList: [],
      };

      current.setMonth(current.getMonth() + 1);
    }

    // 2. Populate with PRs matching each month
    prs.forEach((pr) => {
      const date = new Date(pr.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (map[key]) {
        const m = map[key];
        if (!pr.is_direct_commit) {
          m.prsOpened += 1;
          if (pr.state === 'merged') m.prsMerged += 1;
        }
        m.commits += pr.commits_count;
        m.reviews += pr.reviews_count;
        m.comments += pr.comments_count;
        m.issues += pr.state === 'closed' ? 1 : 0;
        m.additions += pr.additions;
        m.deletions += pr.deletions;
        m.prList.push(pr);
      }
    });

    // 3. Compute score & tier for each month
    const list = Object.values(map).map((m) => {
      const score = 
        m.commits * 1 +
        m.prsOpened * 3 +
        m.prsMerged * 5 +
        m.reviews * 3 +
        m.issues * 2 +
        m.comments * 1;
      
      let tier: TierType = 'Low';
      if (score >= 50) tier = 'High';
      else if (score >= 20) tier = 'Core';

      return { ...m, score, tier };
    });

    // Sort descending (latest month first)
    return list.sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [prs, startDate, endDate]);

  const maxScore = Math.max(...monthlyData.map((m) => m.score), 1);

  return (
    <div className="monthly-perf-container animate-fade-in">
      {/* Header */}
      <div className="tab-header">
        <h2 className="tab-title">Monthly Performance</h2>
        <p className="tab-subtitle">Contribution score and tier classification per month across selected date range</p>
      </div>

      {/* Tier Legend Banner */}
      <div className="tier-legend-card glass-panel">
        <h3 className="legend-title">Tier Legend</h3>
        <div className="legend-badges">
          <div className="tier-badge-legend high">
            <Flame size={14} /> <span>High</span> <span className="tier-score-spec">Score ≥ 50</span>
          </div>
          <div className="tier-badge-legend core">
            <CheckCircle2 size={14} /> <span>Core</span> <span className="tier-score-spec">Score 20–49</span>
          </div>
          <div className="tier-badge-legend low">
            <Package size={14} /> <span>Low</span> <span className="tier-score-spec">Score &lt; 20</span>
          </div>
        </div>
        <div className="score-formula-note">
          <span>Score = commits×1 + PRs opened×3 + PRs merged×5 + reviews×3 + issues×2 + comments×1</span>
        </div>
      </div>

      {/* Score by Month Bar Chart */}
      <div className="monthly-chart-panel glass-panel">
        <div className="panel-header">
          <h3>Score by Month ({monthlyData.length} Months)</h3>
          <span className="panel-sub">Bar chart of monthly contribution scores across selected date range</span>
        </div>

        {monthlyData.length === 0 ? (
          <div className="empty-state">No contribution data for the selected date range.</div>
        ) : (
          <div className="monthly-bars">
            {monthlyData.map((m) => {
              const heightPct = (m.score / maxScore) * 100;
              return (
                <div key={m.monthKey} className="month-bar-col">
                  <div className="bar-val">{m.score}</div>
                  <div className="bar-track">
                    <div
                      className={`bar-fill tier-${m.tier.toLowerCase()}`}
                      style={{ height: `${Math.max(8, heightPct)}%` }}
                    ></div>
                  </div>
                  <span className="bar-month-label">{m.monthLabel}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Month-by-Month Detailed Cards Breakdown */}
      <div className="breakdown-section glass-panel">
        <div className="panel-header" style={{ marginBottom: '16px' }}>
          <h3>Month-by-Month Breakdown ({monthlyData.length} Months Total)</h3>
          <span className="panel-sub">Detailed view with tier badges and activity metrics</span>
        </div>

        <div className="months-grid">
          {monthlyData.map((m) => (
            <div key={m.monthKey} className={`month-card tier-border-${m.tier.toLowerCase()}`}>
              <div className="month-card-header">
                <span className="month-name">{m.monthLabel}</span>
                <span className={`tier-pill ${m.tier.toLowerCase()}`}>
                  {m.tier === 'High' && <Flame size={12} />}
                  {m.tier === 'Core' && <CheckCircle2 size={12} />}
                  {m.tier === 'Low' && <Package size={12} />}
                  {m.tier}
                </span>
              </div>

              <div className="month-score-display">
                <span className="score-num">{m.score}</span>
                <span className="score-lbl">Contribution Score</span>
              </div>

              <div className="month-stats-grid">
                <div className="m-stat">
                  <span className="m-val">{m.prsOpened}</span>
                  <span className="m-lbl">PRs Opened</span>
                </div>
                <div className="m-stat">
                  <span className="m-val green-txt">{m.prsMerged}</span>
                  <span className="m-lbl">PRs Merged</span>
                </div>
                <div className="m-stat">
                  <span className="m-val">{m.commits}</span>
                  <span className="m-lbl">Commits</span>
                </div>
                <div className="m-stat">
                  <span className="m-val">{m.reviews}</span>
                  <span className="m-lbl">Reviews</span>
                </div>
              </div>

              <div className="month-churn">
                <span className="add-txt">+{m.additions.toLocaleString()}</span>
                <span className="del-txt">-{m.deletions.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
