const fs = require('fs');

const shortenLogic = `
const shortenDisease = (disease: string) => {
  if (!disease) return '';
  const match = disease.match(/\\((.*?)\\)/);
  if (match && match[1]) {
    if (match[1] === 'Zero Reporting') return 'None';
    return match[1];
  }
  return disease;
};
`;

function processFile(filePath, varName, replaceRegex) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('shortenDisease')) {
    const importRegex = /import .*?;\n/g;
    let match;
    let lastIndex = 0;
    while ((match = importRegex.exec(content)) !== null) {
      lastIndex = importRegex.lastIndex;
    }
    
    content = content.substring(0, lastIndex) + '\n' + shortenLogic + '\n' + content.substring(lastIndex);
    
    // Replace the rendering logic
    content = content.replace(replaceRegex, '{shortenDisease(' + varName + ')}');
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

// PrintableReportView
processFile('src/components/PrintableReportView.tsx', 'ob.disease', /\{ob\.disease\}/);
