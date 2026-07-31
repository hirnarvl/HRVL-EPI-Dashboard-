import React from 'react';
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
  Printer
} from 'lucide-react';
import { FilterState, ZoneName } from '../types';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onOpenLogModal: () => void;
  onOpenImportModal: () => void;
  onOpenReportModal: () => void;
  onExportAllCSV: () => void;
  onToggleSimulator: () => void;
  isSimulatorRunning: boolean;
  onTogglePrintMode: () => void;
  isPrintFriendlyMode: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  setDarkMode,
  filters,
  setFilters,
  onOpenLogModal,
  onOpenImportModal,
  onOpenReportModal,
  onExportAllCSV,
  onToggleSimulator,
  isSimulatorRunning,
  onTogglePrintMode,
  isPrintFriendlyMode
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3">
          
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Hirna RVL Analytics
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 rounded-full border border-emerald-300 dark:border-emerald-800">
                  Oromia HRVL
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Regional Veterinary Laboratory • East (21) & West (15) Hararghe</span>
              </p>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
              <select
                aria-label="Filter by Zone"
                value={filters.zone}
                onChange={(e) => setFilters(prev => ({ ...prev, zone: e.target.value as any }))}
                className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none pr-2 cursor-pointer"
              >
                <option value="All" className="dark:bg-slate-900">All Zones (36 Woredas)</option>
                <option value="East Hararghe" className="dark:bg-slate-900">East Hararghe (21)</option>
                <option value="West Hararghe" className="dark:bg-slate-900">West Hararghe (15)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <button
              onClick={onOpenLogModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Arrival</span>
            </button>

            <button
              onClick={onToggleSimulator}
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
              onClick={onOpenImportModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Excel Import</span>
            </button>

            <button
              onClick={onExportAllCSV}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>CSV Export</span>
            </button>

            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>AI SitRep Report</span>
            </button>

            {/* Field Print Snapshot Toggle Button */}
            <button
              onClick={onTogglePrintMode}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                isPrintFriendlyMode
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md font-extrabold animate-pulse'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800 dark:hover:bg-amber-900'
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>{isPrintFriendlyMode ? '🖨️ Exit Print View' : '🖨️ Field Print Snapshot'}</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setDarkMode((prev: boolean) => !prev)}
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
