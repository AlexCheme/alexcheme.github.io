import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { StudentManagement } from './components/students/StudentManagement';
import { AttendanceManagement } from './components/attendance/AttendanceManagement';
import { GradingModule } from './components/grading/GradingModule';
import { BillingManagement } from './components/billing/BillingManagement';
import { InventoryManagement } from './components/inventory/InventoryManagement';
import { ExpenseManagement } from './components/expenses/ExpenseManagement';
import { BranchManagement } from './components/branches/BranchManagement';
import { ReportsModule } from './components/reports/ReportsModule';
import { SettingsModule } from './components/settings/SettingsModule';
import { MasterProfile } from './components/profile/MasterProfile';
import { SuperAdminPortal } from './components/admin/SuperAdminPortal';
import { AuditLogsView } from './components/admin/AuditLogsView';
import { LoginPage } from './components/auth/LoginPage';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterMasterModal } from './components/auth/RegisterMasterModal';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, isAuthenticated } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterMasterModalOpen, setIsRegisterMasterModalOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors flex flex-col">
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenRegisterMasterModal={() => setIsRegisterMasterModalOpen(true)}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* View Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenAddStudentModal={() => setActiveTab('students')}
            />
          )}
          {activeTab === 'students' && <StudentManagement searchFilter={searchQuery} />}
          {activeTab === 'attendance' && <AttendanceManagement />}
          {activeTab === 'grading' && <GradingModule />}
          {activeTab === 'billing' && <BillingManagement />}
          {activeTab === 'inventory' && <InventoryManagement />}
          {(activeTab === 'expenses' || activeTab === 'financials') && <ExpenseManagement />}
          {activeTab === 'branches' && <BranchManagement />}
          {activeTab === 'reports' && <ReportsModule />}
          {activeTab === 'settings' && <SettingsModule />}
          {activeTab === 'profile' && <MasterProfile />}
          {activeTab === 'admin' && currentUser?.role === 'SUPER_ADMIN' && <SuperAdminPortal />}
          {activeTab === 'logs' && currentUser?.role === 'SUPER_ADMIN' && <AuditLogsView />}
        </main>
      </div>

      {/* Auth Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onOpenRegister={() => setIsRegisterMasterModalOpen(true)}
      />

      <RegisterMasterModal
        isOpen={isRegisterMasterModalOpen}
        onClose={() => setIsRegisterMasterModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
