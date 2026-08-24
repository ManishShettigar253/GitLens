import React, { useState, useEffect } from 'react';
import { Calendar, Check } from 'lucide-react';
import './DateRangePicker.css';

export type PresetOption = '30' | '90' | '365' | '1095' | '1825' | 'all' | 'custom';

interface DateRangePickerProps {
  startDateStr: string;
  endDateStr: string;
  activePreset: PresetOption;
  onPresetChange: (preset: PresetOption) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onApplyCustom: () => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDateStr,
  endDateStr,
  activePreset,
  onPresetChange,
  onStartDateChange,
  onEndDateChange,
  onApplyCustom,
}) => {
  const presets: { id: PresetOption; label: string }[] = [
    { id: '30', label: '30D' },
    { id: '90', label: '90D' },
    { id: '365', label: '1 Year' },
    { id: '1095', label: '3 Years' },
    { id: '1825', label: '5 Years' },
    { id: 'all', label: 'All Time' },
    { id: 'custom', label: 'Custom' },
  ];

  // Local state for custom dates to prevent immediate re-renders
  const [localStart, setLocalStart] = useState(startDateStr);
  const [localEnd, setLocalEnd] = useState(endDateStr);

  // Sync local state when props change (e.g. preset clicked)
  useEffect(() => {
    setLocalStart(startDateStr);
    setLocalEnd(endDateStr);
  }, [startDateStr, endDateStr]);

  const handleApply = () => {
    onStartDateChange(localStart);
    onEndDateChange(localEnd);
    onApplyCustom();
  };

  return (
    <div className="date-picker-bar glass-panel">
      <div className="date-picker-header">
        <Calendar size={16} className="date-icon" />
        <span className="picker-title">Time Range Filter</span>
      </div>

      <div className="date-picker-controls">
        {/* Presets */}
        <div className="preset-buttons">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                onPresetChange(preset.id);
              }}
              className={`preset-chip ${activePreset === preset.id ? 'active' : ''}`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Range Inputs */}
        <div className="custom-range-group">
          <div className="date-input-field">
            <label>From</label>
            <input
              type="date"
              value={localStart}
              onChange={(e) => setLocalStart(e.target.value)}
              className="date-input"
            />
          </div>
          <div className="date-input-field">
            <label>To</label>
            <input
              type="date"
              value={localEnd}
              onChange={(e) => setLocalEnd(e.target.value)}
              className="date-input"
            />
          </div>
          <button onClick={handleApply} className="apply-btn">
            <Check size={14} /> Apply
          </button>
        </div>
      </div>
    </div>
  );
};
