const fs = require('fs');
let content = fs.readFileSync('src/components/SurveillanceTable.tsx', 'utf8');

content = content.replace(/import \{([\s\S]*?)CheckCircle2([\s\S]*?)\} from 'lucide-react';/, "import {$1CheckCircle2$2,\n  PhoneCall\n} from 'lucide-react';");

const target = '<td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[11px]">\n                  {rec.reporter || \'Field Agent\'}\n                </td>';

const replacement = `<td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                  <div className="font-semibold">{rec.reporter || 'Field Agent'}</div>
                  <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400">
                    <PhoneCall className="w-2.5 h-2.5" />
                    <span>{rec.phone || '*'}</span>
                  </div>
                </td>`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/SurveillanceTable.tsx', content, 'utf8');
