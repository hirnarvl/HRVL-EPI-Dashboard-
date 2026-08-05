import React, { useState } from 'react';
import { X, ExternalLink, Globe, BookOpen, GraduationCap, Library, Beaker, Copy, Check, Key, UserCheck, Lock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

interface ExternalResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExternalResourcesModal: React.FC<ExternalResourcesModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [copiedUsername, setCopiedUsername] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  if (!isOpen) return null;

  // Check if user is authenticated with Gmail / Google
  const isGmailUser = Boolean(
    user && (
      (user.email && user.email.toLowerCase().endsWith('@gmail.com')) ||
      user.providerData.some(p => p.providerId === 'google.com' || (p.email && p.email.toLowerCase().endsWith('@gmail.com')))
    )
  );

  const handleCopy = (text: string, type: 'username' | 'password') => {
    navigator.clipboard.writeText(text);
    if (type === 'username') {
      setCopiedUsername(true);
      setTimeout(() => setCopiedUsername(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const portalResources = [
    {
      name: 'World Organisation for Animal Health (WOAH / OIE)',
      url: 'https://www.woah.org/',
      description: 'Global authority on animal health standards, international disease reporting, and sanitary guidelines.',
      logo: 'https://www.woah.org/app/uploads/2022/05/cropped-WOAH-Favicon-32x32.png',
      fallbackIcon: <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      badge: 'WOAH Official'
    },
    {
      name: 'FAO - Animal Production and Health',
      url: 'https://www.fao.org/animal-health/en/',
      description: 'UN Food and Agriculture Organization division for global epizootic surveillance and emergency prevention.',
      logo: 'https://www.fao.org/fileadmin/templates/fao/images/fao-logo.png',
      fallbackIcon: <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      badge: 'FAO UN'
    },
    {
      name: 'FAO elearning Academy',
      url: 'https://elearning.fao.org/',
      description: 'Free accredited courses, manuals, and technical toolkits for veterinary field epidemiologists.',
      logo: 'https://elearning.fao.org/theme/faoelearning/pix/fao_logo_en.png',
      fallbackIcon: <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      badge: 'Free Courses'
    },
    {
      name: 'Research4Life Academic Repository',
      url: isGmailUser 
        ? 'https://login.research4life.org/tacsgr1portal_research4life_org/' 
        : 'https://www.research4life.org/',
      description: 'Comprehensive peer-reviewed journals and diagnostic scientific literature for health institutions.',
      logo: 'https://www.research4life.org/wp-content/uploads/2018/10/R4L_logo_RGB.png',
      fallbackIcon: <Library className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      badge: isGmailUser ? 'Gmail Authorized' : 'Open Access'
    },
    {
      name: 'HRVL & Ministry of Agriculture Portal',
      url: 'https://www.moa.gov.et/',
      description: 'Official national and regional portal for livestock disease reporting, policies, and bulletins.',
      logo: 'https://www.moa.gov.et/assets/images/logo.png',
      fallbackIcon: <Beaker className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
      badge: 'National Portal'
    },
    {
      name: 'CDC One Health Portal',
      url: 'https://www.cdc.gov/onehealth/index.html',
      description: 'Integrated zoonotic disease frameworks bridging human, animal, and environmental health.',
      logo: 'https://www.cdc.gov/TemplatePackage/4.0/assets/images/cdc-logo-tag-blue.svg',
      fallbackIcon: <Globe className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      badge: 'CDC Zoonoses'
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
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>open access portal</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/50 font-mono">
                    Official Links
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Direct open access portals for epizootiological research, disease surveillance, and scientific journals
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
          <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
            
            {/* SPECIAL ACCESS CARD FOR RESEARCH4LIFE */}
            <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 dark:from-rose-950/40 dark:via-slate-900 dark:to-amber-950/30 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 bg-rose-600 text-white rounded-lg shrink-0">
                      <Library className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Active Research4Life Full access via HRVL</span>
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                    Institutional portal access for scientific journals, epidemiological literature, and diagnostic databases.
                  </p>
                </div>

                <div className="shrink-0 pt-1 sm:pt-0">
                  <a
                    href="https://login.research4life.org/tacsgr1portal_research4life_org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      navigator.clipboard.writeText('ETHR4L211');
                    }}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Access Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* GRID OF PORTAL RESOURCES WITH OFFICIAL LOGOS */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                open access portal directory
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portalResources.map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start space-x-3.5 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all group cursor-pointer shadow-xs"
                  >
                    {/* Official Logo Container */}
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1.5 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden">
                      <img
                        src={res.logo}
                        alt={`${res.name} official logo`}
                        referrerPolicy="no-referrer"
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          // Hide image if fails and show fallback
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className="hidden group-has-[:hidden]:block">
                        {res.fallbackIcon}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {res.name}
                        </h4>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                          {res.badge}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-normal line-clamp-2">
                        {res.description}
                      </p>

                      <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mt-2 group-hover:underline">
                        <span>Open portal</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 rounded-xl">
              <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Open Access Epizootiology Repository</span>
              </h4>
              <p className="text-[11px] text-indigo-800 dark:text-indigo-300/80 leading-relaxed">
                These open access portals provide field officers, diagnosticians, and researchers with direct, unhindered access to international standards, epidemiological software tools, and academic publications.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
