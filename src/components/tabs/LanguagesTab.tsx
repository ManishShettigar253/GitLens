import React, { useMemo } from 'react';
import type { PullRequest } from '../../services/github';
import { Code2, Layers, GitPullRequest, FolderGit2 } from 'lucide-react';
import './LanguagesTab.css';

interface LanguagesTabProps {
  prs: PullRequest[];
}

interface LanguageStat {
  name: string;
  lines: number;
  prCount: number;
  percentage: number;
  color: string;
}

const LANGUAGE_COLORS: Record<string, string> = {
  Java: '#b07219',
  HTML: '#e34c26',
  TSQL: '#e9851d',
  'Visual Basic .NET': '#945db7',
  XSLT: '#eb8017',
  'C++': '#f34b7d',
  Batchfile: '#c1f12e',
  Python: '#3572A5',
  Shell: '#89e051',
  'C#': '#178600',
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  CSS: '#563d7c',
  Go: '#00ADD8',
  Rust: '#dea584',
};

export const LanguagesTab: React.FC<LanguagesTabProps> = ({ prs }) => {
  const stats = useMemo(() => {
    const map: Record<string, { lines: number; prCount: number }> = {};
    let totalLines = 0;

    prs.forEach((pr) => {
      const lang = pr.primary_language || 'Other';
      const lines = pr.additions + pr.deletions;
      totalLines += lines;

      if (!map[lang]) {
        map[lang] = { lines: 0, prCount: 0 };
      }
      map[lang].lines += lines;
      map[lang].prCount += 1;
    });

    const list: LanguageStat[] = Object.entries(map).map(([name, data]) => ({
      name,
      lines: data.lines,
      prCount: data.prCount,
      percentage: totalLines > 0 ? Math.round((data.lines / totalLines) * 1000) / 10 : 0,
      color: LANGUAGE_COLORS[name] || '#3b82f6',
    }));

    // Sort descending by lines written
    list.sort((a, b) => b.lines - a.lines);

    const uniqueRepos = new Set(prs.map((p) => p.repo_name)).size;

    return {
      list,
      totalLines,
      uniqueRepos,
      detectedCount: list.length,
    };
  }, [prs]);

  return (
    <div className="languages-container animate-fade-in">
      {/* Header */}
      <div className="tab-header">
        <h2 className="tab-title">Language Analytics</h2>
        <p className="tab-subtitle">Languages you actually wrote code in — based on lines changed across your contributions</p>
      </div>

      {/* Sub-stats Banner matching reference image #4 */}
      <div className="lang-sub-banner glass-panel">
        <div className="sub-stat">
          <GitPullRequest size={16} className="sub-icon" />
          <span><strong>{prs.length}</strong> contributions analysed</span>
        </div>
        <div className="sub-stat-divider">|</div>
        <div className="sub-stat">
          <FolderGit2 size={16} className="sub-icon" />
          <span>across <strong>{stats.uniqueRepos}</strong> repos</span>
        </div>
        <div className="sub-stat-divider">|</div>
        <div className="sub-stat">
          <Code2 size={16} className="sub-icon" />
          <span><strong>{stats.detectedCount}</strong> languages detected</span>
        </div>
        <div className="sub-stat-divider">|</div>
        <div className="sub-stat">
          <Layers size={16} className="sub-icon" />
          <span><strong>{stats.totalLines.toLocaleString()}</strong> lines written total</span>
        </div>
      </div>

      {/* Split Charts: Donut Chart Left & Top Languages Right */}
      <div className="lang-split-grid">
        {/* Language Distribution Donut */}
        <div className="lang-card glass-panel">
          <div className="panel-header">
            <h3>Language Distribution</h3>
            <span className="panel-sub">By lines of code you actually wrote</span>
          </div>

          <div className="lang-donut-flex">
            <div className="lang-donut-wrapper">
              <svg viewBox="0 0 100 100" className="donut-svg">
                <circle cx="50" cy="50" r="38" className="donut-bg" />
                {stats.list.map((lang, idx) => {
                  // Calculate strokeDasharray
                  const cumulativePct = stats.list
                    .slice(0, idx)
                    .reduce((acc, curr) => acc + curr.percentage, 0);
                  const strokeLen = (lang.percentage / 100) * 238.76;
                  const offset = -(cumulativePct / 100) * 238.76;

                  return (
                    <circle
                      key={lang.name}
                      cx="50"
                      cy="50"
                      r="38"
                      stroke={lang.color}
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={`${strokeLen} 238.76`}
                      strokeDashoffset={offset}
                      className="lang-donut-segment"
                    />
                  );
                })}
              </svg>
              <div className="donut-inner-text">
                <span className="inner-number">{stats.detectedCount}</span>
                <span className="inner-label">languages</span>
              </div>
            </div>

            <div className="lang-donut-legend">
              {stats.list.slice(0, 6).map((lang) => (
                <div key={lang.name} className="lang-legend-row">
                  <span className="lang-dot" style={{ backgroundColor: lang.color }}></span>
                  <span className="lang-name">{lang.name}</span>
                  <span className="lang-pct">{lang.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Languages Ranked List */}
        <div className="lang-card glass-panel">
          <div className="panel-header">
            <h3>Top Languages</h3>
            <span className="panel-sub">Ranked by lines written</span>
          </div>

          <div className="top-languages-list">
            {stats.list.slice(0, 8).map((lang, idx) => (
              <div key={lang.name} className="top-lang-item">
                <span className="rank-num">{idx + 1}</span>
                <span className="lang-dot" style={{ backgroundColor: lang.color }}></span>
                <span className="top-lang-name">{lang.name}</span>
                <div className="top-lang-bar-track">
                  <div
                    className="top-lang-bar-fill"
                    style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                  ></div>
                </div>
                <span className="top-lang-pct">{lang.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Breakdown Section */}
      <div className="full-breakdown-card glass-panel">
        <div className="panel-header" style={{ marginBottom: '20px' }}>
          <h3>All Languages — Full Breakdown</h3>
          <span className="panel-sub">Each bar = % of your total lines written in that language</span>
        </div>

        <div className="all-languages-bars">
          {stats.list.map((lang) => (
            <div key={lang.name} className="all-lang-row">
              <div className="all-lang-info">
                <span className="lang-dot" style={{ backgroundColor: lang.color }}></span>
                <span className="all-lang-name">{lang.name}</span>
                <span className="all-lang-lines">{lang.lines.toLocaleString()} lines ({lang.prCount} contributions)</span>
              </div>
              <div className="all-lang-track">
                <div
                  className="all-lang-fill"
                  style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                ></div>
              </div>
              <span className="all-lang-val">{lang.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
