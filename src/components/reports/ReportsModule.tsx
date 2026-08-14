import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCSV, exportToPDF, formatCurrency, formatDate, triggerPrint } from '../../utils/exportUtils';
import { getStudentFullName } from '../../utils/studentUtils';
import {
  Award,
  Boxes,
  Building,
  Calendar,
  CalendarCheck,
  CreditCard,
  DollarSign,
  Download,
  FileDown,
  FileSpreadsheet,
  FileText,
  Filter,
  Image as ImageIcon,
  Printer,
  ShieldCheck,
  Users,
} from 'lucide-react';

export type ReportCategory =
  | 'students'
  | 'photo_roster'
  | 'attendance'
  | 'billing'
  | 'income'
  | 'expenses'
  | 'inventory'
  | 'branches'
  | 'master';

export const ReportsModule: React.FC = () => {
  const {
    currentUser,
    currentTenant,
    branches,
    visibleStudents,
    visibleAttendance,
    visibleBills,
    visibleInventory,
    visibleExpenses,
    visibleBranches,
    tenants,
  } = useApp();

  const [activeReport, setActiveReport] = useState<ReportCategory>('students');
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [startDate, setStartDate] = useState<string>('2026-07-01');
  const [endDate, setEndDate] = useState<string>('2026-07-31');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('ALL');

  const generationDate = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const reportTabs = [
    { id: 'students' as ReportCategory, label: 'Student Roster', icon: Users },
    { id: 'photo_roster' as ReportCategory, label: 'Photo Directory (Digital Data)', icon: ImageIcon },
    { id: 'attendance' as ReportCategory, label: 'Attendance Audit', icon: CalendarCheck },
    { id: 'billing' as ReportCategory, label: 'Billing Invoices', icon: CreditCard },
    { id: 'income' as ReportCategory, label: 'Income & Revenue', icon: DollarSign },
    { id: 'expenses' as ReportCategory, label: 'Expenses & Cash Flow', icon: FileText },
    { id: 'inventory' as ReportCategory, label: 'Inventory Stock', icon: Boxes },
    { id: 'branches' as ReportCategory, label: 'Branch Comparison', icon: Building },
    ...(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'MASTER'
      ? [{ id: 'master' as ReportCategory, label: 'Master Executive Overview', icon: Award }]
      : []),
  ];

  // Export handlers
  const handleExportCSV = () => {
    let rows: Record<string, any>[] = [];
    if (activeReport === 'students' || activeReport === 'photo_roster') {
      rows = visibleStudents.map((s) => ({
        'Student ID': s.id,
        'Student Full Name (Name Father Grandfather)': getStudentFullName(s),
        Belt: s.beltRank,
        Status: s.status,
        'Student Phone': s.phone || 'N/A',
        'Guardian / Parent Name': s.parentName || 'N/A',
        'Emergency Phone': s.parentPhone || s.emergencyContact || 'N/A',
        'Blood Group': s.bloodGroup || '',
        'Medical Records': s.medicalRecords || 'None',
        'Reg Date': s.registrationDate || '',
      }));
    } else if (activeReport === 'attendance') {
      rows = visibleAttendance.map((a) => ({
        Date: a.date,
        'Student ID': a.studentId,
        Status: a.status,
        'Marked By': a.markedBy,
      }));
    } else if (activeReport === 'billing') {
      rows = visibleBills.map((b) => ({
        'Invoice ID': b.id,
        'Student ID': b.studentId,
        Reason: b.reason,
        Amount: b.amount,
        Status: b.status,
        'Date Billed': b.billingDate,
      }));
    } else if (activeReport === 'income') {
      rows = visibleBills
        .filter((b) => b.status === 'Paid')
        .map((b) => ({
          'Receipt #': b.receiptNumber || b.id,
          'Student ID': b.studentId,
          Amount: b.amount,
          'Paid Date': b.paidDate,
          Method: b.paymentMethod || 'Cash',
        }));
    } else if (activeReport === 'expenses') {
      rows = visibleExpenses.map((e) => ({
        Expense: e.name,
        Category: e.category,
        Amount: e.amount,
        Date: e.date,
      }));
    } else if (activeReport === 'inventory') {
      rows = visibleInventory.map((i) => ({
        Item: i.name,
        Category: i.category,
        'Current Stock': i.currentStock,
        Value: i.currentStock * i.sellingPrice,
      }));
    }

    exportToCSV(`Dojang_Official_${activeReport.toUpperCase()}_Report`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-500" />
            Official Institutional Reports & Audits
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate formal print-ready dojang reports equipped with official logo, seal, master credentials, student photo directories, and PDF/CSV downloads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportToPDF('official-report-content', `Dojang_${activeReport}_Report`)}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <FileDown className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={triggerPrint}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-300 dark:border-slate-700 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Report Selector Tabs */}
        <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          {reportTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeReport === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id)}
                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Date Filter & Branch Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">Date Preset:</span>
            {(['today', 'this_week', 'month', 'year', 'custom'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r as any)}
                className={`px-2.5 py-1 rounded-md capitalize font-semibold cursor-pointer ${
                  dateRange === r
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {r.replace('_', ' ')}
              </button>
            ))}
          </div>

          {dateRange === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border text-xs"
              />
              <span>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* REPORT DISPLAY BOX (PREVIEW & PRINTABLE FORMAT) */}
      <div id="official-report-content" className="bg-white text-slate-950 border-2 border-slate-900 rounded-2xl p-8 shadow-xl font-sans space-y-6">
        {/* MANDATORY INSTITUTIONAL REPORT HEADER */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
          <div className="flex items-center gap-4">
            <img
              src={currentTenant?.logo || 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=200&auto=format&fit=crop&q=80'}
              alt="School Logo"
              className="w-16 h-16 rounded-xl object-cover border border-slate-300 shrink-0"
            />
            <div>
              <h2 className="text-xl font-black uppercase tracking-wider text-slate-900">
                {currentTenant?.name || 'ETHIOPIAN TAEKWONDO ACADEMY'}
              </h2>
              <p className="text-xs text-slate-600 italic mb-1">"{currentTenant?.motto}"</p>
              <div className="text-[11px] text-slate-600 space-y-0.5">
                <div>
                  <strong>Master / Dojang Owner:</strong> {currentTenant?.masterName}
                </div>
                <div>
                  <strong>Contact:</strong> Phone: {currentTenant?.phone} | Email: {currentTenant?.email}
                </div>
                <div>
                  <strong>Address:</strong> {currentTenant?.address}, {currentTenant?.city}, {currentTenant?.country}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* REPORT METADATA STRIP */}
        <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 flex flex-wrap items-center justify-between text-xs font-medium text-slate-800">
          <div>
            <span className="font-bold text-slate-600">Report Title:</span>{' '}
            <span className="font-black uppercase text-amber-900">
              {activeReport === 'photo_roster' ? 'DIGITAL STUDENT PHOTO DIRECTORY' : `${activeReport.toUpperCase()} AUDIT REPORT`}
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-600">Generated Date:</span> {generationDate}
          </div>
          <div>
            <span className="font-bold text-slate-600">Generated By:</span> {currentUser.name} ({currentUser.role})
          </div>
        </div>

        {/* REPORT CONTENT TABLES BASED ON ACTIVE TAB */}
        {activeReport === 'students' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1">
              Active Student Roster & Belt Classification
            </h3>
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300">
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">Student Full Name</th>
                  <th className="p-2 border">Belt Rank</th>
                  <th className="p-2 border">Parent / Guardian</th>
                  <th className="p-2 border">Blood Group</th>
                  <th className="p-2 border">Medical Notes</th>
                  <th className="p-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleStudents.map((s, idx) => (
                  <tr key={s.id ? `stu-rep-${s.id}-${idx}` : `stu-rep-${idx}`} className="border-b border-slate-200">
                    <td className="p-2 border font-mono font-bold">{s.id}</td>
                    <td className="p-2 border font-bold">
                      {getStudentFullName(s)}
                    </td>
                    <td className="p-2 border font-semibold">{s.beltRank}</td>
                    <td className="p-2 border">{s.parentName} ({s.parentPhone})</td>
                    <td className="p-2 border">{s.bloodGroup}</td>
                    <td className="p-2 border text-slate-600">{s.medicalRecords || 'None'}</td>
                    <td className="p-2 border font-bold">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'photo_roster' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 flex items-center justify-between">
              <span>Student Digital Data Recording Directory (With Photos)</span>
              <span className="text-xs text-slate-500 font-normal">Total Students: {visibleStudents.length}</span>
            </h3>
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300">
                  <th className="p-2 border text-center">Photo</th>
                  <th className="p-2 border">ID Number</th>
                  <th className="p-2 border">Full Name (First, Father, Grandfather)</th>
                  <th className="p-2 border">Gender & DOB</th>
                  <th className="p-2 border">Belt Rank</th>
                  <th className="p-2 border">Guardian & Emergency Phone</th>
                  <th className="p-2 border">Blood / Medical</th>
                  <th className="p-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleStudents.map((s, idx) => (
                  <tr key={s.id ? `photo-rep-${s.id}-${idx}` : `photo-rep-${idx}`} className="border-b border-slate-200 align-middle">
                    <td className="p-2 border text-center">
                      <img
                        src={s.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                        alt={s.firstName}
                        className="w-12 h-14 object-cover rounded border border-slate-400 mx-auto"
                      />
                    </td>
                    <td className="p-2 border font-mono font-bold">{s.id}</td>
                    <td className="p-2 border font-bold text-slate-900">
                      {getStudentFullName(s)}
                    </td>
                    <td className="p-2 border text-slate-700">
                      <div>{s.gender || 'Unspecified'}</div>
                      <div className="text-[10px] text-slate-500">{s.dob || 'DOB N/A'}</div>
                    </td>
                    <td className="p-2 border font-bold text-slate-900">{s.beltRank}</td>
                    <td className="p-2 border">
                      <div className="font-semibold">{s.parentName}</div>
                      <div className="text-[10px] font-mono text-slate-600">{s.parentPhone || s.emergencyContact}</div>
                    </td>
                    <td className="p-2 border text-slate-700">
                      <div>Blood: <strong>{s.bloodGroup || 'N/A'}</strong></div>
                      <div className="text-[10px] text-slate-500">{s.medicalRecords || 'Clear'}</div>
                    </td>
                    <td className="p-2 border font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${s.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'attendance' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1">
              Attendance Audit Log
            </h3>
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300">
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Student ID</th>
                  <th className="p-2 border">Attendance Status</th>
                  <th className="p-2 border">Marked By</th>
                </tr>
              </thead>
              <tbody>
                {visibleAttendance.map((a, idx) => (
                  <tr key={a.id ? `att-rep-${a.id}-${idx}` : `att-rep-${idx}`} className="border-b border-slate-200">
                    <td className="p-2 border font-mono">{formatDate(a.date)}</td>
                    <td className="p-2 border font-bold">{a.studentId}</td>
                    <td className="p-2 border font-bold">{a.status}</td>
                    <td className="p-2 border">{a.markedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'billing' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1">
              Billing Ledger & Outstanding Debt Report
            </h3>
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300">
                  <th className="p-2 border">Invoice ID</th>
                  <th className="p-2 border">Student ID</th>
                  <th className="p-2 border">Reason</th>
                  <th className="p-2 border">Amount</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {visibleBills.map((b, idx) => (
                  <tr key={b.id ? `bill-rep-${b.id}-${idx}` : `bill-rep-${idx}`} className="border-b border-slate-200">
                    <td className="p-2 border font-mono font-bold">{b.id}</td>
                    <td className="p-2 border">{b.studentId}</td>
                    <td className="p-2 border">{b.reason}</td>
                    <td className="p-2 border font-bold">{formatCurrency(b.amount)}</td>
                    <td className="p-2 border font-bold uppercase">{b.status}</td>
                    <td className="p-2 border">{formatDate(b.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'income' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1">
              Income & Revenue Report
            </h3>
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded font-bold text-xs text-emerald-900">
              Total Revenue Collected: {formatCurrency(visibleBills.filter(b => b.status === 'Paid').reduce((acc, b) => acc + b.amount, 0))}
            </div>
          </div>
        )}

        {activeReport === 'expenses' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1">
              Expense Cash Flow Audit
            </h3>
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300">
                  <th className="p-2 border">Expense Title</th>
                  <th className="p-2 border">Category</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Amount</th>
                </tr>
              </thead>
              <tbody>
                {visibleExpenses.map((e, idx) => (
                  <tr key={e.id ? `exp-rep-${e.id}-${idx}` : `exp-rep-${idx}`} className="border-b border-slate-200">
                    <td className="p-2 border font-bold">{e.name}</td>
                    <td className="p-2 border">{e.category}</td>
                    <td className="p-2 border font-mono">{formatDate(e.date)}</td>
                    <td className="p-2 border font-bold text-rose-800">{formatCurrency(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'inventory' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1">
              Inventory Stock & Reorder Report
            </h3>
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300">
                  <th className="p-2 border">Item Name</th>
                  <th className="p-2 border">Category</th>
                  <th className="p-2 border">Current Stock</th>
                  <th className="p-2 border">Reorder Alert Level</th>
                  <th className="p-2 border">Retail Price</th>
                </tr>
              </thead>
              <tbody>
                {visibleInventory.map((i, idx) => (
                  <tr key={i.id ? `inv-rep-${i.id}-${idx}` : `inv-rep-${idx}`} className="border-b border-slate-200">
                    <td className="p-2 border font-bold">{i.name}</td>
                    <td className="p-2 border">{i.category}</td>
                    <td className="p-2 border font-bold">{i.currentStock} Units</td>
                    <td className="p-2 border">{i.minStockAlert} Units</td>
                    <td className="p-2 border font-mono">${i.sellingPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* OFFICIAL SIGNATURE AND STAMP BLOCK */}
        {(() => {
          const activeSignature = currentUser?.signature || (currentUser?.branchId ? branches.find(b => b.id === currentUser.branchId)?.signature : undefined) || currentTenant?.signature;
          const signerTitle = currentUser?.role === 'BRANCH_MANAGER' ? `${currentUser.name} (Branch Manager)` : (currentTenant?.masterName || 'Grandmaster Owner');
          return (
            <div className="pt-8 border-t-2 border-slate-900 flex justify-between items-end text-xs text-slate-800">
              <div>
                <div className="text-[10px] text-slate-500 mb-1">Certified by:</div>
                {activeSignature ? (
                  <img
                    src={activeSignature}
                    alt="Official Signature"
                    className="h-12 max-w-[180px] object-contain mb-1"
                  />
                ) : (
                  <div className="h-10"></div>
                )}
                <div className="border-t border-slate-900 w-48 text-center pt-1 font-bold">
                  {signerTitle} Signature
                </div>
              </div>

              <div className="text-center">
                {currentTenant?.stampSeal ? (
                  <div className="relative inline-block mb-1">
                    <img
                      src={currentTenant.stampSeal}
                      alt="Official Seal"
                      className="w-20 h-20 object-contain mx-auto opacity-95 drop-shadow-sm rotate-[-3deg]"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 border-2 border-dashed border-rose-400 rounded-full flex flex-col items-center justify-center text-[9px] text-rose-600 font-bold mx-auto mb-1 bg-rose-50/40">
                    <span>[ Official Stamp ]</span>
                    <span className="text-[7px] font-normal text-slate-500">Space for Stamp</span>
                  </div>
                )}
                <div className="border-t border-slate-900 w-48 text-center pt-1 font-bold">
                  Official Dojang Seal & Date
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
