const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

if (!appContent.includes('const [activeTab, setActiveTab]')) {
  // Add activeTab state
  appContent = appContent.replace('const [isPortraitMode, setIsPortraitMode] = useState(false);', "const [isPortraitMode, setIsPortraitMode] = useState(false);\n  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Map' | 'Tables'>('Dashboard');");
  
  // Pass activeTab to Navbar
  appContent = appContent.replace('onTogglePortraitMode={() => setIsPortraitMode(prev => !prev)}', "onTogglePortraitMode={() => setIsPortraitMode(prev => !prev)}\n          activeTab={activeTab}\n          setActiveTab={setActiveTab}");
}

// Remove banner from App.tsx
appContent = appContent.replace(/\{\/\* HRVL Official Institutional Banner \*\/\}\s*<div className="w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800\/80 shadow-md bg-slate-900 relative group">\s*<img\s*src="\/hrvl-banner\.jpg"[\s\S]*?<\/div>/, '');

// Wrap sections in tabs
const kpiCardsIndex = appContent.indexOf('{/* KPI Cards & Zone Reporting Rates */}');
const footerIndex = appContent.indexOf('{/* Field Officer Sign-Off & Verification Stamp Block (Print Mode Only) */}');

if (kpiCardsIndex !== -1 && footerIndex !== -1) {
  let before = appContent.substring(0, kpiCardsIndex);
  let after = appContent.substring(footerIndex);
  let middle = appContent.substring(kpiCardsIndex, footerIndex);

  // Define tab contents by replacing
  let newMiddle = `
        {activeTab === 'Dashboard' && (
          <div className="space-y-6">
            ${middle.substring(0, middle.indexOf('{/* Interactive Outbreak Map */}'))}
            ${middle.substring(middle.indexOf('{/* Reporting Trend Charts & Profile Simulator */}'), middle.indexOf('{/* Disease Summary & Outbreak Tables */}'))}
          </div>
        )}

        {activeTab === 'Map' && (
          <div className="space-y-6">
            ${middle.substring(middle.indexOf('{/* Interactive Outbreak Map */}'), middle.indexOf('{/* Reporting Trend Charts & Profile Simulator */}'))}
          </div>
        )}

        {activeTab === 'Tables' && (
          <div className="space-y-6">
            ${middle.substring(middle.indexOf('{/* Disease Summary & Outbreak Tables */}'))}
          </div>
        )}
  `;

  // Fix up formatting
  appContent = before + newMiddle + after;
}

fs.writeFileSync('src/App.tsx', appContent, 'utf8');
