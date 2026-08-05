const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Add activeTab and setActiveTab to interface
content = content.replace('interface NavbarProps {', "interface NavbarProps {\n  activeTab?: 'Dashboard' | 'Map' | 'Tables';\n  setActiveTab?: (tab: 'Dashboard' | 'Map' | 'Tables') => void;");

content = content.replace('onOpenSupportModal\n}) => {', "onOpenSupportModal,\n  activeTab = 'Dashboard',\n  setActiveTab\n}) => {");

// Add the tabs UI
const tabsUI = `
          {/* Navigation Tabs */}
          {setActiveTab && (
            <div className="flex bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl mx-2 shadow-inner border border-slate-200 dark:border-slate-700">
              {(['Dashboard', 'Map', 'Tables'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveTab(tab);
                  }}
                  className={\`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 \${
                    activeTab === tab
                      ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }\`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
`;

content = content.replace('{/* Quick Filters */}', tabsUI + '\n          {/* Quick Filters */}');

fs.writeFileSync('src/components/Navbar.tsx', content, 'utf8');
