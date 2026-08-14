import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Building2,
  Cloud,
  LogOut,
  Menu,
  Moon,
  Search,
  ShieldCheck,
  Sun,
} from 'lucide-react';

interface HeaderProps {
  onSearchQueryChange?: (query: string) => void;
  searchQuery?: string;
  onOpenLoginModal?: () => void;
  onOpenRegisterMasterModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchQueryChange,
  searchQuery = '',
  onOpenRegisterMasterModal,
}) => {
  const {
    currentUser,
    currentTenant,
    selectedBranchId,
    setSelectedBranchId,
    visibleBranches,
    darkMode,
    toggleDarkMode,
    visibleNotifications,
    markNotificationRead,
    toggleSidebar,
    logout,
  } = useApp();

  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadNotifs = visibleNotifications.filter((n) => !n.read);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search students, student IDs, items, bills..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange?.(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>

        {/* Right: Tenant Branch Filter, Role Switcher, Notifs, Theme, User */}
        <div className="flex items-center gap-3">
          {/* Cloud Sync Status Pill */}
          <div
            id="cloud-sync-status-indicator"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium"
            title="Real-time multi-device cloud sync enabled (Firebase Firestore)"
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>Cloud Synced</span>
          </div>

          {/* Branch Dropdown Selector (if Master or Super Admin) vs Locked Badge for Branch Manager */}
          {currentUser?.role !== 'BRANCH_MANAGER' ? (
            <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-white dark:bg-slate-800">
                  All Branches ({visibleBranches.length})
                </option>
                {visibleBranches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-white dark:bg-slate-800">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Building2 className="w-4 h-4 text-amber-500" />
              <span>
                {visibleBranches.find((b) => b.id === currentUser.branchId)?.name || 'Assigned Branch'}
              </span>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu((prev) => !prev)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3 z-50 animate-in fade-in">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100 dark:border-slate-800 px-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Notifications</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold">
                    {unreadNotifs.length} unread
                  </span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {visibleNotifications.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">No notifications</div>
                  ) : (
                    visibleNotifications.map((notif, idx) => (
                      <div
                        key={notif.id ? `notif-${notif.id}-${idx}` : `notif-${idx}`}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          notif.read
                            ? 'bg-slate-50 dark:bg-slate-800/40 text-slate-500'
                            : 'bg-amber-500/10 dark:bg-amber-500/20 text-slate-900 dark:text-slate-100 font-medium'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span>{notif.title}</span>
                          <span className="text-[9px] text-slate-400">{notif.date}</span>
                        </div>
                        <p className="text-[11px] mt-0.5 text-slate-600 dark:text-slate-300">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Logout */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                {currentUser?.name || 'User'}
                {currentUser?.role === 'SUPER_ADMIN' && <ShieldCheck className="w-3 h-3 text-amber-500 inline" />}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {currentTenant ? currentTenant.name : 'Super Administrator'}
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 ml-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Sign Out / End Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
