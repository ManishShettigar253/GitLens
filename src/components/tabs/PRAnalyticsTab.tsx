import React from 'react';
import type { PullRequest, PRSizeCategory } from '../../services/github';
import { PRList } from '../PRList';
import './PRAnalyticsTab.css';

interface PRAnalyticsTabProps {
  prs: PullRequest[];
}

export const PRAnalyticsTab: React.FC<PRAnalyticsTabProps> = ({ prs }) => {
  const totalPrs = prs.length;
  const mergedPrs = prs.filter((p) => p.state === 'merged').length;
  const openPrs = prs.filter((p) => p.state === 'open').length;
  const closedPrs = prs.filter((p) => p.state === 'closed').length;

  const mergeRate = totalPrs > 0 ? Math.round((mergedPrs / totalPrs) * 100) : 0;

  // Average merge time
  const totalHours = prs.reduce((acc, p) => acc + p.merge_time_hours, 0);
  const avgMergeTime = totalPrs > 0 ? (totalHours / totalPrs).toFixed(1) : '0';

  // Size distribution
  const sizeBins: Record<PRSizeCategory, { label: string; count: number; color: string }> = {
    tiny: { label: 'Tiny ≤ 10 lines', count: 0, color: '#10b981' },
    small: { label: 'Small 11–25 lines', count: 0, color: '#3b82f6' },
    medium: { label: 'Medium 26–50 lines', count: 0, color: '#8b5cf6' },
    large: { label: 'Large 51–100 lines', count: 0, color: '#d97706' },
    xlarge: { label: 'XLarge 101–500 lines', count: 0, color: '#ea580c' },
    huge: { label: 'Huge 500+ lines', count: 0, color: '#ef4444' },
  };

  prs.forEach((p) => {
    if (sizeBins[p.size_category]) {
      sizeBins[p.size_category].count += 1;
    }
  });

  const maxBinCount = Math.max(...Object.values(sizeBins).map((b) => b.count), 1);

  return (
    <div className="pr-analytics-container animate-fade-in">
      {/* Header */}
      <div className="tab-header">
        <h2 className="tab-title">PR Analytics</h2>
        <p className="tab-subtitle">Deep dive into your Pull Request patterns</p>
      </div>

      {/* Top 6 KPI Metric Cards matching Reference Image #1 */}
      <div className="kpi-grid">
        <div className="kpi-card glass-panel">
          <span className="kpi-label">TOTAL PRS</span>
          <span className="kpi-value">{totalPrs}</span>
        </div>

        <div className="kpi-card glass-panel">
          <span className="kpi-label">MERGED</span>
          <span className="kpi-value green-text">{mergedPrs}</span>
        </div>

        <div className="kpi-card glass-panel">
          <span className="kpi-label">OPEN</span>
          <span className="kpi-value blue-text">{openPrs}</span>
        </div>

        <div className="kpi-card glass-panel">
          <span className="kpi-label">CLOSED</span>
          <span className="kpi-value gray-text">{closedPrs}</span>
        </div>

        <div className="kpi-card glass-panel">
          <span className="kpi-label">MERGE RATE</span>
          <span className="kpi-value">{mergeRate}%</span>
        </div>

        <div className="kpi-card glass-panel">
          <span className="kpi-label">AVG MERGE TIME</span>
          <span className="kpi-value">{avgMergeTime}h</span>
        </div>
      </div>

      {/* Middle Visualizations */}
      <div className="charts-split">
        {/* PR Status Breakdown Donut Chart */}
        <div className="chart-panel glass-panel">
          <div className="panel-header">
            <h3>PR Status Breakdown</h3>
            <span className="panel-sub">Merged vs Open vs Closed</span>
          </div>

          <div className="donut-container-large">
            <div className="donut-wrapper-large">
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

            <div className="status-legend-list">
              <div className="status-item">
                <span className="status-dot merged"></span>
                <span className="status-label">Merged</span>
                <span className="status-pct">{totalPrs ? ((mergedPrs / totalPrs) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="status-item">
                <span className="status-dot open"></span>
                <span className="status-label">Open</span>
                <span className="status-pct">{totalPrs ? ((openPrs / totalPrs) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="status-item">
                <span className="status-dot closed"></span>
                <span className="status-label">Closed</span>
                <span className="status-pct">{totalPrs ? ((closedPrs / totalPrs) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* PR Size Distribution Bar Chart */}
        <div className="chart-panel glass-panel">
          <div className="panel-header">
            <h3>PR Size Distribution</h3>
            <span className="panel-sub">Lines changed per PR</span>
          </div>

          <div className="size-bars-list">
            {(Object.keys(sizeBins) as PRSizeCategory[]).map((key) => {
              const bin = sizeBins[key];
              const pct = (bin.count / maxBinCount) * 100;
              return (
                <div key={key} className="size-bar-row">
                  <span className="size-label">{bin.label}</span>
                  <div className="size-bar-track">
                    <div
                      className="size-bar-fill"
                      style={{ width: `${pct}%`, backgroundColor: bin.color }}
                    ></div>
                  </div>
                  <span className="size-count">{bin.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent PRs Table */}
      <div className="prs-table-panel glass-panel">
        <PRList prs={prs} />
      </div>
    </div>
  );
};
