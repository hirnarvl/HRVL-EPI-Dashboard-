import React, { useState } from 'react';
import { X, FileSpreadsheet, Upload, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { SurveillanceRecord } from '../types';
import { matchWoreda, detectZone } from '../utils/fuzzyMatch';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportRecords: (newRecords: SurveillanceRecord[], minDate?: string, maxDate?: string) => void;
}

interface ParsedPreviewRow {
  woredaOriginal: string;
  woredaMatched: string;
  zone: string;
  disease: string;
  species: string;
  cases: number;
  deaths: number;
  date: string;
  matchedSuccess: boolean;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportRecords
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedPreviewRow[]>([]);
  const [fullRecordsToImport, setFullRecordsToImport] = useState<SurveillanceRecord[]>([]);
  const [minDateFound, setMinDateFound] = useState<string>('');
  const [maxDateFound, setMaxDateFound] = useState<string>('');
  const [sheetsList, setSheetsList] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array', cellDates: true });
        setWorkbook(wb);
        setSheetsList(wb.SheetNames);
        
        // Auto pick sheet with disease or outbreak in title, or first sheet
        const preferredSheet = wb.SheetNames.find(s => 
          /disease|outbreak|surveillance|data|zero/i.test(s)
        ) || wb.SheetNames[0];

