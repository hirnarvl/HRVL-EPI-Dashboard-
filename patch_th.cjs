const fs = require('fs');
const files = [
  'src/components/DiseaseSummaryTable.tsx',
  'src/components/OutbreakTable.tsx',
  'src/components/SurveillanceTable.tsx',
  'src/components/ComplianceTable.tsx',
  'src/components/YoYTrendAnalysisModal.tsx',
  'src/components/WoredaReportMap.tsx',
  'src/components/PrintableReportView.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace <th className="..." with text-center font-bold
    content = content.replace(/<th className="([^"]*)"/g, (match, p1) => {
      let newClasses = p1.split(' ');
      if (!newClasses.includes('text-center')) newClasses.push('text-center');
      if (!newClasses.includes('font-bold')) newClasses.push('font-bold');
      
      // Also some table headers have text-left by default via table text-left?
      // Not usually on th but we will force text-center
      return `<th className="${newClasses.join(' ')}"`;
    });

    // Replace <div className="flex items-center with justify-center inside <th>
    // Actually, just replace <div className="flex items-center space-x-1"> with justify-center
    content = content.replace(/<div className="flex items-center space-x-1"/g, '<div className="flex items-center justify-center space-x-1"');

    fs.writeFileSync(file, content, 'utf8');
  }
});
