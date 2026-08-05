const fs = require('fs');

function patchTable(filePath, hasPagination) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add itemsPerPage state if it doesn't have it
  if (content.includes('const itemsPerPage =')) {
    content = content.replace(/const itemsPerPage = \d+;/, 'const [itemsPerPage, setItemsPerPage] = useState(10);');
  } else if (!content.includes('itemsPerPage')) {
    // Add pagination states
    const stateAnchor = 'const [sortAsc, setSortAsc] = useState(false);';
    content = content.replace(stateAnchor, `${stateAnchor}\n  const [currentPage, setCurrentPage] = useState(1);\n  const [itemsPerPage, setItemsPerPage] = useState(10);`);
    
    // Add pagination logic
    const exportAnchor = "const handleExportCSV = () => {";
    content = content.replace(exportAnchor, `const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;\n  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);\n\n  ${exportAnchor}`);
    
    // Use paginated in the map
    content = content.replace(/sorted\.map\(\(/, 'paginated.map((');
    content = content.replace(/sorted\.map\(\(ob/, 'paginated.map((ob');
    content = content.replace(/sorted\.map\(\(summary/, 'paginated.map((summary');
    content = content.replace(/sorted\.map\(\(woreda/, 'paginated.map((woreda');
    
    // Add pagination UI
    const paginationUI = `
      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-3 mt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 gap-2">
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
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 text-slate-700 dark:text-slate-300 focus:outline-none"
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
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 text-slate-700 dark:text-slate-300 focus:outline-none font-semibold"
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
    </div>
  );
};`;
    
    // Replace the end of the file
    content = content.replace(/<\/div>\s*<\/div>\s*\);\s*};\s*$/, `</div>\n${paginationUI}`);
  }

  // If it already had pagination but we need to update the UI
  if (hasPagination) {
    const oldPaginationRegex = /\{\/\* Pagination \*\/\}.*?<\/div>\s*<\/div>\s*\);\s*\};/s;
    const newPaginationUI = `
      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-3 mt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 gap-2">
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
    </div>
  );
};`;
    content = content.replace(oldPaginationRegex, newPaginationUI);
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

patchTable('src/components/SurveillanceTable.tsx', true);
patchTable('src/components/DiseaseSummaryTable.tsx', true);
patchTable('src/components/OutbreakTable.tsx', false);
patchTable('src/components/ComplianceTable.tsx', false);
