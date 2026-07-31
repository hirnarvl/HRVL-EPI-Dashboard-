import React, { useState } from 'react';
import { Search, ArrowUpDown, Download, Flame } from 'lucide-react';
import { Outbreak } from '../types';
import { exportToCSV } from '../utils/export';

interface OutbreakTableProps {
  outbreaks: Outbreak[];
}

export const OutbreakTable: React.FC<OutbreakTableProps> = ({ outbreaks }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Outbreak>('cases');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: keyof Outbreak) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filtered = outbreaks.filter(ob =>
    ob.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ob.woreda.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ob.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ob.outbreakCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (typeof valA === 'string') {
      return sortAsc
        ? (valA as string).localeCompare(valB as string)
        : (valB as string).localeCompare(valA as string);
    }
    return sortAsc ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
  });

  const handleExportCSV = () => {
    exportToCSV('HRVL_Active_Outbreaks', sorted);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 transition-colors">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              HRVL Field Outbreak Tracking Table
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Morbidity, Mortality, and Case Fatality Rate (CFR) epidemiological columns
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              aria-label="Search Outbreaks"
              placeholder="Search code, disease, woreda..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Export</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="py-2.5 px-3">Code</th>
              <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('disease')}>
                <div className="flex items-center space-x-1">
                  <span>Disease</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('woreda')}>
                <div className="flex items-center space-x-1">
                  <span>Woreda / Zone</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('status')}>
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('cases')}>
                <div className="flex items-center space-x-1">
                  <span>Cases</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('deaths')}>
                <div className="flex items-center space-x-1">
                  <span>Deaths</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer text-blue-600 dark:text-blue-400" onClick={() => handleSort('morbidityRate')}>
                <div className="flex items-center space-x-1">
                  <span>Morbidity %</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer text-rose-600 dark:text-rose-400" onClick={() => handleSort('mortalityRate')}>
                <div className="flex items-center space-x-1">
                  <span>Mortality %</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer text-red-600 dark:text-red-400" onClick={() => handleSort('cfr')}>
                <div className="flex items-center space-x-1">
                  <span>CFR %</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {sorted.map((ob) => (
              <tr key={ob.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                  {ob.outbreakCode}
                </td>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                  {ob.disease}
                </td>
                <td className="py-2.5 px-3 font-medium">
                  {ob.woreda} <span className="text-slate-400">({ob.zone})</span>
                </td>
                <td className="py-2.5 px-3">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                    ob.status === 'Active'
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300'
                      : ob.status === 'Under Investigation'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {ob.status}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                  {ob.cases}
                </td>
                <td className="py-2.5 px-3 font-bold text-rose-600 dark:text-rose-400">
                  {ob.deaths}
                </td>
                <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-blue-400">
                  {ob.morbidityRate}%
                </td>
                <td className="py-2.5 px-3 font-bold text-slate-600 dark:text-slate-400">
                  {ob.mortalityRate}%
                </td>
                <td className="py-2.5 px-3 font-black text-red-600 dark:text-red-400">
                  {ob.cfr}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
