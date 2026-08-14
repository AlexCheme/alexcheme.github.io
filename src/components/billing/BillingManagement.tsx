import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bill, BillingStatus, PaymentMethod } from '../../types';
import { exportToCSV, exportToPDF, formatCurrency, formatDate, triggerPrint } from '../../utils/exportUtils';
import { getStudentFullName } from '../../utils/studentUtils';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  FileDown,
  FileText,
  Filter,
  Plus,
  Printer,
  Receipt,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';

export const BillingManagement: React.FC = () => {
  const {
    currentUser,
    currentTenant,
    branches,
    visibleBills,
    visibleStudents,
    visibleBranches,
    createBill,
    updateBillStatus,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>(
    currentUser.role === 'BRANCH_MANAGER' && currentUser.branchId ? currentUser.branchId : 'ALL'
  );

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReceiptBill, setSelectedReceiptBill] = useState<Bill | null>(null);

  const currentYearMonth = new Date().toISOString().slice(0, 7);

  // Form State
  const [formData, setFormData] = useState({
    studentId: visibleStudents[0]?.id || '',
    branchId: visibleBranches[0]?.id || '',
    feeType: 'Tuition' as 'Tuition' | 'Belt Exam' | 'Uniform' | 'Equipment' | 'Other',
    billingMonth: currentYearMonth,
    reason: `Monthly Tuition Fee - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
    amount: 150,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Pending' as BillingStatus,
    notes: '',
  });

  // Financial Metrics
  const totalBilled = visibleBills.reduce((acc, b) => acc + b.amount, 0);
  const paidBills = visibleBills.filter((b) => b.status === 'Paid');
  const totalPaid = paidBills.reduce((acc, b) => acc + b.amount, 0);
  const pendingBills = visibleBills.filter((b) => b.status === 'Pending');
  const totalPending = pendingBills.reduce((acc, b) => acc + b.amount, 0);
  const sponsoredBills = visibleBills.filter((b) => b.status === 'Sponsored');

  // Filter Bills
  const filteredBills = visibleBills.filter((bill) => {
    const student = visibleStudents.find((s) => s.id === bill.studentId);
    const q = (searchTerm || '').toLowerCase();
    const studentName = student ? getStudentFullName(student).toLowerCase() : '';
    const matchesQuery =
      (bill.id || '').toLowerCase().includes(q) ||
      (bill.reason || '').toLowerCase().includes(q) ||
      (bill.studentId || '').toLowerCase().includes(q) ||
      studentName.includes(q);

    const matchesStatus = selectedStatusFilter === 'ALL' || bill.status === selectedStatusFilter;
    const matchesBranch = selectedBranchFilter === 'ALL' || bill.branchId === selectedBranchFilter;

    return matchesQuery && matchesStatus && matchesBranch;
  });

  // Tuition Rule Check: 1 time per month per student
  const targetStudent = visibleStudents.find((s) => s.id === formData.studentId);
  const existingTuitionBill = visibleBills.find((b) => {
    if (b.studentId !== formData.studentId) return false;
    const bMonth = b.billingMonth || (b.billingDate ? b.billingDate.slice(0, 7) : '');
    const isTuition = b.feeType === 'Tuition' || (b.reason && b.reason.toLowerCase().includes('tuition'));
    return isTuition && bMonth === formData.billingMonth && b.status !== 'Cancelled';
  });

  const isTuitionBlocked = formData.feeType === 'Tuition' && Boolean(existingTuitionBill);

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.reason || formData.amount <= 0) {
      alert('Please fill out student, billing reason, and positive amount.');
      return;
    }

    if (isTuitionBlocked) {
      alert(`Student ${getStudentFullName(targetStudent)} has already paid/been billed for Tuition Fee in ${formData.billingMonth}. Only 1 tuition fee is allowed per month per student.`);
      return;
    }

    const branchId = targetStudent?.branchId || formData.branchId || visibleBranches[0]?.id || '';

    createBill({
      branchId,
      studentId: formData.studentId,
      feeType: formData.feeType,
      billingMonth: formData.billingMonth,
      reason: formData.reason,
      amount: Number(formData.amount),
      billingDate: new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate,
      status: formData.status,
      notes: formData.notes,
    });

    setIsCreateModalOpen(false);
  };

  const handleExportCSV = () => {
    const rows = filteredBills.map((b) => {
      const student = visibleStudents.find((s) => s.id === b.studentId);
      return {
        'Invoice ID': b.id,
        'Student ID': b.studentId,
        'Student Full Name': student ? getStudentFullName(student) : b.studentId,
        'Fee Category': b.feeType || 'General',
        'Billing Month': b.billingMonth || b.billingDate.slice(0, 7),
        Reason: b.reason,
        Amount: b.amount,
        'Billing Date': b.billingDate,
        'Due Date': b.dueDate,
        Status: b.status,
        'Payment Method': b.paymentMethod || 'N/A',
        'Receipt #': b.receiptNumber || 'N/A',
      };
    });
    exportToCSV(`Billing_Ledger_Export_${new Date().toISOString().split('T')[0]}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-500" />
            Billing, Tuition & Receipts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate invoices, process student payments, issue official stamped receipts, and track cash revenue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            Export Ledger CSV
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Issue New Invoice
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue Collected</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalPaid)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{paidBills.length} Paid Invoices</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Outstanding Unpaid</div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(totalPending)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{pendingBills.length} Pending Invoices</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sponsored / Scholarships</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {sponsoredBills.length} Grants
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Waived fees</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Billed Total</div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {formatCurrency(totalBilled)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{visibleBills.length} Total Invoices</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice #, student name, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Sponsored">Sponsored</option>
              <option value="Cancelled">Cancelled</option>
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

      {/* Billing Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Invoice ID</th>
                <th className="p-3.5">Student</th>
                <th className="p-3.5">Billing Reason</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Billing & Due Dates</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No billing records found matching query.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => {
                  const student = visibleStudents.find((s) => s.id === bill.studentId);

                  return (
                    <tr key={bill.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {bill.id}
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {student ? getStudentFullName(student) : bill.studentId}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{bill.studentId}</div>
                      </td>

                      <td className="p-3.5 font-medium">{bill.reason}</td>

                      <td className="p-3.5 font-black text-sm text-slate-900 dark:text-slate-100">
                        {formatCurrency(bill.amount)}
                      </td>

                      <td className="p-3.5 text-[11px]">
                        <div>Issued: {formatDate(bill.billingDate)}</div>
                        <div className="text-slate-400">Due: {formatDate(bill.dueDate)}</div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 text-[10px] rounded-full font-bold ${
                            bill.status === 'Paid'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : bill.status === 'Pending'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : bill.status === 'Sponsored'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {bill.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {bill.status === 'Pending' && (
                            <button
                              onClick={() => updateBillStatus(bill.id, 'Paid', 'Cash')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[10px] hover:bg-emerald-400 transition-colors cursor-pointer"
                            >
                              Mark Paid
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedReceiptBill(bill)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                            title="View / Print Official Receipt"
                          >
                            <Receipt className="w-3.5 h-3.5 text-amber-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW BILL MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-500" /> Issue New Dojang Bill
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="mt-4 space-y-4">
              {/* Select Student */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Student *
                </label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                >
                  {visibleStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {getStudentFullName(s)} ({s.id}) — Belt: {s.beltRank}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fee Category & Billing Month */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fee Category *
                  </label>
                  <select
                    value={formData.feeType}
                    onChange={(e) => {
                      const newType = e.target.value as any;
                      let defaultReason = formData.reason;
                      if (newType === 'Tuition') {
                        const dateObj = new Date(formData.billingMonth + '-01');
                        const monthName = isNaN(dateObj.getTime()) ? '' : dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
                        defaultReason = `Monthly Tuition Fee - ${monthName}`;
                      } else if (newType === 'Belt Exam') {
                        defaultReason = `Belt Promotion Examination Fee`;
                      } else if (newType === 'Uniform') {
                        defaultReason = `Official WT Approved Dobok (Uniform)`;
                      } else if (newType === 'Equipment') {
                        defaultReason = `Taekwondo Protective Gear & Pad`;
                      }
                      setFormData({ ...formData, feeType: newType, reason: defaultReason });
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Tuition">Tuition Fee (1x per month limit)</option>
                    <option value="Belt Exam">Belt Exam Fee (Multiple allowed)</option>
                    <option value="Uniform">Uniform / Dobok (Multiple allowed)</option>
                    <option value="Equipment">Equipment / Gear (Multiple allowed)</option>
                    <option value="Other">Other Fee (Multiple allowed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Billing Month (YYYY-MM)
                  </label>
                  <input
                    type="month"
                    value={formData.billingMonth}
                    onChange={(e) => {
                      const monthVal = e.target.value;
                      const dateObj = new Date(monthVal + '-01');
                      const monthName = isNaN(dateObj.getTime()) ? '' : dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
                      const newReason = formData.feeType === 'Tuition' ? `Monthly Tuition Fee - ${monthName}` : formData.reason;
                      setFormData({ ...formData, billingMonth: monthVal, reason: newReason });
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Tuition Limit Rule Warning Banner */}
              {isTuitionBlocked && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs">Tuition Payment Rule Violation:</div>
                    <p className="mt-0.5 text-[11px] leading-relaxed">
                      Student <strong>{getStudentFullName(targetStudent)}</strong> has ALREADY been billed for Tuition in <strong>{formData.billingMonth}</strong> (Invoice #{existingTuitionBill?.id}).
                    </p>
                    <p className="mt-1 font-semibold text-[10px] text-rose-600 dark:text-rose-300">
                      Rule: A student can ONLY pay tuition 1 time per month. Select a different fee type (Belt Exam, Uniform, Equipment) to issue additional charges for this month.
                    </p>
                  </div>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Billing Reason / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Tuition Fee, Belt Exam Fee"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Amount & Due Date */}
              <div className="grid grid-cols-2 gap-4">
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
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as BillingStatus })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Pending">Pending (Unpaid)</option>
                  <option value="Paid">Paid Immediately</option>
                  <option value="Sponsored">Sponsored (Grant/Waived)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTuitionBlocked}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isTuitionBlocked ? 'Tuition Limit Exceeded' : 'Save & Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL STAMPED PAYMENT RECEIPT MODAL */}
      {selectedReceiptBill && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Payment Receipt</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportToPDF('billing-receipt-printable', `Receipt_${selectedReceiptBill.receiptNumber || selectedReceiptBill.id}`)}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="w-4 h-4" /> Download PDF
                </button>
                <button
                  onClick={triggerPrint}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print Receipt
                </button>
                <button
                  onClick={() => setSelectedReceiptBill(null)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Receipt Box */}
            <div id="billing-receipt-printable" className="p-6 bg-white text-slate-950 border-2 border-slate-900 rounded-xl space-y-4 font-sans">
              {/* Dojang Institutional Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                <div className="flex items-center gap-3">
                  {(currentTenant?.logo || 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=200&auto=format&fit=crop&q=80') && (
                    <img
                      src={currentTenant?.logo || 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=200&auto=format&fit=crop&q=80'}
                      alt="School Logo"
                      className="w-14 h-14 object-cover rounded-lg border border-slate-300 shrink-0"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-black uppercase text-slate-900">{currentTenant?.name || 'ETHIOPIAN TAEKWONDO ACADEMY'}</h3>
                    <p className="text-[10px] text-slate-600">Master: {currentTenant?.masterName}</p>
                    <p className="text-[10px] text-slate-600">Phone: {currentTenant?.phone} • Email: {currentTenant?.email}</p>
                  </div>
                </div>
              </div>

              <div className="text-center bg-slate-100 py-1 font-bold text-xs uppercase tracking-widest text-slate-900 border border-slate-300">
                OFFICIAL PAYMENT RECEIPT
              </div>

              <div className="grid grid-cols-2 text-xs gap-2 pt-2">
                <div>
                  <span className="text-slate-500">Receipt No:</span>{' '}
                  <span className="font-mono font-bold">{selectedReceiptBill.receiptNumber || selectedReceiptBill.id}</span>
                </div>
                <div>
                  <span className="text-slate-500">Date Paid:</span>{' '}
                  <span className="font-semibold">{selectedReceiptBill.paidDate || selectedReceiptBill.billingDate}</span>
                </div>
                <div>
                  <span className="text-slate-500">Student Name:</span>{' '}
                  <span className="font-bold text-slate-900">
                    {(() => {
                      const st = visibleStudents.find((s) => s.id === selectedReceiptBill.studentId);
                      return st ? getStudentFullName(st) : selectedReceiptBill.studentId;
                    })()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Student ID:</span>{' '}
                  <span className="font-mono font-bold text-amber-900">{selectedReceiptBill.studentId}</span>
                </div>
                <div>
                  <span className="text-slate-500">Payment Status:</span>{' '}
                  <span className="font-bold text-emerald-800 uppercase">{selectedReceiptBill.status}</span>
                </div>
              </div>

              <div className="border-t border-b border-slate-900 py-3 my-2">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Description</span>
                  <span>Amount</span>
                </div>
                <div className="flex justify-between text-xs text-slate-800">
                  <span>{selectedReceiptBill.reason}</span>
                  <span className="font-mono font-bold">{formatCurrency(selectedReceiptBill.amount)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-black pt-1">
                <span>TOTAL PAID:</span>
                <span className="text-emerald-700 font-mono text-base">{formatCurrency(selectedReceiptBill.amount)}</span>
              </div>

              <div className="pt-6 flex justify-between items-end text-[10px] text-slate-600">
                <div>
                  <div>Payment Method: {selectedReceiptBill.paymentMethod || 'Cash'}</div>
                  {(() => {
                    const activeSig = currentUser?.signature || (currentUser?.branchId ? branches.find(b => b.id === currentUser.branchId)?.signature : undefined) || currentTenant?.signature;
                    return activeSig ? (
                      <img
                        src={activeSig}
                        alt="Signature"
                        className="h-10 max-w-[140px] object-contain my-1"
                      />
                    ) : (
                      <div className="h-4"></div>
                    );
                  })()}
                  <div className="font-mono border-t border-slate-300 pt-0.5">Issued by: {currentUser.name}</div>
                </div>
                <div className="text-center">
                  {currentTenant?.stampSeal ? (
                    <img src={currentTenant.stampSeal} alt="Official Stamp/Seal" className="w-16 h-16 object-contain mx-auto opacity-95 mb-1 rotate-[-3deg]" />
                  ) : (
                    <div className="w-14 h-14 border border-dashed border-rose-400 rounded-full flex items-center justify-center text-[8px] text-rose-600 font-bold mx-auto mb-1 bg-rose-50/40">
                      [ Stamp ]
                    </div>
                  )}
                  <div className="border-t border-slate-900 w-36 font-bold text-[10px] pt-0.5">Authorized Stamp & Date</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
