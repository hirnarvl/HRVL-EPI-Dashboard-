import React from 'react';
import { 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Skull, 
  MapPin, 
  Flame,
  PieChart,
  BarChart3
} from 'lucide-react';
import { SurveillanceRecord, Outbreak, WoredaCompliance } from '../types';

interface KPICardsProps {
  records: SurveillanceRecord[];
  outbreaks: Outbreak[];
  complianceList: WoredaCompliance[];
}

export const KPICards: React.FC<KPICardsProps> = ({
  records,
  outbreaks,
  complianceList
}) => {
  // Calculations
  const totalReports = records.length;
  const zeroReports = records.filter(r => r.isZeroReport || r.cases === 0).length;
  const totalCases = records.reduce((acc, curr) => acc + (curr.cases || 0), 0);
  const totalDeaths = records.reduce((acc, curr) => acc + (curr.deaths || 0), 0);
  
  const activeOutbreaksCount = outbreaks.filter(o => o.status === 'Active').length;
  const totalOutbreaksCount = outbreaks.length;
  
  // Active Woredas count (woredas with active cases)
  const activeWoredasSet = new Set(
    records.filter(r => r.cases > 0).map(r => r.woreda)
  );
  const activeWoredasCount = activeWoredasSet.size;

  // Zone Compliance Rates
  const overallAvgCompliance = complianceList.length 
    ? Math.round(complianceList.reduce((acc, curr) => acc + curr.complianceRate, 0) / complianceList.length)
    : 0;

  const eastCompliance = complianceList.filter(c => c.zone === 'East Hararghe');
  const eastAvgRate = eastCompliance.length
    ? Math.round(eastCompliance.reduce((acc, curr) => acc + curr.complianceRate, 0) / eastCompliance.length)
    : 0;

  const westCompliance = complianceList.filter(c => c.zone === 'West Hararghe');
  const westAvgRate = westCompliance.length
    ? Math.round(westCompliance.reduce((acc, curr) => acc + curr.complianceRate, 0) / westCompliance.length)
    : 0;

  const kpis = [
    {
      title: 'Total Surveillance Reports',
      value: totalReports.toLocaleString(),
      change: '+6.4%',
      isPositive: true,
      icon: FileCheck,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
      subtext: 'Cumulative field submissions'
    },
    {
      title: 'Total Outbreaks Tracked',
      value: totalOutbreaksCount.toString(),
      change: '+2 new',
      isPositive: false,
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
      subtext: 'FMD, PPR, LSD, CBPP, Anthrax'
    },
    {
      title: 'Zero Reports Logged',
      value: zeroReports.toString(),
      change: '+12.5%',
      isPositive: true,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
      subtext: 'Passive zero-outbreak validation'
    },
    {
      title: 'Overall Compliance Rate',
      value: `${overallAvgCompliance}%`,
      change: '+3.1%',
      isPositive: true,
      icon: BarChart3,
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900',
      subtext: '36 Woredas target: >=80%'
    },
    {
      title: 'Total Animal Cases',
      value: totalCases.toLocaleString(),
      change: '+4.2%',
      isPositive: false,
      icon: Activity,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900',
      subtext: 'Across 7 livestock species'
    },
    {
      title: 'Total Animal Deaths',
      value: totalDeaths.toLocaleString(),
      change: '-1.8%',
      isPositive: true,
      icon: Skull,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900',
      subtext: `CFR: ${totalCases ? ((totalDeaths / totalCases) * 100).toFixed(1) : 0}%`
    },
    {
      title: 'Active Woredas Affected',
      value: `${activeWoredasCount} / 36`,
      change: '16.6% ratio',
      isPositive: false,
      icon: MapPin,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900',
      subtext: 'East & West Hararghe zones'
    },
    {
      title: 'Active Outbreaks (Critical)',
      value: activeOutbreaksCount.toString(),
      change: 'Active status',
      isPositive: false,
      icon: Flame,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900',
      subtext: 'Quarantine & Ring Vaccination'
    }
  ];

  return (
    <div className="space-y-4">
      {/* 8 Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all duration-200 ${item.bg} hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {item.title}
                  </p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {item.value}
                  </h3>
                </div>
                <div className={`p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800 shadow-2xs ${item.color}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  {item.subtext}
                </span>
                <span
                  className={`inline-flex items-center space-x-0.5 font-bold ${
                    item.isPositive
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {item.isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span>{item.change}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3 Reporting Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Overall Hararghe */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white shadow-md border border-emerald-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
              HRVL Overall Coverage
            </span>
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-800 text-emerald-200 rounded-full">
              36 Woredas
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black">{overallAvgCompliance}%</span>
            <span className="text-xs text-emerald-300 font-medium">Compliance Rate</span>
          </div>
          <div className="w-full bg-emerald-950 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${overallAvgCompliance}%` }}
            />
          </div>
          <p className="text-xs text-emerald-200/80 mt-2">
            Regional threshold target: 80% submission consistency
          </p>
        </div>

        {/* Card 2: East Hararghe */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              East Hararghe Zone
            </span>
            <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded-full">
              21 Woredas
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{eastAvgRate}%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Reporting Rate</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${eastAvgRate}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Active Hub: Haramaya, Babile, Dadar & Girawa
          </p>
        </div>

        {/* Card 3: West Hararghe */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
              West Hararghe Zone
            </span>
            <span className="px-2 py-0.5 text-xs font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 rounded-full">
              15 Woredas
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{westAvgRate}%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Reporting Rate</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-teal-600 dark:bg-teal-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${westAvgRate}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Active Hub: Chiro, Daro Lebu, Habro & Mieso
          </p>
        </div>
      </div>
    </div>
  );
};
