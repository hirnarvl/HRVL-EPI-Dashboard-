const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableReportView.tsx', 'utf8');

const bannerHtml = `
        {/* Report Official Banner */}
        <div className="w-full h-32 md:h-40 overflow-hidden mb-6 rounded-lg border border-slate-300 print:rounded-none print:border-none shadow-md print:shadow-none">
          <img 
            src="https://lh3.googleusercontent.com/d/1ljHsMIChZqPrhQu48JaLIuncTXP8FCGj" 
            alt="HRVL Banner" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
`;

content = content.replace('{/* Document Header Seal */}', bannerHtml + '\n        {/* Document Header Seal */}');

fs.writeFileSync('src/components/PrintableReportView.tsx', content, 'utf8');
