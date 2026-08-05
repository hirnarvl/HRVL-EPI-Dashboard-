const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
content = content.replace(/import \{ ExternalResourcesModal \} from '\.\/components\/ExternalResourcesModal';\n/g, ''); // Clear if exists
content = content.replace(/import \{ SupportModal \} from '\.\/components\/SupportModal';/, "import { SupportModal } from './components/SupportModal';\nimport { ExternalResourcesModal } from './components/ExternalResourcesModal';");

// Add state
content = content.replace(/const \[isSupportOpen, setIsSupportOpen\] = useState\(false\);/, "const [isSupportOpen, setIsSupportOpen] = useState(false);\n  const [isExternalResourcesOpen, setIsExternalResourcesOpen] = useState(false);");

// Add modal component
content = content.replace(/<SupportModal\s+isOpen=\{isSupportOpen\}\s+onClose=\{\(\) => setIsSupportOpen\(false\)\}\s+\/>/, "<SupportModal\n          isOpen={isSupportOpen}\n          onClose={() => setIsSupportOpen(false)}\n        />\n\n        <ExternalResourcesModal\n          isOpen={isExternalResourcesOpen}\n          onClose={() => setIsExternalResourcesOpen(false)}\n        />");

// Update Navbar props
content = content.replace(/onOpenSupportModal=\{\(\) => setIsSupportOpen\(true\)\}/, "onOpenSupportModal={() => setIsSupportOpen(true)}\n          onOpenExternalResources={() => setIsExternalResourcesOpen(true)}");

fs.writeFileSync('src/App.tsx', content, 'utf8');
