import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense } from '../../types';
import { exportToCSV, formatCurrency, formatDate } from '../../utils/exportUtils';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  DollarSign,
  Download,
  Filter,
  PieChart as PieIcon,
  Plus,
  Receipt,
  Search,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';

export const ExpenseManagement: React.FC = () => {
  const {
    currentUser,
    currentTenant,
    visibleExpenses,
    visibleBills,
    visibleBranches,
    addExpense,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>(
    currentUser.role === 'BRANCH_MANAGER' && currentUser.branchId ? currentUser.branchId : 'ALL'
  );

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Expense, 'id' | 'tenantId'>>({
    branchId: visibleBranches[0]?.id || '',
    name: '',
    category: 'Rent',
    amount: 100,
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  // Financial Metrics
  const totalIncomeCollected = visibleBills
    .filter((b) => b.status === 'Paid')
    .reduce((acc, b) => acc + b.amount, 0);

  const filteredExpenses = visibleExpenses.filter((e) => {
    const q = (searchTerm || '').toLowerCase();
    const matchesQuery =
      (e.name || '').toLowerCase().includes(q) ||
      (e.category || '').toLowerCase().includes(q) ||
      (e.description ? e.description.toLowerCase().includes(q) : false);

    const matchesCategory = selectedCategoryFilter === 'ALL' || e.category === selectedCategoryFilter;
    const matchesBranch = selectedBranchFilter === 'ALL' || e.branchId === selectedBranchFilter;

    return matchesQuery && matchesCategory && matchesBranch;
  });

  const totalExpensesAmount = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netCashFlow = totalIncomeCollected - totalExpensesAmount;

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!formData.name || formData.amount <= 0) {
      alert('Please fill out expense name and positive amount.');
      return;
    }

    addExpense(formData);
    setIsModalOpen(false);
    setFormData({
      branchId: visibleBranches[0]?.id || '',
      name: '',
      category: 'Rent',
      amount: 100,
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
  };

  const handleExportCSV = () => {
    const rows = filteredExpenses.map((e) => ({
      'Expense Name': e.name,
      Category: e.category,
      Branch: visibleBranches.find((b) => b.id === e.branchId)?.name || e.branchId,
      Amount: e.amount,
      Date: e.date,
      Description: e.description || '',
    }));
    exportToCSV(`Expense_Ledger_Export_${new Date().toISOString().split('T')[0]}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-500" />
            Income, Expense & Cash Flow Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor facility leases, staff stipends, utilities, equipment purchases, and net profitability per branch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            Export CSV
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record Expense
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Paid Income</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(totalIncomeCollected)}
            </div>
          </div>
          <ArrowUpCircle className="w-8 h-8 text-emerald-500 opacity-80" />
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Expenses</div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {formatCurrency(totalExpensesAmount)}
            </div>
          </div>
          <ArrowDownCircle className="w-8 h-8 text-rose-500 opacity-80" />
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Cash Flow</div>
            <div
              className={`text-2xl font-black mt-1 ${
                netCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatCurrency(netCashFlow)}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 font-bold text-xs">
            {netCashFlow >= 0 ? '+ Profit' : '- Deficit'}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search expense description, rent, equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Rent">Rent / Lease</option>
              <option value="Utilities">Utilities</option>
              <option value="Staff Salary">Staff Salary</option>
              <option value="Equipment">Equipment</option>
              <option value="Tournament/Event">Tournament / Event</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Marketing">Marketing</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Branch Filter */}
          {currentUser.role !== 'BRANCH_MANAGER' && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Branch:</span>
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
              >
                <option value="ALL">All Branches</option>
                {visibleBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Expense Item</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Branch</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => {
                  const branchName =
                    visibleBranches.find((b) => b.id === expense.branchId)?.name || expense.branchId;

                  return (
                    <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                        {expense.name}
                      </td>

                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 text-[10px] rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {expense.category}
                        </span>
                      </td>

                      <td className="p-3.5 font-medium">{branchName}</td>

                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">
                        {formatDate(expense.date)}
                      </td>

                      <td className="p-3.5 font-black text-sm text-rose-600 dark:text-rose-400">
                        {formatCurrency(expense.amount)}
                      </td>

                      <td className="p-3.5 text-slate-400 italic">
                        {expense.description || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD EXPENSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-500" /> Record Expense Payment
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Expense Title / Payee *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dojo Floor Lease, Electricity Bill"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  <option value="Rent">Rent / Facility Lease</option>
                  <option value="Utilities">Utilities (AC, Electric, Water)</option>
                  <option value="Staff Salary">Staff / Instructor Salary</option>
                  <option value="Equipment">Equipment Purchase</option>
                  <option value="Tournament/Event">Tournament / Belt Exam Event</option>
                  <option value="Maintenance">Facility Maintenance</option>
                  <option value="Marketing">Marketing & Advertising</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Branch
                </label>
                <select
                  value={formData.branchId}
                  disabled={currentUser.role === 'BRANCH_MANAGER'}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {visibleBranches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Amount ($ USD) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Expense Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
