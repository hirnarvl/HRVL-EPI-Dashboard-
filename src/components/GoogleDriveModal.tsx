import React, { useState, useEffect } from 'react';
import { X, HardDrive, Upload, Download, RefreshCw, Trash2, CheckCircle, AlertCircle, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { listDriveFiles, uploadToDrive, downloadDriveFile, deleteDriveFile, DriveFile } from '../utils/googleDrive';
import { SurveillanceRecord } from '../types';
import { generateCSVString } from '../utils/export';
import Papa from 'papaparse';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: SurveillanceRecord[];
  onImportRecords?: (importedRecords: SurveillanceRecord[]) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  records,
  onImportRecords,
}) => {
  const { user, accessToken, signInWithGoogle } = useAuth();
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const fetchFiles = async (tokenToUse?: string) => {
    const token = tokenToUse || accessToken;
    if (!token) return;

    setLoadingFiles(true);
    setStatusMessage(null);
    try {
      const files = await listDriveFiles(token);
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Failed to list drive files:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to load Google Drive files.' });
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (isOpen && accessToken) {
      fetchFiles(accessToken);
    }
  }, [isOpen, accessToken]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setStatusMessage(null);
    try {
      const token = await signInWithGoogle();
      if (token) {
        setStatusMessage({ type: 'success', text: 'Successfully connected to Google Drive!' });
        fetchFiles(token);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to authorize with Google Drive.' });
    }
  };

  const handleBackupToDrive = async () => {
    if (!accessToken) {
      setStatusMessage({ type: 'error', text: 'Please connect to Google Drive first.' });
      return;
    }

    setUploading(true);
    setStatusMessage(null);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `HRVL_Surveillance_Report_${timestamp}.csv`;
      const csvContent = generateCSVString(records);

      const uploaded = await uploadToDrive(accessToken, filename, csvContent, 'text/csv');
      setStatusMessage({
        type: 'success',
        text: `Backup successful! File saved as "${uploaded.name}" on Google Drive.`,
      });
      fetchFiles(accessToken);
    } catch (err: any) {
      console.error('Drive backup failed:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save file to Google Drive.' });
    } finally {
      setUploading(false);
    }
  };

  const handleImportFromDrive = async (file: DriveFile) => {
    if (!accessToken) return;

    setDownloadingId(file.id);
    setStatusMessage(null);
    try {
      const content = await downloadDriveFile(accessToken, file.id);
      
      Papa.parse<SurveillanceRecord>(content, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          if (results.data && results.data.length > 0 && onImportRecords) {
            onImportRecords(results.data as SurveillanceRecord[]);
            setStatusMessage({
              type: 'success',
              text: `Successfully imported ${results.data.length} records from Google Drive file "${file.name}"!`,
            });
          } else {
            setStatusMessage({
              type: 'error',
              text: 'File downloaded, but no valid records could be parsed.',
            });
          }
        },
        error: (err: any) => {
          setStatusMessage({
            type: 'error',
            text: `CSV Parsing error: ${err.message}`,
          });
        }
      });
    } catch (err: any) {
      console.error('Drive import failed:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to download file from Google Drive.' });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (file: DriveFile) => {
    if (!accessToken) return;
    try {
      await deleteDriveFile(accessToken, file.id, file.name);
      setStatusMessage({ type: 'success', text: `Deleted "${file.name}" from Google Drive.` });
      fetchFiles(accessToken);
    } catch (err: any) {
      console.error('Drive delete error:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete file.' });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Google Drive Cloud Integration
                  {accessToken && (
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                      Connected
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Backup surveillance reports directly to Google Drive or import remote datasets
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Alert Banner */}
          {statusMessage && (
            <div
              className={`px-6 py-3 border-b text-xs font-semibold flex items-center justify-between ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                {statusMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                <span>{statusMessage.text}</span>
              </div>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
            {/* Connection Banner */}
            {!accessToken ? (
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-indigo-950/40 rounded-xl border border-blue-200 dark:border-indigo-900/50 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center md:text-left">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 justify-center md:justify-start">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Authorize Google Drive Access
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md">
                    Connect your Google account with Drive permissions to sync field surveillance data, back up reports, and access organization datasets.
                  </p>
                </div>
                <button
                  onClick={handleSignIn}
                  className="shrink-0 inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer hover:shadow-lg"
                >
                  <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Connect Google Drive</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 gap-3">
                <div className="flex items-center space-x-3">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {user?.displayName || user?.email}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Connected with Google Drive Read/Write permissions
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleBackupToDrive}
                  disabled={uploading}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Upload className={`w-3.5 h-3.5 ${uploading ? 'animate-bounce' : ''}`} />
                  <span>{uploading ? 'Uploading...' : `Backup Current Data (${records.length} Records)`}</span>
                </button>
              </div>
            )}

            {/* Files List Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  Your Google Drive Files
                </h3>
                {accessToken && (
                  <button
                    onClick={() => fetchFiles()}
                    disabled={loadingFiles}
                    className="inline-flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingFiles ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                )}
              </div>

              {!accessToken ? (
                <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  Connect Google Drive above to view your cloud files
                </div>
              ) : loadingFiles ? (
                <div className="flex items-center justify-center py-8 space-x-2 text-xs text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                  <span>Loading files from Google Drive...</span>
                </div>
              ) : driveFiles.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  No files found in your Google Drive. Click "Backup Current Data" above to create your first cloud backup.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                  {driveFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0 pr-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span>{file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : 'Cloud file'}</span>
                            {file.size && <span>• {Math.round(parseInt(file.size) / 1024)} KB</span>}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {(file.name.endsWith('.csv') || file.name.endsWith('.json') || file.mimeType.includes('csv') || file.mimeType.includes('text')) && (
                          <button
                            onClick={() => handleImportFromDrive(file)}
                            disabled={downloadingId === file.id}
                            title="Import this CSV dataset into Dashboard"
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer"
                          >
                            <Download className={`w-3 h-3 ${downloadingId === file.id ? 'animate-bounce' : ''}`} />
                            <span className="hidden sm:inline">Import Data</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(file)}
                          title="Delete file from Google Drive"
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
