import React, { useState, useEffect } from 'react';
import { X, Save, UploadCloud } from 'lucide-react';
import api from '../services/api';

const CATEGORIES = ['Food', 'Transportation', 'Shopping', 'Bills & Utilities', 'Entertainment', 'Medical', 'Mutual Fund', 'Education', 'Salary', 'Others'];
const TYPES = [
  { value: 'debit', label: 'Debit (Expense)' },
  { value: 'credit', label: 'Credit (Income)' },
  { value: 'mf_transfer', label: 'Mutual Fund Investment (Bank → MF)' },
  { value: 'mf_withdrawal', label: 'Mutual Fund Withdrawal (MF → Bank)' },
];

const TransactionForm = ({ onClose, onSave, initialData = null }) => {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'debit',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    note: '',
    attachment_url: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: new Date(initialData.date).toISOString().split('T')[0],
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let finalData = { ...formData };
    
    if (file) {
      setUploading(true);
      const data = new FormData();
      data.append('file', file);
      try {
        const res = await api.post('/upload/bill', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        finalData.attachment_url = res.data.url;
      } catch (error) {
        console.error('File upload failed', error);
        alert('File upload failed');
        setUploading(false);
        setLoading(false);
        return;
      }
      setUploading(false);
    }
    
    await onSave(finalData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] transition-colors border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {initialData ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="transaction-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹)</label>
              <input
                type="number"
                name="amount"
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                <select
                  name="type"
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow"
                  value={formData.type}
                  onChange={handleChange}
                >
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                name="category"
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow"
                value={formData.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
              <textarea
                name="note"
                rows="2"
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow resize-none"
                value={formData.note}
                onChange={handleChange}
                placeholder="Optional details..."
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Attachment (Bill/Receipt)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl hover:border-purple-600 dark:hover:border-purple-400 transition-colors cursor-pointer relative">
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-8 w-8 text-slate-400" />
                  <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 focus-within:outline-none">
                      <span>{file ? file.name : 'Upload a file'}</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/jpeg, image/png, application/pdf" />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500">PNG, JPG, PDF up to 5MB</p>
                </div>
              </div>
              {formData.attachment_url && !file && (
                <a href={formData.attachment_url} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:underline mt-2 inline-block">
                  View Current Attachment
                </a>
              )}
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="transaction-form"
            disabled={loading || uploading}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors flex items-center disabled:opacity-70"
          >
            <Save className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : loading ? 'Saving...' : 'Save Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;
