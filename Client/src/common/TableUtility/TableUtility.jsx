// import React, { useState, useMemo } from 'react';
// import PropTypes from 'prop-types';
// import { ChevronLeft, ChevronRight } from 'lucide-react';

// const DynamicTable = ({
//   title,
//   columns,
//   data,
//   pageSize = 10,
//   defaultSort,
//   onRowClick,
//   emptyStateMessage = 'No data found',
//   className = '',
//   headerContent,
// }) => {
//   const [filterText, setFilterText] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sortConfig, setSortConfig] = useState(defaultSort);

//   // Filter and sort data
//   const processedData = useMemo(() => {
//     let result = [...data];

//     // Apply filtering
//     if (filterText) {
//       const lowercasedFilter = filterText.toLowerCase();
//       result = result.filter(row =>
//         columns.some(column => {
//           if (column.accessor === 'action') return false;
//           const value = row[column.accessor];
//           return String(value).toLowerCase().includes(lowercasedFilter);
//         })
//       );
//     }

//     // Apply sorting
//     if (sortConfig) {
//       result.sort((a, b) => {
//         const aValue = a[sortConfig.key];
//         const bValue = b[sortConfig.key];

//         if (aValue < bValue) {
//           return sortConfig.direction === 'asc' ? -1 : 1;
//         }
//         if (aValue > bValue) {
//           return sortConfig.direction === 'asc' ? 1 : -1;
//         }
//         return 0;
//       });
//     }

//     return result;
//   }, [data, filterText, sortConfig, columns]);

//   // Paginated data
//   const paginatedData = useMemo(() => {
//     const startIndex = (currentPage - 1) * pageSize;
//     return processedData.slice(startIndex, startIndex + pageSize);
//   }, [processedData, currentPage, pageSize]);

//   const totalPages = Math.ceil(processedData.length / pageSize);

//   // Handle sorting
//   const requestSort = (key) => {
//     let direction = 'asc';
//     if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
//       direction = 'desc';
//     }
//     setSortConfig({ key, direction });
//   };

//   // Render cell content with optional formatting
//   const renderCellContent = (row, column) => {
//     if (column.isAction) {
//       return column.actionRenderer ? column.actionRenderer(row) : (
//         <button className="px-4 py-2 rounded-md font-semibold text-white bg-[#D92300] hover:bg-[#992205] transition-colors duration-200 shadow-md">
//           {column.actionText || 'Action'}
//         </button>
//       );
//     }

//     if (column.formatter) {
//       return column.formatter(row[column.accessor], row);
//     }

//     if (column.multiLine) {
//       const parts = String(row[column.accessor]).split('|').map(part => part.trim());
//       return (
//         <div className="flex flex-col">
//           {parts.map((part, i) => (
//             <span key={i} className={i > 0 ? 'text-xs text-gray-500' : ''}>
//               {part}
//             </span>
//           ))}
//         </div>
//       );
//     }

//     return row[column.accessor];
//   };

//   return (
//     <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className} mt-20`}>
//       <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-gray-200">
//         <div className="flex items-center gap-4 mb-2 md:mb-0">
//           <div>{headerContent}</div></div>



//         <h2 className="text-xl font-bold text-gray-800 mb-2 md:mb-0">{title}</h2>
//         <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
//           <div className="relative w-full">
//             <input
//               type="text"
//               placeholder="Search..."
//               className="w-full pl-10 pr-10 py-2 transition-all duration-300 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D92300] focus:border-transparent"
//               value={filterText}
//               onChange={(e) => {
//                 setFilterText(e.target.value);
//                 setCurrentPage(1);
//               }}
//             />

//             <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//               <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
//               </svg>
//             </div>

//             {filterText && (
//               <button
//                 type="button"
//                 onClick={() => setFilterText('')}
//                 className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             )}
//           </div>
//         </div>

//       </div>

