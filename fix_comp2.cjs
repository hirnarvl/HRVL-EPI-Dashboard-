const fs = require('fs');
let content = fs.readFileSync('src/components/ComplianceTable.tsx', 'utf8');

// Add states
const stateAnchor = 'const [sortAsc, setSortAsc] = useState(false);';
content = content.replace(stateAnchor, `${stateAnchor}\n  const [currentPage, setCurrentPage] = useState(1);\n  const [itemsPerPage, setItemsPerPage] = useState(10);`);

// Add pagination logic
const exportAnchor = "const handleExportCSV = () => {";
content = content.replace(exportAnchor, `const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;\n  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);\n\n  ${exportAnchor}`);

// Replace sorted.map with paginated.map
content = content.replace(/sorted\.map\(\(woreda/, 'paginated.map((woreda');

const oldModalComment = '{/* Interactive Drill-Down Inspection Modal */}';

const paginationUI = `
      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-3 mt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 gap-2 mb-4">
        <div className="flex items-center space-x-4">
          <span>Showing {paginated.length} of {sorted.length} records</span>
          <div className="flex items-center space-x-2">
            <span>Rows:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Prev
          </button>
          <div className="flex items-center space-x-1">
            <span>Page</span>
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 text-slate-700 dark:text-slate-300 focus:outline-none font-semibold cursor-pointer"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <span>of {totalPages}</span>
          </div>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Next
          </button>
        </div>
      </div>

      ${oldModalComment}`;

content = content.replace(oldModalComment, paginationUI);

fs.writeFileSync('src/components/ComplianceTable.tsx', content, 'utf8');
