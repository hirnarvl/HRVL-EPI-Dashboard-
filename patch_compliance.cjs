const fs = require('fs');
let content = fs.readFileSync('src/components/ComplianceTable.tsx', 'utf8');

// Add records to props
content = content.replace('interface ComplianceTableProps {', "import { SurveillanceRecord } from '../types';\n\ninterface ComplianceTableProps {\n  records?: SurveillanceRecord[];");

content = content.replace('export const ComplianceTable: React.FC<ComplianceTableProps> = ({ complianceList }) => {', "export const ComplianceTable: React.FC<ComplianceTableProps> = ({ complianceList, records }) => {");

const officerSection = `
              {/* Assigned Veterinary Officer Card */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5">
                <div className="flex justify-between items-center font-bold text-slate-900 dark:text-white">
                  <span>District Veterinary Office: {drilledWoreda.woreda} Station</span>
                  <span className="text-slate-500 font-normal">HRVL Field Post</span>
                </div>
                <div className="flex flex-wrap items-center justify-between text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                  <span>Assigned Officer: <b>{records?.find(r => r.woreda === drilledWoreda.woreda && r.reporter)?.reporter || 'Not Assigned'}</b></span>
                  <span className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400">
                    <PhoneCall className="w-3 h-3" />
                    <span>{records?.find(r => r.woreda === drilledWoreda.woreda && r.phone)?.phone || '*'}</span>
                  </span>
                </div>
              </div>
`;

content = content.replace(/\{\/\* Assigned Veterinary Officer Card \*\/\}[\s\S]*?\{\/\* Alert Status Banner \*\/\}/, officerSection + '\n\n              {/* Alert Status Banner */}');

content = content.replace(/Dr\. Ahmed Hassan \(\+251 915 882 100\)/, 'the Assigned Officer');

fs.writeFileSync('src/components/ComplianceTable.tsx', content, 'utf8');
