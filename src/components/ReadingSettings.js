'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

const FONTS = [
  { name: 'Georgia', label: 'Georgia (Serif)' },
  { name: '"Playfair Display"', label: 'Playfair Display' },
  { name: '"Be Vietnam Pro"', label: 'Be Vietnam Pro' },
  { name: '"Times New Roman"', label: 'Times New Roman' },
  { name: 'Palatino', label: 'Palatino' },
  { name: 'system-ui', label: 'Hệ thống' },
];

const THEMES = [
  { bg: '#FFF8F0', text: '#4A3728', label: 'Giấy cũ', icon: '📜' },
  { bg: '#FFFFFF', text: '#333333', label: 'Trắng', icon: '⬜' },
  { bg: '#F5F0E8', text: '#5C4B37', label: 'Sepia', icon: '🍂' },
  { bg: '#E8F5E8', text: '#2D4A2D', label: 'Lá xanh', icon: '🍃' },
  { bg: '#FFF0F5', text: '#8B4560', label: 'Hồng nhạt', icon: '🌸' },
  { bg: '#1A1A2E', text: '#E0D8CC', label: 'Đêm xanh', icon: '🌙' },
  { bg: '#2D2D2D', text: '#D4D4D4', label: 'Tối', icon: '🖤' },
  { bg: '#1E1E1E', text: '#C8B89A', label: 'Đen ấm', icon: '☕' },
];

export default function ReadingSettings({ settings, onSettingsChange, isOpen, onClose }) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const updateSetting = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const applyTheme = (theme) => {
    const newSettings = { ...localSettings, bgColor: theme.bg, textColor: theme.text };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const saveToServer = async () => {
    setSaving(true);
    await api.saveSettings(localSettings);
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[80vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-4 pb-3 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-ink-800 flex items-center gap-2">
            <span>⚙️</span> Tuỳ chỉnh đọc
          </h3>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Font Size */}
          <div>
            <label className="text-sm font-medium text-ink-600 mb-2 block">
              Cỡ chữ: {localSettings.fontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="32"
              step="1"
              value={localSettings.fontSize}
              onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
              className="w-full h-2 bg-romance-100 rounded-lg appearance-none cursor-pointer accent-romance-500"
            />
            <div className="flex justify-between text-xs text-ink-300 mt-1">
              <span>Nhỏ</span><span>Vừa</span><span>Lớn</span>
            </div>
          </div>

          {/* Line Height */}
          <div>
            <label className="text-sm font-medium text-ink-600 mb-2 block">
              Giãn dòng: {localSettings.lineHeight}
            </label>
            <input
              type="range"
              min="1.2"
              max="3"
              step="0.1"
              value={localSettings.lineHeight}
              onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
              className="w-full h-2 bg-romance-100 rounded-lg appearance-none cursor-pointer accent-romance-500"
            />
            <div className="flex justify-between text-xs text-ink-300 mt-1">
              <span>Sít</span><span>Rộng</span>
            </div>
          </div>

          {/* Font Family */}
          <div>
            <label className="text-sm font-medium text-ink-600 mb-2 block">Phông chữ</label>
            <div className="grid grid-cols-2 gap-2">
              {FONTS.map((font) => (
                <button
                  key={font.name}
                  onClick={() => updateSetting('fontFamily', font.name)}
                  className={`text-left px-3 py-2 rounded-xl text-sm transition-all ${
                    localSettings.fontFamily === font.name
                      ? 'bg-romance-100 border-2 border-romance-400 text-romance-700'
                      : 'bg-gray-50 border-2 border-transparent text-ink-600 hover:bg-gray-100'
                  }`}
                  style={{ fontFamily: font.name }}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="text-sm font-medium text-ink-600 mb-2 block">Giao diện đọc</label>
            <div className="grid grid-cols-4 gap-2">
              {THEMES.map((theme) => (
                <button
                  key={theme.bg}
                  onClick={() => applyTheme(theme)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    localSettings.bgColor === theme.bg
                      ? 'ring-2 ring-romance-400 scale-105'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: theme.bg }}
                >
                  <span className="text-lg">{theme.icon}</span>
                  <span className="text-[10px] font-medium" style={{ color: theme.text }}>
                    {theme.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div
            className="rounded-2xl p-4 border"
            style={{
              backgroundColor: localSettings.bgColor,
              color: localSettings.textColor,
              fontFamily: localSettings.fontFamily,
              fontSize: `${localSettings.fontSize}px`,
              lineHeight: localSettings.lineHeight,
            }}
          >
            <p style={{ textIndent: '2em' }}>
              Nàng ngẩng đầu nhìn chàng, đôi mắt long lanh như sao đêm. Gió thoảng qua mang theo hương hoa đào, khiến khoảnh khắc ấy trở nên vĩnh cửu...
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={saveToServer}
            disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-romance-500 to-romance-600 text-white rounded-2xl font-medium hover:from-romance-600 hover:to-romance-700 transition-all disabled:opacity-50 shadow-lg shadow-romance-200"
          >
            {saving ? 'Đang lưu...' : '💾 Lưu cài đặt'}
          </button>
        </div>
      </div>
    </div>
  );
}