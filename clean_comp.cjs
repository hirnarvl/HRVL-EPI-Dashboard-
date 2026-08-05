const fs = require('fs');
let content = fs.readFileSync('src/components/ComplianceTable.tsx', 'utf8');

// Remove redundant declarations
content = content.replace(/const \[currentPage, setCurrentPage\] = useState\(1\);\n  const \[itemsPerPage, setItemsPerPage\] = useState\(10\);\n  const \[currentPage, setCurrentPage\] = useState\(1\);\n  const \[itemsPerPage, setItemsPerPage\] = useState\(10\);/, 'const [currentPage, setCurrentPage] = useState(1);\n  const [itemsPerPage, setItemsPerPage] = useState(10);');
content = content.replace(/const totalPages = Math.ceil\(sorted\.length \/ itemsPerPage\) \|\| 1;\n  const paginated = sorted\.slice\(\(currentPage - 1\) \* itemsPerPage, currentPage \* itemsPerPage\);\n\n  const totalPages = Math.ceil\(sorted\.length \/ itemsPerPage\) \|\| 1;\n  const paginated = sorted\.slice\(\(currentPage - 1\) \* itemsPerPage, currentPage \* itemsPerPage\);/, 'const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;\n  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);');

fs.writeFileSync('src/components/ComplianceTable.tsx', content, 'utf8');
