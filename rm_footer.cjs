const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/\{\/\* Footer Banner \*\/\}\s*<div className=\{isPrintFriendlyMode \? 'print:hidden' : ''\}>\s*<FooterBanner \/>\s*<\/div>/, '');
fs.writeFileSync('src/App.tsx', content, 'utf8');
