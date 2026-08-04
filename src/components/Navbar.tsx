import React, { useState } from 'react';
import { 
  Activity, 
  PlusCircle, 
  FileSpreadsheet, 
  Download, 
  FileText, 
  Moon, 
  Sun, 
  Play, 
  Filter,
  ShieldCheck,
  Building2,
  Printer,
  Volume2,
  VolumeX,
  TrendingUp,
  Wifi,
  WifiOff,
  Database,
  RotateCcw,
  Smartphone,
  Maximize2,
  Calendar
} from 'lucide-react';
import { 
  FilterState, 
  ZoneName 
} from '../types';
import { soundEngine } from '../utils/sound';
import { useAuth } from '../contexts/AuthContext';
import { UserCircle, LogOut } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onOpenLogModal: () => void;
  onOpenImportModal: () => void;
  onOpenYoYModal: () => void;
  onOpenReportModal: () => void;
  onOpenAuthModal: () => void;
  onExportAllCSV: () => void;
  onToggleSimulator: () => void;
  isSimulatorRunning: boolean;
  onTogglePrintMode: () => void;
  isPrintFriendlyMode: boolean;
  isPortraitMode?: boolean;
  onTogglePortraitMode?: () => void;
  isOnline?: boolean;
  cachedRecordsCount?: number;
  onResetCache?: () => void;
  dataMinDate?: string;
  dataMaxDate?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  setDarkMode,
  filters,
  setFilters,
  onOpenLogModal,
  onOpenImportModal,
  onOpenYoYModal,
  onOpenReportModal,
  onExportAllCSV,
  onToggleSimulator,
  isSimulatorRunning,
  onTogglePrintMode,
  isPrintFriendlyMode,
  isPortraitMode = false,
  onTogglePortraitMode,
  isOnline = true,
  cachedRecordsCount = 0,
  onResetCache,
  dataMinDate,
  dataMaxDate,
  onOpenAuthModal
}) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundEngine.enabled);
  const { user, logout } = useAuth();

  const toggleSound = () => {
    const next = !soundEnabled;
    soundEngine.enabled = next;
    setSoundEnabled(next);
    if (next) soundEngine.playBlip();
  };
  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3">
          
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3">
            <div className="h-11 w-11 rounded-xl bg-slate-900 border border-emerald-500/50 p-1 flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
              <img 
                src="/hrvl-emblem.png" 
                alt="HRVL Emblem" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('lh3.googleusercontent.com')) {
                    target.src = 'https://lh3.googleusercontent.com/d/1i0X8Bpdb5uoX0hP0pfbPOnzJXbymF_Oq';
                  }
                }}
                className="w-full h-full object-contain" 
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Hirna RVL Analytics
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 rounded-full border border-emerald-300 dark:border-emerald-800">
                  Oromia HRVL
                </span>
                
                {/* Offline LocalStorage Cache Indicator Badge */}
                <div 
                  className={`inline-flex items-center space-x-1 px-2 py-0.5 text-[11px] font-bold rounded-full border transition-all ${
                    !isOnline 
                      ? 'bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700 animate-pulse'
                      : 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800'
                  }`}
                  title={isOnline ? `Surveillance data cached in browser localStorage (${cachedRecordsCount} records)` : `Offline Mode: Field entries saved locally to localStorage (${cachedRecordsCount} records)`}
                >
                  {!isOnline ? (
                    <>
                      <WifiOff className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>Offline Cache Active ({cachedRecordsCount} recs)</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      <span>Cached Locally ({cachedRecordsCount} recs)</span>
                    </>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Regional Veterinary Laboratory • East (21) & West (15) Hararghe</span>
              </p>
              {dataMinDate && dataMaxDate && (
                <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>Imported Data Range: {dataMinDate} to {dataMaxDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
              <select
                aria-label="Filter by Zone"
                value={filters.zone}
                onChange={(e) => {
                  soundEngine.playClick();
                  setFilters(prev => ({ ...prev, zone: e.target.value as any }));
                }}
                className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none pr-2 cursor-pointer"
              >
                <option value="All" className="dark:bg-slate-900">All Zones (36 Woredas)</option>
                <option value="E/H" className="dark:bg-slate-900">E/H (21)</option>
                <option value="W/H" className="dark:bg-slate-900">W/H (15)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenLogModal();
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Arrival</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playBlip();
                onToggleSimulator();
              }}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                isSimulatorRunning
                  ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700 animate-pulse'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-750'
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isSimulatorRunning ? 'fill-amber-600 dark:fill-amber-400' : ''}`} />
              <span>{isSimulatorRunning ? 'Simulator Active' : 'Profile Simulator'}</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenImportModal();
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Multi-Excel Import</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenYoYModal();
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>YoY Analysis</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playSuccess();
                onExportAllCSV();
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>CSV Export</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenReportModal();
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>AI SitRep Report</span>
            </button>

            {/* Reset Cache / Defaults Button */}
            {onResetCache && (
              <button
                onClick={() => {
                  if (window.confirm('Reset offline cached records and revert to default sample dataset?')) {
                    soundEngine.playClick();
                    onResetCache();
                  }
                }}
                title="Reset offline cache and restore default sample data"
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Reset Cache</span>
              </button>
            )}

            {/* Portrait Mobile/Tablet Layout Toggle Button */}
            {onTogglePortraitMode && (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onTogglePortraitMode();
                }}
                title={isPortraitMode ? 'Switch to Full Landscape Desktop View' : 'Switch to Focused Vertical Portrait Layout'}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  isPortraitMode
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-400/30 dark:bg-indigo-500 dark:border-indigo-400'
                    : 'bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:text-indigo-200 dark:border-indigo-800 dark:hover:bg-indigo-900'
                }`}
              >
                {isPortraitMode ? (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>📱 Portrait Active</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>📱 Portrait View</span>
                  </>
                )}
              </button>
            )}

            {/* Field Print Snapshot Toggle Button */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onTogglePrintMode();
              }}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                isPrintFriendlyMode
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md font-extrabold animate-pulse'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800 dark:hover:bg-amber-900'
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>{isPrintFriendlyMode ? '🖨️ Exit Print View' : '🖨️ Field Print Snapshot'}</span>
            </button>

            {/* Acoustic Telemetry Sound Switch */}
            <button
              onClick={toggleSound}
              aria-label="Toggle acoustic telemetry sound effects"
              title={soundEnabled ? 'Acoustic Telemetry Audio: ON' : 'Acoustic Telemetry Audio: MUTED'}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                soundEnabled 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Auth Toggle */}
            {user ? (
              <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-2 ml-2">
                <span className="text-xs text-slate-600 dark:text-slate-300 hidden md:inline-block max-w-[120px] truncate">
                  {user.displayName || user.email}
                </span>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    logout();
                  }}
                  title="Sign Out"
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-2 ml-2">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenAuthModal();
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <UserCircle className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              </div>
            )}

            {/* Dark / Light Toggle */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setDarkMode((prev: boolean) => !prev);
              }}
              aria-label="Toggle theme"
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
