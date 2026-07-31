import React, { useState } from 'react';
import { Search, ArrowUpDown, Download, CheckCircle2, AlertTriangle, Filter } from 'lucide-react';
import { SurveillanceRecord } from '../types';
import { exportToCSV } from '../utils/export';

interface SurveillanceTableProps {
  records: SurveillanceRecord[];
}

export const SurveillanceTable: React.FC<SurveillanceTableProps> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState<'All' | 'East Hararghe' | 'West Hararghe'>('All');
  const [sortField, setSortField] = useState<keyof SurveillanceRecord>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleSort = (field: keyof SurveillanceRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filtered = records.filter(rec => {
    if (zoneFilter !== 'All' && rec.zone !== zoneFilter) return false;
    const term = searchTerm.toLowerCase();
    return (
      rec.woreda.toLowerCase().includes(term) ||
      rec.disease.toLowerCase().includes(term) ||
      rec.species.toLowerCase().includes(term) ||
      (rec.reporter && rec.reporter.toLowerCase().includes(term)) ||
      (rec.comment && rec.comment.toLowerCase().includes(term))
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (typeof valA === 'string') {
      return sortAsc
        ? (valA as string).localeCompare(valB as string)
        : (valB as string).localeCompare(valA as string);
    }
    return sortAsc ? Number(valA || 0) - Number(valB || 0) : Number(valB || 0) - Number(valA || 0);
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCSV = () => {
    exportToCSV('HRVL_Surveillance_Records', sorted);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 transition-colors">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Field Surveillance Records & Arrival Log
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Individual telemetry entries logged across East & West Hararghe
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Zone Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
            <select
              aria-label="Table Zone Filter"
              value={zoneFilter}
              onChange={(e) => { setZoneFilter(e.target.value as any); setCurrentPage(1); }}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none pr-2 cursor-pointer"
            >
              <option value="All">All Zones</option>
              <option value="East Hararghe">East Hararghe</option>
              <option value="West Hararghe">West Hararghe</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              aria-label="Search Surveillance Records"
              placeholder="Search woreda, disease, species..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('date')}>
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('woreda')}>
                <div className="flex items-center space-x-1">
                  <span>Woreda</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('zone')}>
                <div className="flex items-center space-x-1">
                  <span>Zone</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('disease')}>
                <div className="flex items-center space-x-1">
                  <span>Disease / Event</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-2.5 px-3">Species</th>
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
              <th className="py-2.5 px-3">Reporter</th>
              <th className="py-2.5 px-3">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {paginated.map((rec) => (
              <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                  {rec.date}
                </td>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                  {rec.woreda}
                </td>
                <td className="py-2.5 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    rec.zone === 'East Hararghe'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                  }`}>
                    {rec.zone}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  {rec.isZeroReport ? (
                    <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Zero Report</span>
                    </span>
                  ) : (
                    <span className="font-bold text-slate-800 dark:text-slate-200">{rec.disease}</span>
                  )}
                </td>
                <td className="py-2.5 px-3 font-medium text-slate-600 dark:text-slate-300">
                  {rec.species}
                </td>
                <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-blue-400">
                  {rec.cases}
                </td>
                <td className="py-2.5 px-3 font-bold text-rose-600 dark:text-rose-400">
                  {rec.deaths}
                </td>
                <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                  {rec.reporter || 'Field Agent'}
                </td>
                <td className="py-2.5 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    rec.risk === 'Critical'
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      : rec.risk === 'High'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {rec.risk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        <span>Showing {paginated.length} of {sorted.length} records</span>
        <div className="flex items-center space-x-1">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50 cursor-pointer"
          >
            Prev
          </button>
          <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">{currentPage} / {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
};
