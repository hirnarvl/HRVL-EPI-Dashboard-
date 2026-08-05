const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Add Globe icon if not imported
if (!content.includes('Globe')) {
  content = content.replace(/import \{([\s\S]*?)HelpCircle([\s\S]*?)\} from 'lucide-react';/, "import {$1HelpCircle,\n  Globe$2} from 'lucide-react';");
}

// Add onOpenExternalResources prop to interface
content = content.replace(/onOpenSupportModal\?: \(\) => void;/, "onOpenSupportModal?: () => void;\n  onOpenExternalResources?: () => void;");

// Destructure prop
content = content.replace(/onOpenSupportModal,/, "onOpenSupportModal,\n  onOpenExternalResources,");

// Add button
const externalBtn = `

            {/* External Resources Button */}
            {onOpenExternalResources && (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onOpenExternalResources();
                }}
                title="External Veterinary Information & Resources"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-900 bg-indigo-200 hover:bg-indigo-300 dark:text-indigo-100 dark:bg-indigo-600/80 dark:hover:bg-indigo-500 rounded-lg border border-indigo-500/50 shadow-xs transition-all cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>External Info Links</span>
              </button>
            )}`;

content = content.replace(/\{\/\* Support Email Template Button \*\/\}/, externalBtn + "\n\n            {/* Support Email Template Button */}");

fs.writeFileSync('src/components/Navbar.tsx', content, 'utf8');
