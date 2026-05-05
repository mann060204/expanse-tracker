import React, { useState } from 'react';
import { Edit2, Trash2, ArrowUpRight, ArrowDownRight, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const TransactionTable = ({ transactions, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  if (transactions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-500 dark:text-slate-400 font-medium">No transactions found.</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Add your first transaction to get started.</p>
      </div>
    );
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'credit':
        return <ArrowUpRight className="w-4 h-4 text-emerald-500" />;
      case 'debit':
        return <ArrowDownRight className="w-4 h-4 text-red-500" />;
      case 'mf_transfer':
        return <RefreshCw className="w-4 h-4 text-purple-500" />;
      case 'mf_withdrawal':
        return <RefreshCw className="w-4 h-4 text-emerald-600" />;
      default:
        return null;
    }
  };

  const getAmountColor = (type) => {
    switch (type) {
      case 'credit':
        return 'text-emerald-500';
      case 'debit':
        return 'text-slate-900 dark:text-white';
      case 'mf_transfer':
        return 'text-purple-600 dark:text-purple-400';
      case 'mf_withdrawal':
        return 'text-emerald-600';
      default:
        return 'text-slate-900 dark:text-white';
    }
  };

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const currentTransactions = transactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400">
              <th className="pb-3 pl-4">Date</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Note</th>
              <th className="pb-3 text-right">Category</th>
              <th className="pb-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {currentTransactions.map((tx) => (
              <tr key={tx._id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                <td className="py-5 pl-4 text-slate-600 dark:text-slate-300 whitespace-nowrap font-medium">
                  {new Date(tx.date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </td>
                <td className="py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    {getTypeIcon(tx.type)}
                    <span className={`font-semibold ${getAmountColor(tx.type)}`}>
                      ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </td>
                <td className="py-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{tx.note || '-'}</span>
                    {tx.attachment_url && (
                      <a href={tx.attachment_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300" title="View Attachment">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                      </a>
                    )}
                  </div>
                </td>
                <td className="py-4 text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors">
                    {tx.category}
                  </span>
                </td>
                <td className="py-4 pr-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-1.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this transaction?')) {
                          onDelete(tx._id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 mt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                currentPage === 1 
                  ? 'text-slate-400 bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed' 
                  : 'text-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              } border border-slate-300 dark:border-slate-700`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                currentPage === totalPages 
                  ? 'text-slate-400 bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed' 
                  : 'text-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              } border border-slate-300 dark:border-slate-700`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-400">
                Showing <span className="font-medium text-slate-900 dark:text-slate-200">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium text-slate-900 dark:text-slate-200">{Math.min(currentPage * itemsPerPage, transactions.length)}</span> of <span className="font-medium text-slate-900 dark:text-slate-200">{transactions.length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 border ${
                    currentPage === 1 
                      ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed' 
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold border ${
                      currentPage === i + 1
                        ? 'z-10 bg-purple-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 border-purple-600'
                        : 'text-slate-900 dark:text-slate-200 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 border ${
                    currentPage === totalPages 
                      ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed' 
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