//       {/* Table Section */}
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               {columns.map((column) => (
//                 <th
//                   key={column.accessor}
//                   scope="col"
//                   className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.isAction ? 'text-center' : ''
//                     } ${column.className || ''}`}
//                   onClick={() => !column.isAction && requestSort(column.accessor)}
//                 >
//                   <div className="flex items-center">
//                     {column.header}
//                     {sortConfig?.key === column.accessor && (
//                       <span className="ml-1">
//                         {sortConfig.direction === 'asc' ? '↑' : '↓'}
//                       </span>
//                     )}
//                   </div>
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {paginatedData.length > 0 ? (
//               paginatedData.map((row, rowIndex) => (
//                 <tr
//                   key={row.id || rowIndex}
//                   className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
//                   onClick={() => onRowClick && onRowClick(row)}
//                 >
//                   {columns.map((column) => (
//                     <td
//                       key={`${column.accessor}-${rowIndex}`}
//                       className={`px-4 py-3 text-sm ${column.isAction ? 'text-center' : 'text-gray-900'
//                         } ${column.className || ''}`}
//                     >
//                       {renderCellContent(row, column)}
//                     </td>
//                   ))}
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
//                   <div className="flex flex-col items-center justify-center">
//                     <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     <p className="mt-2 text-sm font-medium">{emptyStateMessage}</p>
//                     {filterText && (
//                       <button
//                         className="mt-2 text-sm text-[#D92300] hover:underline"
//                         onClick={() => setFilterText('')}
//                       >
//                         Clear search
//                       </button>
//                     )}
//                   </div>
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {processedData.length > 0 && (
//         <div className="flex justify-end px-4 py-3 bg-white border-t border-gray-200">

//           <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 bg-white border-t border-gray-200">
//             <p className="text-sm text-gray-700">
//               Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
//               <span className="font-medium">{Math.min(currentPage * pageSize, processedData.length)}</span> of{' '}
//               <span className="font-medium">{processedData.length}</span> results
//             </p>
//           </div>

//           <div className="flex items-center space-x-2">
//             <button
//               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//               disabled={currentPage === 1}
//               className="text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
//               aria-label="Previous page"
//             >
//               <ChevronLeft className="w-8 h-8" />
//             </button>

//             <span className="text-sm font-medium text-gray-700">
//               {currentPage.toString().padStart(2, '0')} of {totalPages.toString().padStart(2, '0')}
//             </span>

//             <button
//               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//               disabled={currentPage === totalPages}
//               className="text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
//               aria-label="Next page"
//             >
//               <ChevronRight className="w-8 h-8" />
//             </button>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// };

// DynamicTable.propTypes = {
//   title: PropTypes.string.isRequired,
//   columns: PropTypes.arrayOf(
//     PropTypes.shape({
//       header: PropTypes.string.isRequired,
//       accessor: PropTypes.string.isRequired,
//       isAction: PropTypes.bool,
//       actionText: PropTypes.string,
//       actionRenderer: PropTypes.func,
//       formatter: PropTypes.func,
//       multiLine: PropTypes.bool,
//       className: PropTypes.string,
//     })
//   ).isRequired,
//   data: PropTypes.array.isRequired,
//   pageSize: PropTypes.number,
//   defaultSort: PropTypes.shape({
//     key: PropTypes.string,
//     direction: PropTypes.oneOf(['asc', 'desc']),
//   }),
//   onRowClick: PropTypes.func,
//   emptyStateMessage: PropTypes.string,
//   className: PropTypes.string,
// };

// export default DynamicTable;























import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const DynamicTable = ({
  title,
  columns,
  data,
  pageSize = 10,
  defaultSort,
  onRowClick,
  emptyStateMessage = 'No data found',
  className = '',
  headerContent,
}) => {
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState(defaultSort);

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filtering
    if (filterText) {
      const lowercasedFilter = filterText.toLowerCase();
      result = result.filter(row =>
        columns.some(column => {
          if (column.accessor === 'action') return false;
          const value = row[column.accessor];
          return String(value).toLowerCase().includes(lowercasedFilter);
        })
      );
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [data, filterText, sortConfig, columns]);

  // Export to Excel function
  const exportToExcel = () => {
    // Prepare data for export (exclude action columns)
    const exportColumns = columns.filter(col => !col.isAction);
    const exportData = processedData.map(row => {
      const obj = {};
      exportColumns.forEach(col => {
        // Apply formatter if exists, otherwise use raw value
        obj[col.header] = col.formatter ? col.formatter(row[col.accessor], row) : row[col.accessor];
      });
      return obj;
    });

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_')}_Export.xlsx`);
  };

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedData.slice(startIndex, startIndex + pageSize);
  }, [processedData, currentPage, pageSize]);

  const totalPages = Math.ceil(processedData.length / pageSize);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Render cell content with optional formatting
  const renderCellContent = (row, column) => {
    if (column.isAction) {
      return column.actionRenderer ? column.actionRenderer(row) : (
        <button className="px-4 py-2 rounded-md font-semibold text-white bg-[#D92300] hover:bg-[#992205] transition-colors duration-200 shadow-md">
          {column.actionText || 'Action'}
        </button>
      );
    }

    if (column.formatter) {
      return column.formatter(row[column.accessor], row);
    }

    if (column.multiLine) {
      const parts = String(row[column.accessor]).split('|').map(part => part.trim());
      return (
        <div className="flex flex-col">
          {parts.map((part, i) => (
            <span key={i} className={i > 0 ? 'text-xs text-gray-500' : ''}>
              {part}
            </span>
          ))}
        </div>
      );
    }

    return row[column.accessor];
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className} mt-20`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-4 mb-2 md:mb-0">
          <div>{headerContent}</div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-2 md:mb-0">{title}</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-10 py-2 transition-all duration-300 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D92300] focus:border-transparent"
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value);
                setCurrentPage(1);
              }}
            />

            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
              </svg>
            </div>

            {filterText && (
              <button
                type="button"
                onClick={() => setFilterText('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          

          <button
            onClick={exportToExcel}
            disabled={processedData.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.isAction ? 'text-center' : ''
                    } ${column.className || ''}`}
                  onClick={() => !column.isAction && requestSort(column.accessor)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {sortConfig?.key === column.accessor && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={`${column.accessor}-${rowIndex}`}
                      className={`px-4 py-3 text-sm ${column.isAction ? 'text-center' : 'text-gray-900'
                        } ${column.className || ''}`}
                    >
                      {renderCellContent(row, column)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-2 text-sm font-medium">{emptyStateMessage}</p>
                    {filterText && (
                      <button
                        className="mt-2 text-sm text-[#D92300] hover:underline"
                        onClick={() => setFilterText('')}
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {processedData.length > 0 && (
        <div className="flex justify-end px-4 py-3 bg-white border-t border-gray-200">

          <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 bg-white border-t border-gray-200">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * pageSize, processedData.length)}</span> of{' '}
              <span className="font-medium">{processedData.length}</span> results
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <span className="text-sm font-medium text-gray-700">
              {currentPage.toString().padStart(2, '0')} of {totalPages.toString().padStart(2, '0')}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

DynamicTable.propTypes = {
  title: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string.isRequired,
      accessor: PropTypes.string.isRequired,
      isAction: PropTypes.bool,
      actionText: PropTypes.string,
      actionRenderer: PropTypes.func,
      formatter: PropTypes.func,
      multiLine: PropTypes.bool,
      className: PropTypes.string,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  pageSize: PropTypes.number,
  defaultSort: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.oneOf(['asc', 'desc']),
  }),
  onRowClick: PropTypes.func,
  emptyStateMessage: PropTypes.string,
  className: PropTypes.string,
};

export default DynamicTable;