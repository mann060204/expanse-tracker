import React, { useState, useEffect } from 'react';
import { useOrganization } from '@clerk/clerk-react';
import api from '../services/api';
import TransactionForm from '../components/TransactionForm';
import TransactionTable from '../components/TransactionTable';
import { Plus, Download, X, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

const Transactions = () => {
  const { organization } = useOrganization();
  const [transactions, setTransactions] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  // Export State
  const [exportType, setExportType] = useState('all'); // 'all' or 'range'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/transactions');
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [organization?.id]);

  const handleSaveTransaction = async (formData) => {
    try {
      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction._id}`, formData);
      } else {
        await api.post('/transactions', formData);
      }
      setIsFormOpen(false);
      setEditingTransaction(null);
      fetchTransactions();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert(error.response?.data?.message || 'Failed to save transaction');
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  const openEditForm = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const handleExport = () => {
    let dataToExport = transactions;
    if (exportType === 'range') {
      if (!startDate || !endDate) {
        alert('Please select both start and end dates.');
        return;
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dataToExport = transactions.filter(t => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      });
    }

    if (dataToExport.length === 0) {
      alert('No transactions found in this range.');
      return;
    }

    // Format data for Excel
    const worksheetData = dataToExport.map(t => ({
      Date: new Date(t.date).toLocaleDateString('en-IN'),
      Type: t.type,
      Category: t.category,
      Amount: t.amount,
      Note: t.note || '',
      'Attachment URL': t.attachment_url || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    
    // Auto-size columns
    const colWidths = [
      { wch: 15 }, // Date
      { wch: 15 }, // Type
      { wch: 20 }, // Category
      { wch: 12 }, // Amount
      { wch: 30 }, // Note
      { wch: 30 }  // URL
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `Transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
    setIsExportOpen(false);
  };

  return (
    <div className="py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">Transactions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Manage your income, expenses, and investments.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsExportOpen(true)}
            className="flex-1 sm:flex-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center shadow-sm"
          >
            <Download className="w-5 h-5 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex-1 sm:flex-none bg-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-sm shadow-purple-500/20 flex items-center justify-center"
          >
            <Plus className="w-5 h-5 sm:mr-2" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        {loading ? (
          <div className="p-10 text-center text-slate-500 dark:text-slate-400">Loading transactions...</div>
        ) : (
          <TransactionTable
            transactions={transactions}
            onEdit={openEditForm}
            onDelete={handleDeleteTransaction}
          />
        )}
      </div>

      {isFormOpen && (
        <TransactionForm
          onClose={closeForm}
          onSave={handleSaveTransaction}
          initialData={editingTransaction}
        />
      )}

      {/* Export Modal */}
      {isExportOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col transition-colors border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Export to Excel</h2>
              <button
                onClick={() => setIsExportOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${exportType === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  onClick={() => setExportType('all')}
                >
                  All Data
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${exportType === 'range' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  onClick={() => setExportType('range')}
                >
                  Date Range
                </button>
              </div>

              {exportType === 'range' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setIsExportOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Excel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
