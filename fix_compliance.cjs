const fs = require('fs');
let content = fs.readFileSync('src/components/ComplianceTable.tsx', 'utf8');

// The pagination UI was inserted at the very end instead of after the table wrapper div.
// Remove it from the end:
content = content.replace(/\{\/\* Pagination \*\/\}.*?<\/div>\s*<\/div>\s*\);\s*\};/s, '');

// The previous script probably broke it. Let's restore the end.
if (!content.includes('</AnimatePresence>')) {
  // It doesn't use AnimatePresence.
}

fs.writeFileSync('src/components/ComplianceTable.tsx', content, 'utf8');
