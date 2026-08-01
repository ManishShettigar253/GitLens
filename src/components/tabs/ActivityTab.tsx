import React, { useMemo } from 'react';
import type { PullRequest } from '../../services/github';
import { Clock, Calendar, Sun, Moon, Sparkles } from 'lucide-react';
import './ActivityTab.css';

interface ActivityTabProps {
  prs: PullRequest[];
}

/**
 * Returns a dynamic CSS gradient string based on intensity ratio (0 to 1).
 * Low → teal/cyan, Medium → blue/indigo, High → purple/pink
 */
function getBarGradient(ratio: number): string {
  if (ratio >= 0.75) {
    // High — vibrant magenta → purple
    return 'linear-gradient(180deg, #f472b6 0%, #a855f7 100%)';
  } else if (ratio >= 0.45) {
    // Medium — indigo → blue
    return 'linear-gradient(180deg, #818cf8 0%, #3b82f6 100%)';
  } else if (ratio > 0) {
    // Low — cyan → teal
    return 'linear-gradient(180deg, #22d3ee 0%, #14b8a6 100%)';
  }
  return 'transparent';
}

/** Glow shadow based on intensity */
function getBarGlow(ratio: number): string {
  if (ratio >= 0.75) return '0 0 12px rgba(168, 85, 247, 0.5)';
  if (ratio >= 0.45) return '0 0 10px rgba(59, 130, 246, 0.35)';
  if (ratio > 0) return '0 0 8px rgba(20, 184, 166, 0.3)';
  return 'none';
}

