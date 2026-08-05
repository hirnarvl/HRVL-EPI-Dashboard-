import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Send, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Sparkles,
  ExternalLink,
  Award
} from 'lucide-react';

export const FooterBanner: React.FC = () => {
  // Staggered variants for Developer Contact block (50–80ms between lines)
  const contactContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.065, // ~65ms staggered delay between lines
        delayChildren: 0.15
      }
    }
  };

  const lineVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.22, 
        ease: [0.25, 1, 0.5, 1] // Ease-out curve
      }
    }
  };

  return (
    <motion.footer 
      initial={{ y: 25, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }} // 200–300ms smooth slide-up
      className="w-full mt-12 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-t-2 border-amber-500/40 text-slate-100 shadow-2xl relative overflow-hidden transition-all duration-300"
    >
      {/* Background ambient gold/blue subtle glow pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(212,175,55,0.08),transparent_40%),radial-gradient(circle_at_80%_100%,rgba(59,130,246,0.08),transparent_40%)] pointer-events-none" />
      
      {/* Top Metallic Gold Accent Bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-amber-600/20 via-amber-400 to-amber-600/20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        
        {/* Main 3-Segment Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* LEFT SEGMENT: HRVL Official Emblem Seal */}
          <div className="lg:col-span-3 flex items-center justify-center lg:justify-start">
            <motion.div 
              whileHover={{ y: -3 }} // 2-4px slight hover elevation
              className="relative group cursor-pointer"
            >
              {/* Emblem Container with hover glow & shadow */}
              <motion.div 
                animate={{
                  scale: [1, 1.035, 1],
                  boxShadow: [
                    "0 0 0px rgba(212,175,55,0)",
                    "0 0 18px rgba(212,175,55,0.45)",
                    "0 0 0px rgba(212,175,55,0)"
                  ]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  repeatDelay: 8.8, // Subtle 10s total cycle pulse
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="flex items-center space-x-3 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-2xl border border-amber-500/40 group-hover:border-amber-400 group-hover:shadow-[0_0_24px_rgba(212,175,55,0.35)] transition-all duration-300 shadow-xl shadow-black/50"
              >
                {/* Official Google Drive HRVL Emblem Image Seal */}
                <div className="w-16 h-16 rounded-xl bg-slate-900 border-2 border-emerald-500/50 p-0.5 flex items-center justify-center shadow-[0_4px_15px_rgba(16,185,129,0.4)] group-hover:shadow-[0_8px_25px_rgba(16,185,129,0.6)] transform group-hover:-translate-y-1 transition-all duration-300 shrink-0 overflow-hidden">
                  <img 
                    src="/hrvl-emblem.png" 
                    alt="Hirna Regional Veterinary Diagnostic Laboratory Emblem" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('1B-I4DeFvksl-bfA9KXPemqmEx7efTI8C')) {
                        target.src = 'https://lh3.googleusercontent.com/d/1B-I4DeFvksl-bfA9KXPemqmEx7efTI8C';
                      }
                    }}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" 
                  />
                </div>

                <div className="text-left">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-black tracking-wider text-amber-400 uppercase">HRVL EMBLEM</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-100 tracking-tight">Hirna Diagnostic Hub</p>
                  <p className="text-[10px] text-amber-300/80 font-mono">EST. 2001 • Oromia</p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* CENTER SEGMENT: Title & Institutional Tagline */}
          <div className="lg:col-span-5 text-center lg:text-left space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-semibold text-amber-300 uppercase tracking-widest">
              <Award className="w-3 h-3 text-amber-400" />
              <span>Official Surveillance Portal</span>
            </div>

            <h2 className="text-sm sm:text-base font-extrabold tracking-wide text-amber-400 leading-snug">
              Hirna Regional Veterinary Diagnostic Laboratory
            </h2>
            
            <p className="text-xs font-semibold tracking-wider text-slate-200 uppercase flex flex-wrap items-center justify-center lg:justify-start gap-1.5">
              <span>Advancing Veterinary Medicine Since 2001</span>
            </p>

            <p className="text-[11px] text-slate-400 flex items-center justify-center lg:justify-start space-x-1.5 pt-0.5">
              <Building2 className="w-3 h-3 text-amber-400/80 shrink-0" />
              <span>Oromia Agriculture Bureau • E/H (21) & W/H (15) Woredas</span>
            </p>
          </div>

          {/* RIGHT SEGMENT: Developer Contact Block with Telegram QR Code */}
          <div className="lg:col-span-4 bg-slate-900/60 backdrop-blur-sm p-3.5 rounded-xl border border-slate-800/80">
            <motion.div 
              variants={contactContainerVariants}
              initial="hidden"
              animate="visible"
              className="flex items-start justify-between gap-3 text-xs text-slate-300"
            >
              {/* Contact Info Lines */}
              <div className="space-y-1.5 flex-1 min-w-0">
                {/* Line 1: Developer Title */}
                <motion.div variants={lineVariants} className="flex items-center space-x-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider pb-1 border-b border-slate-800">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Developed by HRVL</span>
                </motion.div>

                {/* Line 2: Telegram */}
                <motion.div variants={lineVariants}>
                  <a 
                    href="https://t.me/ADNIS_Focal02EndUSERS2HRVL" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-[11px] text-sky-400 hover:text-sky-300 transition-colors group"
                  >
                    <Send className="w-3 h-3 text-sky-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    <span className="font-mono text-[10px] text-slate-400">Telegram:</span>
                    <span className="font-semibold underline underline-offset-2 truncate">t.me/ADNIS_Focal02...</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                  </a>
                </motion.div>

                {/* Line 3: Email */}
                <motion.div variants={lineVariants}>
                  <a 
                    href="mailto:henz@hirnarvl.onmicrosoft.com"
                    className="inline-flex items-center space-x-1.5 text-[11px] text-slate-300 hover:text-amber-300 transition-colors"
                  >
                    <Mail className="w-3 h-3 text-amber-400/90 shrink-0" />
                    <span className="font-mono text-[10px] text-slate-400">Email:</span>
                    <span className="font-mono font-medium text-slate-200 truncate">henz@hirnarvl...</span>
                  </a>
                </motion.div>

                {/* Line 4: Phone */}
                <motion.div variants={lineVariants} className="flex items-center space-x-1.5 text-[11px]">
                  <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="font-mono text-[10px] text-slate-400">Phone:</span>
                  <a href="tel:+251933310270" className="font-mono font-bold text-slate-200 hover:text-emerald-300">
                    +251 933 310 270
                  </a>
                </motion.div>

                {/* Line 5: Location */}
                <motion.div variants={lineVariants} className="flex items-center space-x-1.5 text-[10px] text-slate-400 pt-0.5">
                  <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                  <span className="font-semibold text-slate-300 uppercase">HIRNA, ETHIOPIA</span>
                </motion.div>
              </div>

              {/* QR Code Container for Rapid Field Mobile Access */}
              <motion.div 
                variants={lineVariants}
                className="shrink-0 flex flex-col items-center bg-slate-950 p-1.5 rounded-lg border border-sky-500/30 shadow-md group relative"
              >
                <a 
                  href="https://t.me/ADNIS_Focal02EndUSERS2HRVL" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block relative group-hover:scale-105 transition-transform"
                  title="Scan with phone camera for HRVL Telegram Channel"
                >
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https%3A%2F%2Ft.me%2FADNIS_Focal02EndUSERS2HRVL&color=0284c7&bgcolor=0f172a" 
                    alt="HRVL Telegram QR Code" 
                    className="w-16 h-16 rounded bg-slate-900"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 text-sky-300 shadow" />
                  </div>
                </a>
                <span className="text-[9px] font-mono text-sky-400 font-semibold mt-1 tracking-tight flex items-center space-x-0.5">
                  <Send className="w-2.5 h-2.5" />
                  <span>SCAN QR</span>
                </span>
              </motion.div>
            </motion.div>
          </div>

        </div>

        {/* DECLARATION BLOCK (Soft Fade-in) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.45, ease: "easeOut" }} // 150-200ms gentle opacity fade
          className="mt-5 pt-3 border-t border-slate-800/80 text-center"
        >
          <div className="flex items-start justify-center space-x-2 max-w-4xl mx-auto">
            <ShieldCheck className="w-4 h-4 text-amber-400/70 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400/90 leading-relaxed font-sans text-center">
              This dashboard is intended for professional veterinary diagnostic use. All data processed within this system is confidential. Performance and usage metrics are continuously monitored to ensure reliability, security, and compliance.
            </p>
          </div>
        </motion.div>

      </div>
    </motion.footer>
  );
};
