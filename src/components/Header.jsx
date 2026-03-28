import { Shield, Share2, Moon, Sun, Search, LayoutTemplate, Phone, RotateCcw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';

export default function Header({ activeTab, onTabChange, showTabs = false, onExport, onSave, onClear }) {
  const { isDark, toggle } = useTheme();
  const { globalSearch, setGlobalSearch } = useData();

  return (
    <header className="h-[58px] border-b border-[var(--border-color)] bg-[var(--surface-color)]/90 backdrop-blur-xl flex items-center px-5 gap-4 sticky top-0 z-50 shrink-0">
      {/* Logo & Brand */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-[15px] tracking-tight text-[var(--text-color)]">Packet Assistant</span>
      </div>

      {/* Tab Switcher (only when dashboard is active) */}
      {showTabs && (
        <div className="flex items-center gap-1 ml-4 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg p-0.5">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[var(--surface-color)] text-[var(--text-color)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-color)]'
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            Main Dashboard
          </button>
          <button
            onClick={() => onTabChange('voice')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium transition-all ${
              activeTab === 'voice'
                ? 'bg-[var(--surface-color)] text-[var(--text-color)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-color)]'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            Voice Analytics
          </button>
        </div>
      )}

      {/* Global Search — grows to fill remaining space */}
      {showTabs && (
        <div className="flex-1 max-w-sm ml-auto relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={globalSearch || ''}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search IP, MAC, or hostname..."
            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg text-sm pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[var(--text-secondary)]"
          />
        </div>
      )}

      {/* Right Controls */}
      <div className={`flex items-center gap-2 ml-auto ${showTabs ? 'ml-0' : ''}`}>
        <button
          onClick={toggle}
          title="Toggle dark mode"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-color)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-color)]"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {showTabs && (
          <button
            onClick={onSave}
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium border border-[var(--border-color)] px-3 py-1.5 rounded-lg hover:bg-[var(--bg-color)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-color)]"
          >
            Save State
          </button>
        )}

        <button
          onClick={onExport}
          className="flex items-center gap-1.5 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-all active:scale-95 shadow-sm"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export Report</span>
        </button>

        {showTabs && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 text-sm font-medium border border-red-500/30 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-500/5 transition-colors"
            title="Clear current capture and restart parser"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear & Restart</span>
          </button>
        )}
      </div>
    </header>
  );
}
