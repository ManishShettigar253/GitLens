import React, { useMemo, useState } from 'react';
import './PRCalendar.css';
import type { PullRequest } from '../services/github';

interface PRCalendarProps {
  prs: PullRequest[];
  startDate: Date;
  endDate: Date;
}

export const PRCalendar: React.FC<PRCalendarProps> = ({ prs, startDate, endDate }) => {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);

  // Group PRs by date string (YYYY-MM-DD)
  const prsByDate = useMemo(() => {
    const counts: { [dateStr: string]: number } = {};
    prs.forEach((pr) => {
      const dateStr = pr.created_at.split('T')[0];
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    });
    return counts;
  }, [prs]);

  // Generate grid days between startDate and endDate
  const { grid, monthLabels } = useMemo(() => {
    const tempGrid: Date[][] = [];
    const tempMonthLabels: { label: string; index: number }[] = [];
    
    // Create copy of dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Adjust start date to the preceding Sunday to align rows (0 = Sunday, 6 = Saturday)
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - dayOfWeek);
    
    // Generate dates
    const allDays: Date[] = [];
    const curr = new Date(start);
    while (curr <= end || allDays.length % 7 !== 0) {
      allDays.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    
    // Chunk into weeks (columns)
    const weeksCount = allDays.length / 7;
    for (let w = 0; w < weeksCount; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(allDays[w * 7 + d]);
      }
      tempGrid.push(week);
      
      // Calculate month labels (placed above the first week of a new month)
      const midWeekDate = week[3]; // Use midweek date to avoid boundary glitches
      const monthName = midWeekDate.toLocaleString('default', { month: 'short' });
      
      if (tempMonthLabels.length === 0 || tempMonthLabels[tempMonthLabels.length - 1].label !== monthName) {
        tempMonthLabels.push({ label: monthName, index: w });
      }
    }
    
    return { grid: tempGrid, monthLabels: tempMonthLabels };
  }, [startDate, endDate]);

  // Determine color intensity based on PR count
  const getColorClass = (count: number) => {
    if (count === 0) return 'level-0';
    if (count === 1) return 'level-1';
    if (count === 2) return 'level-2';
    if (count <= 4) return 'level-3';
    return 'level-4';
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-panel glass-panel animate-fade-in">
      <div className="calendar-header">
        <h4>Contribution Calendar</h4>
        <div className="calendar-legend">
          <span>Less</span>
          <span className="legend-box level-0"></span>
          <span className="legend-box level-1"></span>
          <span className="legend-box level-2"></span>
          <span className="legend-box level-3"></span>
          <span className="legend-box level-4"></span>
          <span>More</span>
        </div>
      </div>

      <div className="calendar-body-wrapper">
        <div className="calendar-body">
          {/* Day of week labels */}
          <div className="day-labels">
            {dayLabels.map((day, idx) => (
              <span key={idx} className="day-label">
                {idx % 2 === 1 ? day : ''}
              </span>
            ))}
          </div>

          <div className="grid-container">
            {/* Month Labels row */}
            <div className="month-labels-row">
              {monthLabels.map((ml, idx) => (
                <span 
                  key={idx} 
                  className="month-label"
                  style={{ left: `${ml.index * 14}px` }}
                >
                  {ml.label}
                </span>
              ))}
            </div>

            {/* Heatmap Grid SVG */}
            <div className="svg-scroll-container">
              <svg width={grid.length * 14} height={7 * 14} className="heatmap-svg">
                {grid.map((week, wIdx) => (
                  <g key={wIdx} transform={`translate(${wIdx * 14}, 0)`}>
                    {week.map((day, dIdx) => {
                      const dateStr = day.toISOString().split('T')[0];
                      const prCount = prsByDate[dateStr] || 0;
                      const isOutOfRange = day < startDate || day > endDate;
                      
                      return (
                        <rect
                          key={dIdx}
                          x={0}
                          y={dIdx * 14}
                          width={11}
                          height={11}
                          rx={2}
                          className={`calendar-cell ${getColorClass(prCount)} ${isOutOfRange ? 'out-of-range' : ''}`}
                          onMouseEnter={() => setHoveredDay({ date: dateStr, count: prCount })}
                          onMouseLeave={() => setHoveredDay(null)}
                        >
                          <title>{`${prCount} contribution${prCount !== 1 ? 's' : ''} on ${new Date(dateStr).toLocaleDateString(undefined, { dateStyle: 'medium' })}`}</title>
                        </rect>
                      );
                    })}
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="calendar-tooltip-bar">
        {hoveredDay ? (
          <div className="calendar-tooltip">
            <strong>{hoveredDay.count} contribution{hoveredDay.count !== 1 ? 's' : ''}</strong> on {new Date(hoveredDay.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
          </div>
        ) : (
          <span className="tooltip-placeholder">Hover over a grid cell to view daily contributions</span>
        )}
      </div>
    </div>
  );
};
