/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Printer, X, ShieldCheck, FileText, Check, Activity, Building2 } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { KPICards } from './components/KPICards';
import { OutbreakMap } from './components/OutbreakMap';
import { TrendCharts } from './components/TrendCharts';
import { SpeciesDonutChart } from './components/SpeciesDonutChart';
import { CFRTrendChart } from './components/CFRTrendChart';
import { DiseaseSummaryTable } from './components/DiseaseSummaryTable';
import { OutbreakTable } from './components/OutbreakTable';
import { SurveillanceTable } from './components/SurveillanceTable';
import { ComplianceTable } from './components/ComplianceTable';
import { FooterBanner } from './components/FooterBanner';
import { NewArrivalModal } from './components/NewArrivalModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { YoYTrendAnalysisModal } from './components/YoYTrendAnalysisModal';
import { AIReportModal } from './components/AIReportModal';
import { PrintableReportView } from './components/PrintableReportView';

import { 
  FilterState, 
  SurveillanceRecord, 
  Outbreak, 
  WoredaCompliance, 
  DiseaseSummary,
  NarrativeReport 
} from './types';

import { 
  INITIAL_SURVEILLANCE_RECORDS, 
  INITIAL_OUTBREAKS, 
  generateInitialCompliance, 
  DISEASE_SUMMARIES 
} from './data/sampleData';
import { HARARGHE_WOREDAS } from './data/woredas';
import { exportToCSV } from './utils/export';
import { loadCachedRecords, saveCachedRecords, clearCachedRecords } from './utils/storage';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  
  // Primary Dashboard State - Initialized from localStorage cache for field offline resilience
  const [records, setRecords] = useState<SurveillanceRecord[]>(loadCachedRecords);
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>(INITIAL_OUTBREAKS);
  const [complianceList, setComplianceList] = useState<WoredaCompliance[]>(generateInitialCompliance());
  const [diseaseSummaries, setDiseaseSummaries] = useState<DiseaseSummary[]>(DISEASE_SUMMARIES);

  // Network Connectivity State (Field Offline Mode Tracking)
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Synchronize network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Automatic localStorage Sync Effect whenever surveillance records change
  useEffect(() => {
    saveCachedRecords(records);
  }, [records]);

  // Reset local storage cache to initial default data
  const handleResetCache = () => {
    clearCachedRecords();
    setRecords(INITIAL_SURVEILLANCE_RECORDS);
  };

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    zone: 'All',
    woreda: 'All',
    disease: 'All',
    species: 'All',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  });

  // Simulator & Print Mode State
  const [isSimulatorRunning, setIsSimulatorRunning] = useState(false);
  const [isPrintFriendlyMode, setIsPrintFriendlyMode] = useState(false);

  // Modals
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isYoYModalOpen, setIsYoYModalOpen] = useState(false);
  const [isAIReportModalOpen, setIsAIReportModalOpen] = useState(false);
  const [printableReport, setPrintableReport] = useState<NarrativeReport | null>(null);

  // Toggle Dark Class on <html> element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Real-time Field Profile Simulator Interval
  useEffect(() => {
    let interval: any = null;
    if (isSimulatorRunning) {
      interval = setInterval(() => {
        // Pick random woreda from 36 Hararghe woredas
        const randomWoreda = HARARGHE_WOREDAS[Math.floor(Math.random() * HARARGHE_WOREDAS.length)];
        const diseases = [
          'Foot-and-Mouth Disease (FMD)',
          'Peste des Petits Ruminants (PPR)',
          'Lumpy Skin Disease (LSD)',
          'Contagious Bovine Pleuropneumonia (CBPP)',
          'Newcastle Disease (ND)'
        ];
        const speciesList = ['Cattle', 'Goats', 'Sheep', 'Poultry', 'Equines'];
        
        const isZero = Math.random() < 0.25; // 25% chance of zero report
        const randomDisease = isZero ? 'None (Zero Reporting)' : diseases[Math.floor(Math.random() * diseases.length)];
        const randomSpecies = isZero ? 'Cattle' : speciesList[Math.floor(Math.random() * speciesList.length)];
        const cases = isZero ? 0 : Math.floor(Math.random() * 25) + 5;
        const deaths = isZero ? 0 : Math.floor(cases * (Math.random() * 0.2));

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];

        const simRecord: SurveillanceRecord = {
          id: `SIM-${Date.now()}`,
          date: dateStr,
          timestamp: now.getTime(),
          woreda: randomWoreda.name,
          zone: randomWoreda.zone,
          lat: randomWoreda.lat,
          lng: randomWoreda.lng,
          disease: randomDisease,
          species: randomSpecies,
          cases,
          deaths,
          risk: deaths > 3 ? 'Critical' : cases > 15 ? 'High' : 'Medium',
          comment: `Live simulated field telemetry stream arrival on ${now.toLocaleTimeString()}`,
          reporter: 'Automated HRVL Stream',
          isZeroReport: isZero
        };

        setRecords(prev => [simRecord, ...prev]);
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulatorRunning]);

  // Handle adding new arrival record manually or from quick simulator
  const handleAddLogArrival = (rec: Partial<SurveillanceRecord>) => {
    const fullRec: SurveillanceRecord = {
      id: rec.id || `SR-${Date.now()}`,
      date: rec.date || new Date().toISOString().split('T')[0],
      timestamp: rec.timestamp || Date.now(),
      woreda: rec.woreda || 'Haramaya',
      zone: rec.zone || 'E/H',
      lat: rec.lat || 9.4123,
      lng: rec.lng || 42.0123,
      disease: rec.disease || 'Foot-and-Mouth Disease (FMD)',
      species: rec.species || 'Cattle',
      cases: rec.cases !== undefined ? rec.cases : 10,
      deaths: rec.deaths !== undefined ? rec.deaths : 1,
      risk: rec.risk || 'High',
      comment: rec.comment || 'Field record added manually',
      reporter: rec.reporter || 'Vet Officer',
      isZeroReport: rec.isZeroReport || false
    };

    setRecords(prev => [fullRec, ...prev]);

    // Recalculate disease summary counts
    setDiseaseSummaries(prev => prev.map(ds => {
      if (ds.disease === fullRec.disease) {
        return {
          ...ds,
          totalCases: ds.totalCases + fullRec.cases,
          totalDeaths: ds.totalDeaths + fullRec.deaths,
          cfrPercent: Number((((ds.totalDeaths + fullRec.deaths) / (ds.totalCases + fullRec.cases)) * 100).toFixed(1))
        };
      }
      return ds;
    }));
  };

  // Handle Excel Batch Import
  const handleImportRecords = (newRecords: SurveillanceRecord[], minDate?: string, maxDate?: string) => {
    setRecords(prev => [...newRecords, ...prev]);
    if (minDate && maxDate) {
      setFilters(prev => ({ ...prev, dateFrom: minDate, dateTo: maxDate }));
    }
  };

  // Export All 4 Tables as CSV Bundle
  const handleExportAllCSV = () => {
    exportToCSV('HRVL_Surveillance_Records_All', records);
    exportToCSV('HRVL_Outbreaks_All', outbreaks);
    exportToCSV('HRVL_Woreda_Compliance_All', complianceList);
    exportToCSV('HRVL_Disease_Summary_All', diseaseSummaries);
  };

  // Filtered dataset according to Navbar selection
  const filteredRecords = records.filter(rec => {
    if (filters.zone !== 'All' && rec.zone !== filters.zone) return false;
    return true;
  });

  // If printable report view is active
  if (printableReport) {
    return (
      <PrintableReportView
        report={printableReport}
        outbreaks={outbreaks}
        records={records}
        onBack={() => setPrintableReport(null)}
      />
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${
      isPrintFriendlyMode 
        ? 'bg-white text-slate-900 border-t-8 border-amber-500' 
        : 'bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
    }`}>
      
      {/* Sticky Top Field Print Snapshot Alert Banner (Hidden when printing) */}
      {isPrintFriendlyMode && (
        <div className="print:hidden sticky top-0 z-50 bg-amber-500 text-slate-950 px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-2 border-b border-amber-600">
          <div className="flex items-center space-x-2 font-bold text-xs sm:text-sm">
            <Printer className="w-5 h-5 animate-bounce" />
            <span>🖨️ FIELD SNAPSHOT PRINT MODE — High-contrast white canvas optimized for physical field meetings & PDF export.</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 text-white font-extrabold text-xs rounded-lg hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Snapshot (Ctrl+P)</span>
            </button>

            <button
              onClick={() => setIsPrintFriendlyMode(false)}
              className="p-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-slate-950 font-bold text-xs cursor-pointer"
              title="Exit Print Mode"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sticky Header Navbar */}
      <div className={isPrintFriendlyMode ? 'print:hidden' : ''}>
        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          filters={filters}
          setFilters={setFilters}
          onOpenLogModal={() => setIsLogModalOpen(true)}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onOpenYoYModal={() => setIsYoYModalOpen(true)}
          onOpenReportModal={() => setIsAIReportModalOpen(true)}
          onExportAllCSV={handleExportAllCSV}
          onToggleSimulator={() => setIsSimulatorRunning(prev => !prev)}
          isSimulatorRunning={isSimulatorRunning}
          onTogglePrintMode={() => setIsPrintFriendlyMode(prev => !prev)}
          isPrintFriendlyMode={isPrintFriendlyMode}
          isOnline={isOnline}
          cachedRecordsCount={records.length}
          onResetCache={handleResetCache}
        />
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Printable Official Header Block (Appears prominently in print mode) */}
        {isPrintFriendlyMode && (
          <div className="bg-slate-50 border-2 border-slate-900 p-6 rounded-xl space-y-3 print:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-400 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-xl">
                  HRVL
                </div>
                <div>
                  <h1 className="text-lg font-black text-slate-950 uppercase tracking-tight">
                    HIRNA REGIONAL VETERINARY DIAGNOSTIC LABORATORY (HRVL)
                  </h1>
                  <h2 className="text-xs font-bold text-slate-700 uppercase">
                    Field Epidemiology & Disease Surveillance Briefing Snapshot
                  </h2>
                </div>
              </div>

              <div className="text-right text-xs font-mono">
                <p className="font-bold">DATE: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-slate-600">ZONE FILTER: {filters.zone}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold uppercase rounded">
                  PHYSICAL BRIEFING COPY
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-serif italic">
              Official surveillance snapshot summary prepared for regional field veterinary officer consultations across E/H (21 Woredas) & W/H (15 Woredas). Includes active outbreak hot-spots, CFR trends, and woreda zero-reporting compliance status.
            </p>
          </div>
        )}

        {/* KPI Cards & Zone Reporting Rates */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <KPICards
            records={filteredRecords}
            outbreaks={outbreaks}
            complianceList={complianceList}
          />
        </motion.div>

        {/* Interactive Outbreak Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
        >
          <OutbreakMap
            outbreaks={outbreaks}
            records={filteredRecords}
            darkMode={isPrintFriendlyMode ? false : darkMode}
            selectedZone={filters.zone}
          />
        </motion.div>

        {/* Reporting Trend Charts & Profile Simulator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25, ease: 'easeOut' }}
        >
          <TrendCharts
            records={filteredRecords}
            darkMode={isPrintFriendlyMode ? false : darkMode}
            onAddLogArrival={handleAddLogArrival}
            isSimulatorRunning={isSimulatorRunning}
            onToggleSimulator={() => setIsSimulatorRunning(prev => !prev)}
            onOpenYoYModal={() => setIsYoYModalOpen(true)}
          />
        </motion.div>

        {/* 2-Column Section: Species Donut Chart + CFR Trend Line Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.35, ease: 'easeOut' }}
          >
            <SpeciesDonutChart darkMode={isPrintFriendlyMode ? false : darkMode} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.4, ease: 'easeOut' }}
          >
            <CFRTrendChart darkMode={isPrintFriendlyMode ? false : darkMode} />
          </motion.div>
        </div>

        {/* Disease Summary & Outbreak Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.45, ease: 'easeOut' }}
          >
            <DiseaseSummaryTable summaries={diseaseSummaries} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.5, ease: 'easeOut' }}
          >
            <OutbreakTable outbreaks={outbreaks} />
          </motion.div>
        </div>

        {/* Field Surveillance Log Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.55, ease: 'easeOut' }}
        >
          <SurveillanceTable records={filteredRecords} />
        </motion.div>

        {/* Woreda Compliance Progress Bars Table (36 Woredas) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.6, ease: 'easeOut' }}
        >
          <ComplianceTable complianceList={complianceList} />
        </motion.div>

        {/* Field Officer Sign-Off & Verification Stamp Block (Print Mode Only) */}
        {isPrintFriendlyMode && (
          <div className="mt-8 pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-8">
              <p className="font-bold text-slate-900">Briefing Lead / Regional Epidemiologist:</p>
              <div className="border-b border-slate-400 w-3/4"></div>
              <p className="text-[11px] text-slate-500">Signature & Date</p>
            </div>
            <div className="space-y-8 text-right">
              <p className="font-bold text-slate-900">HRVL Laboratory Director Stamp:</p>
              <div className="border-b border-slate-400 w-3/4 ml-auto"></div>
              <p className="text-[11px] text-slate-500">Official Seal & Verification</p>
            </div>
          </div>
        )}

      </main>

      {/* Footer Banner */}
      <div className={isPrintFriendlyMode ? 'print:hidden' : ''}>
        <FooterBanner />
      </div>

      {/* Modals */}
      <NewArrivalModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onAddRecord={handleAddLogArrival}
      />

      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportRecords={handleImportRecords}
        onOpenYoYAnalysis={() => setIsYoYModalOpen(true)}
      />

      <YoYTrendAnalysisModal
        isOpen={isYoYModalOpen}
        onClose={() => setIsYoYModalOpen(false)}
        records={records}
        darkMode={darkMode}
      />

      <AIReportModal
        isOpen={isAIReportModalOpen}
        onClose={() => setIsAIReportModalOpen(false)}
        outbreaks={outbreaks}
        records={records}
        complianceList={complianceList}
        onOpenPrintView={(rep) => setPrintableReport(rep)}
      />

    </div>
  );
}
