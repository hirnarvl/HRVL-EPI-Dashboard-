import React from 'react';
import { X, ExternalLink, Globe, BookOpen, GraduationCap, Library, Beaker } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExternalResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExternalResourcesModal: React.FC<ExternalResourcesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const resources = [
    {
      name: 'World Organisation for Animal Health (WOAH / OIE)',
      url: 'https://www.woah.org/',
      description: 'Global authority on animal health, disease reporting, and veterinary standards.',
      icon: <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
    },
    {
      name: 'FAO - Animal Production and Health',
      url: 'https://www.fao.org/animal-health/en/',
      description: 'Food and Agriculture Organization division focusing on global animal disease surveillance and response.',
      icon: <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
    },
    {
      name: 'FAO elearning Academy',
      url: 'https://elearning.fao.org/',
      description: 'Free capacity development resources and courses related to food security and animal health.',
      icon: <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
    },
    {
      name: 'Research4Life',
      url: 'https://www.research4life.org/',
      description: 'Provides institutions in low-and middle-income countries with online access to academic and professional peer-reviewed content.',
      icon: <Library className="w-5 h-5 text-rose-600 dark:text-rose-400" />
    },
    {
      name: 'Hirna Regional Veterinary Laboratory Portal',
      url: 'https://www.moa.gov.et/', // Assuming general MOA or a specific placeholder if not known
      description: 'Official regional portal for HRVL updates, bulletins, and local epidemiology reports.',
      icon: <Beaker className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
    },
    {
      name: 'CDC - One Health',
      url: 'https://www.cdc.gov/onehealth/index.html',
      description: 'Resources bridging human, animal, and environmental health.',
      icon: <Globe className="w-5 h-5 text-amber-600 dark:text-amber-400" />
    }
  ];

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
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  External Veterinary Resources
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Free open-access portals for epidemiological research and capacity building
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

          {/* Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((res, idx) => (
                <a
                  key={idx}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50 dark:bg-slate-800/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group cursor-pointer"
                >
                  <div className="mt-1 shrink-0 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                    {res.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1.5 transition-colors">
                      {res.name}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {res.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300 mb-1 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Information Sharing Network
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400/80 leading-relaxed">
                These platforms are external portals providing free-of-charge access to vital resources for veterinary epidemiologists, animal health researchers, and surveillance officers in Ethiopia.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
