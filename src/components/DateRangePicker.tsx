import React from 'react';
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
              onClick={() => onPresetChange(preset.id)}
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
              value={startDateStr}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="date-input"
            />
          </div>
          <div className="date-input-field">
            <label>To</label>
            <input
              type="date"
              value={endDateStr}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="date-input"
            />
          </div>
          <button onClick={onApplyCustom} className="apply-btn">
            <Check size={14} /> Apply
          </button>
        </div>
      </div>
    </div>
  );
};
