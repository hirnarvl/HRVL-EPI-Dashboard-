import React from 'react';
import { Activity, Printer, Download, ShieldCheck, MapPin, ArrowLeft } from 'lucide-react';
import { NarrativeReport, Outbreak, SurveillanceRecord } from '../types';
import { WoredaReportMap } from './WoredaReportMap';

interface PrintableReportViewProps {
  report: NarrativeReport;
  outbreaks: Outbreak[];
  records: SurveillanceRecord[];
  onBack: () => void;
}

export const PrintableReportView: React.FC<PrintableReportViewProps> = ({
  report,
  outbreaks,
  records,
  onBack
}) => {
  const handlePrint = () => {
    window.print();
  };

  const activeOutbreaks = outbreaks.filter(o => o.status === 'Active');
  const totalCases = records.reduce((a, b) => a + (b.cases || 0), 0);
  const totalDeaths = records.reduce((a, b) => a + (b.deaths || 0), 0);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-8">
      
      {/* Printable Control Bar (Hidden when printing) */}
      <div className="print:hidden max-w-4xl mx-auto mb-6 flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Official Printable Report Document Body */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 p-8 sm:p-12 shadow-xl border border-slate-300 rounded-none font-serif leading-relaxed text-sm print:shadow-none print:border-none print:p-0 print:max-w-none">
        
        {/* Document Header Seal */}
        <div className="flex items-center justify-between border-b-2 border-emerald-800 pb-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl bg-slate-900 text-white flex items-center justify-center p-1.5 shadow-md border-2 border-emerald-700 shrink-0">
              <img 
                src="/hrvl-emblem.png" 
                alt="HRVL Emblem" 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('1lf9LiV7nEwjPS9RuPS4rM9LuBk1vAbbD')) {
                    target.src = 'https://lh3.googleusercontent.com/d/1lf9LiV7nEwjPS9RuPS4rM9LuBk1vAbbD';
                  }
                }}
                className="w-full h-full object-contain" 
              />
            </div>
            <div>
              <h1 className="text-xl font-black text-emerald-950 tracking-tight uppercase">
                HIRNA REGIONAL VETERINARY LABORATORY
              </h1>
              <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-widest mt-0.5">
                Oromia Agricultural Bureau • Disease Surveillance & Epidemiology Division
              </h2>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                Operational Area: E/H (21 Woredas) & W/H (15 Woredas)
              </p>
            </div>
          </div>

          <div className="text-right font-sans text-xs">
            <span className="font-bold text-slate-900 block">REPORT REF: HRVL-EPI-2026</span>
            <span className="text-slate-600 font-mono block mt-1">{report.dateGenerated}</span>
            <span className="inline-block mt-2 px-2.5 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-extrabold uppercase tracking-wider rounded border border-emerald-300">
              OFFICIAL SITUATION REPORT
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight border-l-4 border-emerald-700 pl-3 py-1">
            {report.title}
          </h2>
          <p className="text-xs font-sans text-slate-600 mt-1 pl-4">
            Surveillance Telemetry & Outbreak Situation Analysis across 36 Target Woredas
          </p>
        </div>

        {/* Executive Metrics Bar */}
        <div className="font-sans grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-300 mb-8 text-center text-xs">
          <div>
            <span className="text-slate-500 uppercase text-[10px] font-bold block">Total Cases</span>
            <span className="text-xl font-black text-slate-900">{totalCases.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] font-bold block">Total Fatalities</span>
            <span className="text-xl font-black text-rose-700">{totalDeaths.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] font-bold block">Active Outbreaks</span>
            <span className="text-xl font-black text-amber-700">{activeOutbreaks.length}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] font-bold block">Target Woredas</span>
            <span className="text-xl font-black text-emerald-800">36 Woredas</span>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 border-b border-slate-300 pb-1 mb-3">
            1. Executive Summary & Surveillance Telemetry
          </h3>
          <p className="text-slate-800 text-justify whitespace-pre-line leading-relaxed">
            {report.executiveSummary}
          </p>
        </div>

        {/* Section 2: Outbreak Dynamics */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 border-b border-slate-300 pb-1 mb-3">
            2. Active Field Outbreak Evaluation
          </h3>
          <p className="text-slate-800 text-justify mb-4">
            {report.outbreakStatusAnalysis}
          </p>

          {/* Outbreak Summary Table */}
          <div className="font-sans overflow-x-auto my-3">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px]">
                <tr>
                  <th className="p-2 border">Code</th>
                  <th className="p-2 border">Disease</th>
                  <th className="p-2 border">Woreda / Zone</th>
                  <th className="p-2 border">Cases</th>
                  <th className="p-2 border">Deaths</th>
                  <th className="p-2 border">CFR %</th>
                  <th className="p-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {outbreaks.map((ob, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2 border font-mono">{ob.outbreakCode}</td>
                    <td className="p-2 border font-bold">{ob.disease}</td>
                    <td className="p-2 border">{ob.woreda} ({ob.zone})</td>
                    <td className="p-2 border font-bold">{ob.cases}</td>
                    <td className="p-2 border text-rose-700 font-bold">{ob.deaths}</td>
                    <td className="p-2 border font-bold">{ob.cfr}%</td>
                    <td className="p-2 border font-semibold">{ob.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Woreda-level Map Overlay */}
          <WoredaReportMap records={records} outbreaks={outbreaks} isPrintMode={true} />
        </div>

        {/* Section 3: Species Vulnerability & Zonal Compliance */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans">
          <div className="p-4 bg-slate-50 border border-slate-300 rounded">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-2">
              Species Vulnerability Profile
            </h4>
            <p className="text-slate-700 text-xs leading-normal">
              {report.speciesVulnerability}
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-300 rounded">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-2">
              High Risk Priority Woredas
            </h4>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {report.highRiskWoredas.map((w, idx) => (
                <span key={idx} className="px-2 py-1 bg-red-100 text-red-900 text-xs font-bold rounded border border-red-300">
                  📍 {w}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Actionable Recommendations */}
        <div className="mb-10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 border-b border-slate-300 pb-1 mb-3">
            3. Actionable Epidemiological Recommendations
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-slate-800">
            {report.epidemiologicalRecommendations.map((rec, idx) => (
              <li key={idx} className="font-medium">
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* Signatures & Seal */}
        <div className="font-sans pt-8 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-xs">
          <div>
            <span className="font-bold text-slate-900 block">Report Compiled By:</span>
            <p className="mt-6 text-slate-700 font-bold">Epidemiology unit of HRVL</p>
            <p className="text-slate-500 text-[11px]">Hirna Regional Veterinary Laboratory</p>
          </div>

          <div className="text-right">
            <span className="font-bold text-slate-900 block">Approved & Signed:</span>
            <p className="mt-6 text-slate-700 font-bold">Director General</p>
            <p className="text-slate-500 text-[11px]">Hirna Regional Veterinary Laboratory, Oromia</p>
          </div>
        </div>

      </div>
    </div>
  );
};
