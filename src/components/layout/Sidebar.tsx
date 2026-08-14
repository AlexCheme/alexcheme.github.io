import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Award,
  BarChart3,
  Boxes,
  Building,
  CalendarCheck,
  CreditCard,
  DollarSign,
  FileSpreadsheet,
  Globe,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'students'
  | 'attendance'
  | 'billing'
  | 'inventory'
  | 'financials'
  | 'branches'
  | 'reports'
  | 'settings'
  | 'profile'
  | 'admin'
  | 'logs';

interface SidebarProps {
  activeTab?: ActiveTab;
  setActiveTab?: (tab: ActiveTab) => void;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  isOpen: propIsOpen,
  setIsOpen: propSetIsOpen,
}) => {
  const context = useApp();
  const {
    currentUser,
    currentTenant,
    visibleStudents,
    visibleInventory,
    visibleBills,
    activeTab: contextActiveTab,
    setActiveTab: contextSetActiveTab,
    isSidebarOpen: contextIsOpen,
    setIsSidebarOpen: contextSetIsOpen,
    logout,
  } = context;

  const currentActiveTab = propActiveTab ?? contextActiveTab;
  const handleTabChange = (tab: ActiveTab) => {
    if (propSetActiveTab) propSetActiveTab(tab);
    else contextSetActiveTab(tab);
    if (propSetIsOpen) propSetIsOpen(false);
    else contextSetIsOpen(false);
  };
  const isSidebarVisible = propIsOpen ?? contextIsOpen;

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isMaster = currentUser?.role === 'MASTER';
  const isBranchManager = currentUser?.role === 'BRANCH_MANAGER';

  // Badge counters
  const studentCount = visibleStudents.length;
  const pendingBillsCount = visibleBills.filter((b) => b.status === 'Pending').length;
  const lowStockCount = visibleInventory.filter((i) => i.currentStock <= i.minStockAlert).length;

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students' as ActiveTab, label: 'Students', icon: Users, badge: studentCount },
    { id: 'attendance' as ActiveTab, label: 'Attendance', icon: CalendarCheck },
    { id: 'grading' as ActiveTab, label: 'Grading & Belt Promotion', icon: GraduationCap },
    { id: 'billing' as ActiveTab, label: 'Billing & Receipts', icon: CreditCard, badge: pendingBillsCount > 0 ? pendingBillsCount : undefined, badgeColor: 'bg-amber-500' },
    { id: 'inventory' as ActiveTab, label: 'Inventory Stock', icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-rose-500' },
    { id: 'financials' as ActiveTab, label: 'Income & Expenses', icon: DollarSign },
    ...(isMaster || isSuperAdmin ? [{ id: 'branches' as ActiveTab, label: 'Branch Management', icon: Building }] : []),
    { id: 'reports' as ActiveTab, label: 'Reports & Export', icon: FileSpreadsheet },
    ...(isMaster || isBranchManager ? [{ id: 'settings' as ActiveTab, label: isBranchManager ? 'Branch & Manager Settings' : 'Dojang Settings', icon: Settings }] : []),
    ...(isMaster ? [{ id: 'profile' as ActiveTab, label: 'Master Profile', icon: Award }] : []),
    ...(isSuperAdmin ? [{ id: 'admin' as ActiveTab, label: 'Super Admin Portal', icon: ShieldCheck, badge: 'SA' }] : []),
    ...(isSuperAdmin ? [{ id: 'logs' as ActiveTab, label: 'Security & Audit Logs', icon: ShieldAlert }] : []),
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        isSidebarVisible ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand & Dojang Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        {currentTenant?.logo ? (
          <img
            src={currentTenant.logo}
            alt="Logo"
            className="w-10 h-10 rounded-lg object-cover border border-amber-500/40 shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-600 to-red-600 flex items-center justify-center font-black text-white text-lg shadow-md">
            TKD
          </div>
        )}
        <div className="overflow-hidden">
          <div className="font-bold text-sm text-white truncate">
            {currentTenant ? currentTenant.name : 'Dojang Management'}
          </div>
          <div className="text-[11px] text-amber-400 font-medium truncate flex items-center gap-1">
            <Globe className="w-3 h-3 inline shrink-0" />
            {isSuperAdmin ? 'Global Platform Admin' : isMaster ? 'Master Owner' : 'Branch Manager'}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentActiveTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                    isActive
                      ? 'bg-slate-950 text-amber-400'
                      : item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Tenant Info & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3">
        <div className="text-[11px] text-slate-400 flex items-center justify-between">
          <span>Tenant ID:</span>
          <span className="font-mono text-amber-400 font-semibold">{currentUser?.tenantId || 'GLOBAL'}</span>
        </div>
        {currentTenant && (
          <div className="text-[10px] text-slate-500 truncate">
            Motto: "{currentTenant.motto}"
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          className="w-full mt-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700/60 hover:border-rose-500/40 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer group"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition-colors" />
          <span>Sign Out / Log Out</span>
        </button>
      </div>
    </aside>
  );
};