        setSelectedSheet(preferredSheet);
        processSheet(wb, preferredSheet);
      } catch (err) {
        console.error('Failed to parse Excel file:', err);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const processSheet = (wb: XLSX.WorkBook, sheetName: string) => {
    const worksheet = wb.Sheets[sheetName];
    if (!worksheet) return;

    const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    if (!rawData.length) return;

    const previews: ParsedPreviewRow[] = [];
    const newRecords: SurveillanceRecord[] = [];
    let minD = '9999-12-31';
    let maxD = '0000-01-01';

    rawData.forEach((row, idx) => {
      // Flexible case-insensitive column key matching
      const getCol = (...names: string[]) => {
        for (const name of names) {
          const foundKey = Object.keys(row).find(k => k.trim().toLowerCase() === name.toLowerCase());
          if (foundKey && row[foundKey] !== undefined && row[foundKey] !== '') {
            return row[foundKey];
          }
        }
        return '';
      };

      const rawWoreda = String(getCol('woreda', 'wereda', 'district', 'location') || 'Haramaya');
      const matchedWoredaObj = matchWoreda(rawWoreda);

      const woredaName = matchedWoredaObj ? matchedWoredaObj.name : rawWoreda;
      const zoneName = matchedWoredaObj ? matchedWoredaObj.zone : detectZone(rawWoreda, String(getCol('zone', 'region')));

      const disease = String(getCol('disease', 'outbreak', 'event', 'condition') || 'Foot-and-Mouth Disease (FMD)');
      const species = String(getCol('species', 'livestock', 'animal') || 'Cattle');
      const cases = Number(getCol('cases', 'cases_count', 'morbidity') || 0);
      const deaths = Number(getCol('deaths', 'fatalities', 'mortality') || 0);
      
      let dateVal = getCol('date', 'report_date', 'timestamp', 'observation_date');
      let dateStr = new Date().toISOString().split('T')[0];

      if (dateVal instanceof Date) {
        dateStr = dateVal.toISOString().split('T')[0];
      } else if (typeof dateVal === 'string' && dateVal.trim()) {
        dateStr = dateVal.trim();
      }

      if (dateStr < minD) minD = dateStr;
      if (dateStr > maxD) maxD = dateStr;

      const isZero = cases === 0 && (disease.toLowerCase().includes('zero') || disease.toLowerCase().includes('none'));

      previews.push({
        woredaOriginal: rawWoreda,
        woredaMatched: woredaName,
        zone: zoneName,
        disease,
        species,
        cases,
        deaths,
        date: dateStr,
        matchedSuccess: !!matchedWoredaObj
      });

      newRecords.push({
        id: `IMP-${Date.now()}-${idx}`,
        date: dateStr,
        timestamp: new Date(dateStr).getTime(),
        woreda: woredaName,
        zone: zoneName,
        lat: matchedWoredaObj ? matchedWoredaObj.lat : 9.2,
        lng: matchedWoredaObj ? matchedWoredaObj.lng : 41.5,
        disease,
        species,
        cases,
        deaths,
        risk: deaths > 5 ? 'Critical' : cases > 20 ? 'High' : 'Medium',
        comment: String(getCol('comment', 'remarks', 'risk') || 'Imported via multi-sheet Excel file'),
        phone: String(getCol('phone', 'contact') || ''),
        isZeroReport: isZero
      });
    });

    setParsedRows(previews);
    setFullRecordsToImport(newRecords);
    if (minD !== '9999-12-31') setMinDateFound(minD);
    if (maxD !== '0000-01-01') setMaxDateFound(maxD);
  };

  const handleSelectSheetChange = (sheetName: string) => {
    setSelectedSheet(sheetName);
    if (workbook) processSheet(workbook, sheetName);
  };

  const handleConfirmImport = () => {
    if (fullRecordsToImport.length) {
      onImportRecords(fullRecordsToImport, minDateFound, maxDateFound);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full p-6 relative transition-colors max-h-[90vh] flex flex-col">
        
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 rounded-xl">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Multi-Sheet Excel / CSV Surveillance Importer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fuzzy woreda matching (e.g. Bedeno → Badeno) & auto date range configuration
            </p>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="my-4 space-y-3 shrink-0">
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
              <Upload className="w-7 h-7 text-emerald-600 dark:text-emerald-400 mb-1" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {file ? file.name : 'Click to select or drag & drop .xlsx / .csv Excel file'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Supports disease, outbreak, zero-report sheets for East & West Hararghe
              </p>
            </div>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {sheetsList.length > 1 && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Select Sheet:</span>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {sheetsList.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSelectSheetChange(s)}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                      selectedSheet === s ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview Results */}
        {parsedRows.length > 0 && (
          <div className="flex-1 overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <span>Parsed Preview ({parsedRows.length} Records)</span>
              {minDateFound && maxDateFound && (
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                  Date Range Detected: {minDateFound} to {maxDateFound}
                </span>
              )}
            </div>

            <div className="overflow-y-auto flex-1 p-2">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
                <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-2 px-2">Original Woreda</th>
                    <th className="py-2 px-2">Fuzzy Match</th>
                    <th className="py-2 px-2">Zone</th>
                    <th className="py-2 px-2">Disease</th>
                    <th className="py-2 px-2">Species</th>
                    <th className="py-2 px-2">Cases</th>
                    <th className="py-2 px-2">Deaths</th>
                    <th className="py-2 px-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedRows.slice(0, 15).map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-1.5 px-2 font-mono text-slate-500">{r.woredaOriginal}</td>
                      <td className="py-1.5 px-2 font-bold text-slate-900 dark:text-white flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{r.woredaMatched}</span>
                      </td>
                      <td className="py-1.5 px-2">{r.zone}</td>
                      <td className="py-1.5 px-2 font-medium">{r.disease}</td>
                      <td className="py-1.5 px-2">{r.species}</td>
                      <td className="py-1.5 px-2 font-bold text-blue-600">{r.cases}</td>
                      <td className="py-1.5 px-2 font-bold text-rose-600">{r.deaths}</td>
                      <td className="py-1.5 px-2 font-mono">{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedRows.length > 15 && (
                <p className="text-center text-[11px] text-slate-400 py-2">
                  + {parsedRows.length - 15} additional records ready to import...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 mt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            disabled={!fullRecordsToImport.length}
            onClick={handleConfirmImport}
            className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md cursor-pointer"
          >
            <span>Import {fullRecordsToImport.length} Records</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
