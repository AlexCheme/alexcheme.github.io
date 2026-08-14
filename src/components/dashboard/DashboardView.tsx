import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, getBeltBadgeClass } from '../../utils/exportUtils';
import { getStudentFullName } from '../../utils/studentUtils';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Boxes,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Plus,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface DashboardViewProps {
  onNavigate?: (tab: any) => void;
  onOpenAddStudentModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate = (_tab?: any) => {},
  onOpenAddStudentModal = () => {},
}) => {
  const {
    currentUser,
    currentTenant,
    visibleBranches,
    visibleStudents,
    visibleAttendance,
    visibleBills,
    visibleInventory,
    visibleExpenses,
    visibleAuditLogs,
  } = useApp();

  // Metrics calculations
  const totalStudents = visibleStudents.length;
  const activeStudents = visibleStudents.filter((s) => s.status === 'Active').length;
  const branchCount = visibleBranches.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = visibleAttendance.filter((a) => a.date === todayStr);
  const todayPresent = todayAttendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const attendancePercentage =
    activeStudents > 0 ? Math.round((todayPresent / activeStudents) * 100) : 0;

  const paidBills = visibleBills.filter((b) => b.status === 'Paid');
  const monthlyIncome = paidBills.reduce((acc, b) => acc + b.amount, 0);

  const monthlyExpenses = visibleExpenses.reduce((acc, e) => acc + e.amount, 0);

  const totalInventoryStock = visibleInventory.reduce((acc, i) => acc + i.currentStock, 0);
  const lowStockItems = visibleInventory.filter((i) => i.currentStock <= i.minStockAlert);

  const pendingBills = visibleBills.filter((b) => b.status === 'Pending');
  const outstandingBillsAmount = pendingBills.reduce((acc, b) => acc + b.amount, 0);

  // Financial Chart Data (Sample 6 months)
  const financialData = [
    { month: 'Feb', income: monthlyIncome * 0.75, expenses: monthlyExpenses * 0.8 },
    { month: 'Mar', income: monthlyIncome * 0.85, expenses: monthlyExpenses * 0.7 },
    { month: 'Apr', income: monthlyIncome * 0.9, expenses: monthlyExpenses * 0.85 },
    { month: 'May', income: monthlyIncome * 0.95, expenses: monthlyExpenses * 0.9 },
    { month: 'Jun', income: monthlyIncome * 0.98, expenses: monthlyExpenses * 0.95 },
    { month: 'Jul', income: monthlyIncome, expenses: monthlyExpenses },
  ];

  // Belt distribution chart data
  const beltCounts: Record<string, number> = {};
  visibleStudents.forEach((s) => {
    beltCounts[s.beltRank] = (beltCounts[s.beltRank] || 0) + 1;
  });
  const beltData = Object.keys(beltCounts).map((rank) => ({
    name: rank,
    value: beltCounts[rank],
  }));

  const COLORS = ['#94a3b8', '#f59e0b', '#10b981', '#3b82f6', '#f43f5e', '#dc2626', '#1e293b'];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden border border-amber-500/20">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Award className="w-64 h-64 text-amber-500" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              {currentUser?.role === 'SUPER_ADMIN'
                ? 'Super Administrator Command Center'
                : `${currentTenant?.name || 'Dojang'} Dashboard`}
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Welcome, {currentUser?.name || 'Master'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {currentTenant
                ? `Motto: "${currentTenant.motto}" • Managing ${branchCount} Branch${branchCount > 1 ? 'es' : ''}`
                : 'Platform-wide oversight over all registered Taekwondo Dojangs.'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAddStudentModal}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Register Student
            </button>
            <button
              onClick={() => onNavigate('attendance')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-amber-400" />
              Mark Attendance
            </button>
            <button
              onClick={() => onNavigate('billing')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              New Bill
            </button>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigate('students')}
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Students
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{totalStudents}</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> {activeStudents} Active
            </span>
          </div>
        </div>

        {/* Today's Attendance */}
        <div
          onClick={() => onNavigate('attendance')}
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today's Attendance
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{attendancePercentage}%</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {todayPresent} / {activeStudents} Checked-in
            </span>
          </div>
        </div>

        {/* Monthly Income */}
        <div
          onClick={() => onNavigate('financials')}
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Monthly Income
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {formatCurrency(monthlyIncome)}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Paid Invoices
            </span>
          </div>
        </div>

        {/* Outstanding Bills */}
        <div
          onClick={() => onNavigate('billing')}
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Outstanding Bills
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(outstandingBillsAmount)}
            </span>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
              {pendingBills.length} Unpaid
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly Expenses</div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(monthlyExpenses)}</div>
          </div>
          <div className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Net: {formatCurrency(monthlyIncome - monthlyExpenses)}
          </div>
        </div>

        <div
          onClick={() => onNavigate('inventory')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-amber-500/40"
        >
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Inventory Items Stock</div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{totalInventoryStock} Units</div>
          </div>
          {lowStockItems.length > 0 ? (
            <div className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {lowStockItems.length} Low Stock
            </div>
          ) : (
            <div className="text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Stock Optimal
            </div>
          )}
        </div>

        <div
          onClick={() => onNavigate('branches')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-amber-500/40"
        >
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Dojang Branches</div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{branchCount} Managed</div>
          </div>
          <Building2 className="w-6 h-6 text-amber-500" />
        </div>
      </div>

      {/* Analytics Charts & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Flow Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Financial Trend (Income vs Expenses)</h3>
              <p className="text-xs text-slate-500">6-Month revenue flow overview</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Live Ledger
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(value: any) => [`$${value}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fillOpacity={1} fill="url(#incomeGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" fillOpacity={1} fill="url(#expGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Belt Rank Distribution Chart */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Belt Rank Distribution</h3>
            <span className="text-xs text-slate-500">{totalStudents} Total</span>
          </div>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={beltData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                  {beltData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 justify-center max-h-20 overflow-y-auto">
            {beltData.map((b, i) => (
              <span key={`belt-${b.name}-${i}`} className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {b.name}: {b.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Log & Recent Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Audit Activity */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> System Audit & Activity Log
            </h3>
            <button
              onClick={() => onNavigate('logs')}
              className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {visibleAuditLogs.slice(0, 5).map((log, idx) => (
              <div
                key={log.id ? `dash-log-${log.id}-${idx}` : `dash-log-${idx}`}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 text-xs flex items-start gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100">
                    <span>{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">{log.details}</p>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                    By {log.userName} ({log.userRole})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Registered Students */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" /> Active Student Roster
            </h3>
            <button
              onClick={() => onNavigate('students')}
              className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
            >
              Manage Students
            </button>
          </div>
          <div className="space-y-3">
            {visibleStudents.slice(0, 4).map((student) => {
              const branchName = visibleBranches.find((b) => b.id === student.branchId)?.name || 'Main Branch';
              return (
                <div
                  key={student.id}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={student.photo}
                      alt={student.firstName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {getStudentFullName(student)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        ID: <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">{student.id}</span> • {branchName}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 text-[10px] rounded-full font-bold border ${getBeltBadgeClass(student.beltRank)}`}>
                    {student.beltRank}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