export const ActivityTab: React.FC<ActivityTabProps> = ({ prs }) => {
  // Aggregate 24h & Day-of-week stats
  const activityStats = useMemo(() => {
    const hourlyCounts = new Array(24).fill(0);
    const dayOfWeekCounts = new Array(7).fill(0); // 0 = Sun, 6 = Sat

    prs.forEach((pr) => {
      if (pr.created_hour !== undefined && pr.created_hour >= 0 && pr.created_hour < 24) {
        hourlyCounts[pr.created_hour] += 1;
      }
      if (pr.created_day_of_week !== undefined && pr.created_day_of_week >= 0 && pr.created_day_of_week < 7) {
        dayOfWeekCounts[pr.created_day_of_week] += 1;
      }
    });

    const maxHourly = Math.max(...hourlyCounts, 1);
    const maxDayOfWeek = Math.max(...dayOfWeekCounts, 1);

    // Find peak hour
    let peakHourIndex = 0;
    let peakHourValue = 0;
    hourlyCounts.forEach((val, idx) => {
      if (val > peakHourValue) {
        peakHourValue = val;
        peakHourIndex = idx;
      }
    });

    // Find peak day
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let peakDayIndex = 0;
    let peakDayValue = 0;
    dayOfWeekCounts.forEach((val, idx) => {
      if (val > peakDayValue) {
        peakDayValue = val;
        peakDayIndex = idx;
      }
    });

    // Night Owl vs Early Bird (Night = 22 to 05, Day = 06 to 21)
    const nightPRs = hourlyCounts.slice(22).reduce((a, b) => a + b, 0) + hourlyCounts.slice(0, 5).reduce((a, b) => a + b, 0);
    const dayPRs = prs.length - nightPRs;
    const chronotype = nightPRs > dayPRs ? 'Night Owl 🦉' : 'Early Bird 🌅';

    return {
      hourlyCounts,
      dayOfWeekCounts,
      maxHourly,
      maxDayOfWeek,
      peakHourFormatted: `${peakHourIndex % 12 || 12}:00 ${peakHourIndex >= 12 ? 'PM' : 'AM'}`,
      peakDayName: DAYS[peakDayIndex] || 'Tuesday',
      chronotype,
    };
  }, [prs]);

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="activity-tab-container animate-fade-in">
      {/* Header */}
      <div className="tab-header">
        <h2 className="tab-title">Activity Patterns</h2>
        <p className="tab-subtitle">Explore when you code throughout the day and across the week</p>
      </div>

      {/* Peak Insights Cards */}
      <div className="activity-insights-grid">
        <div className="insight-card glass-panel">
          <div className="insight-icon blue"><Clock size={24} /></div>
          <div className="insight-text">
            <span className="insight-lbl">PEAK CODING HOUR</span>
            <span className="insight-val">{activityStats.peakHourFormatted}</span>
          </div>
        </div>

        <div className="insight-card glass-panel">
          <div className="insight-icon green"><Calendar size={24} /></div>
          <div className="insight-text">
            <span className="insight-lbl">MOST ACTIVE DAY</span>
            <span className="insight-val">{activityStats.peakDayName}</span>
          </div>
        </div>

        <div className="insight-card glass-panel">
          <div className="insight-icon purple"><Sparkles size={24} /></div>
          <div className="insight-text">
            <span className="insight-lbl">DEVELOPER CHRONOTYPE</span>
            <span className="insight-val">{activityStats.chronotype}</span>
          </div>
        </div>
      </div>

      {/* Intensity Legend */}
      <div className="intensity-legend">
        <span className="legend-title">Intensity:</span>
        <span className="intensity-chip low"><span className="intensity-dot low-dot"></span> Low</span>
        <span className="intensity-chip med"><span className="intensity-dot med-dot"></span> Medium</span>
        <span className="intensity-chip high"><span className="intensity-dot high-dot"></span> High</span>
      </div>

      {/* 24-Hour Time of Day Distribution Graph */}
      <div className="activity-graph-panel glass-panel">
        <div className="panel-header">
          <div className="title-with-icon">
            <Sun size={18} className="header-icon" />
            <h3>Time of Day Distribution</h3>
          </div>
          <span className="panel-sub">Activity intensity per hour — 12 AM to 11 PM</span>
        </div>

        <div className="hourly-bar-chart">
          {activityStats.hourlyCounts.map((count, hour) => {
            const ratio = count / activityStats.maxHourly;
            const heightPct = ratio * 100;
            const hourLabel = hour % 3 === 0 ? `${hour === 0 ? '12am' : hour === 12 ? '12pm' : hour > 12 ? hour - 12 + 'pm' : hour + 'am'}` : '';

            return (
              <div key={hour} className="hourly-col" title={`${hour}:00 — ${count} contributions`}>
                <div className="hourly-track">
                  <div
                    className="hourly-fill"
                    style={{
                      height: `${Math.max(count > 0 ? 6 : 2, heightPct)}%`,
                      background: getBarGradient(ratio),
                      boxShadow: getBarGlow(ratio),
                    }}
                  ></div>
                </div>
                <span className="hourly-axis-label">{hourLabel}</span>
              </div>
            );
          })}
        </div>
        <div className="graph-time-legend">
          <span className="legend-chip night"><Moon size={12} /> Night (10 PM – 5 AM)</span>
          <span className="legend-chip day"><Sun size={12} /> Day (6 AM – 9 PM)</span>
        </div>
      </div>

      {/* Day of Week Distribution Graph */}
      <div className="activity-graph-panel glass-panel">
        <div className="panel-header">
          <div className="title-with-icon">
            <Calendar size={18} className="header-icon" />
            <h3>Day of Week Distribution</h3>
          </div>
          <span className="panel-sub">Activity intensity across the week</span>
        </div>

        <div className="weekly-bar-chart">
          {activityStats.dayOfWeekCounts.map((count, dayIdx) => {
            const ratio = count / activityStats.maxDayOfWeek;
            const heightPct = ratio * 100;
            return (
              <div key={DAY_NAMES[dayIdx]} className="weekly-col" title={`${DAY_NAMES[dayIdx]} — ${count} contributions`}>
                <div className="weekly-track">
                  <div
                    className="weekly-fill"
                    style={{
                      height: `${Math.max(count > 0 ? 8 : 3, heightPct)}%`,
                      background: getBarGradient(ratio),
                      boxShadow: getBarGlow(ratio),
                    }}
                  ></div>
                </div>
                <span className="weekly-day-name">{DAY_NAMES[dayIdx]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
