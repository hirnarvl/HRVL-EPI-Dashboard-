import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Layers } from 'lucide-react';
import { SPECIES_DISTRIBUTION } from '../data/sampleData';

interface SpeciesDonutChartProps {
  darkMode: boolean;
}

export const SpeciesDonutChart: React.FC<SpeciesDonutChartProps> = ({ darkMode }) => {
  const totalCases = SPECIES_DISTRIBUTION.reduce((acc, curr) => acc + curr.cases, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 transition-colors flex flex-col justify-between">
      
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Livestock Species Distribution (7 Species)
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Total: {totalCases.toLocaleString()}
        </span>
      </div>

      <div className="h-64 w-full mt-2 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={SPECIES_DISTRIBUTION}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="cases"
            >
              {SPECIES_DISTRIBUTION.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke={darkMode ? '#0f172a' : '#ffffff'} strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                borderColor: darkMode ? '#334155' : '#cbd5e1',
                borderRadius: '0.5rem',
                color: darkMode ? '#ffffff' : '#0f172a',
                fontSize: '12px'
              }}
              formatter={(value: any, name: any) => [`${value} cases (${((value / totalCases) * 100).toFixed(1)}%)`, name]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Donut Label */}
        <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xl font-black text-slate-900 dark:text-white">{totalCases}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Total Cases</span>
        </div>
      </div>

      {/* Legend Custom List */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
        {SPECIES_DISTRIBUTION.map(s => (
          <div key={s.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{s.name}</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white ml-1">{s.cases}</span>
          </div>
        ))}
      </div>

    </div>
  );
};
