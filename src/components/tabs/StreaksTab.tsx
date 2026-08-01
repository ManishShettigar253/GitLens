import React, { useMemo } from 'react';
import type { PullRequest } from '../../services/github';
import { Flame, Trophy, CalendarCheck, Zap } from 'lucide-react';
import { PRCalendar } from '../PRCalendar';
import './StreaksTab.css';

interface StreaksTabProps {
  prs: PullRequest[];
  startDate: Date;
  endDate: Date;
}

export const StreaksTab: React.FC<StreaksTabProps> = ({ prs, startDate, endDate }) => {
  // Compute daily contribution map
  const streakStats = useMemo(() => {
    const map: Record<string, number> = {};
    prs.forEach((pr) => {
      const dateStr = pr.created_at.split('T')[0];
      map[dateStr] = (map[dateStr] || 0) + 1;
    });

    const activeDates = Object.keys(map).sort();
    const totalActiveDays = activeDates.length;

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Sort all dates chronologically
    let prevDate: Date | null = null;
    activeDates.forEach((dStr) => {
      const d = new Date(dStr);
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diffTime = d.getTime() - prevDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
        if (diffDays === 1) {
          tempStreak += 1;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      prevDate = d;
    });

    // Calculate current streak relative to today
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (map[todayStr] || map[yesterdayStr]) {
      let checkDate = map[todayStr] ? new Date() : yesterday;
      while (true) {
        const s = checkDate.toISOString().split('T')[0];
        if (map[s]) {
          currentStreak += 1;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    } else {
      currentStreak = 0;
    }

    if (longestStreak === 0 && totalActiveDays > 0) longestStreak = 1;
    if (currentStreak === 0 && map[todayStr]) currentStreak = 1;

    return {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      totalActiveDays,
      totalContributions: prs.length,
    };
  }, [prs, startDate, endDate]);

  const milestones = [
    { title: '7-Day Streak', icon: Flame, earned: streakStats.longestStreak >= 7, desc: 'Logged contributions 7 days in a row' },
    { title: '30-Day Streak', icon: Trophy, earned: streakStats.longestStreak >= 30, desc: 'Maintained activity for a full month' },
    { title: 'Century Contributor', icon: Zap, earned: prs.length >= 100, desc: 'Over 100 total contributions' },
    { title: 'Active Developer', icon: CalendarCheck, earned: streakStats.totalActiveDays >= 50, desc: 'Contributed on 50+ unique days' },
  ];

  return (
    <div className="streaks-container animate-fade-in">
      {/* Header */}
      <div className="tab-header">
        <h2 className="tab-title">Streaks & Consistency</h2>
        <p className="tab-subtitle">Track your daily contribution momentum and milestone badges</p>
      </div>

      {/* Hero Stats */}
      <div className="streak-hero-grid">
        <div className="streak-card glass-panel hero-flame">
          <div className="streak-icon-box flame"><Flame size={28} /></div>
          <div className="streak-info">
            <span className="streak-value">{streakStats.currentStreak} <span className="unit">days</span></span>
            <span className="streak-label">CURRENT STREAK</span>
          </div>
        </div>

        <div className="streak-card glass-panel hero-trophy">
          <div className="streak-icon-box trophy"><Trophy size={28} /></div>
          <div className="streak-info">
            <span className="streak-value">{streakStats.longestStreak} <span className="unit">days</span></span>
            <span className="streak-label">LONGEST STREAK</span>
          </div>
        </div>

        <div className="streak-card glass-panel">
          <div className="streak-icon-box calendar"><CalendarCheck size={28} /></div>
          <div className="streak-info">
            <span className="streak-value">{streakStats.totalActiveDays} <span className="unit">days</span></span>
            <span className="streak-label">TOTAL ACTIVE DAYS</span>
          </div>
        </div>

        <div className="streak-card glass-panel">
          <div className="streak-icon-box zap"><Zap size={28} /></div>
          <div className="streak-info">
            <span className="streak-value">{streakStats.totalContributions}</span>
            <span className="streak-label">TOTAL CONTRIBUTIONS</span>
          </div>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="streak-heatmap-panel glass-panel">
        <div className="panel-header" style={{ marginBottom: '16px' }}>
          <h3>Contribution Heatmap Calendar</h3>
          <span className="panel-sub">Density of daily activity over the selected date range</span>
        </div>
        <PRCalendar prs={prs} startDate={startDate} endDate={endDate} />
      </div>

      {/* Milestone Badges Section */}
      <div className="milestones-panel glass-panel">
        <div className="panel-header" style={{ marginBottom: '20px' }}>
          <h3>Developer Milestones</h3>
          <span className="panel-sub">Badges unlocked based on your GitHub activity</span>
        </div>

        <div className="milestones-grid">
          {milestones.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.title} className={`milestone-badge-card ${m.earned ? 'unlocked' : 'locked'}`}>
                <div className="milestone-icon">
                  <Icon size={24} />
                </div>
                <div className="milestone-text">
                  <h4 className="milestone-name">{m.title}</h4>
                  <p className="milestone-desc">{m.desc}</p>
                  <span className="status-tag">{m.earned ? '✓ Unlocked' : 'Locked'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
